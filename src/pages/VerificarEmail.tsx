import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const VerificarEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("estudamz_pending_email");
    if (stored) setEmail(stored);

    // If already verified, go straight to quiz
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email_confirmed_at) {
        navigate("/quiz", { replace: true });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        sessionStorage.removeItem("estudamz_pending_email");
        navigate("/quiz", { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email não disponível. Volta a tentar registar.");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/quiz` },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Email reenviado! Verifica a tua caixa de entrada.");
  };

  const handleCheck = async () => {
    setChecking(true);
    const { data, error } = await supabase.auth.refreshSession();
    setChecking(false);
    if (error || !data.user) {
      toast.error("Ainda não verificámos o teu email. Clica no link recebido.");
      return;
    }
    if (data.user.email_confirmed_at) {
      sessionStorage.removeItem("estudamz_pending_email");
      toast.success("Email verificado! 🎉");
      navigate("/quiz", { replace: true });
    } else {
      toast.error("Email ainda não verificado.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow items-center justify-center mb-5 glow-cyan">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verifica o teu email 📧</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enviámos um link de confirmação para{" "}
            <span className="text-foreground font-medium">{email || "o teu email"}</span>.
            Clica no link para activar a tua conta.
          </p>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 card-glow">
            <Button
              onClick={handleCheck}
              disabled={checking}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Já verifiquei</>
              )}
            </Button>
            <Button
              onClick={handleResend}
              disabled={resending}
              variant="outline"
              className="w-full"
            >
              {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reenviar email"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Não recebeste? Verifica também a pasta de spam.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificarEmail;
