const TASKS = {
  lesson: "Crie uma lição didática com objetivo, pré-requisitos, explicação em etapas, exemplos originais, conceitos-chave, prática e revisão espaçada.",
  explain: "Explique passo a passo em português claro, defina os termos e conecte as ideias.",
  question: "Resolva a questão em modo de estudo: identifique o conceito, indique a alternativa mais provável com letra e texto, compare cada opção, justifique com evidências do material, informe confiança alta/média/baixa e declare incertezas. Se a fonte não sustentar uma escolha, diga que não há dados suficientes. Não invente fatos.",
  verify: "Audite criticamente o resultado contra o objetivo, os critérios e o material fornecido. Separe itens atendidos, pendentes e não verificáveis; identifique afirmações sem suporte, omissões, contradições, riscos e próximos passos. Não invente evidências nem diga que realizou testes não executados.",
  summary: "Faça um resumo estruturado e fiel ao material, com conceitos, definições e conclusão.",
  flashcards: "Crie até 12 flashcards de recuperação ativa, cada um com pergunta e resposta baseadas no material.",
  practice: "Crie perguntas inéditas de prática, sem responder nem reproduzir uma avaliação ativa.",
  plan: "Crie um plano realista de estudo com etapas, metas e revisões espaçadas.",
  checklist: "Transforme o material em checklist de aprendizagem com etapas verificáveis.",
  translate: "Traduza para português natural e explique os termos técnicos relevantes."
};

const PROVIDERS = ["openai", "gemini", "groq", "openrouter"];
const DEFAULT_ORDER = ["openrouter"];

function out(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const origins = String(env.CORS_ORIGINS || "*").split(",").map(x => x.trim()).filter(Boolean);
  const wildcard = origins.includes("*");
  const allowed = wildcard || origins.includes(origin);
  return {
    allowed,
    headers: {
      "Access-Control-Allow-Origin": wildcard ? "*" : (allowed ? origin : "null"),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    }
  };
}

function isFreeMode(env) {
  return String(env.WAYNOVO_FREE_MODE == null ? "true" : env.WAYNOVO_FREE_MODE).toLowerCase() !== "false";
}

function freeProviderAllowlist(env) {
  const configured = String(env.WAYNOVO_FREE_PROVIDERS || "openrouter")
    .split(",")
    .map(x => normalizeProvider(x))
    .filter(x => ["gemini", "groq", "openrouter"].includes(x));
  return [...new Set(configured)];
}

function isOpenRouterFreeModel(model) {
  const value = String(model || "").trim();
  return value === "openrouter/free" || value.endsWith(":free");
}

function normalizeProvider(value) {
  const provider = String(value || "").toLowerCase().trim();
  if (provider === "google" || provider === "google-gemini") return "gemini";
  if (provider === "open-ai") return "openai";
  if (provider === "groq-cloud") return "groq";
  if (provider === "open-router") return "openrouter";
  return PROVIDERS.includes(provider) || provider === "openai-compatible" ? provider : "";
}

function legacyProvider(env) {
  const configured = normalizeProvider(env.AI_PROVIDER);
  if (configured && configured !== "openai-compatible") return configured;
  const base = String(env.AI_API_BASE_URL || "").toLowerCase();
  if (base.includes("api.groq.com")) return "groq";
  if (base.includes("openrouter.ai")) return "openrouter";
  if (configured === "openai-compatible") return "openai-compatible";
  return "";
}

function providerOrder(env, requested, fallbackEnabled) {
  const freeMode = isFreeMode(env);
  const allowedProviders = freeMode ? freeProviderAllowlist(env) : PROVIDERS;
  const orderText = String(env.AI_PROVIDER_ORDER || (freeMode ? allowedProviders.join(",") : DEFAULT_ORDER.join(",")));
  const configuredOrder = orderText.split(",").map(normalizeProvider)
    .filter(provider => allowedProviders.includes(provider) || (!freeMode && (PROVIDERS.includes(provider) || provider === "openai-compatible")));
  const baseOrder = configuredOrder.length ? configuredOrder : (freeMode ? allowedProviders : DEFAULT_ORDER);
  const requestedProvider = normalizeProvider(requested);
  const preferredCandidate = requested === "auto"
    ? normalizeProvider(env.AI_PRIMARY_PROVIDER) || legacyProvider(env) || (baseOrder[0] || "openrouter")
    : requestedProvider;
  const preferred = allowedProviders.includes(preferredCandidate) || (!freeMode && (PROVIDERS.includes(preferredCandidate) || preferredCandidate === "openai-compatible"))
    ? preferredCandidate
    : (baseOrder[0] || "openrouter");
  const order = [preferred, ...baseOrder].filter((provider, index, all) =>
    (allowedProviders.includes(provider) || (!freeMode && (PROVIDERS.includes(provider) || provider === "openai-compatible"))) &&
    all.indexOf(provider) === index
  );
  return fallbackEnabled ? order : order.slice(0, 1);
}

