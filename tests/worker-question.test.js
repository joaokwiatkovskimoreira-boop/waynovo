'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8');

test('gateway exposes a dedicated study-question task', () => {
  assert.match(source, /question:\s*"Resolva a questão em modo de estudo/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(TASKS, task\)/);
});

test('Tutor policy answers study questions but protects active graded assessments', () => {
  assert.match(source, /Para questões de estudo e prática, indique diretamente a alternativa mais provável/);
  assert.match(source, /avaliação ativa, prova supervisionada ou teste valendo nota em andamento/);
  assert.match(source, /explique o conceito e ofereça uma questão de prática semelhante/);
});

test('question task requires literal source evidence and an option-by-option verdict', () => {
  assert.match(source, /EVIDÊNCIA.*trechos curtos e literais/);
  assert.match(source, /COMPARAÇÃO.*cada alternativa/);
  assert.match(source, /O QUE FALTA/);
  assert.match(source, /Nunca fabrique citações/);
  assert.match(source, /Não confunda coincidência de palavras com prova/);
});

test('Tutor must declare inconclusive when the supplied source cannot distinguish options', () => {
  assert.match(source, /Se a fonte não permitir distinguir opções, declare inconclusivo/);
  assert.match(source, /inferências e conhecimento geral/);
});
