import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { ficha_url, exercicio_url, instrucoes, modo } = body;
    const ficha_urls: string[] = body.ficha_urls ?? (ficha_url ? [ficha_url] : []);
    const exercicio_urls: string[] = body.exercicio_urls ?? (exercicio_url ? [exercicio_url] : []);
    if (exercicio_urls.length === 0) {
      return new Response(JSON.stringify({ error: "Ficheiro não recebido correctamente: exercício do TPC" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { profile } = await getUserAndProfile(req);

    const instrucoesBlock = (instrucoes && String(instrucoes).trim())
      ? `\n\nINSTRUÇÕES ESPECÍFICAS DO ALUNO (prioridade máxima):\n${String(instrucoes).trim().slice(0, 300)}\nSegue estas instruções rigorosamente acima de tudo.`
      : "";

    const modoBlock = modo === "completa"
      ? `\n\nMODO DE RESPOSTA: Explica cada passo detalhadamente com todo o raciocínio.`
      : `\n\nMODO DE RESPOSTA: Dá apenas a resposta final de forma directa e concisa.`;

    const system = `${SECURITY_RULES}És um assistente de estudos para alunos moçambicanos.
${buildProfileContext(profile)}

Resolve os exercícios do TPC. Se houver ficha do professor, usa EXACTAMENTE o mesmo método e formato dela.
Se não houver ficha, usa o método padrão moçambicano para o nível indicado.
Usa Markdown: títulos, listas e **negrito** para destacar.${modoBlock}${instrucoesBlock}`;

    const userParts = await buildUserPartsLabelled(
      `Por favor resolve este TPC.

Esta é a ficha do professor — usa este método para resolver:
[ficha em anexo abaixo, se fornecida]

Estes são os exercícios do TPC — resolve usando o método acima:
[exercício em anexo abaixo]`,
      [
        { label: "Ficha do professor", urls: ficha_urls, required: false },
        { label: "Exercícios do TPC", urls: exercicio_urls, required: true },
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
