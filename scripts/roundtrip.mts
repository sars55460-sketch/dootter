import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { parseHTML } from "linkedom";

import { docxToPdf } from "../src/lib/converters/docx-to-pdf";
import { docxToXlsx } from "../src/lib/converters/docx-to-xlsx";
import { pdfToDocx } from "../src/lib/converters/pdf-to-docx";
import { xlsxToDocx } from "../src/lib/converters/xlsx-to-docx";
import { mammothInput, type ConvertResult } from "../src/lib/converters/types";
import { getDictionary } from "../src/lib/i18n";

const IN = join(process.cwd(), "tmp-samples");
const OUT = join(process.cwd(), "tmp-out");
mkdirSync(OUT, { recursive: true });

const { window } = parseHTML("<!doctype html><html><body></body></html>");
const g = globalThis as Record<string, unknown>;
g.DOMParser = window.DOMParser;
g.Node = window.Node;
g.Element = window.Element;
g.HTMLElement = window.HTMLElement;
g.NodeFilter = window.NodeFilter;
g.getComputedStyle = window.getComputedStyle;
g.document = window.document;

const nativeFetch = globalThis.fetch;
g.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  if (url.startsWith("/")) {
    const path = join(process.cwd(), "public", url.replace(/^\//, ""));
    return new Response(readFileSync(path), { status: 200 });
  }
  return nativeFetch(input as string, init);
}) as typeof fetch;

function sampleFile(name: string, type: string) {
  const buffer = readFileSync(join(IN, name));
  return new File([buffer], name, { type });
}

function report(label: string, result: ConvertResult) {
  console.log(`\n== ${label}`);
  console.log(
    `   file: ${result.filename}  size: ${result.blob.size} B  type: ${result.blob.type}` +
      (result.print ? "  (+ print action)" : ""),
  );
  for (const warning of result.warnings) console.log(`   warning[${warning.code}]: ${warning.message}`);
  return result;
}

async function save(label: string, result: { blob: Blob; filename: string }) {
  const buffer = Buffer.from(await result.blob.arrayBuffer());
  writeFileSync(join(OUT, `${label}-${result.filename}`), buffer);
  return buffer;
}

let failures = 0;
function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`   ok  ${label}`);
  } else {
    failures += 1;
    console.log(`   FAIL ${label} ${detail}`);
  }
}

async function testPdfToDocx() {
  const result = report("PDF -> Word", await pdfToDocx(sampleFile("sample.pdf", "application/pdf")));
  const buffer = await save("pdf-to-word", result);
  check("output is a zip (docx)", buffer.subarray(0, 2).toString() === "PK");
  const { raw, text } = await extractDocxXml(buffer);
  check("keeps title", text.includes("Sales Report 2026"));
  check("keeps cyrillic body", text.includes("Он содержит кириллицу"));
  check("keeps table header", text.includes("Категория") && text.includes("Цена"));
  check("keeps page 2 text", text.includes("Вторая страница"));
  check("rebuilds a real Word table", raw.includes("<w:tbl>"), `tables in xml: ${(raw.match(/<w:tbl>/g) || []).length}`);
  check("repeats header row on split tables", raw.includes("<w:tblHeader"), "no tblHeader found");
  check("no scanned warning", !result.warnings.some((w) => w.code === "scanned-pdf"));

  // A page break per source page is what pushed content onto blank pages in
  // Word: the section already breaks between pages on its own.
  check("does not force one Word page per PDF page", !/<w:br w:type="page"/.test(raw));

  // Defaulting to Letter reflowed A4 documents onto a narrower column.
  check("keeps the A4 page size", /<w:pgSz\b[^>]*w:w="11906"/.test(raw), raw.match(/<w:pgSz[^>]*>/)?.[0] ?? "");
  check("keeps the A4 page height", /<w:pgSz\b[^>]*w:h="16838"/.test(raw));

  // 2 cm on every side was too wide for A4 and cost lines per page.
  const pgMar = raw.match(/<w:pgMar[^>]*>/)?.[0] ?? "";
  const twips = (name: string) => Number(pgMar.match(new RegExp(`w:${name}="(\\d+)"`))?.[1] ?? 0);
  check(
    "keeps the measured margins instead of 2 cm",
    twips("left") > 0 && twips("left") <= 1134,
    `left=${twips("left")} top=${twips("top")}`,
  );
  check("top and bottom margins match", twips("top") === twips("bottom"), `top=${twips("top")} bottom=${twips("bottom")}`);

  // The title is set at 20pt in the PDF; without an explicit size Word falls
  // back to 11pt and every heading collapses to body text.
  check("keeps the title font size", /<w:sz w:val="40"\/>/.test(raw), "no 20pt (40 half-point) run found");
}

