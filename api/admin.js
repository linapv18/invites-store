// Panel de administración (/admin/). Solo responde a una sesión de Supabase válida, con correo confirmado,
// cuyo correo esté en ADMIN_EMAILS (variable de Vercel, separada por comas). Cualquier otra cuenta recibe 403.
// Lee y escribe con funciones admin_* de la base (solo service_role); nunca expone la clave secreta ni consultas libres.
const runtime=require('../lib/payments/runtime');
const {tiers:PRICES}=require('../lib/payments/prices.json');
const {closeUnpaidCheckout}=require('../lib/payments/admin-orders');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const TIERS=['esencial','signature','luxury'];

function allowedEmails() {
 return String(process.env.ADMIN_EMAILS || '').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean);
}
function since(days) { const n=Math.min(Math.max(parseInt(days,10) || 30,1),730); return new Date(Date.now()-n*86400000).toISOString(); }
function isoOrNull(v) { if(v==null || v==='') return null; const d=new Date(v); if(isNaN(d)) throw new Error('INVALID_REQUEST'); return d.toISOString(); }

// Convierte el formulario del panel (pesos y dólares) en la fila que guarda la base (unidades menores).
function codePayload(b) {
 const code=String(b.code || '').trim().toUpperCase();
 if(!/^[A-Z0-9]{3,32}$/.test(code) || !['percent','amount'].includes(b.kind)) throw new Error('INVALID_REQUEST');
 const tiers=Array.isArray(b.tiers)?[...new Set(b.tiers)].filter(t=>TIERS.includes(t)):[];
 if(!tiers.length) throw new Error('INVALID_REQUEST');
 const out={code,kind:b.kind,tiers,once_per_customer:b.once_per_customer===true,starts_at:isoOrNull(b.starts_at),ends_at:isoOrNull(b.ends_at),note:String(b.note || '').slice(0,300)};
 if(b.kind==='percent') {
  const pct=Number(b.percent_off); if(!Number.isInteger(pct) || pct<1 || pct>100) throw new Error('INVALID_REQUEST'); out.percent_off=pct;
 } else {
  const cop=Number(b.amount_cop), usd=Number(b.amount_usd);
  if(!Number.isInteger(cop) || cop<1 || cop>10000000 || !Number.isFinite(usd) || usd<=0 || usd>10000) throw new Error('INVALID_REQUEST');
  out.amount_off_cop=cop*100; out.amount_off_usd=Math.round(usd*100);
 }
 if(b.max_uses!=null && b.max_uses!=='') { const m=Number(b.max_uses); if(!Number.isInteger(m) || m<1 || m>100000) throw new Error('INVALID_REQUEST'); out.max_uses=m; }
 if(out.starts_at && out.ends_at && out.ends_at<=out.starts_at) throw new Error('INVALID_REQUEST');
 return out;
}

