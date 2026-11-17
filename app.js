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