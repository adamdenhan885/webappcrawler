import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Braces, Download, Search } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCrawlerLogs, type CrawlerLog } from "@/lib/crawler-logs.functions";
import { downloadCsv, toCsv } from "@/lib/raw-json";
import { cn } from "@/lib/utils";

const logsQueryOptions = () =>
  queryOptions({
    queryKey: ["crawler_logs"],
    queryFn: () => getCrawlerLogs(),
    refetchInterval: 15000,
  });

export const Route = createFileRoute("/crawled-data")({
  component: CrawledData,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(logsQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "Crawled Data | Crawler Ops" },
      {
        name: "description",
        content:
          "Browse crawled frontend HTML pages and backend API JSON responses with status codes and raw payloads.",
      },
      { property: "og:title", content: "Crawled Data | Crawler Ops" },
      {
        property: "og:description",
        content: "Browse crawled HTML pages and backend API JSON responses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function statusClass(status: number | null) {
  if (status === null) return "bg-muted text-muted-foreground border-border";
  if (status < 300) return "bg-success/10 text-success border-success/30";
  if (status < 400) return "bg-info/10 text-info border-info/30";
  if (status < 500) return "bg-warning/10 text-warning border-warning/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function prettyJson(raw: string | null) {
  if (!raw) return "No payload recorded.";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function CrawledData() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CrawlerLog | null>(null);
  const { data, isLoading, isError, error } = useQuery(logsQueryOptions());

  const rows = (data ?? []).filter((r) =>
    r.target_url.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <DashboardShell
      title="Crawled Data"
      description="Live crawl records captured by the automated crawler"
    >
      <Card className="panel-surface min-w-0 border-border/70">
        <CardHeader className="!flex flex-col items-start gap-3 sm:!flex-row sm:items-center sm:justify-between">
          <CardTitle className="min-w-0 truncate text-sm font-semibold">
            {isLoading ? "Loading records…" : `${rows.length} captured records`}
          </CardTitle>
          <div className="relative w-full max-w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by URL…"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead className="text-right">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isError && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-destructive">
                      Could not load records: {(error as Error)?.message}
                    </TableCell>
                  </TableRow>
                )}
                {!isError && !isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No crawl records yet. Run the crawler to collect data.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {formatTimestamp(row.timestamp)}
                    </TableCell>
                    <TableCell className="max-w-80 truncate font-mono text-xs">
                      {row.target_url}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 font-mono text-[11px]",
                          statusClass(row.status_code),
                        )}
                      >
                        {row.status_code ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                        {row.data_type ?? "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 whitespace-nowrap"
                        onClick={() => setSelected(row)}
                      >
                        <Braces className="size-3.5" />
                        View JSON Data
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Raw response body</SheetTitle>
            <SheetDescription className="break-all font-mono text-xs">
              {selected?.target_url}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-6">
            <pre className="whitespace-pre-wrap break-words rounded-lg border border-border/70 bg-background/60 p-4 font-mono text-xs leading-relaxed">
              {selected ? prettyJson(selected.raw_json) : ""}
            </pre>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{selected?.status_code ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-muted-foreground">Data type</p>
                <p className="font-medium">{selected?.data_type ?? "Unknown"}</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardShell>
  );
}
