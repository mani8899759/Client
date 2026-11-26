-- Real per-event visitor interest tracking (starts at 0, strictly deduplicated per visitor & event)
CREATE TABLE IF NOT EXISTS public.event_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  visitor_id text NOT NULL CHECK (char_length(visitor_id) BETWEEN 8 AND 128),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_interests_unique_visitor_event UNIQUE (event_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON public.event_interests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_created_at ON public.event_interests(created_at DESC);

ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins may read raw event_interests records
DROP POLICY IF EXISTS "Admins can view event interests" ON public.event_interests;
CREATE POLICY "Admins can view event interests"
  ON public.event_interests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
