import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownView } from "@/components/MarkdownView";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, BookOpen, ArrowLeft } from "lucide-react";
import { InstrucoesIA } from "@/components/InstrucoesIA";
import { ModoResposta, type Modo } from "@/components/ModoResposta";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { FeedbackResposta } from "@/components/FeedbackResposta";
import { Navigate } from "react-router-dom";

const PrepararTeste = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useProfile();
  const [ficha, setFicha] = useState<File | null>(null);
  const [exercicios, setExercicios] = useState<File | null>(null);
  const [tema, setTema] = useState("");
  const [instrucoes, setInstrucoes] = useState("");
  const [modo, setModo] = useState<Modo>("directa");
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<string | null>(null);
  const [sessaoId, setSessaoId] = useState<string | null>(null);

  if (!isPremium) return <Navigate to="/premium" replace />;

  const handleSubmit = async () => {
    if (!user || !exercicios) return;
    setLoading(true);
    try {
      const exUrl = await uploadFile(exercicios, user.id);
      const fichaUrl = ficha ? await uploadFile(ficha, user.id) : null;
      const { data, error } = await supabase.functions.invoke("preparar-teste", {
        body: { ficha_url: fichaUrl, exercicio_url: exUrl, tema, instrucoes, modo },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResposta(data.resposta);
      const { data: sess } = await supabase.from("sessoes").insert({
        user_id: user.id, tipo: "teste", ficha_url: fichaUrl, exercicio_url: exUrl, resposta_ia: data.resposta,
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
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Preparação para Teste</h1>
              <p className="text-sm text-muted-foreground">Resumo + simulações com respostas modelo.</p>
            </div>
          </div>

          {!resposta ? (
            <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-5">
              <FileUpload label="Ficha do Professor" optional file={ficha} onChange={setFicha} />
              <FileUpload label="Exercícios já feitos" file={exercicios} onChange={setExercicios} />
              <div>
                <Label htmlFor="tema">Tema do teste</Label>
                <Input id="tema" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex: Equações de 2º grau" />
              </div>
              <ModoResposta value={modo} onChange={setModo} />
              <InstrucoesIA
                value={instrucoes}
                onChange={setInstrucoes}
                placeholder="Ex: Foca nos tópicos de termodinâmica, cria perguntas de desenvolvimento, não de escolha múltipla..."
              />
              <Button onClick={handleSubmit} disabled={!exercicios || loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow disabled:bg-secondary">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A preparar...</> : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Preparação</>}
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

export default PrepararTeste;
