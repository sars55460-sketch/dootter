import type { ConverterId } from "@/lib/i18n/types";

export type ConverterMeta = {
  id: ConverterId;
  slug: string;
  /** Deterministic gradient used for the card accent. */
  accent: string;
  fromLabel: string;
  toLabel: string;
  accepts: string[];
  produces: { ext: string; mime: string };
};

export const converters: ConverterMeta[] = [
  {
    id: "pdfToWord",
    slug: "pdf-to-word",
    accent: "from-rose-500/18 to-orange-400/18",
    fromLabel: "PDF",
    toLabel: "Word",
    accepts: ["pdf"],
    produces: {
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  },
  {
    id: "wordToPdf",
    slug: "word-to-pdf",
    accent: "from-sky-500/18 to-indigo-400/18",
    fromLabel: "Word",
    toLabel: "PDF",
    accepts: ["doc", "docx"],
    produces: { ext: "pdf", mime: "application/pdf" },
  },
  {
    id: "excelToWord",
    slug: "excel-to-word",
    accent: "from-emerald-500/18 to-teal-400/18",
    fromLabel: "Excel",
    toLabel: "Word",
    accepts: ["xls", "xlsx", "csv"],
    produces: {
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  },
  {
    id: "wordToExcel",
    slug: "word-to-excel",
    accent: "from-amber-500/18 to-lime-400/18",
    fromLabel: "Word",
    toLabel: "Excel",
    accepts: ["doc", "docx"],
    produces: {
      ext: "xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  },
];

export function getConverterMeta(id: ConverterId): ConverterMeta {
  const found = converters.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown converter: ${id}`);
  return found;
}

export function isConverterSlug(slug: string): slug is ConverterMeta["slug"] {
  return converters.some((c) => c.slug === slug);
}
