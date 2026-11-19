'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'bookmarklet.js'), 'utf8');

test('every bookmarklet tab has a matching view', () => {
  const tabs = [...source.matchAll(/<button class="tab(?: active)?" data-tab="([^"]+)"/g)].map((m) => m[1]);
  const views = [...source.matchAll(/<section class="view(?: active)?" data-view="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(tabs.length, 13);
  assert.deepEqual([...tabs].sort(), [...views].sort());
  assert.equal(new Set(tabs).size, tabs.length);
});

test('Autopilot exposes usage, scan, question and draft counters', () => {
  for (const id of ['autoTime', 'autoScans', 'autoQuestions', 'autoDrafts', 'autoState', 'autoResults']) {
    assert.ok(source.includes('id="' + id + '"'), 'missing ' + id);
  }
  assert.match(source, /autoStart\(\);/);
  assert.match(source, /autoScan\(false\)/);
  assert.match(source, /autoScan\(true\)/);
});

test('scanner filters hidden elements, controls and the Waynovo panel', () => {
  const start = source.indexOf('function autoVisibleBlocks()');
  const end = source.indexOf('function autoIsQuestion(', start);
  assert.ok(start >= 0 && end > start);
  const scanner = source.slice(start, end);
  assert.match(scanner, /host\.contains\(el\)/);
  assert.match(scanner, /getClientRects/);
  assert.match(scanner, /visibility==='hidden'/);
  assert.match(scanner, /'INPUT','TEXTAREA','SELECT'/);
});

test('Autopilot analyzes locally and does not submit forms or call a network API', () => {
  const start = source.indexOf('// Autopilot: monitor automático');
  const end = source.indexOf("root.querySelectorAll('[data-tab]')", start);
  assert.ok(start >= 0 && end > start);
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
  assert.match(close[0], /autoQueueTimer/);
});

test('Autopilot extracts inline and sibling A-E alternatives and bridges to Tutor', () => {
  const start = source.indexOf('function autoCollectOptions(question,blocks){');
  const end = source.indexOf('function autoFindEvidence(question,blocks){', start);
  assert.ok(start >= 0 && end > start);
  const collect = new Function('autoIsQuestion', source.slice(start, end) + '; return autoCollectOptions;')((value) => value.includes('?'));
  assert.deepEqual(collect('Quanto é 2+2? A) 3 B) 4 C) 5', []), ['A) 3', 'B) 4', 'C) 5']);
  assert.deepEqual(collect('Quanto é 2+2?', ['Quanto é 2+2?', 'A) 3', 'B) 4', 'C) 5', 'Qual a capital?']), ['A) 3', 'B) 4', 'C) 5']);
  assert.ok(source.includes('Levar ao Tutor'));
  assert.ok(source.includes("$('questionChoices').value="));
  assert.ok(source.includes("$('questionEvidence').value="));
  assert.match(source, /MATERIAL DE APOIO EXTRAÍDO DA PÁGINA/);
  assert.match(source, /confiança alta, média ou baixa/);
});

test('Local AI is the default and external providers remain opt-in', () => {
  assert.ok(source.includes("$('provider').value=sessionStorage.getItem(PROVIDER)||'local'"));
});

test('Task Queue 4.0 exposes controls, resumable state and audit export', () => {
  for (const id of [
    'autoQueueState','autoQueueProgress','autoQueueAdapters','autoQueueList',
    'autoQueueCreatePack','autoQueueCreateFromText','autoQueueRun','autoQueuePause',
    'autoQueueRetry','autoQueueAudit','autoQueueClear','autoQueueArtifact','autoQueueOutput',
    'autoQueueShow','autoQueueCopyOutput'
  ]) assert.ok(source.includes('id="' + id + '"'), 'missing queue control ' + id);
  assert.match(source, /waynovo\.autopilot\.queue\.v1/);
  assert.match(source, /if\(task\.status==='running'\)task\.status='pending'/);
  assert.match(source, /autoQueueLog\('completed'/);
  assert.match(source, /autoQueueLog\('failed'/);
  assert.match(source, /autoQueueLog\('retry'/);
  assert.match(source, /waynovo-task-audit\.json/);
});

test('Task Queue runtime parses and export omits raw page payloads', () => {
  const start = source.indexOf('// Task Queue 4.0:');
  const end = source.indexOf('function autoRender(){', start);
  assert.ok(start >= 0 && end > start);
  const queue = source.slice(start, end);
  assert.doesNotThrow(() => new Function(queue));
  assert.doesNotMatch(queue, /\bfetch\s*\(/);
  assert.doesNotMatch(queue, /form\.submit\s*\(/);
  const exportStart = queue.indexOf('function autoQueueExport(){');
  const exportEnd = queue.indexOf("$('autoQueueCreateFromText')", exportStart);
  const exporter = queue.slice(exportStart, exportEnd);
  assert.match(exporter, /tasks\.map\(\(\{id,type,title,status,createdAt,finishedAt,error\}\)/);
  assert.doesNotMatch(exporter, /payload/);
});

test('Task Queue registry registers seven owned-local adapters and rejects invalid scopes', () => {
  const start = source.indexOf('const autoQueueAdapterRegistry=new Map();');
  const end = source.indexOf('function autoQueueTick(){', start);
  assert.ok(start >= 0 && end > start);
  const state = { cards: [] };
  const artifacts = { summary:'', practice:'', flashcards:[], glossary:'', outline:'', questions:[] };
  let saves = 0, draws = 0;
  const api = new Function(
    'local','pieces','state','save','drawCard','autoQueueData','autoHash',
    source.slice(start, end) + '; return {register:autoQueueRegisterAdapter,list:autoQueueListAdapters,run:autoQueueExecute};'
  )(
    (kind, value) => kind + ':' + value,
    (value) => String(value).split('|').filter(Boolean),
    state, () => { saves++; }, () => { draws++; }, { artifacts },
    (value) => {
      let hash = 2166136261;
      for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
      return (hash >>> 0).toString(36);
    }
  );
  assert.equal(api.list().length, 7);
  assert.ok(api.list().every((adapter) => adapter.scope === 'owned-local'));
  assert.throws(() => api.register({id:'foreign-adapter',scope:'third-party',execute:()=> 'no'}), /owned-local/);
  assert.throws(() => api.register({id:'page-summary',scope:'owned-local',execute:()=> 'duplicate'}), /já registrado/);
  assert.throws(() => api.run({type:'missing-adapter'}), /Nenhum adaptador/);

  assert.match(api.run({type:'page-summary',payload:{content:'material'}}), /Resumo local/);
  assert.equal(artifacts.summary, 'summary:material');
  assert.match(api.run({type:'page-practice',payload:{content:'material'}}), /Exercícios/);
  assert.equal(artifacts.practice, 'practice:material');
  assert.match(api.run({type:'page-glossary',payload:{content:'terms'}}), /Glossário/);
  assert.equal(artifacts.glossary, 'glossary:terms');
  assert.match(api.run({type:'page-outline',payload:{content:'topics'}}), /Mapa de tópicos/);
  assert.equal(artifacts.outline, 'outline:topics');
  assert.match(api.run({type:'page-flashcards',payload:{content:'one|two'}}), /flashcard/);
  assert.equal(state.cards.length, 2);
  assert.equal(saves, 1);
  assert.equal(draws, 1);
  assert.match(api.run({type:'question-dossier',payload:{id:'q1',question:'Q?',options:['A) 1'],evidence:[{text:'source',score:0.8}],draft:'review'}}), /Dossiê/);
  assert.equal(artifacts.questions.length, 1);
});

test('Task Queue flashcards are idempotent and respect the local deck limit', () => {
  const start = source.indexOf('const autoQueueAdapterRegistry=new Map();');
  const end = source.indexOf('function autoQueueTick(){', start);
  const state = { cards: [] }, artifacts = {summary:'',practice:'',flashcards:[],glossary:'',outline:'',questions:[]};
  let saves = 0;
  const execute = new Function('local','pieces','state','save','drawCard','autoQueueData','autoHash',
    source.slice(start,end) + ';return autoQueueExecute;'
  )((kind,value)=>kind+':'+value,(value)=>String(value).split('|').filter(Boolean),state,()=>saves++,()=>{}, {artifacts},
    (value) => {
      let hash = 2166136261;
      for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
      return (hash >>> 0).toString(36);
    }
  );
  const task = {type:'page-flashcards',payload:{content:'alpha|beta'}};
  execute(task);
  execute(task);
  assert.equal(state.cards.length, 2);
  assert.equal(saves, 1);
  state.cards = Array.from({length:300},(_,i)=>({id:'existing-'+i,front:'f',back:'b'}));
  execute({type:'page-flashcards',payload:{content:'gamma|delta'}});
  assert.equal(state.cards.length, 300);
});


test('queue capacity warning is explicit and the audit task title contains no question text', () => {
  assert.ok(source.includes("Fila cheia: conclua ou limpe tarefas antes de adicionar novas."));
  assert.match(source, /autoQueueAdd\('question-dossier','Questão detectada · '\+key,item\)/);

  const start = source.indexOf('function autoQueueAdd(type,title,payload,dependsOn=[]){');
  const end = source.indexOf('function autoQueueCounts(){', start);
  assert.ok(start >= 0 && end > start);
  const tasks = Array.from({length:60},(_,i)=>({id:'pending-'+i,status:'pending'}));
  const data = {tasks,audit:[]};
  let notice = '';
  const add = new Function('autoQueueData','autoHash','autoQueueLog','autoQueuePersist','autoQueueRender','status',
    source.slice(start,end)+';return autoQueueAdd;'
  )(data,()=> 'fingerprint',()=>{},()=>{},()=>{},(id,message)=>{notice=message;});
  assert.equal(add('page-summary','summary',{content:'x'}),null);
  assert.equal(data.tasks.length,60);
  assert.match(notice,/Fila cheia/);
});

test('manual pasted-text pack enqueues a validated six-step pipeline and starts the queue', () => {
  const start = source.indexOf('function autoQueueCreateFromText(){');
  const end = source.indexOf('function autoQueueCreatePack(){', start);
  assert.ok(start >= 0 && end > start);
  const added = [];
  let started = false, statusText = '';
  const studySource = { value: 'x'.repeat(120) };
  const fakeDollar = (id) => id === 'source' ? studySource : null;
  const run = new Function('$','autoQueueAdd','autoQueueStart','status',
    source.slice(start,end) + ';return autoQueueCreateFromText;'
  )(fakeDollar,(type,title,payload)=>{added.push({type,title,payload});return {id:'job-'+type};},()=>{started=true;},(id,message)=>{statusText=message;});
  run();
  assert.deepEqual(added.map(x=>x.type),['page-quality-check','page-summary','page-flashcards','page-practice','page-glossary','page-outline']);
  assert.ok(added.every(x=>x.payload.content === studySource.value));
  assert.equal(started,true);
  studySource.value='short';
  added.length=0;started=false;
  run();
  assert.equal(added.length,0);
  assert.equal(started,false);
  assert.match(statusText,/80 caracteres/);
});

test('queue artifact selector supports summary, practice, flashcards, glossary, outline and questions', () => {
  for (const type of ['summary','practice','flashcards','glossary','outline','questions']) {
    assert.ok(source.includes('value="' + type + '"'), 'missing artifact type ' + type);
  }
  assert.ok(source.includes("else if(kind==='glossary')output=String(a.glossary||'')"));
  assert.ok(source.includes("else if(kind==='outline')output=String(a.outline||'')"));
});

test('registered adapters are visible and included in queue audit metadata', () => {
  assert.ok(source.includes('id="autoQueueAdapters"'));
  assert.ok(source.includes("autoQueueListAdapters().map(x=>x.name)"));
  assert.match(source, /adapters:autoQueueListAdapters\(\)/);
});

test('Android installer and service worker point to the current bookmarklet release', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
  assert.ok(app.includes('bookmarklet.js?v=6.2'));
  assert.match(worker, /waynovo-shell-v13/);
});


test('Waynovo Tutor keeps answer recommendation and evidence-based confidence in Tutor', () => {
  assert.match(source, /Alternativa mais provável: \[letra e texto\]/);
  assert.match(source, /Não há dados suficientes para indicar uma alternativa/);
  assert.match(source, /confiança alta, média ou baixa/);
  assert.match(source, /Atribua confiança alta, média ou baixa/);
});

test('Smart Pipeline validates the source and enforces dependency order', () => {
  assert.match(source, /id:'page-quality-check'/);
  assert.match(source, /dependsOn\.every/);
  assert.match(source, /APROVADA PARA GERAÇÃO/);
  assert.match(source, /adapter\.validate/);
  assert.match(source, /Qualidade da fonte/);
});


test('Tutor routes study questions to the dedicated question task', () => {
  assert.match(source, /<option value="question">Analisar questão/);
  assert.match(source, /\$\('task'\)\.value='question'/);
  assert.match(source, /localQuestionAnalysis\(\)/);
  assert.match(source, /heurística lexical/);
});

test('Local question triage requires evidence and never claims semantic certainty', () => {
  const start = source.indexOf('function localQuestionAnalysis(){');
  const end = source.indexOf('function local(kind,s){', start);
  assert.ok(start >= 0 && end > start);
  const helper = new Function('$','terms',source.slice(start,end)+';return localQuestionAnalysis;');
  const fields = {questionText:{value:'Qual processo explica a fotossíntese?'},questionChoices:{value:'A) Respiração celular\nB) Fotossíntese\nC) Fermentação'},questionEvidence:{value:''}};
  const dollar = (id) => fields[id];
  const run = helper(dollar,(s)=>String(s).toLowerCase().match(/[a-zá-ú]{4,}/g)||[]);
  assert.match(run(),/Não há dados suficientes/);
  fields.questionEvidence.value='A fotossíntese converte energia luminosa em energia química nas plantas.';
  assert.match(run(),/Alternativa candidata: B\)/);
  assert.match(run(),/Confiança: baixa/);
  assert.match(run(),/heurística lexical/);
});

 
test('Waynovo 6.2 integrates YouTube player and local bookmarklet utilities into the panel', () => {
  assert.match(source, /data-tab="media"/);
  assert.match(source, /data-view="media"/);
  assert.match(source, /data-view="extras"/);
  assert.match(source, /youtube-nocookie\.com\/embed/);
  assert.match(source, /mediaQueue/);
  assert.match(source, /extraA11y/);
  assert.match(source, /extraMeta/);
  assert.match(source, /extraOutline/);
  assert.match(source, /extraTables/);
  assert.match(source, /extraPerformance/);
  assert.match(source, /extraSelector/);
  assert.match(source, /extraUrlTools/);
  assert.match(source, /extraJson/);
});

test('YouTube URL parser accepts videos, playlists and rejects unrelated hosts', () => {
  const start = source.indexOf('function parseMediaEntry(raw){');
  const end = source.indexOf('function mediaInputItems()', start);
  assert.ok(start >= 0 && end > start);
  const parse = new Function('URL', source.slice(start, end) + ';return parseMediaEntry;')(URL);
  const video = parse('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(video.type, 'video');
  assert.equal(video.id, 'dQw4w9WgXcQ');
  const playlist = parse('https://music.youtube.com/playlist?list=PL1234567890');
  assert.equal(playlist.type, 'playlist');
  assert.equal(playlist.id, 'PL1234567890');
  assert.equal(parse('https://example.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(parse('not a video'), null);
});

test('integrated player uses local queue state and documented playlist embed parameters', () => {
  assert.match(source, /state\.mediaQueue=Array\.isArray/);
  assert.match(source, /sessionStorage\.setItem\(MEDIA_QUEUE_KEY/);
  assert.match(source, /delete snapshot\.mediaQueue/);
  assert.match(source, /listType=playlist&list=/);
  assert.match(source, /mediaNext/);
  assert.match(source, /mediaPrevious/);
  assert.match(source, /mediaStop/);
  assert.match(source, /music\.youtube\.com\/search\?q=/);
});

test('Extras tools are read-only reports and do not submit forms or fetch remote scripts', () => {
  const start = source.indexOf("$('extraReader').addEventListener");
  const end = source.indexOf("$('source').addEventListener('input'", start);
  assert.ok(start >= 0 && end > start);
  const extras = source.slice(start, end);
  assert.doesNotMatch(extras, /\bfetch\s*\(/);
  assert.doesNotMatch(extras, /form\.submit\s*\(/);
  assert.match(extras, /extraA11y/);
  assert.match(extras, /extraMeta/);
});

test('bookmarklet avoids dynamic code evaluation and cookie access', () => {
  assert.doesNotMatch(source, /\beval\s*\(/);
  assert.doesNotMatch(source, /new Function/);
  assert.doesNotMatch(source, /document\.cookie/);
  assert.doesNotMatch(source, /form\.submit\s*\(/);
  assert.match(source, /labState'\)\.textContent/);
});

test('CSV, performance and selector tools expose local-only output', () => {
  assert.match(source, /extraTables/);
  assert.match(source, /text\/csv;charset=utf-8/);
  assert.match(source, /extraPerformance/);
  assert.match(source, /getEntriesByType\('navigation'\)/);
  assert.match(source, /extraSelector/);
  assert.match(source, /querySelectorAll\(selector\)/);
});

test('URL toolkit redacts credentials and removes tracking parameters', () => {
  const start = source.indexOf('function analyzeUrlValue(raw,base){');
  const end = source.indexOf("$('extraUrlTools').addEventListener", start);
  assert.ok(start >= 0 && end > start);
  const analyze = new Function('URL', source.slice(start, end) + ';return analyzeUrlValue;')(URL);
  const result = analyze('https://user:pass@example.com/music?utm_source=feed&token=secret&color=blue#access_token=abc', 'https://example.com/');
  assert.ok(result.text.includes('token=[redigido]'));
  assert.ok(result.cleanUrl.includes('color=blue'));
  assert.ok(!result.cleanUrl.includes('utm_source'));
  assert.ok(!result.cleanUrl.includes('user:pass'));
  assert.ok(!result.cleanUrl.includes('secret'));
  assert.ok(result.cleanUrl.includes('%5Bredigido%5D') || result.cleanUrl.includes('[redigido]'));
  assert.match(source, /extraUrlTools/);
});

test('JSON formatter parses data without executing scripts', () => {
  assert.match(source, /JSON\.parse\(raw\)/);
  assert.match(source, /JSON\.stringify\(value,null,2\)/);
  assert.match(source, /application\/json;charset=utf-8/);
  assert.match(source, /extraJson/);
});
