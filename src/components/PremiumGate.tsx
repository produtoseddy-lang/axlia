import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Crown, Loader2 } from "lucide-react";

export const PremiumGate = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isPremium, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Dialog open onOpenChange={(o) => { if (!o) navigate("/dashboard"); }}>
          <DialogContent>
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-2 glow-cyan">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <DialogTitle>Ferramenta exclusiva Premium</DialogTitle>
              <DialogDescription>
                Faz upgrade para Premium e desbloqueia esta e todas as outras ferramentas avançadas do AXL IA.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => navigate("/premium")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
              >
                <Crown className="w-4 h-4 mr-2" /> Quero Premium — 150 MT/mês
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <>{children}</>;
};
