(() => {
  'use strict';
  const ID='waynovo-study-panel';
  const previous=document.getElementById(ID);
  if(previous){previous.remove();return;}
  const host=document.createElement('div');host.id=ID;
  (document.body||document.documentElement).appendChild(host);
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=[
    '<style>',
    ':host{all:initial;position:fixed;z-index:2147483000;inset:auto 14px 14px auto;font-family:Inter,system-ui,sans-serif;color:#eef1ff}',
    '*{box-sizing:border-box}',
    '.panel{width:min(460px,calc(100vw - 20px));max-height:88vh;overflow:auto;background:#101727;border:1px solid #38435e;border-radius:18px;box-shadow:0 24px 80px #000b;padding:16px;color:#eef1ff}',
    '.head{display:flex;justify-content:space-between;align-items:center;gap:10px}.brand{font-size:15px;font-weight:800}.mark{display:inline-grid;place-items:center;width:30px;height:30px;margin-right:7px;border-radius:9px;background:linear-gradient(145deg,#a99aff,#6552db)}',
    'button{font:700 11px system-ui,sans-serif;cursor:pointer}.close,.secondary{border:1px solid #39445e;background:#1b2639;color:#dce3f1;border-radius:9px;padding:9px 12px}',
    '.sub,.note{font-size:10px;line-height:1.5;color:#9eabc3}.meta,.count{font-size:9px;color:#8290aa;margin:6px 0;overflow-wrap:anywhere}',
    'label{display:block;font-size:10px;font-weight:700;margin:10px 0 5px;color:#cbd4e8}textarea,input,select{display:block;width:100%;background:#0a1120;color:#eef1ff;border:1px solid #35405b;border-radius:9px;padding:10px;font:11px/1.5 system-ui}',
    'textarea{min-height:108px;resize:vertical}.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.primary,.ai{flex:1;border:0;border-radius:9px;padding:10px 12px;color:white;background:linear-gradient(100deg,#8d7aff,#7064df)}.ai{background:#32295d;border:1px solid #6659a8;color:#ded8ff}.status{font-size:10px;line-height:1.5;color:#86e0c0;margin-top:9px;white-space:pre-wrap}details{margin-top:11px;padding:10px;border:1px solid #303c54;border-radius:10px}summary{cursor:pointer;color:#bdb4ff;font-size:10px;font-weight:700}',
    '@media(max-width:520px){:host{inset:auto 5px 5px 5px}.panel{width:100%;max-height:88vh}}',
    '</style>',
    '<section class="panel" role="dialog" aria-label="Waynovo estudo"><div class="head"><div class="brand"><span class="mark">W</span>waynovo · estudo</div><button class="close" id="close">×</button></div>',
    '<p class="sub">Selecione texto visível em uma aula, artigo ou documentação. Se a página impedir seleção, cole o material.</p><div class="meta" id="pageMeta"></div>',
    '<label for="source">Material</label><textarea id="source" placeholder="Texto selecionado ou colado..."></textarea><div class="count" id="count">0 palavras</div>',
    '<label for="mode">Ferramenta</label><select id="mode"><option value="lesson">Lição offline</option><option value="summary">Resumo offline</option><option value="flashcards">Flashcards offline</option><option value="practice">Perguntas de prática</option><option value="checklist">Checklist</option><option value="explain">Explicação por IA</option><option value="plan">Plano de estudo por IA</option><option value="translate">Tradução por IA</option></select>',
    '<div class="row"><button id="make" class="primary">Gerar localmente</button><button id="refresh" class="secondary">Atualizar seleção</button></div><div class="row"><button id="ai" class="ai">Gerar com IA</button></div>',
    '<details id="settings"><summary>Configurar gateway de IA</summary><label for="endpoint">Endpoint /generate</label><input id="endpoint" type="url" placeholder="https://seu-worker.workers.dev/generate"><label for="token">Token temporário do gateway (não a chave do provedor)</label><input id="token" type="password" autocomplete="off"><div class="row"><button id="save" class="secondary">Guardar nesta sessão</button></div><p class="note">A chave do provedor fica no servidor como secret. O token não é armazenado. Nunca cole a chave da API aqui.</p></details>',
    '<label for="output">Resultado</label><textarea id="output" placeholder="Sua lição ou resultado aparecerá aqui."></textarea><div class="row"><button id="copy" class="primary">Copiar</button><button id="download" class="secondary">Salvar TXT</button></div><div class="status" id="status" role="status"></div>',
    '<p class="note">O painel usa somente seleção ou texto colado. Não percorre a página, não lê conteúdo oculto e não envia formulários. Alguns sites bloqueiam bookmarklets; conteúdo em iframe isolado pode exigir cópia manual.</p></section>'
  ].join('');
  const $=(id)=>root.getElementById(id);
  const source=$('source'),output=$('output'),status=$('status');
  const ENDPOINT_KEY='waynovo.gateway.endpoint';
  const selection=()=>{try{return String(window.getSelection?window.getSelection():'').trim();}catch(_){return '';}};
  source.value=selection();$('pageMeta').textContent=(document.title||'Página')+' · '+location.hostname;
  try{$('endpoint').value=sessionStorage.getItem(ENDPOINT_KEY)||'';}catch(_){}
  function updateCount(){const n=source.value.trim()?source.value.trim().split(/\s+/).length:0;$('count').textContent=n+' palavras · leitura '+(n?Math.max(1,Math.ceil(n/200)):0)+' min';}
  source.addEventListener('input',updateCount);updateCount();
  function chunks(text){const p=text.split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);const s=text.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>25);return (p.length>1?p:s).slice(0,9);}
  function terms(text){const ignored=new Set('sobre entre quando como para pela pelo pelos pelas uma umas uns dos das esse essa isso isto também então muito mais menos cada onde porque seus suas ser ter está são foi foram'.split(' '));const map=new Map();(text.toLowerCase().match(/[a-zÀ-ÿ]{5,}/g)||[]).forEach(w=>{if(!ignored.has(w))map.set(w,(map.get(w)||0)+1);});return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>x[0]);}
  function offline(kind,text){
    const parts=chunks(text),vocab=terms(text),title=document.title||'Material';
    if(kind==='summary')return ['RESUMO — '+title,'',...parts.map((p,i)=>(i+1)+'. '+p),'','TERMOS-CHAVE',...(vocab.length?vocab:['Marque os conceitos técnicos do material.']).map(x=>'• '+x),'','Confira o resumo com a fonte original.'].join('\n');
    if(kind==='flashcards')return ['FLASHCARDS — '+title,'',...parts.map((p,i)=>'CARTÃO '+(i+1)+'\nPergunta: Qual é a ideia principal deste trecho?\nPista: '+p),'','Tente responder antes de consultar a pista.'].join('\n');
    if(kind==='practice')return ['PRÁTICA — '+title,'','1. Qual é a ideia central do material?','2. Explique um conceito importante com suas palavras.','3. Como os tópicos se relacionam?','4. Crie um exemplo próprio.','','TÓPICOS PARA REVISAR',...parts.map((p,i)=>(i+1)+'. '+p),'','Perguntas originais para estudo.'].join('\n');
    if(kind==='checklist')return ['CHECKLIST — '+title,'',...parts.map((p,i)=>'[ ] Estudar etapa '+(i+1)+': '+p),'[ ] Explicar o tema sem consultar.','[ ] Revisar em 1, 3 e 7 dias.'].join('\n');
    return ['LIÇÃO — '+title,'','OBJETIVO','Compreender e explicar os conceitos centrais.','','AQUECIMENTO','Anote o que já sabe e uma dúvida.','','CONTEÚDO EM ETAPAS',...parts.map((p,i)=>(i+1)+'. '+p),'','TERMOS-CHAVE',...(vocab.length?vocab:['Identifique os termos técnicos do material.']).map(x=>'• '+x),'','RECUPERAÇÃO ATIVA','Explique a ideia principal sem consultar. Compare dois conceitos. Crie um exemplo próprio.','','REVISÃO ESPAÇADA','Revise hoje, amanhã, em 3 dias e em 7 dias.','','Lição organizada localmente. Confira o contexto dos termos.'].join('\n');
  }
  function generateLocal(){const text=source.value.trim();if(!text){status.textContent='Selecione ou cole material primeiro.';return;}output.value=offline($('mode').value,text);status.textContent='Material pronto localmente. Revise, copie ou salve.';}
  $('make').addEventListener('click',generateLocal);
  $('refresh').addEventListener('click',()=>{const text=selection();if(text){source.value=text;updateCount();status.textContent='Seleção atualizada.';}else status.textContent='Nenhum texto selecionado; cole o material.';});
  $('save').addEventListener('click',()=>{try{sessionStorage.setItem(ENDPOINT_KEY,$('endpoint').value.trim());status.textContent='Endpoint guardado. Token não armazenado.';}catch(_){status.textContent='Não foi possível guardar.';}});
  $('ai').addEventListener('click',async()=>{
    const text=source.value.trim(),endpoint=$('endpoint').value.trim(),token=$('token').value.trim();
    if(!text){status.textContent='Selecione ou cole material.';return;}if(!endpoint||!token){$('settings').open=true;status.textContent='Configure endpoint e token do gateway.';return;}
    let u;try{u=new URL(endpoint);}catch(_){status.textContent='Endpoint inválido.';return;}
    if(u.protocol!=='https:'&&u.hostname!=='localhost'&&u.hostname!=='127.0.0.1'){status.textContent='Use um endpoint HTTPS.';return;}
    const button=$('ai');button.disabled=true;button.textContent='Gerando…';
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
    try{
      const task=$('mode').value;
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({task,content:text,pageTitle:document.title}),signal:controller.signal});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Gateway HTTP '+response.status);
      if(typeof data.text!=='string'||!data.text.trim())throw new Error('Resposta vazia do gateway.');
      output.value=data.text.trim();status.textContent='Resultado IA · '+(data.provider||'gateway')+' · '+(data.model||'modelo')+'. Confira o resultado.';
    }catch(error){status.textContent=error.name==='AbortError'?'Tempo limite excedido.':(error.message||'Falha de conexão.');}
    finally{clearTimeout(timer);button.disabled=false;button.textContent='Gerar com IA';}
  });
  async function copy(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}}catch(_){}const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}area.remove();return ok;}
  $('copy').addEventListener('click',async()=>{if(!output.value)generateLocal();if(output.value)status.textContent=await copy(output.value)?'Copiado.':'Cópia bloqueada; selecione e copie.';});
  $('download').addEventListener('click',()=>{if(!output.value)generateLocal();if(!output.value)return;const url=URL.createObjectURL(new Blob([output.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='waynovo-estudo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('close').addEventListener('click',()=>host.remove());root.addEventListener('keydown',(event)=>{if(event.key==='Escape')host.remove();});source.focus();
})();