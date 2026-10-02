import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";
import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";

const OUT = join(process.cwd(), "tmp-samples");
mkdirSync(OUT, { recursive: true });

const HEADERS = ["Товар", "Категория", "Количество", "Цена", "Поставщик"];
const ROWS = [
  ["Ноутбук ASUS", "Электроника", 12, 89990, "ООО Техно"],
  ["Смартфон Samsung", "Электроника", 30, 64990, "ООО Диджитал"],
  ["Принтер HP", "Оргтехника", 7, 21990, "АО Принт"],
  ["Монитор Dell", "Электроника", 15, 32990, "ООО Техно"],
  ["Клавиатура Logitech", "Комплектующие", 40, 7490, "ООО Диджитал"],
  ["Мышь Razer", "Комплектующие", 55, 5990, "АО ГеймЗон"],
  ["SSD Samsung 1TB", "Комплектующие", 25, 8990, "ООО Техно"],
  ["Веб-камера Logitech", "Периферия", 18, 6490, "АО Принт"],
];

async function makeDocx() {
  const cell = (text, bold = false) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
    });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
    sections: [
      {
        children: [
          new Paragraph({ text: "Quarterly Report 2026", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            children: [
              new TextRun("This document was generated automatically for testing purposes. "),
              new TextRun({ text: "Он содержит кириллицу, латиницу и цифры 12345.", bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Centred in Georgia at 14pt", font: "Georgia", size: 28 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Right aligned monospace sample", font: "Courier New", size: 22 }),
            ],
          }),
          new Paragraph({ text: "Второй абзац с обычным текстом, чтобы проверить перенос строк и интервалы." }),
          new Paragraph({ text: "List item one", bullet: { level: 0 } }),
          new Paragraph({ text: "List item two", bullet: { level: 0 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: HEADERS.map((h) => cell(h, true)) }),
              ...ROWS.map((row) => new TableRow({ children: row.map((value) => cell(String(value))) })),
            ],
          }),
          new Paragraph({ text: "Conclusion: everything looks fine." }),
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ text: "Second page after an explicit page break." }),
        ],
      },
    ],
  });

  writeFileSync(join(OUT, "sample.docx"), await Packer.toBuffer(doc));
}

function makeXlsx() {
  const wb = XLSX.utils.book_new();

  const wide = [Array.from({ length: 18 }, (_, i) => `Колонка ${i + 1}`)];
  for (let r = 0; r < 45; r += 1) {
    wide.push(Array.from({ length: 18 }, (_, i) => (i % 3 === 0 ? r * 100 + i : `Значение ${r}-${i}`)));
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wide), "Wide");

  const prices = [
    ["SKU", "Name", "Price", "In stock", "Updated"],
    ["A-100", "Keyboard", 7490, true, "2026-01-15"],
    ["A-200", "Mouse", 5990, false, "2026-02-02"],
    ["A-300", "Monitor", 32990, true, "2026-02-20"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prices), "Prices");

  const medium = [Array.from({ length: 10 }, (_, i) => `Показатель ${i + 1}`)];
  for (let r = 0; r < 12; r += 1) {
    medium.push(Array.from({ length: 10 }, (_, i) => `Период ${r + 1}-${i + 1}`));
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(medium), "Medium");

  const ultra = [Array.from({ length: 30 }, (_, i) => `C${i + 1}`)];
  for (let r = 0; r < 5; r += 1) {
    ultra.push(Array.from({ length: 30 }, (_, i) => `v${r}-${i}`));
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ultra), "Ultra");

  writeFileSync(join(OUT, "sample.xlsx"), XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

function makePdf() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const font = readFileSync(join(process.cwd(), "public/fonts/Roboto-Regular.ttf")).toString("base64");
  const bold = readFileSync(join(process.cwd(), "public/fonts/Roboto-Bold.ttf")).toString("base64");
  doc.addFileToVFS("Roboto-Regular.ttf", font);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", bold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "bold");
  doc.setFontSize(20);
  doc.text("Sales Report 2026", 40, 60);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  const body = [
    "This PDF was generated for automated testing of the PDF to Word converter.",
    "Он содержит кириллицу, латиницу, цифры и знаки препинания.",
    "Вторая строка проверяет перенос длинного текста и работу с интервалами.",
    "Третья строка нужна для проверки объединения строк в абзацы.",
  ];
  let y = 95;
  for (const line of body) {
    doc.text(line, 40, y, { maxWidth: 515 });
    y += 20;
  }

  y += 14;
  const colWidth = 103;
  const rowH = 22;
  const cols = ["Товар", "Категория", "Кол-во", "Цена"];
  const tableRows = [
    cols,
    ["Ноутбук ASUS", "Электроника", "12", "89990"],
    ["Смартфон Samsung", "Электроника", "30", "64990"],
    ["Принтер HP", "Оргтехника", "7", "21990"],
    ["Монитор Dell", "Электроника", "15", "32990"],
  ];
  tableRows.forEach((cells, rowIndex) => {
    const yy = y + rowIndex * rowH;
    doc.setDrawColor(180);
    doc.rect(40, yy, colWidth * cols.length, rowH);
    cells.forEach((value, colIndex) => {
      doc.rect(40 + colIndex * colWidth, yy, colWidth, rowH);
      doc.setFont("Roboto", rowIndex === 0 ? "bold" : "normal");
      doc.text(value, 45 + colIndex * colWidth, yy + 15, { maxWidth: colWidth - 10 });
    });
  });

  doc.addPage();
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  doc.text("Вторая страница: текст после таблицы продолжает нумерацию абзацев.", 40, 60);

  writeFileSync(join(OUT, "sample.pdf"), Buffer.from(doc.output("arraybuffer")));
  makeWrappedPdf();
  makeScannedPdf();
}

