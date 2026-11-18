(() => {
'use strict';
const ID='waynovo-unified-panel';
const old=document.getElementById(ID);if(old){old.remove();return;}
const host=document.createElement('div');host.id=ID;(document.body||document.documentElement).appendChild(host);
const root=host.attachShadow({mode:'open'});
root.innerHTML=`
<style>
:host{all:initial;position:fixed;z-index:2147483647;right:14px;bottom:14px;color-scheme:dark;font:13px/1.45 system-ui,sans-serif;color:#edf0ff}
*{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}
.panel{width:min(470px,calc(100vw - 14px));max-height:88vh;display:flex;flex-direction:column;overflow:hidden;background:#101626;border:1px solid #303c59;border-radius:17px;box-shadow:0 24px 90px #000a;color:#edf0ff}
header{display:flex;align-items:center;gap:9px;padding:12px;background:linear-gradient(120deg,#1b2440,#171d31);border-bottom:1px solid #303b56;cursor:move;touch-action:none;user-select:none}
.logo{width:31px;height:31px;display:grid;place-items:center;border-radius:9px;background:linear-gradient(145deg,#9a89ff,#5e4bd1);font-weight:900}
.brand{font-size:14px;font-weight:850}.version{font-size:9px;color:#9da9c5}.spacer{flex:1}
.icon{width:29px;height:29px;border:1px solid #394662;border-radius:8px;background:#222d45;color:#dce3fb;font-size:16px}
nav{display:flex;gap:4px;padding:8px;background:#131b2c;border-bottom:1px solid #29344d}
.tab{flex:1;border:1px solid transparent;border-radius:8px;padding:8px 3px;background:transparent;color:#9eabc7;font-size:10px;font-weight:750}
.tab.active{background:#2b2850;border-color:#6056a3;color:#e6e1ff}
main{padding:12px;overflow:auto;min-height:0}.view{display:none}.view.active{display:block}
.eyebrow{font-size:9px;font-weight:850;letter-spacing:1px;text-transform:uppercase;color:#998bff;margin:1px 0 7px}
.desc{color:#9da9c2;font-size:10px;line-height:1.5;margin:4px 0 9px}
label{display:block;margin:10px 0 5px;color:#cbd4e9;font-size:10px;font-weight:750}
input,textarea,select{width:100%;border:1px solid #35415d;border-radius:9px;background:#0b1220;color:#edf0ff;padding:9px 10px;outline:none;font-size:11px}
textarea{min-height:100px;resize:vertical;line-height:1.5}.output{min-height:135px}
.row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.row>*{flex:1;min-width:0}
.btn{border:1px solid #394662;border-radius:9px;padding:9px 10px;background:#202b43;color:#e0e7fa;font-size:10px;font-weight:800}
.primary{border-color:#7668df;background:linear-gradient(105deg,#8170ec,#5d50c7);color:white}
.soft{background:#292344;border-color:#514879;color:#ded7ff}
.status{min-height:16px;margin-top:7px;color:#8fe0bd;font-size:10px;white-space:pre-wrap;overflow-wrap:anywhere}
.meta{font-size:9px;color:#8592ad;margin-top:5px}
.box{border:1px solid #2d3953;border-radius:11px;padding:11px;background:#151e30;margin-top:9px}
.timer{font-size:43px;font-weight:850;text-align:center;margin:14px 0 3px;font-variant-numeric:tabular-nums}.center{text-align:center}
.noteitem{display:flex;align-items:center;gap:6px;border:1px solid #2c3851;border-radius:9px;padding:7px;margin-top:6px;background:#141e30}
.noteinfo{min-width:0;flex:1}.notetitle{font-weight:800;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.notedate{font-size:9px;color:#8795b1}
.hint{border-left:2px solid #776be3;background:#1a2035;padding:8px 9px;border-radius:0 8px 8px 0;color:#b8c1d7;font-size:9px;line-height:1.5;margin-top:9px}
footer{padding:8px 12px;border-top:1px solid #29344d;color:#7f8ca8;font-size:9px;display:flex;justify-content:space-between}
.minimized nav,.minimized main,.minimized footer{display:none}
:host([data-theme=light]){color-scheme:light;color:#20283a}
:host([data-theme=light]) .panel{background:#f7f8fc;color:#20283a;border-color:#d8deeb}
:host([data-theme=light]) header{background:#eceeff;border-color:#d8deeb}
:host([data-theme=light]) nav{background:#eef0fa;border-color:#dce1ed}
:host([data-theme=light]) input,:host([data-theme=light]) textarea,:host([data-theme=light]) select{background:white;color:#20283a;border-color:#d0d7e6}
:host([data-theme=light]) .box,:host([data-theme=light]) .noteitem{background:white;border-color:#dce1ed}
:host([data-theme=light]) .btn,:host([data-theme=light]) .icon{background:#eef0fa;color:#303950;border-color:#d7deeb}
:host([data-theme=light]) .primary{background:#6858d6;color:white}
@media(max-width:520px){:host{right:5px;bottom:5px}.panel{width:calc(100vw - 10px);max-height:88vh}}
</style>
<section class="panel" id="panel" role="dialog" aria-label="Painel Waynovo">
<header id="drag"><div class="logo">W</div><div><div class="brand">WAYNOVO</div><div class="version">UNIFIED TOOLKIT · 1.0</div></div><div class="spacer"></div>
<button class="icon" id="theme" title="Tema">◐</button><button class="icon" id="min" title="Minimizar">−</button><button class="icon" id="close" title="Fechar">×</button></header>
<nav><button class="tab active" data-tab="study">Estudo</button><button class="tab" data-tab="cards">Cartões</button><button class="tab" data-tab="tools">Texto</button><button class="tab" data-tab="focus">Foco</button><button class="tab" data-tab="ai">IA</button></nav>
<main>
<section class="view active" data-view="study"><div class="eyebrow">Laboratório de aprendizagem</div><div class="desc" id="pageInfo">Selecione um trecho visível ou cole seu material.</div>
<label for="source">Material</label><textarea id="source" placeholder="Selecione um texto e toque em Capturar, ou cole aqui..."></textarea><div class="meta" id="count">0 palavras</div>
<label for="mode">Ferramenta</label><select id="mode"><option value="lesson">Lição organizada</option><option value="summary">Resumo estruturado</option><option value="flashcards">Flashcards</option><option value="practice">Exercícios originais</option><option value="checklist">Checklist</option><option value="outline">Mapa de tópicos</option><option value="glossary">Glossário</option></select>
<div class="row"><button class="btn primary" id="generate">Gerar localmente</button><button class="btn" id="capture">Capturar seleção</button></div>
<label for="output">Resultado</label><textarea class="output" id="output" placeholder="Seu material aparecerá aqui."></textarea>
<div class="row"><button class="btn primary" id="copy">Copiar</button><button class="btn" id="download">Salvar TXT</button></div><div class="status" id="studyStatus"></div>
<div class="hint">Crie materiais de aprendizagem originais e confira as informações com a fonte.</div></section>
<section class="view" data-view="cards"><div class="eyebrow">Revisão ativa</div><div class="desc">Gere cartões a partir do material e tente recordar a resposta antes de revelar.</div>
<div class="row"><button class="btn primary" id="makeCards">Criar cartões</button><button class="btn" id="clearCards">Limpar</button></div>
<div class="box center"><div class="meta" id="cardMeta">Nenhum cartão</div><div id="question" style="font-size:14px;font-weight:800;padding:14px 3px">Crie cartões na aba Estudo.</div><div id="answer" style="display:none;text-align:left;font-size:11px;color:#bac5dd;white-space:pre-wrap;border-top:1px solid #34415c;padding-top:10px"></div></div>
<div class="row"><button class="btn soft" id="reveal">Revelar</button><button class="btn primary" id="next">Próximo</button></div><div class="status" id="cardStatus"></div></section>
<section class="view" data-view="tools"><div class="eyebrow">Editor rápido</div><div class="desc">Ferramentas locais para organizar textos.</div>
<label for="editor">Texto</label><textarea id="editor" placeholder="Cole um texto para editar..."></textarea><div class="meta" id="editorCount">0 palavras</div>
<div class="row"><button class="btn" id="trim">Limpar espaços</button><button class="btn" id="titlecase">Capitalizar</button></div>
<div class="row"><button class="btn" id="upper">MAIÚSCULAS</button><button class="btn" id="lower">minúsculas</button></div>
<div class="row"><button class="btn primary" id="copyEditor">Copiar</button><button class="btn" id="saveNote">Salvar nota</button></div><label>Notas neste navegador</label><div id="notes"></div><div class="status" id="toolStatus"></div></section>
<section class="view" data-view="focus"><div class="eyebrow">Sessão de foco</div><div class="desc">Organize blocos de estudo com um temporizador simples.</div>
<label for="duration">Duração</label><select id="duration"><option value="15">15 minutos</option><option value="25" selected>25 minutos</option><option value="35">35 minutos</option><option value="45">45 minutos</option><option value="50">50 minutos</option></select>
<div class="timer" id="timer">25:00</div><div class="meta center" id="timerStatus">Pronto para começar</div><div class="row"><button class="btn primary" id="toggleTimer">Iniciar</button><button class="btn" id="resetTimer">Reiniciar</button></div></section>
<section class="view" data-view="ai"><div class="eyebrow">Assistente opcional</div><div class="desc">Use um gateway próprio. A chave do provedor fica guardada no servidor, não no bookmarklet.</div>
<label for="endpoint">Endpoint do gateway</label><input id="endpoint" type="url" placeholder="https://seu-worker.workers.dev/generate" autocomplete="off">
<label for="token">Token de acesso do gateway</label><input id="token" type="password" placeholder="Token temporário" autocomplete="off">
<label for="task">Tarefa</label><select id="task"><option value="explain">Explicar conceitos</option><option value="summary">Resumo</option><option value="lesson">Criar lição</option><option value="flashcards">Flashcards</option><option value="practice">Exercícios originais</option><option value="plan">Plano de estudo</option><option value="checklist">Checklist</option><option value="translate">Traduzir</option></select>
<div class="row"><button class="btn primary" id="askAI">Enviar material à IA</button><button class="btn" id="clearToken">Limpar token</button></div><div class="status" id="aiStatus"></div>
<div class="hint">Digite somente o token do gateway. A chave Gemini/OpenAI é um secret do servidor. O material só é enviado quando você aciona o botão.</div></section>
</main><footer><span id="site">Waynovo · local-first</span><span>Esc fecha</span></footer></section>
`;
const $=id=>root.getElementById(id);
const KEY='waynovo.unified.v1', ENDPOINT='waynovo.gateway.endpoint';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){return {};}};
const state=read();state.cards=Array.isArray(state.cards)?state.cards.filter(x=>x&&typeof x.front==='string'&&typeof x.back==='string').slice(0,300):[];state.notes=Array.isArray(state.notes)?state.notes.filter(x=>x&&typeof x.text==='string').slice(-100):[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){status('toolStatus','Armazenamento indisponível ou cheio.');}};
function status(id,msg){const el=$(id);if(el)el.textContent=msg;}
const selection=()=>{try{return String(window.getSelection?window.getSelection():'').trim();}catch(_){return '';}};
const title=String(document.title||'Página').slice(0,140);
$('pageInfo').textContent=title+' · '+location.hostname+' — selecione ou cole o trecho desejado.';
$('site').textContent='Waynovo · '+location.hostname;
$('source').value=selection();
try{$('endpoint').value=sessionStorage.getItem(ENDPOINT)||'';}catch(_){}
const words=s=>s.trim()?s.trim().split(/\s+/).length:0;
$('source').addEventListener('input',()=>{$('count').textContent=words($('source').value)+' palavras · '+$('source').value.length+' caracteres';});
$('source').dispatchEvent(new Event('input'));
function pieces(s){const p=s.split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);const q=s.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>25);return (p.length>1?p:q.length?q:[s]).slice(0,20);}
function terms(s){const stop=new Set('sobre entre quando como para pela pelo pelos pelas uma umas uns dos das esse essa isso isto também então muito mais menos cada onde porque seus suas ser ter está são foi foram com sem que por das dos nos nas aos'.split(' '));const m=new Map();(s.toLocaleLowerCase('pt-BR').match(/[a-zÀ-ÿ]{4,}/g)||[]).forEach(w=>{if(!stop.has(w))m.set(w,(m.get(w)||0)+1);});return [...m].sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);}
function local(kind,s){const p=pieces(s),t=terms(s),h='WAYNOVO · '+title;
if(kind==='summary')return [h,'',...p.slice(0,12).map((x,i)=>(i+1)+'. '+x),'','CONCEITOS-CHAVE',...t.map(x=>'• '+x),'','Confira a fidelidade à fonte.'].join('\n');
if(kind==='flashcards')return [h,'',...p.slice(0,12).map((x,i)=>'CARTÃO '+(i+1)+'\nPergunta: Explique a ideia deste trecho com suas palavras.\nApoio: '+x)].join('\n\n');
if(kind==='practice')return [h,'','EXERCÍCIOS ORIGINAIS','1. Qual é a ideia central do material?','2. Explique um conceito importante sem copiar a fonte.','3. Crie um exemplo próprio.','4. Compare dois tópicos.','5. Que dúvida ainda precisa investigar?','','TÓPICOS PARA PRATICAR',...p.slice(0,8)].join('\n');
if(kind==='checklist')return [h,'',...p.slice(0,15).map((x,i)=>'[ ] Etapa '+(i+1)+': '+x),'[ ] Explicar os conceitos sem consultar.','[ ] Revisar em 1, 3 e 7 dias.'].join('\n');
if(kind==='outline')return [h,'','MAPA DE TÓPICOS',...p.slice(0,15).map((x,i)=>(i+1)+'. '+x.split(/[.!?]/)[0].slice(0,140)),'','PALAVRAS-CHAVE',...t.map(x=>'• '+x)].join('\n');
if(kind==='glossary')return [h,'','GLOSSÁRIO PARA COMPLETAR',...t.map((x,i)=>(i+1)+'. '+x+': defina com suas palavras.')].join('\n');
return [h,'','OBJETIVO','Compreender e explicar as ideias com autonomia.','','CONTEÚDO EM ETAPAS',...p.slice(0,12).map((x,i)=>(i+1)+'. '+x),'','CONCEITOS-CHAVE',...t.map(x=>'• '+x),'','RECUPERAÇÃO ATIVA','• Explique sem consultar.','• Crie um exemplo próprio.','• Registre uma dúvida.','','REVISÃO ESPAÇADA','Revise hoje, amanhã, em 3 dias e em 7 dias.'].join('\n');}
$('generate').addEventListener('click',()=>{const s=$('source').value.trim();if(!s)return status('studyStatus','Selecione ou cole material.');$('output').value=local($('mode').value,s);status('studyStatus','Material criado localmente. Revise com a fonte.');});
$('capture').addEventListener('click',()=>{const s=selection();if(!s)return status('studyStatus','Nenhum texto selecionado. Cole o trecho manualmente.');$('source').value=s;$('source').dispatchEvent(new Event('input'));status('studyStatus','Seleção capturada.');});
async function copy(s){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(s);return true;}}catch(_){}const a=document.createElement('textarea');a.value=s;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}a.remove();return ok;}
$('copy').addEventListener('click',async()=>{const s=$('output').value;if(!s)return status('studyStatus','Gere um resultado antes.');status('studyStatus',await copy(s)?'Copiado.':'Cópia bloqueada pelo navegador.');});
$('download').addEventListener('click',()=>{const s=$('output').value;if(!s)return status('studyStatus','Gere um resultado antes.');const u=URL.createObjectURL(new Blob([s],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='waynovo-estudo.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);});
let cardIndex=0,revealed=false;
function drawCard(){const a=state.cards;if(!a.length){$('cardMeta').textContent='Nenhum cartão salvo';$('question').textContent='Crie cartões a partir do material da aba Estudo.';$('answer').style.display='none';return;}cardIndex=(cardIndex+a.length)%a.length;$('cardMeta').textContent='Cartão '+(cardIndex+1)+' de '+a.length;$('question').textContent=a[cardIndex].front;$('answer').textContent=a[cardIndex].back;$('answer').style.display=revealed?'block':'none';$('reveal').textContent=revealed?'Ocultar':'Revelar resposta';}
$('makeCards').addEventListener('click',()=>{const s=$('source').value.trim();if(!s)return status('cardStatus','Adicione material na aba Estudo.');state.cards=pieces(s).slice(0,18).map((p,i)=>({front:'Explique a ideia central do trecho '+(i+1)+'.',back:p}));cardIndex=0;revealed=false;save();drawCard();status('cardStatus',state.cards.length+' cartões salvos localmente.');});
$('clearCards').addEventListener('click',()=>{state.cards=[];save();drawCard();status('cardStatus','Cartões removidos.');});
$('reveal').addEventListener('click',()=>{if(!state.cards.length)return;revealed=!revealed;drawCard();});
$('next').addEventListener('click',()=>{if(!state.cards.length)return;cardIndex++;revealed=false;drawCard();});drawCard();
$('editor').addEventListener('input',()=>{$('editorCount').textContent=words($('editor').value)+' palavras · '+$('editor').value.length+' caracteres';});
$('trim').addEventListener('click',()=>{$('editor').value=$('editor').value.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();$('editor').dispatchEvent(new Event('input'));status('toolStatus','Espaços extras removidos.');});
$('titlecase').addEventListener('click',()=>{$('editor').value=$('editor').value.toLocaleLowerCase('pt-BR').replace(/(^|[.!?]\s+)([a-zà-ÿ])/g,(m,a,b)=>a+b.toLocaleUpperCase('pt-BR'));$('editor').dispatchEvent(new Event('input'));});
$('upper').addEventListener('click',()=>{$('editor').value=$('editor').value.toLocaleUpperCase('pt-BR');$('editor').dispatchEvent(new Event('input'));});
$('lower').addEventListener('click',()=>{$('editor').value=$('editor').value.toLocaleLowerCase('pt-BR');$('editor').dispatchEvent(new Event('input'));});
$('copyEditor').addEventListener('click',async()=>{const s=$('editor').value;if(!s)return status('toolStatus','Nada para copiar.');status('toolStatus',await copy(s)?'Copiado.':'Cópia bloqueada.');});
function drawNotes(){const list=$('notes');list.replaceChildren();if(!state.notes.length){const p=document.createElement('div');p.className='meta';p.textContent='Nenhuma nota salva.';list.appendChild(p);return;}state.notes.slice().reverse().forEach(note=>{const row=document.createElement('div');row.className='noteitem';const info=document.createElement('div');info.className='noteinfo';const name=document.createElement('div');name.className='notetitle';name.textContent=note.text.split(/\s+/).slice(0,8).join(' ').slice(0,65);const date=document.createElement('div');date.className='notedate';date.textContent=note.date;info.append(name,date);const open=document.createElement('button');open.className='btn';open.textContent='Abrir';open.addEventListener('click',()=>{$('editor').value=note.text;$('editor').dispatchEvent(new Event('input'));});const del=document.createElement('button');del.className='btn';del.textContent='×';del.addEventListener('click',()=>{state.notes=state.notes.filter(x=>x!==note);save();drawNotes();});row.append(info,open,del);list.appendChild(row);});}
$('saveNote').addEventListener('click',()=>{const s=$('editor').value.trim();if(!s)return status('toolStatus','Escreva algo antes de salvar.');state.notes.push({text:s.slice(0,12000),date:new Date().toLocaleString('pt-BR')});state.notes=state.notes.slice(-100);save();drawNotes();status('toolStatus','Nota salva neste navegador.');});drawNotes();
let remain=25*60,interval=null;function drawTimer(){$('timer').textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');}
function resetTimer(){if(interval)clearInterval(interval);interval=null;remain=Number($('duration').value)*60;$('toggleTimer').textContent='Iniciar';$('timerStatus').textContent='Pronto para começar';drawTimer();}
$('duration').addEventListener('change',resetTimer);
$('toggleTimer').addEventListener('click',()=>{if(interval){clearInterval(interval);interval=null;$('toggleTimer').textContent='Continuar';$('timerStatus').textContent='Pausado';return;}if(remain<=0)resetTimer();$('toggleTimer').textContent='Pausar';$('timerStatus').textContent='Foco em andamento';interval=setInterval(()=>{remain--;drawTimer();if(remain<=0){clearInterval(interval);interval=null;$('toggleTimer').textContent='Iniciar';$('timerStatus').textContent='Sessão concluída. Faça uma pausa.';}},1000);});
$('resetTimer').addEventListener('click',resetTimer);drawTimer();
try{$('endpoint').value=sessionStorage.getItem(ENDPOINT)||'';}catch(_){}
$('endpoint').addEventListener('change',()=>{try{sessionStorage.setItem(ENDPOINT,$('endpoint').value.trim());}catch(_){}});
$('clearToken').addEventListener('click',()=>{$('token').value='';status('aiStatus','Token apagado do campo.');});
$('askAI').addEventListener('click',async()=>{const content=$('source').value.trim(),endpoint=$('endpoint').value.trim(),token=$('token').value.trim();if(!content)return status('aiStatus','Adicione material na aba Estudo.');if(!endpoint||!token)return status('aiStatus','Configure endpoint e token do gateway.');let u;try{u=new URL(endpoint);}catch(_){return status('aiStatus','Endpoint inválido.');}if(u.protocol!=='https:'&&u.hostname!=='localhost'&&u.hostname!=='127.0.0.1')return status('aiStatus','Use HTTPS, exceto em localhost.');const btn=$('askAI');btn.disabled=true;btn.textContent='Enviando…';const c=new AbortController(),t=setTimeout(()=>c.abort(),55000);try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({task:$('task').value,content:content,pageTitle:title}),signal:c.signal});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||'Gateway HTTP '+res.status);if(typeof data.text!=='string'||!data.text.trim())throw new Error('Resposta vazia do gateway.');$('output').value=data.text.trim();status('aiStatus','Resposta recebida · '+(data.provider||'gateway')+' / '+(data.model||'modelo')+'. Confira o resultado.');}catch(e){status('aiStatus',e.name==='AbortError'?'Tempo limite excedido.':e.message||'Falha no gateway.');}finally{clearTimeout(t);btn.disabled=false;btn.textContent='Enviar material à IA';}});
root.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));root.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===b.dataset.tab));}));
$('theme').addEventListener('click',()=>{host.dataset.theme=host.dataset.theme==='light'?'dark':'light';});
$('min').addEventListener('click',()=>{$('panel').classList.toggle('minimized');$('min').textContent=$('panel').classList.contains('minimized')?'+':'−';});
function close(){if(interval)clearInterval(interval);host.remove();}
$('close').addEventListener('click',close);root.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
let drag=null;$('drag').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=host.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};$('drag').setPointerCapture(e.pointerId);});
$('drag').addEventListener('pointermove',e=>{if(!drag)return;host.style.left=Math.max(0,Math.min(innerWidth-host.offsetWidth,e.clientX-drag.x))+'px';host.style.top=Math.max(0,Math.min(innerHeight-48,e.clientY-drag.y))+'px';host.style.right='auto';host.style.bottom='auto';});
const stop=()=>{drag=null;};$('drag').addEventListener('pointerup',stop);$('drag').addEventListener('pointercancel',stop);
$('source').focus();
})();`
