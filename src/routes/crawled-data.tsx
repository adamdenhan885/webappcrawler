import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Braces, Search } from "lucide-react";

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
import { crawlRows, type CrawlRow } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crawled-data")({
  component: CrawledData,
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

function statusClass(status: number) {
  if (status < 300) return "bg-success/10 text-success border-success/30";
  if (status < 400) return "bg-info/10 text-info border-info/30";
  if (status < 500) return "bg-warning/10 text-warning border-warning/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

function CrawledData() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CrawlRow | null>(null);

  const rows = crawlRows.filter((r) =>
    r.url.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <DashboardShell
      title="Crawled Data"
      description="Frontend HTML documents and backend API JSON responses"
    >
      <Card className="panel-surface min-w-0 border-border/70">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <CardTitle className="min-w-0 truncate text-sm font-semibold">
            {rows.length} captured requests
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
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {row.timestamp}
                    </TableCell>
                    <TableCell className="max-w-80 truncate font-mono text-xs">
                      {row.url}
                    </TableCell>
                    <TableCell>
                      <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px]">
                        {row.method}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 font-mono text-[11px]",
                          statusClass(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs",
                          row.type === "Frontend"
                            ? "bg-primary/10 text-primary"
                            : "bg-chart-5/10 text-chart-5",
                        )}
                      >
                        {row.type}
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
              {selected?.method} {selected?.url}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-6">
            <pre className="rounded-lg border border-border/70 bg-background/60 p-4 font-mono text-xs leading-relaxed">
              {selected ? JSON.stringify(selected.payload, null, 2) : ""}
            </pre>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{selected?.status}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{selected?.sizeKb} KB</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardShell>
  );
}
