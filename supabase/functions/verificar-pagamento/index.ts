import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, fetchUrlAsBase64 } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { comprovativo_url } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) throw new Error("Sessão inválida");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const file = await fetchUrlAsBase64(comprovativo_url);
    if (!file) throw new Error("Não foi possível ler o comprovativo");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Analisa este comprovativo M-Pesa ou e-Mola moçambicano.
Verifica se o valor é 150 MT e se a transacção foi concluída com sucesso.
Responde APENAS em JSON válido sem texto adicional, neste formato exacto:
{"aprovado": true ou false, "valor": número, "motivo": "explicação curta"}`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Verifica este comprovativo de pagamento de 150 MT." },
              { type: "image_url", image_url: { url: `data:${file.mime};base64,${file.data}` } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      throw new Error("Falha na verificação IA");
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";
    // Extract JSON from possible markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { aprovado: false, motivo: "Resposta inválida" };

    // Save pagamento
    await supabaseAdmin.from("pagamentos").insert({
      user_id: user.id,
      comprovativo_url,
      status: parsed.aprovado ? "aprovado" : "rejeitado",
      verificado_por_ia: true,
      motivo: parsed.motivo ?? null,
    });

    if (parsed.aprovado) {
      const ate = new Date();
      ate.setDate(ate.getDate() + 30);
      await supabaseAdmin.from("profiles").update({
        plano: "premium",
        premium_ate: ate.toISOString().slice(0, 10),
      }).eq("id", user.id);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
