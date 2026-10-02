/**
 * Measures what the PDF -> Word converter produces, so layout changes can be
 * judged by numbers instead of by opening Word each time.
 *
 * The sample body is a list of one-line paragraphs, which looks the same whether
 * or not the converter rejoins wrapped lines. Use wrapped.pdf to check merging:
 *
 *   npx tsx scripts/measure-pdf-to-word.mts [sample.pdf]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { unzipSync } from "fflate";

const sample = process.argv[2] ?? "tmp-samples/sample.pdf";
const bytes = new Uint8Array(readFileSync(sample));
const file = new File([bytes], sample.split(/[\\/]/).pop() ?? "sample.pdf");

const { pdfToDocx } = await import("../src/lib/converters/pdf-to-docx");
const result = await pdfToDocx(file);

const out = join("tmp-samples", "measured.docx");
// A Blob can only be read once: pull the bytes out a single time and reuse them.
const zipped = new Uint8Array(await result.blob.arrayBuffer());
writeFileSync(out, Buffer.from(zipped));

const files = unzipSync(zipped);
const doc = new TextDecoder().decode(files["word/document.xml"]);

const count = (re: RegExp) => (doc.match(re) ?? []).length;
const paragraphs = count(/<w:p[ >]/g);
const pageBreaks = count(/w:type="page"/g);
const tables = count(/<w:tbl>/g);
const justified = count(/w:val="both"/g);
const italic = count(/<w:i\/>/g);
const runs = count(/<w:r[ >]/g);

// Font sizes are half-points: w:sz val="22" is 11pt.
const sizes = new Set<string>();
for (const m of doc.matchAll(/<w:sz w:val="(\d+)"\/>/g)) sizes.add(m[1]);
const sortedSizes = [...sizes].map(Number).sort((a, b) => a - b);

// A body paragraph left as a single short run is a hard line break carried over
// from the PDF instead of a real paragraph. High counts of these are exactly the
// "text does not reflow like Word" symptom.
//
// Headings, list items and table cells are legitimately short, so they are
// excluded - counting them made this read 70% on a document whose paragraphs
// were in fact rejoined correctly.
const bodyParas = [...doc.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, "").matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)]
  .map((m) => m[0])
  .filter(
    (p) =>
      !/<w:numPr>/.test(p) &&
      !/<w:pStyle w:val="Heading/.test(p) &&
      !/<w:pStyle w:val="Title"/.test(p),
  );
const paraTextOf = (xml: string) =>
  [...xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join("");
const shortBody = bodyParas.filter((p) => {
  const t = paraTextOf(p).trim();
  return t.length > 0 && !/w:type="page"/.test(p) && t.length < 70;
});
const oneLineFragments = shortBody.length;

// Attribute order is not guaranteed: docx puts w:orient between w:w and w:h.
const pgSz = doc.match(/<w:pgSz\b[^>]*>/)?.[0];
const pageSize = pgSz
  ? { w: pgSz.match(/\bw:w="(\d+)"/)?.[1], h: pgSz.match(/\bw:h="(\d+)"/)?.[1] }
  : undefined;
const margins = doc.match(/<w:pgMar[^>]*w:top="(\d+)"[^>]*w:right="(\d+)"[^>]*w:bottom="(\d+)"[^>]*w:left="(\d+)"[^>]*w:header="(\d+)"[^>]*w:footer="(\d+)"[^>]*w:gutter="(\d+)"\/>/);

const twipsToMm = (v: string) => Math.round((Number(v) * 25.4) / 1440);

console.log(`sample            ${sample}`);
console.log(`warnings          ${result.warnings.map((w) => w.code).join(", ") || "none"}`);
console.log(`paragraphs        ${paragraphs}`);
console.log(`runs              ${runs}`);
console.log(`tables            ${tables}`);
console.log(`page breaks       ${pageBreaks}   ${pageBreaks > 0 ? "<-- forced, pushes content to new pages" : ""}`);
console.log(`short body paras  ${oneLineFragments}   ${((oneLineFragments / Math.max(bodyParas.length, 1)) * 100).toFixed(0)}% of ${bodyParas.length} body paragraphs   <-- PDF lines left unmerged`);
console.log(`font sizes (pt)   ${sortedSizes.map((s) => (s / 2).toFixed(1)).join(", ") || "none set"}`);
console.log(`italic runs       ${italic}`);
console.log(`justified paras   ${justified}`);
console.log(`page size         ${pageSize?.w && pageSize.h ? `${twipsToMm(pageSize.w)} x ${twipsToMm(pageSize.h)} mm` : "default"}`);
if (margins) {
  console.log(`margins mm        top ${twipsToMm(margins[1])} right ${twipsToMm(margins[2])} bottom ${twipsToMm(margins[3])} left ${twipsToMm(margins[4])}`);
}
console.log(`written           ${out}`);