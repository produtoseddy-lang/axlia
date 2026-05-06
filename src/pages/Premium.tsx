import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Crown, CheckCircle2, Loader2, CreditCard } from "lucide-react";

const CHECKOUT_URL = "https://checkout.escalepay.com/2431514";
const WHATSAPP_NUM = "+258 85 194 9156";

const beneficios = [
  "Exercícios ilimitados",
  "Preparação para teste",
  "Matemática passo a passo",
  "Resumos para defesa",
  "Histórico guardado",
];

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useProfile();
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handlePagar = () => {
    window.open(CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  const handleJaPaguei = async () => {
    if (!user) return;
    if (!email.trim()) {
      toast.error("Indica o email usado no pagamento");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("pagamentos").insert({
        user_id: user.id,
        status: "pendente",
        email_pagamento: email.trim(),
        verificado_por_ia: false,
      });
      if (error) throw error;
      setEnviado(true);
      toast.success("Pedido enviado!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao enviar pedido");
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center bg-card border border-primary/30 rounded-2xl p-8 card-glow">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Já és Premium! 🎉</h1>
            <p className="text-muted-foreground mb-6">Aproveita todos os recursos do AXL IA sem limites.</p>
            <Button onClick={() => navigate("/dashboard")} className="bg-primary text-primary-foreground">Ir ao Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-2xl space-y-6">
          <div className="text-center">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow items-center justify-center mb-4 glow-cyan">
              <Crown className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Upgrade para Premium</h1>
            <p className="text-4xl font-bold text-primary mt-3">150 MT <span className="text-base text-muted-foreground font-normal">/ mês</span></p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-3">
            {beneficios.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span>{b}</span>
              </div>
            ))}
            <Button
              onClick={handlePagar}
              className="w-full h-14 mt-4 text-base bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              <CreditCard className="w-5 h-5 mr-2" /> Pagar 150 MT
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Já pagaste?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Após o pagamento clica no botão abaixo para activar o teu Premium.
              </p>
            </div>

            {enviado ? (
              <div className="p-4 rounded-xl border bg-success/10 border-success/30">
                <p className="font-semibold mb-2">⏳ Pagamento em verificação</p>
                <p className="text-sm text-muted-foreground">
                  Vais receber confirmação em breve. Em caso de dúvida contacta-nos no WhatsApp:{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUM.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {WHATSAPP_NUM}
                  </a>
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email que usaste no pagamento</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teu@email.com"
                  />
                </div>
                <Button
                  onClick={handleJaPaguei}
                  disabled={loading}
                  className="w-full h-12 bg-success text-white hover:bg-success/90"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A enviar...</>
                  ) : (
                    "✅ Já paguei — Activar Premium"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Premium;
