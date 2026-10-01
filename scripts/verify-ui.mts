/**
 * Audits every user-facing mechanic in a real browser: conversion, drag and
 * drop, wrong file types, empty files, image-only PDFs, orientation switching,
 * start over, theme switching, language switching, persistence after reload and
 * mobile layout. Fails loudly on any HTTP error or uncaught exception.
 *
 * Every section gets its own browser: Chromium serialises downloads per browser
 * process, so one stuck transfer would otherwise poison the following cases.
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

import { unzipSync } from "fflate";
import puppeteer from "puppeteer";

const SAMPLES = join(process.cwd(), "tmp-samples");
const DOWNLOADS = join(process.cwd(), "tmp-downloads");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DESKTOP = { width: 1280, height: 1000 };

let failures = 0;
let group = "";
const only = process.env.ONLY ?? "";
const log = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`   ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};
const section = (name: string) => {
  if (only && !name.toLowerCase().includes(only.toLowerCase())) return false;
  group = name;
  console.log(`\n== ${name}`);
  return true;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reads word/document.xml out of a .docx so tests can assert on real content. */
async function readDocxXml(path: string): Promise<string> {
  try {
    const files = unzipSync(new Uint8Array(readFileSync(path)));
    const entry = Object.entries(files).find(([name]) => name === "word/document.xml");
    return entry ? new TextDecoder().decode(entry[1]) : "";
  } catch {
    return "";
  }
}

function watch(page: puppeteer.Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  // Ad requests belong to a third party we do not control: the network answers
// 404 on localhost because the origin is not a registered site, and it would
// answer the same way for any ad slot in any environment. Only our own responses
// are treated as failures. The host is compared rather than a substring,
// because an ad URL carries our own address inside its query string.
const ownHosts = new Set([new URL(BASE).hostname, "127.0.0.1", "localhost"]);
const isOwnRequest = (url: string) => ownHosts.has(new URL(url).hostname);
page.on("response", (response) => {
  if (response.status() >= 400 && isOwnRequest(response.url())) {
    problems.push(`http ${response.status()} ${response.url()}`);
  }
});
  // Content-Security-Policy violations surface as console errors and would
  // otherwise look like an ordinary broken converter.
  page.on("console", (message) => {
    const text = message.text();
    if (/Content Security Policy|Refused to/i.test(text)) {
      problems.push(`csp: ${text.replace(/\s+/g, " ").slice(0, 200)}`);
    }
  });
  return problems;
}

async function withBrowser<T>(fn: (browser: puppeteer.Browser) => Promise<T>): Promise<T> {
  rmSync(DOWNLOADS, { recursive: true, force: true });
  mkdirSync(DOWNLOADS, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

async function openPage(browser: puppeteer.Browser, path: string) {
  const page = await browser.newPage();
  await page.setViewport(DESKTOP);
  const problems = watch(page);
  const client = await page.createCDPSession();
  await client.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DOWNLOADS });
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 90_000 });
  return { page, problems, status: response?.status() ?? 0 };
}

async function waitForResult(page: puppeteer.Page) {
  for (let i = 0; i < 90; i += 1) {
    await wait(1000);
    const state = await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>('[data-testid="download-link"]');
      // A print action is recorded here, before the download resets the panel.
      if (link) {
        return {
          done: true,
          name: link.getAttribute("download") ?? "",
          prints: Boolean(document.querySelector('[data-testid="print-button"]')),
        };
      }
      const error = document.querySelector(".text-rose-700");
      if (error) return { done: false, name: `ERROR:${(error.textContent ?? "").slice(0, 160)}` };
      return { done: false, name: "" };
    });
    if (state.done) return { ok: true, name: state.name, prints: state.prints };
    if (state.name.startsWith("ERROR:")) return { ok: false, reason: state.name.slice(6) };
  }
  return { ok: false, reason: "timed out after 90s" };
}

async function upload(page: puppeteer.Page, sample: string) {
  const input = await page.$("input[type=file]");
  if (!input) return false;
  await input.uploadFile(join(SAMPLES, sample));
  await wait(500);
  return true;
}

async function clickConvert(page: puppeteer.Page) {
  await page.evaluate(() =>
    (document.querySelector('[data-testid="convert-button"]') as HTMLButtonElement)?.click(),
  );
}

