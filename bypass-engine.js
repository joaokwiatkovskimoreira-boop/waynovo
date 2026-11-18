(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WaynovoBypassEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = '1.0.0';
  const STRATEGIES = Object.freeze(['baseline', 'qa-override']);
  const MAX_CONTEXT_BYTES = 16 * 1024;
  const DEFAULT_AUDIT_LIMIT = 300;

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach((key) => deepFreeze(value[key]));
    return Object.freeze(value);
  }

  function cleanText(value, limit) {
    return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
  }

  function normalizeContext(context) {
    if (!context || typeof context !== 'object' || Array.isArray(context)) {
      throw new TypeError('O contexto precisa ser um objeto JSON.');
    }
    let serialized;
    try { serialized = JSON.stringify(context); }
    catch (_) { throw new TypeError('O contexto não é serializável como JSON.'); }
    if (serialized.length > MAX_CONTEXT_BYTES) {
      throw new RangeError('Contexto excede o limite de 16 KB do laboratório.');
    }
    const parsed = JSON.parse(serialized);
    if (!parsed.environment) parsed.environment = 'test';
    if (!['test', 'demo'].includes(parsed.environment)) {
      throw new TypeError('O ambiente precisa ser test ou demo.');
    }
    if (!parsed.fixture || typeof parsed.fixture !== 'object' || Array.isArray(parsed.fixture)) parsed.fixture = {};
    if (!parsed.clientPayload || typeof parsed.clientPayload !== 'object' || Array.isArray(parsed.clientPayload)) parsed.clientPayload = {};
    if (!parsed.authorization || typeof parsed.authorization !== 'object' || Array.isArray(parsed.authorization)) parsed.authorization = {};
    return deepFreeze(parsed);
  }

  function createEngine(options) {
    const settings = options || {};
    const registry = new Map();
    const audit = [];
    const maxAuditEvents = Math.max(20, Math.min(2000, Number(settings.maxAuditEvents) || DEFAULT_AUDIT_LIMIT));
    const clock = typeof settings.clock === 'function' ? settings.clock : () => new Date();
    let sequence = 0;

    function register(adapter) {
      if (!adapter || typeof adapter !== 'object') throw new TypeError('Adaptador inválido.');
      const id = cleanText(adapter.id, 64);
      if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(id)) throw new TypeError('ID deve usar letras minúsculas, números e hífens.');
      if (registry.has(id)) throw new Error('Já existe um adaptador com o ID ' + id + '.');
      if (adapter.scope !== 'owned-lab') throw new Error('O escopo precisa ser owned-lab.');
      if (typeof adapter.evaluate !== 'function') throw new TypeError('Adaptador precisa implementar evaluate(context).');
      if (!['client', 'fixture', 'server-fixture'].includes(adapter.authority)) {
        throw new TypeError('Autoridade do adaptador inválida.');
      }
      const normalized = Object.freeze({
        id,
        name: cleanText(adapter.name || id, 90),
        description: cleanText(adapter.description || '', 220),
        scope: 'owned-lab',
        authority: adapter.authority,
        qaOverride: adapter.qaOverride === true,
        risk: ['low', 'medium', 'high'].includes(adapter.risk) ? adapter.risk : 'medium',
        evaluate: adapter.evaluate
      });
      registry.set(id, normalized);
      return publicAdapter(normalized);
    }

    function publicAdapter(adapter) {
      return {
        id: adapter.id,
        name: adapter.name,
        description: adapter.description,
        scope: adapter.scope,
        authority: adapter.authority,
        qaOverride: adapter.qaOverride,
        risk: adapter.risk
      };
    }

    function list() {
      return Array.from(registry.values()).map(publicAdapter);
    }

    function run(adapterId, inputContext, strategy) {
      const adapter = registry.get(String(adapterId || ''));
      if (!adapter) throw new Error('Adaptador não encontrado.');
      const selectedStrategy = strategy || 'baseline';
      if (!STRATEGIES.includes(selectedStrategy)) throw new Error('Estratégia desconhecida.');
      const context = normalizeContext(inputContext || {});
      const started = Date.now();
      let baseline;
      let evaluationError = '';

      try {
        const output = adapter.evaluate(context);
        if (!output || typeof output.allowed !== 'boolean') throw new TypeError('evaluate deve retornar { allowed: boolean }.');
        baseline = {
          allowed: output.allowed,
          reason: cleanText(output.reason || (output.allowed ? 'Política autorizou.' : 'Política negou.'), 280),
          evidence: cleanText(output.evidence || '', 180),
          obligations: Array.isArray(output.obligations) ? output.obligations.map(x => cleanText(x, 100)).slice(0, 8) : []
        };
      } catch (error) {
        evaluationError = cleanText(error && error.message ? error.message : 'Erro desconhecido', 180);
        baseline = {
          allowed: false,
          reason: 'Falha segura: a avaliação lançou um erro e o laboratório negou o acesso.',
          evidence: 'evaluation-error',
          obligations: []
        };
      }

      let decision = {
        allowed: baseline.allowed,
        reason: baseline.reason,
        overridden: false
      };
      let overrideRefusal = '';

      if (selectedStrategy === 'qa-override') {
        const eligible = adapter.scope === 'owned-lab'
          && adapter.authority === 'client'
          && adapter.qaOverride === true
          && context.environment === 'test'
          && context.authorization.qaOverride === true;
        if (eligible) {
          decision = {
            allowed: true,
            reason: 'Override QA autorizado aplicado à fixture local de teste.',
            overridden: baseline.allowed !== true
          };
        } else {
          overrideRefusal = 'Override recusado: exige adaptador owned-lab de autoridade client, qaOverride habilitado, ambiente test e autorização explícita.';
          decision.reason = baseline.reason + ' ' + overrideRefusal;
        }
      }

      sequence += 1;
      const record = {
        id: 'bypass-' + sequence,
        timestamp: clock().toISOString(),
        adapterId: adapter.id,
        adapterName: adapter.name,
        strategy: selectedStrategy,
        environment: context.environment,
        baselineAllowed: baseline.allowed,
        allowed: decision.allowed,
        outcome: decision.allowed ? 'ALLOW' : 'DENY',
        overridden: decision.overridden,
        overrideRefusal,
        reason: decision.reason,
        evidence: baseline.evidence,
        obligations: baseline.obligations,
        evaluationError,
        durationMs: Math.max(0, Date.now() - started),
        risk: adapter.risk
      };
      audit.push(record);
      if (audit.length > maxAuditEvents) audit.splice(0, audit.length - maxAuditEvents);
      return cloneJson(record);
    }

    function getAudit() {
      return cloneJson(audit);
    }

    function clearAudit() {
      audit.length = 0;
    }

    function exportAudit() {
      return JSON.stringify({
        product: 'Waynovo Bypass Engine',
        version: VERSION,
        scope: 'owned-lab',
        exportedAt: clock().toISOString(),
        events: getAudit()
      }, null, 2);
    }

    return Object.freeze({ register, list, run, getAudit, clearAudit, exportAudit });
  }

  function createDefaultEngine(options) {
    const engine = createEngine(options);
    engine.register({
      id: 'client-feature-gate',
      name: 'Gate de recurso no cliente',
      description: 'Demonstra por que um sinalizador controlado pelo navegador não deve ser uma autorização real.',
      scope: 'owned-lab',
      authority: 'client',
      qaOverride: true,
      risk: 'high',
      evaluate: (context) => context.clientPayload.featureEnabled === true
        ? { allowed: true, reason: 'O sinalizador local featureEnabled está ativo.', evidence: 'client-feature-flag' }
        : { allowed: false, reason: 'O sinalizador local featureEnabled está desativado.', evidence: 'client-feature-flag' }
    });
    engine.register({
      id: 'trusted-entitlement-lab',
      name: 'Permissão simulada do servidor',
      description: 'Usa uma fixture confiável separada do payload editável do cliente.',
      scope: 'owned-lab',
      authority: 'server-fixture',
      qaOverride: false,
      risk: 'low',
      evaluate: (context) => {
        const grants = Array.isArray(context.fixture.trustedGrants) ? context.fixture.trustedGrants : [];
        const allowed = grants.includes('premium-reports');
        return {
          allowed,
          reason: allowed ? 'A fixture confiável contém premium-reports.' : 'Grant ausente na fixture confiável; role e flags do cliente não concedem acesso.',
          evidence: 'trusted-fixture',
          obligations: allowed ? ['Registrar uso no ambiente real.'] : []
        };
      }
    });
    engine.register({
      id: 'rate-limit-lab',
      name: 'Janela de tentativas simulada',
      description: 'Exercita limites de tentativa usando contadores da fixture de laboratório.',
      scope: 'owned-lab',
      authority: 'server-fixture',
      qaOverride: false,
      risk: 'medium',
      evaluate: (context) => {
        const attempts = Number(context.fixture.attempts);
        const limit = Number(context.fixture.limit);
        const safeAttempts = Number.isFinite(attempts) && attempts >= 0 ? attempts : 0;
        const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 1000) : 3;
        const allowed = safeAttempts < safeLimit;
        return {
          allowed,
          reason: allowed ? 'Tentativas abaixo do limite configurado na fixture.' : 'Limite de tentativas atingido na fixture.',
          evidence: 'rate-limit-fixture',
          obligations: allowed ? ['Contabilizar a tentativa no sistema de teste.'] : ['Aguardar a janela definida no teste.']
        };
      }
    });
    engine.register({
      id: 'fault-tolerance-lab',
      name: 'Falha de dependência controlada',
      description: 'Verifica que exceções de avaliação terminam em negação segura.',
      scope: 'owned-lab',
      authority: 'server-fixture',
      qaOverride: false,
      risk: 'low',
      evaluate: (context) => {
        if (context.fixture.simulateFailure === true) throw new Error('Falha injetada de forma intencional no laboratório.');
        return { allowed: context.fixture.healthy === true, reason: context.fixture.healthy === true ? 'Dependência de teste saudável.' : 'Dependência de teste não está saudável.', evidence: 'fault-fixture' };
      }
    });
    return engine;
  }

  function getExamples() {
    return [
      {
        id: 'client-deny',
        name: 'Gate cliente · negar baseline',
        adapterId: 'client-feature-gate',
        strategy: 'baseline',
        expected: 'DENY',
        context: { environment: 'test', fixture: {}, clientPayload: { featureEnabled: false } }
      },
      {
        id: 'client-qa-override',
        name: 'Gate cliente · override QA',
        adapterId: 'client-feature-gate',
        strategy: 'qa-override',
        expected: 'ALLOW',
        context: { environment: 'test', fixture: {}, authorization: { qaOverride: true }, clientPayload: { featureEnabled: false } }
      },
      {
        id: 'trusted-spoof',
        name: 'Permissão · payload forjado',
        adapterId: 'trusted-entitlement-lab',
        strategy: 'baseline',
        expected: 'DENY',
        context: { environment: 'test', fixture: { trustedGrants: [] }, clientPayload: { role: 'admin', qaOverride: true, featureEnabled: true } }
      },
      {
        id: 'trusted-grant',
        name: 'Permissão · grant de fixture',
        adapterId: 'trusted-entitlement-lab',
        strategy: 'baseline',
        expected: 'ALLOW',
        context: { environment: 'test', fixture: { trustedGrants: ['premium-reports'] }, clientPayload: { role: 'free' } }
      },
      {
        id: 'rate-limit',
        name: 'Tentativas · limite atingido',
        adapterId: 'rate-limit-lab',
        strategy: 'baseline',
        expected: 'DENY',
        context: { environment: 'test', fixture: { attempts: 3, limit: 3 }, clientPayload: { attempts: 0 } }
      },
      {
        id: 'fault-fail-closed',
        name: 'Dependência · falha segura',
        adapterId: 'fault-tolerance-lab',
        strategy: 'baseline',
        expected: 'DENY',
        context: { environment: 'test', fixture: { simulateFailure: true }, clientPayload: {} }
      }
    ].map((item) => cloneJson(item));
  }

  function runSuite() {
    const engine = createDefaultEngine();
    const cases = [
      { name: 'Gate de cliente nega quando flag está desligada.', adapter: 'client-feature-gate', strategy: 'baseline', expected: false, context: { environment: 'test', clientPayload: { featureEnabled: false } } },
      { name: 'Gate de cliente permite flag local ligada.', adapter: 'client-feature-gate', strategy: 'baseline', expected: true, context: { environment: 'test', clientPayload: { featureEnabled: true } } },
      { name: 'Override QA exige autorização e fixture test.', adapter: 'client-feature-gate', strategy: 'qa-override', expected: true, context: { environment: 'test', authorization: { qaOverride: true }, clientPayload: { featureEnabled: false } } },
      { name: 'Override QA é recusado fora de test.', adapter: 'client-feature-gate', strategy: 'qa-override', expected: false, context: { environment: 'demo', authorization: { qaOverride: true }, clientPayload: { featureEnabled: false } } },
      { name: 'Payload cliente não forja grants.', adapter: 'trusted-entitlement-lab', strategy: 'baseline', expected: false, context: { environment: 'test', fixture: { trustedGrants: [] }, clientPayload: { role: 'admin', qaOverride: true } } },
      { name: 'Grant confiável da fixture permite acesso.', adapter: 'trusted-entitlement-lab', strategy: 'baseline', expected: true, context: { environment: 'test', fixture: { trustedGrants: ['premium-reports'] } } },
      { name: 'Rate limit nega ao atingir o limite.', adapter: 'rate-limit-lab', strategy: 'baseline', expected: false, context: { environment: 'test', fixture: { attempts: 3, limit: 3 }, clientPayload: { attempts: 0 } } },
      { name: 'Exceção do adaptador termina em negação segura.', adapter: 'fault-tolerance-lab', strategy: 'baseline', expected: false, context: { environment: 'test', fixture: { simulateFailure: true } } },
      { name: 'Override QA é recusado para autoridade de fixture.', adapter: 'trusted-entitlement-lab', strategy: 'qa-override', expected: false, context: { environment: 'test', authorization: { qaOverride: true }, fixture: { trustedGrants: [] } } }
    ];
    const results = cases.map((test) => {
      const record = engine.run(test.adapter, test.context, test.strategy);
      return {
        name: test.name,
        expected: test.expected ? 'ALLOW' : 'DENY',
        actual: record.outcome,
        passed: record.allowed === test.expected,
        reason: record.reason
      };
    });
    return {
      passed: results.filter((item) => item.passed).length,
      total: results.length,
      results
    };
  }

  return Object.freeze({ VERSION, STRATEGIES, createEngine, createDefaultEngine, getExamples, runSuite });
});
