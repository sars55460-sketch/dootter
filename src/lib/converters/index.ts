import { getConverterMeta } from "./registry";
import { ConversionError, type ConvertOptions, type ConvertResult } from "./types";
import type { ConverterId } from "@/lib/i18n/types";

const MAX_BYTES = 512 * 1024 * 1024;

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

export async function runConversion(
  id: ConverterId,
  file: File,
  options: ConvertOptions = {},
): Promise<ConvertResult> {
  const meta = getConverterMeta(id);
  const extension = extensionOf(file.name);

  if (!meta.accepts.includes(extension)) {
    throw new ConversionError(
      "unsupported",
      `This tool only accepts ${meta.accepts.map((e) => `.${e}`).join(", ")} files.`,
    );
  }
  if (file.size === 0) {
    throw new ConversionError("empty", "The file is empty.");
  }
  if (file.size > MAX_BYTES) {
    throw new ConversionError("too-large", "The file is larger than this browser can handle.");
  }

  try {
    switch (id) {
      case "pdfToWord": {
        const { pdfToDocx } = await import("./pdf-to-docx");
        return await pdfToDocx(file);
      }
      case "wordToPdf": {
        const { docxToPdf } = await import("./docx-to-pdf");
        return await docxToPdf(file, options);
      }
      case "excelToWord": {
        const { xlsxToDocx } = await import("./xlsx-to-docx");
        return await xlsxToDocx(file, options);
      }
      case "wordToExcel": {
        const { docxToXlsx } = await import("./docx-to-xlsx");
        return await docxToXlsx(file);
      }
      default:
        throw new ConversionError("failed", "Unsupported conversion.");
    }
  } catch (error) {
    if (error instanceof ConversionError) throw error;
    const message = String((error as Error)?.message || "");
    if (/password|encrypt/i.test(message)) {
      throw new ConversionError("password", message);
    }
    throw new ConversionError("failed", message || "The conversion failed unexpectedly.");
  }
}
