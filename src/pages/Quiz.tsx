import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Bot, Loader2, Search } from "lucide-react";

type Answers = {
  objectivo_estudo?: string;
  nivel_ensino?: string;
  disciplina_ou_curso?: string;
  estilo_aprendizagem?: string;
};

const OBJECTIVOS = [
  { id: "testes", emoji: "🎯", label: "Preparar-me para testes e exames" },
  { id: "tpc", emoji: "📝", label: "Resolver TPCs e exercícios" },
  { id: "entender", emoji: "🧠", label: "Entender melhor a matéria" },
  { id: "notas", emoji: "⚡", label: "Tirar melhores notas rapidamente" },
];

const NIVEIS = [
  { id: "5-7", emoji: "🏫", label: "5ª à 7ª classe" },
  { id: "8-10", emoji: "🏫", label: "8ª à 10ª classe" },
  { id: "11-12", emoji: "🎓", label: "11ª à 12ª classe" },
  { id: "univ", emoji: "🎓", label: "Universitário" },
];

const DISCIPLINAS = [
  { emoji: "📐", label: "Matemática" },
  { emoji: "📖", label: "Português" },
  { emoji: "🔬", label: "Ciências" },
  { emoji: "⚡", label: "Física" },
  { emoji: "🧪", label: "Química" },
  { emoji: "🗺️", label: "História" },
];

const CURSOS = [
  "Contabilidade e Gestão", "Direito", "Engenharia Informática",
  "Medicina/Enfermagem", "Arquitectura", "Economia", "Educação",
  "Engenharia Civil", "Outro",
];

const ESTILOS = [
  { id: "visual", emoji: "👁️", label: "Aprendiz Visual", desc: "Percebo melhor com exemplos e diagramas" },
  { id: "leitura", emoji: "📚", label: "Aprendiz por Leitura", desc: "Aprendo lendo e fazendo anotações" },
  { id: "pratico", emoji: "✋", label: "Aprendiz Prático", desc: "Prefiro resolver exercícios directamente" },
  { id: "explicacao", emoji: "👂", label: "Aprendiz por Explicação", desc: "Percebo melhor passo a passo" },
];

