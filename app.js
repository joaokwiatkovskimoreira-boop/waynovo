(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = 'waynovo.tasks.v2';
  const THEME_KEY = 'waynovo.theme.v1';
  const material = $('#material');
  const mode = $('#mode');
  const queueList = $('#queueList');
  const labels = {
    organize: 'Organizar conteúdo',
    lesson: 'Lição automática',
    summary: 'Resumo estruturado',
    flashcards: 'Flashcards',
    practice: 'Simulado de prática',
    checklist: 'Checklist',
    review: 'Revisão de prática'
  };
  let toastTimer;

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.filter((task) =>
        task && typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        typeof task.content === 'string' &&
        typeof task.mode === 'string'
      ).map((task) => ({
        id: task.id,
        title: task.title.slice(0, 120),
        content: task.content,
        mode: labels[task.mode] ? task.mode : 'organize',
        priority: ['Alta', 'Normal', 'Baixa'].includes(task.priority) ? task.priority : 'Normal',
        done: Boolean(task.done),
        date: typeof task.date === 'string' ? task.date : ''
      }));
    } catch (error) {
      console.warn('Waynovo: não foi possível ler a fila salva.', error);
      return [];
    }
  }

  let tasks = loadTasks();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      notify('Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado.');
      console.warn('Waynovo: falha ao salvar a fila.', error);
    }
  }

  function notify(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
  }

  function updateStats() {
    $('#taskCount').textContent = tasks.filter((task) => !task.done).length;
    $('#doneCount').textContent = tasks.filter((task) => task.done).length;
  }

  function emptyState(title, description) {
    const box = document.createElement('div');
    box.className = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-icon';
    icon.textContent = '⌁';
    const heading = document.createElement('b');
    heading.textContent = title;
    const hint = document.createElement('span');
    hint.textContent = description;
    box.append(icon, heading, hint);
    return box;
  }

  function render() {
    const query = ($('#queueSearch').value || '').trim().toLocaleLowerCase('pt-BR');
    const visibleTasks = tasks.filter((task) =>
      !query || (task.title + ' ' + task.content + ' ' + labels[task.mode]).toLocaleLowerCase('pt-BR').includes(query)
    );

    queueList.replaceChildren();
    if (!visibleTasks.length) {
      queueList.append(emptyState(
        tasks.length ? 'Nenhum resultado encontrado' : 'Sua fila está vazia',
        tasks.length ? 'Tente outro termo de busca.' : 'Adicione um fluxo acima para começar.'
      ));
      updateStats();
      return;
    }

    visibleTasks.forEach((task) => {
      const row = document.createElement('div');
      row.className = 'task' + (task.done ? ' done' : '');

      const check = document.createElement('button');
      check.className = 'task-check';
      check.textContent = task.done ? '✓' : '○';
      check.setAttribute('aria-label', task.done ? 'Reabrir tarefa' : 'Concluir tarefa');
      check.addEventListener('click', () => {
        task.done = !task.done;
        persist();
        render();
      });

      const info = document.createElement('div');
      info.className = 'task-info';
      const name = document.createElement('div');
      name.className = 'task-name';
      name.textContent = task.title;
      const sub = document.createElement('div');
      sub.className = 'task-sub';
      sub.textContent = task.priority + ' · ' + task.date;
      info.append(name, sub);

      const tag = document.createElement('span');
      tag.className = 'task-tag';
      tag.textContent = labels[task.mode] || labels.organize;

      const remove = document.createElement('button');
      remove.className = 'task-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remover tarefa');
      remove.addEventListener('click', () => {
        tasks = tasks.filter((item) => item.id !== task.id);
        persist();
        render();
        notify('Tarefa removida.');
      });

      row.append(check, info, tag, remove);
      queueList.append(row);
    });
    updateStats();
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return String(Date.now()) + '-' + Math.random().toString(36).slice(2);
  }

  material.addEventListener('input', () => {
    $('#charCount').textContent = material.value.length.toLocaleString('pt-BR') + ' caracteres';
  });

  $('#clearBtn').addEventListener('click', () => {
    material.value = '';
    material.dispatchEvent(new Event('input'));
    material.focus();
  });

  function buildLesson(raw) {
    const clean = raw.replace(/\\r/g, '').trim();
    const paragraphs = clean.split(/\\n{2,}/).map(s => s.trim()).filter(Boolean);
    const sentences = clean.split(/(?<=[.!?])\\s+/).map(s => s.trim()).filter(s => s.length > 24);
    const title = (paragraphs[0] || clean).replace(/\\s+/g, ' ').slice(0, 76);
    const chunks = (paragraphs.length > 1 ? paragraphs : sentences).slice(0, 6);
    const concepts = [...new Set((clean.match(/\\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\\wÀ-ÿ-]{4,}\\b/g) || []))].slice(0, 8);
    const lines = [
      'LIÇÃO: ' + title,
      '',
      'OBJETIVO',
      'Compreender as ideias centrais do material e conseguir explicá-las com suas próprias palavras.',
      '',
      'AQUECIMENTO',
      'Leia o material uma vez e anote o que já sabe sobre o assunto.',
      '',
      'CONTEÚDO EM ETAPAS',
      ...chunks.map((part, i) => (i + 1) + '. ' + part),
      '',
      'CONCEITOS PARA DOMINAR',
      ...(concepts.length ? concepts.map(x => '• ' + x) : ['• Identifique os termos e definições mais importantes do texto.']),
      '',
      'PRATIQUE',
      '1. Qual é a ideia principal deste material?',
      '2. Como você explicaria o conceito mais importante sem consultar o texto?',
      '3. Que exemplo próprio demonstra que você entendeu o assunto?',
      '',
      'REVISÃO FINAL',
      'Resuma o que aprendeu em 3 frases e marque os pontos que ainda precisam de revisão.',
      '',
      'Nota: lição estruturada automaticamente a partir do texto fornecido; confira os conceitos e complemente quando necessário.'
    ];
    return { title, text: lines.join('\\n') };
  }

  let currentLesson = '';
  $('#lessonBtn').addEventListener('click', () => {
    const raw = material.value.trim();
    if (!raw) { notify('Cole um material para montar a lição.'); material.focus(); return; }
    const lesson = buildLesson(raw);
    currentLesson = lesson.text;
    $('#lessonTitle').textContent = lesson.title;
    const body = $('#lessonBody');
    body.replaceChildren();
    lesson.text.split('\\n').forEach(line => {
      const p = document.createElement('p');
      p.textContent = line || ' ';
      if (/^(OBJETIVO|AQUECIMENTO|CONTEÚDO EM ETAPAS|CONCEITOS PARA DOMINAR|PRATIQUE|REVISÃO FINAL)$/.test(line)) p.className = 'lesson-heading';
      body.append(p);
    });
    $('#lessonResult').hidden = false;
    mode.value = 'lesson';
    notify('Lição automática criada. Revise e ajuste se necessário.');
  });

  async function copyLesson() {
    if (!currentLesson) return;
    try {
      await navigator.clipboard.writeText(currentLesson);
      notify('Lição copiada.');
    } catch (_) { notify('Cópia indisponível neste contexto; use Salvar .txt.'); }
  }
  $('#copyLesson').addEventListener('click', copyLesson);
  $('#downloadLesson').addEventListener('click', () => {
    if (!currentLesson) return;
    const url = URL.createObjectURL(new Blob([currentLesson], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'waynovo-licao.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('#addBtn').addEventListener('click', () => {
    const value = material.value.trim();
    if (!value) {
      notify('Adicione um conteúdo antes de criar o fluxo.');
      material.focus();
      return;
    }
    tasks.unshift({
      id: createId(),
      title: value.replace(/\s+/g, ' ').slice(0, 82) + (value.length > 82 ? '…' : ''),
      content: value,
      mode: mode.value,
      priority: $('#priority').value,
      done: false,
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    });
    persist();
    render();
    material.value = '';
    material.dispatchEvent(new Event('input'));
    notify('Fluxo salvo na fila local.');
  });

  $('#clearQueue').addEventListener('click', () => {
    if (!tasks.length) return;
    if (!window.confirm('Deseja limpar todas as tarefas salvas neste navegador?')) return;
    tasks = [];
    persist();
    render();
    notify('Fila limpa.');
  });

  $('#exportQueue').addEventListener('click', () => {
    const backup = {
      app: 'Waynovo',
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      tasks
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'waynovo-backup.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Backup exportado.');
  });

  $('#queueSearch').addEventListener('input', render);

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      mode.value = button.dataset.mode;
      $('#workspace').scrollIntoView({ behavior: 'smooth' });
      material.focus();
    });
  });
  $('[data-focus]').addEventListener('click', () => {
    material.focus();
    $('#workspace').scrollIntoView({ behavior: 'smooth' });
  });

  function setTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    try { localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark'); } catch (_) {}
  }
  try { setTheme(localStorage.getItem(THEME_KEY) === 'light'); } catch (_) {}
  $('#themeBtn').addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light');
    setTheme(isLight);
    notify(isLight ? 'Tema claro ativado.' : 'Tema escuro ativado.');
  });

  const loaderCode = "javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/joaokwiatkovskimoreira-boop/waynovo@main/bookmarklet.js';s.async=true;s.onerror=()=>alert('Waynovo: não foi possível carregar o painel. Este site pode bloquear scripts externos.');(document.head||document.documentElement).appendChild(s)})()";
  const bookmarkletLink = $('#bookmarkletLink');
  bookmarkletLink.href = loaderCode;
  $('#bookmarkletCode').textContent = loaderCode;

  async function copyText(value) {
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
    document.body.append(helper);
    helper.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    helper.remove();
    return ok;
  }

  $('#copyBookmarklet').addEventListener('click', async () => {
    const ok = await copyText(loaderCode);
    notify(ok ? 'Código do bookmarklet copiado.' : 'Não foi possível copiar. Selecione o código e copie manualmente.');
  });

  const now = new Date();
  $('#today').textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#year').textContent = now.getFullYear();
  render();
})();