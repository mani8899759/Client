-- Migration: Link event_interests to participants and add admin summary RPC and view
-- 2026-11-27

-- 1. Add visitor_id to participants
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS visitor_id text;

CREATE INDEX IF NOT EXISTS idx_participants_visitor_id
  ON public.participants(visitor_id)
  WHERE visitor_id IS NOT NULL;

-- 2. Add participant_id to event_interests
ALTER TABLE public.event_interests
  ADD COLUMN IF NOT EXISTS participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_event_interests_participant_id
  ON public.event_interests(participant_id)
  WHERE participant_id IS NOT NULL;

-- 3. Update register_participant: define 12-arg primary implementation and 11-arg wrapper
DROP FUNCTION IF EXISTS public.register_participant(text,text,text,text,text,public.participant_gender,text,public.participant_side,boolean,text,uuid,text);

CREATE OR REPLACE FUNCTION public.register_participant(
  p_full_name              text,
  p_mobile_number          text,
  p_normalized_mobile      text,
  p_email                  text,
  p_normalized_email       text,
  p_gender                 public.participant_gender,
  p_address                text,
  p_side                   public.participant_side,
  p_consent                boolean,
  p_consent_policy_version text,
  p_request_id             uuid,
  p_visitor_id             text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_open       boolean;
  v_row        public.participants%rowtype;
  v_constraint text;
BEGIN
  SELECT registration_open INTO v_open FROM public.app_settings WHERE id;
  IF NOT coalesce(v_open, false) THEN
    RETURN jsonb_build_object('status', 'closed');
  END IF;

  IF p_consent IS NOT TRUE THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  IF p_request_id IS NOT NULL THEN
    SELECT * INTO v_row FROM public.participants WHERE registration_request_id = p_request_id;
    IF FOUND THEN
      IF p_visitor_id IS NOT NULL THEN
        UPDATE public.participants SET visitor_id = p_visitor_id WHERE id = v_row.id AND visitor_id IS NULL;
        UPDATE public.event_interests SET participant_id = v_row.id WHERE visitor_id = p_visitor_id AND participant_id IS NULL;
      END IF;
      RETURN jsonb_build_object('status', 'created', 'participant_id', v_row.id,
                                'full_name', v_row.full_name, 'side', v_row.side);
    END IF;
  END IF;

  BEGIN
    INSERT INTO public.participants (
      full_name, mobile_number, normalized_mobile, email, normalized_email,
      gender, address, side, consent, consent_timestamp, consent_policy_version,
      registration_request_id, visitor_id
    ) VALUES (
      btrim(p_full_name), btrim(p_mobile_number), p_normalized_mobile, btrim(p_email), p_normalized_email,
      p_gender, btrim(p_address), p_side, true, now(), p_consent_policy_version,
      p_request_id, p_visitor_id
    )
    RETURNING * INTO v_row;

    IF p_visitor_id IS NOT NULL THEN
      UPDATE public.event_interests SET participant_id = v_row.id WHERE visitor_id = p_visitor_id AND participant_id IS NULL;
    END IF;
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = constraint_name;
      IF v_constraint = 'participants_registration_request_id_key' THEN
        SELECT * INTO v_row FROM public.participants WHERE registration_request_id = p_request_id;
        IF p_visitor_id IS NOT NULL THEN
          UPDATE public.participants SET visitor_id = p_visitor_id WHERE id = v_row.id AND visitor_id IS NULL;
          UPDATE public.event_interests SET participant_id = v_row.id WHERE visitor_id = p_visitor_id AND participant_id IS NULL;
        END IF;
        RETURN jsonb_build_object('status', 'created', 'participant_id', v_row.id,
                                  'full_name', v_row.full_name, 'side', v_row.side);
      END IF;
      RETURN jsonb_build_object('status', 'duplicate');
    WHEN check_violation THEN
      RETURN jsonb_build_object('status', 'invalid');
  END;

  RETURN jsonb_build_object('status', 'created', 'participant_id', v_row.id,
                            'full_name', v_row.full_name, 'side', v_row.side);
END;
$$;

-- 11-argument wrapper without defaults so signatures do not conflict
CREATE OR REPLACE FUNCTION public.register_participant(
  p_full_name              text,
  p_mobile_number          text,
  p_normalized_mobile      text,
  p_email                  text,
  p_normalized_email       text,
  p_gender                 public.participant_gender,
  p_address                text,
  p_side                   public.participant_side,
  p_consent                boolean,
  p_consent_policy_version text,
  p_request_id             uuid
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.register_participant(
    p_full_name, p_mobile_number, p_normalized_mobile, p_email, p_normalized_email,
    p_gender, p_address, p_side, p_consent, p_consent_policy_version, p_request_id, NULL::text
  );
$$;

REVOKE EXECUTE ON FUNCTION public.register_participant(text, text, text, text, text, public.participant_gender, text, public.participant_side, boolean, text, uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant(text, text, text, text, text, public.participant_gender, text, public.participant_side, boolean, text, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.register_participant(text, text, text, text, text, public.participant_gender, text, public.participant_side, boolean, text, uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant(text, text, text, text, text, public.participant_gender, text, public.participant_side, boolean, text, uuid, text) TO service_role;

-- 4. Admin summary RPC function
CREATE OR REPLACE FUNCTION public.admin_event_interests_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_unique integer;
  v_breakdown jsonb;
BEGIN
  IF NOT (
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    OR current_user = 'postgres'
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT count(distinct visitor_id) INTO v_total_unique FROM public.event_interests;

  SELECT coalesce(jsonb_agg(item ORDER BY (item->>'sort_order')::int ASC, item->>'event_date' ASC), '[]'::jsonb)
  INTO v_breakdown
  FROM (
    SELECT jsonb_build_object(
      'event_id', e.id,
      'name', e.name,
      'slug', e.slug,
      'event_date', e.event_date,
      'start_time', e.start_time,
      'sort_order', e.sort_order,
      'venue_name', coalesce(v.name, 'Eco Villagio Resorts & Gardens'),
      'interested_count', count(distinct ei.visitor_id)
    ) AS item
    FROM public.events e
    LEFT JOIN public.venues v ON v.id = e.venue_id
    LEFT JOIN public.event_interests ei ON ei.event_id = e.id
    WHERE e.is_published = true
    GROUP BY e.id, e.name, e.slug, e.event_date, e.start_time, e.sort_order, v.name
  ) sub;

  RETURN jsonb_build_object(
    'total_unique_interested', coalesce(v_total_unique, 0),
    'events', v_breakdown
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_event_interests_summary() TO authenticated, service_role;

-- 5. Admin event interests view
CREATE OR REPLACE VIEW public.admin_event_interests_view AS
SELECT 
  ei.id,
  ei.event_id,
  ei.visitor_id,
  ei.created_at,
  e.name AS event_name,
  e.slug AS event_slug,
  e.event_date,
  coalesce(v.name, 'Eco Villagio Resorts & Gardens') AS venue_name,
  p.id AS participant_id,
  coalesce(p.full_name, 'Anonymous Guest') AS guest_name,
  p.email AS guest_email,
  p.mobile_number AS guest_phone,
  (p.id IS NOT NULL) AS is_registered
FROM public.event_interests ei
JOIN public.events e ON e.id = ei.event_id
LEFT JOIN public.venues v ON v.id = e.venue_id
LEFT JOIN public.participants p ON (p.id = ei.participant_id OR (ei.participant_id IS NULL AND p.visitor_id = ei.visitor_id));

GRANT SELECT ON public.admin_event_interests_view TO authenticated, service_role;
