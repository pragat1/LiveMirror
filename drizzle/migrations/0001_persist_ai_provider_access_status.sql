CREATE TABLE public.ai_gateway_access_state (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  block_type TEXT,
  safe_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_gateway_access_state TO service_role;
ALTER TABLE public.ai_gateway_access_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages AI access state" ON public.ai_gateway_access_state FOR ALL TO service_role USING (true) WITH CHECK (true);