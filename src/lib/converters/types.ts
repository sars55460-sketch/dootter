export type Orientation = "auto" | "portrait" | "landscape";

export type ConvertOptions = {
  orientation?: Orientation;
  /** Localised notice inserted into generated documents when a table is too large. */
  notices?: {
    tooWide: (columns: number) => string;
    willSplit: (pages: number) => string;
  };
};

export type ConvertWarning = {
  code:
    | "scanned-pdf"
    | "no-text"
    | "table-too-large"
    | "layout-scaled"
    | "sheets-truncated"
    | "info";
  message: string;
};

/**
 * Most tools hand back a finished file. Word to PDF also offers a print action,
 * because the page it renders is the closest thing to what Word itself lays out:
 * the download is a page-for-page image of that rendering, and the print action
 * hands the same live rendering to the browser's own print engine.
 */
export type ConvertResult = {
  kind: "file";
  blob: Blob;
  filename: string;
  warnings: ConvertWarning[];
  /** Present only when the page can also be sent to the printer. */
  print?: () => void;
};

/**
 * mammoth ships two builds: the browser one reads `options.arrayBuffer`, the
 * Node one reads `options.buffer`. Bundlers pick the browser build, scripts and
 * tests resolve the Node build, so we hand over both keys and work everywhere.
 */
export function mammothInput(arrayBuffer: ArrayBuffer): { arrayBuffer: ArrayBuffer; buffer: ArrayBuffer } {
  return { arrayBuffer, buffer: arrayBuffer };
}

export class ConversionError extends Error {
  readonly code:
    | "unsupported"
    | "empty"
    | "password"
    | "too-large"
    | "failed"
    | "scanned"
    | "no-text"
    | "no-tables";

  constructor(code: ConversionError["code"], message: string) {
    super(message);
    this.name = "ConversionError";
    this.code = code;
  }
}

export function baseName(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}
