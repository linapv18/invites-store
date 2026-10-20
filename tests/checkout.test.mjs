import {test} from 'node:test';
import assert from 'node:assert/strict';
import checkout from '../api/checkout.js';
import prices from '../lib/payments/prices.json' with {type:'json'};
const owner='11111111-1111-4111-8111-111111111111',orderId='22222222-2222-4222-8222-222222222222';
function fixture(options={}){
 const calls=[], quote={invitation_id:'33333333-3333-4333-8333-333333333333',revision:4,event_date:'2028-08-31',timezone:'America/Bogota',expires_at:'2028-12-01T05:00:00Z',enabled:false};
 const admin={rpc:async(name,args)=>{calls.push({name,args});if(['freeze_stripe_parameters','revoke_stripe_order'].includes(name) && args?.target_order===null)return {error:{message:'ORDER_NOT_FOUND'}};if(name==='stripe_checkout_readiness')return {data:options.notReady?null:{version:2,prices:true}};if(name==='quote_stripe_checkout')return {data:{...quote,enabled:!!options.enabled}};if(name==='discount_quote'){if(options.discountError)return {error:{message:options.discountError}};const base=prices.tiers[prices.designs[args.requested_design]][args.requested_currency]*100,off=options.fullDiscount?base:Math.floor(base*20/100/100)*100;return {data:{code:args.requested_code,discount_code_id:'x',currency:args.requested_currency,base_minor:base,discount_minor:off,total_minor:base-off,percent_off:20}};}if(name==='prepare_stripe_checkout' && args.requested_code && options.discountError)return {error:{message:options.discountError}};if(name==='prepare_stripe_checkout' && args.requested_code){const base=prices.tiers[prices.designs[args.requested_design]][args.requested_currency]*100,off=options.fullDiscount?base:Math.floor(base*20/100/100)*100;return {data:{...quote,order_id:orderId,amount:base-off,discount_minor:off,discount_code:args.requested_code,currency:args.requested_currency,status:'pending',created_at:new Date().toISOString()}};}if(name==='prepare_stripe_checkout')return {data:{...quote,order_id:orderId,amount:prices.tiers[prices.designs[args.requested_design]][args.requested_currency]*100,currency:args.requested_currency,status:'pending',created_at:new Date().toISOString()}};if(name==='freeze_stripe_parameters'){const payload={...args.payload};if(options.legacyFrozen){delete payload.allowed_payment_method_types;payload.payment_method_types=['card'];}return {data:payload};}return {data:null};},
 from(table){let updating=false;const chain={select(){return chain;},eq(){return chain;},order(){return chain;},limit(){return chain;},update(args){updating=true;calls.push({name:'update:'+table,args});return chain;},maybeSingle:async()=>({data:table==='stripe_checkouts'?{session_id:'cs_existing'}:null}),then(resolve,reject){return Promise.resolve({data:updating?null:table==='orders'?(options.pending?[{id:orderId,currency:'COP',total_minor:20000000}]:[]):[]}).then(resolve,reject);}};return chain;}};
 const stripe={accounts:{retrieve:async()=>({id:'acct_1PCrn7P9O3dSAvF3',charges_enabled:!options.chargesDisabled})},checkout:{sessions:{create:async(args,opts)=>{calls.push({name:'stripe.create',args,opts});if(options.idempotencyConflict && opts.idempotencyKey==='invitesse-checkout-'+orderId)throw Object.assign(new Error('parameters differ'),{type:'StripeIdempotencyError'});if(options.stripeError)throw Object.assign(new Error('private client detail'),{code:'parameter_unknown',param:'adaptive_pricing',requestId:'req_fixture'});return {id:'cs_created',url:'https://checkout.stripe.com/c/pay/cs_created'};},list:async(args)=>{calls.push({name:'stripe.list',args});if(options.lookupFails)throw Error('lookup failed');return {data:options.recoveredSession?[options.recoveredSession]:[],has_more:false};},retrieve:async()=>options.session || {id:'cs_existing',status:'open',livemode:true,payment_status:'unpaid',currency:'cop',metadata:{integration:'invitesse',order_id:orderId},url:'https://checkout.stripe.com/c/pay/cs_existing'},expire:async()=>({status:'expired'})}}};
 const handler=checkout.createHandler({reportError:detail=>calls.push({name:'safe.error',args:detail}),adminClient:()=>admin,stripeClient:()=>stripe,userFor:async()=>{if(options.unauthorized)throw Error('AUTH_REQUIRED');return{id:owner,email:'fixture@example.invalid'};}});
 return {calls,handler};
}
async function run(options={},body={action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,locale:'es',acceptedTerms:true},method='POST'){
 const f=fixture(options),res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(j){this.body=j;return this;}};
 await f.handler({method,headers:{origin:options.origin || 'https://www.invitesse.com',...(options.country===null?{}:{'x-vercel-ip-country':options.country || 'CO'})},body},res);return {...f,res};
}
test('authenticated checkout charges only the database price and freezes idempotent parameters',async()=>{
 const {res,calls}=await run({}, {action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,locale:'es',amount:1,expires_at:'2099-01-01',acceptedTerms:true});
 assert.equal(res.code,200);const created=calls.find(x=>x.name==='stripe.create');assert.equal(created.args.line_items[0].price_data.unit_amount,19900000);assert.equal(created.args.line_items[0].price_data.currency,'cop');assert.deepEqual(created.args.adaptive_pricing,{enabled:false});assert.equal(created.args.mode,'payment');assert.equal(created.opts.idempotencyKey,'invitesse-checkout-'+orderId);assert.equal(created.args.metadata.order_id,orderId);assert.ok(created.args.custom_text.submit.message.includes('2028'));assert.ok(created.args.success_url.startsWith('https://www.invitesse.com/editor/pago/'));assert.equal(res.headers['Cache-Control'],'private, no-store');
});
test('USD uses 7900 minor units',async()=>{const {calls,res}=await run({country:'US'},{action:'create',design:'nacar',quotedCurrency:'USD',quotedAmount:79,revision:4,acceptedTerms:true});assert.equal(res.code,200);assert.equal(calls.find(x=>x.name==='stripe.create').args.line_items[0].price_data.unit_amount,7900);});
test('unconfigured, unauthenticated and foreign-origin requests cannot create checkout',async()=>{for(const options of [{notReady:true},{unauthorized:true},{origin:'https://attacker.invalid'}]){const {res,calls}=await run(options);assert.ok(res.code>=400);assert.equal(calls.some(x=>x.name==='stripe.create'),false);}});
test('pending sessions keep their agreed price even after the detected country changes',async()=>{
 const first=await run({pending:true},{action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:200000,revision:4,acceptedTerms:true});assert.equal(first.res.code,200);assert.equal(first.calls.some(x=>x.name==='stripe.create'),false);
 const other=await run({pending:true,country:'US'},{action:'create',design:'nacar',quotedCurrency:'USD',quotedAmount:79,revision:4,acceptedTerms:true});assert.equal(other.res.code,409);assert.equal(other.res.body.error,'PRICE_CHANGED');
});
test('paid server state never creates a second charge; success return alone cannot mark paid',async()=>{
 const paid=await run({enabled:true});assert.equal(paid.res.body.status,'paid');assert.equal(paid.calls.some(x=>x.name==='stripe.create'),false);
 const returned=await run({pending:true},{action:'status',design:'nacar',payment:'success'});assert.equal(returned.res.body.status,'pending');assert.equal(returned.calls.some(x=>x.name==='apply_verified_payment'),false);
});
test('verified Stripe payment reconciles before granting access',async()=>{
 const session={id:'cs_existing',status:'complete',livemode:true,mode:'payment',payment_status:'paid',currency:'cop',amount_total:20000000,payment_intent:'pi_paid',client_reference_id:orderId,metadata:{integration:'invitesse',order_id:orderId}};
 const {res,calls}=await run({pending:true,session},{action:'status',design:'nacar'});assert.equal(res.body.enabled,true);assert.equal(calls.find(x=>x.name==='apply_verified_payment').args.verified_amount,20000000);
});
test('invalid currency is rejected and no browser amount can override it',async()=>{const {res,calls}=await run({}, {action:'create',design:'nacar',quotedCurrency:'EUR',revision:4,amount:7900,acceptedTerms:true});assert.equal(res.code,409);assert.equal(calls.some(x=>x.name==='stripe.create'),false);});

