'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'bookmarklet.js'), 'utf8');

test('every bookmarklet tab has a matching view', () => {
  const tabs = [...source.matchAll(/<button class="tab(?: active)?" data-tab="([^"]+)"/g)].map((m) => m[1]);
  const views = [...source.matchAll(/<section class="view(?: active)?" data-view="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(tabs.includes('autopilot'), 'Autopilot tab is present');
  assert.deepEqual([...tabs].sort(), [...views].sort());
  assert.equal(new Set(tabs).size, tabs.length, 'tab identifiers are unique');
});

test('Autopilot exposes usage, scan, question and draft counters', () => {
  for (const id of ['autoTime', 'autoScans', 'autoQuestions', 'autoDrafts', 'autoState', 'autoResults']) {
    assert.match(source, new RegExp('id="' + id + '"'));
  }
  assert.match(source, /autoStart\(\);/);
  assert.match(source, /autoScan\(false\)/);
  assert.match(source, /autoScan\(true\)/);
});

test('scanner filters hidden elements, controls and the Waynovo panel', () => {
  const start = source.indexOf('function autoVisibleBlocks()');
  const end = source.indexOf('function autoIsQuestion(', start);
  assert.ok(start >= 0 && end > start, 'visible scanner function exists');
  const scanner = source.slice(start, end);
  assert.match(scanner, /host\.contains\(el\)/);
  assert.match(scanner, /getClientRects/);
  assert.match(scanner, /visibility==='hidden'/);
  assert.match(scanner, /'INPUT','TEXTAREA','SELECT'/);
});

test('Autopilot analyzes locally and does not submit forms or call a network API', () => {
  const start = source.indexOf('// Autopilot: monitor automático');
  const end = source.indexOf("root.querySelectorAll('[data-tab]')", start);
  assert.ok(start >= 0 && end > start, 'Autopilot runtime block exists');
  const runtime = source.slice(start, end);
  assert.doesNotMatch(runtime, /\bfetch\s*\(/);
  assert.doesNotMatch(runtime, /form\.submit\s*\(/);
  assert.match(runtime, /new MutationObserver/);
  assert.match(runtime, /autoFindEvidence/);
});

test('closing or toggling the bookmarklet cleans up Autopilot timers', () => {
  assert.match(source, /old\.__waynovoCleanup\(\)/);
  assert.match(source, /host\.__waynovoCleanup=close/);
  const close = source.match(/function close\(\)\{[^}]+\}/);
  assert.ok(close);
  assert.match(close[0], /autoScannerInterval/);
  assert.match(close[0], /autoClockInterval/);
  assert.match(close[0], /autoObserver/);
});

test('Autopilot extracts inline and sibling A-E alternatives and bridges to Tutor', () => {
  const start = source.indexOf('function autoCollectOptions(question,blocks){');
  const end = source.indexOf('function autoFindEvidence(question,blocks){', start);
  assert.ok(start >= 0 && end > start, 'option parser exists');
  const parserSource = source.slice(start, end);
  const collect = new Function('autoIsQuestion', parserSource + '; return autoCollectOptions;')((value) => value.includes('?'));
  assert.deepEqual(
    collect('Quanto é 2+2? A) 3 B) 4 C) 5', ['Quanto é 2+2? A) 3 B) 4 C) 5']),
    ['A) 3', 'B) 4', 'C) 5']
  );
  assert.deepEqual(
    collect('Quanto é 2+2?', ['Quanto é 2+2?', 'A) 3', 'B) 4', 'C) 5', 'Qual a capital?']),
    ['A) 3', 'B) 4', 'C) 5']
  );
  assert.match(source, /Levar ao Tutor/);
  assert.ok(source.includes("$('questionChoices').value="));
});

test('Android installer and service worker point to the current bookmarklet release', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
  assert.ok(app.includes('bookmarklet.js?v=1.7'));
  assert.match(worker, /waynovo-shell-v4/);
});
