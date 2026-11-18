'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../bypass-engine.js');

test('default engine registers four owned-lab adapters', () => {
  const engine = Engine.createDefaultEngine();
  assert.equal(engine.list().length, 4);
  assert.ok(engine.list().every((adapter) => adapter.scope === 'owned-lab'));
});

test('registration rejects non-owned scopes and duplicate IDs', () => {
  const engine = Engine.createEngine();
  const adapter = { id: 'sample-adapter', scope: 'owned-lab', authority: 'client', evaluate: () => ({ allowed: false }) };
  assert.throws(() => engine.register({ ...adapter, scope: 'third-party' }), /owned-lab/);
  engine.register(adapter);
  assert.throws(() => engine.register(adapter), /Já existe/);
});

test('client baseline denies when feature flag is off', () => {
  const record = Engine.createDefaultEngine().run('client-feature-gate', {
    environment: 'test', clientPayload: { featureEnabled: false }
  });
  assert.equal(record.outcome, 'DENY');
});

test('QA override requires explicit authorization in test environment', () => {
  const engine = Engine.createDefaultEngine();
  const denied = engine.run('client-feature-gate', {
    environment: 'test', clientPayload: { featureEnabled: false }
  }, 'qa-override');
  const allowed = engine.run('client-feature-gate', {
    environment: 'test', authorization: { qaOverride: true }, clientPayload: { featureEnabled: false }
  }, 'qa-override');
  assert.equal(denied.outcome, 'DENY');
  assert.equal(allowed.outcome, 'ALLOW');
  assert.equal(allowed.overridden, true);
});

test('QA override cannot be used in demo or on fixture-authority adapters', () => {
  const engine = Engine.createDefaultEngine();
  const demo = engine.run('client-feature-gate', {
    environment: 'demo', authorization: { qaOverride: true }, clientPayload: { featureEnabled: false }
  }, 'qa-override');
  const trusted = engine.run('trusted-entitlement', {
    environment: 'test', authorization: { qaOverride: true }, fixture: { trustedGrants: [] }
  }, 'qa-override');
  assert.equal(demo.outcome, 'DENY');
  assert.equal(trusted.outcome, 'DENY');
  assert.ok(demo.overrideRefusal);
  assert.ok(trusted.overrideRefusal);
});

test('client payload cannot forge a trusted entitlement', () => {
  const record = Engine.createDefaultEngine().run('trusted-entitlement', {
    environment: 'test',
    fixture: { trustedGrants: [] },
    clientPayload: { role: 'admin', qaOverride: true }
  });
  assert.equal(record.outcome, 'DENY');
});

test('rate limit uses fixture counter, not client-supplied attempts', () => {
  const record = Engine.createDefaultEngine().run('rate-limit', {
    environment: 'test',
    fixture: { attempts: 3, limit: 3 },
    clientPayload: { attempts: 0 }
  });
  assert.equal(record.outcome, 'DENY');
});

test('evaluation exceptions fail closed and are audited', () => {
  const engine = Engine.createDefaultEngine();
  const record = engine.run('fault-tolerance', {
    environment: 'test', fixture: { simulateFailure: true }
  });
  assert.equal(record.outcome, 'DENY');
  assert.equal(record.evidence, 'evaluation-error');
  assert.match(record.evaluationError, /Falha injetada/);
});

test('context passed to the evaluator is immutable', () => {
  const engine = Engine.createEngine();
  engine.register({
    id: 'immutable-context', scope: 'owned-lab', authority: 'client',
    evaluate: (context) => {
      assert.throws(() => { context.clientPayload.role = 'admin'; }, TypeError);
      return { allowed: false };
    }
  });
  const record = engine.run('immutable-context', {
    environment: 'test', clientPayload: { role: 'user' }
  });
  assert.equal(record.outcome, 'DENY');
});

test('audit export contains metadata but not the raw input context', () => {
  const engine = Engine.createDefaultEngine();
  engine.run('client-feature-gate', {
    environment: 'test', clientPayload: { featureEnabled: true, privateMarker: 'do-not-export' }
  });
  const exported = engine.exportAudit();
  assert.match(exported, /Waynovo Bypass Engine/);
  assert.doesNotMatch(exported, /do-not-export/);
});

test('built-in suite passes every scenario', () => {
  const suite = Engine.runSuite();
  assert.equal(suite.passed, suite.total);
  assert.equal(suite.total, 11);
});

test('rate limit allows a fixture counter below the limit', () => {
  const record = Engine.createDefaultEngine().run('rate-limit', {
    environment: 'test', fixture: { attempts: 1, limit: 3 }, clientPayload: { attempts: 99 }
  });
  assert.equal(record.outcome, 'ALLOW');
});

test('healthy dependency fixture is allowed', () => {
  const record = Engine.createDefaultEngine().run('fault-tolerance', {
    environment: 'test', fixture: { healthy: true }
  });
  assert.equal(record.outcome, 'ALLOW');
});
