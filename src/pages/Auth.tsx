import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useAuth } from "@/hooks/useAuth";

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
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);

    try {
      // 1) verificar fingerprint via edge function
      const fingerprint = await getFingerprint();
      const { data: fpCheck } = await supabase.functions.invoke("check-fingerprint", {
        body: { fingerprint_id: fingerprint },
      });
      if (fpCheck?.exists) {
        toast.error("Este dispositivo já tem uma conta gratuita.");
        setLoading(false);
        return;
      }

      // 2) criar conta
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { nome },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Falha no registo");

      // 3) registar fingerprint
      await supabase.functions.invoke("register-fingerprint", {
        body: { fingerprint_id: fingerprint, user_id: data.user.id },
      });

      toast.success("Conta criada! 🎉");
      navigate("/quiz");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow items-center justify-center mb-4 glow-cyan">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo ao EstudaMZ</h1>
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
                    <Input id="rpass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Conta Grátis"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Ao criar conta aceitas os termos do EstudaMZ.
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
