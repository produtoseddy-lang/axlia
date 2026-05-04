import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownView } from "@/components/MarkdownView";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstrucoesIA } from "@/components/InstrucoesIA";
import { ModoResposta, type Modo } from "@/components/ModoResposta";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { FeedbackResposta } from "@/components/FeedbackResposta";

const Resolver = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isPremium, refresh } = useProfile();
  const [ficha, setFicha] = useState<File | null>(null);
  const [tpc, setTpc] = useState<File | null>(null);
  const [instrucoes, setInstrucoes] = useState("");
  const [modo, setModo] = useState<Modo>("directa");
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<string | null>(null);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSubmit = async () => {
    if (!user || !tpc) return;

    if (!isPremium && (profile?.creditos_hoje ?? 0) <= 0) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    try {
      const tpcUrl = await uploadFile(tpc, user.id);
      const fichaUrl = ficha ? await uploadFile(ficha, user.id) : null;

      // Decrementar crédito antes de chamar a IA (se free)
      if (!isPremium) {
        await supabase.from("profiles").update({
          creditos_hoje: (profile!.creditos_hoje - 1),
        }).eq("id", user.id);
      }

      const { data, error } = await supabase.functions.invoke("resolver-tpc", {
        body: { ficha_url: fichaUrl, exercicio_url: tpcUrl, instrucoes, modo },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const r = data.resposta as string;
      setResposta(r);

      const { data: sess } = await supabase.from("sessoes").insert({
        user_id: user.id,
        tipo: "tpc",
        ficha_url: fichaUrl,
        exercicio_url: tpcUrl,
        resposta_ia: r,
      }).select("id").maybeSingle();
      setSessaoId(sess?.id ?? null);
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao resolver TPC");
      // restituir crédito em erro
      if (!isPremium && profile) {
        await supabase.from("profiles").update({
          creditos_hoje: profile.creditos_hoje,
        }).eq("id", user.id);
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (resposta) {
      navigator.clipboard.writeText(resposta);
      toast.success("Resposta copiada!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resolver TPC</h1>
              <p className="text-sm text-muted-foreground">Carrega o teu exercício e a IA resolve no estilo do professor.</p>
            </div>
          </div>

          {!resposta ? (
            <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-5">
              <FileUpload label="Ficha do Professor" optional file={ficha} onChange={setFicha} />
              <FileUpload label="Exercícios do TPC" file={tpc} onChange={setTpc} />
              <ModoResposta value={modo} onChange={setModo} />
              <InstrucoesIA
                value={instrucoes}
                onChange={setInstrucoes}
                placeholder="Ex: Resolve em tópicos, usa linguagem simples, mostra cada passo separado, não uses fórmulas complexas..."
              />
              <Button onClick={handleSubmit} disabled={!tpc || loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow disabled:bg-secondary disabled:text-muted-foreground">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A IA está a analisar...</> : <><Sparkles className="w-4 h-4 mr-2" /> Resolver com IA</>}
              </Button>
              {!isPremium && profile && (
                <p className="text-xs text-center text-muted-foreground">
                  Tens {profile.creditos_hoje} créditos restantes hoje
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 card-glow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="font-semibold text-primary pt-1">AXL IA</div>
                </div>
                <MarkdownView content={resposta} />
              </div>
              <FeedbackResposta sessaoId={sessaoId} />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copy} className="flex-1"><Copy className="w-4 h-4 mr-2" /> Copiar</Button>
                <WhatsAppShare resposta={resposta} />
                <Button onClick={() => { setResposta(null); setSessaoId(null); setFicha(null); setTpc(null); setInstrucoes(""); }} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
                  Resolver outro
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sem créditos por hoje 😅</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Já usaste os teus 3 créditos diários. Faz upgrade para Premium e tem TPCs ilimitados.</p>
          <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground hover:bg-primary-glow">
            Quero Premium — 150 MT/mês
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resolver;