async function convertWith(page: puppeteer.Page, sample: string) {
  if (!(await upload(page, sample))) return { ok: false, reason: "no file input on the page" };
  await clickConvert(page);
  return waitForResult(page);
}

async function downloadVia(page: puppeteer.Page) {
  for (let i = 0; i < 30; i += 1) {
    const found = await page.evaluate(() =>
      Boolean(document.querySelector('[data-testid="download-link"]')),
    );
    if (found) break;
    await wait(500);
  }
  const before = new Set(readdirSync(DOWNLOADS));
  const started = Date.now();
  const link = await page.evaluate(() => {
    const anchor = document.querySelector<HTMLAnchorElement>('[data-testid="download-link"]');
    if (!anchor) return null;
    anchor.click();
    return { href: anchor.href, name: anchor.getAttribute("download") ?? "" };
  });
  if (!link) {
    const snapshot = await page.evaluate(() => {
      const error = document.querySelector(".text-rose-700");
      return [
        document.querySelector('[data-testid="dropzone"]') ? "dropzone" : "no-dropzone",
        error ? `error:${(error.textContent ?? "").slice(0, 60)}` : "no-error",
      ].join(" ");
    });
    return { ok: false, detail: `no download link (${snapshot})` };
  }

  for (let i = 0; i < 50; i += 1) {
    await wait(200);
    const fresh = readdirSync(DOWNLOADS).filter(
      (n) => !before.has(n) && !n.endsWith(".crdownload") && !n.endsWith(".tmp"),
    );
    if (fresh.length) {
      const path = join(DOWNLOADS, fresh[0]);
      return { ok: true, name: fresh[0], path, size: statSync(path).size, ms: Date.now() - started, link };
    }
  }
  return { ok: false, detail: `nothing arrived, dir=${JSON.stringify(readdirSync(DOWNLOADS))}` };
}

async function dropFile(page: puppeteer.Page, sample: string) {
  const base64 = readFileSync(join(SAMPLES, sample)).toString("base64");
  const name = sample.split("\\").pop() ?? sample;
  return page.evaluate(
    (payload: string, fileName: string) => {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const transfer = new DataTransfer();
      transfer.items.add(new File([bytes], fileName));
      const zone = document.querySelector('[data-testid="dropzone"]');
      if (!zone) return false;
      zone.dispatchEvent(new DragEvent("dragover", { bubbles: true, dataTransfer: transfer }));
      zone.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: transfer }));
      return true;
    },
    base64,
    name,
  );
}

const converters = [
  { slug: "pdf-to-word", sample: "sample.pdf", ext: ".docx", alsoPrints: false },
  // Word to PDF can be downloaded as a file and printed, so both are checked.
  { slug: "word-to-pdf", sample: "sample.docx", ext: ".pdf", alsoPrints: true },
  { slug: "excel-to-word", sample: "sample.xlsx", ext: ".docx", alsoPrints: false },
  { slug: "word-to-excel", sample: "sample.docx", ext: ".xlsx", alsoPrints: false },
];

try {
  await fetch(`${BASE}/en/`, { redirect: "manual" });
} catch {
  console.error(`\nCannot reach ${BASE}. Start the dev server first: npm run dev`);
  process.exit(1);
}

// Compile every route before timing anything: a cold next dev compiles on the
// first request, which otherwise eats into the conversion timeout.
for (const locale of ["en", "ru"]) {
  for (const item of converters) {
    await fetch(`${BASE}/${locale}/${item.slug}/`).catch(() => undefined);
  }
  await fetch(`${BASE}/${locale}/`).catch(() => undefined);
}

// Fetching the HTML does not compile the client chunks, and each converter pulls
// its library in with a dynamic import that a cold dev server only builds on the
// first real conversion. That build can take longer than the conversion timeout,
// so every converter is run once here and thrown away.
if (!only) {
  console.log("\n-- warming up the converters (results are discarded)");
  await withBrowser(async (browser) => {
    for (const item of converters) {
      const { page } = await openPage(browser, `/en/${item.slug}/`);
      const result = await convertWith(page, item.sample);
      log(result.ok, `warmup ${item.slug}`, result.ok ? result.name : result.reason);
      await page.close();
    }
  });
}

