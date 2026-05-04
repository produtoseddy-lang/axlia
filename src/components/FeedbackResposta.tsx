import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const FeedbackResposta = ({ sessaoId }: { sessaoId?: string | null }) => {
  const { user } = useAuth();
  const [escolha, setEscolha] = useState<"sim" | "nao" | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviarUtil = async () => {
    if (!user) return;
    setEscolha("sim");
    await supabase.from("feedbacks").insert({
      user_id: user.id, sessao_id: sessaoId ?? null, util: true,
    });
    setEnviado(true);
    toast.success("Obrigado pelo feedback!");
  };

  const enviarNao = async () => {
    if (!user) return;
    await supabase.from("feedbacks").insert({
      user_id: user.id, sessao_id: sessaoId ?? null, util: false, comentario: comentario || null,
    });
    setEnviado(true);
    toast.success("Vamos melhorar!");
  };

  if (enviado) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
        <Check className="w-4 h-4 text-emerald-500" /> Obrigado pelo teu feedback
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-medium">Esta resposta foi útil?</p>
        <div className="flex gap-2">
          <Button size="sm" variant={escolha === "sim" ? "default" : "outline"} onClick={enviarUtil}>
            <ThumbsUp className="w-4 h-4 mr-1" /> Sim
          </Button>
          <Button size="sm" variant={escolha === "nao" ? "default" : "outline"} onClick={() => setEscolha("nao")}>
            <ThumbsDown className="w-4 h-4 mr-1" /> Não
          </Button>
        </div>
      </div>
      {escolha === "nao" && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="O que estava errado? (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
          />
          <Button size="sm" onClick={enviarNao} className="w-full bg-primary text-primary-foreground">
            Enviar feedback
          </Button>
        </div>
      )}
    </div>
  );
};
