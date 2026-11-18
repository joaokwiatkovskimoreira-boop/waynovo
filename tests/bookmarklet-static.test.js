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
  assert.ok(source.includes("$('questionEvidence').value="));
  assert.match(source, /MATERIAL DE APOIO EXTRAÍDO DA PÁGINA/);
  assert.match(source, /confiança alta, média ou baixa/);
});

test('Local AI is the default and external providers remain opt-in', () => {
  assert.ok(source.includes("$('provider').value=sessionStorage.getItem(PROVIDER)||'local'"));
});


test('Task Queue 2.0 exposes controls, resumable state and audit export', () => {
  for (const id of ['autoQueueState', 'autoQueueProgress', 'autoQueueList', 'autoQueueCreatePack', 'autoQueueRun', 'autoQueuePause', 'autoQueueRetry', 'autoQueueAudit', 'autoQueueClear', 'autoQueueArtifact', 'autoQueueOutput']) {
    assert.ok(source.includes('id="' + id + '"'), 'missing queue control ' + id);
  }
  assert.match(source, /waynovo\.autopilot\.queue\.v1/);
  assert.match(source, /if\(task\.status==='running'\)task\.status='pending'/);
  assert.match(source, /autoQueueLog\('completed'/);
  assert.match(source, /autoQueueLog\('failed'/);
  assert.match(source, /autoQueueLog\('retry'/);
  assert.match(source, /waynovo-task-audit\.json/);
});

test('Task Queue executes page tasks locally and stores question dossiers', () => {
  const start = source.indexOf('function autoQueueExecute(task){');
  const end = source.indexOf('function autoQueueTick(){', start);
  assert.ok(start >= 0 && end > start, 'queue executor exists');
  const body = source.slice(start, end);
  const store = { cards: [] };
  const artifacts = { summary: '', practice: '', flashcards: [], questions: [] };
  let saved = 0, drawn = 0;
  const execute = new Function('local','pieces','state','save','drawCard','autoQueueData','autoHash',
    body + '; return autoQueueExecute;'
  )((kind, content) => kind + ':' + content, (value) => value.split('|').filter(Boolean),
    store, () => { saved++; }, () => { drawn++; }, { artifacts }, (value) => String(value.length));
  assert.match(execute({type:'page-summary',payload:{content:'page text'}}), /Resumo local/);
  assert.equal(artifacts.summary, 'summary:page text');
  assert.match(execute({type:'page-practice',payload:{content:'page text'}}), /Exercícios originais/);
  assert.equal(artifacts.practice, 'practice:page text');
  assert.match(execute({type:'page-flashcards',payload:{content:'first|second'}}), /flashcard/);
  assert.equal(store.cards.length, 2);
  assert.equal(saved, 1);
  assert.equal(drawn, 1);
  assert.match(execute({type:'question-dossier',payload:{question:'Q?',options:['A) 1'],evidence:[{text:'Source'}],draft:'Review'}}), /Dossiê/);
  assert.equal(artifacts.questions.length, 1);
  assert.match(artifacts.questions[0].note, /nenhuma alternativa foi marcada/);
});

test('Task Queue executor and exported audit avoid network and submission actions', () => {
  const start = source.indexOf('// Task Queue 2.0:');
  const end = source.indexOf('function autoRender(){', start);
  assert.ok(start >= 0 && end > start, 'queue runtime exists');
  const queue = source.slice(start, end);
  assert.doesNotMatch(queue, /\\bfetch\\s*\\(/);
  assert.doesNotMatch(queue, /form\\.submit\\s*\\(/);
  const exportStart = queue.indexOf('function autoQueueExport(){');
  const exportEnd = queue.indexOf("$('autoQueueCreatePack')", exportStart);
  const exporter = queue.slice(exportStart, exportEnd);
  assert.match(exporter, /tasks\.map\(\(\{id,type,title,status,createdAt,finishedAt,error\}\)/);
  assert.doesNotMatch(exporter, /payload/);
});

test('Android installer and service worker point to the current bookmarklet release', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
  assert.ok(app.includes('bookmarklet.js?v=2.0'));
  assert.match(worker, /waynovo-shell-v7/);
});
