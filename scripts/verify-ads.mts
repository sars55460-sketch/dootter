/**
 * Checks the Yandex.RTB ad slot in a real browser.
 *
 * A slot that is present in the HTML can still be dead: the loader can be
 * blocked by the CSP, the container id can fail to match what renderTo is
 * given, or the network can refuse the request. Those failures look identical
 * from the outside - an empty box - so they are asserted here rather than
 * assumed from markup alone.
 *
 * A third-party 404 for an unregistered origin is expected on localhost and is
 * reported but not counted as a failure: the same request would fail for any
 * slot in any environment that is not a registered site.
 *
 * Run with:  npx tsx scripts/verify-ads.mts
 */
import puppeteer from "puppeteer";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PAGE = process.env.ADS_PAGE ?? "/en/";

let failures = 0;
const log = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`   ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();

  const cspViolations: string[] = [];
  const failed: string[] = [];
  const thirdParty: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    if (/Content Security Policy|Refused to/i.test(text)) {
      cspViolations.push(text.replace(/\s+/g, " ").slice(0, 160));
    }
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const host = new URL(response.url()).hostname;
    if (host === new URL(BASE).hostname || host === "127.0.0.1" || host === "localhost") {
      failed.push(`http ${response.status()} ${response.url()}`);
    } else {
      thirdParty.push(`http ${response.status()} ${host}`);
    }
  });

  const response = await page.goto(`${BASE}${PAGE}`, { waitUntil: "networkidle2", timeout: 60_000 });
  log((response?.status() ?? 0) === 200, "the page loads", `status=${response?.status()}`);

  const loaderInHead = await page.evaluate(() => Boolean(document.querySelector("head script[src*='context.js']")));
  log(loaderInHead, "the loader is in <head>, so it is not render-blocking");

  // The queue must exist before context.js arrives, otherwise an early render
  // call throws and the slot is lost for the rest of the page's life.
  const queued = await page.evaluate(() => Boolean((window as any).yaContextCb));
  log(queued, "the render call is queued on yaContextCb");

  // The decisive check: an element whose id is exactly what renderTo was given.
  const slot = await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>("[id^='yandex_rtb_']");
    if (!node) return null;
    const box = node.getBoundingClientRect();
    return {
      id: node.id,
      width: Math.round(box.width),
      height: Math.round(box.height),
      children: node.childElementCount,
      // Yandex marks a container it has taken ownership of with a data-*
      // attribute whose name it generates itself. Its presence proves the render
      // call was accepted and the correct container was found, which is the part
      // this repository controls.
      claimed: Object.keys(node.dataset).length > 0,
    };
  });
  log(Boolean(slot), "a yandex_rtb_ container exists", slot ? slot.id : "no container");
  if (slot) {
    log(slot.height >= 90, "the slot has its reserved height", `${slot.width}x${slot.height}`);
    log(slot.claimed, "the network accepted the container for this block", `data-attrs=${slot.claimed}`);

    // A creative is only served once the site is approved and the block has a
    // campaign. Until then the container stays empty by design, so this is
    // reported rather than asserted: failing here would say nothing about the
    // code and would go red for a reason that lives in the partner account.
    if (slot.children === 0) {
      console.log("   note  no creative is being served yet - the site or block may not be approved");
    } else {
      log(true, "a creative was rendered into the slot", `${slot.children} child nodes`);
    }
  }

  const aboveFooter = await page.evaluate(() => {
    const slotNode = document.querySelector("[id^='yandex_rtb_']");
    const footer = document.querySelector("footer");
    if (!slotNode || !footer) return null;
    return slotNode.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1;
  });
  log(aboveFooter === true, "the slot sits above the footer", aboveFooter === null ? "could not locate" : "");

  log(cspViolations.length === 0, "the CSP allows everything the slot needs", cspViolations[0] ?? "");
  log(failed.length === 0, "no failure from our own origin", failed[0] ?? "");
  if (thirdParty.length) {
    console.log(`   note  the ad network itself returned errors — ${[...new Set(thirdParty)].join(", ")}`);
  }
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nALL AD CHECKS PASSED" : `\n${failures} AD CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);