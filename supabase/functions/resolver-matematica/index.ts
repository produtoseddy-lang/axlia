import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserParts, callLovableAI } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { ficha_url, exercicio_url } = await req.json();
    const { profile } = await getUserAndProfile(req);

    const system = `És um professor de matemática moçambicano.
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
## Verificação`;

    const userParts = await buildUserParts(
      "Resolve este exercício de matemática passo a passo.",
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
