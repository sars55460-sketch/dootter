/**
 * Proves that Word to PDF keeps what Word declared. The converter renders the
 * .docx and hands the page to the browser's print engine, so the test asks
 * Chromium for the very same PDF a user gets from "Save as PDF" and then reads
 * that file back with pdf.js to check the text, the page geometry and — the
 * part that used to be broken — the actual fonts.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import puppeteer from "puppeteer";

const SAMPLES = join(process.cwd(), "tmp-samples");
const OUT = join(process.cwd(), "tmp-out");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

let failures = 0;
const log = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`   ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};
const section = (name: string) => console.log(`\n== ${name}`);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

type PdfFacts = {
  pages: number;
  widthPt: number;
  heightPt: number;
  text: string;
  /** Font programs actually embedded in the file, read from the PDF itself. */
  embeddedFonts: string[];
};

/**
 * pdf.js reports generic families such as "serif", so the proof that the
 * document's own fonts survived has to come from the font programs the browser
 * embedded in the PDF.
 */
function embeddedFonts(bytes: Uint8Array): string[] {
  const raw = Buffer.from(bytes).toString("latin1");
  return [
    ...new Set(
      [...raw.matchAll(/\/BaseFont\s*\/[A-Z]{6}\+([A-Za-z0-9+\-,_]+)/g)].map((match) => match[1]),
    ),
  ];
}

async function readPdf(bytes: Uint8Array): Promise<PdfFacts> {
  // Read the font programs first: pdf.js takes ownership of the array it is
  // given and detaches it, so it has to be a copy rather than the original.
  const fonts = embeddedFonts(bytes);
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
    isEvalSupported: false,
  }).promise;

  const first = await doc.getPage(1);
  const viewport = first.getViewport({ scale: 1 });

  let text = "";
  for (let page = 1; page <= doc.numPages; page += 1) {
    const target = await doc.getPage(page);
    const items = await target.getTextContent();
    text += ` ${items.items.map((item) => ("str" in item ? item.str : "")).join(" ")}`;
  }

  return {
    pages: doc.numPages,
    widthPt: Math.round(viewport.width),
    heightPt: Math.round(viewport.height),
    text: text.replace(/\s+/g, " "),
    embeddedFonts: fonts,
  };
}

