import Link from "next/link";
import { notFound } from "next/navigation";

import { ConverterCard } from "@/components/ConverterCard";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { StatsCounter } from "@/components/StatsCounter";
import { YandexAds } from "@/components/YandexAds";
import { BoltIcon, CheckIcon, InfinityIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { converters } from "@/lib/converters/registry";
import { getDictionary, isLocale } from "@/lib/i18n";
import { faqJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDictionary(locale);

  const trustIcons = [ShieldIcon, SparkIcon, BoltIcon, InfinityIcon];

  return (
    <>
      <Header locale={locale} dict={dict} />

      <main className="pb-8">
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-fg-muted shadow-e1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {dict.hero.eyebrow}
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              {dict.hero.title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-fg-muted">
              {dict.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#converters" className="btn btn-primary h-12 px-6 text-[15px]">
                {dict.hero.ctaPrimary}
              </a>
              <a href="#how" className="btn btn-ghost h-12 px-6 text-[15px]">
                {dict.hero.ctaSecondary}
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-fg-subtle">
              {[dict.hero.badge1, dict.hero.badge2, dict.hero.badge3].map((badge) => (
                <li key={badge} className="flex items-center gap-1.5">
                  <span className="text-emerald-500">
                    <CheckIcon className="size-4" />
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {dict.trust.items.map((item, index) => {
              const Icon = trustIcons[index] ?? ShieldIcon;
              return (
                <div key={item.h} className="card p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon />
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold tracking-tight">{item.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.p}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="converters" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {dict.convertersSection.title}
            </h2>
            <p className="mt-3 text-[17px] leading-relaxed text-fg-muted">
              {dict.convertersSection.subtitle}
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {converters.map((converter, index) => (
              <ConverterCard
                key={converter.id}
                locale={locale}
                converter={converter}
                dict={dict}
                index={index}
              />
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {dict.stepsSection.title}
            </h2>
            <p className="mt-3 text-[17px] text-fg-muted">{dict.stepsSection.subtitle}</p>
          </div>

          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {dict.stepsSection.steps.map((step, index) => (
              <li key={step.h} className="card relative overflow-hidden p-6">
                <span className="absolute -right-2 -top-4 text-7xl font-black text-brand/8">
                  {index + 1}
                </span>
                <h3 className="relative text-[17px] font-bold tracking-tight">{step.h}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-fg-muted">{step.p}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="pt-24">
          <Faq title={dict.homeFaq.title} items={dict.homeFaq.items} />
        </div>

        <section className="mx-auto max-w-4xl px-4 pt-24 sm:px-6">
          <div className="card overflow-hidden p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {dict.ctaSection.title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] text-fg-muted">
              {dict.ctaSection.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {converters.slice(0, 2).map((converter) => (
                <Link
                  key={converter.id}
                  href={`/${locale}/${converter.slug}/`}
                  className="btn btn-primary h-12 px-6 text-[15px]"
                >
                  {dict.converters[converter.id].title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="mt-20">
        <YandexAds label={dict.ads.label} />
      </div>

      <div className="mt-16 border-t border-line">
        <StatsCounter locale={locale} labels={dict.stats} />
      </div>

      <Footer locale={locale} dict={dict} />

      <JsonLd data={[websiteJsonLd(locale), faqJsonLd(dict.homeFaq.items)]} />
    </>
  );
}
