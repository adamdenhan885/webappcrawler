import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Database,
  Terminal,
  KeyRound,
  Bot,
  Play,
  Loader2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Crawled Data", url: "/crawled-data", icon: Database },
  { title: "Bot Logs & Status", url: "/logs", icon: Terminal },
  { title: "Configuration", url: "/configuration", icon: KeyRound },
];

type CrawlerState = "Idle" | "Running" | "Failed";

function StatusBadge({ state }: { state: CrawlerState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        state === "Idle" && "border-border bg-muted text-muted-foreground",
        state === "Running" && "border-primary/40 bg-primary/10 text-primary",
        state === "Failed" && "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-current",
          state === "Running" && "animate-pulse",
        )}
      />
      {state}
    </span>
  );
}

function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-1.5 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Bot className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">Crawler Ops</p>
            <p className="truncate text-xs text-muted-foreground">AI Data Pipeline</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Agent v2.4.1 · region eu-central
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<CrawlerState>("Idle");
  const [running, setRunning] = useState(false);

  const runCrawler = () => {
    setRunning(true);
    setState("Running");
    window.setTimeout(() => {
      setRunning(false);
      setState("Idle");
    }, 2600);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="shrink-0" />
                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
                  <p className="truncate text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <StatusBadge state={state} />
                <Button onClick={runCrawler} disabled={running} size="sm" className="gap-2">
                  {running ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {running ? "Crawling…" : "Run Crawler Now"}
                  </span>
                  <span className="sm:hidden">{running ? "Running" : "Run"}</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
