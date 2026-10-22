import test from 'node:test';
import assert from 'node:assert/strict';
import endpoint from '../api/suscripcion.js';

const TOKEN = '3f2b8a1c-4d5e-4f60-8a7b-9c0d1e2f3a4b';
function response() { return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(v) { this.code = v; return this; }, json(v) { this.body = v; return this; }, send(v) { this.body = v; return this; } }; }
function request(body, { method = 'POST', url = '/api/suscripcion', headers = {} } = {}) { return { method, url, headers: { host: 'www.invitesse.com', origin: 'https://www.invitesse.com', ...headers }, body }; }
function fakes(overrides = {}) {
  const calls = { subscribe: [], sent: [], confirmed: [], unsubscribed: [] };
  const deps = {
    configured: () => true,
    subscribe: async (a) => { calls.subscribe.push(a); return { state: 'send', email: a.email, lang: a.lang, token: TOKEN, code: 'INVITESSE10' }; },
    send: async (m) => { calls.sent.push(m); },
    confirmSent: async (e) => { calls.confirmed.push(e); return true; },
    unsubscribe: async (t) => { calls.unsubscribed.push(t); return true; },
    ...overrides,
  };
  return { handler: endpoint.createHandler(deps), calls };
}

test('a valid subscription stores consent, emails the code and only then confirms', async () => {
  const { handler, calls } = fakes();
  const res = response();
  await handler(request({ email: '  Ana@Example.test ', consent: true, website: '', lang: 'es' }), res);
  assert.equal(res.code, 200); assert.deepEqual(res.body, { ok: true });
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(calls.subscribe[0].email, 'ana@example.test');
  assert.match(calls.subscribe[0].consent, /correos de marketing/);
  assert.equal(calls.sent[0].to, 'ana@example.test');
  assert.match(calls.sent[0].text, /INVITESSE10/);
  assert.match(calls.sent[0].text, /Un uso por cliente\. No acumulable con otras promociones\./);
  assert.match(calls.sent[0].unsubscribe, new RegExp('/api/suscripcion\\?baja=' + TOKEN + '$'));
  assert.match(calls.sent[0].html, /Darse de baja/);
  assert.deepEqual(calls.confirmed, ['ana@example.test']);
});

test('invalid email or missing consent are rejected before storing anything', async () => {
  const { handler, calls } = fakes();
  for (const [body, field] of [[{ email: 'ana@correo', consent: true }, 'email'], [{ email: '', consent: true }, 'email'], [{ email: 'ana@example.test', consent: false }, 'consent']]) {
    const res = response();
    await handler(request(body), res);
    assert.equal(res.code, 400); assert.equal(res.body.field, field);
  }
  assert.equal(calls.subscribe.length, 0); assert.equal(calls.sent.length, 0);
});

test('an existing subscriber gets 409 and no second email', async () => {
  const { handler, calls } = fakes({ subscribe: async () => ({ state: 'already' }) });
  const res = response();
  await handler(request({ email: 'ana@example.test', consent: true }), res);
  assert.equal(res.code, 409); assert.equal(res.body.error, 'ALREADY_SUBSCRIBED');
  assert.equal(calls.sent.length, 0);
});

test('a failed send never reports success nor confirms the subscription', async () => {
  const { handler, calls } = fakes({ send: async () => { throw new Error('RESEND_500'); } });
  const res = response();
  await handler(request({ email: 'ana@example.test', consent: true }), res);
  assert.equal(res.code, 503); assert.equal(res.body.error, 'SEND_FAILED');
  assert.equal(calls.confirmed.length, 0);
});

test('without server configuration nothing is stored and the page is told', async () => {
  const { handler, calls } = fakes({ configured: () => false });
  const res = response();
  await handler(request({ email: 'ana@example.test', consent: true }), res);
  assert.equal(res.code, 503); assert.equal(res.body.error, 'NOT_CONFIGURED');
  assert.equal(calls.subscribe.length, 0);
});

test('an inactive INVITESSE10 offer is reported as not available', async () => {
  const { handler, calls } = fakes({ subscribe: async () => { throw new Error('OFFER_INACTIVE'); } });
  const res = response();
  await handler(request({ email: 'ana@example.test', consent: true }), res);
  assert.equal(res.code, 503); assert.equal(res.body.error, 'NOT_CONFIGURED');
  assert.equal(calls.sent.length, 0);
});

test('the welcome email shows the code, how to use it and the unsubscribe link', () => {
  const m = endpoint.welcome({ email: 'ana@example.test', code: 'INVITESSE10', token: TOKEN, lang: 'es' });
  assert.equal(m.subject, 'Su 10% de bienvenida · Invitesse');
  assert.match(m.html, /INVITESSE10<\/td>/);
  assert.match(m.html, /Escriban INVITESSE10 al pagar\./);
  assert.match(m.html, /Darse de baja<\/a>/);
  assert.match(m.html, /https:\/\/www\.invitesse\.com\/disenos\//);
});

test('bots filling the honeypot get a silent success; foreign origins are refused', async () => {
  const { handler, calls } = fakes();
  const res = response();
  await handler(request({ email: 'bot@example.test', consent: true, website: 'https://spam.example' }), res);
  assert.equal(res.code, 200); assert.equal(calls.subscribe.length, 0);
  const foreign = response();
  await handler(request({ email: 'ana@example.test', consent: true }, { headers: { origin: 'https://evil.example' } }), foreign);
  assert.equal(foreign.code, 403);
});

test('unsubscribe asks to confirm on GET and only POST unsubscribes', async () => {
  const { handler, calls } = fakes();
  const page = response();
  await handler(request(undefined, { method: 'GET', url: '/api/suscripcion?baja=' + TOKEN, headers: { origin: undefined } }), page);
  assert.equal(page.code, 200); assert.match(page.body, /<form method="post">/); assert.equal(calls.unsubscribed.length, 0);
  const done = response();
  await handler(request('List-Unsubscribe=One-Click', { url: '/api/suscripcion?baja=' + TOKEN, headers: { origin: undefined } }), done);
  assert.equal(done.code, 200); assert.match(done.body, /Baja confirmada/); assert.deepEqual(calls.unsubscribed, [TOKEN]);
  const bad = response();
  await handler(request(undefined, { method: 'GET', url: '/api/suscripcion?baja=nope' }), bad);
  assert.equal(bad.code, 400);
});

test('the English welcome email is localized', () => {
  const m = endpoint.welcome({ email: 'a@b.co', code: 'INVITESSE10', token: TOKEN, lang: 'en' });
  assert.equal(m.subject, 'Your 10% welcome gift · Invitesse');
  assert.match(m.unsubscribe, /&lang=en$/);
  assert.match(m.text, /One use per customer/);
});
