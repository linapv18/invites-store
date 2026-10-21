import test from 'node:test';
import assert from 'node:assert/strict';
import module from '../lib/payments/admin-orders.js';
const {closeUnpaidCheckout}=module;
const id='11111111-1111-4111-8111-111111111111';
function fixture({session,missing=false,recent=false,listFail=false}={}) {
 const calls=[];const order={id,created_at:new Date(Date.now()-(recent?1000:600000)).toISOString()};
 const value=session||{id:'cs_live_fixture',status:'open',payment_status:'unpaid',livemode:true,mode:'payment',client_reference_id:id,metadata:{integration:'invitesse',order_id:id}};
 const admin={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:missing?null:{session_id:value.id}})})})}),rpc:async(name,args)=>{calls.push({name,args});return {data:null};}};
 const stripe={checkout:{sessions:{retrieve:async()=>value,expire:async()=>{calls.push({name:'stripe.expire'});return {...value,status:'expired'};},list:async()=>{calls.push({name:'stripe.list'});if(listFail)throw Error('network');return {data:[],has_more:false};}}}};
 return {calls,order,admin,stripe};
}
test('deleting an unpaid draft closes Stripe before cancelling its database order',async()=>{
 const f=fixture();await closeUnpaidCheckout(f.admin,f.stripe,f.order);assert.deepEqual(f.calls.map(x=>x.name),['stripe.expire','expire_stripe_order']);
});
test('a completed zero-value checkout is reconciled and deletion stops',async()=>{
 const f=fixture();f.stripe.checkout.sessions.retrieve=async()=>({id:'cs_live_free',status:'complete',payment_status:'paid',amount_total:0,payment_intent:null,currency:'cop',mode:'payment',livemode:true,client_reference_id:id,metadata:{integration:'invitesse',order_id:id}});
 await assert.rejects(()=>closeUnpaidCheckout(f.admin,f.stripe,f.order),/ORDER_JUST_PAID/);
 assert.deepEqual(f.calls.map(x=>x.name),['apply_verified_payment']);
});
test('missing recent sessions, failed lookups, processing and wrong-owner sessions cannot be cancelled',async()=>{
 for(const options of [{missing:true,recent:true},{missing:true,listFail:true},{session:{id:'cs_fixture',status:'complete',payment_status:'unpaid',livemode:true,client_reference_id:id,metadata:{integration:'invitesse',order_id:id}}},{session:{id:'cs_fixture',status:'open',payment_status:'unpaid',livemode:true,client_reference_id:'other',metadata:{integration:'invitesse',order_id:'other'}}}]) {
  const f=fixture(options);await assert.rejects(()=>closeUnpaidCheckout(f.admin,f.stripe,f.order));assert.equal(f.calls.some(x=>x.name==='expire_stripe_order'||x.name==='stripe.expire'),false);
 }
});
test('old failed creations are only cancelled after an exhaustive Stripe search',async()=>{
 const f=fixture({missing:true});await closeUnpaidCheckout(f.admin,f.stripe,f.order);assert.deepEqual(f.calls.map(x=>x.name),['stripe.list','expire_stripe_order']);
});
