"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { runConversion } from "@/lib/converters";
import { getConverterMeta } from "@/lib/converters/registry";
import { ConversionError, formatBytes, type ConvertResult, type Orientation } from "@/lib/converters/types";
import { t } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  FileIcon,
  PrintIcon,
  SwapIcon,
  UploadIcon,
} from "./icons";

type Status = "idle" | "working" | "done" | "error";

type Copy = Dictionary["ui"];

function errorMessage(error: unknown, copy: Copy, ext: string): { title: string; body: string } {
  if (error instanceof ConversionError) {
    switch (error.code) {
      case "scanned":
        return { title: copy.scannedPdf, body: copy.scannedPdfHint };
      case "no-text":
        return { title: copy.noTextPdf, body: copy.scannedPdfHint };
      case "password":
        return { title: copy.encryptedPdf, body: error.message };
      case "unsupported":
        return { title: copy.unsupportedFile.replace("{ext}", ext), body: error.message };
      case "empty":
        return { title: copy.errorTitle, body: copy.emptyFile };
      case "too-large":
        return { title: copy.errorTitle, body: copy.tooLarge };
      case "no-tables":
        return { title: copy.errorTitle, body: copy.noTables };
      default:
        return { title: copy.errorTitle, body: error.message || copy.errorTitle };
    }
  }
  return { title: copy.errorTitle, body: String((error as Error)?.message || copy.errorTitle) };
}

