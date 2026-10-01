import Link from "next/link";

import type { ConverterMeta } from "@/lib/converters/registry";
import type { Dictionary, Locale } from "@/lib/i18n";
import { ArrowIcon, FileIcon } from "./icons";

export function ConverterCard({
  locale,
  converter,
  dict,
  index,
}: {
  locale: Locale;
  converter: ConverterMeta;
  dict: Dictionary;
  index: number;
}) {
  const copy = dict.converters[converter.id];
  return (
    <Link
      href={`/${locale}/${converter.slug}/`}
      className="card group flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${converter.accent} text-brand`}
        >
          <FileIcon />
        </span>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span>{converter.fromLabel}</span>
          <ArrowIcon />
          <span>{converter.toLabel}</span>
        </div>
      </div>
      <h3 className="mt-4 text-[17px] font-bold tracking-tight">{copy.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{copy.short}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        {dict.convertersSection.open}
        <ArrowIcon className="size-3.5" />
      </span>
    </Link>
  );
}
