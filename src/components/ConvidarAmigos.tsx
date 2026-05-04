import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const ConvidarAmigos = ({ codigo }: { codigo: string | null }) => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .then(({ count }) => setCount(count ?? 0));
  }, [user]);

  if (!codigo) return null;

  const link = `https://axlia.lovable.app/auth?ref=${codigo}`;
  const text = `Experimenta o AXL IA grátis! Usa o meu código ${codigo} em ${link} e ganha bónus especial 🎓✨`;

  const copyCode = () => {
    navigator.clipboard.writeText(codigo);
    toast.success("Código copiado!");
  };

  const shareWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const restantes = 3 - (count % 3);
  const proximo = count > 0 && count % 3 === 0 ? "🎉 Premium ganho!" : `Faltam ${restantes} para ganhar 7 dias Premium`;

  return (
    <div className="mb-6 p-5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-2xl card-glow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">🎁</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold">Convida amigos</h3>
          <p className="text-xs text-muted-foreground">Convida 3 amigos e ganha 7 dias Premium grátis</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
        <code className="font-mono font-bold text-primary text-sm truncate">{codigo}</code>
        <Button size="sm" variant="ghost" onClick={copyCode}>
          <Copy className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        <Gift className="w-3 h-3 inline mr-1" /> {count} amigos convidados · {proximo}
      </p>
      <Button onClick={shareWA} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
        <Share2 className="w-4 h-4 mr-2" /> Partilhar convite no WhatsApp
      </Button>
    </div>
  );
};
