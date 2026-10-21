const crypto=require('node:crypto'),rt=require('../lib/payments/runtime'),{processReminders}=require('../lib/marketing/worker');
function createHandler({env=process.env,adminClient=rt.adminClient,process:run=processReminders}={}){return async(req,res)=>{
 rt.headers(res);if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'});}
 const secret=env.CRON_SECRET,expected='Bearer '+secret,provided=req.headers.authorization||'';
 if(!secret||secret.length<32||!crypto.timingSafeEqual(crypto.createHash('sha256').update(expected).digest(),crypto.createHash('sha256').update(provided).digest()))return res.status(401).json({error:'UNAUTHORIZED'});
 try{return res.status(200).json(await run({admin:adminClient(),env}));}catch(_){console.error('invitesse.marketing.worker_failed');return res.status(503).json({error:'REMINDER_PROCESSING_FAILED'});}
};}
module.exports=createHandler();module.exports.createHandler=createHandler;
