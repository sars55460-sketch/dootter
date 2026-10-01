export type PageGeom = {
  widthPt: number;
  heightPt: number;
  marginPt: number;
};

export const A4: PageGeom = { widthPt: 595.28, heightPt: 841.89, marginPt: 56.7 };

export function usableWidth(geom: PageGeom, landscape: boolean): number {
  return (landscape ? geom.heightPt : geom.widthPt) - geom.marginPt * 2;
}

export function usableHeight(geom: PageGeom, landscape: boolean): number {
  return (landscape ? geom.widthPt : geom.heightPt) - geom.marginPt * 2;
}

const AVG_CHAR_RATIO = 0.53;

export type TablePlanInput = {
  rows: string[][];
  baseFontPt: number;
  minColPt: number;
  maxColPt: number;
  landscapeAllowed: boolean;
  cellPadPt: number;
  lineHeightRatio: number;
  forcedLandscape?: boolean;
};

export type TablePlan = {
  cols: number;
  colWidthsPt: number[];
  fontPt: number;
  landscape: boolean;
  scale: number;
  tooWide: boolean;
  willSplit: boolean;
  estimatedPages: number;
  availableWidthPt: number;
  tableWidthPt: number;
};

function naturalWidths(rows: string[][], fontPt: number, minColPt: number, maxColPt: number): number[] {
  const cols = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const widths: number[] = new Array(cols).fill(minColPt);
  for (const row of rows) {
    for (let c = 0; c < cols; c += 1) {
      const text = row[c] ?? "";
      const longest = text
        .split(/\r?\n/)
        .reduce((max, line) => Math.max(max, line.trim().length), 0);
      const w = Math.min(maxColPt, longest * fontPt * AVG_CHAR_RATIO + fontPt * 0.9);
      if (w > widths[c]) widths[c] = w;
    }
  }
  return widths.map((w) => Math.max(minColPt, Math.min(maxColPt, w)));
}

/**
 * Works out how a table should be laid out on the page: shrink column widths
 * so it fits, flip to landscape when that helps, and report honestly when the
 * table is simply too large.
 */
export function planTable(
  input: TablePlanInput,
  geom: PageGeom = A4,
): TablePlan {
  const { rows, baseFontPt, minColPt, maxColPt, cellPadPt, lineHeightRatio } = input;
  const cols = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const landscapeAllowed = input.landscapeAllowed;

  if (cols === 0) {
    const availableWidthPt = usableWidth(geom, false);
    return {
      cols: 0,
      colWidthsPt: [],
      fontPt: baseFontPt,
      landscape: false,
      scale: 1,
      tooWide: false,
      willSplit: false,
      estimatedPages: 1,
      availableWidthPt,
      tableWidthPt: 0,
    };
  }

  const natural = naturalWidths(rows, baseFontPt, minColPt, maxColPt);
  const naturalTotal = natural.reduce((a, b) => a + b, 0);

  const portraitAvail = usableWidth(geom, false);
  const landscapeAvail = landscapeAllowed ? usableWidth(geom, true) : 0;

  let landscape = false;
  let available = portraitAvail;
  if (naturalTotal > portraitAvail && landscapeAvail > 0 && naturalTotal <= landscapeAvail) {
    landscape = true;
    available = landscapeAvail;
  } else if (input.forcedLandscape) {
    landscape = true;
    available = landscapeAvail > 0 ? landscapeAvail : portraitAvail;
  }

  let widths = natural;
  let scale = 1;
  let fontPt = baseFontPt;
  if (naturalTotal > available) {
    scale = available / naturalTotal;
    widths = natural.map((w) => Math.max(minColPt, w * scale));
    // Re-balance so the table still ends up exactly on the printable width.
    const clamped = widths.reduce((a, b) => a + b, 0);
    if (clamped > 0) {
      const correction = available / clamped;
      widths = widths.map((w) => Math.max(minColPt * 0.6, w * correction));
    }
    if (scale < 0.72) fontPt = 7.5;
    else if (scale < 0.85) fontPt = 8.5;
    else if (scale < 0.95) fontPt = 9.5;
  }

  const tableWidthPt = widths.reduce((a, b) => a + b, 0);
  const tooWide = widths.some((w) => w < minColPt * 0.6) || cols > 26;

  const availHeight = usableHeight(geom, landscape);
  const lineHeight = fontPt * lineHeightRatio;
  let tableHeightPt = 0;
  for (const row of rows) {
    let lines = 1;
    for (let c = 0; c < cols; c += 1) {
      const text = row[c] ?? "";
      if (!text) continue;
      const textWidthPt = Math.max(12, widths[c] - cellPadPt * 2);
      const charsPerLine = Math.max(4, Math.floor(textWidthPt / (fontPt * AVG_CHAR_RATIO)));
      const needed = text.split(/\r?\n/).reduce(
        (sum, part) => sum + Math.max(1, Math.ceil(part.length / charsPerLine)),
        0,
      );
      if (needed > lines) lines = needed;
    }
    tableHeightPt += lines * lineHeight + cellPadPt;
  }

  const estimatedPages = Math.max(1, Math.ceil(tableHeightPt / availHeight));

  return {
    cols,
    colWidthsPt: widths,
    fontPt,
    landscape,
    scale,
    tooWide,
    willSplit: estimatedPages > 1,
    estimatedPages,
    availableWidthPt: available,
    tableWidthPt,
  };
}