// ------------------------------------------------------------------ conversions
for (const locale of ["en", "ru"]) {
  for (const item of converters) {
    if (!section(`${locale}: ${item.sample} -> ${item.slug}`)) continue;
    await withBrowser(async (browser) => {
      const { page, problems, status } = await openPage(browser, `/${locale}/${item.slug}/`);
      log(status === 200, "page loads", `status ${status}`);
      const result = await convertWith(page, item.sample);
      log(result.ok, "conversion finishes", result.ok ? result.name : result.reason);
      if (result.ok) {
        log(result.name.toLowerCase().endsWith(item.ext), "correct output type", result.name);
        const file = await downloadVia(page);
        log(file.ok, "file downloads", file.ok ? `${file.name} ${file.size} B in ${file.ms} ms` : file.detail);
        if (file.ok) {
          log(file.size > 2000, "downloaded file has content", `${file.size} B`);
          const head = readFileSync(file.path).subarray(0, 5).toString();
          log(
            result.name.toLowerCase().endsWith(".pdf") ? head === "%PDF-" : head !== "%PDF-",
            "the download is a real file of the promised type",
            head === "%PDF-" ? "%PDF- header" : "zip/ooxml container",
          );
        }
        if (item.alsoPrints) {
          log(result.prints, "a separate print action is offered next to the download");
        }
      }
      log(problems.length === 0, "no HTTP or runtime errors", problems.slice(0, 2).join(" | "));
      await page.close();
    });
  }
}

// ------------------------------------------------------- drag and drop + reset
if (section("drag and drop, download, start over")) {
  await withBrowser(async (browser) => {
    const { page, problems } = await openPage(browser, "/en/word-to-pdf/");
    log(await dropFile(page, "sample.docx"), "drop event dispatched");
    await wait(700);
    log(
      await page.evaluate(() => Boolean(document.querySelector('[data-testid="convert-button"]'))),
      "dropped file is accepted",
    );
    await clickConvert(page);
    const result = await waitForResult(page);
    log(result.ok, "conversion after drop", result.ok ? result.name : result.reason);
    if (result.ok) {
      const file = await downloadVia(page);
      log(file.ok, "file downloads", file.ok ? `${file.name} ${file.size} B in ${file.ms} ms` : file.detail);
      if (file.ok) {
        log(file.size > 2000, "downloaded file has content", `${file.size} B`);
        log(file.link.href.startsWith("blob:"), "download uses an object URL", file.link.href.slice(0, 28));
        log(result.prints, "a separate print action is offered next to the download");
      }
    }
    log(problems.length === 0, "no HTTP or runtime errors", problems.slice(0, 2).join(" | "));

    await page.reload({ waitUntil: "networkidle2" });
    await upload(page, "sample.docx");
    await clickConvert(page);
    await waitForResult(page);
    await page.evaluate(() =>
      (document.querySelector<HTMLButtonElement>('[data-testid="start-over"]'))?.click(),
    );
    await wait(600);
    const reset = await page.evaluate(() => ({
      dropzone: Boolean(document.querySelector('[data-testid="dropzone"]')),
      download: Boolean(document.querySelector('[data-testid="download-link"]')),
      print: Boolean(document.querySelector('[data-testid="print-button"]')),
      convert: Boolean(document.querySelector('[data-testid="convert-button"]')),
    }));
    log(
      reset.dropzone && !reset.download && !reset.print && !reset.convert,
      "start over returns to an empty dropzone",
      JSON.stringify(reset),
    );
    await page.close();
  });
}

// -------------------------------------------------------------- error handling
if (section("error handling")) {
  await withBrowser(async (browser) => {
    const { page } = await openPage(browser, "/en/word-to-pdf/");
    await upload(page, "sample.xlsx");
    const wrongType = await page.evaluate(() =>
      (document.querySelector(".text-rose-700")?.textContent ?? "").slice(0, 120),
    );
    log(wrongType.length > 0, "unsupported file type is explained", wrongType);
    const recovery = await page.evaluate(() => ({
      dropzone: Boolean(document.querySelector('[data-testid="dropzone"]')),
      convert: Boolean(document.querySelector('[data-testid="convert-button"]')),
    }));
    log(recovery.dropzone, "a rejected file can be swapped for another", JSON.stringify(recovery));
    log(!recovery.convert, "a rejected file cannot be converted", JSON.stringify(recovery));

    await page.reload({ waitUntil: "networkidle2" });
    await upload(page, "empty.docx");
    const empty = await convertWith(page, "empty.docx");
    log(!empty.ok, "empty file is rejected", empty.ok ? `produced ${empty.name}` : empty.reason);
    await page.close();
  });
}

