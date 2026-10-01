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

type Totals = { visitors: number; conversions: number };

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

function formatNumber(value: number, locale: Locale) {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}

export function StatsCounter({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { visitors: string; conversions: string };
}) {
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Counting the visit and reading the totals are two separate calls on
    // purpose: the read must not depend on the write succeeding.
    report(`${ENDPOINT}/visit`, { locale });

    fetch(ENDPOINT, { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") return;
        const { visitors, conversions } = data as Partial<Totals>;
        if (typeof visitors !== "number" || typeof conversions !== "number") return;
        if (visitors < 0 || conversions < 0) return;
        setTotals({ visitors, conversions });
      })
      .catch(() => {
        // Offline, blocked, or the service is down: stay hidden.
      })
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [locale]);

  if (!totals) {
    // Reserve the same height while loading so the footer does not jump, but
    // render nothing visible. The test hook is on the placeholder too: this is
    // the markup that reaches the static HTML, before any hydration happens.
    return <div className="h-16" data-testid="stats-counter" aria-hidden="true" />;
  }

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
        <span>{labels.visitors}</span>
      </span>

      <span aria-hidden="true" className="hidden h-4 w-px bg-line sm:block" />

      <span className="inline-flex items-center gap-2 text-fg-muted">
        <BoltIcon className="size-5 text-brand" />
        <strong className="font-bold tabular-nums text-fg">
          {formatNumber(totals.conversions, locale)}
        </strong>
        <span>{labels.conversions}</span>
      </span>
    </div>
  );
}