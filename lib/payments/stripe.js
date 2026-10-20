// Shared by signed webhooks and authenticated server-to-Stripe reconciliation.
function verifiedSessionPayment(session) {
 const order=session?.metadata?.order_id;
 if(session?.metadata?.integration!=='invitesse') throw new Error('INVALID_PAYMENT');
 const free=session.payment_status==='no_payment_required' && session.amount_total===0 &&
  session.status==='complete' && session.payment_intent==null && /^cs_[a-zA-Z0-9_]+$/.test(session.id || '');
 const paid=session.payment_status==='paid' && session.amount_total>0 && /^pi_[a-zA-Z0-9]+$/.test(session.payment_intent || '');
 if(session.mode!=='payment' || session.livemode!==true || (!free && !paid) ||
  !/^[a-f0-9-]{36}$/i.test(order || '') || session.client_reference_id!==order ||
  !Number.isSafeInteger(session.amount_total) || !['cop','usd'].includes(session.currency)) throw new Error('INVALID_PAYMENT');
 return {target_order:order,external_payment:free?session.id:session.payment_intent,verified_amount:session.amount_total,verified_currency:session.currency.toUpperCase()};
}
async function recordSession(admin,session,eventId) {
 if(session?.metadata?.integration!=='invitesse') return false;
 const payment=verifiedSessionPayment(session);
 const {error}=await admin.rpc('apply_verified_payment',{payment_provider:'stripe',provider_event:eventId,...payment});
 if(error) throw new Error('PAYMENT_RECORDING_UNAVAILABLE');
 return true;
}
module.exports={recordSession,verifiedSessionPayment};
