import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarkdownView } from "@/components/MarkdownView";
import { ExplicarMelhorDialog } from "@/components/ExplicarMelhorDialog";
import { BackButton } from "@/components/BackButton";
import { HelpCircle, History as HistoryIcon } from "lucide-react";

interface Sessao {
  id: string;
  tipo: string;
  resposta_ia: string | null;
  criado_em: string;
}

const tipoEmoji = (t: string) => t === "tpc" ? "🤖" : t === "teste" ? "📚" : t === "defesa" ? "🎓" : "📐";
const tipoLabel = (t: string) =>
  t === "tpc" ? "Resolver TPC" :
  t === "teste" ? "Preparação para Teste" :
  t === "defesa" ? "Resumo para Defesa" :
  "Matemática";

const Historico = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSessao, setOpenSessao] = useState<Sessao | null>(null);
  const [openExplicar, setOpenExplicar] = useState<Sessao | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessoes")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .then(({ data }) => {
        setSessoes(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const formatData = (d: string) =>
    new Date(d).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-4xl">
          <BackButton />

          <div className="flex items-center gap-2 mb-6">
            <HistoryIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Histórico de Sessões</h1>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-10 text-sm">A carregar…</div>
          ) : sessoes.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
              Ainda não tens sessões guardadas. Começa por resolver um TPC!
            </div>
          ) : (
            <div className="space-y-3">
              {sessoes.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-xl p-4 card-glow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                      <span aria-hidden>{tipoEmoji(s.tipo)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{tipoLabel(s.tipo)}</div>
                      <div className="text-xs text-muted-foreground">{formatData(s.criado_em)}</div>
                    </div>
                  </div>

                  {s.resposta_ia && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {s.resposta_ia.replace(/[#*`_>-]/g, "").slice(0, 100)}…
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setOpenSessao(s)} className="text-primary border-primary/30">
                      Ver resposta completa
                    </Button>
                    {s.resposta_ia && (
                      <Button size="sm" variant="ghost" onClick={() => setOpenExplicar(s)}>
                        <HelpCircle className="w-3.5 h-3.5 mr-1" /> Pedir explicação
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!openSessao} onOpenChange={(o) => !o && setOpenSessao(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openSessao && `${tipoEmoji(openSessao.tipo)} ${tipoLabel(openSessao.tipo)}`}</DialogTitle>
          </DialogHeader>
          {openSessao?.resposta_ia && <MarkdownView content={openSessao.resposta_ia} />}
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

export default Historico;
