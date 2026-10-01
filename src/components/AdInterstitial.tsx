"use client";

import { useEffect, useRef, useState } from "react";

import { CloseIcon } from "./icons";

/**
 * Adsterra publisher zone key for the interstitial placement.
 *
 * Empty until Adsterra approves a zone. A modal with no fill behind it is a
 * blank box in the visitor's face, which is worse than showing nothing at all,
 * so the component stays dormant while this is blank. Paste the key here when
 * the zone is approved and the interstitial starts serving.
 */
const ADSTERRA_KEY = "";

/** One interstitial per session: showing it on every converter page is nagging. */
const SESSION_KEY = "doootter:interstitial-shown";

/** Let the converter render before the modal covers it. */
const DELAY_MS = 1800;

/**
 * Labelled interstitial shown once per session when a visitor opens a converter.
 *
 * The requested converter is on screen first; the modal appears over it only
 * after a short delay, so the tool the visitor asked for is never replaced by
 * an advert. The slot is marked as advertising, has a close button, and closes
 * on Escape or a backdrop click. Dismissing it is a supported path, not a
 * trapped one.
 */
export function AdInterstitial({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !ADSTERRA_KEY) return;

    // sessionStorage throws in Safari private mode and in sandboxed frames.
    // Storage that cannot be written must not take the page down with it.
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return;
    }

    fired.current = true;
    // Lets the UI suite tell "ad zone not configured" from "ad zone broken".
    (window as unknown as Record<string, unknown>).__DOOOTTER_INTERSTITIAL__ = true;
    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Keep the page behind the modal from scrolling under the visitor's finger.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!ADSTERRA_KEY || !open) return null;

  const request = JSON.stringify({
    key: ADSTERRA_KEY,
    format: "iframe",
    height: 250,
    width: 468,
    params: {},
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-testid="interstitial"
        className="relative w-full max-w-[640px] rounded-2xl bg-surface p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
            {label}
          </p>
          <button
            type="button"
            data-testid="interstitial-close"
            aria-label={label}
            onClick={() => setOpen(false)}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {/*
          Adsterra's own iframe tag. The container only reserves space with
          min-height: it has no overflow-hidden and no height cap, so a creative
          taller than the reservation is never clipped.
        */}
        <div id="doootter-interstitial" className="min-h-[250px] w-full">
          <script
            dangerouslySetInnerHTML={{
              __html: `atOptions = ${request};`,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var s=document.createElement('script');s.async=true;s.src='https://www.highperformanceformat.com/${ADSTERRA_KEY}/invoke.js';var p=document.getElementById('doootter-interstitial');p.parentNode.insertBefore(s,p);})();`,
            }}
          />
        </div>
      </div>
    </div>
  );
}