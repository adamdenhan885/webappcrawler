export type CrawlRow = {
  id: string;
  timestamp: string;
  url: string;
  method: "GET" | "POST";
  status: number;
  type: "Frontend" | "Backend";
  sizeKb: number;
  payload: unknown;
};

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

export const crawlRows: CrawlRow[] = [
  {
    id: "req_8f21",
    timestamp: "2026-09-12 18:04:12",
    url: "https://analytics.target.io/dashboard",
    method: "GET",
    status: 200,
    type: "Frontend",
    sizeKb: 412,
    payload: {
      document: "text/html",
      title: "Analytics Overview",
      renderedNodes: 1842,
      extractedTables: 3,
      links: ["/reports", "/audience", "/api/v2/metrics"],
    },
  },
  {
    id: "req_8f22",
    timestamp: "2026-09-12 18:04:15",
    url: "https://analytics.target.io/api/v2/metrics?range=30d",
    method: "GET",
    status: 200,
    type: "Backend",
    sizeKb: 88,
    payload: {
      range: "30d",
      sessions: 184203,
      conversion_rate: 0.0412,
      series: [
        { date: "2026-09-10", sessions: 6104 },
        { date: "2026-09-11", sessions: 6588 },
        { date: "2026-09-12", sessions: 7013 },
      ],
    },
  },
  {
    id: "req_8f23",
    timestamp: "2026-09-12 18:04:21",
    url: "https://analytics.target.io/api/v2/auth/session",
    method: "POST",
    status: 201,
    type: "Backend",
    sizeKb: 12,
    payload: {
      session_id: "sess_7d2a91f",
      expires_in: 3600,
      scopes: ["reports.read", "audience.read"],
    },
  },
  {
    id: "req_8f24",
    timestamp: "2026-09-12 18:04:33",
    url: "https://analytics.target.io/reports/export",
    method: "POST",
    status: 429,
    type: "Backend",
    sizeKb: 4,
    payload: {
      error: "rate_limited",
      retry_after_seconds: 30,
      quota: { limit: 120, window: "1m" },
    },
  },
  {
    id: "req_8f25",
    timestamp: "2026-09-12 18:04:48",
    url: "https://analytics.target.io/audience",
    method: "GET",
    status: 200,
    type: "Frontend",
    sizeKb: 502,
    payload: {
      document: "text/html",
      title: "Audience Segments",
      renderedNodes: 2411,
      extractedTables: 5,
    },
  },
  {
    id: "req_8f26",
    timestamp: "2026-09-12 18:05:02",
    url: "https://analytics.target.io/api/v2/segments/legacy",
    method: "GET",
    status: 404,
    type: "Backend",
    sizeKb: 2,
    payload: { error: "not_found", resource: "segments/legacy" },
  },
  {
    id: "req_8f27",
    timestamp: "2026-09-12 18:05:19",
    url: "https://analytics.target.io/billing",
    method: "GET",
    status: 200,
    type: "Frontend",
    sizeKb: 194,
    payload: {
      document: "text/html",
      title: "Billing",
      renderedNodes: 908,
      extractedTables: 2,
    },
  },
  {
    id: "req_8f28",
    timestamp: "2026-09-12 18:05:41",
    url: "https://analytics.target.io/api/v2/invoices?page=2",
    method: "GET",
    status: 500,
    type: "Backend",
    sizeKb: 3,
    payload: { error: "internal_error", trace_id: "tr_91ac02f7" },
  },
  {
    id: "req_8f29",
    timestamp: "2026-09-12 18:06:04",
    url: "https://analytics.target.io/api/v2/audience/segments",
    method: "GET",
    status: 200,
    type: "Backend",
    sizeKb: 212,
    payload: {
      total: 24,
      segments: [
        { id: "seg_01", name: "Power users", size: 8421 },
        { id: "seg_02", name: "Trial churn risk", size: 1290 },
      ],
    },
  },
  {
    id: "req_8f30",
    timestamp: "2026-09-12 18:06:27",
    url: "https://analytics.target.io/settings/integrations",
    method: "GET",
    status: 200,
    type: "Frontend",
    sizeKb: 148,
    payload: {
      document: "text/html",
      title: "Integrations",
      renderedNodes: 642,
      extractedTables: 1,
    },
  },
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
