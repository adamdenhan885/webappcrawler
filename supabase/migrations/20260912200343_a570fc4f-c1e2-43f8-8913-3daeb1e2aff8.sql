CREATE TABLE public.crawler_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_url TEXT NOT NULL,
  status_code INTEGER,
  data_type TEXT,
  raw_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.crawler_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crawler_logs TO authenticated;
GRANT ALL ON public.crawler_logs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.crawler_logs_id_seq TO anon, authenticated, service_role;

ALTER TABLE public.crawler_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crawler logs"
ON public.crawler_logs FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Crawler can insert logs"
ON public.crawler_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);