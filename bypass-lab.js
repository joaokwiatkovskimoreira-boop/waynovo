(function () {
  'use strict';
  const api = window.WaynovoBypassEngine;
  if (!api) return;
  const $ = (id) => document.getElementById(id);
  const engine = api.createDefaultEngine();
  const STORAGE_KEY = 'waynovo.bypass.audit.v1';
  let audit = readAudit();

  function readAudit() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter((item) => item && typeof item.id === 'string').slice(-100) : [];
    } catch (_) { return []; }
  }
  function saveAudit() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(audit.slice(-100)));
      return true;
    } catch (_) { notify('Armazenamento local indisponível; exporte a auditoria.'); return false; }
  }
  function notify(message) {
    const status = $('bypassLabStatus');
    if (status) status.textContent = message;
  }
  function escapeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
  function renderAudit() {
    const body = $('bypassAuditList');
    body.replaceChildren();
    const recent = audit.slice().reverse().slice(0, 12);
    if (!recent.length) {
      const empty = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.className = 'bypass-empty';
      cell.textContent = 'Nenhuma execução registrada ainda.';
      empty.append(cell);
      body.append(empty);
    } else {
      recent.forEach((item) => {
        const row = document.createElement('tr');
        [new Date(item.timestamp).toLocaleTimeString('pt-BR'), item.adapterName, item.strategy === 'qa-override' ? 'Override QA' : 'Baseline', item.outcome, item.reason].forEach((value, index) => {
          const cell = document.createElement('td');
          cell.textContent = String(value);
          if (index === 3) cell.className = item.allowed ? 'is-allow' : 'is-deny';
          row.append(cell);
        });
        body.append(row);
      });
    }
    const totals = audit.reduce((acc, item) => {
      acc.total += 1;
      if (item.allowed) acc.allow += 1; else acc.deny += 1;
      if (item.overridden) acc.overrides += 1;
      return acc;
    }, { total: 0, allow: 0, deny: 0, overrides: 0 });
    $('bypassMetricTotal').textContent = totals.total;
    $('bypassMetricAllow').textContent = totals.allow;
    $('bypassMetricDeny').textContent = totals.deny;
    $('bypassMetricOverride').textContent = totals.overrides;
  }
  function appendAudit(record) {
    audit.push(record);
    audit = audit.slice(-100);
    saveAudit();
    renderAudit();
  }
  function loadExamples() {
    const select = $('bypassExample');
    api.getExamples().forEach((example) => {
      const option = document.createElement('option');
      option.value = example.id;
      option.textContent = example.name;
      select.append(option);
    });
    select.addEventListener('change', () => {
      const example = api.getExamples().find((item) => item.id === select.value);
      if (!example) return;
      $('bypassAdapterSelect').value = example.adapterId;
      $('bypassStrategySelect').value = example.strategy;
      $('bypassLabContext').value = JSON.stringify(example.context, null, 2);
      $('bypassQaAuthorization').checked = Boolean(example.context.authorization && example.context.authorization.qaOverride);
      notify('Cenário carregado: resultado esperado ' + example.expected + '.');
    });
    select.selectedIndex = 0;
    select.dispatchEvent(new Event('change'));
  }
  function readContext() {
    let context;
    try { context = JSON.parse($('bypassLabContext').value); }
    catch (_) { throw new Error('JSON inválido. Revise aspas, vírgulas e chaves.'); }
    if (!context || typeof context !== 'object' || Array.isArray(context)) throw new Error('O contexto precisa ser um objeto JSON.');
    context.environment = $('bypassEnvironment').value;
    context.authorization = context.authorization && typeof context.authorization === 'object' ? context.authorization : {};
    context.authorization.qaOverride = $('bypassQaAuthorization').checked;
    return context;
  }
  function runDecision() {
    try {
      const record = engine.run($('bypassAdapterSelect').value, readContext(), $('bypassStrategySelect').value);
      appendAudit(record);
      $('bypassResult').innerHTML = '<span class="' + (record.allowed ? 'is-allow' : 'is-deny') + '">' + record.outcome + '</span><p>' + escapeText(record.reason) + '</p><small>' + escapeText(record.adapterName) + ' · ' + escapeText(record.strategy) + ' · ' + record.durationMs + ' ms</small>';
      notify(record.allowed ? 'Execução concluída: ALLOW.' : 'Execução concluída: DENY.');
    } catch (error) {
      notify(error.message || 'Não foi possível executar a estratégia.');
    }
  }
  function runTests() {
    const suite = api.runSuite();
    const target = $('bypassTestResults');
    target.replaceChildren();
    suite.results.forEach((test) => {
      const row = document.createElement('div');
      row.className = 'bypass-test-row ' + (test.passed ? 'passed' : 'failed');
      const mark = document.createElement('strong');
      mark.textContent = test.passed ? 'PASS' : 'FAIL';
      const label = document.createElement('span');
      label.textContent = test.name + ' · esperado ' + test.expected + ' · recebido ' + test.actual;
      row.append(mark, label);
      target.append(row);
    });
    $('bypassTestSummary').textContent = suite.passed + '/' + suite.total + ' testes passaram';
    $('bypassTestSummary').classList.toggle('all-passed', suite.passed === suite.total);
    notify(suite.passed === suite.total ? 'Suíte concluída: todos os testes passaram.' : 'Suíte concluída: existem falhas.');
  }
  function exportAudit() {
    const payload = JSON.stringify({ product: 'Waynovo', engineVersion: api.VERSION, exportedAt: new Date().toISOString(), events: audit }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'waynovo-bypass-audit.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Auditoria exportada em JSON.');
  }
  $('bypassRunBtn').addEventListener('click', runDecision);
  $('bypassRunTestsBtn').addEventListener('click', runTests);
  $('bypassExportBtn').addEventListener('click', exportAudit);
  $('bypassClearAuditBtn').addEventListener('click', () => {
    if (!audit.length) { notify('A auditoria já está vazia.'); return; }
    if (!window.confirm('Apagar os registros de auditoria deste navegador?')) return;
    audit = [];
    saveAudit();
    renderAudit();
    notify('Auditoria local apagada.');
  });
  $('bypassAdapterSelect').addEventListener('change', () => {
    const adapter = engine.list().find((item) => item.id === $('bypassAdapterSelect').value);
    $('bypassAdapterMeta').textContent = adapter ? adapter.description + ' · autoridade: ' + adapter.authority + ' · risco didático: ' + adapter.risk : '';
    $('bypassStrategySelect').querySelector('option[value="qa-override"]').disabled = !adapter || !adapter.qaOverride;
  });
  engine.list().forEach((adapter) => {
    const option = document.createElement('option');
    option.value = adapter.id;
    option.textContent = adapter.name;
    $('bypassAdapterSelect').append(option);
  });
  $('bypassAdapterSelect').selectedIndex = 0;
  $('bypassAdapterSelect').dispatchEvent(new Event('change'));
  loadExamples();
  renderAudit();
  runTests();
})();
