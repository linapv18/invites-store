import test from 'node:test';
import assert from 'node:assert/strict';
import service from '../lib/analytics/traffic.js';
const env={VERCEL_ANALYTICS_TOKEN:'fixture-private-token',VERCEL_PROJECT_ID:'prj_fixture'};
const now=()=>Date.parse('2026-10-22T18:00:00Z');
test('traffic aggregates production data, discards raw visitor identifiers and caches per period',async()=>{
 const calls=[];
 const traffic=service.createTraffic({env,now,fetcher:async(url,opts)=>{
  calls.push(url);assert.equal(opts.headers.Authorization,'Bearer fixture-private-token');
  assert.equal(url.hostname,'api.vercel.com');assert.equal(url.searchParams.get('projectId'),'prj_fixture');
  assert.equal(url.searchParams.get('filter'),"environment eq 'production'");
  const by=url.searchParams.get('by'), row={pageviews:12,visitors:7,visitorId:'never-expose',token:'never-expose'};
  return {ok:true,json:async()=>({data:by?[{...row,[by]:by==='day'?undefined:'/disenos/',timestamp:'2026-10-22T00:00:00Z'}]:row})};
 }});
 const r=await traffic(7);assert.equal(r.status,'ready');assert.equal(r.pageviews,12);assert.equal(r.visitors,7);
 assert.equal(r.since,'2026-10-15T18:00:00.000Z');assert.equal(calls.length,6);
 assert.ok(!JSON.stringify(r).includes('never-expose'));assert.ok(!JSON.stringify(r).includes(env.VERCEL_ANALYTICS_TOKEN));
 await traffic(7);assert.equal(calls.length,6);await traffic(30);assert.equal(calls.length,12);
});
test('missing config, provider errors and malformed responses are distinct from zero visits',async()=>{
 assert.deepEqual(await service.createTraffic({env:{},fetcher:()=>assert.fail('must not fetch')})(7),{status:'not_configured'});
 for(const [status,expected]of [[401,'access_denied'],[403,'access_denied'],[402,'plan_required'],[503,'unavailable']]){
  const traffic=service.createTraffic({env,now,fetcher:async()=>({ok:false,status})});assert.deepEqual(await traffic(7),{status:expected});
 }
 const malformed=service.createTraffic({env,now,fetcher:async()=>({ok:true,json:async()=>({data:{}})})});assert.equal((await malformed(7)).status,'unavailable');
 const empty=service.createTraffic({env,now,fetcher:async(url)=>({ok:true,json:async()=>({data:url.searchParams.has('by')?[]:{pageviews:0,visitors:0}})})});
 assert.equal((await empty(7)).pageviews,0);assert.equal((await empty(7)).status,'ready');
});
