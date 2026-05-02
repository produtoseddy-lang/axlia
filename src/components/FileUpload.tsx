import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Camera, FileUp } from "lucide-react";
import { useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface Props {
  label: string;
  optional?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: Record<string, string[]>;
}

const DEFAULT_ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".heic"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const isMobileDevice = () =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const FileUpload = ({ label, optional, file, onChange, accept = DEFAULT_ACCEPT }: Props) => {
  const isMobileViewport = useIsMobile();
  const isMobile = isMobileViewport || isMobileDevice();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onChange(files[0]);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    disabled: isMobile,
  });

  const handlePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
    e.target.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} {optional && <span className="text-muted-foreground text-xs">(opcional)</span>}
      </label>

      {file ? (
        <div className="flex items-center justify-between bg-secondary border border-primary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm truncate">{file.name}</span>
          </div>
          <button onClick={() => onChange(null)} className="p-1 hover:bg-background rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isMobile ? (
        <div className="space-y-2">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePicked}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handlePicked}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => photoInputRef.current?.click()}
              className="h-12 border-border hover:border-primary/50"
            >
              <Camera className="w-4 h-4 mr-2" />
              Foto
            </Button>
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
            Aceita fotos, PDF, Word
          </p>
        </div>
      ) : (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Solta o ficheiro..." : "Clica ou arrasta o ficheiro aqui"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">Aceita fotos, PDF, Word (máx 10MB)</p>
          </div>
        </>
      )}
    </div>
  );
};
