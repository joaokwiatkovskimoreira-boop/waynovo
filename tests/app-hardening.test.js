'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const app = read('app.js');
const bookmarklet = read('bookmarklet.js');
const styles = read('styles.css');
const html = read('index.html');
const worker = read('service-worker.js');
const featuresSource = read('features.js');
const plannerSource = read('planner.js');

test('backup import is size-limited and normalizes duplicate task/card IDs', () => {
  assert.match(app, /file\.size>5\*1024\*1024/);
  assert.match(app, /\.slice\(0,500\)\.map\(t=>/);
  assert.match(app, /known\.add\(taskId\)/);
  assert.match(app, /\.slice\(0,1000\)\.map\(card=>/);
  assert.match(app, /have\.add\(cardId\)/);
  assert.ok(app.includes('/^\\d{4}-\\d{2}-\\d{2}$/'));
  assert.match(app, /Number\.isFinite\(imported\)&&imported>=0/);
  assert.match(app, /content:t\.content\.slice\(0,100000\)/);
});

test('bookmarklet keeps its private panel inside a closed shadow root', () => {
  assert.match(bookmarklet, /attachShadow\(\{mode:'closed'\}\)/);
  assert.doesNotMatch(bookmarklet, /attachShadow\(\{mode:'open'\}\)/);
});

test('backup import sanitizes flashcards and caps planner sessions', () => {
  assert.match(app, /front:card\.front\.slice\(0,20000\)/);
  assert.match(app, /back:card\.back\.slice\(0,20000\)/);
  assert.match(app, /reps:Math\.floor\(finite\(card\.reps,0,0,100000\)\)/);
  assert.match(plannerSource, /data\.sessions\.slice\(0, 1000\)\.forEach/);
});

test('flashcard review statistics reject malformed keys and values', () => {
  assert.match(featuresSource, /Array\.isArray\(value\)/);
  assert.match(featuresSource, /\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/);
  assert.match(featuresSource, /Number\.isFinite\(Number\(count\)\)/);
  assert.match(featuresSource, /Math\.floor\(Number\(stats\[today\]\)\)/);
});

test('task IDs work when crypto.randomUUID is unavailable', () => {
  assert.match(app, /window\.crypto&&typeof window\.crypto\.randomUUID==='function'/);
  assert.doesNotMatch(app, /return crypto&&crypto\.randomUUID/);
});

test('focus timer uses an absolute deadline and catches up after a suspended tab', () => {
  assert.match(app, /timerDeadline=Date\.now\(\)\+seconds\*1000/);
  assert.match(app, /Math\.ceil\(\(timerDeadline-Date\.now\(\)\)\/1000\)/);
  assert.match(app, /document\.addEventListener\('visibilitychange'/);
  assert.doesNotMatch(app, /seconds--/);
});

test('quick task capture is available from the material field', () => {
  assert.match(app, /event\.ctrlKey\|\|event\.metaKey/);
  assert.match(app, /event\.key==='Enter'/);
  assert.match(app, /document\.activeElement===material/);
  assert.match(html, /Ctrl\/⌘ \+ Enter/);
});

test('bookmarklet release uses an accurate deadline timer and reduced-motion support', () => {
  assert.match(bookmarklet, /let remain=25\*60,interval=null,timerDeadline=0/);
  assert.match(bookmarklet, /Math\.ceil\(\(timerDeadline-Date\.now\(\)\)\/1000\)/);
  assert.doesNotMatch(bookmarklet, /remain--/);
  assert.match(bookmarklet, /UNIFIED TOOLKIT · 6\.3 · FEITO PELO RUSSO/);
  assert.match(bookmarklet, /version:'6\.3'/);
  assert.match(bookmarklet, /prefers-reduced-motion:reduce/);
});

test('release assets, attribution and PWA cache are aligned', () => {
  assert.match(app, /bookmarklet\.js\?v=6\.3/);
  assert.match(html, /versão 6\.3/);
  assert.match(html, /feito pelo russo/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(styles, /:focus-visible/);
  assert.match(worker, /waynovo-shell-v16/);
});
