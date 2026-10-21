const {createClient}=require('@supabase/supabase-js');
const rt=require('../lib/payments/runtime');
function createHandler({adminClient=rt.adminClient,userFor=rt.userFor,userClient}={}) {
 return async function(req,res) {
  rt.headers(res);
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'});}
  if(req.headers.origin && req.headers.origin!==rt.origin)return res.status(403).json({error:'INVALID_ORIGIN'});
  try {
   const admin=adminClient(),user=await userFor(req,admin),b=req.body;
   if(!b || !/^[a-z]{3,16}$/.test(b.design || '') || !['status','publish','rotate','pause','panel-save'].includes(b.action))return res.status(400).json({error:'INVALID_REQUEST'});
   let draft=await rt.unwrap(admin.from('invitation_drafts').select('id,revision').eq('owner_id',user.id).eq('design_id',b.design).single());
   const client=userClient?userClient(req):createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{global:{headers:{Authorization:req.headers.authorization}},auth:{persistSession:false,autoRefreshToken:false}});
   if(b.action==='panel-save') {
    if(!['create','edit','delete','sent'].includes(b.operation) || !Number.isInteger(b.revision) || !b.payload || typeof b.payload!=='object' || JSON.stringify(b.payload).length>50000 || (b.operation!=='create' && (!/^[a-f0-9-]{36}$/i.test(b.householdId || '') || !Number.isInteger(b.householdRevision))))return res.status(400).json({error:'INVALID_REQUEST'});
    await rt.unwrap(client.rpc('manage_panel_household',{purchase_design:b.design,operation:b.operation,target_household:b.householdId || null,payload:b.payload,expected_draft_revision:b.revision,expected_household_revision:b.householdRevision ?? null}));
    draft=await rt.unwrap(admin.from('invitation_drafts').select('id,revision').eq('owner_id',user.id).eq('design_id',b.design).single());
   }
   if(b.action==='publish') {
    if(!Number.isInteger(b.revision) || typeof b.public!=='boolean')return res.status(400).json({error:'INVALID_REQUEST'});
    await rt.unwrap(client.rpc('publish_editor_invitation',{target:draft.id,expected_revision:b.revision,allow_public:b.public}));
   }
   if(b.action==='pause')await rt.unwrap(client.rpc('pause_invitation',{target:draft.id}));
   if(b.action==='rotate') {
    if(!/^[a-f0-9-]{36}$/i.test(b.householdId || ''))return res.status(400).json({error:'INVALID_REQUEST'});
    const h=await rt.unwrap(admin.from('households').select('id').eq('invitation_id',draft.id).eq('id',b.householdId).single());
    const token=await rt.unwrap(client.rpc('rotate_guest_link',{target_household:h.id}));
    return res.status(200).json({url:rt.origin+'/invitacion/#token='+token});
   }
   const invitation=await rt.unwrap(admin.from('invitations').select('slug,state,access_mode,published_version_id').eq('id',draft.id).single());
   const households=await rt.unwrap(admin.from('households').select('id,label,sent_at,guests(id,display_name,sort_order,guest_responses(attendance,dietary_notes)),household_responses(message,revision)').eq('invitation_id',draft.id).order('created_at'));
   const privateLinks=await rt.unwrap(admin.rpc('ensure_household_links',{verified_owner:user.id,target_invitation:draft.id}));
   const links=Object.fromEntries(Object.entries(privateLinks || {}).map(([id,token])=>[id,rt.origin+'/invitacion/#token='+token]));
   const version=invitation.published_version_id?await rt.unwrap(admin.from('invitation_versions').select('draft_revision').eq('id',invitation.published_version_id).single()):null;
   return res.status(200).json({invitation,households,links,revision:draft.revision,publishedRevision:version?.draft_revision ?? null,publicUrl:invitation.access_mode==='public' && invitation.state==='published'?rt.origin+'/invitacion/#slug='+invitation.slug:null});
  }catch(e){
   const codes=['INVALID_REQUEST','RESPONSE_CONFLICT','HOUSEHOLD_NOT_FOUND','AUTH_REQUIRED','EMAIL_NOT_CONFIRMED','DRAFT_CONFLICT','INVITATION_NOT_FOUND','PUBLICATION_NOT_ENABLED','PUBLICATION_INCOMPLETE','INVITATION_LANGUAGE_REQUIRED','AUDIO_NOT_UPLOADED','INVALID_GUEST_NAME','INVALID_GUEST_COUNT','INVALID_GUEST'];
   const code=codes.find(k=>e.message?.includes(k));return res.status(code==='AUTH_REQUIRED'?401:409).json({error:code || 'PUBLICATION_UNAVAILABLE'});
  }
 };
}
module.exports=createHandler();module.exports.createHandler=createHandler;