function providerConfig(provider, env) {
  const legacy = legacyProvider(env);
  if (provider === "openai") {
    return {
      key: env.OPENAI_API_KEY || (legacy === "openai" ? env.AI_API_KEY : ""),
      model: env.OPENAI_MODEL || "gpt-6-luna",
      base: "https://api.openai.com/v1",
      kind: "openai-responses"
    };
  }
  if (provider === "gemini") {
    return {
      key: env.GEMINI_API_KEY || (legacy === "gemini" ? env.AI_API_KEY : ""),
      model: env.GEMINI_MODEL || (legacy === "gemini" ? env.AI_MODEL : ""),
      kind: "gemini"
    };
  }
  if (provider === "groq") {
    return {
      key: env.GROQ_API_KEY || (legacy === "groq" ? env.AI_API_KEY : ""),
      model: env.GROQ_MODEL || (legacy === "groq" ? env.AI_MODEL : ""),
      base: "https://api.groq.com/openai/v1",
      kind: "compatible"
    };
  }
  if (provider === "openrouter") {
    return {
      key: env.OPENROUTER_API_KEY || (legacy === "openrouter" ? env.AI_API_KEY : ""),
      model: env.OPENROUTER_MODEL || (isFreeMode(env) ? "openrouter/free" : (legacy === "openrouter" ? env.AI_MODEL : "")),
      base: "https://openrouter.ai/api/v1",
      kind: "compatible"
    };
  }
  if (provider === "openai-compatible") {
    return {
      key: env.AI_API_KEY || "",
      model: env.AI_MODEL || "",
      base: env.AI_API_BASE_URL || "https://api.openai.com/v1",
      kind: "compatible"
    };
  }
  return null;
}