function createHandler({adminClient=runtime.adminClient,userFor=runtime.userFor,admins=allowedEmails,stripeClient=runtime.stripeClient}={}) {
 return async function handler(req,res) {
  runtime.headers(res);
  if(req.method!=='GET' && req.method!=='POST') { res.setHeader('Allow','GET, POST'); return res.status(405).json({error:'METHOD_NOT_ALLOWED'}); }
  if(req.method==='POST' && req.headers.origin && req.headers.origin!==runtime.origin) return res.status(403).json({error:'INVALID_ORIGIN'});
  let admin;
  try {
   const list=admins();
   if(!list.length) return res.status(503).json({error:'ADMIN_NOT_CONFIGURED'});
   admin=adminClient();
   const user=await userFor(req,admin);
   if(!list.includes(String(user.email || '').toLowerCase())) return res.status(403).json({error:'FORBIDDEN'});
   const q=req.query || {}, b=req.body && typeof req.body==='object'?req.body:{};
   const action=req.method==='GET'?q.action:b.action;
   if(typeof action==='string' && action.startsWith('marketing-')) {
    const {handle}=require('../lib/marketing/service');
    const catalog=Object.entries(require('../lib/payments/prices.json').designs).map(([id])=>({id}));
    return res.status(200).json(await handle({admin,user,method:req.method,body:b,query:q,catalog}));
   }
   if(req.method==='GET') {
    if(action==='traffic') return res.status(200).json(await require('../lib/analytics/traffic').traffic(q.days));
    if(action==='me') return res.status(200).json({email:user.email,prices:PRICES});
    if(action==='summary') return res.status(200).json(await runtime.unwrap(admin.rpc('admin_summary',{since:since(q.days)})));
    if(action==='analytics') return res.status(200).json(await runtime.unwrap(admin.rpc('admin_analytics',{since:since(q.days)})));
    if(action==='codes') return res.status(200).json(await runtime.unwrap(admin.rpc('admin_codes')));
    if(action==='order') { if(!uuid.test(q.id || '')) return res.status(400).json({error:'INVALID_REQUEST'}); return res.status(200).json(await runtime.unwrap(admin.rpc('admin_order',{target:q.id}))); }
    if(action==='orders') {
     const filter={bucket:['orders','drafts','all'].includes(q.bucket)?q.bucket:'orders',visibility:['active','archived','trash'].includes(q.visibility)?q.visibility:'active'};
     if(['paid','pending','refunded','cancelled'].includes(q.status)) filter.status=q.status;
     if(['COP','USD'].includes(q.currency)) filter.currency=q.currency;
     if(TIERS.includes(q.tier)) filter.tier=q.tier;
     if(typeof q.q==='string' && q.q.trim()) filter.q=q.q.trim().slice(0,80).replace(/[%_\\]/g,'');
     filter.offset=Math.max(parseInt(q.offset,10) || 0,0); filter.limit=25;
     return res.status(200).json(await runtime.unwrap(admin.rpc('admin_orders',{filter})));
    }
    return res.status(400).json({error:'INVALID_REQUEST'});
   }
   if(action==='manage-order') {
    if(!uuid.test(b.id || '') || !['archive','delete','restore'].includes(b.operation))return res.status(400).json({error:'INVALID_REQUEST'});
    let expected_status;
    if(b.operation==='delete') {
     const order=await runtime.unwrap(admin.from('orders').select('id,status,created_at').eq('id',b.id).single());
     if(order.status==='pending')await closeUnpaidCheckout(admin,stripeClient(),order);
     expected_status=order.status==='pending'?'cancelled':order.status;
    }
    return res.status(200).json(await runtime.unwrap(admin.rpc('admin_manage_order',{target:b.id,operation:b.operation,actor:user.id,...(expected_status?{expected_status}:{})})));
   }
   if(action==='create-code') return res.status(201).json(await runtime.unwrap(admin.rpc('admin_save_code',{payload:codePayload(b)})));
   if(action==='toggle-code') {
    if(!uuid.test(b.id || '') || typeof b.active!=='boolean') return res.status(400).json({error:'INVALID_REQUEST'});
    await runtime.unwrap(admin.rpc('admin_set_code_active',{target:b.id,enabled:b.active}));
    return res.status(200).json({ok:true});
   }
   return res.status(400).json({error:'INVALID_REQUEST'});
  } catch(e) {
   const m=e.message || '';
   if(m.includes('AUTH_REQUIRED') || m.includes('EMAIL_NOT_CONFIRMED')) return res.status(401).json({error:'AUTH_REQUIRED'});
   for(const [k,code] of [['INVALID_MARKETING_INPUT',400],['MARKETING_CONFLICT',409],['MARKETING_NOT_FOUND',404],['INVALID_REQUEST',400],['ORDER_STATE_CHANGED',409],['CHECKOUT_STILL_OPEN',409],['CHECKOUT_BEING_PREPARED',409],['PAYMENT_PROCESSING',409],['ORDER_JUST_PAID',409],['PAYMENT_STATE_UNAVAILABLE',409],['ORDER_IN_TRASH',409],['CODE_EXISTS',409],['ORDER_NOT_FOUND',404],['CODE_NOT_FOUND',404]]) if(m.includes(k)) return res.status(code).json({error:k});
   if(m.includes('PAYMENTS_NOT_CONFIGURED')) return res.status(503).json({error:'ADMIN_NOT_CONFIGURED'});
   console.error('invitesse.admin.failure',{code:/^[a-zA-Z0-9_]{1,48}$/.test(e.code || '')?e.code:'UNAVAILABLE'});
   return res.status(503).json({error:'ADMIN_UNAVAILABLE'});
  }
 };
}
module.exports=createHandler(); module.exports.createHandler=createHandler; module.exports.codePayload=codePayload;
