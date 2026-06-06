import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Camera, FileUp, Lock, Sparkles } from "lucide-react";
import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface Props {
  label: string;
  optional?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  isPremium: boolean;
  accept?: Record<string, string[]>;
}

const DEFAULT_ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".heic"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const FREE_MAX = 1;
const PREMIUM_MAX = 10;

const isMobileDevice = () =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const MultiFileUpload = ({
  label,
  optional,
  files,
  onChange,
  isPremium,
  accept = DEFAULT_ACCEPT,
}: Props) => {
  const navigate = useNavigate();
  const isMobileViewport = useIsMobile();
  const isMobile = isMobileViewport || isMobileDevice();

  const maxFiles = isPremium ? PREMIUM_MAX : FREE_MAX;
  const remaining = maxFiles - files.length;
  const limitReached = files.length >= maxFiles;

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;
      if (!isPremium && files.length + incoming.length > FREE_MAX) {
        toast.error("Upgrade para Premium para fazer upload de múltiplos ficheiros");
        const allowed = Math.max(0, FREE_MAX - files.length);
        if (allowed > 0) onChange([...files, ...incoming.slice(0, allowed)]);
        return;
      }
      if (files.length + incoming.length > maxFiles) {
        toast.error(`Máximo ${maxFiles} ficheiros por campo`);
        const allowed = Math.max(0, maxFiles - files.length);
        if (allowed > 0) onChange([...files, ...incoming.slice(0, allowed)]);
        return;
      }
      onChange([...files, ...incoming]);
    },
    [files, isPremium, maxFiles, onChange],
  );

  const onDrop = useCallback((accepted: File[]) => addFiles(accepted), [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: isPremium,
    maxSize: 10 * 1024 * 1024,
    disabled: isMobile || limitReached,
  });

  const handlePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) addFiles(picked);
    e.target.value = "";
  };

  const removeAt = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">
          {label} {optional && <span className="text-muted-foreground text-xs">(opcional)</span>}
        </label>
        {isPremium && (
          <span className="text-xs text-muted-foreground">
            {files.length} de {PREMIUM_MAX} ficheiros
          </span>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mb-2">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between bg-secondary border border-primary/30 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm truncate">{f.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="p-1 hover:bg-background rounded"
                aria-label="Remover ficheiro"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {limitReached && !isPremium ? (
        <button
          type="button"
          onClick={() => navigate("/premium")}
          className="w-full border-2 border-dashed border-primary/30 rounded-xl p-4 text-center bg-primary/5 hover:bg-primary/10 transition"
        >
          <Lock className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-sm font-medium">
            Upgrade para Premium para fazer upload de múltiplos ficheiros
          </p>
          <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Até 10 ficheiros por campo
          </p>
        </button>
      ) : limitReached ? null : isMobile ? (
        <div className="space-y-2">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple={isPremium}
            className="hidden"
            onChange={handlePicked}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple={isPremium}
            className="hidden"
            onChange={handlePicked}
          />
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="h-12 border-border hover:border-primary/50">
                  <Camera className="w-4 h-4 mr-2" />
                  Foto
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <button
                  type="button"
                  onClick={() => {
                    const el = photoInputRef.current;
                    if (!el) return;
                    el.setAttribute("capture", "environment");
                    el.click();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                >
                  📷 Tirar foto agora
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = photoInputRef.current;
                    if (!el) return;
                    el.removeAttribute("capture");
                    el.click();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                >
                  🖼️ Escolher da galeria
                </button>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="outline"
              onClick={() => docInputRef.current?.click()}
              className="h-12 border-border hover:border-primary/50"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Documento
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/70 text-center">
            {isPremium
              ? `Podes adicionar mais ${remaining} ficheiro${remaining === 1 ? "" : "s"}`
              : "Aceita fotos, PDF, Word"}
          </p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Solta os ficheiros..."
              : files.length > 0
              ? "Adiciona mais ficheiros"
              : "Clica ou arrasta o ficheiro aqui"}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Aceita fotos, PDF, Word (máx 10MB){isPremium ? ` · ${remaining} restante${remaining === 1 ? "" : "s"}` : ""}
          </p>
        </div>
      )}
    </div>
  );
};
