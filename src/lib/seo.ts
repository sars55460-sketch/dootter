import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { absoluteUrl, site } from "./site";

export type Alternates = Record<Locale, string>;

export function languageAlternates(pathWithoutLocale: string): Alternates {
  const clean = pathWithoutLocale.replace(/^\/+|\/+$/g, "");
  const suffix = clean ? `/${clean}` : "";
  return locales.reduce((acc, locale) => {
    acc[locale] = absoluteUrl(`/${locale}${suffix}`);
    return acc;
  }, {} as Alternates);
}

export function hreflangTags(alternates: Alternates): {
  rel: "alternate";
  hrefLang: string;
  href: string;
}[] {
  return locales.map((locale) => ({
    rel: "alternate" as const,
    hrefLang: locale,
    href: alternates[locale],
  }));
}

export function buildMetadata(params: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): {
  title: string;
  description: string;
  keywords: string[];
  alternates: { canonical: string; languages: Alternates };
  openGraph: Record<string, unknown>;
  twitter: Record<string, unknown>;
} {
  const alternates = languageAlternates(params.path);
  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords ?? [],
    alternates: {
      canonical: alternates[params.locale],
      languages: alternates,
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: params.title,
      description: params.description,
      url: alternates[params.locale],
      locale: params.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function appJsonLd(params: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: params.name,
    description: params.description,
    url: absoluteUrl(`/${params.locale}${params.path}`),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript and WebAssembly",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "PDF to Word",
      "Word to PDF",
      "Excel to Word",
      "Word to Excel",
      "Runs locally in the browser",
      "No upload of files",
      "No watermark",
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(`/${locale}`)}/converters?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
