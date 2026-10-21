const rt=require('./runtime');
const {recordSession}=require('./stripe');
// Only called after the admin allowlist and confirmed Supabase identity have been checked.
async function closeUnpaidCheckout(admin,stripe,order) {
 const saved=await rt.unwrap(admin.from('stripe_checkouts').select('session_id').eq('order_id',order.id).maybeSingle());
 let session;
 if(saved?.session_id) session=await stripe.checkout.sessions.retrieve(saved.session_id);
 else {
  // A concurrent creation may not have saved its Stripe ID yet. Do not cancel underneath it.
  if(Date.now()-Date.parse(order.created_at)<5*60*1000)throw Error('CHECKOUT_BEING_PREPARED');
  let cursor,complete=false;
  for(let page=0;page<20;page++) {
   const result=await stripe.checkout.sessions.list({limit:100,created:{gte:Math.floor(Date.parse(order.created_at)/1000)-60},...(cursor?{starting_after:cursor}:{})});
   session=result.data.find(s=>s.metadata?.integration==='invitesse' && s.metadata?.order_id===order.id && s.client_reference_id===order.id && s.livemode);
   if(session)break;
   if(!result.has_more){complete=true;break;}
   cursor=result.data.at(-1)?.id;if(!cursor)throw Error('PAYMENT_STATE_UNAVAILABLE');
  }
  if(!session && !complete)throw Error('PAYMENT_STATE_UNAVAILABLE');
 }
 if(session) {
  if(!session.livemode || session.metadata?.integration!=='invitesse' || session.metadata?.order_id!==order.id || session.client_reference_id!==order.id)throw Error('PAYMENT_STATE_UNAVAILABLE');
  if(session.payment_status==='paid' || (session.payment_status==='no_payment_required' && session.status==='complete')) {
   await recordSession(admin,session,'admin-reconcile:'+session.id);
   throw Error('ORDER_JUST_PAID');
  }
  if(session.status==='open' && session.payment_status==='unpaid')session=await stripe.checkout.sessions.expire(session.id);
  if(session.status!=='expired')throw Error('PAYMENT_PROCESSING');
 }
 await rt.unwrap(admin.rpc('expire_stripe_order',{target_order:order.id}));
}
module.exports={closeUnpaidCheckout};
