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


test('Task Queue 2.1 exposes controls, resumable state and audit export', () => {
  for (const id of ['autoQueueState', 'autoQueueProgress', 'autoQueueList', 'autoQueueCreatePack', 'autoQueueCreateFromText', 'autoQueueRun', 'autoQueuePause', 'autoQueueRetry', 'autoQueueAudit', 'autoQueueClear', 'autoQueueArtifact', 'autoQueueOutput']) {
    assert.ok(source.includes('id="' + id + '"'), 'missing queue control ' + id);
  }
  assert.match(source, /waynovo\.autopilot\.queue\.v1/);
  assert.match(source, /if\(task\.status==='running'\)task\.status='pending'/);
  assert.match(source, /autoQueueLog\('completed'/);
  assert.match(source, /autoQueueLog\('failed'/);
  assert.match(source, /autoQueueLog\('retry'/);
  assert.match(source, /waynovo-task-audit\.json/);
});


test('manual pasted-text pack enqueues five local task types and starts the queue', () => {
  const start = source.indexOf('function autoQueueCreateFromText(){');
  const end = source.indexOf('function autoQueueCreatePack(){', start);
  assert.ok(start >= 0 && end > start, 'manual pack helper exists');
  const added = [];
  let started = false, statusText = '';
  const studySource = { value: 'x'.repeat(120) };
  const fakeDollar = (id) => id === 'source' ? studySource : null;
  const run = new Function('
  const start = source.indexOf('// Task Queue 2.0:');
  const end = source.indexOf('function autoRender(){', start);
  assert.ok(start >= 0 && end > start, 'queue runtime exists');
  const queue = source.slice(start, end);
  assert.doesNotThrow(() => new Function(queue), 'queue block parses as JavaScript');
  assert.doesNotMatch(queue, /\bfetch\s*\(/);
  assert.doesNotMatch(queue, /form\.submit\s*\(/);
  const exportStart = queue.indexOf('function autoQueueExport(){');
  const exportEnd = queue.indexOf("$('autoQueueCreatePack')", exportStart);
  const exporter = queue.slice(exportStart, exportEnd);
  assert.match(exporter, /tasks\.map\(\(\{id,type,title,status,createdAt,finishedAt,error\}\)/);
  assert.doesNotMatch(exporter, /payload/);
});


test('Task Queue registry registers six owned-local adapters and rejects invalid scopes', () => {
  const start = source.indexOf('const autoQueueAdapterRegistry=new Map();');
  const end = source.indexOf('function autoQueueTick(){', start);
  assert.ok(start >= 0 && end > start, 'adapter registry exists');
  const state = { cards: [] };
  const artifacts = { summary: '', practice: '', flashcards: [], glossary: '', outline: '', questions: [] };
  let saves = 0, draws = 0;
  const api = new Function(
    'local','pieces','state','save','drawCard','autoQueueData','autoHash',
    source.slice(start, end) + '; return {register:autoQueueRegisterAdapter,list:autoQueueListAdapters,run:autoQueueExecute};'
  )(
    (kind, text) => kind + ':' + text,
    (text) => String(text).split('|').filter(Boolean),
    state, () => { saves++; }, () => { draws++; }, { artifacts },
    (value) => 'h' + String(value).length
  );
  assert.equal(api.list().length, 6);
  assert.ok(api.list().every((adapter) => adapter.scope === 'owned-local'));
  assert.throws(() => api.register({id:'foreign-adapter',scope:'third-party',execute:()=> 'no'}), /owned-local/);
  assert.throws(() => api.register({id:'page-summary',scope:'owned-local',execute:()=> 'duplicate'}), /já registrado/);
  assert.throws(() => api.run({type:'missing-adapter'}), /Nenhum adaptador/);
  assert.match(api.run({type:'page-summary',payload:{content:'material'}}), /Resumo local/);
  assert.equal(artifacts.summary,'summary:material');
  assert.match(api.run({type:'page-practice',payload:{content:'material'}}), /Exercícios/);
  assert.equal(artifacts.practice,'practice:material');
  assert.match(api.run({type:'page-glossary',payload:{content:'terms'}}), /Glossário/);
  assert.equal(artifacts.glossary,'glossary:terms');
  assert.match(api.run({type:'page-outline',payload:{content:'topics'}}), /Mapa de tópicos/);
  assert.equal(artifacts.outline,'outline:topics');
  assert.match(api.run({type:'page-flashcards',payload:{content:'one|two'}}), /flashcard/);
  assert.equal(state.cards.length,2);
  assert.equal(saves,1);
  assert.equal(draws,1);
  assert.match(api.run({type:'question-dossier',payload:{id:'q1',question:'Q?',options:['A) 1'],evidence:[{text:'source',score:0.8}],draft:'review'}}), /Dossiê/);
  assert.equal(artifacts.questions.length,1);
});

test('Task Queue flashcards are idempotent and respect the local deck limit', () => {
  const start = source.indexOf('const autoQueueAdapterRegistry=new Map();');
  const end = source.indexOf('function autoQueueTick(){', start);
  const state = { cards: [] }, artifacts = {summary:'',practice:'',flashcards:[],glossary:'',outline:'',questions:[]};
  let saves = 0;
  const api = new Function('local','pieces','state','save','drawCard','autoQueueData','autoHash',
    source.slice(start,end)+';return autoQueueExecute;'
  )((kind,text)=>kind+':'+text,(text)=>String(text).split('|').filter(Boolean),state,()=>saves++,()=>{}, {artifacts},(value)=>String(value.length));
  const task={type:'page-flashcards',payload:{content:'alpha|beta'}};
  api(task);
  api(task);
  assert.equal(state.cards.length,2,'replaying the same task does not duplicate cards');
  assert.equal(saves,1,'only the first execution writes new cards');
  state.cards=Array.from({length:300},(_,i)=>({id:'existing-'+i,front:'f',back:'b'}));
  api({type:'page-flashcards',payload:{content:'gamma|delta'}});
  assert.equal(state.cards.length,300,'deck cap is preserved');
});


test('registered adapters are visible and included in queue audit metadata', () => {
  assert.ok(source.includes('id="autoQueueAdapters"'));
  assert.ok(source.includes("autoQueueListAdapters().map(x=>x.name)"));
  assert.match(source, /adapters:autoQueueListAdapters\(\)/);
});

test('Android installer and service worker point to the current bookmarklet release', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
  assert.ok(app.includes('bookmarklet.js?v=2.1'));
  assert.match(worker, /waynovo-shell-v8/);
});
,'autoQueueAdd','autoQueueStart','status',
    source.slice(start,end) + ';return autoQueueCreateFromText;'
  )(fakeDollar,(type,title,payload)=>{added.push({type,title,payload});},()=>{started=true;},(id,message)=>{statusText=message;});
  run();
  assert.deepEqual(added.map(x=>x.type),['page-summary','page-flashcards','page-practice','page-glossary','page-outline']);
  assert.ok(added.every(x=>x.payload.content === studySource.value));
  assert.equal(started,true);
  studySource.value='short';
  added.length=0;started=false;
  run();
  assert.equal(added.length,0);
  assert.equal(started,false);
  assert.match(statusText,/80 caracteres/);
});

test('queue artifact selector supports glossary and topic outline', () => {
  assert.match(source, /value="glossary">Glossário/);
  assert.match(source, /value="outline">Mapa de tópicos/);
  assert.ok(source.includes("else if(kind==='glossary')output=String(a.glossary||'')"));
  assert.ok(source.includes("else if(kind==='outline')output=String(a.outline||'')"));
});

test('Task Queue executor and exported audit avoid network and submission actions', () => {
  const start = source.indexOf('// Task Queue 2.0:');
  const end = source.indexOf('function autoRender(){', start);
  assert.ok(start >= 0 && end > start, 'queue runtime exists');
  const queue = source.slice(start, end);
  assert.doesNotThrow(() => new Function(queue), 'queue block parses as JavaScript');
  assert.doesNotMatch(queue, /\bfetch\s*\(/);
  assert.doesNotMatch(queue, /form\.submit\s*\(/);
  const exportStart = queue.indexOf('function autoQueueExport(){');
  const exportEnd = queue.indexOf("$('autoQueueCreatePack')", exportStart);
  const exporter = queue.slice(exportStart, exportEnd);
  assert.match(exporter, /tasks\.map\(\(\{id,type,title,status,createdAt,finishedAt,error\}\)/);
  assert.doesNotMatch(exporter, /payload/);
});


test('Task Queue registry registers six owned-local adapters and rejects invalid scopes', () => {
  const start = source.indexOf('const autoQueueAdapterRegistry=new Map();');
  const end = source.indexOf('function autoQueueTick(){', start);
  assert.ok(start >= 0 && end > start, 'adapter registry exists');
  const state = { cards: [] };
  const artifacts = { summary: '', practice: '', flashcards: [], glossary: '', outline: '', questions: [] };
  let saves = 0, draws = 0;
  const api = new Function(
    'local','pieces','state','save','drawCard','autoQueueData','autoHash',
    source.slice(start, end) + '; return {register:autoQueueRegisterAdapter,list:autoQueueListAdapters,run:autoQueueExecute};'
  )(
    (kind, text) => kind + ':' + text,
    (text) => String(text).split('|').filter(Boolean),
    state, () => { saves++; }, () => { draws++; }, { artifacts },
    (value) => 'h' + String(value).length
  );
  assert.equal(api.list().length, 6);
  assert.ok(api.list().every((adapter) => adapter.scope === 'owned-local'));
  assert.throws(() => api.register({id:'foreign-adapter',scope:'third-party',execute:()=> 'no'}), /owned-local/);
  assert.throws(() => api.register({id:'page-summary',scope:'owned-local',execute:()=> 'duplicate'}), /já registrado/);
  assert.throws(() => api.run({type:'missing-adapter'}), /Nenhum adaptador/);
  assert.match(api.run({type:'page-summary',payload:{content:'material'}}), /Resumo local/);
  assert.equal(artifacts.summary,'summary:material');
  assert.match(api.run({type:'page-practice',payload:{content:'material'}}), /Exercícios/);
  assert.equal(artifacts.practice,'practice:material');
  assert.match(api.run({type:'page-glossary',payload:{content:'terms'}}), /Glossário/);
  assert.equal(artifacts.glossary,'glossary:terms');
  assert.match(api.run({type:'page-outline',payload:{content:'topics'}}), /Mapa de tópicos/);
  assert.equal(artifacts.outline,'outline:topics');
  assert.match(api.run({type:'page-flashcards',payload:{content:'one|two'}}), /flashcard/);
  assert.equal(state.cards.length,2);
  assert.equal(saves,1);
  assert.equal(draws,1);
  assert.match(api.run({type:'question-dossier',payload:{id:'q1',question:'Q?',options:['A) 1'],evidence:[{text:'source',score:0.8}],draft:'review'}}), /Dossiê/);
  assert.equal(artifacts.questions.length,1);
});

test('Task Queue flashcards are idempotent and respect the local deck limit', () => {
  const start = source.indexOf('const autoQueueAdapterRegistry=new Map();');
  const end = source.indexOf('function autoQueueTick(){', start);
  const state = { cards: [] }, artifacts = {summary:'',practice:'',flashcards:[],glossary:'',outline:'',questions:[]};
  let saves = 0;
  const api = new Function('local','pieces','state','save','drawCard','autoQueueData','autoHash',
    source.slice(start,end)+';return autoQueueExecute;'
  )((kind,text)=>kind+':'+text,(text)=>String(text).split('|').filter(Boolean),state,()=>saves++,()=>{}, {artifacts},(value)=>String(value.length));
  const task={type:'page-flashcards',payload:{content:'alpha|beta'}};
  api(task);
  api(task);
  assert.equal(state.cards.length,2,'replaying the same task does not duplicate cards');
  assert.equal(saves,1,'only the first execution writes new cards');
  state.cards=Array.from({length:300},(_,i)=>({id:'existing-'+i,front:'f',back:'b'}));
  api({type:'page-flashcards',payload:{content:'gamma|delta'}});
  assert.equal(state.cards.length,300,'deck cap is preserved');
});


test('registered adapters are visible and included in queue audit metadata', () => {
  assert.ok(source.includes('id="autoQueueAdapters"'));
  assert.ok(source.includes("autoQueueListAdapters().map(x=>x.name)"));
  assert.match(source, /adapters:autoQueueListAdapters\(\)/);
});

test('Android installer and service worker point to the current bookmarklet release', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
  assert.ok(app.includes('bookmarklet.js?v=2.1'));
  assert.match(worker, /waynovo-shell-v8/);
});
