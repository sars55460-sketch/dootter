/**
 * Single place to change the production domain. Used for canonical URLs,
 * hreflang alternates, sitemap and Open Graph tags.
 *
 * The apex is canonical: converter-dotter.ru without www. DNS is served by
 * reg.ru, not Cloudflare, so the www -> apex redirect is enforced by nginx in
 * deploy/nginx/doootter.conf rather than at the edge.
 */
export const site = {
  name: "Dootter",
  tagline: "Free private document converter",
  description:
    "Free online converter for PDF, Word and Excel files. PDF to Word, Word to PDF, Excel to Word, Word to Excel. Files are processed in your browser and never uploaded.",
  url: "https://converter-dotter.ru",
  /**
   * Public contact address. The contact page invites readers to report bugs, so
   * the address has to be visible there rather than buried in security.txt.
   */
  contactEmail: "sars55460@gmail.com",
} as const;

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean === "/" ? "" : clean}`;
}