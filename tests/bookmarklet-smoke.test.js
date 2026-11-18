'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'bookmarklet.js'), 'utf8');

test('bookmarklet is valid standalone JavaScript', () => {
  assert.doesNotThrow(() => new Function(source));
});

test('every navigation tab has exactly one matching view', () => {
  const navStart = source.indexOf('<nav>');
  const navEnd = source.indexOf('</nav>', navStart);
  assert.ok(navStart >= 0 && navEnd > navStart);
  const tabs = [...source.slice(navStart, navEnd).matchAll(/data-tab="([^"]+)"/g)].map(item => item[1]);
  const views = [...source.matchAll(/<section class="view[^"]*" data-view="([^"]+)"/g)].map(item => item[1]);
  assert.equal(new Set(tabs).size, tabs.length);
  assert.equal(new Set(views).size, views.length);
  assert.deepEqual([...tabs].sort(), [...views].sort());
});

test('all literal ID references exist and IDs are unique', () => {
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(item => item[1]);
  const idSet = new Set(ids);
  assert.equal(idSet.size, ids.length, 'duplicate HTML IDs found');
  const references = [...source.matchAll(/\$\('([A-Za-z][A-Za-z0-9_-]*)'\)/g)].map(item => item[1]);
  const missing = [...new Set(references)].filter(id => !idSet.has(id));
  assert.deepEqual(missing, []);
});

test('mobile full-screen and touch layout rules are present', () => {
  assert.match(source, /@media\(max-width:640px\)/);
  assert.match(source, /height:100dvh/);
  assert.match(source, /pointer: coarse/);
  assert.match(source, /touch-action:none/);
});

test('paid OpenAI option is disabled in the free-first bookmarklet', () => {
  const option = source.match(/<option[^>]*value="openai"[^>]*>[^<]*<\/option>/);
  assert.ok(option);
  assert.match(option[0], /disabled/);
  assert.match(option[0], /bloqueada no modo grátis/);
});

test('bookmarklet does not load remote JavaScript by eval or script injection', () => {
  assert.doesNotMatch(source, /\.then\(\s*eval\s*\)/i);
  assert.doesNotMatch(source, /createElement\(\s*['"]script['"]\s*\)/i);
});
