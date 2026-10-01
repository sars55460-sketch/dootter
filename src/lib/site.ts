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
  /**
   * Owner-verification token. This is a site-ownership proof, not content, so it
   * lives next to the domain rather than in a dictionary: the same token applies
   * to every locale and must not drift between them.
   *
   * Kadam verifies the property by reading this out of the page head. It is
   * emitted from the root layout rather than from the apex, because the apex is
   * a JS redirect and a checker that does not run scripts would never see it.
   */
  verification: {
    // Keep in sync with the copy in public/index.html: that file is a static
    // redirect and is not generated, so it cannot read this constant.
    kadam: "kadame0d406142fb7e6bfc2fbb19b0600fb5c",
  },
} as const;

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean === "/" ? "" : clean}`;
}