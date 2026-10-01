import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import { ConversionError, type ConvertResult } from "./types";

type PdfItem = {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bold: boolean;
  italic: boolean;
};

type Line = {
  y: number;
  height: number;
  cells: PdfItem[];
  text: string;
  bold: boolean;
  fontSize: number;
};

const BULLET_RE = /^([•·▪◦‣∙*+\-–—])\s+/;
const NUMBER_RE = /^(\d{1,3})([.)])\s+/;

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function groupIntoLines(items: PdfItem[]): Line[] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const raw: Array<{ y: number; height: number; cells: PdfItem[] }> = [];

  for (const item of sorted) {
    if (!item.str.trim()) continue;
    const tolerance = Math.max(2.2, item.h * 0.45);
    const current = raw[raw.length - 1];
    if (current && Math.abs(current.y - item.y) <= tolerance) {
      current.cells.push(item);
      current.y = Math.min(current.y, item.y);
      current.height = Math.max(current.height, item.h);
    } else {
      raw.push({ y: item.y, height: item.h, cells: [item] });
    }
  }

  return raw.map((line) => {
    const cells = line.cells.sort((a, b) => a.x - b.x);
    let text = "";
    for (const cell of cells) {
      if (text && !text.endsWith(" ") && !cell.str.startsWith(" ")) text += " ";
      text += cell.str;
    }
    return {
      y: line.y,
      height: line.height,
      cells,
      text: text.replace(/\s+/g, " ").trim(),
      bold: cells.some((c) => c.bold) && cells.every((c) => c.bold || c.str.trim() === ""),
      fontSize: Math.max(...cells.map((c) => c.h)),
    };
  }).filter((line) => line.text.length > 0);
}

type Cell = { x: number; text: string; bold: boolean };

/** Splits a line into cells wherever a wide horizontal gap appears. */
function splitLineIntoCells(line: Line, gapThreshold: number, minColumnStep: number): Cell[] {
  const cells: Cell[] = [];
  let buffer = "";
  let bufferX = line.cells[0]?.x ?? 0;
  let bufferBold = false;
  let previousRight: number | null = null;

  for (const item of line.cells) {
    const gap = previousRight === null ? 0 : item.x - previousRight;
    // A new cell needs both a real gap and a clear move to the right, so that
    // text which merely wrapped inside a cell stays in that cell.
    const startsColumn =
      previousRight !== null && gap > gapThreshold && item.x - bufferX > minColumnStep;
    if (startsColumn && buffer.trim()) {
      cells.push({ x: bufferX, text: buffer.trim(), bold: bufferBold });
      buffer = "";
      bufferX = item.x;
      bufferBold = false;
    }
    if (!buffer) bufferX = item.x;
    buffer += item.str;
    bufferBold = bufferBold || item.bold;
    previousRight = item.x + item.w;
  }
  if (buffer.trim()) cells.push({ x: bufferX, text: buffer.trim(), bold: bufferBold });
  return cells;
}

function clusterX(values: number[], tolerance: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const centers: number[] = [];
  for (const value of sorted) {
    const last = centers[centers.length - 1];
    if (last === undefined || value - last > tolerance) centers.push(value);
  }
  return centers;
}