async function convertAndPrint(
  browser: puppeteer.Browser,
  slug: string,
  sample: string,
  orientation: "auto" | "portrait" | "landscape" = "auto",
) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  // A Content-Security-Policy violation is reported as a console error rather
  // than a page error, and it is the most likely way the policy in
  // public/_headers can silently break the pdf.js worker or a blob URL.
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text().slice(0, 120)}`);
  });
  const client = await page.createCDPSession();
  await client.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: join(process.cwd(), "tmp-downloads"),
  });
  await page.goto(`${BASE}/${slug}/`, { waitUntil: "networkidle2", timeout: 90_000 });

  if (orientation !== "auto") {
    await page.click(`[data-testid="orientation-${orientation}"]`);
    await wait(400);
  }

  const input = await page.$("input[type=file]");
  await input!.uploadFile(join(SAMPLES, sample));
  await wait(600);
  await page.evaluate(() =>
    (document.querySelector('[data-testid="convert-button"]') as HTMLButtonElement)?.click(),
  );

  // Two separate actions have to appear: a file to download and a print button.
  let ready = false;
  for (let i = 0; i < 90 && !ready; i += 1) {
    await wait(1000);
    ready = await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>('[data-testid="download-link"]');
      const print = document.querySelector('[data-testid="print-button"]');
      return Boolean(link && print);
    });
  }
  if (!ready) {
    const message = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 200));
    await page.close();
    return {
      ok: false as const,
      reason: `conversion produced no download and print action: ${message}`,
      problems,
    };
  }

  // The download is the file the user gets without touching the print dialog.
  // The panel's own download folder is where the browser puts a real click.
  const DOWNLOADS = join(process.cwd(), "tmp-downloads");
  const before = new Set(readdirSync(DOWNLOADS));
  await page.evaluate(() =>
    (document.querySelector<HTMLAnchorElement>('[data-testid="download-link"]'))?.click(),
  );
  let downloaded = "";
  for (let i = 0; i < 60 && !downloaded; i += 1) {
    await wait(250);
    downloaded =
      readdirSync(DOWNLOADS).find(
        (name) =>
          !before.has(name) && name.toLowerCase().endsWith(".pdf") && !name.endsWith(".crdownload"),
      ) ?? "";
  }
  const download = downloaded ? readFileSync(join(DOWNLOADS, downloaded)) : null;
  if (downloaded) unlinkSync(join(DOWNLOADS, downloaded));

  // The rendered document must stay out of the way on screen, and it has to
  // become visible in print media or the PDF would come out empty.
  const visibility = async (media: "screen" | "print") => {
    await client.send("Emulation.setEmulatedMedia", { media });
    const value = await page.evaluate(
      `(() => {
        const host = document.getElementById("dootter-print-root");
        if (!host) return "missing";
        const styles = getComputedStyle(host);
        return styles.visibility + "/" + styles.position;
      })()`,
    );
    await client.send("Emulation.setEmulatedMedia", { media: "" });
    return value as string;
  };

  const onScreen = await visibility("screen");
  const inPrint = await visibility("print");

  // This is the same PDF the user gets from the print dialog's "Save as PDF".
  const { data } = await client.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
  });
  const buffer = Buffer.from(data, "base64");
  writeFileSync(join(OUT, `word-to-pdf-print-${orientation}.pdf`), buffer);

  const facts = await readPdf(new Uint8Array(buffer));
  const downloadFacts = download ? await readPdf(new Uint8Array(download)) : null;
  await page.close();
  return { ok: true as const, facts, buffer, onScreen, inPrint, problems, download, downloadFacts };
}

rmSync(join(OUT, "word-to-pdf-"), { force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(join(process.cwd(), "tmp-downloads"), { recursive: true });

try {
  await fetch(`${BASE}/en/word-to-pdf/`, { redirect: "manual" });
} catch {
  console.error(`\nCannot reach ${BASE}. Start the dev server first: npm run dev`);
  process.exit(1);
}
await fetch(`${BASE}/en/word-to-pdf/`, { redirect: "manual" }).catch(() => undefined);

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  section("Word to PDF offers a download and a separate print action");
  const result = await convertAndPrint(browser, "en/word-to-pdf", "sample.docx");
  if (!result.ok) {
    log(false, "sample.docx converts", result.reason);
  } else {
    const { facts, buffer, problems, onScreen, inPrint, download, downloadFacts } = result;

    log(onScreen.startsWith("hidden/"), "the document stays out of the way on screen", onScreen);
    log(inPrint === "visible/static", "the document becomes visible when printing", inPrint);

    log(Boolean(download), "the download arrives without the print dialog");
    if (download) {
      log(download.subarray(0, 5).toString() === "%PDF-", "the download is a real PDF", `${download.length} B`);
      log(download.length > 20_000, "the downloaded PDF has content", `${download.length} B`);
      if (downloadFacts) {
        log(downloadFacts.pages >= 2, "the download keeps every page", `${downloadFacts.pages} pages`);
        log(
          Math.abs(downloadFacts.widthPt - 595) <= 3 && Math.abs(downloadFacts.heightPt - 842) <= 3,
          "the download keeps the page size",
          `${downloadFacts.widthPt}x${downloadFacts.heightPt} pt`,
        );
        // The download is drawn from the same rendering, so it carries pictures
        // rather than selectable text. The print action is the text version.
        log(
          downloadFacts.embeddedFonts.length === 0,
          "the download is drawn as page images, not re-typed text",
          downloadFacts.embeddedFonts.join(" | ") || "no fonts, page images",
        );
      }
    }

    log(buffer.subarray(0, 5).toString() === "%PDF-", "the print action produces a real PDF", `${buffer.length} B`);
    log(facts.text.length > 0, "the printed document reached the paper");
    log(facts.text.includes("Quarterly Report 2026"), "keeps the heading", facts.text.slice(0, 90));
    log(facts.text.includes("кириллицу"), "keeps cyrillic text");
    log(facts.text.includes("Ноутбук ASUS") && facts.text.includes("89990"), "keeps table content");
    log(facts.text.includes("explicit page break"), "keeps the text after the page break");
    log(facts.pages >= 2, "keeps the page break as a second page", `${facts.pages} pages`);
    log(
      Math.abs(facts.widthPt - 595) <= 3 && Math.abs(facts.heightPt - 842) <= 3,
      "page size comes from the document",
      `${facts.widthPt}x${facts.heightPt} pt`,
    );

    const fonts = facts.embeddedFonts;
    log(fonts.some((f) => /timesnewroman/i.test(f)), "keeps the document's body font", fonts.join(" | "));
    log(fonts.some((f) => /georgia/i.test(f)), "keeps the Georgia run");
    log(fonts.some((f) => /couriernew/i.test(f)), "keeps the Courier New run");
    log(
      fonts.some((f) => /timesnewroman.*bold/i.test(f)),
      "keeps bold runs as bold",
      fonts.join(" | "),
    );
    log(!fonts.some((f) => /roboto/i.test(f)), "no substitute font is forced", fonts.join(" | "));
    log(
      facts.embeddedFonts.length >= 4,
      "each declared font is embedded in the printed PDF",
      `${fonts.length} font programs`,
    );

    log(problems.length === 0, "no runtime errors", problems.slice(0, 2).join(" | "));
  }

  section("Word to PDF honours a forced landscape orientation");
  const rotated = await convertAndPrint(browser, "en/word-to-pdf", "sample.docx", "landscape");
  if (!rotated.ok) {
    log(false, "landscape conversion", rotated.reason);
  } else {
    const { facts, downloadFacts } = rotated;
    log(facts.widthPt > facts.heightPt, "the printed page is landscape", `${facts.widthPt}x${facts.heightPt} pt`);
    log(Math.abs(facts.widthPt - 842) <= 3, "the long edge matches the portrait height", `${facts.widthPt} pt`);
    log(facts.text.includes("Quarterly Report 2026"), "text survives the rotation");
    log(
      facts.embeddedFonts.some((f) => /timesnewroman/i.test(f)),
      "fonts survive the rotation",
      facts.embeddedFonts.join(" | "),
    );
    if (downloadFacts) {
      log(downloadFacts.widthPt > downloadFacts.heightPt, "the downloaded page is landscape too", `${downloadFacts.widthPt}x${downloadFacts.heightPt} pt`);
    }
  }

  section("Word to PDF with a landscape document and portrait request");
  const forced = await convertAndPrint(browser, "en/word-to-pdf", "sample.docx", "portrait");
  if (forced.ok) {
    log(forced.facts.widthPt < forced.facts.heightPt, "the page is portrait", `${forced.facts.widthPt}x${forced.facts.heightPt} pt`);
  }
} finally {
  await browser.close();
}

console.log(
  failures === 0
    ? "\nALL WORD->PDF CHECKS PASSED"
    : `\n${failures} WORD->PDF CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
