(async function(){
 'use strict';
 var status=document.getElementById('invitationStatus'),frame=document.getElementById('invitationFrame'),dialog=document.getElementById('replyDialog'),reply=document.getElementById('guestReply'),q=new URLSearchParams(location.hash.slice(1)),token=q.get('token'),slug=q.get('slug'),data,en=false;
 var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
 document.getElementById('closeReply').onclick=function(){dialog.close();};
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
 function renderReply(){
  if(!token){reply.innerHTML='<p>'+(en?'Please ask the couple for your family’s personal link to RSVP.':'Soliciten a los novios el enlace personal de su familia para confirmar asistencia.')+'</p>';return;}
  var guests=data.guests || [];
  reply.innerHTML='<h2>'+esc(data.household.name)+'</h2><form id="ivReply">'+guests.map(function(g,i){return '<fieldset><legend>'+esc(g.name)+'</legend><label><input type="radio" required name="attendance'+i+'" value="attending"'+(g.attendance==='attending'?' checked':'')+'> '+(en?'Attending':'Asiste')+'</label><label><input type="radio" required name="attendance'+i+'" value="declined"'+(g.attendance==='declined'?' checked':'')+'> '+(en?'Not attending':'No asiste')+'</label>'+(data.content.rsvpDiet!==false?'<label>'+(en?'Dietary requirements':'Restricciones alimentarias')+'<input maxlength="1000" name="diet'+i+'" value="'+esc(g.dietary_notes || '')+'"></label>':'')+'</fieldset>';}).join('')+(data.content.rsvpNote!==false?'<label>'+(en?'Message':'Mensaje')+'<textarea name="message" maxlength="2000">'+esc(data.response.message || '')+'</textarea></label>':'')+'<button type="submit">'+(en?'Save reply':'Guardar respuesta')+'</button><p id="replyNotice" role="status"></p></form>';
  var form=reply.querySelector('form'),requestId=crypto.randomUUID();
  form.addEventListener('input',function(){requestId=crypto.randomUUID();});
  form.onsubmit=async function(e){e.preventDefault();var button=form.querySelector('button'),notice=reply.querySelector('#replyNotice');button.disabled=true;try{
   var fd=new FormData(form),answers=guests.map(function(g,i){return {id:g.id,attendance:fd.get('attendance'+i),dietary_notes:fd.get('diet'+i) || ''};});
   var result=await window.InvitesseBackend.guests.submit(token,answers,fd.get('message') || '',data.response.revision,requestId);
   data.response.revision=result.revision;data.response.message=fd.get('message') || '';guests.forEach(function(g,i){g.attendance=answers[i].attendance;g.dietary_notes=answers[i].dietary_notes;});requestId=crypto.randomUUID();
   notice.textContent=en?'Your reply has been saved.':'Su respuesta quedó guardada.';
  }catch(_){notice.textContent=en?'Unable to save. Reopen the invitation to load the latest reply and try again.':'No se pudo guardar. Vuelvan a abrir la invitación para cargar la última respuesta y reintenten.';}button.disabled=false;};
 }
 window.addEventListener('message',function(e){if(e.source!==frame.contentWindow || e.origin!=='null' || e.data?.invitesse!=='reply')return;renderReply();dialog.showModal();});
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
  var payload=JSON.stringify({content:content,language:en?'en':'es'}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  // sandbox omits allow-same-origin: template code cannot read account cookies/storage.
  var csp="default-src 'none'; script-src https://www.invitesse.com 'unsafe-inline'; style-src https://www.invitesse.com 'unsafe-inline'; img-src https: data: blob:; font-src https://www.invitesse.com; media-src https: blob:; connect-src 'none'; base-uri https://www.invitesse.com; form-action 'none'";
  html=html.replace(/<head>/i,'<head><base href="https://www.invitesse.com/"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="'+csp+'"><script>window.InvitessePublication='+payload+';</script><style>.demo-bar,[data-open-panel],.lz-theme{display:none!important}</style>');
  html=html.replace(/<\/body>/i,'<script src="https://www.invitesse.com/assets/brand/invitation-frame.js"></script></body>');
  frame.srcdoc=html;frame.hidden=false;status.hidden=true;
 }catch(_){unavailable();}
})();
