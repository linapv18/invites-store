import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import Stripe from 'stripe';
import webhook from '../api/stripe-webhook.js';

const secret = 'whsec_local_fixture';
const order = '11111111-1111-4111-8111-111111111111';
const payment = () => ({ id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: {
  mode: 'payment', livemode: true, payment_status: 'paid', payment_intent: 'pi_fixture', amount_total: 20000000,
  currency: 'cop', client_reference_id: order, metadata: { integration: 'invitesse', order_id: order },
} } });
async function run(event, { ready = true, invalid = false, dbError = false, paymentRecord = false, unrelated = false } = {}) {
  const payload = JSON.stringify(event), calls = [];
  const req = Readable.from([Buffer.from(payload)]);
  req.method = 'POST';
  req.headers = { 'stripe-signature': invalid ? 'invalid' : Stripe.webhooks.generateTestHeaderString({ payload, secret }) };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
  const handler = webhook.createHandler({
    settings: () => ({ ready, webhookSecret: secret }),
    verify: (...args) => Stripe.webhooks.constructEvent(...args),
    retrievePayment: async () => ({livemode:true,metadata:unrelated?{}:{integration:'invitesse',order_id:order}}),
    adminClient: () => ({ from: table => ({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:paymentRecord && table==='payments'?{order_id:order}:null})}), rpc: async (name, args) => { calls.push({ name, args }); return { error: dbError ? new Error('private detail') : null }; } }),
  });
  await handler(req, res);
  return { res, calls };
}
test('signed live COP payment forwards exact minor units and immutable order identity', async () => {
  const { res, calls } = await run(payment());
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'apply_verified_payment');
  assert.equal(calls[0].args.verified_amount, 20000000);
  assert.equal(calls[0].args.verified_currency, 'COP');
  assert.equal(calls[0].args.target_order, order);
  assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('signature, configuration and payment mode failures never reach database', async () => {
  for (const options of [{ invalid: true }, { ready: false }]) {
    const { res, calls } = await run(payment(), options);
    assert.ok(res.statusCode >= 400); assert.equal(calls.length, 0);
  }
  const event = payment(); event.livemode = false;
  const result = await run(event);
  assert.equal(result.res.statusCode, 400); assert.equal(result.calls.length, 0);
});
test('unpaid and unrelated sessions are acknowledged without activating anything', async () => {
  for (const modify of [e => { e.data.object.payment_status = 'unpaid'; }, e => { e.data.object.metadata = {}; }, e => { e.type = 'customer.created'; }]) {
    const event = payment(); modify(event);
    const { res, calls } = await run(event);
    assert.equal(res.statusCode, 200); assert.equal(calls.length, 0);
  }
});
test('malformed paid sessions fail closed and database failures request retry', async () => {
  for (const modify of [s => { s.client_reference_id = 'other'; }, s => { s.amount_total = 1.5; }, s => { s.currency = 'eur'; }, s => { s.payment_intent = null; }]) {
    const event = payment(); modify(event.data.object);
    const { res, calls } = await run(event);
    assert.equal(res.statusCode, 400); assert.equal(calls.length, 0);
  }
  const { res } = await run(payment(), { dbError: true });
  assert.equal(res.statusCode, 503);
  assert.equal(JSON.stringify(res.body).includes('private detail'), false);
});

test('full refunds and disputes revoke access even when delivered before the payment event',async()=>{
 for(const type of ['charge.refunded','charge.dispute.created']){
  const event={id:'evt_revoke',livemode:true,type,data:{object:{payment_intent:'pi_fixture',refunded:true,amount:7900,amount_refunded:7900}}};
  for(const paymentRecord of [false,true]){
   const {res,calls}=await run(event,{paymentRecord});assert.equal(res.statusCode,200);assert.equal(calls[0].name,'revoke_stripe_order');assert.equal(calls[0].args.target_order,order);
  }
  const unrelated=await run(event,{unrelated:true});assert.equal(unrelated.calls.length,0);
  const unavailable=await run(event,{dbError:true});assert.equal(unavailable.res.statusCode,503);
 }
});
test('partial refunds are acknowledged without revoking the whole invitation',async()=>{
 const event={id:'evt_partial',livemode:true,type:'charge.refunded',data:{object:{payment_intent:'pi_fixture',refunded:false,amount:7900,amount_refunded:100}}};const {res,calls}=await run(event);assert.equal(res.statusCode,200);assert.equal(calls.length,0);
});
