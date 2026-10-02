import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
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
  left: number;
  right: number;
  cells: PdfItem[];
  text: string;
  bold: boolean;
  italic: boolean;
  fontSize: number;
};

const BULLET_RE = /^([•·▪◦‣∙*+\-–—])\s+/;
const NUMBER_RE = /^(\d{1,3})([.)])\s+/;

/** PDF user units to twips: one point is 20 twips. */
const toTwips = (points: number) => Math.round(points * 20);

/** A font size outside this range is a measurement artefact, not a real size. */
const MIN_FONT_PT = 5;
const MAX_FONT_PT = 48;

/** Word refuses sizes outside 2..1638 half-points; keep runs in a sane band. */
const toHalfPoints = (points: number) =>
  Math.max(10, Math.min(1638, Math.round(points * 2)));

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** The value that most lines agree on: the left edge of the text column. */
function mode(values: number[], tolerance: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  let best = { at: sorted[0] ?? 0, count: 0 };
  for (const start of sorted) {
    let count = 0;
    for (const value of sorted) {
      if (Math.abs(value - start) <= tolerance) count += 1;
    }
    if (count > best.count) best = { at: start, count };
  }
  return best.at;
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

  return raw
    .map((line) => {
      const cells = line.cells.sort((a, b) => a.x - b.x);
      let text = "";
      for (const cell of cells) {
        if (text && !text.endsWith(" ") && !cell.str.startsWith(" ")) text += " ";
        text += cell.str;
      }
      const meaningful = cells.filter((c) => c.str.trim());
      return {
        y: line.y,
        height: line.height,
        left: Math.min(...cells.map((c) => c.x)),
        right: Math.max(...cells.map((c) => c.x + c.w)),
        cells,
        text: text.replace(/\s+/g, " ").trim(),
        // Only call a line bold when every visible piece of it is bold, otherwise
        // a single bold word in a heading would bold the whole line.
        bold:
          meaningful.length > 0 && meaningful.every((c) => c.bold),
        italic: meaningful.length > 0 && meaningful.every((c) => c.italic),
        fontSize: Math.max(...cells.map((c) => c.h)),
      };
    })
    .filter((line) => line.text.length > 0);
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

/**
 * One visual block of the source PDF: a run of lines that belong to the same
 * paragraph, so that Word - not the PDF's hard line breaks - decides where the
 * text wraps.
 */
type Block = {
  lines: Line[];
  /** Measured indentation of the first line, used to spot a following block. */
  firstLeft: number;
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType];
  size: number;
};

const BLOCK_KIND_HEADING = "heading";
const BLOCK_KIND_BULLET = "bullet";
const BLOCK_KIND_NUMBER = "number";
const BLOCK_KIND_BODY = "body";

function blockKind(line: Line, bodySize: number): string {
  if (line.fontSize / bodySize > 1.18) return BLOCK_KIND_HEADING;
  if (BULLET_RE.test(line.text)) return BLOCK_KIND_BULLET;
  if (NUMBER_RE.test(line.text)) return BLOCK_KIND_NUMBER;
  return BLOCK_KIND_BODY;
}

/**
 * Alignment is read off the geometry rather than guessed: text whose right edge
 * is straight and whose left edge wanders is right-aligned, text that wanders on
 * both sides is centred, and text whose lines all reach the column edge is
 * justified. That last one matters because justified paragraphs are exactly the
 * ones that look broken when they are reproduced as left-aligned text.
 */
function detectAlignment(lines: Line[], bodySize: number, rightEdge: number) {
  const leftSpread =
    Math.max(...lines.map((l) => l.left)) - Math.min(...lines.map((l) => l.left));
  const rightSpread =
    Math.max(...lines.map((l) => l.right)) - Math.min(...lines.map((l) => l.right));

  if (rightSpread < bodySize * 0.7 && leftSpread > bodySize * 1.4) return AlignmentType.RIGHT;
  if (leftSpread > bodySize * 1.4 && rightSpread > bodySize * 1.4) return AlignmentType.CENTER;

  // Only the wrapped lines of a paragraph prove justification: the last line of a
  // justified paragraph always stops short.
  if (lines.length >= 2) {
    const wrapped = lines.slice(0, -1);
    const flush = wrapped.filter((l) => l.right >= rightEdge - bodySize * 1.1);
    if (flush.length === wrapped.length) return AlignmentType.JUSTIFIED;
  }
  return AlignmentType.LEFT;
}

