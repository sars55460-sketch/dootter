export type Run = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: string;
};

export type ListKind = "bullet" | "number";

export type TableBlock = {
  kind: "table";
  rows: string[][];
  headerRows: number;
  /** Bold marker per cell, parallel to rows. */
  bold: boolean[][];
  aligns: ("left" | "center" | "right")[][];
};

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; runs: Run[] }
  | { kind: "paragraph"; runs: Run[]; list?: ListKind; indent?: number }
  | { kind: "quote"; runs: Run[] }
  | { kind: "image"; src: string; width: number; height: number }
  | { kind: "pagebreak" }
  | TableBlock;

type CellSlot = { text: string; bold: boolean; align: "left" | "center" | "right" };

function readAlign(el: Element): "left" | "center" | "right" {
  const style = (el.getAttribute("style") || "").toLowerCase();
  const align = el.getAttribute("align")?.toLowerCase();
  const source = `${align ?? ""};${style}`;
  if (source.includes("center")) return "center";
  if (source.includes("right") || source.includes("end")) return "right";
  return "left";
}

function isBoldish(el: Element): boolean {
  const style = (el.getAttribute("style") || "").toLowerCase();
  if (/font-weight\s*:\s*(bold|[6-9]00)/.test(style)) return true;
  return false;
}

function readRuns(el: Element): Run[] {
  const runs: Run[] = [];
  const walk = (node: Node, style: { bold: boolean; italic: boolean; underline: boolean; link?: string }) => {
    if (node.nodeType === 3) {
      const text = (node.textContent || "").replace(/\s+/g, " ");
      if (!text.trim() && !runs.length) {
        runs.push({ text });
        return;
      }
      if (text) runs.push({ ...style, text });
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") {
      runs.push({ text: "\n" });
      return;
    }
    if (tag === "img") return;
    const styleAttr = (el.getAttribute("style") || "").toLowerCase();
    const next = {
      bold: style.bold || tag === "strong" || tag === "b" || /font-weight\s*:\s*(bold|[6-9]00)/.test(styleAttr),
      italic: style.italic || tag === "em" || tag === "i" || /font-style\s*:\s*italic/.test(styleAttr),
      underline: style.underline || tag === "u" || /text-decoration[^;]*underline/.test(styleAttr),
      link: tag === "a" ? el.getAttribute("href") || undefined : style.link,
    };
    for (const child of Array.from(el.childNodes)) walk(child, next);
  };

  walk(el, { bold: false, italic: false, underline: false });
  return runs.filter((r) => r.text.length > 0 || r.link);
}

/**
 * Turns a mammoth-produced HTML table into a rectangular grid, expanding
 * rowspan / colspan so every row has the same number of cells.
 */
function readTable(el: Element): TableBlock {
  const trs = Array.from(el.querySelectorAll("tr")).filter((tr) =>
    tr.closest("table") === el,
  );
  const grid: CellSlot[][] = [];
  const occupied = new Map<string, CellSlot>();

  const cellKey = (r: number, c: number) => `${r}:${c}`;

  trs.forEach((tr, r) => {
    if (!grid[r]) grid[r] = [];
    let c = 0;
    for (const td of Array.from(tr.children)) {
      const tag = td.tagName.toLowerCase();
      if (tag !== "td" && tag !== "th") continue;
      while (occupied.has(cellKey(r, c))) c += 1;

      const colspan = Math.max(1, Number(td.getAttribute("colspan") || 1) || 1);
      const rowspan = Math.max(1, Number(td.getAttribute("rowspan") || 1) || 1);
      const isHeader = tag === "th" || !!td.closest("thead");
      const slot: CellSlot = {
        text: (td.textContent || "").replace(/\u00a0/g, " ").trim(),
        bold: isHeader || isBoldish(td),
        align: readAlign(td),
      };

      for (let dr = 0; dr < rowspan; dr += 1) {
        for (let dc = 0; dc < colspan; dc += 1) {
          const rr = r + dr;
          const cc = c + dc;
          if (!grid[rr]) grid[rr] = [];
          grid[rr][cc] = slot;
          occupied.set(cellKey(rr, cc), slot);
        }
      }
      c += colspan;
    }
  });

  const width = grid.reduce((max, row) => Math.max(max, row.length), 0);
  const rows: string[][] = [];
  const bold: boolean[][] = [];
  const aligns: ("left" | "center" | "right")[][] = [];
  for (const row of grid) {
    const r: string[] = [];
    const b: boolean[] = [];
    const a: ("left" | "center" | "right")[] = [];
    for (let i = 0; i < width; i += 1) {
      const slot = row[i];
      r.push(slot ? slot.text : "");
      b.push(slot ? slot.bold : false);
      a.push(slot ? slot.align : "left");
    }
    if (r.every((cell) => cell === "")) continue;
    rows.push(r);
    bold.push(b);
    aligns.push(a);
  }

  const firstRowIsBold = bold[0]?.some(Boolean) ?? false;
  const headerRows = firstRowIsBold && rows.length > 1 ? 1 : 0;

  return { kind: "table", rows, headerRows, bold, aligns };
}

