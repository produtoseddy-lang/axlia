import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, requireOnboarding = true }: { children: ReactNode; requireOnboarding?: boolean }) => {
  const { user, loading } = useAuth();
  const { profile, loading: pLoading } = useProfile();

  if (loading || (user && pLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireOnboarding && profile && !profile.onboarding_completo) return <Navigate to="/quiz" replace />;
  return <>{children}</>;
};
