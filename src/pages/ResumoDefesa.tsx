import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiFileUpload } from "@/components/MultiFileUpload";
import { MarkdownView } from "@/components/MarkdownView";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, GraduationCap, ArrowLeft } from "lucide-react";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { FeedbackResposta } from "@/components/FeedbackResposta";

const TIPOS_DEFESA = [
  "Trabalho de Curso",
  "Licenciatura",
  "Mestrado",
  "Monografia",
  "Relatório de Estágio",
];

const ResumoDefesa = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useProfile();
  const [material, setMaterial] = useState<File[]>([]);
  const [tema, setTema] = useState("");
  const [tipoDefesa, setTipoDefesa] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<string | null>(null);
  const [sessaoId, setSessaoId] = useState<string | null>(null);

  if (!isPremium) return <Navigate to="/premium" replace />;

  const handleSubmit = async () => {
    if (!user || material.length === 0 || !tema.trim()) return;
    setLoading(true);
    try {
      const materialUrls = await Promise.all(material.map((f) => uploadFile(f, user.id)));
      const { data, error } = await supabase.functions.invoke("resumo-defesa", {
        body: { material_urls: materialUrls, tema: tema.trim(), tipo_defesa: tipoDefesa },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResposta(data.resposta);
      const { data: sess } = await supabase.from("sessoes").insert({
        user_id: user.id,
        tipo: "defesa",
        ficha_url: materialUrls[0] ?? null,
        resposta_ia: data.resposta,
      }).select("id").maybeSingle();
      setSessaoId(sess?.id ?? null);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao gerar resumo");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (resposta) {
      navigator.clipboard.writeText(resposta);
      toast.success("Copiado!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resumos para Defesa</h1>
              <p className="text-sm text-muted-foreground">Resumo executivo, perguntas do júri e dicas.</p>
            </div>
          </div>

          {!resposta ? (
            <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-5">
              <MultiFileUpload
                label="Material do trabalho"
                files={material}
                onChange={setMaterial}
                isPremium={isPremium}
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".webp"],
                  "application/pdf": [".pdf"],
                  "application/msword": [".doc"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                }}
              />
              <div>
                <Label htmlFor="tema">Tema do trabalho</Label>
                <Input
                  id="tema"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Contabilidade Analítica nas PMEs"
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de defesa</Label>
                <Select value={tipoDefesa} onValueChange={setTipoDefesa}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Seleccionar tipo de defesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_DEFESA.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!material || !tema.trim() || loading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow disabled:bg-secondary"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A preparar a defesa...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Gerar Resumo para Defesa</>
                )}
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
                  <Copy className="w-4 h-4 mr-2" /> Copiar Resposta
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

export default ResumoDefesa;
