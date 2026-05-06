import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { Crown, CheckCircle2, CreditCard } from "lucide-react";

const CHECKOUT_URL = "https://checkout.escalepay.com/2431514";

const beneficios = [
  "Exercícios ilimitados",
  "Preparação para teste",
  "Matemática passo a passo",
  "Resumos para defesa",
  "Histórico guardado",
];

const Premium = () => {
  const navigate = useNavigate();
  const { isPremium } = useProfile();

  const handlePagar = () => {
    window.open(CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  if (isPremium) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center bg-card border border-primary/30 rounded-2xl p-8 card-glow">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Já és Premium! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Aproveita todos os recursos do AXL IA sem limites.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-primary-foreground"
            >
              Ir ao Dashboard
            </Button>
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
            <p className="text-4xl font-bold text-primary mt-3">
              150 MT{" "}
              <span className="text-base text-muted-foreground font-normal">/ mês</span>
            </p>
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
            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>✓ Acesso activado automaticamente após pagamento</p>
              <p>✓ Sem confirmação manual necessária</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Premium;
