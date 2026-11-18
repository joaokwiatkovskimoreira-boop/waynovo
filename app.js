(() => {
  'use strict';
  const $ = (q) => document.querySelector(q);
  const TASKS_KEY='waynovo.tasks.v2', DRAFT_KEY='waynovo.draft.v1', THEME_KEY='waynovo.theme.v1';
  const ENDPOINT_KEY='waynovo.ai.endpoint.session', PROVIDER_KEY='waynovo.ai.provider.session', FALLBACK_KEY='waynovo.ai.fallback.session';
  const material=$('#material'), mode=$('#mode'), queue=$('#queueList');
  const labels={organize:'Organizar conteúdo',lesson:'Lição automática',summary:'Resumo estruturado',flashcards:'Flashcards',practice:'Prática inédita',checklist:'Checklist',review:'Revisão'};
  let tasks=[], toastTimer=null, currentResult='';
  function id(){return crypto&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);}
  function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
  function readTasks(){try{const arr=JSON.parse(localStorage.getItem(TASKS_KEY)||'[]');return Array.isArray(arr)?arr.filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&typeof t.content==='string').slice(0,500):[];}catch(_){return [];}}
  tasks=readTasks();
  function save(){try{localStorage.setItem(TASKS_KEY,JSON.stringify(tasks));}catch(_){notify('Armazenamento cheio ou bloqueado. Exporte o backup.');}}
  try{const draft=localStorage.getItem(DRAFT_KEY);if(draft)material.value=draft;}catch(_){}
  function updateCounters(){const text=material.value,words=text.trim()?text.trim().split(/\s+/).length:0;$('#charCount').textContent=text.length.toLocaleString('pt-BR')+' caracteres';$('#readingMeta').textContent=words?'Leitura: '+Math.max(1,Math.ceil(words/200))+' min · '+words+' palavras':'Leitura: —';try{localStorage.setItem(DRAFT_KEY,text);}catch(_){}}
  material.addEventListener('input',updateCounters);updateCounters();
  $('#clearBtn').addEventListener('click',()=>{material.value='';updateCounters();material.focus();});
  function render(){
    const query=($('#queueSearch').value||'').trim().toLocaleLowerCase('pt-BR');
    const visible=tasks.filter(t=>!query||(t.title+' '+t.content+' '+(labels[t.mode]||'')).toLocaleLowerCase('pt-BR').includes(query));
    queue.replaceChildren();
    if(!visible.length){const e=document.createElement('div');e.className='empty-state';const b=document.createElement('b');b.textContent=tasks.length?'Nenhum resultado':'Sua fila está vazia';const p=document.createElement('span');p.textContent=tasks.length?'Tente outro termo.':'Adicione um fluxo para começar.';e.append(b,p);queue.append(e);}
    visible.forEach(task=>{
      const row=document.createElement('div');row.className='task'+(task.done?' done':'');
      const check=document.createElement('button');check.className='task-check';check.textContent=task.done?'✓':'○';check.setAttribute('aria-label',task.done?'Reabrir tarefa':'Concluir tarefa');check.addEventListener('click',()=>{task.done=!task.done;save();render();});
      const info=document.createElement('div');info.className='task-info';const title=document.createElement('div');title.className='task-name';title.textContent=task.title;const meta=document.createElement('div');meta.className='task-sub';meta.textContent=(task.priority||'Normal')+' · '+(task.date||'');info.append(title,meta);
      const open=document.createElement('button');open.className='task-open';open.type='button';open.textContent='Abrir';open.addEventListener('click',()=>{material.value=task.content;updateCounters();mode.value=task.mode||'organize';$('#workspace').scrollIntoView({behavior:'smooth'});material.focus();});
      const tag=document.createElement('span');tag.className='task-tag';tag.textContent=labels[task.mode]||labels.organize;
      const remove=document.createElement('button');remove.className='task-remove';remove.textContent='×';remove.setAttribute('aria-label','Remover tarefa');remove.addEventListener('click',()=>{tasks=tasks.filter(t=>t.id!==task.id);save();render();notify('Tarefa removida.');});
      row.append(check,info,open,tag,remove);queue.append(row);
    });
    $('#taskCount').textContent=tasks.filter(t=>!t.done).length;$('#doneCount').textContent=tasks.filter(t=>t.done).length;
  }
  function addTask(title,content,taskMode,priority){tasks.unshift({id:id(),title:title.slice(0,120),content,mode:labels[taskMode]?taskMode:'organize',priority:priority||'Normal',done:false,date:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})});tasks=tasks.slice(0,500);save();render();}
  function termsOf(text){const stop=new Set('sobre entre quando como para pela pelo pelos pelas uma umas uns dos das esse essa isso isto também então muito mais menos cada onde porque seus suas ser ter está são foi foram pode podem deve devem'.split(' '));const map=new Map();(text.toLocaleLowerCase('pt-BR').match(/[a-zÀ-ÿ]{5,}/g)||[]).forEach(w=>{if(!stop.has(w))map.set(w,(map.get(w)||0)+1);});return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>x[0]);}
  function pieces(text){const paragraphs=text.split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);const sentences=text.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>25);return (paragraphs.length>1?paragraphs:sentences).slice(0,9);}
  function offline(kind,text){
    const blocks=pieces(text),terms=termsOf(text),title=(blocks[0]||'Material de estudo').replace(/\s+/g,' ').slice(0,90);
    if(kind==='summary')return ['RESUMO — '+title,'',...blocks.map((x,i)=>(i+1)+'. '+x),'','TERMOS-CHAVE',...(terms.length?terms:['Identifique os termos técnicos.']).map(x=>'• '+x),'','Confira a fidelidade à fonte original.'].join('\n');
    if(kind==='flashcards')return ['FLASHCARDS — '+title,'',...blocks.slice(0,12).map((x,i)=>'CARTÃO '+(i+1)+'\nPergunta: Qual é a ideia principal deste trecho?\nPista de resposta: '+x),'','Responda antes de olhar a pista.'].join('\n');
    if(kind==='practice')return ['PRÁTICA — '+title,'','1. Qual é a ideia principal do material?','2. Explique um conceito com suas palavras.','3. Como dois tópicos se relacionam?','4. Crie um exemplo próprio.','5. O que ainda precisa de revisão?','','TRECHOS PARA APOIO',...blocks].join('\n');
    if(kind==='checklist')return ['CHECKLIST — '+title,'',...blocks.map((x,i)=>'[ ] Estudar etapa '+(i+1)+': '+x),'[ ] Explicar o tema sem consultar.','[ ] Revisar em 1, 3 e 7 dias.'].join('\n');
    return ['LIÇÃO — '+title,'','OBJETIVO','Compreender os conceitos centrais e explicar as ideias com as próprias palavras.','','AQUECIMENTO','Anote o que já sabe e uma dúvida que deseja responder.','','CONTEÚDO EM ETAPAS',...blocks.map((x,i)=>(i+1)+'. '+x),'','TERMOS-CHAVE',...(terms.length?terms:['Identifique os termos técnicos do material.']).map(x=>'• '+x),'','RECUPERAÇÃO ATIVA','• Explique a ideia principal sem consultar.','• Compare dois conceitos importantes.','• Crie um exemplo próprio.','','REVISÃO ESPAÇADA','Revise hoje, amanhã, em 3 dias e em 7 dias.','','Estrutura offline; confira o contexto das palavras-chave.'].join('\n');
  }
  function showResult(title,text){currentResult=text;$('#lessonTitle').textContent=title;const body=$('#lessonBody');body.replaceChildren();text.split('\n').forEach(line=>{const p=document.createElement('p');p.textContent=line||' ';if(/^(OBJETIVO|AQUECIMENTO|CONTEÚDO EM ETAPAS|TERMOS-CHAVE|TERMOS PARA REVISAR|RECUPERAÇÃO ATIVA|REVISÃO ESPAÇADA|TRECHOS PARA APOIO)$/i.test(line))p.className='lesson-heading';body.append(p);});$('#lessonResult').hidden=false;}
  $('#lessonBtn').addEventListener('click',()=>{const text=material.value.trim();if(!text){notify('Cole ou selecione material primeiro.');return;}const selected=['lesson','summary','flashcards','practice','checklist'].includes(mode.value)?mode.value:'lesson';showResult((labels[selected]||'Estudo')+' · offline',offline(selected,text));mode.value=selected;$('#lessonResult').scrollIntoView({behavior:'smooth',block:'nearest'});notify('Material criado localmente.');});
  async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}}catch(_){}const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}area.remove();return ok;}
  $('#copyLesson').addEventListener('click',async()=>{if(currentResult)notify(await copyText(currentResult)?'Resultado copiado.':'Cópia indisponível; use Salvar TXT.');});
  $('#downloadLesson').addEventListener('click',()=>{if(!currentResult)return;const url=URL.createObjectURL(new Blob([currentResult],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='waynovo-estudo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('#saveLesson').addEventListener('click',()=>{if(!currentResult)return;addTask('Estudo: '+($('#lessonTitle').textContent||'Material'),currentResult,mode.value,'Normal');notify('Resultado guardado na fila.');});

  try{$('#aiEndpoint').value=sessionStorage.getItem(ENDPOINT_KEY)||'';$('#aiProvider').value=sessionStorage.getItem(PROVIDER_KEY)||'auto';$('#aiFallback').value=sessionStorage.getItem(FALLBACK_KEY)||'true';}catch(_){}
  $('#saveAiConfig').addEventListener('click',()=>{try{const endpoint=$('#aiEndpoint').value.trim();if(endpoint)sessionStorage.setItem(ENDPOINT_KEY,endpoint);else sessionStorage.removeItem(ENDPOINT_KEY);sessionStorage.setItem(PROVIDER_KEY,$('#aiProvider').value);sessionStorage.setItem(FALLBACK_KEY,$('#aiFallback').value);$('#aiConfigStatus').textContent='Endpoint e preferência lembrados nesta sessão. Token não armazenado.';notify('Endpoint guardado; token fica apenas no campo.');}catch(_){$('#aiConfigStatus').textContent='Armazenamento de sessão indisponível.';}});
  $('#aiGenerateBtn').addEventListener('click',async()=>{
    const content=material.value.trim(),endpoint=$('#aiEndpoint').value.trim(),token=$('#aiToken').value.trim();
    if(!content){notify('Adicione material antes de gerar.');return;}
    if(!endpoint||!token){$('#aiSettings').open=true;notify('Configure endpoint e token do gateway.');return;}
    let u;try{u=new URL(endpoint);}catch(_){notify('Endpoint inválido.');return;}
    if(u.protocol!=='https:'&&u.hostname!=='localhost'&&u.hostname!=='127.0.0.1'){notify('Use um endpoint HTTPS.');return;}
    const button=$('#aiGenerateBtn'),old=button.textContent,controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),60000);
    button.disabled=true;button.textContent='Gerando…';
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({task:$('#aiTask').value,content,pageTitle:document.title,provider:$('#aiProvider').value,fallback:$('#aiFallback').value!=='false'}),signal:controller.signal});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Gateway HTTP '+response.status);
      if(typeof data.text!=='string'||!data.text.trim())throw new Error('A IA retornou uma resposta vazia.');
      showResult('Waynovo IA · '+($('#aiTask').selectedOptions[0]?.textContent||'Resultado'),data.text.trim());$('#lessonResult').scrollIntoView({behavior:'smooth',block:'nearest'});notify('Resultado da IA pronto. Revise antes de usar.');
    }catch(error){notify(error.name==='AbortError'?'Tempo limite excedido.':(error.message||'Falha de conexão.'));}
    finally{clearTimeout(timeout);button.disabled=false;button.textContent=old;}
  });

  $('#addBtn').addEventListener('click',()=>{const text=material.value.trim();if(!text){notify('Adicione um conteúdo primeiro.');return;}addTask(text.replace(/\s+/g,' ').slice(0,82)+(text.length>82?'…':''),text,mode.value,$('#priority').value);material.value='';updateCounters();notify('Fluxo salvo.');});
  $('#queueSearch').addEventListener('input',render);
  $('#clearQueue').addEventListener('click',()=>{if(!tasks.length||!confirm('Limpar a fila salva neste navegador?'))return;tasks=[];save();render();notify('Fila limpa.');});
  $('#exportQueue').addEventListener('click',()=>{const data={app:'Waynovo',formatVersion:4,exportedAt:new Date().toISOString(),tasks,studyCards:(()=>{try{return JSON.parse(localStorage.getItem('waynovo.flashcards.v1')||'[]');}catch(_){return [];}})(),studyStats:(()=>{try{return JSON.parse(localStorage.getItem('waynovo.flashcards.stats.v1')||'{}');}catch(_){return {};}})(),planner:window.WaynovoPlanner?window.WaynovoPlanner.exportData():null};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='waynovo-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Backup exportado.');});
  $('#importQueue').addEventListener('click',()=>$('#importFile').click());
  $('#importFile').addEventListener('change',async(event)=>{const file=event.target.files&&event.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||data.app!=='Waynovo'||!Array.isArray(data.tasks))throw new Error('invalid');const known=new Set(tasks.map(t=>t.id));const incoming=data.tasks.filter(t=>t&&typeof t.title==='string'&&typeof t.content==='string').map(t=>({id:typeof t.id==='string'&&!known.has(t.id)?t.id:id(),title:t.title.slice(0,120),content:t.content,mode:labels[t.mode]?t.mode:'organize',priority:['Alta','Normal','Baixa'].includes(t.priority)?t.priority:'Normal',done:Boolean(t.done),date:typeof t.date==='string'?t.date:''}));tasks=[...incoming,...tasks].slice(0,500);if(Array.isArray(data.studyCards)){try{const current=JSON.parse(localStorage.getItem('waynovo.flashcards.v1')||'[]');const have=new Set(current.map(card=>card.id));const extra=data.studyCards.filter(card=>card&&typeof card.front==='string'&&typeof card.back==='string').map(card=>({...card,id:have.has(card.id)?(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()):card.id}));localStorage.setItem('waynovo.flashcards.v1',JSON.stringify([...extra,...current].slice(0,1000)));if(data.studyStats&&typeof data.studyStats==='object')localStorage.setItem('waynovo.flashcards.stats.v1',JSON.stringify(data.studyStats));}catch(_){}}if(data.studyStats&&typeof data.studyStats==='object'){try{const currentStats=JSON.parse(localStorage.getItem('waynovo.flashcards.stats.v1')||'{}');Object.keys(data.studyStats).forEach(key=>{currentStats[key]=Math.max(Number(currentStats[key]||0),Number(data.studyStats[key]||0));});localStorage.setItem('waynovo.flashcards.stats.v1',JSON.stringify(currentStats));}catch(_){}}const importedSessions=data.planner&&window.WaynovoPlanner?window.WaynovoPlanner.importData(data.planner):0;save();render();notify(incoming.length+' tarefa(s), '+(Array.isArray(data.studyCards)?data.studyCards.length:0)+' cartão(ões) e '+importedSessions+' sessão(ões) importado(s).');}catch(_){notify('Backup inválido.');}event.target.value='';});
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode.value=button.dataset.mode;$('#workspace').scrollIntoView({behavior:'smooth'});material.focus();}));
  $('[data-focus]').addEventListener('click',()=>{material.focus();$('#workspace').scrollIntoView({behavior:'smooth'});});

  function theme(light){document.body.classList.toggle('light',light);try{localStorage.setItem(THEME_KEY,light?'light':'dark');}catch(_){}}
  try{theme(localStorage.getItem(THEME_KEY)==='light');}catch(_){}
  $('#themeBtn').addEventListener('click',()=>{const light=!document.body.classList.contains('light');theme(light);notify(light?'Tema claro ativado.':'Tema escuro ativado.');});

  let deferredInstallPrompt = null;
  const installAppButton = $('#installAppBtn');
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installAppButton.hidden = false;
  });
  installAppButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      notify('No menu do navegador, escolha “Instalar Waynovo” ou “Adicionar à tela inicial”.');
      return;
    }
    deferredInstallPrompt.prompt();
    try {
      const choice = await deferredInstallPrompt.userChoice;
      notify(choice && choice.outcome === 'accepted' ? 'Instalação iniciada.' : 'Instalação não confirmada.');
    } catch (_) { notify('Não foi possível abrir a instalação neste navegador.'); }
    deferredInstallPrompt = null;
    installAppButton.hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    installAppButton.hidden = true;
    notify('Waynovo instalado.');
  });

  let seconds=25*60, interval=null;
  function drawTimer(){$('#timerDisplay').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
  function resetTimer(){if(interval)clearInterval(interval);interval=null;seconds=Number($('#timerDuration').value)*60;$('#timerToggle').textContent='Iniciar';$('#timerStatus').textContent='Pronto para começar';drawTimer();}
  $('#timerDuration').addEventListener('change',resetTimer);
  $('#timerToggle').addEventListener('click',()=>{if(interval){clearInterval(interval);interval=null;$('#timerToggle').textContent='Continuar';$('#timerStatus').textContent='Sessão pausada';return;}if(seconds<=0)resetTimer();$('#timerToggle').textContent='Pausar';$('#timerStatus').textContent='Foco em andamento';interval=setInterval(()=>{seconds--;drawTimer();if(seconds<=0){clearInterval(interval);interval=null;$('#timerToggle').textContent='Iniciar';$('#timerStatus').textContent='Sessão concluída. Faça uma pausa.';window.dispatchEvent(new CustomEvent('waynovo:focus-complete',{detail:{minutes:Number($('#timerDuration').value),subject:(document.getElementById('plannerSubject')?.value||'Estudo livre').trim()}}));notify('Sessão de foco concluída e registrada no histórico.');}},1000);});
  $('#timerReset').addEventListener('click',resetTimer);drawTimer();

  let bookmarklet = '';
  async function loadBookmarklet() {
    const link = $('#bookmarkletLink');
    const code = $('#bookmarkletCode');
    try {
      const response = await fetch('./bookmarklet.js', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const source = await response.text();
      if (!source.trim()) throw new Error('Arquivo vazio.');
      bookmarklet = 'javascript:' + encodeURIComponent(source.trim());
      link.href = bookmarklet;
      code.textContent = bookmarklet;
    } catch (error) {
      link.removeAttribute('href');
      code.textContent = 'Não foi possível carregar bookmarklet.js: ' + (error.message || 'erro desconhecido');
    }
  }
  loadBookmarklet();
  $('#copyBookmarklet').addEventListener('click', async () => {
    if (!bookmarklet) await loadBookmarklet();
    if (bookmarklet) notify(await copyText(bookmarklet) ? 'Bookmarklet copiado.' : 'Não foi possível copiar; selecione o código.');
    else notify('Bookmarklet indisponível. Verifique bookmarklet.js.');
  });
  const now=new Date();$('#today').textContent=now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});$('#year').textContent=now.getFullYear();
  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./service-worker.js').catch(() => {});
})();