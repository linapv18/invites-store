import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, access } from 'node:fs/promises';

const require = createRequire(import.meta.url);
globalThis.window = {};
require('../disenos/catalogo.js');
const quiz = require('../disenos/quiz.js');
const catalog = globalThis.window.LazoCatalog;
const ids = new Set(catalog.designs.map(d => d.id));
const top = answers => quiz.rank(answers)[0].design.id;

test('the quiz recommends the design whose tags match the answers', () => {
  assert.equal(top({ estilo: ['romantico', 'botanico'], lugar: ['campo'], tono: ['claros'], apertura: ['sorpresa'], detalles: ['flores', 'encaje'], fotos: ['ninguna'] }), 'glicina');
  assert.equal(top({ estilo: ['colorido'], lugar: ['playa'], tono: ['vivos'], apertura: ['concepto'], detalles: ['viaje'], fotos: ['muchas'] }), 'costa');
  assert.equal(top({ estilo: ['colorido'], lugar: ['campo'], tono: ['vivos'], apertura: ['concepto'], detalles: ['papel'], fotos: ['pocas'] }), 'fiesta');
  assert.equal(top({ estilo: ['elegante', 'moderno'], lugar: ['ciudad'], tono: ['oscuros'], apertura: ['concepto'], detalles: ['retro'], fotos: ['muchas'] }), 'senal');
});

test('results are ordered, explained and the affinity stays in range', () => {
  const list = quiz.rank({ estilo: ['romantico'], lugar: ['campo'], tono: ['claros'], apertura: ['sobre'], detalles: ['flores'], fotos: ['pocas'] });
  assert.equal(list.length, catalog.designs.length);
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].score >= list[i].score);
  for (const r of list) assert.ok(r.pct >= 55 && r.pct <= 98, r.design.id);
  assert.ok(list[0].reasons.some(r => r.type === 'estilo'));
  const neutral = quiz.rank({ estilo: ['nose'], lugar: ['nose'], tono: ['todos'], apertura: ['igual'], fotos: ['muchas'] });
  assert.ok(neutral.every(r => r.pct === 80 && r.reasons.length === 0));
});

test('without photos only recommends designs that can be published without photos', async () => {
  const content = await readFile('demo/shared/content.js', 'utf8');
  const listed = JSON.parse(content.match(/NO_PHOTOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  assert.deepEqual([...quiz.noPhotos].sort(), listed.sort());
  for (const estilo of ['elegante', 'moderno', 'colorido']) assert.ok(quiz.noPhotos.includes(top({ estilo: [estilo], fotos: ['ninguna'] })), estilo);
});

test('quiz data points at real designs, tags and thumbnails', async () => {
  for (const [detail, designs] of Object.entries(quiz.details)) for (const id of designs) assert.ok(ids.has(id), detail + ': ' + id);
  for (const id of quiz.noPhotos) assert.ok(ids.has(id), id);
  const style = catalog.filters.find(f => f.key === 'estilo').opts.map(o => o.id);
  for (const q of quiz.questions) {
    assert.ok(q.es.title && q.en.title, q.id);
    for (const o of q.opts) {
      assert.ok(o.es[0] && o.en[0], q.id + ': ' + o.id);
      if (o.img) for (const size of [280, 554]) await access(`assets/brand/thumbs/${o.img}-${size}.webp`);
    }
  }
  assert.ok(quiz.questions[0].opts.filter(o => o.id !== 'nose').every(o => style.includes(o.id)));
  for (const d of catalog.designs) for (const size of [280, 554]) await access(`assets/brand/thumbs/${d.id}-${size}.webp`);
});
