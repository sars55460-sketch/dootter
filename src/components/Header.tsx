"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n";
import { CloseIcon, MenuIcon, SwapIcon } from "./icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: `/${locale}/`, label: dict.nav.converters, id: "converters" },
    { href: `/${locale}/#how`, label: dict.nav.how, id: "how" },
    { href: `/${locale}/#faq`, label: dict.nav.faq, id: "faq" },
    { href: `/${locale}/about/`, label: dict.nav.about, id: "about" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href={`/${locale}/`} className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-brand-fg shadow-e2 transition-transform group-hover:scale-105">
            <SwapIcon className="size-[18px]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight">{dict.brand}</span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-fg-subtle sm:block">
              {dict.brandTag}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <LocaleSwitcher locale={locale} label={dict.ui.language} />
          <ThemeToggle
            labels={{
              light: dict.ui.themeLight,
              dark: dict.ui.themeDark,
              system: dict.ui.themeSystem,
            }}
          />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? dict.nav.close : dict.nav.menu}
            aria-expanded={open}
            className="btn btn-ghost size-10 !px-0 text-fg-muted md:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-bg/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