function parseResponsesText(data) {
  if (data && typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const messages = Array.isArray(data && data.output) ? data.output : [];
  return messages
    .filter(item => item && item.type === "message" && Array.isArray(item.content))
    .flatMap(item => item.content)
    .filter(part => part && part.type === "output_text" && typeof part.text === "string")
    .map(part => part.text.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function parseCompatibleText(data) {
  const value = data && data.choices && data.choices[0] &&
    data.choices[0].message && data.choices[0].message.content;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map(part => typeof part.text === "string" ? part.text : "").join("\n").trim();
  }
  return "";
}

async function requestProvider(provider, config, system, prompt, env) {
  if (isFreeMode(env)) {
    const allowedProviders = freeProviderAllowlist(env);
    if (!allowedProviders.includes(provider)) {
      return { ok: false, status: "blocked_in_free_mode", message: "Provedor desativado para impedir cobrança no modo grátis." };
    }
    if (provider === "openrouter" && !isOpenRouterFreeModel(config && config.model)) {
      return { ok: false, status: "paid_model_blocked", message: "O modo grátis só aceita openrouter/free ou modelos terminados em :free." };
    }
  }
  if (!config || !config.key || !config.model) {
    return {
      ok: false,
      status: "not_configured",
      message: "Chave ou modelo não configurado."
    };
  }

  const controller = new AbortController();
  const configuredTimeout = Number(env.AI_PROVIDER_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout >= 8000
    ? Math.min(configuredTimeout, 60000)
    : 45000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response;
    let data = {};

    if (config.kind === "openai-responses") {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + config.key
        },
        body: JSON.stringify({
          model: config.model,
          instructions: system,
          input: prompt,
          max_output_tokens: 2200,
          store: false
        }),
        signal: controller.signal
      });
      data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const hint = response.status === 401
          ? " Confira OPENAI_API_KEY."
          : response.status === 429
            ? " Confira créditos, limites e faturamento da OpenAI API."
            : "";
        return {
          ok: false,
          status: "http_" + response.status,
          message: "OpenAI Responses API respondeu HTTP " + response.status + "." + hint
        };
      }
      const text = parseResponsesText(data);
      const usage = data && data.usage ? {
        inputTokens: Number(data.usage.input_tokens) || 0,
        outputTokens: Number(data.usage.output_tokens) || 0,
        totalTokens: Number(data.usage.total_tokens) || 0
      } : null;
      const incomplete = Boolean(data && data.status === "incomplete");
      return text
        ? {
            ok: true,
            text,
            provider,
            model: config.model,
            responseId: typeof data.id === "string" ? data.id : null,
            completionStatus: incomplete ? "incomplete" : (data.status || "completed"),
            incompleteReason: incomplete && data.incomplete_details
              ? String(data.incomplete_details.reason || "").slice(0, 120)
              : null,
            requestId: response.headers.get("x-request-id") || null,
            usage
          }
        : {
            ok: false,
            status: incomplete ? "incomplete" : "empty",
            message: incomplete
              ? "A OpenAI interrompeu a resposta antes de produzir texto."
              : "OpenAI retornou uma resposta vazia."
          };
    }

    if (config.kind === "gemini") {
      const model = String(config.model).replace(/^models\//, "");
      const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
        encodeURIComponent(model) + ":generateContent";
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.key
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2200, temperature: 0.35 }
        }),
        signal: controller.signal
      });
      data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          status: "http_" + response.status,
          message: "Gemini respondeu HTTP " + response.status + "."
        };
      }
      const text = (data.candidates || [])
        .flatMap(candidate => (candidate.content && candidate.content.parts) || [])
        .map(part => part.text || "")
        .join("\n")
        .trim();
      return text
        ? { ok: true, text, provider, model: config.model }
        : { ok: false, status: "empty", message: "Gemini retornou uma resposta vazia." };
    }

    let base = String(config.base || "").replace(/\/+$/, "");
    let baseUrl;
    try { baseUrl = new URL(base); } catch (_) {
      return { ok: false, status: "invalid_url", message: "URL base inválida." };
    }
    if (baseUrl.protocol !== "https:") {
      return { ok: false, status: "invalid_url", message: "A URL base deve usar HTTPS." };
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + config.key
    };
    if (provider === "openrouter") {
      if (env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = String(env.OPENROUTER_SITE_URL);
      headers["X-OpenRouter-Title"] = String(env.OPENROUTER_APP_NAME || "Waynovo");
    }
    response = await fetch(base + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        temperature: 0.35,
        max_tokens: 2200
      }),
      signal: controller.signal
    });
    data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        status: "http_" + response.status,
        message: provider + " respondeu HTTP " + response.status + "."
      };
    }
    const text = parseCompatibleText(data);
    return text
      ? { ok: true, text, provider, model: config.model }
      : { ok: false, status: "empty", message: provider + " retornou uma resposta vazia." };
  } catch (error) {
    return {
      ok: false,
      status: error && error.name === "AbortError" ? "timeout" : "network_error",
      message: error && error.name === "AbortError"
        ? "Tempo limite do provedor excedido."
        : "Falha de conexão com o provedor."
    };
  } finally {
    clearTimeout(timer);
  }
}

