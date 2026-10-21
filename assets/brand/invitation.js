(async function(){
 'use strict';
 var status=document.getElementById('invitationStatus'),frame=document.getElementById('invitationFrame'),q=new URLSearchParams(location.hash.slice(1)),token=q.get('token'),slug=q.get('slug'),data,en=false;

 function unavailable(){status.hidden=false;status.textContent='Esta invitación no está disponible o su enlace ha vencido. / This invitation is unavailable or its link has expired.';frame.hidden=true;}
 function safeImage(v){return typeof v==='string' && (/^\/assets\/[a-zA-Z0-9_./%~-]+$/.test(v) || /^https:\/\//.test(v) || /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(v));}
 async function load(){
  var b=window.InvitesseBackend;if(!b)throw Error('UNAVAILABLE');
  if(/^[a-f0-9]{64}$/.test(token || '') && !slug)data=await b.guests.open(token);
  else if(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug || '') && !token)data=await b.invitations.public(slug);
  else throw Error('INVALID_LINK');
  if(!data || !/^[a-z]{3,16}$/.test(data.design || ''))throw Error('UNAVAILABLE');
  en=data.content.invitationLanguage==='en';document.documentElement.lang=en?'en':'es';
  document.title=(data.content.n1 || '')+' & '+(data.content.n2 || '')+' — Invitesse';
 }
 var sending=false;
 window.addEventListener('message',async function(e){
  if(e.source!==frame.contentWindow || e.origin!=='null' || e.data?.invitesse!=='submit-reply' || sending)return;
  var m=e.data,id=m.requestId;
  if(!token || !/^[a-f0-9-]{36}$/i.test(id||'') || !Array.isArray(m.attendance) || m.attendance.length!==(data.guests||[]).length || m.attendance.some(function(v){return typeof v!=='boolean';}))return;
  sending=true;
  try{
   var answers=data.guests.map(function(g,i){return {id:g.id,attendance:m.attendance[i]?'attending':'declined',dietary_notes:data.content.rsvpDiet===false?'':typeof m.diet==='string'?m.diet.slice(0,1000):g.dietary_notes||''};});
   var message=data.content.rsvpNote===false?'':String(m.message||'').slice(0,2000);
   var result=await window.InvitesseBackend.guests.submit(token,answers,message,data.response.revision,id);
   data.response.revision=result.revision;data.response.message=message;data.guests.forEach(function(g,i){g.attendance=answers[i].attendance;g.dietary_notes=answers[i].dietary_notes;});
   frame.contentWindow.postMessage({invitesse:'reply-result',requestId:id,ok:true},'*');
  }catch(_){frame.contentWindow.postMessage({invitesse:'reply-result',requestId:id,ok:false},'*');}finally{sending=false;}
 });
 try{
  await load();
  var content=JSON.parse(JSON.stringify(data.content));
  for(var key of ['cover','monoImg','musicTrackSrc']){
   if(typeof content[key]==='string' && content[key].startsWith('asset:')){
    var a=await fetch('/api/invitation-asset/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetId:content[key].slice(6),...(token?{guestToken:token}:{slug:slug})})});if(!a.ok)throw Error('UNAVAILABLE');content[key]=(await a.json()).url;
   }
   if(content[key] && !(key==='musicTrackSrc'?(/^\/assets\/[a-zA-Z0-9_./%~-]+$/.test(content[key]) || /^https:\/\//.test(content[key])):safeImage(content[key])))content[key]='';
  }
  content.gallery=await Promise.all((content.gallery || []).map(async function(src){if(typeof src==='string' && src.startsWith('asset:')){var r=await fetch('/api/invitation-asset/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetId:src.slice(6),...(token?{guestToken:token}:{slug:slug})})});if(!r.ok)throw Error('UNAVAILABLE');src=(await r.json()).url;}return safeImage(src)?src:'';}));
  ['hotelLink','giftsRegistryUrl'].forEach(function(k){if(content[k] && !/^https?:\/\//.test(content[k]))content[k]='';});
  (content.events || []).forEach(function(e){if(e.mapUrl && !/^https?:\/\//.test(e.mapUrl))e.mapUrl='';});
  var template=await fetch((en?'/en':'')+'/demo/'+data.design+'/',{cache:'no-store'});if(!template.ok)throw Error('UNAVAILABLE');var html=await template.text();
  html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>Invitesse</title>').replace(/<link\b[^>]*rel=["'](?:canonical|alternate)["'][^>]*>/gi,'').replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
  var payload=JSON.stringify({content:content,language:en?'en':'es',guests:token?(data.guests||[]):[],household:token?data.household:null,response:token?data.response:null,canReply:!!token}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  // sandbox omits allow-same-origin: template code cannot read account cookies/storage.
  var csp="default-src 'none'; script-src https://www.invitesse.com 'unsafe-inline'; style-src https://www.invitesse.com 'unsafe-inline'; img-src https: data: blob:; font-src https://www.invitesse.com; media-src https: blob:; connect-src 'none'; base-uri https://www.invitesse.com; form-action 'none'";
  html=html.replace(/<head>/i,'<head><base href="https://www.invitesse.com/"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="'+csp+'"><script>window.InvitessePublication='+payload+';</script><style>.demo-bar,[data-open-panel],.lz-theme{display:none!important}</style>');
  html=html.replace(/<\/body>/i,'<script src="https://www.invitesse.com/assets/brand/invitation-frame.js"></script></body>');
  frame.srcdoc=html;frame.hidden=false;status.hidden=true;
 }catch(_){unavailable();}
})();