/**
 * Decides whether `line` continues the paragraph under construction.
 *
 * A PDF line is not a paragraph. Merging them is the whole point: handing Word
 * one paragraph per source line leaves hard line breaks baked into the text, so
 * any edit re-wraps it into nonsense. Every condition below is a signal that the
 * original was starting a new paragraph.
 */
function continuesBlock(
  line: Line,
  block: { lines: Line[]; firstLeft: number; kind: string; size: number },
  context: {
    bodySize: number;
    rightEdge: number;
    leftEdge: number;
    previousBottom: number | null;
  },
): boolean {
  const previous = block.lines[block.lines.length - 1];
  const { bodySize, rightEdge, leftEdge, previousBottom } = context;
  const leading = Math.max(bodySize, previous.height, line.height);

  // A different kind of block - body text, a bullet, a heading - never merges.
  if (blockKind(line, bodySize) !== block.kind) return false;

  // A noticeably different text size means a new run of text, not a continuation.
  if (Math.abs(line.fontSize - block.size) > bodySize * 0.14) return false;
  if (line.bold !== previous.bold) return false;

  // A vertical gap larger than the line height is paragraph spacing, not leading.
  if (previousBottom !== null && line.y - previousBottom > leading * 0.62) return false;

  // The last line of a justified paragraph stops short of the column edge. When
  // the previous line does not reach it, the paragraph has ended here.
  if (previous.right < rightEdge - bodySize * 1.6) return false;

  // Indented, centred and right-aligned lines sit away from the column edge.
  // A hanging indent or a centred heading starts a new block.
  if (Math.abs(line.left - leftEdge) > bodySize * 0.9) {
    if (Math.abs(line.left - block.firstLeft) > bodySize * 0.5) return false;
  }

  // Never let a paragraph swallow an entire column of unrelated text.
  if (block.lines.length > 60) return false;

  return true;
}

