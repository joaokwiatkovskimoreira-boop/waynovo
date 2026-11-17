const TASKS = {
  lesson: "Crie uma lição didática com objetivo, pré-requisitos, explicação em etapas, exemplos originais, conceitos-chave, prática e revisão espaçada.",
  explain: "Explique passo a passo em português claro, defina os termos e conecte as ideias.",
  summary: "Faça um resumo estruturado e fiel ao material, com conceitos, definições e conclusão.",
  flashcards: "Crie até 12 flashcards de recuperação ativa, cada um com pergunta e resposta baseadas no material.",
  practice: "Crie perguntas inéditas de prática, sem responder nem reproduzir uma avaliação ativa.",
  plan: "Crie um plano realista de estudo com etapas, metas e revisões espaçadas.",
  checklist: "Transforme o material em checklist de aprendizagem com etapas verificáveis.",
  translate: "Traduza para português natural e explique os termos técnicos relevantes."
};
function out(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}
function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const origins = String(env.CORS_ORIGINS || "*").split(",").map(x => x.trim());
  const wildcard = origins.includes("*");
  const allowed = wildcard || origins.includes(origin);
  return { allowed, headers: {
    "Access-Control-Allow-Origin": wildcard ? "*" : (allowed ? origin : "null"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  }};
}
export default {
  async fetch(request, env) {
    const c = cors(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: c.allowed ? 204 : 403, headers: c.headers });
    if (!c.allowed) return out({ error: "Origem não autorizada." }, 403, c.headers);
    const url = new URL(request.url);
    if (url.pathname !== "/generate") return out({ error: "Rota não encontrada." }, 404, c.headers);
    if (request.method !== "POST") return out({ error: "Use POST." }, 405, c.headers);
    if (!env.WAYNOVO_ACCESS_TOKEN || !env.AI_API_KEY || !env.AI_MODEL) return out({ error: "Configure WAYNOVO_ACCESS_TOKEN, AI_API_KEY e AI_MODEL como secrets/variáveis do Worker." }, 503, c.headers);
    if (request.headers.get("Authorization") !== "Bearer " + env.WAYNOVO_ACCESS_TOKEN) return out({ error: "Token do gateway inválido." }, 401, c.headers);
    const size = Number(request.headers.get("Content-Length") || 0);
    if (size > 40000) return out({ error: "Solicitação excede 40 KB." }, 413, c.headers);
    let body;
    try { body = await request.json(); } catch (_) { return out({ error: "JSON inválido." }, 400, c.headers); }
    const task = String(body.task || "lesson");
    const content = String(body.content || "").trim();
    if (!Object.prototype.hasOwnProperty.call(TASKS, task)) return out({ error: "Tarefa não suportada." }, 400, c.headers);
    if (!content) return out({ error: "Selecione ou cole um material." }, 400, c.headers);
    if (content.length > 30000) return out({ error: "Limite de 30 mil caracteres por geração." }, 413, c.headers);

    const system = "Você é o tutor Waynovo. Ensine para compreensão, seja claro e fiel à fonte. Se faltar informação, diga; não invente. Não forneça respostas de avaliações em andamento: ofereça explicações conceituais e exercícios originais. Não execute ações em sites.";
    const prompt = TASKS[task] + "\n\nPágina: " + String(body.pageTitle || "Material de estudo").slice(0, 160) + "\n\n--- MATERIAL ---\n" + content;
    const provider = String(env.AI_PROVIDER || "openai-compatible").toLowerCase();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      let response, text = "";
      if (provider === "gemini") {
        const model = String(env.AI_MODEL).replace(/^models\//, "");
        response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
          method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.AI_API_KEY },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2200 } }),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return out({ error: "Gemini recusou a solicitação. Confira chave, modelo e limite." }, 502, c.headers);
        text = (data.candidates || []).flatMap(x => (x.content && x.content.parts) || []).map(x => x.text || "").join("\n").trim();
      } else if (provider === "openai-compatible") {
        const base = String(env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
        let baseUrl;
        try { baseUrl = new URL(base); } catch (_) { return out({ error: "AI_API_BASE_URL inválida." }, 500, c.headers); }
        if (baseUrl.protocol !== "https:") return out({ error: "AI_API_BASE_URL deve usar HTTPS." }, 500, c.headers);
        response = await fetch(base + "/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.AI_API_KEY },
          body: JSON.stringify({ model: env.AI_MODEL, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return out({ error: "Provedor recusou a solicitação. Confira chave, modelo e créditos." }, 502, c.headers);
        const value = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        text = typeof value === "string" ? value.trim() : Array.isArray(value) ? value.map(x => x.text || "").join("\n").trim() : "";
      } else {
        return out({ error: "AI_PROVIDER deve ser openai-compatible ou gemini." }, 400, c.headers);
      }
      if (!text) return out({ error: "Provedor retornou texto vazio." }, 502, c.headers);
      return out({ text, model: env.AI_MODEL, provider }, 200, c.headers);
    } catch (error) {
      return out({ error: error && error.name === "AbortError" ? "Tempo limite de 55 segundos excedido." : "Falha na conexão com o provedor." }, 502, c.headers);
    } finally { clearTimeout(timer); }
  }
};