export async function pdfToDocx(file: File): Promise<ConvertResult> {
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const buffer = await file.arrayBuffer();
  let doc: { numPages: number; getPage: (n: number) => Promise<unknown> };
  try {
    doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
    }).promise;
  } catch (error) {
    const message = String((error as Error)?.message || "");
    if (/password|encrypted/i.test(message)) {
      throw new ConversionError("password", message);
    }
    throw new ConversionError("failed", message || "Could not read the PDF");
  }

  const bodyChildren: Array<Paragraph | Table> = [];
  const warnings: ConvertResult["warnings"] = [];
  let totalTextLength = 0;
  let pagesWithText = 0;

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = (await doc.getPage(pageNumber)) as {
      getViewport: (p: { scale: number }) => { transform: number[] };
      getTextContent: () => Promise<{ items: unknown[] }>;
    };
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<Record<string, unknown>>;

    const pageItems: PdfItem[] = [];
    for (const raw of items) {
      if (typeof raw.str !== "string") continue;
      const transform = raw.transform as number[] | undefined;
      if (!transform) continue;
      const tx = pdfjs.Util.transform(viewport.transform, transform);
      const fontName = String(raw.fontName || "");
      const height = Math.abs(tx[3]) || Math.abs(raw.height as number) || 10;
      const width = (raw.width as number) || Math.abs(tx[0]) * 0.5;
      pageItems.push({
        str: raw.str,
        x: tx[4],
        y: tx[5],
        w: width,
        h: height,
        bold: /bold|semib|black|heavy/i.test(fontName),
        italic: /italic|oblique/i.test(fontName),
      });
    }

    const pageTextLength = pageItems.reduce((sum, i) => sum + i.str.trim().length, 0);
    totalTextLength += pageTextLength;
    if (pageTextLength > 0) pagesWithText += 1;

    const lines = groupIntoLines(pageItems);
    if (lines.length === 0) continue;

    const bodySize = median(lines.map((l) => l.fontSize)) || 10;
    const medianCharWidth =
      median(
        pageItems
          .filter((i) => i.str.length > 3)
          .map((i) => i.w / i.str.length),
      ) || bodySize * 0.5;
    const gapThreshold = Math.max(bodySize * 1.6, medianCharWidth * 2.6);
    const minColumnStep = Math.max(bodySize * 1.4, medianCharWidth * 4.5);

    const withCells = lines.map((line) => ({
      line,
      cells: splitLineIntoCells(line, gapThreshold, minColumnStep),
    }));

    let previousBottom: number | null = null;
    let pendingBreak = false;
    let tableRun: Array<{ line: Line; cells: Cell[] }> = [];
    let tableCenters: number[] = [];

    const pushTextLine = (line: Line) => {
      const gap = previousBottom === null ? 0 : line.y - previousBottom;
      const bigGap = gap > line.height * 0.85;

      if (pendingBreak) {
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
        pendingBreak = false;
      }

      const sizeRatio = line.fontSize / bodySize;
      if (sizeRatio > 1.18 || (line.bold && line.text.length < 90 && bigGap && sizeRatio > 1.02)) {
        const level = (sizeRatio > 1.55 ? 1 : sizeRatio > 1.3 ? 2 : 3) as 1 | 2 | 3;
        bodyChildren.push(
          new Paragraph({
            heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][level - 1],
            spacing: { before: 280, after: 140 },
            children: [new TextRun({ text: line.text, bold: true })],
          }),
        );
      } else {
        const bullet = BULLET_RE.exec(line.text);
        const numbered = NUMBER_RE.exec(line.text);
        const runs: TextRun[] = [];
        if (bullet || numbered) {
          runs.push(
            new TextRun({
              text: bullet ? `${bullet[1]} ` : `${numbered![1]}${numbered![2]} `,
              bold: true,
            }),
          );
        }
        runs.push(
          new TextRun({
            text: bullet
              ? line.text.slice(bullet[0].length)
              : numbered
                ? line.text.slice(numbered![0].length)
                : line.text,
            bold: line.bold,
          }),
        );
        bodyChildren.push(
          new Paragraph({
            children: runs,
            bullet: bullet ? { level: 0 } : undefined,
            numbering: !bullet && numbered ? { reference: "pdf-list", level: 0 } : undefined,
            spacing: { after: 120, line: 264 },
            indent: bullet || numbered ? { left: 360 } : undefined,
          }),
        );
      }

      previousBottom = line.y + line.height;
      if (bigGap) pendingBreak = true;
    };

    /**
     * A run of multi-cell lines only becomes a Word table when the rows really do
     * line up: at least two rows, a stable number of columns, and columns that
     * repeat in the same horizontal positions from row to row.
     */
    const looksLikeTable = (run: Array<{ cells: Cell[] }>): boolean => {
      if (run.length < 2) return false;
      const counts = run.map((entry) => entry.cells.length);
      const widest = Math.max(...counts);
      if (widest < 2) return false;
      const consistent = counts.filter((count) => Math.abs(count - widest) <= 1).length;
      if (consistent / run.length < 0.6) return false;
      const centers = clusterX(
        run.flatMap((entry) => entry.cells.map((cell) => cell.x)),
        medianCharWidth * 6,
      );
      return centers.length >= 2;
    };

    const flushTable = () => {
      const run = tableRun;
      tableRun = [];
      const centers = tableCenters;
      tableCenters = [];
      if (!run.length) return;

      if (!looksLikeTable(run)) {
        for (const entry of run) {
          pushTextLine({
            y: entry.line.y,
            height: entry.line.height,
            cells: entry.line.cells,
            text: entry.cells.map((cell) => cell.text).join("   "),
            bold: entry.cells.length > 0 && entry.cells.every((cell) => cell.bold),
            fontSize: entry.line.fontSize,
          });
        }
        return;
      }

      const columnCount = Math.max(...run.map((entry) => entry.cells.length));
      const grid: string[][] = Array.from({ length: run.length }, () => new Array(columnCount).fill(""));
      const columnCenters = centers.length
        ? centers
        : clusterX(
            run.flatMap((entry) => entry.cells.map((cell) => cell.x)),
            medianCharWidth * 3,
          );
      for (let rowIndex = 0; rowIndex < run.length; rowIndex += 1) {
        run[rowIndex].cells.forEach((cell, index) => {
          const col = columnCenters.findIndex(
            (center) => Math.abs(center - cell.x) <= medianCharWidth * 6,
          );
          const target = col === -1 ? Math.min(index, columnCount - 1) : Math.min(col, columnCount - 1);
          grid[rowIndex][target] = cell.text;
        });
      }
      bodyChildren.push(makeTable(grid, true));
      bodyChildren.push(new Paragraph({ children: [], spacing: { after: 120 } }));
    };

    for (const { line, cells } of withCells) {
      if (cells.length >= 2) {
        if (previousBottom !== null && line.y - previousBottom > bodySize * 2.1) flushTable();
        tableRun.push({ line, cells });
        if (!tableCenters.length) {
          tableCenters = clusterX(
            cells.map((cell) => cell.x),
            medianCharWidth * 6,
          );
        }
        previousBottom = line.y + line.height;
        continue;
      }
      flushTable();
      pushTextLine(line);
    }
    flushTable();
  }

  if (totalTextLength === 0) {
    throw new ConversionError(
      "scanned",
      "This PDF contains no text layer — the pages are images.",
    );
  }
  if (totalTextLength < 24) {
    throw new ConversionError(
      "no-text",
      "Almost no text could be extracted from this PDF.",
    );
  }

  if (pagesWithText < doc.numPages) {
    warnings.push({
      code: "no-text",
      message: `${doc.numPages - pagesWithText} of ${doc.numPages} pages had no text layer and were skipped.`,
    });
  }

  const document = new Document({
    creator: "Dootter",
    title: file.name.replace(/\.pdf$/i, ""),
    numbering: {
      config: [
        {
          reference: "pdf-list",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
        },
        children: bodyChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  return {
          kind: "file",
          blob,
    filename: `${file.name.replace(/\.pdf$/i, "") || "document"}.docx`,
    warnings,
  };
}

const CELL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "9AA3B2" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "9AA3B2" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "9AA3B2" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "9AA3B2" },
};

export function makeTable(grid: string[][], header: boolean): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: CELL_BORDER,
    rows: grid.map(
      (row, rowIndex) =>
        new TableRow({
          tableHeader: header && rowIndex === 0,
          children: row.map(
            (cell) =>
              new TableCell({
                borders: CELL_BORDER,
                verticalAlign: VerticalAlign.CENTER,
                shading: header && rowIndex === 0 ? { fill: "EEF1F8" } : undefined,
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 40 },
                    children: [
                      new TextRun({
                        text: cell,
                        bold: header && rowIndex === 0,
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
          ),
        }),
    ),
  });
}
