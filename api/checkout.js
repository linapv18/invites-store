const runtime=require('../lib/payments/runtime');
const {recordSession}=require('../lib/payments/stripe');
const designPattern=/^[a-z]{3,16}$/;
function createHandler({adminClient=runtime.adminClient,stripeClient=runtime.stripeClient,userFor=runtime.userFor}={}) {
 let accountVerifiedAt=0;
 async function requireAccount(stripe) {
  if(Date.now()-accountVerifiedAt<60000)return;
  const account=await stripe.accounts.retrieve();
  if(account.id!=='acct_1PCrn7P9O3dSAvF3' || !account.charges_enabled) throw new Error('PAYMENTS_NOT_CONFIGURED');
  accountVerifiedAt=Date.now();
 }
 return async function(req,res) {
  runtime.headers(res);
  if(req.method!=='POST' && req.method!=='GET') {res.setHeader('Allow','GET, POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'});}
  try {
   const admin=adminClient();
   const ready=await runtime.unwrap(admin.rpc('stripe_checkout_readiness'));
   if(ready?.version!==1 || !ready.prices) throw new Error('PAYMENTS_NOT_CONFIGURED');
   // Null identifiers match no order: these probes cannot update customer data.
   // Fail closed if the final idempotency/refund migration has not been installed.
   for(const [fn,args] of [['freeze_stripe_parameters',{target_order:null,payload:null}],['revoke_stripe_order',{target_order:null}]]) {
    const probe=await admin.rpc(fn,args);
    if(!probe.error?.message?.includes('ORDER_NOT_FOUND')) throw new Error('PAYMENTS_NOT_CONFIGURED');
   }
   if(req.method==='GET') {
    await requireAccount(stripeClient());
    return res.status(200).json({available:true,prices:{COP:200000,USD:79}});
   }
   if(req.headers.origin && req.headers.origin!==runtime.origin) return res.status(403).json({error:'INVALID_ORIGIN'});
   const user=await userFor(req,admin), b=req.body;
   if(!b || typeof b!=='object' || !designPattern.test(b.design || '') || !['details','quote','create','status','cancel'].includes(b.action)) return res.status(400).json({error:'INVALID_REQUEST'});
   if(b.action==='details') {
    if(typeof b.date!=='string' || typeof b.timezone!=='string') return res.status(400).json({error:'INVALID_REQUEST'});
    await runtime.unwrap(admin.rpc('configure_stripe_purchase',{verified_owner:user.id,requested_design:b.design,event_day:b.date,event_zone:b.timezone}));
   }
   const quote=await runtime.unwrap(admin.rpc('quote_stripe_checkout',{verified_owner:user.id,requested_design:b.design}));
   if(['quote','details'].includes(b.action)) return res.status(200).json({...quote,prices:{COP:200000,USD:79}});
   if(quote.enabled) return res.status(200).json({...quote,status:'paid'});
   const stripe=stripeClient();
   // Look up pending checkouts by the verified owner, never by a browser order ID.
   const pending=await runtime.unwrap(admin.from('orders').select('id,status,currency').eq('owner_id',user.id).eq('invitation_id',quote.invitation_id).eq('status','pending').order('created_at',{ascending:false}).limit(1));
   let existing=pending?.[0], session=null;
   if(existing) {
    const row=await runtime.unwrap(admin.from('stripe_checkouts').select('session_id').eq('order_id',existing.id).maybeSingle());
    if(row?.session_id) {
     session=await stripe.checkout.sessions.retrieve(row.session_id);
     if(session.metadata?.order_id!==existing.id || session.metadata?.integration!=='invitesse' || !session.livemode) throw new Error('PAYMENT_STATE_UNAVAILABLE');
     if(session.payment_status==='paid') {
      await recordSession(admin,session,'reconcile:'+session.id);
      return res.status(200).json({...quote,status:'paid',enabled:true});
     }
     if(b.action==='cancel' && session.status==='open') session=await stripe.checkout.sessions.expire(session.id);
     if(session.status==='expired') {await runtime.unwrap(admin.rpc('expire_stripe_order',{target_order:existing.id}));existing=null;session=null;}
     else if(session.status!=='open') return res.status(200).json({...quote,status:'processing'});
    }
   }
   if(b.action==='cancel') {
    // A creation may be in flight when no session ID is persisted yet; never cancel it blindly.
    if(existing) throw new Error('CHECKOUT_BEING_PREPARED');
    return res.status(200).json({status:'cancelled'});
   }
   if(b.action==='status') return res.status(200).json({...quote,status:existing?'pending':'unpaid',checkoutCurrency:existing?.currency});
   if(!['COP','USD'].includes(b.currency) || !Number.isInteger(b.revision) || b.acceptedTerms!==true) return res.status(400).json({error:'INVALID_REQUEST'});
   if(session) {
    if(existing.currency!==b.currency) return res.status(409).json({error:'CHECKOUT_CURRENCY_LOCKED'});
    return res.status(200).json({url:session.url,status:'pending'});
   }
   // Serializes concurrent clicks across browsers and currencies in the database.
   const order=await runtime.unwrap(admin.rpc('prepare_stripe_checkout',{verified_owner:user.id,requested_design:b.design,requested_currency:b.currency,expected_revision:b.revision}));
   if(order.status==='enabled') return res.status(200).json({status:'paid',enabled:true});
   if(order.currency!==b.currency) return res.status(409).json({error:'CHECKOUT_CURRENCY_LOCKED'});
   const en=b.locale==='en', back=runtime.origin+(en?'/en':'')+'/editor/pago/?diseno='+encodeURIComponent(b.design);
   const expiresDate=new Intl.DateTimeFormat(en?'en-US':'es-CO',{timeZone:order.timezone,year:'numeric',month:'long',day:'numeric'}).format(new Date(new Date(order.expires_at).getTime()-1));
   if(!order.session_id && Date.now()-Date.parse(order.created_at)>23*60*60*1000) throw new Error('PAYMENT_STATE_UNAVAILABLE');
   await requireAccount(stripe);
   const parameters=await runtime.unwrap(admin.rpc('freeze_stripe_parameters',{target_order:order.order_id,payload:{
    mode:'payment',locale:en?'en':'es',payment_method_types:['card'],
    client_reference_id:order.order_id,customer_email:user.email,
    metadata:{integration:'invitesse',order_id:order.order_id,terms_version:'2026-10-20'},
    payment_intent_data:{metadata:{integration:'invitesse',order_id:order.order_id}},
    line_items:[{quantity:1,price_data:{currency:order.currency.toLowerCase(),unit_amount:order.amount,product_data:{name:'Invitesse — '+b.design,description:(en?'Publication through ':'Publicación hasta el ')+expiresDate}}}],
    adaptive_pricing:{enabled:false},allow_promotion_codes:false,
    success_url:back+'&payment=return',cancel_url:back+'&payment=cancelled',
    custom_text:{submit:{message:en?'One-time payment. Publication until '+expiresDate+'.':'Pago único. Publicación hasta el '+expiresDate+'.'}},
   }}));
   session=await stripe.checkout.sessions.create(parameters,{idempotencyKey:'invitesse-checkout-'+order.order_id});
   await runtime.unwrap(admin.from('stripe_checkouts').update({session_id:session.id}).eq('order_id',order.order_id));
   if(!session.url?.startsWith('https://checkout.stripe.com/')) throw new Error('PAYMENT_STATE_UNAVAILABLE');
   return res.status(200).json({url:session.url,status:'pending'});
  } catch(e) {
   const message=e.message || '';
   const known=['AUTH_REQUIRED','EMAIL_NOT_CONFIRMED','INVITATION_NOT_FOUND','DRAFT_CONFLICT','EVENT_DETAILS_REQUIRED','EVENT_DATE_IN_PAST','INVALID_TIME_ZONE','PURCHASE_ALREADY_EXISTS','CHECKOUT_BEING_PREPARED','PURCHASE_EVENT_DATE_LOCKED'];
   const code=known.find(k=>message.includes(k));
   return res.status(code==='AUTH_REQUIRED'?401:code?409:503).json({error:code || 'PAYMENTS_TEMPORARILY_UNAVAILABLE'});
  }
 };
}
module.exports=createHandler();module.exports.createHandler=createHandler;
