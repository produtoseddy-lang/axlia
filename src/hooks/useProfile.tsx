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

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
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

    // Check admin role from user_roles table
    const { data: roleRow } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const admin = !!roleRow;
    setIsAdmin(admin);

    if (data) {
      let updates: Partial<Profile> = {};
      const today = new Date().toISOString().slice(0, 10);

      // Admin always premium
      if (admin && data.plano !== "premium") {
        updates.plano = "premium";
      }

      // Premium expirado → free
      if (data.plano === "premium" && data.premium_ate && !admin) {
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
        data = { ...data, ...updates } as any;
      }

      setProfile(data as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isPremium = profile?.plano === "premium" || isAdmin;

  return { profile, loading, refresh: fetchProfile, isAdmin, isPremium };
};

