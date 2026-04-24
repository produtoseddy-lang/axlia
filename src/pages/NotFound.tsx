import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6" aria-hidden>😕</div>
          <h1 className="text-3xl font-bold mb-3">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            Esta página não existe ou foi movida.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary text-primary-foreground hover:bg-primary-glow h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
