import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workerSource = await readFile(new URL('../worker.js', import.meta.url), 'utf8');
const workerUrl = 'data:text/javascript;base64,' + Buffer.from(workerSource).toString('base64');
const workerModule = await import(workerUrl);
const worker = workerModule.default;
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

function gatewayRequest(provider = 'openai', fallback = false) {
  return new Request('https://waynovo.test/generate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer gateway-test-token',
      'Content-Type': 'application/json',
      'Origin': 'https://waynovo.test'
    },
    body: JSON.stringify({
      task: 'explain',
      content: 'Material fictício para testar o gateway.',
      provider,
      fallback
    })
  });
}

function testEnvironment(overrides = {}) {
  return {
    WAYNOVO_ACCESS_TOKEN: 'gateway-test-token',
    CORS_ORIGINS: 'https://waynovo.test',
    OPENAI_API_KEY: 'openai-test-secret',
    OPENAI_MODEL: 'gpt-6-luna',
    GEMINI_API_KEY: 'gemini-test-secret',
    GEMINI_MODEL: 'gemini-test-model',
    AI_PRIMARY_PROVIDER: 'openai',
    AI_PROVIDER_ORDER: 'openai,gemini,groq,openrouter',
    ...overrides
  };
}

test('OpenAI provider uses Responses API, server secret, store=false and returns usage', async () => {
  let observed;
  globalThis.fetch = async (url, init) => {
    observed = { url: String(url), init, body: JSON.parse(init.body) };
    return new Response(JSON.stringify({
      status: 'completed',
      output: [{
        type: 'message',
        content: [{ type: 'output_text', text: 'Resposta OpenAI simulada.' }]
      }],
      usage: { input_tokens: 30, output_tokens: 12, total_tokens: 42 }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const response = await worker.fetch(gatewayRequest(), testEnvironment());
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(observed.url, 'https://api.openai.com/v1/responses');
  assert.equal(observed.init.headers.Authorization, 'Bearer openai-test-secret');
  assert.equal(observed.body.model, 'gpt-6-luna');
  assert.equal(observed.body.store, false);
  assert.equal(observed.body.instructions.includes('tutor Waynovo'), true);
  assert.equal(data.provider, 'openai');
  assert.equal(data.model, 'gpt-6-luna');
  assert.equal(data.text, 'Resposta OpenAI simulada.');
  assert.deepEqual(data.usage, { inputTokens: 30, outputTokens: 12, totalTokens: 42 });
  assert.equal(JSON.stringify(data).includes('openai-test-secret'), false);
});

test('OpenAI rate-limit failure falls back to Gemini when fallback is enabled', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push(String(url));
    if (String(url).includes('/responses')) {
      return new Response(JSON.stringify({ error: { message: 'rate limit' } }), { status: 429 });
    }
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Resposta Gemini de fallback.' }] } }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const response = await worker.fetch(gatewayRequest('openai', true), testEnvironment());
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0], 'https://api.openai.com/v1/responses');
  assert.match(calls[1], /generativelanguage\.googleapis\.com/);
  assert.equal(data.provider, 'gemini');
  assert.equal(data.fallbackUsed, true);
  assert.equal(data.text, 'Resposta Gemini de fallback.');
  assert.deepEqual(data.attempts.map((attempt) => attempt.provider), ['openai', 'gemini']);
});

test('invalid gateway token is rejected before calling any provider', async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; throw new Error('Should not be called'); };
  const request = new Request('https://waynovo.test/generate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer wrong-token',
      'Content-Type': 'application/json',
      'Origin': 'https://waynovo.test'
    },
    body: JSON.stringify({ task: 'explain', content: 'test', provider: 'openai' })
  });
  const response = await worker.fetch(request, testEnvironment());
  const data = await response.json();
  assert.equal(response.status, 401);
  assert.match(data.error, /Token do gateway inválido/);
  assert.equal(called, false);
});
