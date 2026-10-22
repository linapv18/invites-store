// Vercel Web Analytics is queried only after api/admin authorizes the owner.
// No provider token, raw response or visitor identifiers leave the server.
function createTraffic({fetcher=fetch,env=process.env,now=Date.now}={}) {
 const cache=new Map();
 return async function traffic(value) {
  if(!env.VERCEL_ANALYTICS_TOKEN) return {status:'not_configured'};
  const days=Math.min(730,Math.max(1,parseInt(value,10)||30));
  const cached=cache.get(days);if(cached && cached.expires>now()) return cached.data;
  const until=new Date(now()).toISOString(),since=new Date(now()-days*86400000).toISOString();
  const granularity=days>60?'week':'day';
  async function query(by) {
   const url=new URL('https://api.vercel.com/v1/query/web-analytics/visits/'+(by?'aggregate':'count'));
   url.searchParams.set('projectId',env.VERCEL_PROJECT_ID || 'invites-store');
   url.searchParams.set('teamId',env.VERCEL_ANALYTICS_TEAM_ID || 'team_lCM12u8gqwtrRnVvQ10bpmRR');
   url.searchParams.set('since',since);url.searchParams.set('until',until);
   url.searchParams.set('filter',"environment eq 'production'");
   if(by){url.searchParams.append('by',by);url.searchParams.set('limit',by===granularity?'100':'10');}
   const r=await fetcher(url,{headers:{Authorization:'Bearer '+env.VERCEL_ANALYTICS_TOKEN},signal:AbortSignal.timeout(8000)});
   if(!r.ok)throw Object.assign(new Error('TRAFFIC_PROVIDER'),{status:r.status});
   const body=await r.json();return body.data;
  }
  const counts=row=>{
   if(!row || !Number.isSafeInteger(row.pageviews) || row.pageviews<0 || !Number.isSafeInteger(row.visitors) || row.visitors<0)throw new Error('TRAFFIC_FORMAT');
   return {pageviews:row.pageviews,visitors:row.visitors};
  };
  const list=(rows,key)=>{
   if(!Array.isArray(rows))throw new Error('TRAFFIC_FORMAT');
   return rows.slice(0,10).map(row=>({label:String(row[key] || '').slice(0,180),...counts(row)}));
  };
  try {
   const [total,series,pages,countries,sources,devices]=await Promise.all([query(),query(granularity),query('requestPath'),query('country'),query('referrerHostname'),query('deviceType')]);
   if(!Array.isArray(series))throw new Error('TRAFFIC_FORMAT');
   const result={status:'ready',days,since,until,updated_at:until,granularity,...counts(total),series:series.map(row=>{
    const timestamp=Date.parse(row.timestamp);if(!Number.isFinite(timestamp))throw new Error('TRAFFIC_FORMAT');
    return {timestamp:new Date(timestamp).toISOString(),...counts(row)};
   }).sort((a,b)=>a.timestamp.localeCompare(b.timestamp)),pages:list(pages,'requestPath'),countries:list(countries,'country'),sources:list(sources,'referrerHostname'),devices:list(devices,'deviceType')};
   if(cache.size>=16)cache.delete(cache.keys().next().value);
   cache.set(days,{data:result,expires:now()+60000});return result;
  } catch(e) {
   return {status:e.status===401 || e.status===403?'access_denied':e.status===402?'plan_required':'unavailable'};
  }
 };
}
module.exports={createTraffic,traffic:createTraffic()};