export default {
  async fetch(request, env) {
    const c = cors(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: c.allowed ? 204 : 403, headers: c.headers });
    }
    if (!c.allowed) return out({ error: "Origem não autorizada." }, 403, c.headers);

    const url = new URL(request.url);
    if (url.pathname !== "/generate" && url.pathname !== "/status") {
      return out({ error: "Rota não encontrada." }, 404, c.headers);
    }
    if (url.pathname === "/status" && request.method !== "GET") {
      return out({ error: "Use GET em /status." }, 405, c.headers);
    }
    if (url.pathname === "/generate" && request.method !== "POST") {
      return out({ error: "Use POST em /generate." }, 405, c.headers);
    }
    if (!env.WAYNOVO_ACCESS_TOKEN) {
      return out({ error: "Configure WAYNOVO_ACCESS_TOKEN como secret do Worker." }, 503, c.headers);
    }
    if (request.headers.get("Authorization") !== "Bearer " + env.WAYNOVO_ACCESS_TOKEN) {
      return out({ error: "Token do gateway inválido." }, 401, c.headers);
    }
    if (url.pathname === "/status") {
      const freeMode = isFreeMode(env);
      const allowedProviders = freeMode ? freeProviderAllowlist(env) : PROVIDERS;
      const providers = PROVIDERS.map(provider => {
        const config = providerConfig(provider, env);
        const blocked = freeMode && !allowedProviders.includes(provider);
        const paidOpenRouterModel = freeMode && provider === "openrouter" && !isOpenRouterFreeModel(config && config.model);
        const missing = [];
        if (blocked) missing.push("disabled_by_free_mode");
        else {
          if (!config || !config.key) missing.push("api_key");
          if (!config || !config.model) missing.push("model");
          if (paidOpenRouterModel) missing.push("free_model_required");
        }
        return {
          provider,
          configured: !blocked && !paidOpenRouterModel && missing.length === 0,
          model: config && config.model ? String(config.model) : null,
          freeOnly: freeMode,
          missing
        };
      });
      return out({
        service: "waynovo-ai-gateway", status: "ok", version: "1.2.0",
        billingMode: freeMode ? "free-only" : "custom",
        freeProviders: freeMode ? allowedProviders : PROVIDERS,
        defaultProvider: providerOrder(env, "auto", true)[0] || "local",
        automaticFallbackOrder: providerOrder(env, "auto", true).join(","),
        providerTimeoutMs: Number(env.AI_PROVIDER_TIMEOUT_MS) >= 8000 ? Math.min(Number(env.AI_PROVIDER_TIMEOUT_MS), 60000) : 45000,
        providers, tasks: Object.keys(TASKS)
      }, 200, c.headers);
    }

    let rawBody;
    try { rawBody = await request.text(); } catch (_) {
      return out({ error: "Não foi possível ler a solicitação." }, 400, c.headers);
    }
    if (new TextEncoder().encode(rawBody).byteLength > 40000) {
      return out({ error: "Solicitação excede 40 KB." }, 413, c.headers);
    }
    let body;
    try { body = JSON.parse(rawBody); } catch (_) {
      return out({ error: "JSON inválido." }, 400, c.headers);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return out({ error: "O corpo deve ser um objeto JSON." }, 400, c.headers);
    }

    const task = String(body.task || "lesson");
    const content = String(body.content || "").trim();
    if (!Object.prototype.hasOwnProperty.call(TASKS, task)) {
      return out({ error: "Tarefa não suportada." }, 400, c.headers);
    }
    if (!content) return out({ error: "Selecione ou cole um material." }, 400, c.headers);
    if (content.length > 30000) {
      return out({ error: "Limite de 30 mil caracteres por geração." }, 413, c.headers);
    }

    const system = "Você é o tutor Waynovo. Ensine para compreensão, seja claro e fiel à fonte. Para questões de estudo e prática, indique diretamente a alternativa mais provável quando houver base suficiente, com letra, texto, justificativa comparativa e confiança calibrada. Se faltar informação, diga; não invente. Se o usuário deixar claro que está realizando uma avaliação ativa, prova supervisionada ou teste valendo nota em andamento, não indique a resposta: explique o conceito e ofereça uma questão de prática semelhante. Não execute ações em sites.";
    const prompt = TASKS[task] +
      "\n\nPágina: " + String(body.pageTitle || "Material de estudo").slice(0, 160) +
      "\n\n--- MATERIAL ---\n" + content;

    const requested = normalizeProvider(body.provider) || "auto";
    const fallbackEnabled = body.fallback !== false;
    const order = providerOrder(env, requested, fallbackEnabled);
    const attempts = [];

    for (const provider of order) {
      const config = providerConfig(provider, env);
      const result = await requestProvider(provider, config, system, prompt, env);
      attempts.push({
        provider,
        status: result.status || "success",
        model: result.model || (config && config.model) || null
      });
      if (result.ok) {
        return out({
          text: result.text,
          provider: result.provider,
          model: result.model,
          fallbackUsed: attempts.length > 1,
          ...(result.usage ? { usage: result.usage } : {}),
          ...(result.responseId ? { responseId: result.responseId } : {}),
          ...(result.requestId ? { requestId: result.requestId } : {}),
          ...(result.completionStatus ? { completionStatus: result.completionStatus } : {}),
          ...(result.incompleteReason ? { incompleteReason: result.incompleteReason } : {}),
          attempts
        }, 200, c.headers);
      }
    }

    const missing = attempts.length > 0 && attempts.every(item => item.status === "not_configured");
    return out({
      error: missing
        ? "Nenhum provedor da sequência está configurado. Adicione as chaves e os modelos no Worker."
        : "Todos os provedores tentados falharam. Confira os secrets, os modelos e os limites de uso.",
      attempts
    }, missing ? 503 : 502, c.headers);
  }
};
