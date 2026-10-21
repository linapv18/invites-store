import test from 'node:test';
import assert from 'node:assert/strict';
import module from '../api/publication.js';
const {createHandler}=module;
function fixture({user=true,failPublish=false}={}) {
 const calls=[];const rows={invitation_drafts:{id:'draft',revision:7},invitations:{state:'published',access_mode:'family',published_version_id:'version'},invitation_versions:{draft_revision:7},households:[]};
 const admin={from(table){const chain={select(fields){calls.push({table,fields});return chain;},eq(key,value){calls.push({table,key,value});return chain;},single:async()=>({data:rows[table]}),order:async()=>({data:rows[table]})};return chain;}};
 const handle=createHandler({adminClient:()=>admin,userFor:async()=>{if(!user)throw Error('AUTH_REQUIRED');return {id:'verified-owner'};},userClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return failPublish?{error:{message:'PUBLICATION_INCOMPLETE'}}:{data:{}};}})});
 const res={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};
 return {calls,res,run:body=>handle({method:'POST',headers:{origin:'https://www.invitesse.com'},body},res)};
}
test('publication status includes server draft and published revision scoped to verified owner',async()=>{
 const f=fixture();await f.run({action:'status',design:'nacar',owner:'untrusted'});assert.equal(f.res.code,200);assert.equal(f.res.body.revision,7);assert.equal(f.res.body.publishedRevision,7);assert.ok(f.calls.some(x=>x.table==='invitation_drafts'&&x.key==='owner_id'&&x.value==='verified-owner'));assert.ok(f.calls.some(x=>x.table==='invitation_versions'&&x.key==='id'&&x.value==='version'));
});
test('failed publication never returns a published state; unauthenticated status discloses nothing',async()=>{
 const f=fixture({failPublish:true});await f.run({action:'publish',design:'nacar',revision:7,public:false});assert.equal(f.res.code,409);assert.equal(f.res.body.error,'PUBLICATION_INCOMPLETE');assert.equal(f.res.body.invitation,undefined);
 const no=fixture({user:false});await no.run({action:'status',design:'nacar'});assert.equal(no.res.code,401);assert.equal(no.calls.length,0);
});
