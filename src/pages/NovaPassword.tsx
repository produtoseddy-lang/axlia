import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { evaluatePassword } from "@/lib/passwordStrength";

const NovaPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const strength = useMemo(() => evaluatePassword(password), [password]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setSessionReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strength.isValid) {
      toast.error("Password deve ter 8+ caracteres, 1 maiúscula e 1 número.");
      return;
    }
    if (password !== confirm) {
      toast.error("As passwords não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.auth.signOut();
    navigate("/auth", { state: { message: "Password alterada com sucesso!" }, replace: true });
  };

  const Req = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-1 text-xs ${ok ? "text-emerald-500" : "text-muted-foreground"}`}>
      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {label}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-6 card-glow">
            <h1 className="text-2xl font-bold mb-2">Nova Password</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Define a tua nova password.
            </p>
            {!sessionReady && (
              <p className="text-xs text-warning mb-4">
                A validar link de recuperação...
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="np">Nova password</Label>
                <Input
                  id="np"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, 1 maiúscula, 1 número"
                />
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          strength.score >= i ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Força:</span>
                      <span className={`text-xs font-medium ${
                        strength.score === 3 ? "text-emerald-500" :
                        strength.score === 2 ? "text-warning" : "text-destructive"
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Req ok={strength.hasMin} label="Mínimo 8 caracteres" />
                    <Req ok={strength.hasUpper} label="1 letra maiúscula" />
                    <Req ok={strength.hasNumber} label="1 número" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="cp">Confirmar password</Label>
                <Input
                  id="cp"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repete a password"
                />
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-xs text-destructive mt-1">As passwords não coincidem</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading || !strength.isValid || password !== confirm}
                className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar nova password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaPassword;
