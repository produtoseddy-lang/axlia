import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export const WhatsAppShare = ({ resposta }: { resposta: string }) => {
  const share = () => {
    const preview = resposta.replace(/[#*_`>\-]/g, "").trim().slice(0, 200);
    const text = `Olha o que o AXL IA resolveu para mim! 🤖✨\n\n${preview}...\n\nExperimenta grátis em: axlia.lovable.app`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };
  return (
    <Button variant="outline" onClick={share} className="flex-1 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10">
      <Share2 className="w-4 h-4 mr-2" /> 📲 Partilhar no WhatsApp
    </Button>
  );
};
