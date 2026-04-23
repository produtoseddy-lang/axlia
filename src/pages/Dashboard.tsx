import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarkdownView } from "@/components/MarkdownView";
import { Crown, Lock, Zap, BookOpen, Calculator, AlertTriangle, Sparkles, History, HelpCircle, GraduationCap } from "lucide-react";
import { ExplicarMelhorDialog } from "@/components/ExplicarMelhorDialog";

interface Sessao {
  id: string;
  tipo: string;
  resposta_ia: string | null;
  criado_em: string;
}

const tipoIcone = (t: string) => t === "tpc" ? Zap : t === "teste" ? BookOpen : t === "defesa" ? GraduationCap : Calculator;
const tipoLabel = (t: string) => t === "tpc" ? "Resolver TPC" : t === "teste" ? "Preparação para Teste" : t === "defesa" ? "Resumo para Defesa" : "Matemática";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isPremium, isAdmin } = useProfile();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [openSessao, setOpenSessao] = useState<Sessao | null>(null);
  const [openExplicar, setOpenExplicar] = useState<Sessao | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessoes")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(10)
      .then(({ data }) => setSessoes(data ?? []));
  }, [user]);

  const diasRestantesPremium = () => {
    if (!profile?.premium_ate) return null;
    const diff = Math.ceil((new Date(profile.premium_ate).getTime() - Date.now()) / 86400000);
    return diff;
  };
  const dias = diasRestantesPremium();

  const tools = [
    { id: "tpc", icon: Zap, title: "Resolver TPC", desc: "Carrega o exercício e recebe a solução completa", route: "/resolver", premium: false },
    { id: "teste", icon: BookOpen, title: "Preparação para Teste", desc: "Resumos, simulações e respostas modelo", route: "/preparar-teste", premium: true },
    { id: "mat", icon: Calculator, title: "Matemática Passo a Passo", desc: "Resolve com fórmulas explicadas", route: "/matematica", premium: true },
    { id: "defesa", icon: GraduationCap, title: "Resumos para Defesa 🎓", desc: "Prepara a tua defesa com perguntas do júri e resumo", route: "/resumo-defesa", premium: true },
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
          {!isPremium && profile && (
            <div className="mb-6 p-4 bg-card border border-border rounded-xl card-glow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{profile.creditos_hoje} de 3 créditos restantes hoje</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate("/premium")} className="text-primary">
                  Upgrade
                </Button>
              </div>
              <Progress value={(profile.creditos_hoje / 3) * 100} className="h-2" />
            </div>
          )}

          {/* Ferramentas */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {tools.map((t) => {
              const blocked = t.premium && !isPremium;
              return (
                <button
                  key={t.id}
                  onClick={() => blocked ? navigate("/premium") : navigate(t.route)}
                  className="text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition relative card-glow"
                >
                  {blocked && (
                    <div className="absolute top-3 right-3 p-1.5 bg-primary/10 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <t.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{t.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                  {t.premium && (
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">PREMIUM</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Histórico */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Histórico de Sessões
            </h2>
            {sessoes.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                Ainda não tens sessões. Começa por resolver um TPC!
              </div>
            ) : (
              <div className="space-y-2">
                {sessoes.map((s) => {
                  const Icon = tipoIcone(s.tipo);
                  return (
                    <div key={s.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{tipoLabel(s.tipo)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(s.criado_em).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => setOpenSessao(s)} className="text-primary">
                          Ver resposta
                        </Button>
                        {s.resposta_ia && (
                          <Button size="sm" variant="ghost" onClick={() => setOpenExplicar(s)} className="text-foreground hidden sm:inline-flex">
                            <HelpCircle className="w-3.5 h-3.5 mr-1" /> Pedir explicação
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

      <Dialog open={!!openSessao} onOpenChange={(o) => !o && setOpenSessao(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openSessao && tipoLabel(openSessao.tipo)}</DialogTitle>
          </DialogHeader>
          {openSessao?.resposta_ia && <MarkdownView content={openSessao.resposta_ia} />}
          {openSessao?.resposta_ia && (
            <Button
              variant="outline"
              className="mt-3 w-full sm:hidden"
              onClick={() => {
                setOpenExplicar(openSessao);
                setOpenSessao(null);
              }}
            >
              <HelpCircle className="w-4 h-4 mr-2" /> Pedir explicação
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <ExplicarMelhorDialog
        open={!!openExplicar}
        onOpenChange={(o) => !o && setOpenExplicar(null)}
        respostaOriginal={openExplicar?.resposta_ia ?? ""}
      />
    </div>
  );
};

export default Dashboard;
