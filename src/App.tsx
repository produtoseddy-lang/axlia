import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Quiz from "./pages/Quiz.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Resolver from "./pages/Resolver.tsx";
import PrepararTeste from "./pages/PrepararTeste.tsx";
import Matematica from "./pages/Matematica.tsx";
import ResumoDefesa from "./pages/ResumoDefesa.tsx";
import Premium from "./pages/Premium.tsx";
import Admin from "./pages/Admin.tsx";
import VerificarEmail from "./pages/VerificarEmail.tsx";
import VerificarCodigo from "./pages/VerificarCodigo.tsx";
import Perfil from "./pages/Perfil.tsx";
import Historico from "./pages/Historico.tsx";
import RecuperarPassword from "./pages/RecuperarPassword.tsx";
import NovaPassword from "./pages/NovaPassword.tsx";
import Convidar from "./pages/Convidar.tsx";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useIdleLogout } from "@/hooks/useIdleLogout";

const RefCodeCapture = () => {
  const [params] = useSearchParams();
  useEffect(() => {
    const ref = params.get("ref");
    if (ref) localStorage.setItem("axl_pending_ref", ref);
  }, [params]);
  return null;
};

const IdleGuard = () => {
  useIdleLogout();
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RefCodeCapture />
          <IdleGuard />
          <PWAInstallBanner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />
            <Route path="/verificar-codigo" element={<VerificarCodigo />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/nova-password" element={<NovaPassword />} />
            <Route path="/quiz" element={<ProtectedRoute requireOnboarding={false}><Quiz /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/resolver" element={<ProtectedRoute><Resolver /></ProtectedRoute>} />
            <Route path="/preparar-teste" element={<ProtectedRoute><PrepararTeste /></ProtectedRoute>} />
            <Route path="/matematica" element={<ProtectedRoute><Matematica /></ProtectedRoute>} />
            <Route path="/resumo-defesa" element={<ProtectedRoute><ResumoDefesa /></ProtectedRoute>} />
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/convidar" element={<ProtectedRoute><Convidar /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
