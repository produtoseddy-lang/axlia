import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { material_url, tema, tipo_defesa } = await req.json();
    if (!material_url || !tema) {
      return new Response(JSON.stringify({ error: "Ficheiro não recebido correctamente: material ou tema em falta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { profile } = await getUserAndProfile(req);

    const system = `${SECURITY_RULES}És um professor universitário moçambicano especialista em orientação académica.
${buildProfileContext(profile)}

O aluno vai defender o trabalho: ${tema}
Tipo de defesa: ${tipo_defesa || "não especificado"}

Com base no material enviado, cria uma resposta em Markdown bem formatado com EXACTAMENTE estas 4 secções:

## 📋 RESUMO EXECUTIVO
Síntese clara do trabalho completo (máximo 1 página).

## 🎯 PONTOS-CHAVE PARA APRESENTAR
Os 5 pontos mais importantes para defender, em lista numerada.

## ❓ PERGUNTAS PROVÁVEIS DO JÚRI
10 perguntas que o júri pode fazer, cada uma com uma resposta sugerida (formato: **Pergunta:** ... / **Resposta sugerida:** ...).

## 💡 DICAS PARA A DEFESA
Como se comportar, o que enfatizar, o que evitar. Lista clara de boas práticas.

Responde sempre em Português de Moçambique. Adapta a profundidade ao nível do aluno.`;

    const userParts = await buildUserPartsLabelled(
      `Este é o material do trabalho do aluno:
[material em anexo abaixo]

Tema: ${tema} — Tipo: ${tipo_defesa || "não especificado"}

Cria resumo executivo, pontos-chave, perguntas do júri e dicas para a defesa.`,
      [
        { label: "Material do trabalho", url: material_url, required: true },
      ],
    );

    const resposta = await callLovableAI(userParts, system);

    return new Response(JSON.stringify({ resposta }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resumo-defesa error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
