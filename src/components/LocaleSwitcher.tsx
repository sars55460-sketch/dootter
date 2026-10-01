"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { locales, localeFlags, localeNames, type Locale } from "@/lib/i18n";
import { ChevronIcon } from "./icons";

const STORAGE_KEY = "db-locale";

function swapLocale(pathname: string, next: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && (locales as readonly string[]).includes(parts[0])) {
    parts[0] = next;
  } else {
    parts.unshift(next);
  }
  return `/${parts.join("/")}`;
}

export function LocaleSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        data-testid="locale-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="btn btn-ghost h-10 !px-3 text-sm text-fg-muted hover:text-fg"
      >
        <span className="font-semibold tracking-wide text-fg">{localeFlags[locale]}</span>
        <ChevronIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="card absolute right-0 z-50 mt-2 w-52 overflow-hidden p-1.5 !rounded-2xl"
        >
          {locales.map((code) => (
            <Link
              key={code}
              href={swapLocale(pathname, code)}
              hrefLang={code}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                try {
                  localStorage.setItem(STORAGE_KEY, code);
                } catch {
                  /* ignore */
                }
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                code === locale
                  ? "bg-brand-soft font-semibold text-brand"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <span className="w-6 text-[11px] font-bold tracking-wider opacity-70">
                {localeFlags[code]}
              </span>
              {localeNames[code]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
