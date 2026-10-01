/**
 * Crawls the running site over HTTP and checks the things a browser test cannot:
 * every localized page, unique titles and descriptions, canonical and hreflang
 * tags, JSON-LD validity, sitemap and robots contents, and every internal link
 * resolving without a 404.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LOCALES = ["en", "ru", "es", "de", "fr"];
const SLUGS = ["pdf-to-word", "word-to-pdf", "excel-to-word", "word-to-excel"];
const LEGAL = ["about", "privacy", "terms", "contact"];

let failures = 0;
const log = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`   ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

/** Not a failure, but something that has to change before the site goes live. */
const warn = (label: string, detail = "") => {
  console.log(`   warn ${label}${detail ? ` — ${detail}` : ""}`);
};

type Page = { path: string; html: string; status: number };

async function fetchPage(path: string): Promise<Page> {
  const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { path, html: await response.text(), status: response.status };
}

try {
  await fetch(`${BASE}/en/`, { redirect: "manual" });
} catch {
  console.error(`\nCannot reach ${BASE}. Start the dev server first: npm run dev`);
  process.exit(1);
}

const attr = (html: string, pattern: RegExp): string[] =>
  [...html.matchAll(pattern)].map((match) => match[1]);
const meta = (html: string, name: string) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`, "i"))?.[1] ?? "";

const expected: string[] = ["/"];
for (const locale of LOCALES) {
  expected.push(`/${locale}/`);
  for (const slug of [...SLUGS, ...LEGAL]) expected.push(`/${locale}/${slug}/`);
}

console.log(`\n== every page responds (${expected.length} paths)`);
const pages: Page[] = [];
for (const path of expected) {
  if (path === "/") {
    // next dev shadows public/index.html and 404s; the static export serves it.
    const response = await fetch(`${BASE}/`, { redirect: "manual" });
    log(
      response.status === 200 || response.status === 404,
      "root answers (static redirect or dev 404)",
      `status ${response.status}`,
    );
    continue;
  }
  const page = await fetchPage(path);
  pages.push(page);
  if (page.status !== 200) log(false, `GET ${path}`, `status ${page.status}`);
}
log(pages.every((p) => p.status === 200), `all ${pages.length} localized pages return 200`);

console.log("\n== per page metadata");
const titles = new Map<string, string>();
const descriptions = new Map<string, string>();
for (const page of pages) {
  const title = meta(page.html, "og:title") || page.html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  const description = meta(page.html, "description");
  const canonical = attr(page.html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g);
  const alternates = attr(page.html, /<link[^>]+rel="alternate"[^>]+hrefLang="([^"]+)"[^>]+href="([^"]+)"/gi);
  const htmlLang = page.html.match(/<html[^>]+lang="([^"]+)"/)?.[1] ?? "";
  const wantLang = page.path.split("/")[1];
  const path = page.path;

  log(title.length > 10, `title on ${path}`, title.slice(0, 60));
  log(description.length > 40, `description on ${path}`, `${description.length} chars`);
  log(canonical.length === 1, `canonical on ${path}`, canonical.join(",") || "missing");
  log(alternates.length === LOCALES.length, `hreflang on ${path}`, `${alternates.length} of ${LOCALES.length}`);
  log(htmlLang === wantLang, `html lang on ${path}`, htmlLang);

  if (titles.has(title)) log(false, `duplicate title`, `${path} and ${titles.get(title)} share "${title}"`);
  else titles.set(title, path);
  if (descriptions.has(description)) log(false, `duplicate description`, `${path} and ${descriptions.get(description)}`);
  else descriptions.set(description, path);
}
log(titles.size === pages.length, "every page has a unique title", `${titles.size}/${pages.length}`);
log(descriptions.size === pages.length, "every page has a unique description", `${descriptions.size}/${pages.length}`);

console.log("\n== structured data");
for (const page of pages.filter((p) => SLUGS.some((s) => p.path.includes(s)))) {
  const blocks = [...page.html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    (match) => match[1],
  );
  const types: string[] = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (item["@graph"]) types.push(...item["@graph"].map((n: { "@type": string }) => n["@type"]));
        else types.push(item["@type"]);
      }
    } catch {
      log(false, `valid JSON-LD on ${page.path}`, block.slice(0, 60));
    }
  }
  const flat = types.filter(Boolean).join(",");
  log(flat.includes("SoftwareApplication"), `SoftwareApplication on ${page.path}`, flat);
  log(flat.includes("FAQPage"), `FAQPage on ${page.path}`);
  log(flat.includes("BreadcrumbList"), `BreadcrumbList on ${page.path}`);
}
for (const page of pages.filter((p) => p.path.includes("/privacy") || p.path.includes("/terms"))) {
  log(meta(page.html, "og:type") !== "", `legal page has open graph data on ${page.path}`);
}

console.log("\n== sitemap and robots");
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
log(sitemapUrls.length === pages.length, "sitemap lists every page", `${sitemapUrls.length} of ${pages.length}`);
const alternatesInSitemap = [...sitemap.matchAll(/xhtml:link[^>]+href="([^"]+)"/g)].length;
log(alternatesInSitemap === pages.length * LOCALES.length, "sitemap carries hreflang for every page", `${alternatesInSitemap} links`);
for (const url of sitemapUrls.slice(0, 4)) {
  const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
  const response = await fetch(`${BASE}${path}`);
  log(response.status === 200, `sitemap url resolves ${path}`, `status ${response.status}`);
}
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
log(/Sitemap:/i.test(robots), "robots.txt points at the sitemap");
log(!/Disallow: \/\s*$/m.test(robots), "robots.txt does not block the whole site");

console.log("\n== security contact (RFC 9116)");
const security = await (await fetch(`${BASE}/.well-known/security.txt`)).text();
log(/^Contact:\s*\S+@\S+/m.test(security), "security.txt has a working contact field");
log(/^Expires:\s*\d{4}-\d{2}-\d{2}T[\d:.]+Z$/m.test(security), "security.txt has an ISO 8601 expiry");
log(
  new Date(security.match(/^Expires:\s*(\S+)/m)?.[1] ?? 0).getTime() > Date.now(),
  "security.txt expiry is in the future",
);
// An unreachable abuse contact is what gets a domain relisted as unresponsive, so
// a placeholder here is a real problem rather than a cosmetic one.
const placeholderContact = [...security.matchAll(/[\w.+-]+@example\.com/gi)].map((m) => m[0]);
log(placeholderContact.length === 0, "security.txt contact is a real address", placeholderContact.join(", "));

// The domain is still a placeholder until the site is pointed at one, so this is
// a warning: it must be resolved before the site is published.
const placeholderDomain = [...security.matchAll(/https?:\/\/example\.com[^\s]*/g)].map((m) => m[0]);
if (placeholderDomain.length) {
  warn("security.txt still points at the placeholder domain", placeholderDomain.join(", "));
}

// public/_headers is applied by the host, not by Next.js, so `next dev` never
// sends these. They are checked only when the crawl runs against the static
// export served by scripts/serve-out.mts, which replays the same rules.
const onStaticExport = /localhost:5050|:5050\//.test(BASE);

console.log(`\n== response headers${onStaticExport ? "" : " (skipped: not the static export)"}`);
const home = await fetch(`${BASE}/en/`, { redirect: "manual" });
const head = (name: string) => home.headers.get(name) ?? "";

if (onStaticExport) {
  const csp = head("content-security-policy");
  log(head("strict-transport-security").includes("max-age="), "HSTS present", head("strict-transport-security"));
  log(csp.length > 0, "CSP present", `${csp.length} chars`);
  log(csp.includes("frame-ancestors 'none'"), "CSP forbids framing");
  log(csp.includes("object-src 'none'"), "CSP forbids plugins");
  log(!/unsafe-eval/.test(csp), "CSP does not allow eval");
  // The only third-party origins allowed are the ad network's, and each one
  // has to be named explicitly: a wildcard would quietly widen the policy.
  const thirdParties = [...new Set([...csp.matchAll(/https?:\/\/[^;]+/g)].map((m) => m[0].trim()))];
  const allowedHosts = ["yandex.ru", "yastatic.net", "mc.yandex.com"];
  const unexpected = thirdParties.filter(
    (origin) =>
      !allowedHosts.some((host) =>
        // The ad network also opens a WebSocket, which needs its own scheme.
        ["https", "wss"].some((scheme) => origin === `${scheme}://${host}` || origin === `${scheme}://*.${host}`),
      ),
  );
  log(
    unexpected.length === 0,
    "CSP allows only the advertising origins",
    unexpected.slice(0, 4).join(", ") || thirdParties.join(" "),
  );
  log(head("x-content-type-options") === "nosniff", "nosniff present", head("x-content-type-options"));
  log(head("referrer-policy").length > 0, "referrer policy present", head("referrer-policy"));
  log(head("permissions-policy").length > 0, "permissions policy present", head("permissions-policy"));
  log(head("x-frame-options") === "DENY", "x-frame-options present", head("x-frame-options"));

  const homeHtml = await home.text();
  const scriptPath = [...homeHtml.matchAll(/\/_next\/static\/[^"]+\.js/g)][0]?.[0] ?? "";
const asset = scriptPath ? await fetch(`${BASE}${scriptPath}`, { redirect: "manual" }) : null;
log(
  (asset?.headers.get("cache-control") ?? "").includes("immutable"),
  "fingerprinted assets are cached forever",
  asset?.headers.get("cache-control") ?? scriptPath,
);
log(
  (home.headers.get("cache-control") ?? "").includes("no-cache") ||
    (home.headers.get("cache-control") ?? "").includes("must-revalidate"),
  "HTML is not cached",
  home.headers.get("cache-control") ?? "",
);
}

console.log("\n== visit and conversion counter");
// The counter ships client-rendered, so the built HTML must at least carry the
// labels and the test hook. The numbers themselves only exist once the browser
// has spoken to the counter service, which the local static server does not
// provide, so they are checked by scripts/verify-stats.mts instead.
const counterPages = pages.filter((page) => /\/[a-z]{2}\/(\w[\w-]*\/)?$/.test(page.path) && !/\/(about|privacy|terms|contact)\/$/.test(page.path));
const missingCounter = counterPages
  .filter((page) => !page.html.includes("data-testid=\"stats-counter\""))
  .map((page) => page.path);
log(
  missingCounter.length === 0,
  "the counter is present on the home and converter pages",
  missingCounter.slice(0, 4).join(", ") || `${counterPages.length} pages`);

// The numbers arrive only after hydration, so the live row cannot be checked in
// the HTML. What can be checked there is that the shipped bundle contains the
// client code for it: if the ping call or the row's test hook were dropped from
// StatsCounter, every page would still build and every static check above would
// still pass, and the feature would be silently gone in production.
const chunks = await Promise.all(
  [
    ...new Set(
      counterPages
        .flatMap((page) => attr(page.html, /<script[^>]+src="([^"]+\.js)"/g))
        .filter((src) => src.startsWith("/"))
        .slice(0, 24),
    ),
  ].map(async (src) => ({ src, body: await (await fetch(`${BASE}${src}`)).text() })),
);
const bundle = chunks.map((chunk) => chunk.body).join("\n");
log(bundle.includes("/ping"), "the shipped bundle pings the counter service");
log(bundle.includes("stats-online"), "the shipped bundle renders the live row");

console.log("\n== RSYA compliance");
// Rules 2.1.4 and 3.10.2c of the participation rules forbid clipping, filtering
// or otherwise altering how a Yandex creative is displayed. An `overflow-hidden`
// ancestor on the slot container silently truncates any creative taller than the
// reserved height, which is exactly what those clauses prohibit, and nothing else
// in this suite would notice.
const adPages = pages.filter((page) => page.html.includes("yandex_rtb_R-A-20151624-1"));
const clippedAds = adPages
  .filter((page) => {
    const slotAt = page.html.indexOf('id="yandex_rtb_R-A-20151624-1"');
    return /overflow-hidden|clip-path|\bh-\[[0-9]+px\]/.test(page.html.slice(Math.max(0, slotAt - 400), slotAt));
  })
  .map((page) => page.path);
log(
  adPages.length > 0 && clippedAds.length === 0,
  "no ad slot is clipped or height-capped",
  clippedAds.slice(0, 4).join(", ") || `${adPages.length} pages`);

// Rule 2.1.5 permits marking a placement as advertising, and the label has to be
// visible text: an aria-label alone satisfies nobody, least of all a moderator
// checking that the placement is marked. Scripts are stripped first, otherwise
// the check passes on the serialized dictionary in the RSC payload and proves
// nothing about what a reader sees.
const visibleText = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, " ");
const unmarkedAds = adPages
  .filter((page) => !/>[^<]*(Advertisement|Реклама|Anzeige|Publicidad|Publicité)[^<]*</.test(visibleText(page.html)))
  .map((page) => page.path);
log(
  adPages.length > 0 && unmarkedAds.length === 0,
  "every ad slot carries a visible advertising label",
  unmarkedAds.slice(0, 4).join(", ") || `${adPages.length} pages`);

// Rule 1.1.g rejects resources with misleading content. The contact page asks
// readers to report bugs, so an address has to be reachable from the page itself
// rather than only from security.txt.
const contactPages = pages.filter((page) => /\/contact\/$/.test(page.path));
const noAddress = contactPages
  .filter((page) => !/mailto:[^\s"'<>]+@/.test(page.html))
  .map((page) => page.path);
log(
  contactPages.length === LOCALES.length && noAddress.length === 0,
  "the contact page shows a working email address",
  noAddress.slice(0, 4).join(", ") || `${contactPages.length} pages`);

console.log("\n== internal links");
const linkTargets = new Set<string>();
for (const page of pages) {
  for (const href of attr(page.html, /<a[^>]+href="([^"]+)"/g)) {
    if (href.startsWith("/") && !href.startsWith("//")) linkTargets.add(href.split("#")[0]);
  }
}
const broken: string[] = [];
for (const href of [...linkTargets].sort()) {
  const response = await fetch(`${BASE}${href}`, { redirect: "manual" });
  if (response.status >= 400) broken.push(`${href} (${response.status})`);
}
log(linkTargets.size > 40, "the site has a real navigation", `${linkTargets.size} distinct internal links`);
log(broken.length === 0, "no broken internal links", broken.slice(0, 5).join(", ") || "all resolve");

console.log("\n== brand leftovers");
const staleBrands = ["docbridge", "myapp", "create-next-app", "untitled"];
for (const brand of staleBrands) {
  const hits = pages.filter((p) => new RegExp(brand, "i").test(p.html)).map((p) => p.path);
  log(hits.length === 0, `no "${brand}" references in the rendered HTML`, hits.slice(0, 3).join(", "));
}
// A leftover placeholder domain would point canonical URLs and the sitemap at
// someone else's site, which is a silent and expensive mistake.
const placeholderHosts = [
  ...new Set(
    pages
      .flatMap((p) => [...p.html.matchAll(/https?:\/\/(?:www\.)?example\.com/gi)].map((m) => m[0])),
  ),
];
if (placeholderHosts.length) {
  warn("pages still point at example.com", [...new Set(pages.filter((p) => /example\.com/i.test(p.html)).map((p) => p.path))].slice(0, 3).join(", "));
}

console.log(failures === 0 ? "\nALL STATIC CHECKS PASSED" : `\n${failures} STATIC CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
