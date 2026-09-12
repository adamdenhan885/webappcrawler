import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CrawlerLog = {
  id: number;
  timestamp: string | null;
  target_url: string;
  status_code: number | null;
  data_type: string | null;
  raw_json: string | null;
};

export const getCrawlerLogs = createServerFn({ method: "GET" }).handler(
  async (): Promise<CrawlerLog[]> => {
    const supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabase
      .from("crawler_logs")
      .select("id, timestamp, target_url, status_code, data_type, raw_json")
      .order("timestamp", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    return (data ?? []) as CrawlerLog[];
  },
);
