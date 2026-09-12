import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { botLogs, type LogLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/logs")({
  component: LogsPage,
  head: () => ({
    meta: [
      { title: "Bot Logs & Status | Crawler Ops" },
      {
        name: "description",
        content:
          "Live log stream and health status for the automated AI data crawler agent.",
      },
      { property: "og:title", content: "Bot Logs & Status | Crawler Ops" },
      {
        property: "og:description",
        content: "Live log stream and health status for the AI crawler agent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const levelStyles: Record<LogLevel, string> = {
  info: "bg-info/10 text-info border-info/30",
  success: "bg-success/10 text-success border-success/30",
  warn: "bg-warning/10 text-warning border-warning/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
};

const health = [
  { label: "Uptime", value: "99.97%" },
  { label: "Queue depth", value: "12 jobs" },
  { label: "Avg. latency", value: "412 ms" },
  { label: "Last run", value: "2 min ago" },
];

function LogsPage() {
  return (
    <DashboardShell
      title="Bot Logs & Status"
      description="Real-time activity stream from the crawler agent"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="panel-surface min-w-0 border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Live log stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[32rem] space-y-1 overflow-y-auto rounded-lg border border-border/70 bg-background/60 p-2 font-mono text-xs">
              {botLogs.map((log, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <span className="text-muted-foreground">{log.time}</span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                      levelStyles[log.level],
                    )}
                  >
                    {log.level}
                  </span>
                  <span className="truncate text-foreground/90">{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="panel-surface min-w-0 border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Agent health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.map((h) => (
              <div
                key={h.label}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-3 py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{h.label}</span>
                <span className="font-medium tabular-nums">{h.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
