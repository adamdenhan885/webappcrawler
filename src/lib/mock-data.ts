export const activityData = [
  { time: "00:00", pages: 120, apis: 42 },
  { time: "03:00", pages: 186, apis: 61 },
  { time: "06:00", pages: 243, apis: 88 },
  { time: "09:00", pages: 412, apis: 154 },
  { time: "12:00", pages: 388, apis: 141 },
  { time: "15:00", pages: 521, apis: 203 },
  { time: "18:00", pages: 604, apis: 248 },
  { time: "21:00", pages: 474, apis: 187 },
];

export const payloadData = [
  { target: "/dashboard", html: 412, api: 88 },
  { target: "/reports", html: 356, api: 164 },
  { target: "/analytics", html: 288, api: 212 },
  { target: "/audience", html: 502, api: 96 },
  { target: "/billing", html: 194, api: 58 },
  { target: "/settings", html: 148, api: 34 },
];

export type LogLevel = "info" | "success" | "warn" | "error";

export const botLogs: { time: string; level: LogLevel; message: string }[] = [
  { time: "18:06:27", level: "info", message: "GET /settings/integrations -> 200 (148 KB)" },
  { time: "18:06:04", level: "success", message: "Extracted 24 audience segments from backend API" },
  { time: "18:05:41", level: "error", message: "GET /api/v2/invoices?page=2 -> 500 internal_error" },
  { time: "18:05:19", level: "info", message: "Rendering /billing with headless browser" },
  { time: "18:05:02", level: "warn", message: "GET /api/v2/segments/legacy -> 404, skipping endpoint" },
  { time: "18:04:48", level: "info", message: "DOM snapshot captured: 2411 nodes" },
  { time: "18:04:33", level: "warn", message: "Rate limited on /reports/export, backing off 30s" },
  { time: "18:04:21", level: "success", message: "Auth session established (scopes: reports.read)" },
  { time: "18:04:15", level: "info", message: "Discovered backend endpoint /api/v2/metrics" },
  { time: "18:04:12", level: "success", message: "Crawler started against analytics.target.io" },
];