const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refresh } = useProfile();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_completo) navigate("/dashboard", { replace: true });
  }, [profile, navigate]);

  const totalSteps = 6; // 0..5
  const progress = (step / (totalSteps - 1)) * 100;

  const isUniv = answers.nivel_ensino === "univ";

  const next = () => setStep((s) => s + 1);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      objectivo_estudo: answers.objectivo_estudo,
      nivel_ensino: answers.nivel_ensino,
      disciplina_ou_curso: answers.disciplina_ou_curso,
      estilo_aprendizagem: answers.estilo_aprendizagem,
      onboarding_completo: true,
    }).eq("id", user.id);
    if (error) {
      setSaving(false);
      toast.error("Erro ao guardar perfil");
      return;
    }
    // Navigate first, then refresh in background. Dashboard's ProtectedRoute
    // will fetch a fresh profile on mount.
    navigate("/dashboard", { replace: true });
    refresh();
  };

  const Card = ({ selected, onClick, children }: any) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-3 ${
        selected ? "border-primary bg-primary/10 glow-cyan" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );

  const personalizedMsg = () => {
    const { objectivo_estudo, estilo_aprendizagem, disciplina_ou_curso } = answers;
    let msg = "🎉 Tudo pronto!\n\n";
    if (objectivo_estudo === "testes") msg += "Vou ajudar-te a preparar testes com simulações e resumos. ";
    else if (objectivo_estudo === "tpc") msg += "Vou resolver os teus TPCs no estilo do teu professor. ";
    else if (objectivo_estudo === "entender") msg += "Vou explicar a matéria de forma clara e adaptada. ";
    else msg += "Vou ajudar-te a subir de nota rapidamente. ";

    if (estilo_aprendizagem === "visual") msg += "Como és visual, vou usar tabelas, esquemas e exemplos. ";
    else if (estilo_aprendizagem === "leitura") msg += "Vou explicar com detalhe escrito. ";
    else if (estilo_aprendizagem === "pratico") msg += "Vou directo aos exercícios. ";
    else if (estilo_aprendizagem === "explicacao") msg += "Vou explicar passo a passo. ";

    if (disciplina_ou_curso) msg += `\n\nFoco principal: **${disciplina_ou_curso}** 📚`;
    return msg;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 px-4 py-8">
        <div className="max-w-xl mx-auto">
          {step > 0 && (
            <div className="mb-6">
              <Progress value={progress} className="h-1.5 bg-secondary" />
              <p className="text-xs text-muted-foreground mt-2">Passo {step} de {totalSteps - 1}</p>
            </div>
          )}

          <div key={step} className="animate-slide-in">
            {step === 0 && (
              <div className="text-center py-10">
                <div className="inline-flex w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-glow items-center justify-center mb-6 animate-pulse-glow">
                  <Bot className="w-12 h-12 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Vamos Personalizar a Tua Experiência</h1>
                <p className="text-muted-foreground mb-8">Responde algumas perguntas para receberes ajuda adaptada ao teu estilo.</p>
                <Button size="lg" onClick={next} className="bg-primary text-primary-foreground hover:bg-primary-glow glow-cyan h-12 px-8">
                  Iniciar Personalização <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Leva menos de 2 minutos</p>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">O que queres fazer com o EstudaMZ?</h2>
                <div className="space-y-3">
                  {OBJECTIVOS.map((o) => (
                    <Card key={o.id} selected={answers.objectivo_estudo === o.id} onClick={() => setAnswers({ ...answers, objectivo_estudo: o.id })}>
                      <span className="text-2xl">{o.emoji}</span>
                      <span className="font-medium">{o.label}</span>
                    </Card>
                  ))}
                </div>
                <ContinueBtn enabled={!!answers.objectivo_estudo} onClick={next} />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Qual é o teu nível de ensino?</h2>
                <div className="space-y-3">
                  {NIVEIS.map((n) => (
                    <Card key={n.id} selected={answers.nivel_ensino === n.id} onClick={() => setAnswers({ ...answers, nivel_ensino: n.id, disciplina_ou_curso: undefined })}>
                      <span className="text-2xl">{n.emoji}</span>
                      <span className="font-medium">{n.label}</span>
                    </Card>
                  ))}
                </div>
                <ContinueBtn enabled={!!answers.nivel_ensino} onClick={next} />
              </div>
            )}

            {step === 3 && !isUniv && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Qual disciplina tens mais dificuldade?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {DISCIPLINAS.map((d) => (
                    <Card key={d.label} selected={answers.disciplina_ou_curso === d.label} onClick={() => setAnswers({ ...answers, disciplina_ou_curso: d.label })}>
                      <span className="text-2xl">{d.emoji}</span>
                      <span className="font-medium">{d.label}</span>
                    </Card>
                  ))}
                </div>
                <ContinueBtn enabled={!!answers.disciplina_ou_curso} onClick={next} />
              </div>
            )}

            {step === 3 && isUniv && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Qual é o teu curso?</h2>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Pesquisar curso..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {CURSOS.filter((c) => c.toLowerCase().includes(search.toLowerCase())).map((c) => (
                    <Card key={c} selected={answers.disciplina_ou_curso === c} onClick={() => setAnswers({ ...answers, disciplina_ou_curso: c })}>
                      <span className="text-xl">🎓</span>
                      <span className="font-medium">{c}</span>
                    </Card>
                  ))}
                </div>
                <ContinueBtn enabled={!!answers.disciplina_ou_curso} onClick={next} />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Como aprendes melhor? 🧩</h2>
                <div className="space-y-3">
                  {ESTILOS.map((e) => (
                    <Card key={e.id} selected={answers.estilo_aprendizagem === e.id} onClick={() => setAnswers({ ...answers, estilo_aprendizagem: e.id })}>
                      <span className="text-2xl">{e.emoji}</span>
                      <div>
                        <div className="font-medium">{e.label}</div>
                        <div className="text-xs text-muted-foreground">{e.desc}</div>
                      </div>
                    </Card>
                  ))}
                </div>
                <ContinueBtn enabled={!!answers.estilo_aprendizagem} onClick={next} />
              </div>
            )}

            {step === 5 && (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">🎉</div>
                <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 text-left whitespace-pre-line card-glow">
                  {personalizedMsg()}
                </div>
                <Button size="lg" onClick={finish} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary-glow glow-cyan h-12 px-8 w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Começar a Estudar <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContinueBtn = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
  <Button
    onClick={onClick}
    disabled={!enabled}
    size="lg"
    className={`w-full mt-6 h-12 ${enabled ? "bg-primary text-primary-foreground hover:bg-primary-glow" : "bg-secondary text-muted-foreground"}`}
  >
    Continuar <ArrowRight className="w-4 h-4 ml-2" />
  </Button>
);

export default Quiz;
