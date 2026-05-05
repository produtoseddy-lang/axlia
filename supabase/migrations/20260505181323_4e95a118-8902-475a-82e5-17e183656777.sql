
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS recompensa_registo_dada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recompensa_premium_dada boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.apply_referral(_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _referrer_id UUID;
  _referred_name TEXT;
  _count INT;
  _restantes INT;
  _ja_dada BOOLEAN;
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
  SELECT recompensa_registo_dada INTO _ja_dada FROM public.profiles WHERE id = _referrer_id;

  IF _count >= 3 AND NOT _ja_dada THEN
    UPDATE public.profiles
      SET premium_ate = GREATEST(COALESCE(premium_ate, CURRENT_DATE), CURRENT_DATE) + 1,
          plano = 'premium',
          recompensa_registo_dada = true
      WHERE id = _referrer_id;

    INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo)
    VALUES (_referrer_id, '🎉 Ganhaste 1 dia Premium grátis!', 
            'Atingiste 3 amigos registados. Recompensa única recebida!', 'recompensa');
  ELSE
    _restantes := GREATEST(0, 3 - _count);
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo)
    VALUES (_referrer_id, '👥 Novo amigo registado!',
            COALESCE(_referred_name, 'Um amigo') || ' registou-se com o teu código!' ||
            CASE WHEN _ja_dada THEN '' 
                 ELSE ' Faltam ' || _restantes || ' para ganhares 1 dia Premium.' END,
            'convite');
  END IF;

  RETURN jsonb_build_object('ok', true, 'count', _count);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_referred_premium()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _ref RECORD;
  _name TEXT;
  _ja_dada BOOLEAN;
BEGIN
  IF NEW.plano = 'premium' AND (OLD.plano IS DISTINCT FROM 'premium') THEN
    SELECT * INTO _ref FROM public.referrals 
      WHERE referred_id = NEW.id AND pagou_premium = false LIMIT 1;
    IF FOUND THEN
      UPDATE public.referrals SET pagou_premium = true WHERE id = _ref.id;
      SELECT recompensa_premium_dada INTO _ja_dada FROM public.profiles WHERE id = _ref.referrer_id;
      IF NOT _ja_dada THEN
        UPDATE public.profiles
          SET premium_ate = GREATEST(COALESCE(premium_ate, CURRENT_DATE), CURRENT_DATE) + 7,
              plano = 'premium',
              recompensa_premium_dada = true
          WHERE id = _ref.referrer_id;
        SELECT nome INTO _name FROM public.profiles WHERE id = NEW.id;
        INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo)
        VALUES (_ref.referrer_id, '💰 Amigo activou Premium!',
                COALESCE(_name, 'Um amigo') || ' activou Premium! Ganhaste 7 dias Premium (recompensa única).',
                'recompensa');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
