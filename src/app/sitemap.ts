import type { MetadataRoute } from "next";

import { converters } from "@/lib/converters/registry";
import { locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

const LEGAL = ["about", "privacy", "terms", "contact"] as const;

// next.config.ts enables trailingSlash, so every canonical URL ends in a slash.
// The sitemap must spell them the same way or search engines treat the two
// forms as separate URLs and split the ranking signal between them.
function urlFor(locale: string, path: string): string {
  return `${absoluteUrl(`/${locale}${path}`)}/`;
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const paths = ["", ...converters.map((c) => `/${c.slug}`), ...LEGAL.map((p) => `/${p}`)];
    for (const path of paths) {
      entries.push({
        url: urlFor(locale, path),
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path.startsWith("/") && LEGAL.includes(path as never) ? 0.3 : 0.8,
        alternates: {
          languages: Object.fromEntries(locales.map((code) => [code, urlFor(code, path)])),
        },
      });
    }
  }

  return entries;
}
