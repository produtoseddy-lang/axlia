CREATE TABLE public.notificacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  lida boolean NOT NULL DEFAULT false,
  tipo text NOT NULL DEFAULT 'sistema',
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificacoes_user ON public.notificacoes(user_id, criado_em DESC);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notificacoes"
ON public.notificacoes FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users insert own notificacoes"
ON public.notificacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notificacoes"
ON public.notificacoes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notificacoes"
ON public.notificacoes FOR DELETE
USING (auth.uid() = user_id);