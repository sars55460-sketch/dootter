/**
 * Single place to change the production domain. Used for canonical URLs,
 * hreflang alternates, sitemap and Open Graph tags.
 *
 * The apex is canonical: converter-doootter.ru without www. Any request that
 * arrives on www is redirected to the apex by Cloudflare, so the two never
 * compete as separate URLs for search engines.
 */
export const site = {
  name: "Dootter",
  tagline: "Free private document converter",
  description:
    "Free online converter for PDF, Word and Excel files. PDF to Word, Word to PDF, Excel to Word, Word to Excel. Files are processed in your browser and never uploaded.",
  url: "https://converter-doootter.ru",
} as const;

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean === "/" ? "" : clean}`;
}