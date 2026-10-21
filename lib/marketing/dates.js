(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MarketingDates=factory();})(typeof window!=='undefined'?window:this,function(){
 const ZONE='America/Bogota';
 function toLocal(value){return new Intl.DateTimeFormat('sv-SE',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value)).replace(' ','T');}
 function localDate(value){if(!/^\d{4}-\d\d-\d\d(?:T\d\d:\d\d)?$/.test(value||''))throw Error('INVALID_MARKETING_INPUT');const date=new Date(value.length===10?value+'T00:00:00-05:00':value+':00-05:00');if(!Number.isFinite(+date)||toLocal(date).slice(0,value.length)!==value)throw Error('INVALID_MARKETING_INPUT');return date.toISOString();}
 return {ZONE,toLocal,localDate};
});
