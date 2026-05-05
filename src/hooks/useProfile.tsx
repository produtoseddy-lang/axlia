import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
  plano: string;
  creditos_hoje: number;
  data_reset_creditos: string;
  premium_ate: string | null;
  nivel_ensino: string | null;
  disciplina_ou_curso: string | null;
  objectivo_estudo: string | null;
  estilo_aprendizagem: string | null;
  nivel_quiz: string | null;
  onboarding_completo: boolean;
  criado_em: string;
  referral_code: string | null;
  recompensa_registo_dada?: boolean;
  recompensa_premium_dada?: boolean;
}

const ADMIN_EMAIL = "nhateazarias21@gmail.com";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    let { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (!data) {
      // fallback: insert if missing
      await supabase.from("profiles").insert({
        id: user.id,
        nome: user.user_metadata?.nome ?? user.email?.split("@")[0],
        email: user.email,
      });
      const r = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      data = r.data;
    }

    if (data) {
      let updates: Partial<Profile> = {};
      const today = new Date().toISOString().slice(0, 10);

      // Admin always premium
      if (user.email === ADMIN_EMAIL && data.plano !== "premium") {
        updates.plano = "premium";
      }

      // Premium expirado → free
      if (data.plano === "premium" && data.premium_ate && user.email !== ADMIN_EMAIL) {
        if (new Date(data.premium_ate) < new Date(today)) {
          updates.plano = "free";
          updates.premium_ate = null;
        }
      }

      // Reset créditos diários
      if ((updates.plano ?? data.plano) === "free" && data.data_reset_creditos !== today) {
        updates.creditos_hoje = 3;
        updates.data_reset_creditos = today;
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from("profiles").update(updates).eq("id", user.id);
        data = { ...data, ...updates } as Profile;
      }

      setProfile(data as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isPremium = profile?.plano === "premium" || isAdmin;

  return { profile, loading, refresh: fetchProfile, isAdmin, isPremium };
};