/** Re-attaches a hyphenated line break without dropping the original hyphen. */
function joinText(previous: Line, line: Line, bodySize: number): string {
  const endsHyphenated = /[-‐]$/.test(previous.text);
  const gap = line.left - previous.right;
  // A real word gap in the PDF means a space belongs here; a hyphenated break
  // does not take one.
  if (endsHyphenated || gap < bodySize * 0.25) return `${previous.text}${line.text}`;
  return `${previous.text} ${line.text}`;
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

  const warnings: ConvertResult["warnings"] = [];
  let totalTextLength = 0;
  let pagesWithText = 0;

  // ---------------------------------------------------------------- pass one
  // Read every page and keep its geometry. Nothing is written yet: the text
  // column has to be measured across the whole document before the section can
  // be given page margins that match the source.
  type PageLines = {
    lines: Line[];
    bodySize: number;
    medianCharWidth: number;
    pageWidth: number;
    pageHeight: number;
    withCells: Array<{ line: Line; cells: Cell[] }>;
  };
  const pages: PageLines[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = (await doc.getPage(pageNumber)) as {
      getViewport: (p: { scale: number }) => { transform: number[]; width: number; height: number };
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
      const height = Math.abs(tx[3]) || Math.abs((raw.height as number) ?? 10);
      const width = (raw.width as number) || Math.abs(tx[0]) * 0.5;

      // Style is read from the font wherever it is available. Producers that
      // name their fonts "Bold"/"Italic" - Word and LaTeX both do - are covered
      // by the font name; a slanted text matrix covers oblique variants that do
      // not advertise it. Producers that hide the name behind an opaque id
      // (jsPDF's g_d0_f1, for example) give nothing to read, and those runs stay
      // unstyled rather than being guessed at.
      let styleName = String(raw.fontName || "");
      const loaded = (page as { commonObjs?: { get: (id: string) => { name?: string; loadedName?: string } } })
        .commonObjs;
      if (loaded) {
        try {
          const font = loaded.get(styleName);
          styleName = `${styleName} ${font?.name ?? ""} ${font?.loadedName ?? ""}`;
        } catch {
          // The font object is not resolved on this page; the raw id is all
          // there is, and the shear test below still applies.
        }
      }
      const slanted = Math.abs(tx[1]) > height * 0.08;

      pageItems.push({
        str: raw.str,
        x: tx[4],
        y: tx[5],
        w: width,
        h: height,
        bold: /bold|semib|black|heavy|demi/i.test(styleName),
        italic: /italic|oblique/i.test(styleName) || slanted,
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
        pageItems.filter((i) => i.str.length > 3).map((i) => i.w / i.str.length),
      ) || bodySize * 0.5;
    const gapThreshold = Math.max(bodySize * 1.6, medianCharWidth * 2.6);
    const minColumnStep = Math.max(bodySize * 1.4, medianCharWidth * 4.5);

    pages.push({
      lines,
      bodySize,
      medianCharWidth,
      pageWidth: viewport.width,
      pageHeight: viewport.height,
      withCells: lines.map((line) => ({
        line,
        cells: splitLineIntoCells(line, gapThreshold, minColumnStep),
      })),
    });
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

  // ------------------------------------------------------------ page geometry
  // The section is sized from the first page and the margins from the text box
  // the document actually occupies. Defaulting to Letter with 2 cm margins - as
  // this did before - silently reflowed every A4 document onto a narrower column,
  // which is most of why the wrapping did not match the original.
  const first = pages[0];
  const documentBodySize = median(pages.map((page) => page.bodySize)) || 10;
  const pageWidth = first.pageWidth;
  const pageHeight = first.pageHeight;

  const allLefts = pages.flatMap((page) => page.lines.map((l) => l.left));
  const leftEdge = mode(allLefts, documentBodySize * 0.6);
  const topEdge = Math.min(
    ...pages.flatMap((page) => page.lines.map((l) => l.y)),
  );

  // Never let a measured margin eat the page: keep at least 1 cm.
  const marginTop = Math.max(28, Math.min(topEdge - documentBodySize, pageHeight * 0.15));
  // The bottom edge of a PDF is not a margin: the last page simply stops when
  // the content does. Measuring it gave a 7 cm bottom margin and pushed content
  // onto extra pages, which is the symptom this is meant to remove. Documents
  // are set with symmetric margins, so the top measurement is reused.
  const marginBottom = marginTop;
  const marginLeft = Math.max(28, Math.min(leftEdge, pageWidth * 0.2));
  // The right edge is taken from the text rather than from a page margin, so it
  // reflects where the longest line happened to end. On a document with short
  // lines it lands far short of the real column edge and produced a 4 cm right
  // margin. Word documents are set with symmetric margins, so the left margin -
  // which is a genuine, consistent measurement - is used for both sides.
  const marginRight = marginLeft;

  // ---------------------------------------------------------------- pass two
  const bodyChildren: Array<Paragraph | Table> = [];

  for (const page of pages) {
    const { bodySize, medianCharWidth, withCells } = page;
    // Right edge of the text column, from the widest line on the page rather
    // than the whole document, so a wide table on another page cannot widen the
    // body column here. This is what alignment is judged against.
    const rightEdge = Math.max(...page.lines.map((l) => l.right));
    let previousBottom: number | null = null;
    let tableRun: Array<{ line: Line; cells: Cell[] }> = [];
    let tableCenters: number[] = [];
    let openBlock: { lines: Line[]; firstLeft: number; kind: string; size: number } | null =
      null;

    const alignmentOf = (lines: Line[]) => detectAlignment(lines, bodySize, rightEdge);

    const pushBlock = () => {
      if (!openBlock) return;
      const { lines } = openBlock;
      openBlock = null;
      if (!lines.length) return;

      const kind = blockKind(lines[0], bodySize);
      const size = lines[0].fontSize;
      // Each line after the first is joined onto what came before it. The
        // accumulator has to be carried through: without `acc +` the reduce
        // returned only the last join and threw away the start of the
        // paragraph, so a four-line paragraph came out as its final two lines.
        const text = lines.reduce(
          (acc, line, index) =>
            index === 0 ? line.text : acc + joinText(lines[index - 1], line, bodySize),
          "",
        );
      if (!text.trim()) return;

      const runProps = {
        size: toHalfPoints(Math.min(MAX_FONT_PT, Math.max(MIN_FONT_PT, size))),
        bold: lines.every((l) => l.bold),
        italics: lines.some((l) => l.italic),
      };

      if (kind === BLOCK_KIND_HEADING) {
        const ratio = size / bodySize;
        const level = (ratio > 1.55 ? 1 : ratio > 1.3 ? 2 : 3) as 1 | 2 | 3;
        bodyChildren.push(
          new Paragraph({
            heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][
              level - 1
            ],
            alignment: alignmentOf(lines),
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text, ...runProps })],
          }),
        );
        return;
      }

      const bullet = kind === BLOCK_KIND_BULLET ? BULLET_RE.exec(lines[0].text) : null;
      const numbered = kind === BLOCK_KIND_NUMBER ? NUMBER_RE.exec(lines[0].text) : null;
      const marker = bullet ?? numbered;
      // Word renders the marker itself from the numbering definition. Repeating
      // it as literal text showed "• • First item" and "1. 1. First item", so
      // the source marker is stripped from the run and left to Word.
      const body = marker ? text.slice(marker[0].length) : text;
      const runs: TextRun[] = [new TextRun({ text: body, ...runProps })];

      bodyChildren.push(
        new Paragraph({
          children: runs,
          alignment: alignmentOf(lines),
          // List items must never inherit the first line's own marker: the
          // numbering definition supplies it.
          bullet: bullet ? { level: 0 } : undefined,
          numbering: !bullet && numbered ? { reference: "pdf-list", level: 0 } : undefined,
          spacing: { after: 120, line: 276 },
          indent: bullet || numbered ? { left: 360 } : undefined,
        }),
      );
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
        // Not a table after all: hand the lines back to the paragraph builder so
        // they rejoin into normal text instead of staying fragments.
        for (const entry of run) {
          const text = entry.cells.map((cell) => cell.text).join("   ");
          if (!text.trim()) continue;
          // Joining the cells with wide gaps inflates the measured right edge, so
          // the line is re-measured as if the text were one continuous run.
          const measured =
            (entry.cells[entry.cells.length - 1]?.x ?? entry.line.left) - entry.line.left +
            text.length * bodySize * 0.5;
          const candidate: Line = {
            ...entry.line,
            text,
            right: entry.line.left + Math.max(measured, 1),
          };
          if (
            openBlock &&
            continuesBlock(candidate, openBlock, {
              bodySize,
              rightEdge,
              leftEdge,
              previousBottom,
            })
          ) {
            openBlock.lines.push(candidate);
          } else {
            pushBlock();
            openBlock = {
              lines: [candidate],
              firstLeft: candidate.left,
              kind: blockKind(candidate, bodySize),
              size: candidate.fontSize,
            };
          }
          previousBottom = candidate.y + candidate.height;
        }
        return;
      }

      const columnCount = Math.max(...run.map((entry) => entry.cells.length));
      const grid: string[][] = Array.from({ length: run.length }, () =>
        new Array(columnCount).fill(""),
      );
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
      bodyChildren.push(makeTable(grid, true, run[0]?.line.fontSize ?? bodySize));
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

      if (
        openBlock &&
        continuesBlock(line, openBlock, { bodySize, rightEdge, leftEdge, previousBottom })
      ) {
        openBlock.lines.push(line);
      } else {
        pushBlock();
        openBlock = {
          lines: [line],
          firstLeft: line.left,
          kind: blockKind(line, bodySize),
          size: line.fontSize,
        };
      }
      previousBottom = line.y + line.height;
    }
    flushTable();
    pushBlock();
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
          run: { font: "Calibri", size: toHalfPoints(documentBodySize) },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: toTwips(pageWidth), height: toTwips(pageHeight) },
            margin: {
              top: toTwips(marginTop),
              right: toTwips(marginRight),
              bottom: toTwips(marginBottom),
              left: toTwips(marginLeft),
            },
          },
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

export function makeTable(grid: string[][], header: boolean, fontSize = 10): Table {
  const size = toHalfPoints(Math.min(MAX_FONT_PT, Math.max(MIN_FONT_PT, fontSize)));
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
                        size,
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