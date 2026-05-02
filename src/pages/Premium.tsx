import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Loader2, Crown, Smartphone, CheckCircle2, XCircle } from "lucide-react";

const MPESA_NUM = "85 194 9156";
const EMOLA_NUM = "87 945 7808";

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, refresh } = useProfile();
  const [comprovativo, setComprovativo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ aprovado: boolean; motivo?: string } | null>(null);

  const handleVerify = async () => {
    if (!user || !comprovativo) return;
    setLoading(true);
    setResult(null);
    try {
      const url = await uploadFile(comprovativo, user.id);
      const { data, error } = await supabase.functions.invoke("verificar-pagamento", {
        body: { comprovativo_url: url },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult({ aprovado: data.aprovado, motivo: data.motivo });
      if (data.aprovado) {
        toast.success("Premium activado! 🎉");
        await refresh();
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao verificar");
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
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow items-center justify-center mb-4 glow-cyan">
              <Crown className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Upgrade para Premium</h1>
            <p className="text-muted-foreground mt-2">150 MT / mês — TPCs ilimitados, preparação para teste e matemática passo a passo</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-card border border-border rounded-2xl p-5 card-glow">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="font-semibold">M-Pesa</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Envia 150 MT para:</p>
              <p className="text-lg font-bold text-primary">{MPESA_NUM}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 card-glow">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="font-semibold">e-Mola</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Envia 150 MT para:</p>
              <p className="text-lg font-bold text-primary">{EMOLA_NUM}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-4">
            <FileUpload
              label="Comprovativo (screenshot)"
              file={comprovativo}
              onChange={setComprovativo}
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            />
            <Button onClick={handleVerify} disabled={!comprovativo || loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow disabled:bg-secondary">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A verificar com IA...</> : "Verificar Pagamento"}
            </Button>

            {result && (
              <div className={`p-4 rounded-xl border ${result.aprovado ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {result.aprovado ? <><CheckCircle2 className="w-5 h-5 text-success" /> Premium activado! 🎉</> : <><XCircle className="w-5 h-5 text-destructive" /> Não foi possível aprovar</>}
                </div>
                {result.motivo && <p className="text-sm text-muted-foreground">{result.motivo}</p>}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Premium;
