'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const workerSource = fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8');

function loadWorker(fetchImpl) {
  const instrumented = workerSource
    .replace('export default {', 'const worker = {')
    .replace(/\n};\s*$/, '\n};\nglobalThis.__waynovoTest = { worker, parseResponsesText, providerConfig, providerOrder };');
  const context = {
    Request,
    Response,
    URL,
    AbortController,
    TextEncoder,
    setTimeout,
    clearTimeout,
    fetch: fetchImpl,
    console
  };
  vm.runInNewContext(instrumented, context, { timeout: 3000 });
  return context.__waynovoTest;
}

function env(overrides = {}) {
  return {
    WAYNOVO_ACCESS_TOKEN: 'test-gateway-token',
    CORS_ORIGINS: '*',
    AI_PRIMARY_PROVIDER: 'gemini',
    AI_PROVIDER_ORDER: 'gemini,groq,openrouter',
    OPENAI_MODEL: 'gpt-6-luna',
    ...overrides
  };
}

function authorizedRequest(pathname, options = {}) {
  return new Request('https://gateway.example' + pathname, {
    ...options,
    headers: {
      Origin: 'https://waynovo.example',
      Authorization: 'Bearer test-gateway-token',
      ...(options.headers || {})
    }
  });
}

test('OpenAI uses the official Responses endpoint and does not store responses', async () => {
  let captured;
  const api = loadWorker(async (url, init) => {
    captured = { url: String(url), init };
    return new Response(JSON.stringify({
      id: 'resp_test_123',
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'Resposta GPT de teste.' }] }],
      usage: { input_tokens: 21, output_tokens: 13, total_tokens: 34 }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'x-request-id': 'req_test_456' }
    });
  });

  const response = await api.worker.fetch(authorizedRequest('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'explain', content: 'Material de teste', provider: 'openai', fallback: false })
  }), env({ OPENAI_API_KEY: 'sk-test-only' }));

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(captured.url, 'https://api.openai.com/v1/responses');
  assert.equal(captured.init.headers.Authorization, 'Bearer sk-test-only');
  const payload = JSON.parse(captured.init.body);
  assert.equal(payload.model, 'gpt-6-luna');
  assert.equal(payload.store, false);
  assert.equal(payload.input.includes('Material de teste'), true);
  assert.equal(data.text, 'Resposta GPT de teste.');
  assert.equal(data.provider, 'openai');
  assert.equal(data.usage.totalTokens, 34);
  assert.equal(data.responseId, 'resp_test_123');
  assert.equal(data.requestId, 'req_test_456');
});

test('OpenAI fallback is opt-in and does not appear in the automatic default chain', () => {
  const api = loadWorker(async () => new Response('{}'));
  const order = api.providerOrder(env(), 'auto', true);
  assert.deepEqual(Array.from(order), ['gemini', 'groq', 'openrouter']);
  const explicitOpenAI = api.providerOrder(env(), 'openai', true);
  assert.equal(explicitOpenAI[0], 'openai');
});

test('OpenAI failure falls back to a configured Gemini provider when enabled', async () => {
  const calls = [];
  const api = loadWorker(async (url) => {
    calls.push(String(url));
    if (String(url).includes('api.openai.com')) {
      return new Response(JSON.stringify({ error: { message: 'rate limited' } }), { status: 429 });
    }
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Resposta Gemini fallback.' }] } }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  const response = await api.worker.fetch(authorizedRequest('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'summary', content: 'Texto', provider: 'openai', fallback: true })
  }), env({ OPENAI_API_KEY: 'sk-test-only', GEMINI_API_KEY: 'gem-test-only', GEMINI_MODEL: 'gemini-test' }));

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.provider, 'gemini');
  assert.equal(data.fallbackUsed, true);
  assert.equal(data.attempts.length, 2);
  assert.equal(calls.length, 2);
});

test('/status requires the gateway token and never returns secret values', async () => {
  const api = loadWorker(async () => new Response('{}'));
  const unauthorized = await api.worker.fetch(new Request('https://gateway.example/status'), env());
  assert.equal(unauthorized.status, 401);

  const response = await api.worker.fetch(authorizedRequest('/status'), env({
    OPENAI_API_KEY: 'sk-do-not-leak',
    GEMINI_API_KEY: 'gem-do-not-leak',
    GEMINI_MODEL: 'gemini-test'
  }));
  const data = await response.json();
  assert.equal(response.status, 200);
  const openai = data.providers.find((item) => item.provider === 'openai');
  assert.equal(openai.configured, true);
  assert.equal(openai.model, 'gpt-6-luna');
  assert.equal(JSON.stringify(data).includes('sk-do-not-leak'), false);
  assert.equal(JSON.stringify(data).includes('gem-do-not-leak'), false);
  assert.deepEqual(Array.from(data.tasks).includes('verify'), true);
});

test('/status supports CORS preflight for GET clients', async () => {
  const api = loadWorker(async () => new Response('{}'));
  const response = await api.worker.fetch(new Request('https://gateway.example/status', {
    method: 'OPTIONS',
    headers: { Origin: 'https://waynovo.example' }
  }), env());
  assert.equal(response.status, 204);
  assert.match(response.headers.get('Access-Control-Allow-Methods'), /GET/);
});

test('OpenAI response parser handles both output_text shapes', () => {
  const api = loadWorker(async () => new Response('{}'));
  assert.equal(api.parseResponsesText({ output_text: '  direto  ' }), 'direto');
  assert.equal(api.parseResponsesText({
    output: [{ type: 'message', content: [{ type: 'output_text', text: 'Parte A' }, { type: 'output_text', text: 'Parte B' }] }]
  }), 'Parte A\n\nParte B');
});
