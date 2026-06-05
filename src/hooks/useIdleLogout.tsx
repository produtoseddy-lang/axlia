import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Logout automático após inactividade (default: 30 min).
// Reduz risco em dispositivos partilhados.
const IDLE_MS = 30 * 60 * 1000;

export const useIdleLogout = (idleMs: number = IDLE_MS) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let timer: number | undefined;

    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        await supabase.auth.signOut();
        // Limpar artefactos sensíveis
        try {
          sessionStorage.clear();
        } catch {}
        window.location.href = "/auth?reason=idle";
      }, idleMs);
    };

    const events: string[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, idleMs]);
};
