# Dootter

A document converter that runs entirely in the browser. Files are never uploaded:
no server, no storage, no queue. PDF, Word and Excel conversions happen on the
visitor's own device.

Live at `*.pages.dev` via Cloudflare Pages, five languages: English, Russian,
Spanish, German, French.

## Converters

| Converter | How it works | Output quality |
| --- | --- | --- |
| PDF → Word | pdf.js extracts positioned text, rebuilt into a real `.docx` | Selectable text, real paragraphs and tables |
| Word → PDF | docx-preview renders the document, then two paths | **Download**: page images, exact layout. **Print**: real text, embedded fonts |
| Excel → Word | xlsx read into cells, emitted as a Word table | Table repeats its header row on every page |
| Word → Excel | mammoth extracts tables into a workbook | One sheet, one Word table |

Word → PDF has two buttons on purpose. **Download** produces a PDF that looks
exactly like the document, but the pages are images. **Print** opens the browser
print dialog, where *Save as PDF* produces a smaller file with real, selectable
text and the original fonts embedded.

## Stack

- **Next.js 15**, static export (`output: "export"`) — the build is a folder of files
- **React 19**, **Tailwind CSS 4**
- **TypeScript** in strict mode
- **pdfjs-dist**, **mammoth**, **docx-preview**, **docx**, **xlsx**, **jspdf**, **html2canvas**

No backend, no database, no API keys, no third-party scripts.

## Getting started

```bash
npm ci
npm run dev        # http://localhost:3000
```

The site is routed by locale, so the root path returns 404 in development. Open
`/en/` or `/ru/`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/` |
| `npm run serve:out` | Serves `out/` on port 5050, replaying the real host's headers |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Everything below, in order |
| `npm run test:convert` | Round-trips every converter in Node via linkedom |
| `npm run test:browser` | Real Chromium: uploads a file, converts, downloads the result |
| `npm run test:fidelity` | Verifies page size, page count, fonts and text in the output PDF |
| `npm run test:static` | Crawls every page: metadata, canonical, hreflang, JSON-LD, sitemap, headers |
| `npm run test:ui` | Full UI audit across five locales, desktop and mobile |

The browser suites need Chromium; Puppeteer downloads it on install. Point them
at a different origin with `BASE_URL=https://your-domain npm run test:static`.

## Deployment

The build output is `out/`, so any static host works. Cloudflare Pages is the
current target: see [docs/cloudflare.md](docs/cloudflare.md) for the DNS steps
and the recommended WAF settings.

Security headers live in [`public/_headers`](public/_headers) rather than in
`next.config.ts`, because a static export cannot send response headers itself.
That file is the only place they can live, and `scripts/serve-out.mts` parses it
so the local server behaves like production.

`public/.well-known/security.txt` publishes an abuse contact, which is what makes
a report actionable instead of ignored.

## Project layout

```
src/app/[locale]/       routes: home, converters, legal pages
src/lib/converters/     one module per conversion, plus a shared table planner
src/lib/i18n/           dictionary types and five translations
src/components/         UI
public/_headers         Cloudflare Pages response headers
scripts/                test suites and the local static server
```

Adding a converter means writing one module in `src/lib/converters/`, registering
it in `registry.ts`, and adding its strings to the five dictionaries.

## Privacy

Conversion is client-side. There is no endpoint that accepts a file, which means
there is no server-side copy to leak, subpoena or retain. See
`src/app/[locale]/privacy/page.tsx` for the published policy.

## Third-party assets

Two files in `public/` are vendored rather than bundled, because they are loaded
at runtime by a dependency:

- `public/pdf.worker.min.mjs` — the pdf.js worker, Apache-2.0, from `pdfjs-dist`
- `public/fonts/Roboto-*.ttf` — Roboto, Apache-2.0, from `@expo-google-fonts/roboto`

Everything else comes from npm at install time.

