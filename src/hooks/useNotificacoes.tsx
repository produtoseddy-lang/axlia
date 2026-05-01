import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export interface Notificacao {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: string;
  criado_em: string;
}

export const useNotificacoes = () => {
  const { user } = useAuth();
  const { profile, isPremium, isAdmin } = useProfile();
  const [items, setItems] = useState<Notificacao[]>([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(20);
    setItems(data ?? []);
  }, [user]);

  // Auto-create notifications based on profile state.
  // Anti-duplicação: não cria se já existir uma NÃO LIDA do mesmo tipo criada hoje.
  useEffect(() => {
    if (!user || !profile) return;
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: hojeNaoLidas } = await supabase
        .from("notificacoes")
        .select("tipo")
        .eq("user_id", user.id)
        .eq("lida", false)
        .gte("criado_em", startOfDay.toISOString());
      const tiposExistentes = new Set((hojeNaoLidas ?? []).map((n) => n.tipo));
      const toInsert: any[] = [];

      // Premium expira em 3 dias
      if (isPremium && !isAdmin && profile.premium_ate) {
        const dias = Math.ceil(
          (new Date(profile.premium_ate).getTime() - Date.now()) / 86400000,
        );
        if (dias > 0 && dias <= 3 && !tiposExistentes.has("premium")) {
          toInsert.push({
            user_id: user.id,
            titulo: "⚠️ Premium expira em breve",
            mensagem: `O teu Premium expira em ${dias} dia${dias > 1 ? "s" : ""}. Renova para não perder acesso.`,
            tipo: "premium",
          });
        }
      }

      // Último crédito do dia
      if (!isPremium && profile.creditos_hoje === 1 && !tiposExistentes.has("creditos")) {
        toInsert.push({
          user_id: user.id,
          titulo: "⏳ Último crédito do dia",
          mensagem: "Tens apenas 1 crédito grátis restante hoje. Faz upgrade para Premium para uso ilimitado.",
          tipo: "creditos",
        });
      }

      if (toInsert.length > 0) {
        await supabase.from("notificacoes").insert(toInsert);
      }
      fetchAll();
    })();
  }, [user, profile, isPremium, isAdmin, fetchAll]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes", filter: `user_id=eq.${user.id}` },
        () => fetchAll(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, fetchAll]);

  const marcarLida = async (id: string) => {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const marcarTodasLidas = async () => {
    if (!user) return;
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
    setItems((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const naoLidas = items.filter((n) => !n.lida).length;

  return { items, naoLidas, marcarLida, marcarTodasLidas, refresh: fetchAll };
};
