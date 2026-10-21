// Runs inside an opaque sandbox; only the parent possesses the private guest token.
(function(){
 function ready(){
  var p=window.InvitessePublication;if(!p||document.documentElement.dataset.replyBound)return;document.documentElement.dataset.replyBound='true';
  var en=p.language==='en',pending=null,replaying=false;
  document.querySelectorAll('.demo-bar,[data-open-panel],.lz-theme-bar,.lz-palette,.demo-note,.r-demo').forEach(function(e){e.hidden=true;e.style.display='none';});
  // A <base> is required for assets, so fragment links must scroll locally explicitly.
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href').slice(1),target=document.getElementById(id);e.preventDefault();if(!target)return;if(window.LzTemplate?.scroll)window.LzTemplate.scroll(target,matchMedia('(prefers-reduced-motion:reduce)').matches);else target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});},true);
  var section=document.querySelector('[data-lz-anchor~="rsvp"]')||document.getElementById('rsvp');if(!section)return;
  var save=document.getElementById('rsSave')||document.getElementById('sheetSend')||section.querySelector('button[type=submit]'),form=document.getElementById('rsvpForm')||section.querySelector('form'),people=document.getElementById('people')||document.getElementById('switches');
  var notice=document.createElement('p');notice.setAttribute('role','status');notice.hidden=true;notice.style.cssText='margin:16px 0;line-height:1.6';(save?.parentNode||section).appendChild(notice);
  if(window.LazoPanel)window.LazoPanel.setResponse=function(){};
  function rows(){return people?Array.from(people.children).filter(function(r){return r.querySelector('input[type=radio],button[aria-pressed]');}):[];}
  function choices(row){return Array.from(row.querySelectorAll('input[type=radio],button[aria-pressed]'));}
  function prefill(){rows().forEach(function(row,i){var g=p.guests[i];if(!g||!g.attendance)return;var opts=choices(row),el=opts[g.attendance==='attending'?0:1];if(el&&!opts.some(function(o){return o.checked||o.getAttribute('aria-pressed')==='true';})){el.click();}});}
  var note=document.getElementById('note')||document.getElementById('msg')||document.querySelector('#sheetForm textarea[maxlength="2000"]');if(note)note.value=p.response?.message||'';
  var diet=document.getElementById('diet')||document.querySelector('[data-lz-show="rsvpDiet"] input,[data-lz-show="rsvpDiet"] textarea,#dietField input,#dietField textarea');if(diet)diet.value=Array.from(new Set(p.guests.map(function(g){return g.dietary_notes||'';}).filter(Boolean))).join('\n');
  var initialDiet=diet?.value||'';
  function personalize(){
   var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),node;
   while((node=walker.nextNode())){
    if(node.parentElement.closest('script,style,[data-lz]'))continue;
    node.nodeValue=node.nodeValue.replace(/The Rodríguez family|Rodríguez family|Familia Rodríguez/g,function(){return p.household?.name||(en?'Your guests':'Sus invitados');}).replace(/\b4 (cupos|seats|lugares|guests|personas)\b/g,function(_,word){return p.guests.length+' '+(p.guests.length===1?({cupos:'cupo',seats:'seat',lugares:'lugar',guests:'guest',personas:'persona'}[word]):word);});
   }
  }
  personalize();
  if(!p.canReply){notice.hidden=false;notice.textContent=en?'Ask the couple for your family’s private link to RSVP.':'Soliciten a los novios el enlace privado de su familia para confirmar asistencia.';if(save)save.disabled=true;}
  prefill();document.getElementById('rsOpen')?.addEventListener('click',function(){queueMicrotask(function(){prefill();personalize();});});
  function intercept(e){
   if(replaying)return;
   if(!p.canReply||pending){e.preventDefault();e.stopImmediatePropagation();return;}
   var attendance=rows().map(function(row){var opts=choices(row),index=opts.findIndex(function(o){return o.checked||o.getAttribute('aria-pressed')==='true';});return index<0?null:index===0;});
   // Keep the template's existing per-person validation and focus handling.
   if(attendance.length!==p.guests.length||attendance.some(function(v){return v===null;}))return;
   e.preventDefault();e.stopImmediatePropagation();
   var signature=JSON.stringify([attendance,note?.value||'',diet?.value||'']);
   var id=signature===intercept.signature?intercept.requestId:crypto.randomUUID();intercept.signature=signature;intercept.requestId=id;
   pending={id:id,type:e.type,target:e.currentTarget};if(save)save.disabled=true;notice.hidden=false;notice.textContent=en?'Saving your reply…':'Guardando su respuesta…';
   parent.postMessage({invitesse:'submit-reply',requestId:id,attendance:attendance,message:note?.value||'',diet:diet&&diet.value!==initialDiet?diet.value:undefined},'*');
  }
  if(save)save.addEventListener('click',intercept,true);if(form)form.addEventListener('submit',intercept,true);
  window.addEventListener('message',function(e){if(e.source!==parent||e.data?.invitesse!=='reply-result'||!pending||e.data.requestId!==pending.id)return;var action=pending;pending=null;if(save)save.disabled=false;
   if(!e.data.ok){notice.textContent=en?'Your reply could not be saved. Please try again.':'No se pudo guardar su respuesta. Intenten de nuevo.';return;}
   notice.textContent=en?'Your reply has been saved.':'Su respuesta quedó guardada.';replaying=true;
   try{if(action.type==='submit')action.target.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));else action.target.click();}finally{replaying=false;personalize();}
   // One successful submission gets one identity; retries after an uncertain response reuse it.
   intercept.signature=null;intercept.requestId=null;
  });
  // Restore the template's own receipt without submitting another response.
  // Newly added or unanswered guests still need the form, even on an older response.
  if(p.canReply && Number(p.response?.revision)>0 && p.guests.length && p.guests.every(function(g){return g.attendance==='attending'||g.attendance==='declined';})){
   replaying=true;
   try{if(form)form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));else if(save)save.click();}finally{replaying=false;personalize();}
  }

 }
 document.addEventListener('DOMContentLoaded',ready);if(document.readyState!=='loading')ready();
})();
