import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeScript } from "@/components/ThemeScript";
import { YandexAdsLoader } from "@/components/YandexAdsLoader";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic", "greek"],
  display: "swap",
  variable: "--font-inter",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#080b14" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    ...buildMetadata({
      locale,
      title: `${dict.hero.title} | ${dict.brand}`,
      description: dict.hero.subtitle,
      path: "",
      keywords: dict.meta.homeKeywords,
    }),
    applicationName: dict.brand,
    authors: [{ name: dict.brand }],
    creator: dict.brand,
    publisher: dict.brand,
    formatDetection: { email: false, address: false, telephone: false },
    // Kadam verifies the property by reading this tag out of the head. It goes
    // in the root layout so every page carries it: the apex is a JS redirect, so
    // a checker that does not run scripts would never see a token on "/".
    other: {
      "kadam-verification": site.verification.kadam,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  return (
    <html lang={locale} suppressHydrationWarning>
<head>
          <ThemeScript />
          <YandexAdsLoader />
        </head>
      <body className={`${inter.variable} app-bg antialiased`}>{children}</body>
    </html>
  );
}
