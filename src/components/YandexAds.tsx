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
 * third-party and anything that delays the converter costs conversions. The
 * container is fixed to a width with a min-height so the page does not reflow
 * once the creative loads.
 *
 * The render call is pushed onto the loader queue rather than executed inline,
 * so it is safe regardless of whether context.js has finished loading. If the
 * script is blocked (offline, CSP, ad blocker) the container stays empty and the
 * page is untouched, which is the intended failure mode.
 *
 * The `aria-label` and visually hidden text are not decorative: they describe
 * the slot to assistive technology, which cannot see into the ad iframe.
 */
export function YandexAds({ label }: { label: string }) {
  return (
    <aside
      aria-label={label}
      className="mx-auto w-full max-w-[970px] px-4 sm:px-6"
    >
      <div className="overflow-hidden">
        <div id={CONTAINER_ID} className="min-h-[90px] w-full" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: RENDER }} />
    </aside>
  );
}