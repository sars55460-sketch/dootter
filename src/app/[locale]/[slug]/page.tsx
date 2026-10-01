import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ConverterPanel } from "@/components/ConverterPanel";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { CheckIcon, ChevronIcon, ShieldIcon } from "@/components/icons";
import { converters, isConverterSlug } from "@/lib/converters/registry";
import { getDictionary, isLocale, locales, t, type ConverterId } from "@/lib/i18n";
import { appJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => converters.map((converter) => ({ locale, slug: converter.slug })));
}

function findConverter(slug: string) {
  return converters.find((converter) => converter.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const converter = findConverter(slug);
  if (!converter) return {};
  const dict = getDictionary(locale);
  const copy = dict.converters[converter.id];

  return {
    ...buildMetadata({
      locale,
      title: t(dict.meta.converterTitle, { title: copy.title, brand: dict.brand }),
      description: copy.long.slice(0, 300),
      path: `/${slug}`,
      keywords: copy.keywords,
    }),
    alternates: {
      canonical: absoluteUrl(`/${locale}/${slug}`),
      languages: Object.fromEntries(
        locales.map((code) => [code, absoluteUrl(`/${code}/${slug}`)]),
      ),
    },
  };
}

export default async function ConverterPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isConverterSlug(slug)) notFound();
  const locale = raw;
  const converter = findConverter(slug);
  if (!converter) notFound();

  const dict = getDictionary(locale);
  const copy = dict.converters[converter.id];
  const others = converters.filter((item) => item.id !== converter.id);

  return (
    <>
      <Header locale={locale} dict={dict} />

      <main className="pb-8">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
            <Link href={`/${locale}/`} className="hover:text-brand">
              {dict.nav.home}
            </Link>
            <ChevronIcon className="size-3.5" />
            <span>{copy.title}</span>
          </nav>
        </div>

        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-12">
            <div>
              <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.75rem]">
                {copy.title}
              </h1>
              <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">{copy.long}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                <li className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg-muted">
                  <span className="text-emerald-500">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {dict.hero.badge1}
                </li>
                <li className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg-muted">
                  <span className="text-emerald-500">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {dict.hero.badge2}
                </li>
                <li className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg-muted">
                  <span className="text-brand">
                    <ShieldIcon className="size-3.5" />
                  </span>
                  {dict.ui.processingLocally}
                </li>
              </ul>

              <div className="mt-10">
                <h2 className="text-xl font-bold tracking-tight">{copy.howTitle}</h2>
                <ol className="mt-4 space-y-3">
                  {copy.howSteps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-[15px] leading-relaxed text-fg-muted">
                      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-bold tracking-tight">{copy.whyTitle}</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {copy.whyItems.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed text-fg-muted"
                    >
                      <span className="mt-0.5 shrink-0 text-emerald-500">
                        <CheckIcon className="size-4" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <ConverterPanel
                converterId={converter.id as ConverterId}
                locale={locale}
                copy={dict.ui}
                showOrientation={converter.id === "excelToWord" || converter.id === "wordToPdf"}
              />
            </div>
          </div>
        </section>

        <div className="pt-24">
          <Faq title={copy.faqTitle} items={copy.faq} />
        </div>

        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">{dict.convertersSection.title}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/${item.slug}/`}
                className="card group flex flex-col p-5 transition-transform hover:-translate-y-1"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-brand">
                  {item.fromLabel} &rarr; {item.toLabel}
                </span>
                <span className="mt-2 text-[15px] font-bold">{dict.converters[item.id].title}</span>
                <span className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  {dict.converters[item.id].short}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer locale={locale} dict={dict} />

      <JsonLd
        data={[
          appJsonLd({
            locale,
            name: `${copy.title} | ${site.name}`,
            description: copy.long,
            path: `/${slug}`,
          }),
          faqJsonLd(copy.faq),
          breadcrumbJsonLd([
            { name: dict.nav.home, path: `/${locale}` },
            { name: dict.nav.converters, path: `/${locale}` },
            { name: copy.title, path: `/${locale}/${slug}` },
          ]),
        ]}
      />
    </>
  );
}
