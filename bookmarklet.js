(() => {
  'use strict';

  const HOST_ID = 'waynovo-study-panel';
  const previous = document.getElementById(HOST_ID);
  if (previous) {
    previous.remove();
    return;
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('data-waynovo', 'study-panel');
  (document.body || document.documentElement).appendChild(host);

  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = [
    '<style>',
    ':host{all:initial;position:fixed;z-index:2147483000;inset:auto 18px 18px auto;font-family:Inter,system-ui,sans-serif;color:#eef1ff}',
    '*{box-sizing:border-box}',
    '.panel{width:min(420px,calc(100vw - 24px));max-height:min(82vh,760px);overflow:auto;background:#111827;border:1px solid #35405b;border-radius:18px;box-shadow:0 24px 80px #0009;color:#eef1ff;padding:18px}',
    '.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}',
    '.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:15px;letter-spacing:-.3px}',
    '.mark{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:linear-gradient(145deg,#a99aff,#6552db);font-weight:900}',
    '.close{border:1px solid #35405b;background:#1b2436;color:#cbd3e8;border-radius:9px;width:34px;height:34px;font-size:18px;cursor:pointer}',
    '.sub{font-size:12px;line-height:1.55;color:#a8b2c9;margin:0 0 14px}',
    'label{display:block;font-size:11px;font-weight:700;color:#cbd4e8;margin:12px 0 7px}',
    'textarea,select{display:block;width:100%;border:1px solid #35405b;border-radius:10px;background:#0b1220;color:#eef1ff;padding:11px;font:12px/1.5 system-ui,sans-serif;outline:none}',
    'textarea{min-height:132px;resize:vertical}',
    'textarea:focus,select:focus{border-color:#9b8cff;box-shadow:0 0 0 3px #9b8cff22}',
    '.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
    'button{font:700 11px system-ui,sans-serif;cursor:pointer}',
    '.primary,.secondary{border-radius:10px;padding:11px 13px}',
    '.primary{border:0;background:linear-gradient(100deg,#8d7aff,#7064df);color:white;flex:1}',
    '.secondary{border:1px solid #35405b;background:#1b2436;color:#e1e6f4}',
    '.note{font-size:10px;line-height:1.5;color:#8794ad;margin:13px 0 0}',
    '.status{font-size:10px;min-height:16px;color:#83dfc1;margin-top:9px}',
    '@media(max-width:520px){:host{inset:auto 8px 8px 8px}.panel{width:100%;max-height:86vh;padding:15px}}',
    '</style>',
    '<section class="panel" role="dialog" aria-label="Painel de estudos Waynovo">',
    '<div class="head"><div class="brand"><span class="mark">W</span><span>waynovo <span style="color:#a99aff">· painel de estudo</span></span></div><button class="close" id="close" aria-label="Fechar painel">×</button></div>',
    '<p class="sub">Selecione um trecho da página ou cole seu próprio material. O painel não lê o restante da página e não envia nada automaticamente.</p>',
    '<label for="source">Material selecionado ou colado</label>',
    '<textarea id="source" placeholder="Selecione um trecho antes de abrir o bookmarklet ou cole seu material aqui..."></textarea>',
    '<label for="mode">O que deseja preparar?</label>',
    '<select id="mode">',
    '<option value="explain">Explicar o conteúdo passo a passo</option>',
    '<option value="summary">Resumo estruturado</option>',
    '<option value="cards">Flashcards para revisão</option>',
    '<option value="practice">Questões novas de prática</option>',
    '<option value="plan">Plano de estudo</option>',
    '<option value="translate">Tradução com explicação dos termos</option>',
    '</select>',
    '<div class="row"><button class="primary" id="make">Preparar instrução</button><button class="secondary" id="refresh">Ler seleção</button></div>',
    '<label for="output">Instrução pronta para copiar</label>',
    '<textarea id="output" placeholder="A instrução aparecerá aqui. Revise antes de copiar." readonly></textarea>',
    '<div class="row"><button class="primary" id="copy">Copiar instrução</button><button class="secondary" id="download">Salvar .txt</button></div>',
    '<div class="status" id="status" role="status"></div>',
    '<p class="note">Execução local no navegador. Nenhuma chave de API é solicitada. Use materiais próprios ou autorizados; este painel ajuda a estudar e não preenche nem envia respostas em plataformas.</p>',
    '</section>'
  ].join('');

  const byId = (id) => root.getElementById(id);
  const source = byId('source');
  const output = byId('output');
  const status = byId('status');
  const selectedText = () => {
    try { return String(window.getSelection ? window.getSelection() : '').trim(); }
    catch (_) { return ''; }
  };

  source.value = selectedText();

  const instructions = {
    explain: 'Explique o conteúdo passo a passo em português claro. Defina os termos importantes, mostre como as ideias se conectam e dê exemplos originais.',
    summary: 'Crie um resumo estruturado com título, conceitos centrais, definições, relações importantes e uma seção final de revisão.',
    cards: 'Crie flashcards de estudo. Cada cartão deve ter uma pergunta objetiva na frente e uma explicação curta no verso. Priorize compreensão, não memorização cega.',
    practice: 'Crie 8 questões NOVAS de prática com dificuldade progressiva, gabarito comentado separado no final e explicações para os erros comuns. Não reproduza uma avaliação em andamento.',
    plan: 'Monte um plano de estudo curto e realista, dividido em etapas, com objetivos verificáveis e pausas.',
    translate: 'Traduza o material para português natural, preserve termos técnicos relevantes e explique expressões difíceis.'
  };

  function prepare() {
    const content = source.value.trim();
    if (!content) {
      status.textContent = 'Selecione um trecho ou cole algum material primeiro.';
      source.focus();
      return false;
    }
    output.value = instructions[byId('mode').value] +
      '\n\nUse apenas o material abaixo como referência. Sinalize dúvidas ou informações ausentes em vez de inventar.\n\n--- MATERIAL ---\n' +
      content;
    status.textContent = 'Instrução preparada. Revise e copie para a ferramenta de estudo que preferir.';
    return true;
  }

  async function copyText(value) {
    if (!value) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) {}
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    helper.remove();
    return ok;
  }

  byId('make').addEventListener('click', prepare);
  byId('refresh').addEventListener('click', () => {
    const text = selectedText();
    if (text) {
      source.value = text;
      status.textContent = 'Seleção atualizada.';
    } else {
      status.textContent = 'Nenhum texto selecionado. Cole o material manualmente.';
    }
  });
  byId('copy').addEventListener('click', async () => {
    if (!output.value && !prepare()) return;
    const ok = await copyText(output.value);
    status.textContent = ok ? 'Copiado para a área de transferência.' : 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
  });
  byId('download').addEventListener('click', () => {
    if (!output.value && !prepare()) return;
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'waynovo-material-de-estudo.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Arquivo preparado para salvar.';
  });
  byId('close').addEventListener('click', () => host.remove());
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') host.remove();
  });
  source.focus();
})();