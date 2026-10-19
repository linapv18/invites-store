import test from 'node:test';
import assert from 'node:assert/strict';
import endpoint from '../api/cotizacion.js';

const NOW = 1_000_000;
function response() { return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(v) { this.code = v; return this; }, json(v) { this.body = v; return this; } }; }
function request(body, headers = {}) { return { method: 'POST', headers: { host: 'www.invitesse.com', origin: 'https://www.invitesse.com', ...headers }, body }; }
const valid = {
  names: 'Ana y León', email: 'ana@example.test', phone: '+57 300 000 0000', date: 'marzo de 2027', place: 'Cartagena',
  vision: 'Una invitación con una apertura de abanico y acuarelas del mar.', why: 'Ninguno de la colección tiene el mar.',
  refs: 'https://pinterest.example/tablero', interests: ['opening', 'venue', 'unknown'], consent: true, lang: 'es', website: '', startedAt: NOW - 60_000,
};

test('a valid request is emailed with the couple as reply-to and escaped HTML', async () => {
  let sent;
  const handler = endpoint.createHandler({ send: async (m) => { sent = m; }, now: () => NOW });
  const res = response();
  await handler(request({ ...valid, vision: valid.vision + ' <script>alert(1)</script>' }), res);
  assert.equal(res.code, 200);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(sent.replyTo, 'ana@example.test');
  assert.equal(sent.subject, 'Cotización a medida · Ana y León');
  assert.match(sent.text, /Les interesa: Apertura propia, Ilustración del lugar\n/);
  assert.doesNotMatch(sent.text, /unknown/);
  assert.doesNotMatch(sent.html, /<script>/);
  assert.match(sent.html, /&lt;script&gt;/);
});

test('missing required answers or consent are rejected without sending', async () => {
  let calls = 0;
  const handler = endpoint.createHandler({ send: async () => { calls++; }, now: () => NOW });
  for (const [patch, field] of [[{ names: '' }, 'names'], [{ email: 'no' }, 'email'], [{ vision: 'corto' }, 'vision'], [{ consent: false }, 'consent']]) {
    const res = response();
    await handler(request({ ...valid, ...patch }), res);
    assert.equal(res.code, 400); assert.equal(res.body.field, field);
  }
  assert.equal(calls, 0);
});

test('the short form (names, email and what they imagine) is enough', async () => {
  let sent;
  const handler = endpoint.createHandler({ send: async (m) => { sent = m; }, now: () => NOW });
  const res = response();
  await handler(request({ names: 'Ana y León', email: 'ana@example.test', vision: 'Una apertura de abanico con acuarelas del mar.', consent: true, website: '', lang: 'es', startedAt: NOW - 60_000 }), res);
  assert.equal(res.code, 200);
  assert.match(sent.text, /Qué imaginan para su invitación:\nUna apertura de abanico/);
  assert.doesNotMatch(sent.text, /Por qué|Referencias|WhatsApp/);
});

test('bots (honeypot or instant submit) get a silent success and nothing is sent', async () => {
  let calls = 0;
  const handler = endpoint.createHandler({ send: async () => { calls++; }, now: () => NOW });
  for (const patch of [{ website: 'https://spam.example' }, { startedAt: NOW - 500 }, { startedAt: undefined }]) {
    const res = response();
    await handler(request({ ...valid, ...patch }), res);
    assert.equal(res.code, 200);
  }
  assert.equal(calls, 0);
});

test('other origins, other methods and a failed send are handled', async () => {
  const handler = endpoint.createHandler({ send: async () => { throw new Error('down'); }, now: () => NOW });
  const cross = response(); await handler(request(valid, { origin: 'https://evil.example' }), cross); assert.equal(cross.code, 403);
  const get = response(); await handler({ method: 'GET', headers: {} }, get); assert.equal(get.code, 405);
  const failed = response(); await handler(request(valid), failed); assert.equal(failed.code, 503);
});

test('line breaks in single-line fields never reach the email subject', async () => {
  let sent;
  const handler = endpoint.createHandler({ send: async (m) => { sent = m; }, now: () => NOW });
  const res = response(); await handler(request({ ...valid, names: 'Ana\r\nBcc: x@y.z' }), res);
  assert.equal(res.code, 200);
  assert.doesNotMatch(sent.subject, /[\r\n]/);
});
