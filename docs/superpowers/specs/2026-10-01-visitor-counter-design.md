# Visitor and conversion counter — design

Date: 2026-10-01
Status: approved, not yet implemented

## Goal

Show two live numbers on the site: how many visitors the site has had in total, and how many
conversions have actually been completed. Numbers must be real, backed by our own data on the
VPS, with no third-party analytics and no cookies.

## Constraints discovered on the VPS

- `converter-dotter.ru` is a static Next.js export (`next.config.ts:4`, `output: "export"`).
- nginx 1.24 serves a flat tree from `/var/www/doootter`. No njs, no Lua, no SSI, no
  `proxy_pass` upstream. The only writable path is the ACME webroot `/var/www/certbot`.
- Available runtimes: Python 3.12.3 and systemd. No Node, no PHP-FPM on the server.
- The conversion itself runs entirely in the browser: `pdfjs-dist`, `mammoth`, `docx`, `xlsx`
  under `src/lib/converters/`. The server never sees a conversion, so conversion counting
  requires the browser to report it.
- There are currently no API routes and no `fetch` calls anywhere in `src/` other than the
  Yandex ads loader.

## Approach chosen

A small Python service on the stdlib only (no pip dependencies), bound to `127.0.0.1:8099`,
fronted by an nginx `location /api/stats` that proxies to it. State lives in one JSON file on
the VPS. This is the only option that can count conversions, since only the browser knows a
conversion succeeded, and it avoids adding a third party to the privacy text.

Rejected alternatives:

- Parsing `access.log` on a cron timer. Needs no new service, but cannot count conversions and
  lags by the timer interval.
- A third-party counter. Requires an account, a foreign domain in the privacy text, and sends
  visitor data outside our infrastructure. Explicitly declined by the user.

## API

| Endpoint | Caller | Effect |
| --- | --- | --- |
| `POST /api/stats/visit` | the page, on mount | counts the visitor once per day |
| `POST /api/stats/conversion` | the page, after a successful conversion | increments the total and the per-tool counter |
| `GET /api/stats` | `StatsCounter` | returns `{ visitors, conversions }` |

`POST` bodies are small JSON objects. `/visit` accepts an optional `locale` and `path`; the
conversion endpoint accepts an optional `tool` slug. Unknown or malformed fields are ignored,
not rejected: the counter must never break the converter.

Responses are `application/json` with `Cache-Control: no-store`, since the numbers change.

## State

File `/var/lib/doootter/stats.json`:

```json
{
  "visitors": 1248,
  "conversions": 386,
  "tools": { "pdf-to-word": 210 },
  "daily": { "2026-10-01": 41 },
  "seen": { "<sha256>": "2026-10-01" }
}
```

Writes are atomic: serialize to `stats.json.tmp`, then `os.replace`. The service writes at most
once per request, so a crash mid-write cannot truncate the file. `seen` is pruned to entries
from the last two days on every write.

## Visitor de-duplication

A visitor is identified by `sha256(salt + IP + User-Agent)`. The salt is regenerated daily and
stored in the state file, so hashes are not comparable across days. Raw IPs are never persisted;
only the hash and the date are kept, for two days, for de-duplication. No cookies, no
`localStorage`, nothing in the browser to consent to.

The consequence worth stating plainly: the visitor number is unique devices per day, summed
across days. It is an estimate, not person-level truth.

## Anti-inflation

- Reject requests whose `Origin` or `Sec-Fetch-Site` indicates another site, so a third party
  cannot inflate the numbers by embedding our endpoint.
- Rate limit to 30 requests per minute per IP.
- Cap the body at 4 KB.

## Baseline seed

The counter would otherwise start at 1 and look broken for days. On first deploy we seed
`visitors` from the existing `/var/log/nginx/doootter.access.log`, counting unique real
browsers per day: requests with status 200 for a document path, excluding `curl`,
`HeadlessChrome`, and known scanners (leakix, iisec). `conversions` starts at 0.

This is an honest estimate of traffic to date, but it is incomplete: the log does not cover the
whole life of the site, so the number should be read as "at least this many".

## Client integration

New client component `src/components/StatsCounter.tsx`, rendered as a full-width strip above the
footer on the home page and every converter page, in all five locales.

- Numbers formatted with `Intl.NumberFormat` per locale.
- Styling reuses existing tokens (`text-fg`, `text-brand`, `border-line`, `card`), so it reads
  as part of the existing design rather than a bolted-on widget.
- Before the fetch resolves, render a placeholder of the same height so the layout does not
  jump.
- If the request fails, is slow, or is blocked by an ad blocker, render nothing at all. A missing
  counter is better than a broken layout or a visible error.

Signals:

- The visit signal fires from `StatsCounter` itself on mount, so it needs no wiring elsewhere.
- The conversion signal is reported from `src/components/ConverterPanel.tsx`, right after
  `URL.createObjectURL(output.blob)` — that is, after a real successful result, not on button
  press.

The `convert-src` concern does not apply: the existing CSP in
`deploy/nginx/security-headers.conf` already allows `connect-src 'self'`.

## i18n

New `stats` section in `src/lib/i18n/types.ts` with `stats.visitors` and `stats.conversions`,
added to all five dictionaries (`en`, `ru`, `de`, `es`, `fr`). Because each dictionary is typed
as `Dictionary`, `tsc --noEmit` fails until all five are filled in.

## Privacy text

The Privacy page must disclose the counter in all five locales, or the site risks a moderation
objection: counting visits and conversions, aggregate numbers only, no cookies, hashed
identifiers retained for two days. No third-party analytics is added by this feature.

## Testing

New `scripts/verify-stats.mts` starts the service on a test port and asserts:

- repeated visits from the same IP on the same day count once
- conversions increment the total and the per-tool counter
- the state file survives a service restart
- a cross-site `Origin` is rejected
- the rate limit triggers

`scripts/verify-static.mts` gains a check that the counter markup is present in the built HTML.

Local `serve:out` has no `/api/stats`, so the counter stays hidden on `localhost:5050`. That is
expected behaviour, and the static check accounts for it.

## Deployment

- `deploy/stats/doootter-stats.py` — the service
- `deploy/stats/doootter-stats.service` — systemd unit, `Restart=always`
- `deploy/stats/install-stats.sh` — creates `/var/lib/doootter`, installs the unit, enables it
- `deploy/nginx/doootter.conf` gains `location /api/stats { proxy_pass http://127.0.0.1:8099; }`,
  and `/api/stats` must be excluded from the `try_files` fallback to the SPA-style 404

## Out of scope

- Yandex ads deployment and the remaining CSP work (`mc.yandex.com`) — tracked separately
- PDF to Word layout fidelity — tracked separately
- Per-country or per-referrer breakdowns
- A public stats page or dashboard