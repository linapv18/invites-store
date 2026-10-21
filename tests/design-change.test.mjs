import test from 'node:test';
import assert from 'node:assert/strict';
import handlerModule from '../api/design-change.js';
const {createHandler}=handlerModule;
async function request(body,{origin='https://www.invitesse.com',failure,auth=true}={}) {
 const calls=[];const admin={rpc:async(name,args)=>{calls.push({name,args});return failure?{error:{message:failure}}:{data:{locked:false,designs:[]}};}};
 const handle=createHandler({adminClient:()=>admin,userFor:async()=>{if(!auth)throw Error('AUTH_REQUIRED');return {id:'verified-owner'};}});
 const res={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};
 await handle({method:'POST',headers:{origin},body},res);return {res,calls};
}
test('design changes use verified owner and revision, never client price or owner',async()=>{
 const {res,calls}=await request({action:'switch',design:'nacar',target:'clasico',revision:4,owner:'attacker',price:999999});
 assert.equal(res.code,200);assert.deepEqual(calls[0],{name:'switch_purchased_design',args:{verified_owner:'verified-owner',purchase_design:'nacar',target_design:'clasico',expected_revision:4}});
 assert.equal(calls[1].name,'design_change_options');
});
test('invalid origins, unauthenticated requests and malformed changes never reach SQL',async()=>{
 for(const options of [{origin:'https://evil.invalid'},{auth:false}])assert.equal((await request({action:'status',design:'nacar'},options)).calls.length,0);
 const result=await request({action:'switch',design:'nacar',target:'clasico',revision:'4'});assert.equal(result.res.code,400);assert.equal(result.calls.length,0);
});
test('publication lock and higher price are returned without mutation retries',async()=>{
 for(const failure of ['DESIGN_ALREADY_PUBLISHED','DESIGN_PRICE_TOO_HIGH','DRAFT_CONFLICT']){
 const {res,calls}=await request({action:'switch',design:'nacar',target:'encaje',revision:4},{failure});assert.equal(res.code,409);assert.equal(res.body.error,failure);assert.equal(calls.length,1);
 }
});
