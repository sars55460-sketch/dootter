"use client";

import { useEffect, useState } from "react";

import { MoonIcon, SunIcon, SystemIcon } from "./icons";

type Mode = "light" | "dark" | "system";

const STORAGE_KEY = "db-theme";
const ORDER: Mode[] = ["light", "dark", "system"];

function resolve(mode: Mode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(mode: Mode) {
  const dark = resolve(mode);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* storage may be unavailable in private mode */
  }
}

export function ThemeToggle({
  labels,
}: {
  labels: { light: string; dark: string; system: string };
}) {
  const [mode, setMode] = useState<Mode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: Mode = "system";
    try {
      stored = (localStorage.getItem(STORAGE_KEY) as Mode) || "system";
    } catch {
      stored = "system";
    }
    if (!ORDER.includes(stored)) stored = "system";
    setMode(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    apply(mode);
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode, ready]);

  const next = () => {
    const index = ORDER.indexOf(mode);
    const target = ORDER[(index + 1) % ORDER.length];
    setMode(target);
  };

  const current = ready ? mode : "system";
  const title = labels[current];

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      data-mode={current}
      onClick={next}
      title={title}
      aria-label={title}
      className="btn btn-ghost size-10 !px-0 text-fg-muted hover:text-fg"
    >
      <span className={current === "light" ? "block" : "hidden"}>
        <SunIcon />
      </span>
      <span className={current === "dark" ? "block" : "hidden"}>
        <MoonIcon />
      </span>
      <span className={current === "system" ? "block" : "hidden"}>
        <SystemIcon />
      </span>
    </button>
  );
}
