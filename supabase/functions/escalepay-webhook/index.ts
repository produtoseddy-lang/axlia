import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log("Escalepay webhook payload:", JSON.stringify(body));

    // Try to extract fields from common payload shapes
    const email: string | undefined =
      body.email ?? body.customer_email ?? body.customer?.email ?? body.data?.email;
    const status: string | undefined =
      body.status ?? body.payment_status ?? body.data?.status;

    if (!email) {
      return new Response(JSON.stringify({ error: "missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const approved = ["approved", "paid", "completed", "success", "confirmed"].includes(
      String(status ?? "").toLowerCase()
    );

    if (!approved) {
      return new Response(JSON.stringify({ ok: true, ignored: true, status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user by email — first by profiles, then fallback to pagamentos.email_pagamento
    let { data: profile } = await supabase
      .from("profiles")
      .select("id, premium_ate")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      const { data: pag } = await supabase
        .from("pagamentos")
        .select("user_id")
        .eq("email_pagamento", email)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (pag?.user_id) {
        const { data: p2 } = await supabase
          .from("profiles")
          .select("id, premium_ate")
          .eq("id", pag.user_id)
          .maybeSingle();
        profile = p2 ?? null;
      }
    }

    if (!profile) {
      console.log("User not found for email:", email);
      return new Response(JSON.stringify({ error: "user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hoje = new Date();
    const base =
      profile.premium_ate && new Date(profile.premium_ate) > hoje
        ? new Date(profile.premium_ate)
        : hoje;
    base.setDate(base.getDate() + 30);
    const premiumAte = base.toISOString().slice(0, 10);

    await supabase
      .from("profiles")
      .update({ plano: "premium", premium_ate: premiumAte })
      .eq("id", profile.id);

    await supabase.from("pagamentos").insert({
      user_id: profile.id,
      status: "aprovado",
      verificado_por_ia: false,
      email_pagamento: email,
    });

    await supabase.from("notificacoes").insert({
      user_id: profile.id,
      titulo: "🎉 Premium Activado!",
      mensagem:
        "O teu pagamento foi confirmado. Tens acesso ilimitado por 30 dias. Bom estudo!",
      tipo: "recompensa",
      lida: false,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
