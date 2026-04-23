import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "@/components/MarkdownView";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  respostaOriginal: string;
}

export const ExplicarMelhorDialog = ({ open, onOpenChange, respostaOriginal }: Props) => {
  const [duvida, setDuvida] = useState("");
  const [loading, setLoading] = useState(false);
  const [explicacao, setExplicacao] = useState<string>("");

  const handleClose = (o: boolean) => {
    if (!o) {
      setDuvida("");
      setExplicacao("");
    }
    onOpenChange(o);
  };

  const handleExplain = async () => {
    if (!duvida.trim()) {
      toast.error("Descreve o que não percebeste.");
      return;
    }
    setLoading(true);
    setExplicacao("");
    const { data, error } = await supabase.functions.invoke("explicar-melhor", {
      body: { resposta_original: respostaOriginal, duvida },
    });
    setLoading(false);
    if (error || !data?.resposta) {
      toast.error(error?.message ?? "Falha a gerar explicação");
      return;
    }
    setExplicacao(data.resposta);
  };

  const resumo = respostaOriginal.length > 500
    ? respostaOriginal.slice(0, 500) + "…"
    : respostaOriginal;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Pedir explicação
          </DialogTitle>
          <DialogDescription>
            Diz-nos exactamente o que não percebeste e a IA explica de forma mais simples.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground max-h-40 overflow-y-auto">
          <div className="font-semibold text-foreground mb-1">Resposta original (resumo):</div>
          <div className="whitespace-pre-wrap">{resumo}</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">O que não percebeste?</label>
          <Textarea
            value={duvida}
            onChange={(e) => setDuvida(e.target.value)}
            placeholder="Ex: Não percebi o passo 2 da resolução"
            rows={3}
            maxLength={1000}
          />
        </div>

        <Button
          onClick={handleExplain}
          disabled={loading || !duvida.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A explicar…</> : "Explicar"}
        </Button>

        {explicacao && (
          <div className="bg-card border border-border rounded-xl p-4 mt-2">
            <MarkdownView content={explicacao} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
