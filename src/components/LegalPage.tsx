import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ChevronIcon } from "@/components/icons";
import { getDictionary, isLocale, type Dictionary, type Locale } from "@/lib/i18n";

const PAGES = ["about", "privacy", "terms", "contact"] as const;
export type LegalSlug = (typeof PAGES)[number];

export function isLegalSlug(slug: string): slug is LegalSlug {
  return (PAGES as readonly string[]).includes(slug);
}

export async function LegalPage({
  slug,
  params,
}: {
  slug: LegalSlug;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw) || !isLegalSlug(slug)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const page: Dictionary["pages"][LegalSlug] = dict.pages[slug];

  return (
    <>
      <Header locale={locale} dict={dict} />

      <main className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-fg-subtle">
          <Link href={`/${locale}/`} className="hover:text-brand">
            {dict.nav.home}
          </Link>
          <ChevronIcon className="size-3.5" />
          <span>{page.title}</span>
        </nav>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">{page.title}</h1>
        <p className="mt-4 text-[17px] font-medium leading-relaxed text-fg-muted">{page.intro}</p>

        <div className="prose-legal mt-6">
          {page.sections.map((section) => (
            <section key={section.h}>
              <h2>{section.h}</h2>
              <p>{section.p}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {PAGES.filter((item) => item !== slug).map((item) => (
            <Link key={item} href={`/${locale}/${item}/`} className="btn btn-ghost h-11 px-4">
              {dict.pages[item].title}
            </Link>
          ))}
        </div>
      </main>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