test('read-only availability verifies the Stripe account can charge without creating an order',async()=>{
 const ready=await run({},undefined,'GET');assert.equal(ready.res.code,200);assert.equal(ready.res.body.available,true);assert.equal(ready.res.body.prices.nacar.amount,199000);assert.equal(ready.calls.some(x=>x.name==='prepare_stripe_checkout'),false);
 const blocked=await run({chargesDisabled:true},undefined,'GET');assert.equal(blocked.res.code,503);
});

test('country detection selects COP only for Colombia and defaults to USD without a country',async()=>{
 for(const country of ['CO','US','MX',null,'XX']){
  const {res}=await run({country},undefined,'GET');assert.equal(res.body.currency,country==='CO'?'COP':'USD');assert.equal(res.body.prices.nacar.amount,country==='CO'?199000:79);
 }
});
test('a client cannot choose COP outside Colombia or use the event timezone to set its price',async()=>{
 const blocked=await run({country:'US'},{action:'create',design:'nacar',quotedCurrency:'COP',currency:'COP',timezone:'America/Bogota',revision:4,acceptedTerms:true});assert.equal(blocked.res.code,409);assert.equal(blocked.calls.some(x=>x.name==='stripe.create'),false);
 const valid=await run({country:'US'},{action:'create',design:'nacar',quotedCurrency:'USD',quotedAmount:79,currency:'COP',timezone:'America/Bogota',revision:4,acceptedTerms:true});assert.equal(valid.res.code,200);assert.equal(valid.calls.find(x=>x.name==='prepare_stripe_checkout').args.requested_currency,'USD');
});

