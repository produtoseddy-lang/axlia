import { BackButton } from "@/components/BackButton";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Gift, Crown } from "lucide-react";
import { toast } from "sonner";

interface RefRow {
  id: string;
  referred_id: string;
  pagou_premium: boolean;
  criado_em: string;
  nome?: string | null;
  email?: string | null;
  plano?: string | null;
}

const Convidar = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [refs, setRefs] = useState<RefRow[]>([]);
  const [loading, setLoading] = useState(true);

  const codigo = profile?.referral_code ?? null;

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("referrals")
        .select("id, referred_id, pagou_premium, criado_em")
        .eq("referrer_id", user.id)
        .order("criado_em", { ascending: false });

      const rows = data ?? [];
      if (rows.length > 0) {
        const ids = rows.map((r) => r.referred_id);
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome, email, plano")
          .in("id", ids);
        const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
        setRefs(
          rows.map((r) => ({
            ...r,
            nome: byId.get(r.referred_id)?.nome,
            email: byId.get(r.referred_id)?.email,
            plano: byId.get(r.referred_id)?.plano,
          })),
        );
      } else {
        setRefs([]);
      }
      setLoading(false);
    })();
  }, [user]);

  if (!codigo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-muted-foreground text-sm">A carregar…</p>
        </main>
      </div>
    );
  }

  const link = `https://axlia.lovable.app/auth?ref=${codigo}`;
  const msg = `Experimenta o AXL IA grátis! A IA que ensina no estilo do teu professor 🤖\nUsa o meu código ${codigo} ao registares e ganha acesso especial!\n👉 axlia.lovable.app`;

  const total = refs.length;
  const recompensaRegistoDada = (profile as any)?.recompensa_registo_dada ?? false;
  const recompensaPremiumDada = (profile as any)?.recompensa_premium_dada ?? false;
  const progressoRegisto = Math.min(total, 3);

  const copy = () => {
    navigator.clipboard.writeText(codigo);
    toast.success("Código copiado!");
  };
  const shareWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">🎁 Convida Amigos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Convida amigos e ganha dias Premium grátis
            </p>
          </div>

          {/* Como funciona */}
          <div className="p-5 bg-card border border-border rounded-2xl card-glow space-y-3">
            <h3 className="font-semibold">🎯 Como funciona</h3>

            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-secondary/30">
              <div className="text-sm">
                <p className="font-medium">3 amigos registados → 1 dia grátis</p>
                <p className="text-xs text-muted-foreground">Recompensa única</p>
              </div>
              {recompensaRegistoDada && (
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shrink-0">
                  ✅ Recebida
                </Badge>
              )}
            </div>

            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-secondary/30">
              <div className="text-sm">
                <p className="font-medium">Amigo paga Premium → 7 dias grátis</p>
                <p className="text-xs text-muted-foreground">Recompensa única</p>
              </div>
              {recompensaPremiumDada && (
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shrink-0">
                  ✅ Recebida
                </Badge>
              )}
            </div>
          </div>

          {/* Código */}
          <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-2xl card-glow">
            <p className="text-xs text-muted-foreground mb-2">O teu código de convite</p>
            <div className="bg-card border border-border rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
              <code className="font-mono font-bold text-primary text-lg truncate">{codigo}</code>
              <Button size="sm" variant="ghost" onClick={copy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={shareWA} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              <Share2 className="w-4 h-4 mr-2" /> Partilhar no WhatsApp
            </Button>
          </div>

          {/* Progresso registo (só se ainda não recebeu) */}
          {!recompensaRegistoDada && (
            <div className="p-5 bg-card border border-border rounded-2xl card-glow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{progressoRegisto} de 3 amigos registados</span>
                <span className="text-xs text-muted-foreground">{total} no total</span>
              </div>
              <Progress value={(progressoRegisto / 3) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Faltam {Math.max(0, 3 - total)} para ganhares 1 dia Premium
              </p>
            </div>
          )}

          <div className="p-5 bg-card border border-primary/30 rounded-2xl card-glow flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dias Premium ganhos por convites</p>
              <p className="text-2xl font-bold">
                {(recompensaRegistoDada ? 1 : 0) + (recompensaPremiumDada ? 7 : 0)} dias
              </p>
            </div>
          </div>

          {/* Lista de amigos */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4" /> Amigos convidados
            </h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">A carregar…</p>
            ) : refs.length === 0 ? (
              <div className="p-5 bg-card border border-border rounded-2xl text-center text-sm text-muted-foreground">
                Ainda não convidaste ninguém. Partilha o teu código!
              </div>
            ) : (
              <div className="space-y-2">
                {refs.map((r) => {
                  const isPremium = r.plano === "premium" || r.pagou_premium;
                  return (
                    <div key={r.id} className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.nome ?? r.email ?? "Amigo"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.criado_em).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={isPremium ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}>
                          {isPremium ? "PREMIUM" : "FREE"}
                        </Badge>
                        {r.pagou_premium && (
                          <span className="text-[10px] text-emerald-500 font-medium">✓ +7 dias ganhos</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Convidar;
