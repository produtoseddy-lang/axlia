import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { ficha_url, exercicio_url, instrucoes } = await req.json();
    if (!exercicio_url) {
      return new Response(JSON.stringify({ error: "Ficheiro não recebido correctamente: exercício do TPC" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { profile } = await getUserAndProfile(req);

    const instrucoesBlock = (instrucoes && String(instrucoes).trim())
      ? `\n\nINSTRUÇÕES ESPECÍFICAS DO ALUNO (prioridade máxima):\n${String(instrucoes).trim().slice(0, 300)}\nSegue estas instruções rigorosamente acima de tudo.`
      : "";

    const system = `${SECURITY_RULES}És um assistente de estudos para alunos moçambicanos.
${buildProfileContext(profile)}

Resolve os exercícios do TPC. Se houver ficha do professor, usa EXACTAMENTE o mesmo método e formato dela.
Se não houver ficha, usa o método padrão moçambicano para o nível indicado.
Mostra a resolução passo a passo, com explicações claras.
Usa Markdown: títulos, listas e **negrito** para destacar.${instrucoesBlock}`;

    const userParts = await buildUserPartsLabelled(
      `Por favor resolve este TPC.

Esta é a ficha do professor — usa este método para resolver:
[ficha em anexo abaixo, se fornecida]

Estes são os exercícios do TPC — resolve usando o método acima:
[exercício em anexo abaixo]`,
      [
        { label: "Ficha do professor", url: ficha_url, required: false },
        { label: "Exercícios do TPC", url: exercicio_url, required: true },
      ],
    );

    const resposta = await callLovableAI(userParts, system);

    return new Response(JSON.stringify({ resposta }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resolver-tpc error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