test('checkout failures return a safe stage reference without client data',async()=>{
 const {res,calls}=await run({stripeError:true});assert.equal(res.code,503);assert.equal(res.body.reference,'IV-PAY-STRIPE-parameter_unknown');assert.equal(res.body.requestId,'req_fixture');assert.equal(JSON.stringify(res.body).includes('private client detail'),false);const log=calls.find(x=>x.name==='safe.error');assert.equal(log.args.param,'adaptive_pricing');assert.equal(JSON.stringify(log).includes('fixture@example.invalid'),false);
});

test('current Stripe API uses the dynamic card filter, never payment_method_types',async()=>{
 for(const legacyFrozen of [false,true]){
  const {res,calls}=await run({legacyFrozen});assert.equal(res.code,200);const created=calls.find(x=>x.name==='stripe.create');assert.equal(Object.hasOwn(created.args,'payment_method_types'),false);assert.deepEqual(created.args.allowed_payment_method_types,['card']);assert.equal(created.opts.idempotencyKey,'invitesse-checkout-'+orderId);assert.equal(calls.filter(x=>x.name==='prepare_stripe_checkout').length,1);
 }
});


test('idempotency parameter migration checks Stripe before using a stable replacement key',async()=>{
 const {res,calls}=await run({legacyFrozen:true,idempotencyConflict:true});
 assert.equal(res.code,200);
 assert.deepEqual(calls.filter(x=>x.name==='stripe.create').map(x=>x.opts.idempotencyKey),['invitesse-checkout-'+orderId,'invitesse-checkout-dynamic-v1-'+orderId]);
 assert.ok(calls.findIndex(x=>x.name==='stripe.list')<calls.findLastIndex(x=>x.name==='stripe.create'));
});
test('idempotency recovery reuses an existing session instead of creating another',async()=>{
 const recoveredSession={id:'cs_recovered',livemode:true,client_reference_id:orderId,metadata:{integration:'invitesse',order_id:orderId},url:'https://checkout.stripe.com/c/pay/cs_recovered'};
 const {res,calls}=await run({idempotencyConflict:true,recoveredSession});
 assert.equal(res.code,200);assert.equal(res.body.url,recoveredSession.url);assert.equal(calls.filter(x=>x.name==='stripe.create').length,1);
});
test('failed recovery lookup never creates a session under another key',async()=>{
 const {res,calls}=await run({idempotencyConflict:true,lookupFails:true});
 assert.equal(res.code,503);assert.equal(calls.filter(x=>x.name==='stripe.create').length,1);
});

