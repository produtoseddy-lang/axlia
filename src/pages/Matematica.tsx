import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownView } from "@/components/MarkdownView";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, Calculator, ArrowLeft } from "lucide-react";
import { InstrucoesIA } from "@/components/InstrucoesIA";
import { ModoResposta, type Modo } from "@/components/ModoResposta";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { FeedbackResposta } from "@/components/FeedbackResposta";

const ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const Matematica = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useProfile();
  const [exemplo, setExemplo] = useState<File | null>(null);
  const [exercicio, setExercicio] = useState<File | null>(null);
  const [instrucoes, setInstrucoes] = useState("");
  const [modo, setModo] = useState<Modo>("directa");
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<string | null>(null);
  const [sessaoId, setSessaoId] = useState<string | null>(null);

  if (!isPremium) return <Navigate to="/premium" replace />;

  const handleSubmit = async () => {
    if (!user || !exercicio) return;
    setLoading(true);
    try {
      const exUrl = await uploadFile(exercicio, user.id);
      const exemploUrl = exemplo ? await uploadFile(exemplo, user.id) : null;
      const { data, error } = await supabase.functions.invoke("resolver-matematica", {
        body: { ficha_url: exemploUrl, exercicio_url: exUrl, instrucoes, modo },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResposta(data.resposta);
      const { data: sess } = await supabase.from("sessoes").insert({
        user_id: user.id, tipo: "matematica", ficha_url: exemploUrl, exercicio_url: exUrl, resposta_ia: data.resposta,
      }).select("id").maybeSingle();
      setSessaoId(sess?.id ?? null);
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { if (resposta) { navigator.clipboard.writeText(resposta); toast.success("Copiado!"); } };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Matemática Passo a Passo</h1>
              <p className="text-sm text-muted-foreground">Replicamos o método do teu professor.</p>
            </div>
          </div>

          {!resposta ? (
            <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-5">
              <FileUpload label="Como o professor resolve" optional file={exemplo} onChange={setExemplo} accept={ACCEPT} />
              <FileUpload label="Exercício a resolver" file={exercicio} onChange={setExercicio} accept={ACCEPT} />
              <ModoResposta value={modo} onChange={setModo} />
              <InstrucoesIA
                value={instrucoes}
                onChange={setInstrucoes}
                placeholder="Ex: Resolve como o professor faz no caderno, mostra os cálculos intermédios, usa frações em vez de decimais..."
              />
              <Button onClick={handleSubmit} disabled={!exercicio || loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow disabled:bg-secondary">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A resolver...</> : <><Sparkles className="w-4 h-4 mr-2" /> Resolver Passo a Passo</>}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 card-glow">
                <MarkdownView content={resposta} />
              </div>
              <FeedbackResposta sessaoId={sessaoId} />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={copy} className="flex-1 bg-primary text-primary-foreground hover:bg-primary-glow">
                  <Copy className="w-4 h-4 mr-2" /> Copiar
                </Button>
                <WhatsAppShare resposta={resposta} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Matematica;