/**
 * sample.pdf is made of one-line paragraphs, so it cannot tell a converter that
 * rejoins wrapped lines from one that keeps the PDF's hard breaks. wrapped.pdf
 * exists for exactly that: its long paragraphs wrap over several lines.
 */
async function testPdfToDocxWrappedParagraphs() {
  const result = report(
    "PDF -> Word (wrapped paragraphs)",
    await pdfToDocx(sampleFile("wrapped.pdf", "application/pdf")),
  );
  const buffer = await save("pdf-to-word-wrapped", result);
  const { raw, text } = await extractDocxXml(buffer);

  check("keeps both long paragraphs", text.includes("JUSTIFIEDBLOCK") && text.includes("RAGGEDBLOCK"));

  // Each wrapped paragraph must become one paragraph. Counting the block's
  // paragraphs: headings, list items and table cells are excluded because they
  // are legitimately short.
  const bodyXml = raw.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, "");
  const bodyParas = [...bodyXml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)]
    .map((m) => m[0])
    .filter((p) => !/<w:numPr>/.test(p) && !/<w:pStyle w:val="(?:Heading|Title)/.test(p));
  const longBodyParas = bodyParas.filter(
    (p) => [...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join("").trim().length > 70,
  );
  check(
    "rejoins wrapped lines into single paragraphs",
    longBodyParas.length === 2,
    `expected 2 long body paragraphs, got ${longBodyParas.length} of ${bodyParas.length}`,
  );

  check("detects the justified paragraph", raw.includes('w:val="both"'));
  check("keeps list items as a real Word list", (raw.match(/<w:numPr>/g) || []).length >= 5);
  check("does not duplicate the bullet character", !text.includes("••") && !/•\s*•/.test(text));
  check("keeps the numbered marker out of the text", !/^\s*\d\.\s+First numbered/m.test(text));
}

/**
 * Word to PDF renders through docx-preview and the browser's print engine, so it
 * needs a real DOM. Only the guard rails can run here; the fidelity assertions
 * live in the Puppeteer suite, which prints a real PDF and inspects it.
 */
async function testDocxToPdfGuards() {
  console.log("\n== Word -> PDF (guards; rendering is covered by the browser suite)");
  await expectError(
    "an empty Word file is refused before any rendering",
    () => docxToPdf(sampleFile("empty.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
    "empty",
  );
  await expectError(
    "the legacy .doc format is refused with advice",
    () =>
      docxToPdf(
        new File([Buffer.from("not a docx")], "legacy.doc", {
          type: "application/msword",
        }),
      ),
    "unsupported",
  );
}

async function testXlsxToDocx() {
  const notices = {
    tooWide: (columns: number) => `Таблица не помещается в портрет (${columns} колонок).`,
    willSplit: (pages: number) => `Таблица разбита на ${pages} части.`,
  };
  const result = report(
    "Excel -> Word (auto)",
    await xlsxToDocx(
      sampleFile("sample.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      { orientation: "auto", notices },
    ),
  );
  const { raw, text } = await extractDocxXml(await save("excel-to-word", result));
  check("rebuilds a real Word table", raw.includes("<w:tbl>"));
  check("keeps wide sheet header", text.includes("Колонка 1") && text.includes("Колонка 18"));
  check("keeps long sheet data", text.includes("Значение 44-17"));
  check("repeats header row on split tables", raw.includes("<w:tblHeader"), "no tblHeader found");
  check("switches a wide sheet to landscape", raw.includes('w:orient="landscape"'));
  check("reports the split", result.warnings.some((w) => w.code === "table-too-large"));
  check("inserts localised split notice", text.includes("разбита на"));
  check("inserts sheet names as headings", text.includes("Wide") && text.includes("Prices"));

  const portrait = report(
    "Excel -> Word (forced portrait)",
    await xlsxToDocx(
      sampleFile("sample.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      { orientation: "portrait", notices },
    ),
  );
  const portraitDoc = await extractDocxXml(await save("excel-to-word-portrait", portrait));
  check("stays portrait when forced", !portraitDoc.raw.includes('w:orient="landscape"'));
  check(
    "inserts localised too-wide notice",
    portraitDoc.text.includes(notices.tooWide(30)),
    portraitDoc.text.slice(0, 200),
  );
}

async function testDocxToXlsx() {
  const result = report("Word -> Excel", await docxToXlsx(sampleFile("sample.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")));
  const buffer = await save("word-to-excel", result);
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  const allRows = wb.SheetNames.flatMap((name) =>
    XLSX.utils.sheet_to_json<string[]>(wb.Sheets[name], { header: 1 }),
  );
  check("has sheet", Boolean(sheet), wb.SheetNames.join(","));
  check(
    "names the first sheet after the document title",
    wb.SheetNames[0] === "Quarterly Report 2026",
    wb.SheetNames.join(","),
  );
  check(
    "keeps non-table text on a separate sheet",
    wb.SheetNames.includes("Notes") &&
      XLSX.utils
        .sheet_to_json<string[]>(wb.Sheets.Notes, { header: 1 })
        .some((r) => r.join(" ").includes("Conclusion")),
    wb.SheetNames.join(","),
  );
  check("keeps table header", rows[0]?.join(" ").includes("Товар"), JSON.stringify(rows[0]));
  check("keeps table row", rows.some((r) => r.join(" ").includes("Ноутбук ASUS")));
  check(
    "types numbers",
    rows.some((r) => typeof r[2] === "number"),
    JSON.stringify(rows.find((r) => r.join(" ").includes("Ноутбук ASUS"))),
  );
}

/**
 * Regression guard for the bug that only showed up in the browser:
 * mammoth ships a browser build that reads `options.arrayBuffer` and a Node
 * build that reads `options.buffer`, so our input object must satisfy both.
 */
async function testMammothInputShape() {
  const require = createRequire(import.meta.url);
  const browserUnzip = require("mammoth/browser/unzip.js") as {
    openZip: (options: unknown) => Promise<unknown>;
  };
  const nodeUnzip = require("mammoth/lib/unzip.js") as {
    openZip: (options: unknown) => Promise<unknown>;
  };
  const arrayBuffer = readFileSync(join(IN, "sample.docx")).buffer as ArrayBuffer;
  const input = mammothInput(arrayBuffer);

  check("input exposes arrayBuffer for the browser build", "arrayBuffer" in input);
  check("input exposes buffer for the Node build", "buffer" in input);

  let browserOk = false;
  let browserError = "";
  try {
    browserOk = Boolean(await browserUnzip.openZip(input));
  } catch (error) {
    browserError = (error as Error).message;
  }
  check("browser build opens the docx", browserOk, browserError);

  let nodeOk = false;
  let nodeError = "";
  try {
    nodeOk = Boolean(await nodeUnzip.openZip(input));
  } catch (error) {
    nodeError = (error as Error).message;
  }
  check("Node build opens the docx", nodeOk, nodeError);
}

async function testErrorCases() {
  await expectError(
    "empty Word file is reported as empty",
    () => docxToPdf(sampleFile("empty.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
    "empty",
  );
  await expectError(
    "empty Excel file is reported as empty",
    () => xlsxToDocx(sampleFile("empty.docx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
    "empty",
  );
  await expectError(
    "a Word file sent to the PDF converter is rejected",
    () => pdfToDocx(sampleFile("sample.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
    undefined,
  );
  await expectError(
    "an Excel file sent to the Word to PDF converter is rejected",
    () => docxToPdf(sampleFile("sample.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
    undefined,
  );

  const scanned = report(
    "image-only PDF -> Word",
    await pdfToDocx(sampleFile("scanned.pdf", "application/pdf")).catch((error) => ({
      blob: new Blob([]),
      filename: "-",
      warnings: [],
      error: error as Error & { code?: string },
    })),
  );
  const scannedError = (scanned as { error?: Error & { code?: string } }).error;
  if (scannedError) {
    check(
      "image-only PDF is reported honestly",
      ["no-text", "scanned", "failed"].includes(String(scannedError.code)),
      String(scannedError.code),
    );
  } else {
    check(
      "image-only PDF warns instead of returning an empty file",
      scanned.warnings.some((w) => w.code === "no-text" || w.code === "scanned-pdf"),
      JSON.stringify(scanned.warnings),
    );
  }
}

async function expectError(
  label: string,
  action: () => Promise<unknown>,
  expectedCode?: string,
) {
  try {
    await action();
    check(label, false, "no error was thrown");
  } catch (error) {
    const err = error as Error & { code?: string };
    const code = String(err.code ?? "");
    check(label, expectedCode ? code === expectedCode : true, `${code}: ${err.message}`);
  }
}

async function extractDocxXml(buffer: Buffer) {
  const { unzipSync, strFromU8 } = await import("fflate");
  const files = unzipSync(new Uint8Array(buffer));
  const entry = files["word/document.xml"];
  if (!entry) return { raw: "", text: "" };
  const raw = strFromU8(entry);
  const text = raw
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ");
  return { raw, text };
}

async function extractPdfText(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  const task = pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: false, isEvalSupported: false });
  const doc = await task.promise;
  let text = "";
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    text += `${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}\n`;
  }
  await doc.destroy();
  return text;
}

const notices = {
  tooWide: (columns: number) =>
    getDictionary("ru").ui.tableTooLargeNotice.replace("{n}", String(columns)),
  willSplit: (pages: number) => getDictionary("ru").ui.tableWillSplit.replace("{n}", String(pages)),
};

async function main() {
  await testMammothInputShape();
  await testPdfToDocx();
  await testPdfToDocxWrappedParagraphs();
  await testDocxToPdfGuards();
  await testXlsxToDocx();
  await testDocxToXlsx();
  await testErrorCases();
  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

await main();
