import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max?: number;
}

export const InstrucoesIA = ({ value, onChange, placeholder, max = 300 }: Props) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="instrucoes-ia" className="text-sm font-medium">
        📝 Instruções para a IA (opcional)
      </Label>
      <Textarea
        id="instrucoes-ia"
        rows={3}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="resize-none border-border focus-visible:ring-primary focus-visible:border-primary transition-colors"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Diz à IA exactamente como queres a resposta</span>
        <span className={value.length >= max ? "text-destructive" : ""}>
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
};
