import Link from "next/link";

import { converters } from "@/lib/converters/registry";
import type { Dictionary, Locale } from "@/lib/i18n";
import { SwapIcon } from "./icons";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = 2026;

  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href={`/${locale}/`} className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-brand-fg">
                <SwapIcon className="size-[18px]" />
              </span>
              <span className="text-[15px] font-bold tracking-tight">{dict.brand}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              {dict.footer.blurb}
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
              {dict.footer.product}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {converters.map((converter) => (
                <li key={converter.id}>
                  <Link
                    href={`/${locale}/${converter.slug}/`}
                    className="text-sm text-fg-muted transition-colors hover:text-brand"
                  >
                    {dict.converters[converter.id].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
              {dict.footer.company}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {(
                [
                  ["about", dict.nav.about],
                  ["contact", dict.nav.contact],
                  ["privacy", dict.nav.privacy],
                  ["terms", dict.nav.terms],
                ] as const
              ).map(([slug, label]) => (
                <li key={slug}>
                  <Link
                    href={`/${locale}/${slug}/`}
                    className="text-sm text-fg-muted transition-colors hover:text-brand"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {dict.brand}. {dict.footer.rights}
          </p>
          <p>{dict.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
