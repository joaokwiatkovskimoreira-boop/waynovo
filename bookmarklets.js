(() => {
  'use strict';

  function youtubeMiniPlayer() {
    const existing = document.getElementById('waynovo-youtube-mini-player');
    if (existing) { existing.remove(); return; }
    const raw = window.prompt('Cole links ou IDs de vídeos do YouTube / YouTube Music, um por linha:');
    if (!raw) return;
    const ids = raw.split(/\r?\n/).map(value => value.trim()).filter(Boolean).map(value => {
      if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
      try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
        if (['youtube.com','m.youtube.com','music.youtube.com'].includes(host)) {
          return url.searchParams.get('v') || (url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/) || [])[1] || '';
        }
      } catch (_) {}
      return '';
    }).filter(id => /^[A-Za-z0-9_-]{11}$/.test(id));
    if (!ids.length) { window.alert('Nenhum ID de vídeo válido foi encontrado.'); return; }
    let index = 0;
    const box = document.createElement('section');
    box.id = 'waynovo-youtube-mini-player';
    box.style.cssText = 'position:fixed;z-index:2147483647;right:14px;bottom:14px;width:min(390px,calc(100vw - 28px));background:#111522;color:#f4f5fb;border:1px solid #786bc0;border-radius:14px;box-shadow:0 16px 50px #0009;overflow:hidden;font:13px system-ui,sans-serif';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:8px;padding:9px 11px;background:#1a2030';
    const title = document.createElement('strong'); title.textContent = 'Waynovo · YouTube Player'; title.style.flex = '1';
    const open = document.createElement('a'); open.target = '_blank'; open.rel = 'noopener noreferrer'; open.textContent = 'Abrir'; open.style.cssText = 'color:#c7bdff;font-size:11px';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label','Fechar player'); close.style.cssText = 'border:0;background:transparent;color:white;font-size:23px;cursor:pointer';
    close.addEventListener('click', () => box.remove());
    head.append(title, open, close);
    const frameWrap = document.createElement('div'); frameWrap.style.cssText = 'aspect-ratio:16/9;background:#000';
    const frame = document.createElement('iframe'); frame.title = 'Player oficial do YouTube'; frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.style.cssText = 'width:100%;height:100%;border:0';
    frameWrap.append(frame);
    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px';
    const prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '← Anterior';
    const next = document.createElement('button'); next.type = 'button'; next.textContent = 'Próximo →';
    const count = document.createElement('span'); count.style.cssText = 'color:#aab4c8;font-size:10px';
    [prev,next].forEach(button => { button.style.cssText = 'border:1px solid #424b65;background:#222a3e;color:#f4f5fb;border-radius:8px;padding:7px 9px;font:11px system-ui;cursor:pointer'; });
    function show() {
      const id = ids[index];
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?playsinline=1&rel=0&controls=1&autoplay=1';
      open.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
      count.textContent = (index + 1) + ' / ' + ids.length;
      prev.disabled = index === 0; next.disabled = index === ids.length - 1;
      prev.style.opacity = prev.disabled ? '.45' : '1'; next.style.opacity = next.disabled ? '.45' : '1';
    }
    prev.addEventListener('click', () => { if (index > 0) { index--; show(); } });
    next.addEventListener('click', () => { if (index < ids.length - 1) { index++; show(); } });
    controls.append(prev,count,next);
    const note = document.createElement('div'); note.textContent = 'Player oficial incorporado. O YouTube ou o navegador pode exigir tocar em Reproduzir.'; note.style.cssText = 'padding:0 11px 9px;color:#99a5bb;font-size:10px';
    box.append(head,frameWrap,controls,note); document.body.append(box); show();
  }

  function readerMode() {
    const id = 'waynovo-reader-mode';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); return; }
    const selectors = 'article p,main p,[role="main"] p,article li,main li,article h1,article h2,article h3,main h1,main h2,main h3';
    const lines = Array.from(document.querySelectorAll(selectors)).filter(el => {
      const style = getComputedStyle(el);
      return el.getClientRects().length && style.display !== 'none' && style.visibility !== 'hidden' && (el.innerText || '').trim();
    }).map(el => (el.innerText || '').trim()).filter(Boolean);
    const root = document.querySelector('article,main,[role="main"]') || document.body;
    const content = (lines.length ? lines.join('\n\n') : (root.innerText || '')).slice(0,40000);
    if (!content.trim()) { window.alert('Não encontrei texto visível para leitura.'); return; }
    const panel = document.createElement('section'); panel.id = id;
    panel.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#f6f2e9;color:#28241f;overflow:auto;padding:clamp(18px,5vw,60px);font:18px/1.8 Georgia,serif';
    const bar = document.createElement('div'); bar.style.cssText = 'position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;background:#f6f2e9;padding:8px 0;border-bottom:1px solid #d8d0c1;font:13px system-ui,sans-serif';
    const label = document.createElement('strong'); label.textContent = 'Waynovo · Modo leitura';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Fechar'; close.style.cssText = 'padding:8px 13px;border:1px solid #aaa08e;border-radius:8px;background:#fff;color:#28241f;cursor:pointer'; close.addEventListener('click',()=>panel.remove());
    bar.append(label,close);
    const body = document.createElement('article'); body.style.cssText = 'max-width:760px;margin:36px auto;white-space:pre-wrap;overflow-wrap:anywhere'; body.textContent = content;
    panel.append(bar,body); document.body.append(panel);
  }

  function pageOutline() {
    const id = 'waynovo-page-outline';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); return; }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).filter(h=>h.getClientRects().length&&(h.innerText||'').trim()).slice(0,100);
    if (!headings.length) { window.alert('Esta página não tem títulos visíveis reconhecíveis.'); return; }
    const panel = document.createElement('aside'); panel.id = id;
    panel.style.cssText = 'position:fixed;z-index:2147483647;right:14px;top:14px;bottom:14px;width:min(340px,calc(100vw - 28px));overflow:auto;background:#111522;color:#f4f5fb;border:1px solid #7569bd;border-radius:13px;box-shadow:0 14px 44px #0009;padding:12px;font:12px system-ui,sans-serif';
    const head = document.createElement('div'); head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px';
    const title = document.createElement('strong'); title.textContent = 'Waynovo · Mapa da página';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.style.cssText = 'background:transparent;border:0;color:white;font-size:23px;cursor:pointer'; close.addEventListener('click',()=>panel.remove());
    head.append(title,close); panel.append(head);
    headings.forEach((heading,index)=>{
      const button = document.createElement('button'); button.type = 'button'; button.textContent = (index+1)+'. '+heading.innerText.trim().slice(0,110);
      button.style.cssText = 'display:block;width:100%;text-align:left;margin:4px 0;padding:9px;border:1px solid #30394f;border-radius:8px;background:#1a2030;color:#e8eaf5;font:11px/1.4 system-ui;cursor:pointer';
      button.addEventListener('click',()=>{heading.scrollIntoView({behavior:'smooth',block:'start'});heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});});
      panel.append(button);
    });
    document.body.append(panel);
  }

  function focusTimer() {
    const id = 'waynovo-focus-timer';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); return; }
    let remaining = 25 * 60, interval = null;
    const box = document.createElement('section'); box.id = id;
    box.style.cssText = 'position:fixed;z-index:2147483647;right:14px;bottom:14px;width:230px;background:#111522;color:#f4f5fb;border:1px solid #786bc0;border-radius:13px;box-shadow:0 14px 40px #0009;padding:13px;font:12px system-ui,sans-serif';
    const head = document.createElement('div'); head.style.cssText = 'display:flex;justify-content:space-between;align-items:center';
    const label = document.createElement('strong'); label.textContent = 'Waynovo · Foco 25:00';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.style.cssText = 'background:transparent;border:0;color:white;font-size:22px;cursor:pointer';
    const display = document.createElement('div'); display.style.cssText = 'font:700 34px ui-monospace,monospace;text-align:center;padding:14px 0'; display.textContent = '25:00';
    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:7px';
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.textContent = 'Iniciar';
    const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Reiniciar';
    [toggle,reset].forEach(button=>button.style.cssText='flex:1;padding:8px;border:1px solid #454f69;border-radius:8px;background:#222a3e;color:#f4f5fb;cursor:pointer');
    function draw(){display.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');}
    function stop(){if(interval)clearInterval(interval);interval=null;toggle.textContent='Continuar';}
    function cleanup(){if(interval)clearInterval(interval);box.remove();}
    close.addEventListener('click',cleanup);
    toggle.addEventListener('click',()=>{
      if(interval){stop();return;}
      if(remaining<=0)remaining=25*60;
      toggle.textContent='Pausar';
      interval=setInterval(()=>{remaining--;draw();if(remaining<=0){clearInterval(interval);interval=null;toggle.textContent='Concluído';window.alert('Waynovo: sessão de foco concluída!');}},1000);
    });
    reset.addEventListener('click',()=>{if(interval)clearInterval(interval);interval=null;remaining=25*60;toggle.textContent='Iniciar';draw();});
    controls.append(toggle,reset);head.append(label,close);box.append(head,display,controls);document.body.append(box);
    const observer = new MutationObserver(()=>{if(!document.body.contains(box))cleanup();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  function linkInspector() {
    const id = 'waynovo-link-inspector';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); return; }
    const links = Array.from(document.querySelectorAll('a[href]')).filter(a=>a.getClientRects().length).slice(0,200).map(a=>{
      try { const url = new URL(a.href,location.href); return {label:(a.innerText||a.getAttribute('aria-label')||url.hostname).trim().replace(/\s+/g,' ').slice(0,90),url:url.href,external:url.origin!==location.origin,secure:url.protocol==='https:'}; } catch (_) { return null; }
    }).filter(Boolean);
    const panel = document.createElement('aside'); panel.id = id;
    panel.style.cssText = 'position:fixed;z-index:2147483647;right:14px;top:14px;bottom:14px;width:min(390px,calc(100vw - 28px));overflow:auto;background:#111522;color:#f4f5fb;border:1px solid #7569bd;border-radius:13px;box-shadow:0 14px 44px #0009;padding:12px;font:12px system-ui,sans-serif';
    const head = document.createElement('div'); head.style.cssText='position:sticky;top:-12px;background:#111522;display:flex;justify-content:space-between;align-items:center;padding:5px 0 10px';
    const title = document.createElement('strong'); title.textContent='Waynovo · Links visíveis ('+links.length+')';
    const close = document.createElement('button'); close.type='button'; close.textContent='×'; close.style.cssText='background:transparent;border:0;color:white;font-size:23px;cursor:pointer'; close.addEventListener('click',()=>panel.remove());
    head.append(title,close);panel.append(head);
    links.forEach(link=>{
      const row=document.createElement('div');row.style.cssText='padding:9px 2px;border-bottom:1px solid #30394f';
      const name=document.createElement('div');name.textContent=(link.external?'EXTERNO · ':'INTERNO · ')+link.label;name.style.cssText='font-weight:700;margin-bottom:4px;color:'+(link.secure?'#b9b0ff':'#ffcc91');
      const address=document.createElement('div');address.textContent=link.url;address.style.cssText='font-size:10px;color:#aab4c8;overflow-wrap:anywhere';
      row.append(name,address);panel.append(row);
    });
    document.body.append(panel);
  }

  function selectionNotebook() {
    const selected = String(window.getSelection ? window.getSelection() : '').trim();
    if (!selected) { window.alert('Selecione um trecho de texto antes de abrir o caderno.'); return; }
    const id = 'waynovo-selection-notebook';
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const panel = document.createElement('section'); panel.id=id;
    panel.style.cssText='position:fixed;z-index:2147483647;inset:8% 5%;max-width:760px;margin:auto;background:#111522;color:#f4f5fb;border:1px solid #786bc0;border-radius:14px;box-shadow:0 16px 50px #0009;padding:15px;display:flex;flex-direction:column;gap:10px;font:12px system-ui,sans-serif';
    const head=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;align-items:center';
    const title=document.createElement('strong');title.textContent='Waynovo · Caderno de seleção';
    const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.style.cssText='padding:7px 10px;border:1px solid #454f69;border-radius:8px;background:#222a3e;color:white';close.addEventListener('click',()=>panel.remove());
    const area=document.createElement('textarea');area.value=selected;area.style.cssText='width:100%;min-height:180px;flex:1;resize:vertical;padding:12px;border:1px solid #39435c;border-radius:10px;background:#0b101c;color:#f4f5fb;font:13px/1.6 system-ui';
    const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
    const copy=document.createElement('button');copy.type='button';copy.textContent='Copiar';copy.style.cssText='padding:9px 12px;border:1px solid #454f69;border-radius:8px;background:#222a3e;color:white';
    copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(area.value);copy.textContent='Copiado!';}catch(_){area.focus();area.select();document.execCommand('copy');copy.textContent='Copiado';}});
    const save=document.createElement('button');save.type='button';save.textContent='Baixar TXT';save.style.cssText=copy.style.cssText;
    save.addEventListener('click',()=>{const blob=new Blob([area.value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='waynovo-selecao.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    actions.append(copy,save);head.append(title,close);panel.append(head,area,actions);document.body.append(panel);
  }

  const tools = [
    {id:'youtube-player',name:'YouTube Mini Player',description:'Player flutuante com fila de links do YouTube e YouTube Music usando o embed oficial.',fn:youtubeMiniPlayer},
    {id:'reader-mode',name:'Modo leitura',description:'Mostra o texto visível do artigo em uma página limpa e confortável.',fn:readerMode},
    {id:'page-outline',name:'Mapa da página',description:'Navegue pelos títulos visíveis sem ficar rolando aleatoriamente.',fn:pageOutline},
    {id:'focus-timer',name:'Timer Pomodoro',description:'Temporizador flutuante de foco com iniciar, pausar e reiniciar.',fn:focusTimer},
    {id:'link-inspector',name:'Auditor de links',description:'Lista links visíveis, separa internos e externos e destaca destinos sem HTTPS.',fn:linkInspector},
    {id:'selection-notebook',name:'Caderno de seleção',description:'Guarda o trecho que você selecionou em um painel para copiar ou baixar como TXT.',fn:selectionNotebook}
  ];
  window.WaynovoBookmarklets = tools.map(tool=>({id:tool.id,name:tool.name,description:tool.description,source:'('+tool.fn.toString()+')()'}));
})();