if (section("image-only PDF")) {
  await withBrowser(async (browser) => {
    const { page } = await openPage(browser, "/en/pdf-to-word/");
    const scanned = await convertWith(page, "scanned.pdf");
    log(!scanned.ok, "image-only PDF is reported", scanned.ok ? `produced ${scanned.name}` : scanned.reason);
    if (!scanned.ok) {
      log(/text|scan|текст|скан/i.test(scanned.reason), "message names the missing text layer", scanned.reason);
    }
    await page.close();
  });
}

// ----------------------------------------------------------------- orientation
if (section("orientation switch (excel to word)")) {
  const modes = await withBrowser(async (browser) => {
    const { page } = await openPage(browser, "/en/excel-to-word/");
    const list = await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .map((b) => (b.textContent ?? "").trim())
        .filter((t) => /auto|portrait|landscape|авто|книжн|альбом/i.test(t)),
    );
    await page.close();
    return list;
  });
  log(modes.length >= 3, "three orientation options are offered", modes.join(" | "));

  // A fresh browser per mode: Chromium serialises downloads and a second
  // transfer in the same process can stall behind the first one.
  const runMode = async (pattern: string, label: string) =>
    withBrowser(async (browser) => {
      const { page } = await openPage(browser, "/en/excel-to-word/");
      const clicked = await page.evaluate((source: string) => {
        const re = new RegExp(source, "i");
        const button = [...document.querySelectorAll("button")].find((b) => re.test((b.textContent ?? "").trim()));
        button?.click();
        return Boolean(button);
      }, pattern);
      if (!clicked) {
        log(false, `${label}: mode button exists`);
        return null;
      }
      await wait(400);
      const result = await convertWith(page, "sample.xlsx");
      if (!result.ok) {
        log(false, `${label}: conversion finishes`, result.reason);
        return null;
      }
      const file = await downloadVia(page);
      if (!file.ok) {
        log(false, `${label}: file downloads`, file.detail);
        return null;
      }
      const kept = join(DOWNLOADS, `${label}.docx`);
      copyFileSync(file.path, kept);
      const xml = await readDocxXml(kept);
      log(xml.length > 0, `${label}: file is a readable docx`, `${file.size} B`);
      await page.close();
      return { size: file.size, xml, page: xml.match(/<w:pgSz[^>]*\/>/)?.[0] ?? "no pgSz" };
    });

  const portrait = await runMode("portrait|книжн", "portrait");
  const landscape = await runMode("landscape|альбом", "landscape");
  if (portrait && landscape) {
    log(!/w:orient="landscape"/.test(portrait.xml), "portrait mode gives a portrait page", portrait.page);
    log(/w:orient="landscape"/.test(landscape.xml), "landscape mode gives a landscape page", landscape.page);
    log(portrait.size !== landscape.size, "the two files differ", `${portrait.size} B vs ${landscape.size} B`);
  }
}

