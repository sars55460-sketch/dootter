/** Minimal static server for the exported site in out/, used to test the real artifact. */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, request as httpRequest } from "node:http";
import { extname, join, normalize } from "node:path";

import { headersFor, loadHeaders } from "./headers.mts";

const ROOT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 5050);

// The counter service is proxied on production by nginx. Locally there is no
// nginx, so the same routes are forwarded to a service started by the test
// harness. Without this the counter would 404 and the browser tests would fail
// on requests the site is expected to make.
const STATS_UPSTREAM = process.env.STATS_UPSTREAM ?? "";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

// Cloudflare Pages applies public/_headers to every response, so the local
// server does the same. The CSP is then exercised by the browser tests instead
// of only existing in a file nobody reads.
const rules = loadHeaders();

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname.startsWith("/api/stats")) {
    if (!STATS_UPSTREAM) {
      // No counter service in this environment. Answer the shape the site
      // expects so the page settles into a defined state instead of erroring,
      // while making it obvious the numbers are not real.
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify({ visitors: 0, conversions: 0 }));
      return;
    }
    const proxied = httpRequest(
      `${STATS_UPSTREAM}${url.pathname}${url.search}`,
      { method: request.method, headers: { ...request.headers, host: STATS_UPSTREAM } },
      (upstreamResponse) => {
        response.writeHead(upstreamResponse.statusCode ?? 502, {
          "content-type": upstreamResponse.headers["content-type"] ?? "application/json",
          "cache-control": "no-store",
        });
        upstreamResponse.pipe(response);
      },
    );
    proxied.on("error", () => {
      response.writeHead(502, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "stats upstream unavailable" }));
    });
    request.pipe(proxied);
    return;
  }
  // normalize() returns Windows separators here, so the request path is put back
  // into URL form before it is matched against the _headers rules and joined
  // onto the export root.
  const requested = `/${normalize(decodeURIComponent(url.pathname))
    .replace(/\\/g, "/")
    .replace(/^(\.\.\/)+/, "")
    .replace(/^\/+/, "")}`.replace(/\/$/, "/");
  const target = requested === "/" ? "index.html" : requested.slice(1);
  let file = join(ROOT, target);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    const withIndex = join(ROOT, target, "index.html");
    file = existsSync(withIndex) ? withIndex : join(ROOT, "404.html");
  }
  const type = TYPES[extname(file)] ?? "application/octet-stream";
  const status = file.endsWith("404.html") ? 404 : 200;
  // no-store is the safety net for paths the _headers rules do not cover; the
  // rules come last so their own cache-control wins wherever it is set. The
  // lookup is case-insensitive because the rules spell it Cache-Control.
  const h = headersFor(rules, requested);
  const hasCacheControl = Object.keys(h).some((name) => name.toLowerCase() === "cache-control");
  response.writeHead(status, {
    "content-type": type,
    ...(hasCacheControl ? {} : { "cache-control": "no-store" }),
    ...h,
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`serving out/ on http://localhost:${PORT}`));
