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
    .replace(/\n};\s*$/, '\n};\nglobalThis.__waynovoTest = { worker, providerOrder, providerConfig, isFreeMode, freeProviderAllowlist };');
  const context = {
    Request, Response, URL, AbortController, TextEncoder,
    setTimeout, clearTimeout, fetch: fetchImpl, console
  };
  vm.runInNewContext(instrumented, context, { timeout: 3000 });
  return context.__waynovoTest;
}

function env(overrides = {}) {
  return {
    WAYNOVO_ACCESS_TOKEN: 'test-gateway-token',
    WAYNOVO_FREE_MODE: 'true',
    WAYNOVO_FREE_PROVIDERS: 'openrouter',
    AI_PRIMARY_PROVIDER: 'openrouter',
    AI_PROVIDER_ORDER: 'openrouter',
    OPENROUTER_MODEL: 'openrouter/free',
    CORS_ORIGINS: '*',
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

test('free mode defaults to a single allowlisted provider', () => {
  const api = loadWorker(async () => new Response('{}'));
  assert.equal(api.isFreeMode(env()), true);
  assert.deepEqual(Array.from(api.freeProviderAllowlist(env())), ['openrouter']);
  assert.deepEqual(Array.from(api.providerOrder(env(), 'auto', true)), ['openrouter']);
});

test('paid OpenAI is filtered from auto and explicit requests in free mode', () => {
  const api = loadWorker(async () => new Response('{}'));
  assert.deepEqual(Array.from(api.providerOrder(env(), 'auto', true)), ['openrouter']);
  assert.deepEqual(Array.from(api.providerOrder(env(), 'openai', false)), ['openrouter']);
});

test('requesting OpenAI never sends a paid request when free mode is active', async () => {
  const calls = [];
  const api = loadWorker(async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({
      choices: [{ message: { content: 'Resposta gratuita de teste.' } }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  const response = await api.worker.fetch(authorizedRequest('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'explain', content: 'Material', provider: 'openai', fallback: false })
  }), env({
    OPENAI_API_KEY: 'sk-should-never-be-used',
    OPENAI_MODEL: 'gpt-6-luna',
    OPENROUTER_API_KEY: 'or-free-key'
  }));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.provider, 'openrouter');
  assert.equal(data.model, 'openrouter/free');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(calls.some(call => call.url.includes('api.openai.com')), false);
});

test('free mode rejects a paid OpenRouter model before making a network request', async () => {
  let calls = 0;
  const api = loadWorker(async () => { calls += 1; return new Response('{}'); });
  const response = await api.worker.fetch(authorizedRequest('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'summary', content: 'Material', provider: 'openrouter', fallback: false })
  }), env({
    OPENROUTER_API_KEY: 'or-free-key',
    OPENROUTER_MODEL: 'provider/model-paid'
  }));
  const data = await response.json();
  assert.equal(response.status, 502);
  assert.equal(calls, 0);
  assert.equal(data.attempts[0].status, 'paid_model_blocked');
});

test('free OpenRouter model variants ending in :free are allowed', async () => {
  let calls = 0;
  const api = loadWorker(async () => {
    calls += 1;
    return new Response(JSON.stringify({ choices: [{ message: { content: 'OK' } }] }), { status: 200 });
  });
  const response = await api.worker.fetch(authorizedRequest('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'summary', content: 'Material', provider: 'openrouter', fallback: false })
  }), env({
    OPENROUTER_API_KEY: 'or-free-key',
    OPENROUTER_MODEL: 'provider/model:free'
  }));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.text, 'OK');
  assert.equal(calls, 1);
});

test('/status reports free mode and never reveals secrets', async () => {
  const api = loadWorker(async () => new Response('{}'));
  const unauthorized = await api.worker.fetch(new Request('https://gateway.example/status'), env());
  assert.equal(unauthorized.status, 401);

  const response = await api.worker.fetch(authorizedRequest('/status'), env({
    OPENAI_API_KEY: 'sk-do-not-leak',
    OPENROUTER_API_KEY: 'or-do-not-leak'
  }));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.billingMode, 'free-only');
  assert.deepEqual(Array.from(data.freeProviders), ['openrouter']);
  const openai = data.providers.find(item => item.provider === 'openai');
  assert.equal(openai.configured, false);
  assert.ok(openai.missing.includes('disabled_by_free_mode'));
  assert.equal(JSON.stringify(data).includes('sk-do-not-leak'), false);
  assert.equal(JSON.stringify(data).includes('or-do-not-leak'), false);
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

test('gateway rejects requests without its shared token before reading or forwarding content', async () => {
  let calls = 0;
  const api = loadWorker(async () => { calls += 1; return new Response('{}'); });
  const response = await api.worker.fetch(new Request('https://gateway.example/generate', {
    method: 'POST',
    body: JSON.stringify({ task: 'summary', content: 'secret' })
  }), env());
  assert.equal(response.status, 401);
  assert.equal(calls, 0);
});
