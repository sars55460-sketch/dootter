/**
 * Reads Cloudflare Pages' _headers file so the local static server answers with
 * exactly the headers the real host will send. Without this, the security
 * headers would never be exercised by the tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Rule = { test: RegExp; headers: Record<string, string> };

const ROOT = join(process.cwd(), "out");

/** Cloudflare matches patterns against the request path, and `*` is a wildcard. */
function toRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\//g, "(?:.*/)?")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

export function loadHeaders(): Rule[] {
  const file = join(ROOT, "_headers");
  if (!existsSync(file)) return [];

  const rules: Rule[] = [];
  let current: string[] = [];

  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // A line that is not indented starts a new rule.
    if (!/^\s/.test(raw)) {
      if (current.length) rules.push(makeRule(current));
      current = [line.trim()];
    } else {
      current.push(line.trim());
    }
  }
  if (current.length) rules.push(makeRule(current));

  return rules;

  function makeRule(lines: string[]): Rule {
    const headers: Record<string, string> = {};
    for (const line of lines.slice(1)) {
      const colon = line.indexOf(":");
      if (colon > 0) headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
    return { test: toRegExp(lines[0]), headers };
  }
}

/** Later rules win, matching how Cloudflare applies them. */
export function headersFor(rules: Rule[], path: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rule of rules) {
    if (rule.test.test(path)) Object.assign(result, rule.headers);
  }
  return result;
}
