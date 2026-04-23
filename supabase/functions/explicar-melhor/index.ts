import { corsHeaders, getUserAndProfile, buildProfileContext, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { resposta_original, duvida } = await req.json();
    if (!duvida || typeof duvida !== "string" || duvida.length > 1000) {
      throw new Error("Dúvida inválida");
    }
    const { profile } = await getUserAndProfile(req);

    const system = `${SECURITY_RULES}És um professor moçambicano paciente e experiente.
${buildProfileContext(profile)}
Explica de forma mais simples e detalhada APENAS a parte que o aluno não percebeu.
Usa exemplos do dia a dia moçambicano (mercado, machimbombo, mukapata, etc.).
Responde em Português de Moçambique. Usa Markdown.`;

    const userText = `O aluno recebeu esta resposta anteriormente:

---
${(resposta_original ?? "").slice(0, 6000)}
---

O aluno não percebeu: ${duvida}

Explica essa parte de forma mais simples.`;

    const resposta = await callLovableAI([{ type: "text", text: userText }], system);

    return new Response(JSON.stringify({ resposta }), {
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
