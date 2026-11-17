(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'waynovo.flashcards.v1';
  const STATS_KEY = 'waynovo.flashcards.stats.v1';
  const material = $('material');
  const sessionReviewed = new Set();
  let cards = [];
  let currentId = null;
  let revealed = false;
  let shuffled = false;

  function uid() {
    return window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2);
  }
  function localDateKey(value) {
    const date = value ? new Date(value) : new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  function loadCards() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter((card) =>
        card && typeof card.id === 'string' && typeof card.front === 'string' &&
        typeof card.back === 'string' && typeof card.dueAt === 'number'
      ).slice(0, 1000) : [];
    } catch (_) { return []; }
  }
  function loadStats() {
    try {
      const value = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) { return {}; }
  }
  cards = loadCards();
  let stats = loadStats();
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (_) { message('Não foi possível salvar os cartões. Exporte um backup e libere espaço no navegador.'); }
  }
  function message(text) { $('reviewMessage').textContent = text; }
  function splitMaterial(text) {
    const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
    const sentences = text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter((part) => part.length >= 28);
    const parts = paragraphs.length > 1 ? paragraphs : sentences;
    return [...new Set(parts)].slice(0, 40);
  }
  function pickTerms(text) {
    const ignored = new Set(('sobre entre quando como para pela pelo pelos pelas uma umas uns dos das esse essa isso isto também então muito mais menos cada onde porque seus suas ser ter está são foi foram pode podem deve devem deste desta esses essas aquilo parte partes').split(' '));
    const frequencies = new Map();
    (text.toLocaleLowerCase('pt-BR').match(/[a-zÀ-ÿ]{5,}/g) || []).forEach((word) => {
      if (!ignored.has(word)) frequencies.set(word, (frequencies.get(word) || 0) + 1);
    });
    return [...frequencies.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).map(([word]) => word);
  }
  function escapeRegExp(text) { return text.replace(/[.*+?^$()|[\]\\]/g, '\\$&'); }
  function buildCards(text) {
    const parts = splitMaterial(text);
    const terms = pickTerms(text);
    const sourceTitle = (document.title || 'Material de estudo').slice(0, 140);
    const existing = new Set(cards.map((card) => card.back));
    const created = [];
    parts.forEach((part, index) => {
      if (existing.has(part)) return;
      const term = terms.find((candidate) => candidate.length >= 5 && part.toLocaleLowerCase('pt-BR').includes(candidate));
      let front;
      if (term) {
        const pattern = new RegExp(escapeRegExp(term), 'i');
        front = 'Complete o conceito:\n' + part.replace(pattern, '________________');
      } else {
        front = 'Recupere com suas palavras a ideia ' + (index + 1) + ' do material.';
      }
      created.push({
        id: uid(), front, back: part + (term ? '\n\nTermo-chave: ' + term : ''),
        source: sourceTitle, createdAt: Date.now(), dueAt: Date.now(),
        reps: 0, lapses: 0, intervalDays: 0, lastReviewed: null
      });
      existing.add(part);
    });
    return created;
  }
  function dueCards() {
    const now = Date.now();
    return cards.filter((card) => card.dueAt <= now && !sessionReviewed.has(card.id))
      .sort((a, b) => a.dueAt - b.dueAt || a.createdAt - b.createdAt);
  }
  function nextDueDate() {
    return cards.filter((card) => !sessionReviewed.has(card.id)).sort((a, b) => a.dueAt - b.dueAt)[0];
  }
  function renderStats() {
    const today = localDateKey();
    const reviewedToday = Number(stats[today] || 0);
    const due = cards.filter((card) => card.dueAt <= Date.now()).length;
    $('flashcardTotal').textContent = cards.length;
    $('flashcardDue').textContent = due;
    $('flashcardToday').textContent = reviewedToday;
    $('cardsDueCount').textContent = due;
  }
  function displayCard(card) {
    currentId = card ? card.id : null;
    revealed = false;
    $('reviewBack').hidden = true;
    $('ratingControls').hidden = true;
    $('revealCard').hidden = !card;
    if (!card) {
      $('reviewStatus').textContent = cards.length ? 'SESSÃO CONCLUÍDA' : 'SEM BARALHO';
      $('reviewPosition').textContent = '—';
      $('reviewFront').textContent = cards.length ? 'Tudo revisado por enquanto!' : 'Crie um baralho a partir do material para começar.';
      $('reviewBack').textContent = '';
      $('reviewSource').textContent = cards.length ? 'Volte quando os próximos cartões vencerem.' : 'Cole conteúdo no editor e clique em “Criar baralho”.';
      $('revealCard').textContent = 'Nenhum cartão pendente';
      const next = nextDueDate();
      if (next) {
        const diff = Math.max(1, Math.ceil((next.dueAt - Date.now()) / 60000));
        message('Próximo cartão previsto em aproximadamente ' + diff + ' minuto(s), dependendo do agendamento.');
      } else message('Quando criar seu primeiro baralho, a revisão aparecerá aqui.');
      return;
    }
    const pending = dueCards();
    $('reviewStatus').textContent = card.reps ? 'REVISÃO ' + (card.reps + 1) : 'NOVO CARTÃO';
    $('reviewPosition').textContent = (sessionReviewed.size + 1) + ' · ' + Math.max(sessionReviewed.size + pending.length, 1);
    $('reviewFront').textContent = card.front;
    $('reviewBack').textContent = card.back;
    $('reviewSource').textContent = 'Origem: ' + (card.source || 'Material local');
    $('revealCard').textContent = 'Mostrar resposta';
    message('Pense na resposta antes de revelar. Atalho: Espaço, quando o foco estiver fora de campos.');
  }
  function advance() {
    const list = dueCards();
    if (!list.length) { displayCard(null); renderStats(); return; }
    if (shuffled) list.sort(() => Math.random() - 0.5);
    displayCard(list[0]);
    renderStats();
  }
  function reveal() {
    if (!currentId || revealed) return;
    const card = cards.find((item) => item.id === currentId);
    if (!card) return;
    revealed = true;
    $('reviewBack').hidden = false;
    $('ratingControls').hidden = false;
    $('revealCard').hidden = true;
  }
  function grade(level) {
    if (!currentId || !revealed) return;
    const card = cards.find((item) => item.id === currentId);
    if (!card) return;
    const now = Date.now();
    if (level === 'again') {
      card.lapses = (card.lapses || 0) + 1;
      card.intervalDays = 0;
      card.dueAt = now + 10 * 60 * 1000;
    } else {
      card.reps = (card.reps || 0) + 1;
      const schedule = level === 'easy' ? [4, 7, 14, 30, 60] : [1, 3, 7, 14, 30];
      card.intervalDays = schedule[Math.min(card.reps - 1, schedule.length - 1)];
      card.dueAt = now + card.intervalDays * 24 * 60 * 60 * 1000;
    }
    card.lastReviewed = now;
    const today = localDateKey();
    stats[today] = (stats[today] || 0) + 1;
    if (level !== 'again') sessionReviewed.add(card.id);
    save();
    advance();
    message(level === 'again' ? 'Cartão marcado como difícil e agendado para nova tentativa em 10 minutos.' :
      'Revisão salva. Próximo intervalo: ' + card.intervalDays + ' dia(s).');
  }
  $('createDeckBtn').addEventListener('click', () => {
    const text = material.value.trim();
    if (!text) { message('Cole o conteúdo no editor antes de criar um baralho.'); material.focus(); return; }
    const created = buildCards(text);
    if (!created.length) { message('Não encontrei conteúdo novo para cartões. Tente um texto um pouco maior.'); return; }
    cards = [...created, ...cards].slice(0, 1000);
    sessionReviewed.clear();
    save();
    renderStats();
    advance();
    $('studyLab').scrollIntoView({ behavior: 'smooth', block: 'start' });
    message(created.length + ' cartão(ões) adicionados. Comece tentando lembrar antes de revelar.');
  });
  $('revealCard').addEventListener('click', reveal);
  $('ratingControls').querySelectorAll('[data-grade]').forEach((button) => button.addEventListener('click', () => grade(button.dataset.grade)));
  $('shuffleDue').addEventListener('click', () => { shuffled = !shuffled; $('shuffleDue').textContent = shuffled ? 'Ordem normal' : 'Embaralhar pendentes'; advance(); });
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      $('studyLab').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const active = document.activeElement;
    const typing = active && (active.matches('input,textarea,select') || active.isContentEditable || active.matches('button,a'));
    if (event.code === 'Space' && !typing && currentId) { event.preventDefault(); if (revealed) advance(); else reveal(); }
  });
  renderStats();
  advance();
  window.setInterval(() => { renderStats(); if (!currentId) advance(); }, 60_000);
})();