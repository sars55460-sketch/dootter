import type { Metadata } from "next";

import { LegalPage } from "@/components/LegalPage";
import { getDictionary, isLocale, locales, t } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    title: t(dict.meta.legalTitle, { title: dict.pages.contact.title, brand: dict.brand }),
    description: dict.pages.contact.intro,
    path: "/contact",
  });
}

export default function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  return <LegalPage slug="contact" params={params} />;
}