export type { CellSlot };

export function htmlToBlocks(html: string): Block[] {
  if (typeof DOMParser === "undefined") {
    throw new Error("htmlToBlocks requires a DOM");
  }
  const parsed = new DOMParser().parseFromString(
    `<!doctype html><html><body><div id="Dootter-root">${html}</div></body></html>`,
    "text/html",
  );
  const doc = parsed;
  const blocks: Block[] = [];

  const pushBlocksFrom = (root: Element) => {
    for (const node of Array.from(root.childNodes)) {
      if (node.nodeType === 3) {
        const text = (node.textContent || "").trim();
        if (text) blocks.push({ kind: "paragraph", runs: [{ text }] });
        continue;
      }
      if (node.nodeType !== 1) continue;
      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      if (tag === "table") {
        const table = readTable(el);
        if (table.rows.length) blocks.push(table);
        continue;
      }
      if (tag === "img") {
        const src = el.getAttribute("src") || "";
        if (src) {
          const w = Number(el.getAttribute("width") || 0) || 480;
          const h = Number(el.getAttribute("height") || 0) || Math.round(w * 0.62);
          blocks.push({ kind: "image", src, width: w, height: h });
        }
        continue;
      }
      if (tag === "br") {
        blocks.push({ kind: "pagebreak" });
        continue;
      }
      const heading = /^h([1-6])$/.exec(tag);
      if (heading) {
        const runs = readRuns(el);
        if (runs.length) {
          blocks.push({
            kind: "heading",
            level: Number(heading[1]) as 1 | 2 | 3 | 4 | 5 | 6,
            runs,
          });
        }
        continue;
      }
      if (tag === "ul" || tag === "ol") {
        const listKind: ListKind = tag === "ul" ? "bullet" : "number";
        let index = 1;
        for (const li of Array.from(el.children)) {
          if (li.tagName.toLowerCase() !== "li") continue;
          const runs = readRuns(li);
          if (runs.length) {
            blocks.push({ kind: "paragraph", runs, list: listKind, indent: index });
          }
          index += 1;
        }
        continue;
      }
      if (tag === "blockquote") {
        const runs = readRuns(el);
        if (runs.length) blocks.push({ kind: "quote", runs });
        continue;
      }
      if (tag === "p" || tag === "div" || tag === "section" || tag === "article" || tag === "body" || tag === "main") {
        const hasBlockChild = Array.from(el.children).some((c) =>
          ["p", "div", "table", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "img", "br"].includes(
            c.tagName.toLowerCase(),
          ),
        );
        if (hasBlockChild) {
          pushBlocksFrom(el);
        } else {
          const runs = readRuns(el);
          if (runs.length) blocks.push({ kind: "paragraph", runs });
        }
        continue;
      }
      if (tag === "hr") {
        blocks.push({ kind: "pagebreak" });
        continue;
      }
      const runs = readRuns(el);
      if (runs.length) blocks.push({ kind: "paragraph", runs });
    }
  };

  pushBlocksFrom(doc.getElementById("Dootter-root") ?? doc.body ?? doc.documentElement);
  return blocks;
}
