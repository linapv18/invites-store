import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import config from '../lib/payments/prices.json' with {type:'json'};
import pricingModule from '../lib/payments/pricing.js';
test('charged range agrees with every public catalogue tag',async()=>{
 const sandbox={window:{}};vm.runInNewContext(await readFile(new URL('../disenos/catalogo.js',import.meta.url),'utf8'),sandbox);
 const designs=sandbox.window.LazoCatalog.designs;assert.equal(designs.length,22);
 for(const design of designs)assert.equal(config.designs[design.id],design.tags.gama[0],design.id);
 assert.equal(Object.keys(config.designs).length,designs.length);
 assert.deepEqual(Object.values(config.designs).reduce((counts,tier)=>(counts[tier]=(counts[tier]||0)+1,counts),{}),{signature:10,esencial:8,luxury:4});
});
test('six commercial prices and Stripe minor units are exact',()=>{
 for(const [design,cop,usd] of [['clasico',129000,49],['nacar',199000,79],['encaje',279000,109]]){
  assert.equal(pricingModule.pricing('COP',design).amount,cop);assert.equal(pricingModule.pricing('USD',design).amount,usd);
 }
 assert.throws(()=>pricingModule.pricing('EUR','nacar'));
 assert.throws(()=>pricingModule.pricing('COP','unknown'));
 assert.equal(pricingModule.pricing('COP','clasico',20000000).amount,200000);
});
