// Admin-only read model. Never select unsubscribe tokens or modify subscription state.
const fields='id,email,status,lang,source,consented_at,welcome_sent_at,unsubscribed_at,created_at';
async function listSubscribers(admin,q={}) {
 const status=['pending','subscribed','unsubscribed'].includes(q.status)?q.status:'';
 const search=String(q.q||'').trim().slice(0,100).replace(/[%_\\]/g,'');
 const offset=Math.min(1000000,Math.max(0,parseInt(q.offset,10)||0)),limit=50;
 let rows=admin.from('newsletter_subscribers').select(fields,{count:'exact'}).order('created_at',{ascending:false}).order('id',{ascending:false});
 if(status) rows=rows.eq('status',status);
 if(search) rows=rows.ilike('email','%'+search+'%');
 const requests=[rows.range(offset,offset+limit-1),...['subscribed','pending','unsubscribed'].map(s=>admin.from('newsletter_subscribers').select('id',{head:true,count:'exact'}).eq('status',s))];
 const [result,...counts]=await Promise.all(requests);
 const failure=[result,...counts].find(r=>r.error);
 if(failure) {
  if(['42P01','PGRST205'].includes(failure.error.code))return {status:'not_configured'};
  throw Error('NEWSLETTER_READ_FAILED');
 }
 return {status:'ready',rows:result.data||[],total:result.count||0,offset,limit,counts:Object.fromEntries(['subscribed','pending','unsubscribed'].map((s,i)=>[s,counts[i].count||0]))};
}
module.exports={listSubscribers};
