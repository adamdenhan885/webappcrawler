import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/configuration")({
  component: ConfigPage,
  head: () => ({
    meta: [
      { title: "Configuration & Credentials | Crawler Ops" },
      {
        name: "description",
        content:
          "Manage crawl target, login credentials, schedule and AI extraction settings for the crawler.",
      },
      { property: "og:title", content: "Configuration & Credentials | Crawler Ops" },
      {
        property: "og:description",
        content: "Manage crawl target, credentials and AI extraction settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ConfigPage() {
  return (
    <DashboardShell
      title="Configuration"
      description="Target credentials and crawler behaviour (mock settings)"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Configuration saved", {
            description: "Mock settings stored for the next crawl run.",
          });
        }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="panel-surface min-w-0 border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Login target</CardTitle>
            <CardDescription>Credentials the agent uses to authenticate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Target base URL</Label>
              <Input id="url" defaultValue="https://analytics.target.io" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">Username</Label>
              <Input id="user" defaultValue="crawler.bot@ops.io" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Password</Label>
              <Input id="pass" type="password" defaultValue="mock-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selector">Login form selector</Label>
              <Input id="selector" defaultValue="form#session-login" className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card className="panel-surface min-w-0 border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Crawler & AI</CardTitle>
            <CardDescription>Scheduling and extraction behaviour.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (cron)</Label>
              <Input id="schedule" defaultValue="0 */3 * * *" className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Max crawl depth</Label>
              <Input id="depth" type="number" defaultValue={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Google AI Studio API key</Label>
              <Input id="key" type="password" defaultValue="AIza••••••••••••••••" />
            </div>

            <Separator />

            {[
              { id: "api", label: "Capture backend API calls", desc: "Intercept XHR / fetch traffic" },
              { id: "ai", label: "AI summarisation", desc: "Summarise payloads with Gemini" },
              { id: "robots", label: "Respect robots.txt", desc: "Skip disallowed paths" },
            ].map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Switch id={row.id} defaultChecked className="shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Button type="submit">Save configuration</Button>
        </div>
      </form>
    </DashboardShell>
  );
}
