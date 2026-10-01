import { defaultLocale, isLocale, type Locale } from "./config";
import { de } from "./dictionaries/de";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { fr } from "./dictionaries/fr";
import { ru } from "./dictionaries/ru";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, ru, es, de, fr };

export function getDictionary(locale: string): Dictionary {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

export function t(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export type { Dictionary };
export * from "./config";
export * from "./types";
