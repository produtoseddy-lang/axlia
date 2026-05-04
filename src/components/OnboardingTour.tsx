import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, SkipForward } from "lucide-react";

const SCREENS = [
  { emoji: "🤖", title: "Resolver TPC", desc: "Carrega a ficha + exercício e a IA resolve no estilo do teu professor" },
  { emoji: "📐", title: "Matemática & Testes", desc: "Resolve matemática passo a passo e prepara-te para testes com perguntas simuladas" },
  { emoji: "🎓", title: "Resumos para Defesa", desc: "Prepara a tua defesa com perguntas do júri e resumo executivo" },
];

export const OnboardingTour = ({ onFinish }: { onFinish: () => void }) => {
  const [i, setI] = useState(0);
  const last = i === SCREENS.length - 1;
  const s = SCREENS[i];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-primary/30 rounded-3xl p-8 card-glow text-center">
        <div className="text-7xl mb-4">{s.emoji}</div>
        <h2 className="text-2xl font-bold mb-2">{s.title}</h2>
        <p className="text-muted-foreground mb-6">{s.desc}</p>

        <div className="flex justify-center gap-2 mb-6">
          {SCREENS.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-2 bg-muted"}`} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            onClick={() => last ? onFinish() : setI(i + 1)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            {last ? "Começar" : "Próximo"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" onClick={onFinish} className="w-full text-muted-foreground">
            <SkipForward className="w-4 h-4 mr-2" /> Saltar
          </Button>
        </div>
      </div>
    </div>
  );
};
