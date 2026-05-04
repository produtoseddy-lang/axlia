import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Zap, BookOpen, Calculator, AlertTriangle, Sparkles, Clock, GraduationCap, ChevronRight } from "lucide-react";
import { ConvidarAmigos } from "@/components/ConvidarAmigos";

interface Sessao {
  id: string;
  tipo: string;
  resposta_ia: string | null;
  criado_em: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isPremium, isAdmin } = useProfile();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessoes")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .then(({ data }) => setSessoes(data ?? []));
  }, [user]);

  const diasRestantesPremium = () => {
    if (!profile?.premium_ate) return null;
    const diff = Math.ceil((new Date(profile.premium_ate).getTime() - Date.now()) / 86400000);
    return diff;
  };
  const dias = diasRestantesPremium();

  const tools = [
    { id: "tpc", icon: Zap, emoji: "🤖", title: "Resolver TPC", desc: "Resolve exercícios no estilo do teu professor", route: "/resolver", premium: false },
    { id: "teste", icon: BookOpen, emoji: "📚", title: "Preparação para Teste", desc: "Gera perguntas simuladas do teste", route: "/preparar-teste", premium: true },
    { id: "mat", icon: Calculator, emoji: "📐", title: "Matemática Passo a Passo", desc: "Resolve com o método do professor", route: "/matematica", premium: true },
    { id: "defesa", icon: GraduationCap, emoji: "🎓", title: "Resumos para Defesa", desc: "Prepara perguntas do júri", route: "/resumo-defesa", premium: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Olá {profile?.nome ?? "aluno"}! 👋</h1>
              <p className="text-muted-foreground text-sm mt-1">O que vamos estudar hoje?</p>
            </div>
            <Badge className={isPremium ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}>
              {isPremium ? <><Crown className="w-3 h-3 mr-1" /> {isAdmin ? "ADMIN" : "PREMIUM"}</> : "FREE"}
            </Badge>
          </div>

          {/* Premium expira em breve */}
          {isPremium && !isAdmin && dias !== null && dias <= 3 && dias > 0 && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">⚠️ O teu Premium expira em {dias} dia{dias > 1 ? "s" : ""}.</span>
              </div>
              <Button size="sm" onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">Renovar</Button>
            </div>
          )}

          {/* Créditos free */}
          {!isPremium && profile && (() => {
            const usadas = 3 - profile.creditos_hoje;
            const restantes = profile.creditos_hoje;
            const esgotado = restantes === 0;
            const critico = restantes === 1;
            return (
              <div className="mb-6 p-4 bg-card border border-border rounded-xl card-glow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${critico || esgotado ? "text-destructive" : "text-primary"}`} />
                    <span className="text-sm font-medium">⚡ {usadas} de 3 perguntas usadas hoje</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate("/premium")} className="text-primary">
                    Upgrade
                  </Button>
                </div>
                <Progress
                  value={(usadas / 3) * 100}
                  className={`h-2 ${critico || esgotado ? "[&>div]:bg-destructive" : ""}`}
                />
                {esgotado && (
                  <p className="text-xs text-destructive mt-2 font-medium">
                    Voltamos amanhã às 00:00 ou faz upgrade agora
                  </p>
                )}
              </div>
            );
          })()}

          <ConvidarAmigos codigo={profile?.referral_code ?? null} />

          {/* Ferramentas */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {tools.map((t) => {
              const blocked = t.premium && !isPremium;
              return (
                <button
                  key={t.id}
                  onClick={() => blocked ? navigate("/premium") : navigate(t.route)}
                  className="text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition relative card-glow overflow-hidden"
                >
                  {/* Badge top-right */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${
                      t.premium
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black"
                        : "bg-primary/15 text-primary border border-primary/30"
                    }`}
                  >
                    {t.premium ? "PREMIUM" : "GRÁTIS"}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-2xl">
                    <span aria-hidden>{t.emoji}</span>
                  </div>
                  <h3 className="font-semibold mb-1 pr-16">{t.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>

                  {/* Locked overlay */}
                  {blocked && (
                    <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Histórico card */}
          <button
            onClick={() => navigate("/historico")}
            className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition card-glow flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                <span aria-hidden>🕐</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold">Ver Histórico</h3>
                <p className="text-xs text-muted-foreground">
                  {sessoes.length} {sessoes.length === 1 ? "sessão guardada" : "sessões guardadas"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>

          {!isPremium && (
            <div className="mt-10 p-5 bg-warning/10 border border-warning/30 rounded-xl text-center">
              <p className="text-sm">💡 Faz upgrade para Premium — 150 MT/mês para TPCs ilimitados, preparação para teste e matemática passo a passo.</p>
              <Button onClick={() => navigate("/premium")} className="mt-3 bg-primary text-primary-foreground hover:bg-primary-glow">
                Quero Premium
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
