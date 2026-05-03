import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { ficha_url, exercicio_url, tema, instrucoes, modo } = await req.json();
    const { profile } = await getUserAndProfile(req);

    const instrucoesBlock = (instrucoes && String(instrucoes).trim())
      ? `\n\nINSTRUÇÕES ESPECÍFICAS DO ALUNO (prioridade máxima):\n${String(instrucoes).trim().slice(0, 300)}\nSegue estas instruções rigorosamente acima de tudo.`
      : "";

    const modoBlock = modo === "completa"
      ? `\n\nMODO DE RESPOSTA: Explica cada passo detalhadamente com todo o raciocínio em cada resposta modelo.`
      : `\n\nMODO DE RESPOSTA: Dá apenas as respostas finais de forma directa e concisa, sem explicações longas.`;

    const system = `${SECURITY_RULES}És um professor moçambicano experiente.
${buildProfileContext(profile)}

Com base no material fornecido (ficha + exercícios já feitos) e no tema do teste, gera:

1. **Resumo dos tópicos mais importantes** sobre o tema
2. **5 perguntas simuladas** similares ao que pode aparecer no teste
3. **Respostas modelo** para cada pergunta

Usa Markdown bem formatado, com títulos, listas numeradas e exemplos.${modoBlock}${instrucoesBlock}`;

    const userParts = await buildUserPartsLabelled(
      `Tema do teste: ${tema || "não especificado"}

Esta é a ficha do professor:
[ficha em anexo abaixo, se fornecida]

Estes são os exercícios já feitos pelo aluno:
[exercícios em anexo abaixo, se fornecidos]

Com base neste material cria: resumo, perguntas simuladas e respostas passo a passo.`,
      [
        { label: "Ficha do professor", url: ficha_url, required: false },
        { label: "Exercícios já feitos pelo aluno", url: exercicio_url, required: false },
      ],
    );

    const resposta = await callLovableAI(userParts, system);

    return new Response(JSON.stringify({ resposta }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("preparar-teste error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
