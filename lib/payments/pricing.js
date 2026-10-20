const {tiers,designs}=require('./prices.json');
function pricing(currency,design,minor) {
 const tier=designs[design];
 if(!tier || !['COP','USD'].includes(currency)) throw Error('PRODUCT_UNAVAILABLE');
 return {currency,tier,amount:minor===undefined?tiers[tier][currency]:minor/100};
}
function catalogPrices(currency) {
 return Object.fromEntries(Object.keys(designs).map(design=>[design,pricing(currency,design)]));
}
module.exports={pricing,catalogPrices};
