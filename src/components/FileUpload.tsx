import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { useCallback } from "react";

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

export const FileUpload = ({ label, optional, file, onChange, accept = DEFAULT_ACCEPT }: Props) => {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onChange(files[0]);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

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
            {isDragActive ? "Solta o ficheiro..." : "Clica ou arrasta o ficheiro aqui"}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">Imagens, PDF, DOC (máx 10MB)</p>
        </div>
      )}
    </div>
  );
};
