// Runs inside an opaque sandbox. It never receives account credentials or a guest token.
(function(){
 function ready(){
  var p=window.InvitessePublication;if(!p)return;
  document.querySelectorAll('.demo-bar,[data-open-panel],.lz-theme-bar,.lz-palette').forEach(function(e){e.hidden=true;e.style.display='none';});
  var section=document.querySelector('[data-lz-anchor~="rsvp"]') || document.getElementById('rsvp');
  if(section){section.innerHTML='<div style="padding:40px 20px;text-align:center"><h2>'+(p.language==='en'?'RSVP':'Confirmar asistencia')+'</h2><button type="button" id="ivRealReply" style="padding:14px 24px;font:inherit;cursor:pointer">'+(p.language==='en'?'Open family reply':'Abrir respuesta de la familia')+'</button></div>';section.querySelector('button').onclick=function(){parent.postMessage({invitesse:'reply'},'*');};}
 }
 document.addEventListener('DOMContentLoaded',ready);if(document.readyState!=='loading')ready();
})();
