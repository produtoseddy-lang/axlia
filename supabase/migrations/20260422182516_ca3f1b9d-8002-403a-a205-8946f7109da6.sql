
-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  plano TEXT NOT NULL DEFAULT 'free',
  creditos_hoje INT NOT NULL DEFAULT 3,
  data_reset_creditos DATE NOT NULL DEFAULT CURRENT_DATE,
  premium_ate DATE,
  nivel_ensino TEXT,
  disciplina_ou_curso TEXT,
  objectivo_estudo TEXT,
  estilo_aprendizagem TEXT,
  nivel_quiz TEXT,
  onboarding_completo BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = _user_id AND email = 'nhateazarias21@gmail.com'
  );
$$;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, plano, creditos_hoje, data_reset_creditos)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'nhateazarias21@gmail.com' THEN 'premium' ELSE 'free' END,
    3,
    CURRENT_DATE
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- DEVICE FINGERPRINTS
-- =========================
CREATE TABLE public.device_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint_id TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to check and insert fingerprints (needed during signup before login)
CREATE POLICY "Anyone can read fingerprints" ON public.device_fingerprints
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert fingerprints" ON public.device_fingerprints
  FOR INSERT WITH CHECK (true);

-- =========================
-- SESSOES
-- =========================
CREATE TABLE public.sessoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  ficha_url TEXT,
  exercicio_url TEXT,
  resposta_ia TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessoes" ON public.sessoes
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users insert own sessoes" ON public.sessoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================
-- PAGAMENTOS
-- =========================
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comprovativo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  verificado_por_ia BOOLEAN NOT NULL DEFAULT false,
  motivo TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pagamentos" ON public.pagamentos
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users insert own pagamentos" ON public.pagamentos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin update pagamentos" ON public.pagamentos
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- =========================
-- STORAGE
-- =========================
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Auth users upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users delete own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
