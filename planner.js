(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const SESSIONS_KEY = 'waynovo.planner.sessions.v1';
  const GOAL_KEY = 'waynovo.planner.goal.v1';
  const cap = (value, min, max) => Math.min(max, Math.max(min, value));
  const makeId = () => window.crypto && typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2);
  const dateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
  const todayKey = () => dateKey(new Date());
  const parseSessions = () => {
    try {
      const value = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      return Array.isArray(value) ? value.filter((item) =>
        item && typeof item.id === 'string' && typeof item.subject === 'string' &&
        Number.isFinite(item.minutes) && item.minutes > 0 && Number.isFinite(item.createdAt)
      ).slice(-1000) : [];
    } catch (_) { return []; }
  };
  let sessions = parseSessions();
  let dailyGoal = 60;
  try { dailyGoal = cap(Number(localStorage.getItem(GOAL_KEY)) || 60, 10, 600); } catch (_) {}
  if ($('plannerGoal')) $('plannerGoal').value = String(dailyGoal);

  function persist() {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-1000)));
      localStorage.setItem(GOAL_KEY, String(dailyGoal));
    } catch (_) {
      const status = $('plannerStatus');
      if (status) status.textContent = 'Não foi possível salvar. Exporte um backup e libere espaço no navegador.';
    }
  }
  function formatMinutes(value) {
    const minutes = Math.max(0, Math.round(value));
    if (minutes < 60) return minutes + ' min';
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours + 'h' + (rest ? ' ' + rest + 'min' : '');
  }
  function addSession(minutes, subject, source) {
    const duration = cap(Math.round(Number(minutes) || 0), 1, 600);
    if (!duration) return false;
    const cleanSubject = String(subject || '').replace(/\s+/g, ' ').trim().slice(0, 72) || 'Estudo livre';
    sessions.push({ id: makeId(), minutes: duration, subject: cleanSubject, source: source || 'manual', createdAt: Date.now() });
    sessions = sessions.slice(-1000);
    persist();
    render();
    const status = $('plannerStatus');
    if (status) status.textContent = formatMinutes(duration) + ' registrados em "' + cleanSubject + '".';
    return true;
  }
  function renderWeek() {
    const chart = $('plannerWeekChart');
    if (!chart) return;
    chart.replaceChildren();
    const days = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const key = dateKey(date);
      const minutes = sessions.filter((entry) => dateKey(new Date(entry.createdAt)) === key)
        .reduce((sum, entry) => sum + entry.minutes, 0);
      days.push({ date, key, minutes });
    }
    const max = Math.max(dailyGoal, ...days.map((day) => day.minutes), 30);
    days.forEach((day) => {
      const column = document.createElement('div');
      column.className = 'planner-day';
      const value = document.createElement('span');
      value.className = 'planner-day-value';
      value.textContent = day.minutes ? formatMinutes(day.minutes) : '—';
      const track = document.createElement('div');
      track.className = 'planner-day-track';
      const bar = document.createElement('span');
      bar.className = 'planner-day-bar';
      bar.style.height = Math.max(day.minutes ? 7 : 3, Math.round(day.minutes / max * 82)) + 'px';
      track.append(bar);
      const name = document.createElement('b');
      name.textContent = day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const number = document.createElement('small');
      number.textContent = String(day.date.getDate());
      column.append(value, track, name, number);
      column.title = day.date.toLocaleDateString('pt-BR') + ': ' + formatMinutes(day.minutes);
      chart.append(column);
    });
    return days;
  }
  function renderHistory() {
    const list = $('plannerHistoryList');
    if (!list) return;
    list.replaceChildren();
    const recent = sessions.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 7);
    if (!recent.length) {
      const empty = document.createElement('p');
      empty.className = 'planner-empty';
      empty.textContent = 'Ainda não há sessões registradas. Termine um temporizador ou registre uma sessão acima.';
      list.append(empty);
      return;
    }
    recent.forEach((session) => {
      const row = document.createElement('div');
      row.className = 'planner-history-row';
      const details = document.createElement('div');
      details.className = 'planner-history-details';
      const subject = document.createElement('b');
      subject.textContent = session.subject;
      const date = document.createElement('small');
      date.textContent = new Date(session.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) +
        (session.source === 'timer' ? ' · temporizador' : ' · manual');
      details.append(subject, date);
      const time = document.createElement('strong');
      time.textContent = formatMinutes(session.minutes);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'planner-delete';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remover sessão de ' + session.subject);
      remove.addEventListener('click', () => {
        sessions = sessions.filter((item) => item.id !== session.id);
        persist();
        render();
      });
      row.append(details, time, remove);
      list.append(row);
    });
  }
  function render() {
    const today = todayKey();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const startKey = dateKey(start);
    const thisWeek = sessions.filter((entry) => dateKey(new Date(entry.createdAt)) >= startKey);
    const todaySessions = sessions.filter((entry) => dateKey(new Date(entry.createdAt)) === today);
    const todayMinutes = todaySessions.reduce((sum, entry) => sum + entry.minutes, 0);
    const weekMinutes = thisWeek.reduce((sum, entry) => sum + entry.minutes, 0);
    const activeDays = new Set(sessions.map((entry) => dateKey(new Date(entry.createdAt))));
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (streak < 366 && activeDays.has(dateKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    $('plannerTodayMinutes').textContent = formatMinutes(todayMinutes);
    $('plannerWeekMinutes').textContent = formatMinutes(weekMinutes);
    $('plannerStreak').textContent = String(streak);
    $('plannerSessionCount').textContent = String(thisWeek.length);
    const percent = Math.min(100, Math.round(todayMinutes / dailyGoal * 100));
    $('plannerGoalBar').style.width = percent + '%';
    $('plannerGoalText').textContent = formatMinutes(todayMinutes) + ' de ' + formatMinutes(dailyGoal) + ' · ' +
      (todayMinutes >= dailyGoal ? 'meta diária concluída!' : 'faltam ' + formatMinutes(dailyGoal - todayMinutes));
    $('plannerGoalBar').setAttribute('aria-valuenow', String(percent));
    renderWeek();
    renderHistory();
  }
  $('plannerGoal').addEventListener('change', () => {
    dailyGoal = cap(Number($('plannerGoal').value) || 60, 10, 600);
    persist();
    render();
  });
  $('plannerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const subject = $('plannerSubject').value;
    const minutes = Number($('plannerMinutes').value);
    if (addSession(minutes, subject, 'manual')) {
      $('plannerSubject').value = '';
      $('plannerSubject').focus();
    }
  });
  window.addEventListener('waynovo:focus-complete', (event) => {
    const detail = event.detail || {};
    addSession(detail.minutes, detail.subject || $('plannerSubject').value || 'Estudo livre', 'timer');
  });
  window.WaynovoPlanner = {
    exportData: () => ({ sessions: sessions.slice(), dailyGoal }),
    importData: (data) => {
      if (!data || typeof data !== 'object') return 0;
      let imported = 0;
      if (Array.isArray(data.sessions)) {
        const known = new Set(sessions.map((entry) => entry.id));
        data.sessions.forEach((item) => {
          if (!item || typeof item.subject !== 'string' || !Number.isFinite(Number(item.minutes)) ||
              !Number.isFinite(Number(item.createdAt)) || Number(item.minutes) <= 0) return;
          const originalId = typeof item.id === 'string' ? item.id : makeId();
          const id = known.has(originalId) ? makeId() : originalId;
          known.add(id);
          sessions.push({
            id,
            subject: item.subject.replace(/\s+/g, ' ').trim().slice(0, 72) || 'Estudo livre',
            minutes: cap(Math.round(Number(item.minutes)), 1, 600),
            source: item.source === 'timer' ? 'timer' : 'manual',
            createdAt: Number(item.createdAt)
          });
          imported++;
        });
        sessions = sessions.slice(-1000);
      }
      if (Number.isFinite(Number(data.dailyGoal))) dailyGoal = cap(Number(data.dailyGoal), 10, 600);
      $('plannerGoal').value = String(dailyGoal);
      persist();
      render();
      return imported;
    },
    addSession
  };
  render();
})();