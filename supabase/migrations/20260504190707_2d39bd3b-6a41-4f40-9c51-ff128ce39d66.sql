
-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Backfill referral codes for existing users
UPDATE public.profiles
SET referral_code = 'AXL-' || UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 6))
WHERE referral_code IS NULL;

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users insert own referral"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- Feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sessao_id UUID,
  util BOOLEAN NOT NULL,
  comentario TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback"
ON public.feedbacks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own feedback"
ON public.feedbacks FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Update handle_new_user to assign referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nome, email, plano, creditos_hoje, data_reset_creditos, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'nhateazarias21@gmail.com' THEN 'premium' ELSE 'free' END,
    3,
    CURRENT_DATE,
    'AXL-' || UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 6))
  );
  RETURN NEW;
END;
$function$;

-- RPC to apply referral and reward referrer with 7 days premium when threshold (3) reached
CREATE OR REPLACE FUNCTION public.apply_referral(_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_id UUID;
  _count INT;
  _new_premium DATE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not authenticated');
  END IF;

  SELECT id INTO _referrer_id FROM public.profiles WHERE referral_code = _code;
  IF _referrer_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid code');
  END IF;
  IF _referrer_id = auth.uid() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'self referral');
  END IF;

  -- Insert (unique on referred_id prevents duplicates)
  BEGIN
    INSERT INTO public.referrals (referrer_id, referred_id) VALUES (_referrer_id, auth.uid());
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already referred');
  END;

  SELECT COUNT(*) INTO _count FROM public.referrals WHERE referrer_id = _referrer_id;

  -- Reward every 3 referrals: add 7 days premium
  IF _count > 0 AND _count % 3 = 0 THEN
    SELECT GREATEST(COALESCE(premium_ate, CURRENT_DATE), CURRENT_DATE) + 7
      INTO _new_premium
      FROM public.profiles WHERE id = _referrer_id;
    UPDATE public.profiles
      SET premium_ate = _new_premium, plano = 'premium'
      WHERE id = _referrer_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'count', _count);
END;
$$;
