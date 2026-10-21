const rt=require('../lib/payments/runtime');
function createHandler({adminClient=rt.adminClient,userFor=rt.userFor}={}) {
 return async function(req,res) {
  rt.headers(res);
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'});}
  if(req.headers.origin && req.headers.origin!==rt.origin)return res.status(403).json({error:'INVALID_ORIGIN'});
  try {
   const admin=adminClient(),user=await userFor(req,admin),b=req.body;
   if(!b || !/^[a-z]{3,16}$/.test(b.design || '') || !['status','switch'].includes(b.action))return res.status(400).json({error:'INVALID_REQUEST'});
   if(b.action==='switch') {
    if(!/^[a-z]{3,16}$/.test(b.target || '') || !Number.isInteger(b.revision))return res.status(400).json({error:'INVALID_REQUEST'});
    await rt.unwrap(admin.rpc('switch_purchased_design',{verified_owner:user.id,purchase_design:b.design,target_design:b.target,expected_revision:b.revision}));
   }
   return res.status(200).json(await rt.unwrap(admin.rpc('design_change_options',{verified_owner:user.id,purchase_design:b.design})));
  } catch(e) {
   const code=['AUTH_REQUIRED','EMAIL_NOT_CONFIRMED','INVITATION_NOT_FOUND','PUBLICATION_NOT_ENABLED','PURCHASE_REQUIRED','DRAFT_CONFLICT','DESIGN_ALREADY_PUBLISHED','DESIGN_PRICE_TOO_HIGH'].find(k=>e.message?.includes(k));
   return res.status(code==='AUTH_REQUIRED'?401:409).json({error:code || 'DESIGN_CHANGE_UNAVAILABLE'});
  }
 };
}
module.exports=createHandler();module.exports.createHandler=createHandler;
