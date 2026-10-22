import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../assets/brand/visitors.js', import.meta.url), 'utf8');
function run(path='/', options={}) {
 const added=[], window={}; window.top=window; window.self=options.frame?{}:window;
 const document={body:{hasAttribute:()=>options.marketing===true},querySelector:()=>null,head:{appendChild:s=>added.push(s)},createElement:()=>({dataset:{}})};
 const context={window,document,location:new URL(path,'https://www.invitesse.com'),navigator:options.navigator||{},URL};
 // A counter must work even when storage is unavailable or cookies are rejected.
 Object.defineProperty(context,'localStorage',{get(){throw Error('storage must not be read');}});
 vm.runInNewContext(source,context);
 return {window,added};
}
test('cookieless counter loads independently of consent and redacts URL secrets',()=>{
 const {window,added}=run('/disenos/?token=secret#private');
 assert.equal(added.length,1);assert.equal(added[0].src,'/_vercel/insights/script.js');
 const hook=window.vaq[0][1];
 assert.equal(hook({type:'pageview',url:'https://www.invitesse.com/disenos/?token=secret#private'}).url,'https://www.invitesse.com/disenos/');
 assert.equal(hook({type:'event',url:'https://www.invitesse.com/',data:{email:'private'}}),null);
 assert.equal(hook({type:'pageview',url:'https://www.invitesse.com/invitacion/#token=secret'}),null);
 assert.equal(hook({type:'pageview',url:'https://external.example/'}),null);
});
test('never initializes on private routes, frames or browser opt-outs',()=>{
 for(const path of ['/admin/','/panel/','/editor/','/demo/encaje/','/cuenta/','/comprar/','/invitacion/','/en/account/','/en/demo/encaje/','/privacidad/','/404.html']) {
  assert.equal(run(path).added.length,0,path);
  if(path!='/404.html') assert.equal(run(path,{marketing:true}).added.length,0,path+' with marker');
 }
 for(const navigator of [{globalPrivacyControl:true},{doNotTrack:'1'}]) assert.equal(run('/',{navigator}).added.length,0);
 assert.equal(run('/',{frame:true}).added.length,0);
 assert.equal(run('/disenos/nacar/',{marketing:true}).added.length,1);
});