test('all ranges use server design prices in both markets, never the submitted tier or total',async()=>{
 for(const [design,tier] of Object.entries(prices.designs))for(const currency of ['COP','USD']){
  const amount=prices.tiers[tier][currency];
  const {res,calls}=await run({country:currency==='COP'?'CO':'US'},{action:'create',design,quotedCurrency:currency,quotedAmount:amount,revision:4,acceptedTerms:true,tier:'esencial',amount:1});
  assert.equal(res.code,200,design+' '+currency);assert.equal(calls.find(x=>x.name==='stripe.create').args.line_items[0].price_data.unit_amount,amount*100);
 }
 const changed=await run({}, {action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:200000,revision:4,acceptedTerms:true});
 assert.equal(changed.res.body.error,'PRICE_CHANGED');assert.equal(changed.calls.some(x=>x.name==='stripe.create'),false);
});
test('pending checkout shows its original price rather than the updated range price',async()=>{
 const {res}=await run({pending:true},{action:'status',design:'nacar'});
 assert.equal(res.body.amount,200000);
});
test('discount codes are validated by the database and the browser never sets the discount',async()=>{
 const preview=await run({}, {action:'discount',design:'nacar',code:' navidad20 ',quotedCurrency:'COP',discount_minor:19900000});
 assert.equal(preview.res.code,200);assert.equal(preview.res.body.total_minor,15920000);
 const q=preview.calls.find(x=>x.name==='discount_quote');assert.equal(q.args.requested_code,'NAVIDAD20');assert.equal(q.args.verified_owner,owner);
 const created=await run({}, {action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,acceptedTerms:true,code:'navidad20'});
 assert.equal(created.res.code,200);assert.equal(created.calls.find(x=>x.name==='prepare_stripe_checkout').args.requested_code,'NAVIDAD20');
 const item=created.calls.find(x=>x.name==='stripe.create').args.line_items[0];assert.equal(item.price_data.unit_amount,15920000);assert.match(item.price_data.product_data.description,/Código NAVIDAD20/);
 const plain=await run({}, {action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,acceptedTerms:true});assert.equal('requested_code' in plain.calls.find(x=>x.name==='prepare_stripe_checkout').args,false);
});
test('invalid or rejected codes stop before any order or charge',async()=>{
 const bad=await run({}, {action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,acceptedTerms:true,code:'no válido!'});
 assert.equal(bad.res.code,409);assert.equal(bad.res.body.error,'DISCOUNT_NOT_FOUND');assert.equal(bad.calls.some(x=>x.name==='prepare_stripe_checkout' || x.name==='stripe.create'),false);
 const expired=await run({discountError:'DISCOUNT_EXPIRED'}, {action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,acceptedTerms:true,code:'OLD10'});
 assert.equal(expired.res.code,409);assert.equal(expired.res.body.error,'DISCOUNT_EXPIRED');assert.equal(expired.calls.some(x=>x.name==='stripe.create'),false);
 const preview=await run({discountError:'DISCOUNT_EXHAUSTED'}, {action:'discount',design:'nacar',code:'LUX40'});
 assert.equal(preview.res.code,409);assert.equal(preview.res.body.error,'DISCOUNT_EXHAUSTED');
});

test('100 percent discount creates a zero-total session without asking for a card',async()=>{
 const {res,calls}=await run({fullDiscount:true},{action:'create',design:'nacar',quotedCurrency:'COP',quotedAmount:199000,revision:4,acceptedTerms:true,code:'REGALO100'});
 assert.equal(res.code,200);const created=calls.find(c=>c.name==='stripe.create');assert.equal(created.args.line_items[0].price_data.unit_amount,0);assert.equal(created.args.payment_method_collection,'if_required');
});
test('return from a complete free Stripe session grants access through verified reconciliation',async()=>{
 const session={id:'cs_live_free',status:'complete',livemode:true,mode:'payment',payment_status:'no_payment_required',payment_intent:null,amount_total:0,currency:'cop',client_reference_id:orderId,metadata:{integration:'invitesse',order_id:orderId}};
 const {res,calls}=await run({pending:true,session},{action:'status',design:'nacar'});
 assert.equal(res.code,200);assert.equal(res.body.enabled,true);const recorded=calls.find(c=>c.name==='apply_verified_payment');assert.equal(recorded.args.verified_amount,0);assert.equal(recorded.args.external_payment,'cs_live_free');
});
