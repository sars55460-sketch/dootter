import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import type { WorkBook } from "xlsx";

import { planTable } from "./shared/table-plan";
import { ConversionError, type ConvertOptions, type ConvertResult } from "./types";

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "A8B0C0" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "A8B0C0" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "A8B0C0" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "A8B0C0" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "C9CFDC" },
  insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "C9CFDC" },
};

const PT_TO_TWIP = 20;

type Sheet = {
  name: string;
  rows: string[][];
  bold: boolean[][];
  aligns: ("left" | "center" | "right")[][];
};

const NUMERIC_RE = /^-?[\d\s.,]+%?$|^-?[$€£¥₽]\s?[\d\s.,]+$/;

function isNumericText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || !/\d/.test(trimmed)) return false;
  return NUMERIC_RE.test(trimmed);
}

async function readWorkbook(file: File): Promise<Sheet[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength === 0) throw new ConversionError("empty", "The file is empty.");

  let workbook: WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: "array",
      cellStyles: true,
      cellNF: true,
      cellDates: true,
    });
  } catch (error) {
    throw new ConversionError("failed", String((error as Error)?.message || "Could not read the spreadsheet."));
  }

  const sheets: Sheet[] = [];

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet || !sheet["!ref"]) continue;

    const range = XLSX.utils.decode_range(sheet["!ref"]);
    const rows: string[][] = [];
    const bold: boolean[][] = [];
    const aligns: ("left" | "center" | "right")[][] = [];

    for (let r = range.s.r; r <= range.e.r; r += 1) {
      const rowText: string[] = [];
      const rowBold: boolean[] = [];
      const rowAlign: ("left" | "center" | "right")[] = [];
      let anyValue = false;

      for (let c = range.s.c; c <= range.e.c; c += 1) {
        const address = XLSX.utils.encode_cell({ r, c });
        const cell = sheet[address] as
          | { v?: unknown; w?: string; t?: string; s?: { font?: { bold?: boolean }; alignment?: { horizontal?: string } } }
          | undefined;

        let text = "";
        if (cell) {
          if (typeof cell.w === "string" && cell.w !== "") text = cell.w;
          else if (cell.v instanceof Date) text = cell.v.toISOString().slice(0, 10);
          else if (cell.v !== undefined && cell.v !== null) text = String(cell.v);
          if (text.trim()) anyValue = true;
        }
        text = text.replace(/\u00a0/g, " ").trim();

        const isBold = !!cell?.s?.font?.bold;
        const excelAlign = cell?.s?.alignment?.horizontal;
        const align: "left" | "center" | "right" =
          excelAlign === "center" || excelAlign === "right"
            ? excelAlign
            : isNumericText(text)
              ? "right"
              : "left";

        rowText.push(text);
        rowBold.push(isBold);
        rowAlign.push(align);
      }

      rows.push(rowText);
      bold.push(rowBold);
      aligns.push(rowAlign);
      if (!anyValue) {
        rows[rows.length - 1] = [];
        bold[bold.length - 1] = [];
        aligns[aligns.length - 1] = [];
      }
    }

    while (rows.length && rows[rows.length - 1].length === 0) {
      rows.pop();
      bold.pop();
      aligns.pop();
    }
    while (rows.length && rows[0].every((cell) => !cell)) rows.shift();
    if (!rows.length) continue;

    sheets.push({ name, rows, bold, aligns });
  }

  if (!sheets.length) {
    throw new ConversionError("empty", "This workbook has no sheets with data.");
  }
  return sheets;
}

function noticeRuns(text: string) {
  return [
    new Paragraph({
      spacing: { before: 60, after: 160 },
      border: {
        left: { style: BorderStyle.SINGLE, size: 12, color: "D97706", space: 8 },
      },
      shading: { fill: "FFF7ED" },
      children: [
        new TextRun({ text, color: "9A5B00", bold: true, size: 18 }),
      ],
    }),
  ];
}

export async function xlsxToDocx(file: File, options: ConvertOptions = {}): Promise<ConvertResult> {
  const sheets = await readWorkbook(file);
  const warnings: ConvertResult["warnings"] = [];
  const noticeTexts: string[] = [];

  const sections = sheets.map((sheet) => {
    const plan = planTable({
      rows: sheet.rows,
      baseFontPt: 9.5,
      minColPt: 30,
      maxColPt: 260,
      landscapeAllowed: options.orientation !== "portrait",
      cellPadPt: 6,
      lineHeightRatio: 1.28,
      forcedLandscape: options.orientation === "landscape",
    });

    const paragraphs: Array<Paragraph | Table> = [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: sheet.name, bold: true })],
      }),
    ];

    if (plan.tooWide) {
      const text =
        options.notices?.tooWide(plan.cols) ??
        `Table is too large to fit on the page: it has ${plan.cols} columns, which do not fit side by side. The table was compressed to the printable width, so some columns may be clipped.`;
      paragraphs.push(...noticeRuns(text));
      noticeTexts.push(text);
      warnings.push({ code: "table-too-large", message: text });
    } else if (plan.willSplit) {
      const text =
        options.notices?.willSplit(plan.estimatedPages) ??
        `This table is larger than one page: it is split across about ${plan.estimatedPages} pages, and the header row repeats on each of them.`;
      paragraphs.push(...noticeRuns(text));
      noticeTexts.push(text);
      warnings.push({ code: "table-too-large", message: text });
    }

    if (plan.scale < 0.97) {
      warnings.push({
        code: "layout-scaled",
        message: `Column widths were reduced to fit the printable area.`,
      });
    }

    const headerRow = sheet.rows[0];
    const firstRowLooksHeader =
      sheet.bold[0]?.some(Boolean) && headerRow.some((cell) => cell.trim().length > 0);

    const tableRows = sheet.rows.map((row, rowIndex) => {
      const isHeader = firstRowLooksHeader && rowIndex === 0;
      const repeatHeader = isHeader && plan.cols > 1;
      return new TableRow({
        tableHeader: repeatHeader,
        children: row.map((cell, colIndex) => {
          const align = sheet.aligns[rowIndex]?.[colIndex] ?? "left";
          const bold = isHeader || sheet.bold[rowIndex]?.[colIndex] || false;
          return new TableCell({
            borders: BORDER,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            shading: isHeader ? { fill: "EEF1F8" } : undefined,
            width: {
              size: Math.max(240, Math.round(plan.colWidthsPt[colIndex] * PT_TO_TWIP)),
              type: WidthType.DXA,
            },
            children: [
              new Paragraph({
                alignment:
                  align === "right"
                    ? AlignmentType.RIGHT
                    : align === "center"
                      ? AlignmentType.CENTER
                      : AlignmentType.LEFT,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: cell,
                    bold,
                    size: Math.round(plan.fontPt * 2),
                  }),
                ],
              }),
            ],
          });
        }),
      });
    });

    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BORDER,
        rows: tableRows,
      }),
    );

    return {
      landscape: plan.landscape,
      children: paragraphs,
    };
  });

  const anyLandscape = sections.some((section) => section.landscape);
  void anyLandscape;

  const document = new Document({
    creator: "Dootter",
    title: file.name.replace(/\.(xlsx|xls|csv)$/i, ""),
    styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
    sections: sections.map((section) => ({
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
          size: {
            orientation: section.landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
          },
        },
      },
      children: section.children,
    })),
  });

  const blob = await Packer.toBlob(document);

  return {
          kind: "file",
          blob,
    filename: `${file.name.replace(/\.(xlsx|xls|csv)$/i, "") || "workbook"}.docx`,
    warnings,
  };
}
