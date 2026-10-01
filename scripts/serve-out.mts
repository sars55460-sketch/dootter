/** Minimal static server for the exported site in out/, used to test the real artifact. */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

import { headersFor, loadHeaders } from "./headers.mts";

const ROOT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 5050);

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
