import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axlLogo from "@/assets/axl-logo.png";

const VerificarCodigo = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const email =
    sessionStorage.getItem("estudamz_pending_email") ||
    sessionStorage.getItem("axl_pending_email") ||
    "";

  useEffect(() => {
    if (!email) {
      navigate("/auth", { replace: true });
      return;
    }
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (idx: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = v;
    setCode(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
    if (next.every((c) => c.length === 1) && next.join("").length === 6) {
      verify(next.join(""));
    }
  };

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      const next = text.split("");
      setCode(next);
      verify(text);
    }
  };

  const verify = async (token: string) => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error("Código inválido ou expirado");
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      return;
    }
    sessionStorage.removeItem("estudamz_pending_email");
    sessionStorage.removeItem("axl_pending_email");
    toast.success("Email verificado! ✓");
    // Force reload so AuthProvider picks up the new session
    window.location.href = "/quiz";
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (error) {
      toast.error("Erro ao reenviar código");
      return;
    }
    toast.success("Novo código enviado 📧");
    setCooldown(60);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={axlLogo}
              alt="AXL IA"
              className="inline-block w-16 h-16 rounded-2xl mb-4 glow-cyan object-cover"
            />
            <h1 className="text-2xl font-bold">Verificar Email</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Enviámos um código de 6 dígitos para
            </p>
            <p className="text-sm font-medium mt-1">{email}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-6">
            <div
              className="flex justify-between gap-2"
              onPaste={handlePaste}
            >
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              ))}
            </div>

            {loading && (
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> A verificar...
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Não recebeste o código?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resend}
                disabled={cooldown > 0 || resending}
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : cooldown > 0 ? (
                  `Reenviar em ${cooldown}s`
                ) : (
                  "Reenviar código"
                )}
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/auth")}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificarCodigo;
