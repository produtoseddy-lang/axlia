import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { ficha_url, exercicio_url, instrucoes } = await req.json();
    if (!exercicio_url) {
      return new Response(JSON.stringify({ error: "Ficheiro não recebido correctamente: exercício de matemática" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { profile } = await getUserAndProfile(req);

    const instrucoesBlock = (instrucoes && String(instrucoes).trim())
      ? `\n\nINSTRUÇÕES ESPECÍFICAS DO ALUNO (prioridade máxima):\n${String(instrucoes).trim().slice(0, 300)}\nSegue estas instruções rigorosamente acima de tudo.`
      : "";

    const system = `${SECURITY_RULES}És um professor de matemática moçambicano.
${buildProfileContext(profile)}

Se houver exemplo do professor, replica EXACTAMENTE o método dele.
Resolve o exercício passo a passo numerado, em português simples.
Explica o porquê de cada passo.
Usa fórmulas matemáticas em LaTeX entre $...$ ou $$...$$.
No final, **verifica o resultado**.

Estrutura recomendada:
## Passo 1: ...
## Passo 2: ...
...
## Verificação${instrucoesBlock}`;

    const userParts = await buildUserPartsLabelled(
      `Resolve este exercício de matemática passo a passo.

Este é o exemplo de como o professor resolve:
[exemplo do professor em anexo abaixo, se fornecido]

Este é o exercício novo para resolver:
[exercício em anexo abaixo]

Replica EXACTAMENTE o método do professor.`,
      [
        { label: "Exemplo do professor", url: ficha_url, required: false },
        { label: "Exercício a resolver", url: exercicio_url, required: true },
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
