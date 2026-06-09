import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-glow transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar
    </button>
  );
};
