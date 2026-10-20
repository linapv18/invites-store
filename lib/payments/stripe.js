// This function is shared by signed webhooks and server-to-Stripe reconciliation.
async function recordSession(admin,session,eventId) {
 const order=session?.metadata?.order_id;
 if(session?.metadata?.integration!=='invitesse') return false;
 if(session.mode!=='payment' || session.livemode!==true || session.payment_status!=='paid' ||
  !/^[a-f0-9-]{36}$/i.test(order || '') || session.client_reference_id!==order ||
  !Number.isSafeInteger(session.amount_total) || !['cop','usd'].includes(session.currency) ||
  !/^pi_[a-zA-Z0-9]+$/.test(session.payment_intent || '')) throw new Error('INVALID_PAYMENT');
 const {error}=await admin.rpc('apply_verified_payment',{payment_provider:'stripe',provider_event:eventId,target_order:order,external_payment:session.payment_intent,verified_amount:session.amount_total,verified_currency:session.currency.toUpperCase()});
 if(error) throw new Error('PAYMENT_RECORDING_UNAVAILABLE');
 return true;
}
module.exports={recordSession};
