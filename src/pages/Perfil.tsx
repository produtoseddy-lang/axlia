import { BackButton } from "@/components/BackButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Crown, User } from "lucide-react";

const NIVEIS = ["5ª à 7ª classe", "8ª à 10ª classe", "11ª à 12ª classe", "Universitário"];
const ESTILOS = [
  { id: "visual", label: "Visual (exemplos e diagramas)" },
  { id: "pratico", label: "Prático (exercícios directos)" },
  { id: "leitura", label: "Leitura (explicações detalhadas)" },
  { id: "explicacao", label: "Explicação passo a passo" },
];
const OBJECTIVOS = [
  "Preparar-me para testes e exames",
  "Resolver TPCs e exercícios",
  "Entender melhor a matéria",
  "Tirar melhores notas rapidamente",
];

const Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isPremium, isAdmin, refresh, loading } = useProfile();

  const [nome, setNome] = useState("");
  const [nivelEnsino, setNivelEnsino] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [estilo, setEstilo] = useState("");
  const [objectivo, setObjectivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome ?? "");
      setNivelEnsino(profile.nivel_ensino ?? "");
      setDisciplina(profile.disciplina_ou_curso ?? "");
      setEstilo(profile.estilo_aprendizagem ?? "");
      setObjectivo(profile.objectivo_estudo ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nome: nome.trim() || null,
      nivel_ensino: nivelEnsino || null,
      disciplina_ou_curso: disciplina.trim() || null,
      estilo_aprendizagem: estilo || null,
      objectivo_estudo: objectivo || null,
    }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao guardar alterações");
      return;
    }
    toast.success("Alterações guardadas!");
    refresh();
  };

  const handleRefazerQuiz = async () => {
    if (!user) return;
    setResetting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completo: false })
      .eq("id", user.id);
    setResetting(false);
    if (error) {
      toast.error("Erro ao reiniciar quiz");
      return;
    }
    await refresh();
    navigate("/quiz");
  };

  const planoLabel = isPremium ? (isAdmin ? "ADMIN" : "PREMIUM") : "FREE";
  const expiraEm = profile?.premium_ate
    ? new Date(profile.premium_ate).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-2xl">
          <BackButton />
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">O Meu Perfil</h1>
              <p className="text-sm text-muted-foreground">Gere a tua informação e preferências.</p>
            </div>
          </div>

          {/* Plano */}
          <div className="bg-card border border-border rounded-2xl p-5 card-glow mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Plano actual</div>
              <Badge className={isPremium ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}>
                {isPremium && <Crown className="w-3 h-3 mr-1" />} {planoLabel}
              </Badge>
              {isPremium && !isAdmin && expiraEm && (
                <div className="text-xs text-muted-foreground mt-2">Expira em {expiraEm}</div>
              )}
              {isAdmin && (
                <div className="text-xs text-muted-foreground mt-2">Acesso ilimitado</div>
              )}
            </div>
            {!isPremium && (
              <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground hover:bg-primary-glow">
                Upgrade
              </Button>
            )}
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6 card-glow space-y-5">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled className="opacity-70" />
            </div>

            <div>
              <Label htmlFor="nivel">Nível de ensino</Label>
              <Select value={nivelEnsino} onValueChange={setNivelEnsino}>
                <SelectTrigger id="nivel"><SelectValue placeholder="Seleccionar nível" /></SelectTrigger>
                <SelectContent>
                  {NIVEIS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="disc">Disciplina ou curso</Label>
              <Input id="disc" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} placeholder="Ex: Matemática, Direito" maxLength={120} />
            </div>

            <div>
              <Label htmlFor="estilo">Estilo de aprendizagem</Label>
              <Select value={estilo} onValueChange={setEstilo}>
                <SelectTrigger id="estilo"><SelectValue placeholder="Seleccionar estilo" /></SelectTrigger>
                <SelectContent>
                  {ESTILOS.map((e) => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="obj">Objectivo de estudo</Label>
              <Select value={objectivo} onValueChange={setObjectivo}>
                <SelectTrigger id="obj"><SelectValue placeholder="Seleccionar objectivo" /></SelectTrigger>
                <SelectContent>
                  {OBJECTIVOS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A guardar...</> : <><Save className="w-4 h-4 mr-2" /> Guardar alterações</>}
            </Button>
          </div>

          {/* Refazer quiz */}
          <div className="mt-5 bg-card border border-border rounded-2xl p-5 card-glow flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-sm">Refazer quiz de personalização</div>
              <div className="text-xs text-muted-foreground mt-1">Volta a responder para ajustar a IA ao teu estilo.</div>
            </div>
            <Button variant="outline" onClick={handleRefazerQuiz} disabled={resetting}>
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4 mr-2" /> Refazer</>}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
