import { Zap, BookOpen } from "lucide-react";

export type Modo = "directa" | "completa";

interface Props {
  value: Modo;
  onChange: (m: Modo) => void;
}

export const ModoResposta = ({ value, onChange }: Props) => {
  const opts: { id: Modo; icon: typeof Zap; title: string; desc: string }[] = [
    { id: "directa", icon: Zap, title: "Resposta Directa", desc: "Só a resposta final, sem explicações longas" },
    { id: "completa", icon: BookOpen, title: "Explicação Completa", desc: "Passo a passo com explicação de cada etapa" },
  ];
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Modo de resposta</label>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((o) => {
          const Icon = o.icon;
          const active = value === o.id;
          return (
            <button
              type="button"
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`text-left p-3 rounded-xl border transition ${
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 bg-background"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">{o.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{o.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