export function ConverterPanel({
  converterId,
  locale,
  copy,
  showOrientation = false,
}: {
  converterId: "pdfToWord" | "wordToPdf" | "excelToWord" | "wordToExcel";
  locale: Locale;
  copy: Copy;
  showOrientation?: boolean;
}) {
  const meta = getConverterMeta(converterId);
  const accept = meta.accepts.map((ext) => `.${ext}`).join(",");

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<{ title: string; body: string } | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  /**
   * Revoking the object URL straight after the click aborts the download that
   * Chrome is still streaming, so the file never lands. Give it time to finish.
   */
  const releaseUrl = useCallback((url: string | null) => {
    if (!url) return;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, []);

  useEffect(() => {
    return () => {
      releaseUrl(objectUrl.current);
    };
  }, [releaseUrl]);

  const reset = useCallback(() => {
    releaseUrl(objectUrl.current);
    objectUrl.current = null;
    setFile(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }, [releaseUrl]);

  const pick = useCallback(
    (next: File | null) => {
      if (!next) return;
      const extension = next.name.split(".").pop()?.toLowerCase() || "";
      if (!meta.accepts.includes(extension)) {
        setError({
          title: copy.unsupportedFile.replace("{ext}", meta.accepts.join(", ").toUpperCase()),
          body: `${next.name}`,
        });
        setStatus("error");
        return;
      }
      setError(null);
      setResult(null);
      setFile(next);
      setStatus("idle");
    },
    [copy.unsupportedFile, meta.accepts],
  );

  const convert = useCallback(async () => {
    if (!file || status === "working") return;
    setStatus("working");
    setProgress(12);
    setError(null);
    releaseUrl(objectUrl.current);
    objectUrl.current = null;

    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(88, value + Math.round(Math.random() * 9 + 3)));
    }, 260);

    try {
      const output = await runConversion(converterId, file, {
        orientation,
        notices:
          converterId === "excelToWord"
            ? {
                tooWide: (columns) => t(copy.tableTooLargeNotice, { n: columns }),
                willSplit: (pages) => t(copy.tableWillSplit, { n: pages }),
              }
            : undefined,
      });
      objectUrl.current = URL.createObjectURL(output.blob);
      setResult(output);
      setProgress(100);
      setStatus("done");
    } catch (thrown) {
      setError(errorMessage(thrown, copy, meta.accepts.join(", ").toUpperCase()));
      setStatus("error");
    } finally {
      window.clearInterval(timer);
    }
  }, [converterId, copy, file, meta.accepts, orientation, releaseUrl, status]);

  const copyLink = async () => {
    const url = `${window.location.origin}/${locale}/${meta.slug}/`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="card overflow-hidden p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-1.5 text-sm font-bold text-brand">
          {meta.fromLabel}
        </div>
        <span className="text-fg-subtle">
          <SwapIcon />
        </span>
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-1.5 text-sm font-bold text-fg">
          {meta.toLabel}
        </div>
        <span className="ml-auto text-xs font-medium text-fg-subtle">
          {meta.accepts.map((e) => `.${e}`).join(" · ")} &rarr; .{meta.produces.ext}
        </span>
      </div>

      {file && status !== "done" ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-brand">
            <FileIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{file.name}</p>
            <p className="text-xs text-fg-subtle">
              {formatBytes(file.size)} &middot; {copy.processingLocally}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="btn btn-ghost size-9 !px-0 text-fg-subtle hover:text-fg"
            aria-label={copy.remove}
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      ) : null}

      {status !== "done" ? (
        <div
          data-testid="dropzone"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          aria-label={copy.drop}
          className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
            dragging
              ? "border-brand bg-brand-soft"
              : "border-line-strong bg-surface-2/40 hover:border-brand/60 hover:bg-surface-2"
          }`}
        >
          <span
            className={`grid size-14 place-items-center rounded-2xl transition-transform ${
              dragging ? "scale-110 bg-brand text-brand-fg" : "bg-surface text-brand group-hover:scale-105"
            }`}
          >
            <UploadIcon className="size-7" />
          </span>
          <div>
            <p className="text-base font-semibold">{copy.drop}</p>
            <p className="mt-1 text-sm text-fg-subtle">{copy.browse}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => pick(event.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{copy.resultReady}</p>
              <p className="truncate text-sm text-fg-muted">{result?.filename}</p>
              <p className="mt-0.5 text-xs text-fg-subtle">
                {copy.resultSize}: {result ? formatBytes(result.blob.size) : ""} &middot;{" "}
                {copy.processingLocally}
              </p>
            </div>
          </div>

          {result?.warnings.length ? (
            <ul className="mt-4 space-y-2">
              {result.warnings.map((warning, index) => (
                <li
                  key={index}
                  className="flex gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
                >
                  <AlertIcon className="mt-0.5 size-4 shrink-0" />
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href={objectUrl.current ?? "#"}
              download={result?.filename}
              data-testid="download-link"
              className="btn btn-primary h-11 px-5"
              onClick={() => window.setTimeout(reset, 400)}
            >
              <DownloadIcon />
              {copy.download}
            </a>
            {result?.print ? (
              <button
                type="button"
                data-testid="print-button"
                data-filename={result.filename}
                onClick={() => result.print?.()}
                className="btn btn-ghost h-11 px-5"
              >
                <PrintIcon />
                {copy.print}
              </button>
            ) : null}
            <button type="button" data-testid="start-over" onClick={reset} className="btn btn-ghost h-11 px-5">
              {copy.startOver}
            </button>
            <button type="button" onClick={copyLink} className="btn btn-ghost h-11 px-4">
              {copied ? copy.linkCopied : copy.copyLink}
            </button>
          </div>
        </div>
      )}

      {showOrientation && status !== "done" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            {copy.orientation}
          </span>
          {(["auto", "portrait", "landscape"] as Orientation[]).map((value) => (
            <button
              key={value}
              type="button"
              data-testid={`orientation-${value}`}
              onClick={() => setOrientation(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                orientation === value
                  ? "bg-brand text-brand-fg"
                  : "bg-surface-2 text-fg-muted hover:bg-surface-3 hover:text-fg"
              }`}
            >
              {value === "auto"
                ? copy.orientationAuto
                : value === "portrait"
                  ? copy.orientationPortrait
                  : copy.orientationLandscape}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/8 p-4">
          <span className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400">
            <AlertIcon />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-rose-700 dark:text-rose-300">{error.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{error.body}</p>
          </div>
        </div>
      ) : null}

      {file && status !== "done" ? (
        <div className="mt-5">
          <button
            type="button"
            data-testid="convert-button"
            onClick={convert}
            disabled={status === "working"}
            className="btn btn-primary h-12 w-full text-[15px]"
          >
            {status === "working" ? (
              <>
                <Spinner />
                {copy.converting} &middot; {progress}%
              </>
            ) : (
              <>
                <DownloadIcon />
                {copy.convert}
              </>
            )}
          </button>
          {status === "working" ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
          <p className="mt-3 text-center text-xs text-fg-subtle">{copy.privacyNote}</p>
        </div>
      ) : null}

      {status === "idle" && !file ? (
        <p className="mt-4 text-center text-xs text-fg-subtle">{copy.privacyNote}</p>
      ) : null}
    </div>
  );
}

function CopyGlyph() {
  return null;
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="spin size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
