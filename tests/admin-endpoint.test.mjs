import test from 'node:test';
import assert from 'node:assert/strict';
import endpoint from '../api/admin.js';

const ADMIN = { id: 'u1', email: 'Hola@Invitesse.com', email_confirmed_at: '2026-01-01' };
function fixture({ user = ADMIN, admins = ['hola@invitesse.com'], fail } = {}) {
  const calls = [];
  const admin = { rpc: async (name, args) => { calls.push({ name, args }); if (fail) return { error: { message: fail } }; return { data: { ok: name }, error: null }; } };
  const handler = endpoint.createHandler({
    adminClient: () => admin,
    admins: () => admins,
    userFor: async () => { if (!user) throw new Error('AUTH_REQUIRED'); return user; },
  });
  return { calls, handler };
}
function response() { return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(b) { this.body = b; return this; } }; }
async function run(f, { method = 'GET', query = {}, body, origin } = {}) {
  const res = response();
  await f.handler({ method, query, body, headers: origin ? { origin } : {} }, res);
  return res;
}

test('nobody gets data when ADMIN_EMAILS is empty, without a session or with another account', async () => {
  let f = fixture({ admins: [] }); let res = await run(f, { query: { action: 'summary' } });
  assert.equal(res.code, 503); assert.equal(f.calls.length, 0);
  f = fixture({ user: null }); res = await run(f, { query: { action: 'summary' } });
  assert.equal(res.code, 401); assert.equal(f.calls.length, 0);
  f = fixture({ user: { id: 'x', email: 'otra@example.com' } }); res = await run(f, { query: { action: 'orders' } });
  assert.equal(res.code, 403); assert.equal(f.calls.length, 0);
  assert.equal(res.headers['Cache-Control'], 'private, no-store'); assert.equal(res.headers['X-Robots-Tag'], 'noindex, nofollow');
});

test('the allowed account (case-insensitive) reads the summary for the requested period', async () => {
  const f = fixture(); const res = await run(f, { query: { action: 'summary', days: '7' } });
  assert.equal(res.code, 200); assert.equal(f.calls[0].name, 'admin_summary');
  const days = (Date.now() - Date.parse(f.calls[0].args.since)) / 86400000; assert.ok(days > 6.9 && days < 7.1);
});

test('order filters are whitelisted and search wildcards are stripped', async () => {
  const f = fixture(); await run(f, { query: { action: 'orders', status: 'deleted', currency: 'EUR', tier: 'luxury', q: ' %ana_ ', offset: '-5' } });
  assert.deepEqual(f.calls[0].args.filter, { tier: 'luxury', q: 'ana', offset: 0, limit: 25 });
  const bad = fixture(); const res = await run(bad, { query: { action: 'order', id: "1' or 1=1" } });
  assert.equal(res.code, 400); assert.equal(bad.calls.length, 0);
});

test('creating a code converts pesos and dollars to minor units and rejects invalid values before the database', async () => {
  let f = fixture(); let res = await run(f, { method: 'POST', body: { action: 'create-code', code: ' lux40 ', kind: 'amount', amount_cop: 40000, amount_usd: 10, tiers: ['luxury', 'luxury', 'gold'], max_uses: 20 } });
  assert.equal(res.code, 201);
  assert.deepEqual(f.calls[0].args.payload, { code: 'LUX40', kind: 'amount', tiers: ['luxury'], once_per_customer: false, starts_at: null, ends_at: null, note: '', amount_off_cop: 4000000, amount_off_usd: 1000, max_uses: 20 });
  for (const body of [{ code: 'X', kind: 'percent', percent_off: 10, tiers: ['esencial'] }, { code: 'BIG', kind: 'percent', percent_off: 101, tiers: ['esencial'] }, { code: 'NOTIER', kind: 'percent', percent_off: 10, tiers: [] }, { code: 'DATES', kind: 'percent', percent_off: 10, tiers: ['esencial'], starts_at: '2027-02-01', ends_at: '2027-01-01' }]) {
    f = fixture(); res = await run(f, { method: 'POST', body: { action: 'create-code', ...body } });
    assert.equal(res.code, 400); assert.equal(f.calls.length, 0);
  }
});

test('writes from another site are refused and database errors map to safe codes', async () => {
  let f = fixture(); let res = await run(f, { method: 'POST', origin: 'https://evil.example', body: { action: 'toggle-code', id: '11111111-1111-4111-8111-111111111111', active: false } });
  assert.equal(res.code, 403); assert.equal(f.calls.length, 0);
  f = fixture({ fail: 'CODE_EXISTS' }); res = await run(f, { method: 'POST', body: { action: 'create-code', code: 'BODA15', kind: 'percent', percent_off: 15, tiers: ['esencial'] } });
  assert.equal(res.code, 409); assert.equal(res.body.error, 'CODE_EXISTS');
  f = fixture({ fail: 'relation does not exist' }); res = await run(f, { query: { action: 'codes' } });
  assert.equal(res.code, 503); assert.equal(res.body.error, 'ADMIN_UNAVAILABLE');
});

test('admin can create a 100 percent code, never more than 100',async()=>{
 const f=fixture();const res=await run(f,{method:'POST',body:{action:'create-code',code:'REGALO100',kind:'percent',percent_off:100,tiers:['esencial','signature','luxury'],max_uses:1,once_per_customer:true}});
 assert.equal(res.code,201);assert.equal(f.calls[0].args.payload.percent_off,100);assert.equal(f.calls[0].args.payload.max_uses,1);
});