// ----------------------------------------------------------------------- theme
if (section("theme switching")) {
  await withBrowser(async (browser) => {
    const { page } = await openPage(browser, "/en/");
    const currentMode = () =>
      page.evaluate(
        () => document.querySelector<HTMLButtonElement>('[data-testid="theme-toggle"]')?.dataset.mode ?? "",
      );
    const cycle = async () => {
      await page.evaluate(() =>
        document.querySelector<HTMLButtonElement>('[data-testid="theme-toggle"]')?.click(),
      );
      await wait(400);
      return currentMode();
    };
    const themeState = () =>
      page.evaluate(() => ({
        stored: localStorage.getItem("db-theme") ?? "",
        dark: document.documentElement.classList.contains("dark"),
        colorScheme: document.documentElement.style.colorScheme,
      }));

    const start = await page.evaluate(() => ({
      mode: document.querySelector<HTMLButtonElement>('[data-testid="theme-toggle"]')?.dataset.mode ?? "",
      stored: localStorage.getItem("db-theme") ?? "",
      dark: document.documentElement.classList.contains("dark"),
    }));
    log(["light", "dark", "system"].includes(start.mode), "theme toggle reports a mode", JSON.stringify(start));

    const light = await cycle();
    const afterLight = await themeState();
    log(
      light === "light" && afterLight.stored === "light" && !afterLight.dark && afterLight.colorScheme === "light",
      "light theme applies",
      `${light} ${JSON.stringify(afterLight)}`,
    );

    const dark = await cycle();
    const afterDark = await themeState();
    log(
      dark === "dark" && afterDark.stored === "dark" && afterDark.dark && afterDark.colorScheme === "dark",
      "dark theme applies",
      `${dark} ${JSON.stringify(afterDark)}`,
    );

    const system = await cycle();
    log(system === "system", "cycle returns to system", system);

    await page.reload({ waitUntil: "networkidle2" });
    const afterReload = await page.evaluate(() => ({
      stored: localStorage.getItem("db-theme") ?? "",
      mode: document.querySelector<HTMLButtonElement>('[data-testid="theme-toggle"]')?.dataset.mode ?? "",
    }));
    log(afterReload.stored === "system", "theme survives a reload", JSON.stringify(afterReload));
    await page.close();
  });
}

// ---------------------------------------------------------------------- locale
if (section("language switching")) {
  await withBrowser(async (browser) => {
    const { page } = await openPage(browser, "/en/pdf-to-word/");
    const before = await page.evaluate(() => location.pathname);
    await page.evaluate(() => document.querySelector('[data-testid="locale-toggle"]')?.click());
    await wait(300);
    log(await page.evaluate(() => Boolean(document.querySelector('[role="menu"]'))), "language menu opens");
    await page.evaluate(() => {
      const item = [...document.querySelectorAll('[role="menuitem"]')].find((el) =>
        (el.textContent ?? "").includes("Русский"),
      ) as HTMLElement | undefined;
      item?.click();
    });
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60_000 }).catch(() => undefined);
    const after = await page.evaluate(() => ({
      path: location.pathname,
      lang: document.documentElement.lang,
      stored: localStorage.getItem("db-locale") ?? "",
      h1: document.querySelector("h1")?.textContent ?? "",
    }));
    log(after.path.startsWith("/ru/"), "keeps the page and switches language", `${before} -> ${after.path}`);
    log(after.lang === "ru", "html lang attribute follows", after.lang);
    log(after.stored === "ru", "language is remembered", after.stored);
    log(after.h1.length > 0, "page still has a heading", after.h1.slice(0, 50));

    await page.goto(`${BASE}/en/`, { waitUntil: "networkidle2" });
    const home = await page.evaluate(() => ({
      switcher: Boolean(document.querySelector('[data-testid="locale-toggle"]')),
      converterLinks: [...document.querySelectorAll<HTMLAnchorElement>('a[href*="-to-"]')]
        .map((a) => new URL(a.href).pathname)
        .filter((p) => p.startsWith("/en/")),
    }));
    log(home.switcher, "language switcher renders on the home page");
    log(home.converterLinks.length >= 4, "home page links to all four converters", home.converterLinks.join(", "));
    await page.close();
  });
}

// ---------------------------------------------------------------------- mobile
if (section("mobile layout")) {
  await withBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 800, isMobile: true });
    const problems = watch(page);
    for (const path of ["/en/", "/ru/excel-to-word/", "/fr/privacy/"]) {
      const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 60_000 });
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      log(response?.status() === 200, `page loads on ${path}`, `status ${response?.status()}`);
      log(
        overflow.scroll <= overflow.client + 2,
        `no horizontal overflow on ${path}`,
        `${overflow.scroll} vs ${overflow.client}`,
      );
    }
    log(problems.length === 0, "no HTTP or runtime errors on mobile", problems.slice(0, 2).join(" | "));
    await page.close();
  });
}

rmSync(DOWNLOADS, { recursive: true, force: true });
console.log(
  failures === 0 ? "\nALL UI CHECKS PASSED" : `\n${failures} UI CHECK(S) FAILED (last: ${group})`,
);
process.exit(failures === 0 ? 0 : 1);
