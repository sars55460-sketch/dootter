/**
 * Yandex.RTB loader, rendered once per document in <head>.
 *
 * The script is `async`, so it does not block rendering, but that also means it
 * may not have run by the time an ad block asks to render. `yaContextCb` is the
 * queue Yandex provides for exactly this: blocks push a callback that runs once
 * the loader is ready, in registration order. The inline initialiser has to come
 * before the loader tag for that queue to exist.
 *
 * Kept as a server component so it lands in the static HTML. A client component
 * would inject this after hydration, which is too late for crawlers that do not
 * execute JavaScript, and pointless for everyone else since the queue makes the
 * timing safe either way.
 */

const QUEUE_INIT = "window.yaContextCb=window.yaContextCb||[];";

export function YandexAdsLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: QUEUE_INIT }} />
      <script src="https://yandex.ru/ads/system/context.js" async />
    </>
  );
}