/**
 * A PDF built from paragraphs that really wrap.
 *
 * sample.pdf is a list of one-line paragraphs, so it cannot tell a converter
 * that merges lines into paragraphs from one that leaves the PDF's hard line
 * breaks in place - the two produce the same text. This file wraps a long
 * paragraph over several lines instead, which is the only way to check that the
 * output re-wraps the way Word would.
 */
function makeWrappedPdf() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const font = readFileSync(join(process.cwd(), "public/fonts/Roboto-Regular.ttf")).toString("base64");
  const bold = readFileSync(join(process.cwd(), "public/fonts/Roboto-Bold.ttf")).toString("base64");
  const italic = readFileSync(join(process.cwd(), "public/fonts/Roboto-Italic.ttf")).toString("base64");
  doc.addFileToVFS("Roboto-Regular.ttf", font);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", bold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.addFileToVFS("Roboto-Italic.ttf", italic);
  doc.addFont("Roboto-Italic.ttf", "Roboto", "italic");

  const margin = 40;
  const column = 515;
  const justifyMarker = "JUSTIFIEDBLOCK";
  const raggedMarker = "RAGGEDBLOCK";

  doc.setFont("Roboto", "bold");
  doc.setFontSize(16);
  doc.text("Layout Fixture", margin, 60);

  doc.setFont("Roboto", "italic");
  doc.setFontSize(10);
  doc.text("Italic caption line under the title.", margin, 82);

  // One long justified paragraph. Every wrapped line but the last is flush with
  // the right edge, which is what tells a converter the lines belong together.
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  const justified = [
    justifyMarker,
    "This paragraph is long enough to wrap over several lines so that the converter has to",
    "rejoin the pieces into a single paragraph instead of carrying the source line breaks",
    "across into Word, where every line would become its own paragraph and the text would",
    "never reflow the way it does in a real document.",
  ].join(" ");
  doc.text(justified, margin, 110, { maxWidth: column, align: "justify" });

  // The same shape, left aligned: the lines end at ragged positions but are still
  // one paragraph.
  const ragged = [
    raggedMarker,
    "This second paragraph is also long enough to wrap, but it is aligned to the left so",
    "that its lines end at uneven positions and only the first line sits at the column",
    "edge. The lines still belong to one paragraph.",
  ].join(" ");
  doc.text(ragged, margin, 205, { maxWidth: column, align: "left" });

  doc.setFont("Roboto", "bold");
  doc.setFontSize(13);
  doc.text("List section", margin, 290);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  let y = 312;
  for (const item of [
    "First bullet item that is long enough to wrap onto a second line in the source",
    "Second bullet item which is shorter",
    "Third bullet item, also reasonably short",
  ]) {
    doc.text(`• ${item}`, margin + 10, y, { maxWidth: column - 10 });
    y += 20;
  }

  y += 20;
  doc.text("1. First numbered item that is long enough to wrap onto another line", margin + 10, y, {
    maxWidth: column - 10,
  });
  y += 20;
  doc.text("2. Second numbered item which fits on one line", margin + 10, y, {
    maxWidth: column - 10,
  });

  writeFileSync(join(OUT, "wrapped.pdf"), Buffer.from(doc.output("arraybuffer")));
}

/** A PDF that only contains an image: no text layer at all, like a scan. */
function makeScannedPdf() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFillColor(230, 230, 230);
  doc.rect(40, 40, 515, 700, "F");
  doc.setFillColor(120, 120, 120);
  for (let line = 0; line < 26; line += 1) {
    doc.rect(60, 70 + line * 24, 400 + ((line * 37) % 90), 8, "F");
  }
  doc.addImage(
    `data:image/png;base64,${Buffer.from(
      `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
      "base64",
    ).toString("base64")}`,
    "PNG",
    60,
    70,
    470,
    640,
  );
  writeFileSync(join(OUT, "scanned.pdf"), Buffer.from(doc.output("arraybuffer")));
  writeFileSync(join(OUT, "empty.docx"), Buffer.alloc(0));
}

await makeDocx();
makeXlsx();
makePdf();
console.log("samples written to", OUT);
