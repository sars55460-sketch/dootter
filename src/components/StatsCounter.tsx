"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { BoltIcon, PeopleIcon } from "./icons";

/**
 * Reads the live visitor and conversion totals from the counter service.
 *
 * Everything here is best-effort by design. The site is a static export and
 * the counter is a nice-to-have, so a failed request, a blocked request or an
 * offline service must leave the page looking untouched rather than showing an
 * error or a hole in the layout.
 */

const ENDPOINT = "/api/stats";
const TIMEOUT_MS = 4000;

/**
 * Presence is refreshed far more often than the totals on purpose. The service
 * forgets a browser after five minutes, so a 30 second ping keeps this visitor
 * counted; the ping reply carries the totals too, so a ping that succeeds
 * updates both at no extra cost.
 */
const PING_INTERVAL_MS = 30_000;

/**
 * A separate read on its own slower timer. It exists so the permanent counters
 * still move if pings start failing, since a failed ping also means the live
 * figure has stopped being refreshed. One minute is enough: a number that
 * lives for five does not need to be watched faster.
 */
const TOTALS_INTERVAL_MS = 60_000;

type Totals = { visitors: number; conversions: number; live: number };

function report(url: string, body: Record<string, unknown>) {
  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/** Reported after a real successful conversion, never on button press. */
export function reportConversion(tool: string) {
  report(`${ENDPOINT}/conversion`, { tool });
}

/**
 * Accepts only a well-formed totals object. Anything else is treated as "no
 * answer", so a proxy error page or a truncated body leaves the counter hidden
 * instead of rendering a wrong number.
 */
function parseTotals(data: unknown): Totals | null {
  if (!data || typeof data !== "object") return null;
  const { visitors, conversions, live } = data as Partial<Totals>;
  if (typeof visitors !== "number" || typeof conversions !== "number" || typeof live !== "number") return null;
  if (visitors < 0 || conversions < 0 || live < 0) return null;
  return { visitors, conversions, live };
}

/**
 * A visitor has already pinged by the time this renders, so the service is at
 * most one ping interval behind. Showing the real 0 would read as a broken
 * widget rather than an empty site, and the person reading it is present by
 * definition.
 */
function displayLive(live: number) {
  return Math.max(1, live);
}

function formatNumber(value: number, locale: Locale) {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Picks the noun form that agrees with the number.
 *
 * A fixed label would be wrong in Russian for every value except one: "1
 * посетитель" but "2 посетителя" and "5 посетителей". Intl.PluralRules already
 * encodes that rule, so the locale decides which of the forms to use and the
 * fallback keeps the flat label for locales that do not need several forms.
 */
function pluralLabel(
  value: number,
  locale: Locale,
  forms: Record<string, string> | undefined,
  fallback: string,
) {
  if (!forms) return fallback;
  try {
    const category = new Intl.PluralRules(locale).select(value) as "one" | "few" | "many" | "other";
    return forms[category] ?? forms.other ?? fallback;
  } catch {
    return fallback;
  }
}

export function StatsCounter({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    visitors: string;
    conversions: string;
    visitorsForms?: Record<string, string>;
    conversionsForms?: Record<string, string>;
    online: string;
    onlineForms?: Record<string, string>;
  };
}) {
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Counting the visit and reading the totals are two separate calls on
    // purpose: the read must not depend on the write succeeding.
    report(`${ENDPOINT}/visit`, { locale });

    // Best effort throughout: a rejected request is the normal state of a
    // blocked or offline visitor, and it must never surface as an error.
    const read = (url: string, options?: RequestInit) =>
      fetch(url, { cache: "no-store", ...options })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: unknown) => {
          const parsed = parseTotals(data);
          if (parsed) setTotals(parsed);
        })
        .catch(() => {
          // Offline, blocked, or the service is down: keep whatever we had.
        });

    void read(ENDPOINT, { signal: controller.signal });

    // Deliberately not gated on visibility. A tab in the background is still a
    // person on the site, and browsers throttle background timers on their own,
    // which is exactly the behaviour wanted here.
    const pinger = setInterval(() => {
      void read(`${ENDPOINT}/ping`, { method: "POST" });
    }, PING_INTERVAL_MS);

    const refresher = setInterval(() => {
      void read(ENDPOINT);
    }, TOTALS_INTERVAL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(pinger);
      clearInterval(refresher);
      controller.abort();
    };
  }, [locale]);

  if (!totals) {
    // Reserve the same height while loading so the footer does not jump, but
    // render nothing visible. The test hook is on the placeholder too: this is
    // the markup that reaches the static HTML, before any hydration happens.
    return <div className="h-24" data-testid="stats-counter" aria-hidden="true" />;
  }

  const live = displayLive(totals.live);

  return (
    <div
      className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-sm sm:px-6"
      data-testid="stats-counter"
    >
<span className="inline-flex items-center gap-2 text-fg-muted">
          <PeopleIcon className="size-5 text-brand" />
          <strong className="font-bold tabular-nums text-fg">
            {formatNumber(totals.visitors, locale)}
          </strong>
          <span>{pluralLabel(totals.visitors, locale, labels.visitorsForms, labels.visitors)}</span>
        </span>

        <span aria-hidden="true" className="hidden h-4 w-px bg-line sm:block" />

        <span className="inline-flex items-center gap-2 text-fg-muted">
          <BoltIcon className="size-5 text-brand" />
          <strong className="font-bold tabular-nums text-fg">
            {formatNumber(totals.conversions, locale)}
          </strong>
          <span>{pluralLabel(totals.conversions, locale, labels.conversionsForms, labels.conversions)}</span>
        </span>

      {/* Own line rather than a third item in the row: this one changes while
          the page is being read, and a number that moves is better separated
          from the two that never do. */}
      <span
        className="flex basis-full items-center justify-center gap-2 text-fg-muted sm:basis-auto sm:border-t sm:border-line sm:pt-3"
        data-testid="stats-online"
      >
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <strong className="font-bold tabular-nums text-fg">{formatNumber(live, locale)}</strong>
        <span>{pluralLabel(live, locale, labels.onlineForms, labels.online)}</span>
      </span>
    </div>
  );
}