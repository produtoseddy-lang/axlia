import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserParts, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { ficha_url, exercicio_url } = await req.json();
    const { profile } = await getUserAndProfile(req);

    const system = `${SECURITY_RULES}És um assistente de estudos para alunos moçambicanos.
${buildProfileContext(profile)}

Lê a ficha do professor (se fornecida) e resolve os exercícios do TPC usando EXACTAMENTE o mesmo método e formato da ficha.
Mostra a resolução passo a passo, com explicações claras.
Se não houver ficha, resolve usando o método padrão moçambicano para o nível indicado.
Usa Markdown: títulos, listas e **negrito** para destacar.`;

    const userParts = await buildUserParts(
      "Por favor resolve este TPC, seguindo o estilo do professor (se houver ficha de referência).",
      [ficha_url, exercicio_url],
    );

    const resposta = await callLovableAI(userParts, system);

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
