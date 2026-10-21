const rt=require('../payments/runtime'),{capabilities}=require('./service');
async function processReminders({admin,env=process.env,send=sendResend,now=()=>new Date().toISOString()}){
 await rt.unwrap(admin.rpc('marketing_tick',{at_time:now()}));
 const availability=capabilities(env);if(!availability.email_ready)return {processed:0,delivered:0,email_ready:false,reasons:availability.reasons};
 const jobs=await rt.unwrap(admin.rpc('marketing_claim_jobs',{sender:env.MARKETING_FROM||env.QUOTE_FROM||'Invitesse <cotizaciones@mail.invitesse.com>',at_time:now()}));let delivered=0,failed=0;
 const admins=String(env.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
 for(const job of jobs||[]){let error=null;try{
  if(!admins.includes(String(job.verified_email).toLowerCase()))throw Error('ADMIN_NO_LONGER_AUTHORIZED');
  if(!await rt.unwrap(admin.rpc('marketing_job_valid',{target:job.id,lease:job.lease})))continue;
  await send(job.payload,'invitesse-marketing-'+job.id,env);delivered++;
 }catch(e){error=/^[A-Z0-9_]{1,80}$/.test(e.message||'')?e.message:'DELIVERY_FAILED';failed++;}
 await rt.unwrap(admin.rpc('marketing_finish_job',{target:job.id,lease:job.lease,delivered:!error,error_code:error,at_time:now()}));
 }
 return {processed:(jobs||[]).length,delivered,failed,email_ready:true};
}
async function sendResend(payload,key,env){const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('RESEND_'+r.status);const data=await r.json();if(!data.id)throw Error('RESEND_NO_MESSAGE_ID');return data.id;}
module.exports={processReminders,sendResend};
