import {
  ConversionError,
  baseName,
  type ConvertOptions,
  type ConvertResult,
  type ConvertWarning,
} from "./types";

/** Section geometry, in points, as Word stores it. */
type PageGeometry = { width: number; height: number; marginTop: number; marginRight: number; marginBottom: number; marginLeft: number };

const DEFAULT_GEOMETRY: PageGeometry = {
  width: 595.28,
  height: 841.89,
  marginTop: 72,
  marginRight: 72,
  marginBottom: 72,
  marginLeft: 72,
};

/** CSS pixels to points: the browser's own scale between screen and print. */
const pxToPt = (value: string | null): number => {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed * 0.75 : NaN;
};

/** Keeps a measured value, or the file's declared fallback when it is unusable. */
const or = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);

function orientationOf(geometry: PageGeometry, override: ConvertOptions["orientation"]) {
  const landscape = geometry.width > geometry.height;
  if (override === "landscape") return { landscape: true, swap: !landscape };
  if (override === "portrait") return { landscape: false, swap: landscape };
  return { landscape, swap: false };
}

/**
 * docx-preview already turns the section properties into a page-shaped box: the
 * section is the page size and its padding is the Word margin. Reading it back
 * therefore gives the real page size and the real margins of the document.
 */
function readGeometry(section: HTMLElement, fallback: PageGeometry): PageGeometry {
  const styles = getComputedStyle(section);
  return {
    width: or(pxToPt(styles.width), fallback.width),
    height: or(pxToPt(styles.height) || pxToPt(styles.minHeight), fallback.height),
    marginTop: or(pxToPt(styles.paddingTop), fallback.marginTop),
    marginRight: or(pxToPt(styles.paddingRight), fallback.marginRight),
    marginBottom: or(pxToPt(styles.paddingBottom), fallback.marginBottom),
    marginLeft: or(pxToPt(styles.paddingLeft), fallback.marginLeft),
  };
}

/**
 * The margins are deliberately zero: the section's own padding already is the
 * Word margin, and setting both would double every margin in the output. The
 * geometry passed in is already in its final orientation.
 */
function buildPageRule(geometry: PageGeometry): string {
  return `@page { size: ${geometry.width.toFixed(2)}pt ${geometry.height.toFixed(2)}pt; margin: 0; }`;
}

function textLength(root: HTMLElement): number {
  return (root.textContent ?? "").replace(/\s+/g, " ").trim().length;
}

/**
 * Renders a .docx with docx-preview, which keeps the fonts, sizes, spacing,
 * alignment, tables, lists, images, headers, footers and page breaks declared in
 * the file because the browser lays it out as a web page. That rendering becomes
 * the PDF the user downloads, and the same page can be sent to the printer.
 *
 * The download is drawn page by page from the rendered sections, one canvas per
 * page, so the file has exactly the pages, the page size and the margins of the
 * original document.
 */
