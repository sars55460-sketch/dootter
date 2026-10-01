/**
 * Single place to change the production domain. Used for canonical URLs,
 * hreflang alternates, sitemap and Open Graph tags.
 */
export const site = {
  name: "Dootter",
  tagline: "Free private document converter",
  description:
    "Free online converter for PDF, Word and Excel files. PDF to Word, Word to PDF, Excel to Word, Word to Excel. Files are processed in your browser and never uploaded.",
  url: "https://example.com",
  locale: "en_US",
  twitter: "@dootter",
} as const;

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean === "/" ? "" : clean}`;
}
