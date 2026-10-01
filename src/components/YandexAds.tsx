const BLOCK_ID = "R-A-20151624-1";

// Yandex's own documentation renders into a container whose id is the block id
// prefixed with `yandex_rtb_`. renderTo is an element lookup, so pointing it at
// a bare block id silently finds nothing and the slot stays empty.
const CONTAINER_ID = `yandex_rtb_${BLOCK_ID}`;

const RENDER = `window.yaContextCb.push(function(){Ya.Context.AdvManager.render({blockId:'${BLOCK_ID}',renderTo:'${CONTAINER_ID}'})});`;

/**
 * Renders a single Yandex.RTB ad slot.
 *
 * Placement is above the footer, never next to the file picker: the ad script is
 * third-party and anything that delays the converter costs conversions.
 *
 * Nothing wraps or constrains the creative beyond its own width. Rules 2.1.4 and
 * 3.10.2c of the RSYA participation rules forbid clipping, filtering or otherwise
 * altering how the ad is displayed, and an `overflow-hidden` ancestor silently
 * truncates any creative taller than the reserved space. The min-height is a
 * reservation, not a cap: the container grows with the creative.
 *
 * The render call is pushed onto the loader queue rather than executed inline,
 * so it is safe regardless of whether context.js has finished loading. If the
 * script is blocked (offline, CSP, ad blocker) the container stays empty and the
 * page is untouched, which is the intended failure mode.
 *
 * The label is rendered as a sibling above the slot, never on top of it: rule
 * 2.1.5 allows marking placements as advertising, and marking it inside the slot
 * would overlap the creative, which is exactly what the site placement rules
 * prohibit.
 */
export function YandexAds({ label }: { label: string }) {
  return (
    <aside
      aria-label={label}
      className="mx-auto w-full max-w-[970px] px-4 sm:px-6"
    >
      <p className="text-center text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
        {label}
      </p>
      <div id={CONTAINER_ID} className="min-h-[90px] w-full" />
      <script dangerouslySetInnerHTML={{ __html: RENDER }} />
    </aside>
  );
}