export async function docxToPdf(file: File, options: ConvertOptions = {}): Promise<ConvertResult> {
  if (/\.doc$/i.test(file.name)) {
    throw new ConversionError(
      "unsupported",
      "The legacy .doc format cannot be read. Open it in Word or LibreOffice and save it as .docx first.",
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new ConversionError("empty", "The file is empty.");
  }

  const { renderAsync } = await import("docx-preview");

  const host = document.createElement("div");
  host.id = "dootter-print-root";
  host.setAttribute("aria-hidden", "true");
  const styles = document.createElement("style");
  styles.id = "dootter-print-style";
  const base = document.createElement("style");
  base.textContent = `
    #dootter-print-root { position: fixed; top: 0; left: 0; width: 100%; background: #fff; }
    @media screen { #dootter-print-root { visibility: hidden; pointer-events: none; z-index: -1; } }
    /* html2canvas refuses to draw anything inside a hidden subtree, so the
       capture below switches this off and back on around the render. */
    @media print {
      html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
      body > *:not(#dootter-print-root) { display: none !important; }
      #dootter-print-root { position: static; visibility: visible; width: auto; background: #fff; }
      #dootter-print-root .docx-wrapper { display: block; background: transparent; padding: 0; }
      #dootter-print-root .docx-wrapper > section.docx {
        box-shadow: none; margin: 0; break-after: page; page-break-after: always;
      }
      #dootter-print-root .docx-wrapper > section.docx:last-child {
        break-after: auto; page-break-after: auto;
      }
    }`;

  document.body.append(base, styles, host);

  const cleanup = () => {
    host.remove();
    styles.remove();
    base.remove();
  };

  try {
    await renderAsync(arrayBuffer, host, styles, {
      inWrapper: true,
      breakPages: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      hideWrapperOnPrint: false,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      useBase64URL: true,
      experimental: true,
    });
  } catch (error) {
    cleanup();
    const message = String((error as Error)?.message || "");
    if (/password|encrypt/i.test(message)) {
      throw new ConversionError("password", message);
    }
    throw new ConversionError("failed", message || "Could not read the document.");
  }

  if (!textLength(host)) {
    cleanup();
    throw new ConversionError("empty", "The document has no readable content.");
  }

  const warnings: ConvertWarning[] = [];
  const section = host.querySelector<HTMLElement>("section.docx") ?? (host.firstElementChild as HTMLElement | null);
  const geometry = readGeometry(section ?? host, DEFAULT_GEOMETRY);
  const { swap } = orientationOf(geometry, options.orientation);

  // When the orientation is forced against the document, the page is turned: the
  // long edge becomes the width and the margins move with their edges.
  const pageGeometry: PageGeometry = swap
    ? {
        width: geometry.height,
        height: geometry.width,
        marginTop: geometry.marginLeft,
        marginRight: geometry.marginTop,
        marginBottom: geometry.marginRight,
        marginLeft: geometry.marginBottom,
      }
    : geometry;

  styles.textContent += `\n${buildPageRule(pageGeometry)}`;

  if (swap) {
    for (const node of host.querySelectorAll<HTMLElement>("section.docx")) {
      node.style.width = `${pageGeometry.width}pt`;
      node.style.minHeight = `${pageGeometry.height}pt`;
      node.style.paddingTop = `${pageGeometry.marginTop}pt`;
      node.style.paddingRight = `${pageGeometry.marginRight}pt`;
      node.style.paddingBottom = `${pageGeometry.marginBottom}pt`;
      node.style.paddingLeft = `${pageGeometry.marginLeft}pt`;
    }
    warnings.push({
      code: "layout-scaled",
      message:
        options.orientation === "landscape"
          ? "The page was turned to landscape, so the layout and margins were rotated to match."
          : "The page was turned to portrait, so the layout and margins were rotated to match.",
    });
  }

  const blob = await renderPdfBlob(host, pageGeometry);

  // The rendered document is only needed while the user prints it, so it is
  // dropped as soon as the PDF exists unless a print is actually requested.
  let keepForPrint = 0;
  const holdForPrint = () => {
    keepForPrint += 1;
  };
  const release = () => setTimeout(cleanup, 1000);

  return {
    kind: "file",
    blob,
    filename: `${baseName(file.name) || "document"}.pdf`,
    warnings,
    print: () => {
      holdForPrint();
      const done = () => {
        keepForPrint -= 1;
        if (keepForPrint <= 0) release();
      };
      window.addEventListener("afterprint", done, { once: true });
      window.print();
      setTimeout(done, 60_000);
    },
  };
}

/** Draws the rendered document into a PDF, one page per rendered section. */
async function renderPdfBlob(host: HTMLElement, geometry: PageGeometry): Promise<Blob> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const sections = [...host.querySelectorAll<HTMLElement>("section.docx")];
  const landscape = geometry.width > geometry.height;
  const pdf = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "pt",
    format: [geometry.width, geometry.height],
    compress: true,
  });

  // The page is hidden from the screen while it waits, and html2canvas does not
  // draw anything it considers hidden, so it is made visible for the capture.
  const previousVisibility = host.style.visibility;
  const previousPosition = host.style.position;
  host.style.visibility = "visible";
  host.style.position = "absolute";

  try {
    for (let index = 0; index < sections.length; index += 1) {
      const canvas = await html2canvas(sections[index], {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        windowWidth: sections[index].scrollWidth,
      });
      if (index > 0) {
        pdf.addPage([geometry.width, geometry.height], landscape ? "landscape" : "portrait");
      }
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        0,
        0,
        geometry.width,
        geometry.height,
        undefined,
        "FAST",
      );
    }
  } finally {
    host.style.visibility = previousVisibility;
    host.style.position = previousPosition;
  }

  return pdf.output("blob");
}
