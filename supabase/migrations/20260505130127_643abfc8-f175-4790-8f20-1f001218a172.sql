-- Add reward tracking columns to referrals
ALTER TABLE public.referrals 
  ADD COLUMN IF NOT EXISTS registou boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pagou_premium boolean NOT NULL DEFAULT false;

-- Replace apply_referral: 1 day per 3 registered friends + notifications
CREATE OR REPLACE FUNCTION public.apply_referral(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_id UUID;
  _referred_name TEXT;
  _count INT;
  _restantes INT;
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

  BEGIN
    INSERT INTO public.referrals (referrer_id, referred_id, registou) 
    VALUES (_referrer_id, auth.uid(), true);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already referred');
  END;

  SELECT nome INTO _referred_name FROM public.profiles WHERE id = auth.uid();
  SELECT COUNT(*) INTO _count FROM public.referrals WHERE referrer_id = _referrer_id;
  _restantes := 3 - (_count % 3);
  IF _restantes = 3 THEN _restantes := 0; END IF;

  -- Reward 1 day per group of 3
  IF _count > 0 AND _count % 3 = 0 THEN
    UPDATE public.profiles
      SET premium_ate = GREATEST(COALESCE(premium_ate, CURRENT_DATE), CURRENT_DATE) + 1,
          plano = 'premium'
      WHERE id = _referrer_id;

    INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo)
    VALUES (_referrer_id, '🎉 Ganhaste 1 dia Premium grátis!', 
            'Continua a convidar para ganhares mais.', 'recompensa');
  ELSE
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo)
    VALUES (_referrer_id, '👥 Novo amigo registado!',
            COALESCE(_referred_name, 'Um amigo') || ' registou-se com o teu código! Faltam ' || _restantes || ' para ganhares 1 dia Premium.',
            'convite');
  END IF;

  RETURN jsonb_build_object('ok', true, 'count', _count);
END;
$$;

-- Trigger: when a referred user activates premium, give referrer +7 days
CREATE OR REPLACE FUNCTION public.handle_referred_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _ref RECORD;
  _name TEXT;
BEGIN
  IF NEW.plano = 'premium' AND (OLD.plano IS DISTINCT FROM 'premium') THEN
    SELECT * INTO _ref FROM public.referrals 
      WHERE referred_id = NEW.id AND pagou_premium = false LIMIT 1;
    IF FOUND THEN
      UPDATE public.referrals SET pagou_premium = true WHERE id = _ref.id;
      UPDATE public.profiles
        SET premium_ate = GREATEST(COALESCE(premium_ate, CURRENT_DATE), CURRENT_DATE) + 7,
            plano = 'premium'
        WHERE id = _ref.referrer_id;
      SELECT nome INTO _name FROM public.profiles WHERE id = NEW.id;
      INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo)
      VALUES (_ref.referrer_id, '💰 Amigo activou Premium!',
              COALESCE(_name, 'Um amigo') || ' activou Premium! Ganhaste 7 dias Premium extra.',
              'recompensa');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_premium_activate ON public.profiles;
CREATE TRIGGER on_profile_premium_activate
  AFTER UPDATE OF plano ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_referred_premium();

-- Validate referral code (used during signup before user is logged in)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = _code);
$$;