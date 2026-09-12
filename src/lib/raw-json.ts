import type { CrawlerLog } from "@/lib/crawler-logs.functions";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** Parse the raw_json text column into a JSON value. Tolerates markdown fences. */
export function parseRawJson(raw: string | null): JsonValue | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as JsonValue;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Flatten nested objects/arrays into dotted key -> primitive string map. */
export function flatten(
  value: JsonValue | null,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (value === null || value === undefined) {
    if (prefix) out[prefix] = "";
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }
  if (isRecord(value)) {
    for (const [k, v] of Object.entries(value)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  out[prefix || "value"] = String(value);
  return out;
}

export function humanizeKey(key: string): string {
  const last = key.split(".").slice(-2).join(" ");
  return last
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

export type Metric = { key: string; label: string; value: number };

/** Pull numeric scalar fields (including counts of arrays) out of the AI payload. */
export function extractMetrics(value: JsonValue | null, limit = 4): Metric[] {
  const metrics: Metric[] = [];

  const walk = (node: JsonValue, path: string, depth: number) => {
    if (depth > 3) return;
    if (Array.isArray(node)) {
      if (path) {
        metrics.push({
          key: `${path}.__count`,
          label: `${humanizeKey(path)} (count)`,
          value: node.length,
        });
      }
      return;
    }
    if (isRecord(node)) {
      for (const [k, v] of Object.entries(node)) {
        walk(v, path ? `${path}.${k}` : k, depth + 1);
      }
      return;
    }
    if (typeof node === "number" && Number.isFinite(node)) {
      metrics.push({ key: path, label: humanizeKey(path), value: node });
    } else if (typeof node === "string" && /^\d+(\.\d+)?$/.test(node.trim())) {
      metrics.push({ key: path, label: humanizeKey(path), value: Number(node) });
    }
  };

  if (value !== null) walk(value, "", 0);
  return metrics.slice(0, limit);
}

export type Series = {
  key: string;
  label: string;
  nameKey: string;
  valueKeys: string[];
  rows: Record<string, string | number>[];
};

/** Find the first array-of-objects with numeric fields and shape it for Recharts. */
export function extractSeries(value: JsonValue | null): Series | null {
  let found: Series | null = null;

  const walk = (node: JsonValue, path: string, depth: number) => {
    if (found || depth > 3) return;
    if (Array.isArray(node)) {
      const objects = node.filter(isRecord);
      if (objects.length >= 2) {
        const keys = Object.keys(objects[0]!);
        const numericKeys = keys.filter((k) =>
          objects.every((o) => typeof o[k] === "number" || /^\d+(\.\d+)?$/.test(String(o[k] ?? ""))),
        );
        const labelKey = keys.find((k) => !numericKeys.includes(k)) ?? keys[0];
        if (numericKeys.length > 0 && labelKey) {
          found = {
            key: path || "series",
            label: humanizeKey(path || "Extracted series"),
            nameKey: labelKey,
            valueKeys: numericKeys.slice(0, 2),
            rows: objects.slice(0, 24).map((o) => {
              const row: Record<string, string | number> = {
                [labelKey]: String(o[labelKey] ?? ""),
              };
              for (const k of numericKeys.slice(0, 2)) row[k] = Number(o[k] ?? 0);
              return row;
            }),
          };
        }
      }
      for (const item of node) walk(item, path, depth + 1);
      return;
    }
    if (isRecord(node)) {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k, depth + 1);
    }
  };

  if (value !== null) walk(value, "", 0);
  return found;
}

/** Records captured per day, oldest first — for the activity chart. */
export function activityByDay(logs: CrawlerLog[]) {
  const buckets = new Map<string, { runs: number; ok: number }>();
  for (const log of logs) {
    const date = log.timestamp ? new Date(log.timestamp) : null;
    if (!date || Number.isNaN(date.getTime())) continue;
    const key = date.toISOString().slice(0, 10);
    const entry = buckets.get(key) ?? { runs: 0, ok: 0 };
    entry.runs += 1;
    if ((log.status_code ?? 0) >= 200 && (log.status_code ?? 0) < 300) entry.ok += 1;
    buckets.set(key, entry);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day: day.slice(5), runs: v.runs, ok: v.ok }));
}

export function toCsv(logs: CrawlerLog[]): string {
  const flattened: Record<string, string>[] = logs.map((log) => ({
    id: String(log.id),
    timestamp: log.timestamp ?? "",
    target_url: log.target_url,
    status_code: log.status_code === null ? "" : String(log.status_code),
    data_type: log.data_type ?? "",
    ...Object.fromEntries(
      Object.entries(flatten(parseRawJson(log.raw_json))).map(([k, v]) => [`raw_json.${k}`, v]),
    ),
    ...(parseRawJson(log.raw_json) === null && log.raw_json
      ? { raw_json_text: log.raw_json }
      : {}),
  }));

  const headers = [...new Set(flattened.flatMap((row) => Object.keys(row)))];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.map(escape).join(","),
    ...flattened.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
