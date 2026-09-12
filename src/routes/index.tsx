import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Clock, Cpu, Database, Globe, Target } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrawlerLogs } from "@/lib/crawler-logs.functions";
import {
  activityByDay,
  extractMetrics,
  extractSeries,
  parseRawJson,
} from "@/lib/raw-json";

const logsQueryOptions = () =>
  queryOptions({
    queryKey: ["crawler_logs"],
    queryFn: () => getCrawlerLogs(),
    refetchInterval: 15000,
  });

export const Route = createFileRoute("/")({
  component: Overview,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(logsQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "Crawler Ops | AI Data Crawler Dashboard" },
      {
        name: "description",
        content:
          "Monitor an automated AI data crawler: pages crawled, backend APIs extracted, success rate and AI token usage.",
      },
      { property: "og:title", content: "Crawler Ops | AI Data Crawler Dashboard" },
      {
        property: "og:description",
        content:
          "Live overview of crawl activity, extracted APIs, success rate and AI token usage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.625rem",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

const cardIcons = [Database, Activity, Target, Cpu];

function formatValue(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function Overview() {
  const { data, isLoading, isError, error } = useQuery(logsQueryOptions());
  const logs = data ?? [];
  const latest = logs[0] ?? null;
  const parsed = parseRawJson(latest?.raw_json ?? null);
  const aiMetrics = extractMetrics(parsed, 4);
  const series = extractSeries(parsed);
  const activity = activityByDay(logs);

  const successful = logs.filter(
    (l) => (l.status_code ?? 0) >= 200 && (l.status_code ?? 0) < 300,
  ).length;
  const payloadChars = logs.reduce((sum, l) => sum + (l.raw_json?.length ?? 0), 0);

  const fallbackStats = [
    { key: "records", label: "Crawl Records", value: logs.length, hint: "stored runs" },
    {
      key: "targets",
      label: "Unique Targets",
      value: new Set(logs.map((l) => l.target_url)).size,
      hint: "distinct URLs",
    },
    {
      key: "success",
      label: "Success Rate",
      value: logs.length ? Math.round((successful / logs.length) * 1000) / 10 : 0,
      hint: "2xx responses",
      suffix: "%",
    },
    {
      key: "payload",
      label: "Extracted Payload",
      value: Math.round(payloadChars / 1024),
      hint: "KB of AI output",
      suffix: " KB",
    },
  ];

  const cards = aiMetrics.length
    ? aiMetrics.map((m) => ({
        key: m.key,
        label: m.label,
        value: m.value,
        hint: "from latest AI extraction",
        suffix: "",
      }))
    : fallbackStats;

  return (
    <DashboardShell
      title="Dashboard"
      description="Live metrics parsed from the latest AI crawl of the NasDem Parlemen system"
    >
      <div className="space-y-6">
        {isError && (
          <Card className="panel-surface border-destructive/40">
            <CardContent className="p-5 text-sm text-destructive">
              Could not load crawl records: {(error as Error)?.message}
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((s, i) => {
            const Icon = cardIcons[i % cardIcons.length]!;
            return (
              <Card key={s.key} className="panel-surface min-w-0 border-border/70">
                <CardContent className="p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 text-xs font-medium uppercase leading-snug tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
                    {isLoading ? "—" : `${formatValue(s.value)}${"suffix" in s ? s.suffix : ""}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="truncate text-muted-foreground">{s.hint}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card className="panel-surface min-w-0 border-border/70">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Crawling Activity Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[19rem] w-full">
                {activity.length === 0 ? (
                  <EmptyChart message="No crawl records yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={activity} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="gPages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gApis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="day" {...axisProps} />
                      <YAxis {...axisProps} width={44} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area
                        type="monotone"
                        dataKey="runs"
                        name="Crawl records"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        fill="url(#gPages)"
                      />
                      <Area
                        type="monotone"
                        dataKey="ok"
                        name="Successful"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        fill="url(#gApis)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="panel-surface min-w-0 border-border/70">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {series ? series.label : "Extracted Data Series"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[19rem] w-full">
                {!series ? (
                  <EmptyChart message="The latest record has no numeric data list to chart yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={series.rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey={series.nameKey}
                        {...axisProps}
                        interval={0}
                        angle={-20}
                        height={50}
                        dy={10}
                      />
                      <YAxis {...axisProps} width={44} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {series.valueKeys.map((k, i) => (
                        <Bar
                          key={k}
                          dataKey={k}
                          name={k}
                          fill={i === 0 ? "var(--chart-1)" : "var(--chart-3)"}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="panel-surface border-border/70">
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Latest run:{" "}
              {latest?.timestamp
                ? new Date(latest.timestamp).toISOString().slice(0, 19).replace("T", " ")
                : "none yet"}
            </span>
            <span className="inline-flex items-center gap-1.5 break-all">
              <Globe className="size-3.5" />
              {latest?.target_url ?? "no target recorded"}
            </span>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
