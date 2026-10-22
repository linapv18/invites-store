import test from 'node:test';
import assert from 'node:assert/strict';
import {listSubscribers} from '../lib/marketing/subscribers.js';
import endpoint from '../api/admin.js';
function fixture(error){const calls=[];return {calls,admin:{from(table){assert.equal(table,'newsletter_subscribers');const call={};calls.push(call);const q={select(fields,opts){call.fields=fields;call.opts=opts;return q;},order(){return q;},eq(k,v){call.status=v;return q;},ilike(k,v){call.search=v;return q;},range(a,b){call.range=[a,b];return q;},then(resolve,reject){return Promise.resolve({data:call.range?[{email:'test@example.invalid'}]:null,count:3,error}).then(resolve,reject);}};return q;}}};}
test('admin subscriber list is paginated, filtered and never selects unsubscribe tokens',async()=>{
 const f=fixture(),r=await listSubscribers(f.admin,{status:'subscribed',q:' %ana_\\ ',offset:'50'});
 assert.equal(r.status,'ready');assert.equal(r.total,3);assert.deepEqual(f.calls[0].range,[50,99]);assert.equal(f.calls[0].search,'%ana%');assert.equal(f.calls[0].status,'subscribed');
 assert.deepEqual(r.counts,{subscribed:3,pending:3,unsubscribed:3});
 assert.ok(!f.calls[0].fields.includes('token'));assert.ok(!f.calls[0].fields.includes('*'));
 assert.equal(f.calls.length,4);
});
test('missing table differs from query failure and empty data',async()=>{
 assert.equal((await listSubscribers(fixture({code:'42P01'}).admin)).status,'not_configured');
 await assert.rejects(()=>listSubscribers(fixture({code:'OTHER'}).admin),/NEWSLETTER_READ_FAILED/);
});
test('subscriber action is protected by the admin allowlist',async()=>{
 const f=fixture();const handler=endpoint.createHandler({adminClient:()=>f.admin,userFor:async()=>({email:'not-admin@example.invalid'}),admins:()=>['admin@example.invalid']});
 const res={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};
 await handler({method:'GET',query:{action:'marketing-subscribers'},headers:{}},res);
 assert.equal(res.code,403);assert.equal(f.calls.length,0);
});
