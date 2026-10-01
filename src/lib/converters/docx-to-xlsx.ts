import { htmlToBlocks, type Block, type TableBlock } from "./shared/blocks";
import { ConversionError, mammothInput, type ConvertResult } from "./types";

type ParsedValue = { v: number | string | Date; z?: string };

const CURRENCY = /^[-−+]?\s*[$€£¥₽₴₸]|\s*[$€£¥₽₴₸]$/;

function parseNumber(text: string): { value: number; z?: string } | null {
  let body = text.trim().replace(/\u00a0/g, " ").replace(/\s/g, "");
  if (!body) return null;

  const isPercent = /%$/.test(body);
  if (isPercent) body = body.slice(0, -1);
  body = body.replace(CURRENCY, "");
  if (!body) return null;

  const sign = body.startsWith("-") || body.startsWith("−") ? -1 : 1;
  body = body.replace(/^[-−+]/, "");
  if (!/^[\d.,]+$/.test(body) || !/\d/.test(body)) return null;

  const lastDot = body.lastIndexOf(".");
  const lastComma = body.lastIndexOf(",");
  let normalized: string;

  if (lastDot >= 0 && lastComma >= 0) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    normalized = body.split(decimalSep === "." ? "," : ".").join("");
    normalized = normalized.replace(decimalSep, ".");
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? "." : ",";
    const parts = body.split(sep);
    const tail = parts[parts.length - 1];
    if (parts.length > 2 || (parts.length === 2 && tail.length === 3)) {
      normalized = parts.join("");
    } else if (tail.length > 0 && tail.length <= 2) {
      normalized = parts.join(".") === "" ? "" : `${parts[0]}.${tail}`;
    } else {
      normalized = parts.join("");
    }
  } else {
    normalized = body;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return { value: sign * value, z: isPercent ? "0.00%" : undefined };
}

function parseDate(text: string): Date | null {
  const match = /^(\d{1,4})[-./](\d{1,2})[-./](\d{1,4})$/.exec(text.trim());
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  const c = Number(match[3]);

  let year: number;
  let month: number;
  let day: number;

  if (match[1].length === 4) {
    year = a;
    month = b;
    day = c;
  } else if (a > 12) {
    day = a;
    month = b;
    year = c < 100 ? 2000 + c : c;
  } else if (c > 12) {
    month = a;
    day = b;
    year = c < 100 ? 2000 + c : c;
  } else {
    day = a;
    month = b;
    year = c < 100 ? 2000 + c : c;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1) return null;
  return date;
}

export function parseCell(text: string): ParsedValue {
  const trimmed = text.trim();
  if (!trimmed) return { v: "" };

  const date = parseDate(trimmed);
  if (date) return { v: date, z: "yyyy-mm-dd" };

  const number = parseNumber(trimmed);
  if (number) return { v: number.value, z: number.z };

  return { v: trimmed };
}

function uniqueSheetName(base: string, used: Set<string>): string {
  let name = base.replace(/[[\]:*?/\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31) || "Sheet";
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  let index = 2;
  while (used.has(`${name.slice(0, 28)} (${index})`)) index += 1;
  name = `${name.slice(0, 28)} (${index})`;
  used.add(name);
  return name;
}

function flattenBlocks(blocks: Block[]) {
  const groups: { heading: string; tables: TableBlock[]; text: { kind: string; text: string }[] }[] = [];
  let current = { heading: "", tables: [] as TableBlock[], text: [] as { kind: string; text: string }[] };
  const pushCurrent = () => {
    if (current.tables.length || current.text.length) groups.push(current);
    current = { heading: "", tables: [], text: [] };
  };

  for (const block of blocks) {
    if (block.kind === "heading") {
      pushCurrent();
      current.heading = block.runs.map((r) => r.text).join("").trim();
      continue;
    }
    if (block.kind === "table") {
      current.tables.push(block);
      continue;
    }
    if (block.kind === "paragraph" || block.kind === "quote") {
      const text = block.runs.map((r) => r.text).join("").trim();
      if (text) current.text.push({ kind: block.kind, text });
    }
  }
  pushCurrent();
  return groups;
}

export async function docxToXlsx(file: File): Promise<ConvertResult> {
  if (/\.doc$/i.test(file.name)) {
    throw new ConversionError(
      "unsupported",
      "The legacy .doc format cannot be read. Open it in Word or LibreOffice and save it as .docx first.",
    );
  }

  const [mammothModule, XLSX] = await Promise.all([import("mammoth"), import("xlsx")]);
  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength === 0) throw new ConversionError("empty", "The file is empty.");

  let html: string;
  try {
    html = (await mammothModule.convertToHtml(mammothInput(arrayBuffer))).value;
  } catch (error) {
    const message = String((error as Error)?.message || "");
    if (/encrypt|password/i.test(message)) throw new ConversionError("password", message);
    throw new ConversionError("failed", message || "Could not read the document.");
  }

  const blocks = htmlToBlocks(html);
  const groups = flattenBlocks(blocks);
  const allTables = groups.flatMap((group) => group.tables);

  if (!allTables.length) {
    throw new ConversionError("no-tables", "This document contains no tables.");
  }

  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();
  const warnings: ConvertResult["warnings"] = [];
  let sheetCount = 0;

  for (const group of groups) {
    for (let index = 0; index < group.tables.length; index += 1) {
      const table = group.tables[index];
      const columns = table.rows.reduce((max, row) => Math.max(max, row.length), 0);
      if (!columns) continue;

      const aoa: Array<Array<number | string | Date | null>> = [];
      for (const row of table.rows) {
        aoa.push(row.map((cell) => parseCell(cell).v));
      }

      const sheet = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true });
      if (table.headerRows > 0) {
        for (let c = 0; c < columns; c += 1) {
          const address = XLSX.utils.encode_cell({ r: 0, c });
          const cell = sheet[address];
          if (cell) cell.s = { font: { bold: true }, alignment: { vertical: "center" } };
        }
        sheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: columns - 1 } }) };
      }

      const widths: Array<{ wch: number }> = [];
      for (let c = 0; c < columns; c += 1) {
        let longest = 8;
        for (const row of table.rows) {
          longest = Math.max(longest, Math.min(60, (row[c] ?? "").length));
        }
        widths.push({ wch: longest + 2 });
      }
      sheet["!cols"] = widths;
      sheet["!rows"] = [{ hpt: 20 }];

      const base = group.heading || (group.tables.length > 1 ? `Table ${index + 1}` : "Table");
      XLSX.utils.book_append_sheet(workbook, sheet, uniqueSheetName(base, usedNames));
      sheetCount += 1;
    }
  }

  const strayText = groups.flatMap((group) => group.text);
  if (strayText.length) {
    const aoa: string[][] = [["Type", "Text"]];
    for (const item of strayText) {
      aoa.push([item.kind === "heading" ? "heading" : "paragraph", item.text]);
    }
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    sheet["!cols"] = [{ wch: 12 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(workbook, sheet, uniqueSheetName("Notes", usedNames));
    warnings.push({
      code: "info",
      message: `${strayText.length} text block(s) outside tables were added to a separate sheet.`,
    });
  }

  if (sheetCount > 1) {
    warnings.push({
      code: "info",
      message: `${sheetCount} tables were converted into ${sheetCount} separate sheets.`,
    });
  }

  const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return {
          kind: "file",
          blob,
    filename: `${file.name.replace(/\.docx?$/i, "") || "workbook"}.xlsx`,
    warnings,
  };
}
