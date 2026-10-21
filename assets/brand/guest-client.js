/* Public invitation capabilities only: no account SDK, storage or session refresh. */
(function(){
 'use strict';
 var config=window.INVITESSE_SUPABASE_CONFIG;if(!config?.url||!config.publishableKey)return;
 async function rpc(name,args){
  var response=await fetch(config.url.replace(/\/+$/,'')+'/rest/v1/rpc/'+name,{method:'POST',credentials:'omit',cache:'no-store',headers:{apikey:config.publishableKey,Authorization:'Bearer '+config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('INVITATION_REQUEST_FAILED');return response.json();
 }
 window.InvitesseGuestBackend={
  invitations:{public:function(slug){return rpc('get_published_invitation',{requested_slug:slug});}},
  guests:{open:function(token){return rpc('get_guest_invitation',{raw_token:token});},submit:function(token,answers,message,revision,requestId){return rpc('submit_guest_response',{raw_token:token,answers:answers,response_message:message,expected_revision:revision,request_id:requestId});}}
 };
})();
