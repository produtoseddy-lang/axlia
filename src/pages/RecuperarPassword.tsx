import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RecuperarPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEnviado(true);
    toast.success("Email enviado! Verifica a tua caixa de entrada.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-6 card-glow">
            <h1 className="text-2xl font-bold mb-2">Recuperar Password</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Vais receber um email com instruções para definires uma nova password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@gmail.com"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || enviado}
                className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar link de recuperação"}
              </Button>
              {enviado && (
                <p className="text-xs text-emerald-500 text-center">
                  ✅ Email enviado. Verifica também a pasta de spam.
                </p>
              )}
              <div className="text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
