import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles, Check, X } from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useAuth } from "@/hooks/useAuth";
import { evaluatePassword } from "@/lib/passwordStrength";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const strength = useMemo(() => evaluatePassword(password), [password]);

  const getFingerprint = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        sessionStorage.setItem("estudamz_pending_email", email);
        toast.error("Email ainda não verificado.");
        navigate("/verificar-email");
        return;
      }
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strength.isValid) {
      toast.error("Password deve ter 8+ caracteres, 1 maiúscula e 1 número.");
      return;
    }
    setLoading(true);

    try {
      const fingerprint = await getFingerprint();
      const { data: fpCheck } = await supabase.functions.invoke("check-fingerprint", {
        body: { fingerprint_id: fingerprint },
      });
      if (fpCheck?.exists) {
        toast.error("Este dispositivo já tem uma conta gratuita.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/quiz`,
          data: { nome },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Falha no registo");

      await supabase.functions.invoke("register-fingerprint", {
        body: { fingerprint_id: fingerprint, user_id: data.user.id },
      });

      sessionStorage.setItem("estudamz_pending_email", email);
      toast.success("Conta criada! Verifica o teu email 📧");
      navigate("/verificar-email");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
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
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow items-center justify-center mb-4 glow-cyan">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo ao AXL IA</h1>
            <p className="text-muted-foreground text-sm mt-1">A IA que estuda como o teu professor</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 card-glow">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aluno@gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="rnome">Nome</Label>
                    <Input id="rnome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="O teu nome" />
                  </div>
                  <div>
                    <Label htmlFor="remail">Email</Label>
                    <Input id="remail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aluno@gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="rpass">Password</Label>
                    <Input
                      id="rpass"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres, 1 maiúscula, 1 número"
                    />

                    {/* Força da password */}
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
                  <Button
                    type="submit"
                    disabled={loading || !strength.isValid}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Conta Grátis"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Vais receber um email para confirmar a tua conta.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
