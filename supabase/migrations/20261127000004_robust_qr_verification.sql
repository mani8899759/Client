-- Migration: Robust QR verification, mobile matching, and OTP verification
-- 2026-11-27

-- 1. Add verification_method column to participants
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS verification_method text;

-- 2. Expand checkins verification_method check constraint
ALTER TABLE public.checkins
  DROP CONSTRAINT IF EXISTS checkins_verification_method_check;

ALTER TABLE public.checkins
  ADD CONSTRAINT checkins_verification_method_check
  CHECK (verification_method IN ('common_qr_mobile_match', 'admin_manual', 'sms_otp', 'staff_assisted'));

-- 3. OTP tracking table for secure mobile verification
CREATE TABLE IF NOT EXISTS public.verification_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  normalized_mobile text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_otps_lookup
  ON public.verification_otps (normalized_mobile, expires_at);

ALTER TABLE public.verification_otps ENABLE ROW LEVEL SECURITY;

-- 4. Lookup registration for verification (handles all formatting variants seamlessly)
CREATE OR REPLACE FUNCTION public.lookup_registration_for_verification(p_mobile text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled boolean;
  v_digits  text;
  v_p       public.participants%rowtype;
  v_c       public.checkins%rowtype;
BEGIN
  SELECT verification_enabled INTO v_enabled FROM public.app_settings WHERE id;
  IF NOT coalesce(v_enabled, false) THEN
    RETURN jsonb_build_object('status', 'disabled', 'message', 'Verification is currently closed.');
  END IF;

  IF to_regclass('public.lucky_draws') IS NOT NULL
     AND exists (SELECT 1 FROM public.lucky_draws WHERE status = 'completed') THEN
    RETURN jsonb_build_object('status', 'closed', 'message', 'Verification has ended for the lucky draw.');
  END IF;

  v_digits := right(regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g'), 10);

  IF char_length(v_digits) <> 10 THEN
    RETURN jsonb_build_object('status', 'invalid', 'message', 'Enter a valid 10-digit mobile number.');
  END IF;

  SELECT * INTO v_p FROM public.participants
  WHERE normalized_mobile = p_mobile
     OR mobile_number = p_mobile
     OR right(regexp_replace(coalesce(normalized_mobile, ''), '\D', '', 'g'), 10) = v_digits
     OR right(regexp_replace(coalesce(mobile_number, ''), '\D', '', 'g'), 10) = v_digits
  ORDER BY registered_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'not_found',
      'message', 'We couldn''t find a registration associated with this mobile number. Please check your number and try again.'
    );
  END IF;

  IF v_p.registration_status <> 'registered' THEN
    RETURN jsonb_build_object('status', 'inactive', 'message', 'This registration is cancelled or inactive.');
  END IF;

  SELECT * INTO v_c FROM public.checkins WHERE participant_id = v_p.id;

  RETURN jsonb_build_object(
    'status', v_p.verification_status,
    'participant_id', v_p.id,
    'full_name', v_p.full_name,
    'display_name', split_part(btrim(v_p.full_name), ' ', 1),
    'mobile_number', v_p.mobile_number,
    'normalized_mobile', v_p.normalized_mobile,
    'side', v_p.side,
    'registered_at', v_p.registered_at,
    'verified_at', v_p.verified_at,
    'verification_method', coalesce(v_p.verification_method, v_c.verification_method)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_registration_for_verification(text) TO service_role;

-- 5. Updated verify_participant with 10-digit robust lookup and method attribution
CREATE OR REPLACE FUNCTION public.verify_participant(p_normalized_mobile text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled boolean;
  v_digits  text;
  v_p       public.participants%rowtype;
BEGIN
  SELECT verification_enabled INTO v_enabled FROM public.app_settings WHERE id;
  IF NOT coalesce(v_enabled, false) THEN
    RETURN jsonb_build_object('status', 'disabled');
  END IF;

  IF to_regclass('public.lucky_draws') IS NOT NULL
     AND exists (SELECT 1 FROM public.lucky_draws WHERE status = 'completed') THEN
    RETURN jsonb_build_object('status', 'closed');
  END IF;

  v_digits := right(regexp_replace(coalesce(p_normalized_mobile, ''), '\D', '', 'g'), 10);

  -- Robust lookup matching exact string or 10-digit phone number
  SELECT * INTO v_p FROM public.participants
  WHERE normalized_mobile = p_normalized_mobile
     OR mobile_number = p_normalized_mobile
     OR (char_length(v_digits) = 10 AND (
          right(regexp_replace(coalesce(normalized_mobile, ''), '\D', '', 'g'), 10) = v_digits
          OR right(regexp_replace(coalesce(mobile_number, ''), '\D', '', 'g'), 10) = v_digits
        ))
  ORDER BY registered_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_p.registration_status <> 'registered' THEN
    RETURN jsonb_build_object('status', 'inactive');
  END IF;

  -- Atomic conditional update
  UPDATE public.participants
     SET verification_status = 'verified',
         verified_at = now(),
         verification_method = 'common_qr_mobile_match'
   WHERE id = v_p.id AND verification_status = 'pending'
  RETURNING * INTO v_p;

  IF NOT FOUND THEN
    -- Already verified
    SELECT * INTO v_p FROM public.participants WHERE id = v_p.id;
    RETURN jsonb_build_object(
      'status', 'already_verified',
      'participant_id', v_p.id,
      'full_name', v_p.full_name,
      'display_name', split_part(btrim(v_p.full_name), ' ', 1),
      'side', v_p.side,
      'verified_at', v_p.verified_at
    );
  END IF;

  INSERT INTO public.checkins (participant_id, verification_method, verified_at)
  VALUES (v_p.id, 'common_qr_mobile_match', v_p.verified_at)
  ON CONFLICT (participant_id) DO UPDATE SET
    verification_method = excluded.verification_method,
    verified_at = excluded.verified_at;

  RETURN jsonb_build_object(
    'status', 'verified',
    'participant_id', v_p.id,
    'full_name', v_p.full_name,
    'display_name', split_part(btrim(v_p.full_name), ' ', 1),
    'side', v_p.side,
    'verified_at', v_p.verified_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_participant(text) TO service_role;

-- 6. Full verification with specific method and staff attribution
CREATE OR REPLACE FUNCTION public.verify_participant_with_method(
  p_normalized_mobile text,
  p_method            text,
  p_verified_by       uuid DEFAULT NULL,
  p_reason            text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled boolean;
  v_digits  text;
  v_p       public.participants%rowtype;
BEGIN
  SELECT verification_enabled INTO v_enabled FROM public.app_settings WHERE id;
  IF NOT coalesce(v_enabled, false) THEN
    RETURN jsonb_build_object('status', 'disabled');
  END IF;

  IF to_regclass('public.lucky_draws') IS NOT NULL
     AND exists (SELECT 1 FROM public.lucky_draws WHERE status = 'completed') THEN
    RETURN jsonb_build_object('status', 'closed');
  END IF;

  v_digits := right(regexp_replace(coalesce(p_normalized_mobile, ''), '\D', '', 'g'), 10);

  SELECT * INTO v_p FROM public.participants
  WHERE normalized_mobile = p_normalized_mobile
     OR mobile_number = p_normalized_mobile
     OR (char_length(v_digits) = 10 AND (
          right(regexp_replace(coalesce(normalized_mobile, ''), '\D', '', 'g'), 10) = v_digits
          OR right(regexp_replace(coalesce(mobile_number, ''), '\D', '', 'g'), 10) = v_digits
        ))
  ORDER BY registered_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_p.registration_status <> 'registered' THEN
    RETURN jsonb_build_object('status', 'inactive');
  END IF;

  IF v_p.verification_status = 'verified' THEN
    RETURN jsonb_build_object(
      'status', 'already_verified',
      'participant_id', v_p.id,
      'full_name', v_p.full_name,
      'display_name', split_part(btrim(v_p.full_name), ' ', 1),
      'side', v_p.side,
      'verified_at', v_p.verified_at
    );
  END IF;

  UPDATE public.participants
     SET verification_status = 'verified',
         verified_at = now(),
         verification_method = p_method
   WHERE id = v_p.id AND verification_status = 'pending'
  RETURNING * INTO v_p;

  INSERT INTO public.checkins (participant_id, verification_method, verified_at, verified_by, reason)
  VALUES (v_p.id, p_method, v_p.verified_at, p_verified_by, p_reason)
  ON CONFLICT (participant_id) DO UPDATE SET
    verification_method = excluded.verification_method,
    verified_at = excluded.verified_at,
    verified_by = excluded.verified_by,
    reason = coalesce(excluded.reason, checkins.reason);

  RETURN jsonb_build_object(
    'status', 'verified',
    'participant_id', v_p.id,
    'full_name', v_p.full_name,
    'display_name', split_part(btrim(v_p.full_name), ' ', 1),
    'side', v_p.side,
    'verified_at', v_p.verified_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_participant_with_method(text, text, uuid, text) TO service_role;
