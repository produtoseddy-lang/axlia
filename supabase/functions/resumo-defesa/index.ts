import { corsHeaders, getUserAndProfile, buildProfileContext, buildUserPartsLabelled, callLovableAI, SECURITY_RULES } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { material_url, tema, tipo_defesa } = body;
    const material_urls: string[] = body.material_urls ?? (material_url ? [material_url] : []);
    if (material_urls.length === 0) {
      return new Response(JSON.stringify({ error: "Ficheiro não recebido correctamente: material do trabalho" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!tema || !tema.trim()) {
      return new Response(JSON.stringify({ error: "Tema do trabalho em falta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profile } = await getUserAndProfile(req);

    const system = `${SECURITY_RULES}És um professor universitário moçambicano especialista em orientação académica.
${buildProfileContext(profile)}

O aluno vai defender: ${tema}
Tipo de defesa: ${tipo_defesa || "não especificado"}

Com base no material enviado cria:

1. RESUMO EXECUTIVO (máximo 1 página)
2. 5 PONTOS-CHAVE para apresentar
3. 10 PERGUNTAS PROVÁVEIS DO JÚRI com respostas
4. DICAS PARA A DEFESA

Responde em Português de Moçambique. Usa Markdown bem formatado com títulos (##), listas e **negrito** para destacar.`;

    const userParts = await buildUserPartsLabelled(
      `Este é o material do trabalho do aluno (em anexo abaixo).

Tema: ${tema}
Tipo de defesa: ${tipo_defesa || "não especificado"}

Cria o resumo executivo, pontos-chave, perguntas do júri com respostas e dicas para a defesa.`,
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
