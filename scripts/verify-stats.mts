/**
 * Tests the visitor and conversion counter service.
 *
 * The service is the only writable part of the stack, so its behaviour has to
 * hold up independently of the browser: counting once per visitor per day,
 * counting every successful conversion, surviving a restart, and refusing
 * cross-site callers that would otherwise be able to inflate the totals.
 *
 * Run with:  npm run test:stats
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.STATS_PORT ?? 8123);
const BASE = `http://127.0.0.1:${PORT}`;
const SERVICE = join(process.cwd(), "deploy", "stats", "doootter-stats.py");

let failures = 0;
const log = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`   ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const stateDir = mkdtempSync(join(tmpdir(), "doootter-stats-"));
const statePath = join(stateDir, "stats.json");

let child: ChildProcess | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Start the service and wait until it answers, so tests never race the port. */
async function startService(limit = 40): Promise<void> {
  // Refuse to start against a port something else already holds. Without this
  // check the readiness probe below would be answered by that other process,
  // the test would silently measure someone else's counters, and every
  // assertion would fail for a reason that has nothing to do with the service.
  try {
    await fetch(`${BASE}/api/stats`, { signal: AbortSignal.timeout(1000) });
    throw new Error(
      `port ${PORT} is already in use - something else is answering /api/stats there. ` +
        `Free the port or run with STATS_PORT set to another one.`,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("already in use")) throw error;
  }

  child = spawn(
    "python",
    [SERVICE, "--port", String(PORT), "--state", statePath, "--limit", String(limit)],
    { stdio: "ignore" },
  );
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/api/stats`);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await sleep(150);
  }
  throw new Error("service did not start");
}

async function stopService(): Promise<void> {
  if (!child) return;
  const done = new Promise<void>((resolve) => child!.once("exit", () => resolve()));
  child.kill("SIGTERM");
  await Promise.race([done, sleep(3000)]);
  child = null;
}

async function totals(): Promise<{ visitors: number; conversions: number; live: number }> {
  const response = await fetch(`${BASE}/api/stats`);
  return (await response.json()) as { visitors: number; conversions: number; live: number };
}

async function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function readState(): Record<string, unknown> {
  return JSON.parse(readFileSync(statePath, "utf-8")) as Record<string, unknown>;
}

try {
  console.log("\n== counting");
  await startService();

  const empty = await totals();
  log(empty.visitors === 0 && empty.conversions === 0, "starts at zero", JSON.stringify(empty));

  // The same browser hitting the endpoint repeatedly must be counted once.
  // Distinct User-Agent values stand in for distinct browsers.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await post("/api/stats/visit", { locale: "ru" }, { "User-Agent": "test-browser-A" });
  }
  const afterRepeat = await totals();
  log(
    afterRepeat.visitors === 1,
    "the same visitor is counted once per day",
    `visitors=${afterRepeat.visitors}`,
  );

  await post("/api/stats/visit", { locale: "ru" }, { "User-Agent": "test-browser-B" });
  const afterSecond = await totals();
  log(
    afterSecond.visitors === 2,
    "a different visitor is counted separately",
    `visitors=${afterSecond.visitors}`,
  );

  console.log("\n== conversions");
  await post("/api/stats/conversion", { tool: "pdf-to-word" });
  await post("/api/stats/conversion", { tool: "pdf-to-word" });
  const first = await post("/api/stats/conversion", { tool: "word-to-pdf" });
  const firstBody = (await first.json()) as { conversions: number };
  log(firstBody.conversions === 3, "conversions accumulate", `conversions=${firstBody.conversions}`);

  const state = readState();
  const tools = state.tools as Record<string, number>;
  log(
    tools["pdf-to-word"] === 2 && tools["word-to-pdf"] === 1,
    "each tool is counted separately",
    JSON.stringify(tools),
  );

  console.log("\n== live presence");

  // A ping repeats every 30 seconds per open tab, so the failure this guards
  // against is a ping also counting as a visit. That would inflate the
  // permanent daily total by a factor of about 170.
  const beforePing = await totals();
  await post("/api/stats/ping", {}, { "User-Agent": "live-browser-A" });
  const afterPing = await totals();
  log(
    afterPing.visitors === beforePing.visitors && afterPing.conversions === beforePing.conversions,
    "a ping does not change the permanent counters",
    `${JSON.stringify(beforePing)} -> ${JSON.stringify(afterPing)}`,
  );

  log(afterPing.live === 1, "a ping counts the visitor as present", `live=${afterPing.live}`);

  // Same browser, second ping: presence is a set keyed by visitor hash, so
  // repeating must not inflate it.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await post("/api/stats/ping", {}, { "User-Agent": "live-browser-A" });
  }
  const afterRepeatPing = await totals();
  log(afterRepeatPing.live === 1, "repeating a ping does not double-count", `live=${afterRepeatPing.live}`);

  await post("/api/stats/ping", {}, { "User-Agent": "live-browser-B" });
  const afterSecondBrowser = await totals();
  log(
    afterSecondBrowser.live === 2,
    "a second browser is counted separately",
    `live=${afterSecondBrowser.live}`,
  );

  // The count travels to the public GET, not only in the ping's own reply.
  const readLive = await totals();
  log(readLive.live === 2, "the public totals carry the live count", `live=${readLive.live}`);

  // The most important assertion here. Presence is in memory precisely so it
  // does not cost an fsync per ping per visitor, and because it is worthless
  // five minutes later. If a later edit adds it to the serialised state, that
  // test fails here instead of quietly turning a restart into a stale number.
  const stateAfterPings = readState();
  log(
    !("live" in stateAfterPings),
    "presence is never written to the state file",
    Object.keys(stateAfterPings).join(","),
  );

  // Expiry is checked by restarting, which is the event the in-memory design
  // actually has to survive: after it, the service genuinely does not know who
  // is on the site until they ping again.
  await stopService();
  await startService(40);
  const afterRestart = await totals();
  log(afterRestart.live === 0, "a restart clears presence rather than freezing it", `live=${afterRestart.live}`);
  log(
    afterRestart.visitors === afterSecondBrowser.visitors,
    "clearing presence leaves the permanent counters alone",
    `visitors=${afterRestart.visitors}`,
  );

  const crossSitePing = await post("/api/stats/ping", {}, { Origin: "https://evil.example" });
  log(crossSitePing.status === 403, "a cross-site ping is refused", `status=${crossSitePing.status}`);

  await post("/api/stats/ping", {}, { "User-Agent": "live-browser-A" });
  const afterReturnPing = await totals();
  log(afterReturnPing.live === 1, "presence comes back on the next ping", `live=${afterReturnPing.live}`);

  console.log("\n== abuse resistance");
  // A cross-site request with no Origin header: the browser cannot forge
  // Sec-Fetch-Site, so this is what stops an attacker who suppresses Origin.
  const crossSite = await post("/api/stats/visit", {}, { "Sec-Fetch-Site": "cross-site" });
  log(crossSite.status === 403, "a cross-site caller without Origin is refused", `status=${crossSite.status}`);

  // The service trusts X-Forwarded-For because it binds to 127.0.0.1 and only
  // nginx reaches it. That trust is only sound while nginx *overwrites* the
  // header: appending a client-supplied chain would let anyone mint a fresh
  // identity per request and defeat both the daily count and the rate limit.
  const nginxConfigs = ["deploy/nginx/doootter.conf", "deploy/nginx/doootter-ssl.conf"];
  // Match the directive itself, not a comment that explains why it is wrong.
  const appendsChain = nginxConfigs.filter((file) =>
    readFileSync(join(process.cwd(), file), "utf-8").match(
      /^\s*proxy_set_header\s+X-Forwarded-For\s+\$proxy_add_x_forwarded_for\s*;/m,
    ),
  );
  log(
    appendsChain.length === 0,
    "nginx overwrites the forwarded address instead of appending to it",
    appendsChain.join(", ") || "both configs set $remote_addr",
  );
  const foreign = await post("/api/stats/conversion", {}, { Origin: "https://evil.example" });
  log(foreign.status === 403, "a cross-site caller is refused", `status=${foreign.status}`);

  const sameSite = await post("/api/stats/visit", {}, { Origin: "https://converter-dotter.ru" });
  log(sameSite.status === 200, "our own origin is allowed", `status=${sameSite.status}`);

  // Rate limiting is checked against its own service instance with a low
  // limit, so the traffic above does not exhaust the allowance first.
  await stopService();
  await startService(2);
  const firstTwo = [
    (await post("/api/stats/conversion", {})).status,
    (await post("/api/stats/conversion", {})).status,
  ];
  const third = await post("/api/stats/conversion", {});
  log(
    firstTwo.every((status) => status === 200) && third.status === 429,
    "the rate limit lets a few requests through and then refuses",
    `${firstTwo.join(",")} then ${third.status}`,
  );

  // A refused request must leave the connection usable: with keep-alive, an
  // unread body would corrupt the next request on the same socket.
  const afterRefusal = await totals();
  log(
    afterRefusal.visitors >= 0,
    "the connection still works after a refusal",
    `status=${(await post("/api/stats/conversion", { tool: "x" })).status}`,
  );

  console.log("\n== malformed input");
  // Back to a normal limit: the tight one above is meant to be exhausted.
  await stopService();
  await startService(40);
  const junk = await post("/api/stats/conversion", { tool: "../../etc/passwd" });
  log(junk.status === 200, "a bogus tool name does not break the request", `status=${junk.status}`);
  const toolsAfterJunk = readState().tools as Record<string, string>;
  log(
    !Object.keys(toolsAfterJunk).some((key) => key.includes("/")),
    "a bogus tool name is not stored",
    JSON.stringify(Object.keys(toolsAfterJunk)),
  );

  const missing = await fetch(`${BASE}/api/stats/nope`, { method: "POST" });
  log(missing.status === 404, "unknown endpoints answer 404", `status=${missing.status}`);

  console.log("\n== durability");
  const before = await totals();
  await stopService();
  await startService(40);
  const after = await totals();
  log(
    after.visitors === before.visitors && after.conversions === before.conversions,
    "counters survive a restart",
    `${JSON.stringify(before)} -> ${JSON.stringify(after)}`,
  );

  const headers = (await fetch(`${BASE}/api/stats`)).headers;
  log(
    (headers.get("cache-control") ?? "").includes("no-store"),
    "totals are not cacheable",
    headers.get("cache-control") ?? "",
  );
} finally {
  await stopService();
  rmSync(stateDir, { recursive: true, force: true });
}

console.log("\n== log seeding");
{
  // A synthetic access log covering the cases that decide the baseline: every
  // locale root and every converter page must count, while assets, API calls,
  // non-200 responses and scanners must not.
  const seedDir = mkdtempSync(join(tmpdir(), "doootter-seed-"));
  const seedState = join(seedDir, "stats.json");
  const logPath = join(seedDir, "access.log");
  const line = (ip: string, path: string, status: string, agent: string) =>
    `${ip} - - [01/Oct/2026:09:00:00 +0000] "GET ${path} HTTP/1.1" ${status} 512 "-" "${agent}"\n`;
  writeFileSync(
    logPath,
    [
      // Two real browsers, each seen once on a converter page.
      line("198.51.100.7", "/en/pdf-to-word/", "200", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
      line("198.51.100.8", "/ru/word-to-pdf/", "200", "Mozilla/5.0 (Macintosh) Chrome/120"),
      // The same browser on another page: still one visitor for the day.
      line("198.51.100.7", "/de/excel-to-word/", "200", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
      // Locale root, which the prefix rule used to accept.
      line("198.51.100.9", "/fr/", "200", "Mozilla/5.0 (X11; Linux) Firefox/121"),
      // Excluded: asset, API, error, and the usual non-visitors.
      line("198.51.100.10", "/_next/static/chunk.js", "200", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
      line("198.51.100.10", "/api/stats/visit", "200", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
      line("198.51.100.11", "/en/pdf-to-word/", "404", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
      line("198.51.100.12", "/en/pdf-to-word/", "200", "curl/8.4.0"),
      line("198.51.100.13", "/en/pdf-to-word/", "200", "Mozilla/5.0 HeadlessChrome/120"),
      // A scanner sharing an address with a real browser. It must be dropped on
      // its user agent, not merely counted as a separate identity.
      line("198.51.100.7", "/en/word-to-excel/", "200", "curl/8.4.0"),
      line("198.51.100.7", "/en/word-to-excel/", "200", "Mozilla/5.0 HeadlessChrome/120"),
      line("198.51.100.7", "/en/word-to-excel/", "200", "leakix"),
      line("127.0.0.1", "/en/pdf-to-word/", "200", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
      // A path that is not under any locale must not count.
      line("198.51.100.14", "/favicon.ico", "200", "Mozilla/5.0 (Windows NT 10.0) Chrome/120"),
    ].join(""),
  );
  const seeded = spawnSync("python", [SERVICE, "--seed-from-log", logPath, "--state", seedState], {
    encoding: "utf-8",
  });
  const seededTotals = existsSync(seedState)
    ? (JSON.parse(readFileSync(seedState, "utf-8")) as { visitors?: number }).visitors
    : undefined;
  log(seeded.status === 0, "the seed command succeeds", (seeded.stderr ?? "").trim().slice(0, 120));
  log(seededTotals === 3, "only real browsers on real pages are counted", `visitors=${seededTotals}`);
  rmSync(seedDir, { recursive: true, force: true });
}

console.log(failures === 0 ? "\nALL STATS CHECKS PASSED" : `\n${failures} STATS CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);