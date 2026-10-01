# Document Converter — Design Spec

Date: 2026-09-28
Status: Approved by user

## Goal

A multilingual, light/dark themed document converter website. Four conversions, all running
entirely in the browser (files never leave the device). SEO-first architecture: static HTML for
every page so the site can rank in the top results of Google for converter queries.

## Conversions

| From -> To  | Pipeline                                                                                                  | Notes                                                    |
|-------------|-----------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| PDF -> DOCX | `pdfjs-dist` (text items with coordinates) -> paragraph/heading/table reconstruction -> `docx`            | Text-layer PDFs only. Scanned/image-only PDFs are detected and reported honestly. |
| DOCX -> PDF | `mammoth` (docx -> sanitized HTML) -> block model -> `jspdf` + `jspdf-autotable`, embedded Roboto TTF     | Text stays real text (selectable), Cyrillic safe. Page breaks + repeated table headers. |
| XLSX -> DOCX| `xlsx` (SheetJS) -> table model -> `docx`                                                                    | Fit -> split -> notice, see below.                       |
| DOCX -> XLSX| `mammoth` -> HTML tables -> `xlsx` workbook                                                                 | One sheet per table, first row as header, numbers/dates typed. |

All heavy libraries are dynamically imported only when the user starts a conversion.

## Excel -> Word: the "table too large" rule

1. **Fit** — column widths are computed from content, then clamped so the total fits the A4/Letter
   usable width. Orientation flips to landscape when that helps. If content still overflows, font
   size and cell padding are scaled down.
2. **Split** — the first row is marked as a repeating header row (`w:tblHeader`) and rows are allowed
   to break across pages, so Word paginates the table by itself and repeats the header on every page.
3. **Notice** — when the table cannot be made to fit (too many columns, or a single row/cell taller
   than the page), a visible notice paragraph is written into the document above the table:
   `Table is too large to fit on one page (N columns) — it has been split across pages / may be
   clipped in Word.` The UI also reports the estimated page count before conversion.

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- `output: 'export'` — pure static site, deployable to Vercel / Cloudflare Pages / Netlify
- No backend, no API keys, no cost

## Design

- Light: snow white base, indigo -> violet gradient accents
- Dark: `#0B0F1A` base, glass cards with subtle glow
- Inter (self-hosted), radius 14-20px, soft shadows, gradient mesh hero
- Three theme modes: light / dark / system, persisted in `localStorage`, applied by a blocking
  inline script so there is no flash
- Responsive from 360px

## Languages

EN (default), RU, ES, DE, FR. Route prefix `/[locale]/...`, EN also served at the root as the
canonical default. Dictionary-driven UI, no library.

## SEO

- One landing page per converter per language: 4 x 5 = 20 pages, each with unique
  title / description / canonical / Open Graph
- `hreflang` alternates for all 5 languages, `sitemap.xml` with alternates, `robots.txt`
- JSON-LD: `SoftwareApplication`, `FAQPage` (real questions rendered on the page), `BreadcrumbList`,
  `WebSite` + `SearchAction`
- `/about`, `/privacy`, `/terms`, `/contact` for trust signals
- Performance: static HTML, self-hosted font, lazy WASM/JS, no client-side blocking of LCP

## Deliverable check

Dev server running, all four conversions verified on real files, production build green, generated
HTML inspected for SEO tags.
