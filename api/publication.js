const {createClient}=require('@supabase/supabase-js');
const rt=require('../lib/payments/runtime');
function createHandler({adminClient=rt.adminClient,userFor=rt.userFor,userClient}={}) {
 return async function(req,res) {
  rt.headers(res);
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'});}
  if(req.headers.origin && req.headers.origin!==rt.origin)return res.status(403).json({error:'INVALID_ORIGIN'});
  try {
   const admin=adminClient(),user=await userFor(req,admin),b=req.body;
   if(!b || !/^[a-z]{3,16}$/.test(b.design || '') || !['status','publish','rotate','pause'].includes(b.action))return res.status(400).json({error:'INVALID_REQUEST'});
   const draft=await rt.unwrap(admin.from('invitation_drafts').select('id,revision').eq('owner_id',user.id).eq('design_id',b.design).single());
   const client=userClient?userClient(req):createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{global:{headers:{Authorization:req.headers.authorization}},auth:{persistSession:false,autoRefreshToken:false}});
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
   const invitation=await rt.unwrap(admin.from('invitations').select('slug,state,access_mode').eq('id',draft.id).single());
   const households=await rt.unwrap(admin.from('households').select('id,label,guests(id,display_name,guest_responses(attendance,dietary_notes)),household_responses(message,revision)').eq('invitation_id',draft.id).order('created_at'));
   return res.status(200).json({invitation,households,publicUrl:invitation.access_mode==='public' && invitation.state==='published'?rt.origin+'/invitacion/#slug='+invitation.slug:null});
  }catch(e){
   const codes=['AUTH_REQUIRED','EMAIL_NOT_CONFIRMED','DRAFT_CONFLICT','INVITATION_NOT_FOUND','PUBLICATION_NOT_ENABLED','PUBLICATION_INCOMPLETE','INVITATION_LANGUAGE_REQUIRED','AUDIO_NOT_UPLOADED','INVALID_GUEST_NAME','INVALID_GUEST_COUNT'];
   const code=codes.find(k=>e.message?.includes(k));return res.status(code==='AUTH_REQUIRED'?401:409).json({error:code || 'PUBLICATION_UNAVAILABLE'});
  }
 };
}
module.exports=createHandler();module.exports.createHandler=createHandler;
