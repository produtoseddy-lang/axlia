import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { ficha_url, exercicio_url, instrucoes, modo } = body;
    const ficha_urls: string[] = body.ficha_urls ?? (ficha_url ? [ficha_url] : []);
    const exercicio_urls: string[] = body.exercicio_urls ?? (exercicio_url ? [exercicio_url] : []);
    if (exercicio_urls.length === 0) {
      return new Response(JSON.stringify({ error: "Ficheiro não recebido correctamente: exercício de matemática" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { profile } = await getUserAndProfile(req);

    const instrucoesBlock = (instrucoes && String(instrucoes).trim())
      ? `\n\nINSTRUÇÕES ESPECÍFICAS DO ALUNO (prioridade máxima):\n${String(instrucoes).trim().slice(0, 300)}\nSegue estas instruções rigorosamente acima de tudo.`
      : "";

    const modoBlock = modo === "completa"
      ? `\n\nMODO DE RESPOSTA: Explica cada passo detalhadamente com todo o raciocínio. Estrutura: ## Passo 1, ## Passo 2 ... ## Verificação.`
      : `\n\nMODO DE RESPOSTA: Dá apenas a resposta final de forma directa e concisa, com os cálculos mínimos necessários.`;

    const system = `${SECURITY_RULES}És um professor de matemática moçambicano.
${buildProfileContext(profile)}

Se houver exemplo do professor, replica EXACTAMENTE o método dele.
Usa fórmulas matemáticas em LaTeX entre $...$ ou $$...$$.${modoBlock}${instrucoesBlock}`;

    const userParts = await buildUserPartsLabelled(
      `Resolve este exercício de matemática passo a passo.

Este é o exemplo de como o professor resolve:
[exemplo do professor em anexo abaixo, se fornecido]

Este é o exercício novo para resolver:
[exercício em anexo abaixo]

Replica EXACTAMENTE o método do professor.`,
      [
        { label: "Exemplo do professor", urls: ficha_urls, required: false },
        { label: "Exercício a resolver", urls: exercicio_urls, required: true },
      ],
    );

    const resposta = await callLovableAI(userParts, system);

    return new Response(JSON.stringify({ resposta }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resolver-matematica error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
