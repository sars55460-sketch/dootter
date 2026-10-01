/**
 * End-to-end check in a real browser: uploads a file to the live page, clicks
 * Convert, then takes the result — a Download link, or a printed page for Word
 * to PDF — and verifies a real file arrives. This is the only way to catch bugs
 * that exist in the browser build of a dependency (mammoth, pdf.js, docx-preview)
 * while Node-based tests pass.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

import puppeteer from "puppeteer";

const SAMPLES = join(process.cwd(), "tmp-samples");
const DOWNLOADS = join(process.cwd(), "tmp-downloads");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LOCALE = process.env.LOCALE ?? "en";

const CASES = [
  { slug: "pdf-to-word", file: "sample.pdf", expect: /\.docx$/i, prints: false },
  { slug: "word-to-pdf", file: "sample.docx", expect: /\.pdf$/i, prints: false },
  { slug: "excel-to-word", file: "sample.xlsx", expect: /\.docx$/i, prints: false },
  { slug: "word-to-excel", file: "sample.docx", expect: /\.xlsx$/i, prints: false },
];

let failures = 0;
const log = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`   ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  rmSync(DOWNLOADS, { recursive: true, force: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    for (const testCase of CASES) {
      console.log(`\n== ${testCase.file} -> /${LOCALE}/${testCase.slug}/`);
      rmSync(DOWNLOADS, { recursive: true, force: true });
      mkdirSync(DOWNLOADS, { recursive: true });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 1000 });

      const problems: string[] = [];
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("response", (response) => {
        if (response.status() >= 400) problems.push(`http ${response.status()} ${response.url()}`);
      });
      // The site ships a Content-Security-Policy through public/_headers. A
      // blocked script, worker or blob URL shows up only as a console error, and
      // the conversion would fail in ways that are hard to trace, so every
      // violation is collected and reported as a test failure.
      page.on("console", (message) => {
        const text = message.text();
        if (/Content Security Policy|Refused to/i.test(text)) {
          problems.push(`csp: ${text.replace(/\s+/g, " ").slice(0, 200)}`);
        }
      });

      const client = await page.createCDPSession();
      await client.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DOWNLOADS });

      const response = await page.goto(`${BASE}/${LOCALE}/${testCase.slug}/`, {
        waitUntil: "networkidle2",
        timeout: 90_000,
      });
      log(Boolean(response?.ok()), "page loads", `status ${response?.status()}`);

      const input = await page.$("input[type=file]");
      if (!input) {
        log(false, "file input is present", "converter panel did not render — is the dev server up?");
        await page.close();
        continue;
      }
      log(true, "file input is present");
      await input.uploadFile(join(SAMPLES, testCase.file));
      await wait(600);

      const picked = await page.evaluate(() => {
        const el = document.querySelector("input[type=file]") as HTMLInputElement | null;
        return el?.files?.length ?? -1;
      });
      log(picked === 1, "file is picked up by the page", `files=${picked}`);

      const clickedConvert = await page.evaluate(() => {
        const button = document.querySelector<HTMLButtonElement>('[data-testid="convert-button"]');
        if (!button) return false;
        button.click();
        return true;
      });
      log(clickedConvert, "convert button clicked");

      let downloadHref = "";
      for (let attempt = 0; attempt < 90; attempt += 1) {
        await wait(1000);
        const found = await page.evaluate(() => {
          const link = document.querySelector<HTMLAnchorElement>('[data-testid="download-link"]');
          if (link) return link.getAttribute("download") ?? "ready";
          const box = document.querySelector(".text-rose-700, .dark\\:text-rose-300");
          return box ? `ERROR:${box.textContent ?? ""}` : "";
        });
        if (found.startsWith("ERROR:")) {
          log(false, "conversion succeeds", found.slice(0, 200));
          break;
        }
        if (found) {
          downloadHref = found;
          break;
        }
      }

      if (!downloadHref) {
        log(false, "result appears with a download link");
      } else {
        log(true, "result appears with a download link", downloadHref);
        log(/\.(docx|pdf|xlsx)$/i.test(downloadHref), "result filename extension", downloadHref);

        const before = new Set(readdirSync(DOWNLOADS));
        await page.evaluate(() => {
          const link = document.querySelector<HTMLAnchorElement>('[data-testid="download-link"]');
          link?.click();
        });

        let file = "";
        for (let attempt = 0; attempt < 30; attempt += 1) {
          await wait(500);
          const fresh = readdirSync(DOWNLOADS).filter(
            (name) => !before.has(name) && !name.endsWith(".crdownload"),
          );
          if (fresh.length) {
            file = join(DOWNLOADS, fresh[0]);
            break;
          }
        }
        if (file) {
          const size = statSync(file).size;
          const head = readFileSync(file).subarray(0, 5).toString();
          log(size > 2000, "file downloads", `${size} B`);
          log(
            downloadHref.toLowerCase().endsWith(".pdf") ? head === "%PDF-" : head !== "%PDF-",
            "the downloaded file is what it claims to be",
            head === "%PDF-" ? "%PDF- header" : "zip/ooxml container",
          );
          log(testCase.expect.test(downloadHref), "extension matches the converter", downloadHref);
        } else {
          log(false, "file downloads", `nothing arrived, dir: ${readdirSync(DOWNLOADS).join(",")}`);
        }
      }

      if (problems.length) log(false, "no runtime errors", problems.slice(0, 2).join(" | ").slice(0, 240));
      else log(true, "no runtime errors");

      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log(failures === 0 ? "\nBROWSER CHECKS PASSED" : `\n${failures} BROWSER CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

await run();
