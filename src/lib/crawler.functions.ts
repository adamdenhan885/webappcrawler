import { createServerFn } from "@tanstack/react-start";

const OWNER = "ojekapartmen-byte";
const REPO = "webappcrawler";
const WORKFLOW = "run-crawler.yml";

export const triggerCrawler = createServerFn({ method: "POST" }).handler(async () => {
  const token = process.env["GITHUB_PAT"];
  if (!token) {
    return { ok: false as const, error: "GitHub access token is not configured yet." };
  }

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "crawler-ops-dashboard",
      },
      body: JSON.stringify({ ref: "main" }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    console.error(`GitHub dispatch failed [${response.status}]: ${body}`);
    return { ok: false as const, error: `GitHub responded ${response.status}: ${body.slice(0, 300)}` };
  }

  return { ok: true as const };
});
