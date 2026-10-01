import type { FaqItem } from "@/lib/i18n";

export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {items.map((item, index) => (
          <details key={index} className="group" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold marker:hidden hover:bg-surface-2">
              <span>{item.q}</span>
              <span className="shrink-0 text-fg-subtle transition-transform group-open:rotate-45">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-fg-muted">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
