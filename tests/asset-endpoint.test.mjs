import test from 'node:test';
import assert from 'node:assert/strict';
import endpoint from '../api/invitation-asset.js';
const ID='11111111-1111-4111-8111-111111111111';
function response(){return { headers:{},setHeader(k,v){this.headers[k]=v;},status(v){this.code=v;return this;},json(v){this.body=v;return this;} };}
test('unrelated asset or invalid guest token never reaches privileged signing',async()=>{
 let privileged=0;
 const handler=endpoint.createHandler({publicClient:()=>({rpc:async()=>({data:null,error:null})}),adminClient:()=>{privileged++;throw Error('not expected');}});
 const res=response();await handler({method:'POST',body:{assetId:ID,guestToken:'a'.repeat(64)}},res);
 assert.equal(res.code,404);assert.equal(privileged,0);assert.equal(res.headers['Cache-Control'],'no-store');
 const invalid=response();await handler({method:'POST',body:{assetId:ID,guestToken:'bad'}},invalid);assert.equal(invalid.code,400);assert.equal(privileged,0);
});
test('signing uses the authorized stored path and short expiration',async()=>{
 let signed;
 const chain={select(){return this;},eq(){return this;},single:async()=>({data:{object_path:'owner/invitation/file.webp'}})};
 const handler=endpoint.createHandler({publicClient:()=>({rpc:async()=>({data:{id:ID,assets:[{id:ID}]}})}),adminClient:()=>({from:()=>chain,storage:{from:()=>({createSignedUrl:async(path,seconds)=>{signed={path,seconds};return {data:{signedUrl:'https://example.invalid/signed'}};}})}})});
 const res=response();await handler({method:'POST',body:{assetId:ID,slug:'ana-leon',path:'forged/path'}},res);
 assert.equal(res.code,200);assert.deepEqual(signed,{path:'owner/invitation/file.webp',seconds:60});
});
