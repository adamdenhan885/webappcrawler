import { createFileRoute } from "@tanstack/react-router";
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
import {
  ArrowDownRight,
  ArrowUpRight,
  Cpu,
  Globe,
  PlugZap,
  Target,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityData, payloadData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Overview,
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

const stats = [
  {
    label: "Total Pages Crawled",
    value: "12,948",
    delta: "+12.4%",
    up: true,
    icon: Globe,
    hint: "vs. last 7 days",
  },
  {
    label: "Backend APIs Extracted",
    value: "1,376",
    delta: "+8.1%",
    up: true,
    icon: PlugZap,
    hint: "unique endpoints",
  },
  {
    label: "Success Rate",
    value: "98.4%",
    delta: "-0.3%",
    up: false,
    icon: Target,
    hint: "2xx responses",
  },
  {
    label: "AI Tokens Used",
    value: "4.82M",
    delta: "+21.7%",
    up: true,
    icon: Cpu,
    hint: "Google AI Studio",
  },
];

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

function Overview() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Overview of the automated AI crawler pipeline"
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="panel-surface min-w-0 border-border/70">
              <CardContent className="p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="size-4" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
                  {s.value}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                      s.up
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {s.up ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {s.delta}
                  </span>
                  <span className="truncate text-muted-foreground">{s.hint}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card className="panel-surface min-w-0 border-border/70">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Crawling Activity Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[19rem] pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
                  <XAxis dataKey="time" {...axisProps} />
                  <YAxis {...axisProps} width={44} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="pages"
                    name="Pages crawled"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#gPages)"
                  />
                  <Area
                    type="monotone"
                    dataKey="apis"
                    name="APIs captured"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#gApis)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="panel-surface min-w-0 border-border/70">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                HTML Page Size vs API Payload Size (KB)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[19rem] pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payloadData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="target" {...axisProps} interval={0} angle={-20} height={50} dy={10} />
                  <YAxis {...axisProps} width={44} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="html" name="Frontend HTML" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="api" name="Backend API" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
