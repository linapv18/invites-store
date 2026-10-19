(function(){
 'use strict';
 var EN=document.documentElement.lang.slice(0,2)==='en',$=function(id){return document.getElementById(id);};
 var S=EN?{labels:{portada:'Cover',historia:'Our story','el-dia':'The day',preguntas:'Details',viaje:'Travel',confirmacion:'RSVP'},yes:'Yes',no:'No',pending:'Pending',attends:'Attending',declines:'Not attending',missing:'Please choose a reply for this guest.',error:'Please reply for every person on this invitation.',send:'Preview reply',question:'Will you join us?',soon:'See you soon.',miss:'We will miss you.',intro:'Four seats are reserved for your family. Please reply for each person.',done:'Your demo reply is ready. You can edit it here; it has not been saved.',edit:'Edit reply',confirm:'RSVP',contents:'Contents',close:'Close',summary:function(n){return n+' '+(n===1?'guest attending.':'guests attending.');}}:{labels:{portada:'Portada',historia:'Nuestra historia','el-dia':'El día',preguntas:'Detalles',viaje:'Viaje',confirmacion:'Confirmación'},yes:'Sí',no:'No',pending:'Pendiente',attends:'Asiste',declines:'No asiste',missing:'Elige una respuesta para esta persona.',error:'Indica si cada persona de la invitación podrá asistir.',send:'Ver confirmación',question:'¿Nos acompañan?',soon:'Nos vemos pronto.',miss:'Los extrañaremos.',intro:'Tienen cuatro cupos reservados. Confirmen por persona quiénes podrán acompañarnos.',done:'Su respuesta de demostración está lista. Pueden editarla aquí; no se ha guardado.',edit:'Editar confirmación',confirm:'Confirmar asistencia',contents:'Contenido',close:'Cerrar',summary:function(n){return n+' '+(n===1?'persona asistirá.':'personas asistirán.');}};
 var PEOPLE=['Carlos Rodríguez','Lucía Pérez','Sofía Rodríguez','Mateo Rodríguez'];
 LazoPanel.init({mono:'S&T',couple:EN?'Sofía and Tomás':'Sofía y Tomás',link:location.pathname,guest:'Familia Rodríguez',people:PEOPLE});
 LazoMusic.init({src:'/assets/musica/demo.mp3'});
 var mo=$('mo'),env=$('env'),guest=$('guest'),scroller=$('scroller'),nav=$('chapNav'),ticks=$('ticks'),scrim=$('scrim');
 var sections=Array.from(scroller.querySelectorAll(':scope > section')),chapter=-1,saved=null,draft=PEOPLE.map(function(){return null;}),timers=[],scrollRaf;
 var still=matchMedia('(prefers-reduced-motion:reduce)').matches;
 var index=document.createElement('div');index.id='chapterIndex';index.className='mo-index';index.hidden=true;
 index.innerHTML='<div class="mo-index-panel" role="dialog" aria-modal="true" aria-labelledby="indexTitle"><div class="mo-index-head"><h2 class="mo-serif" id="indexTitle" style="font-size:32px">'+S.contents+'</h2><button type="button" class="mo-index-close" aria-label="'+S.close+'"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8"/></svg></button></div><nav aria-label="'+S.contents+'"></nav></div>';
 mo.appendChild(index);
 sections.forEach(function(sec,i){var name=S.labels[sec.dataset.chapter] || sec.getAttribute('aria-label');
  [nav,index.querySelector('nav')].forEach(function(root){var b=document.createElement('button');b.type='button';b.dataset.go=i;b.textContent=name;root.appendChild(b);});
  var t=document.createElement('button');t.type='button';t.dataset.go=i;t.setAttribute('aria-label',name);t.innerHTML='<span></span>';ticks.appendChild(t);
 });
 function visible(sec){return getComputedStyle(sec).display!=='none';}
 function go(i,now){var sec=sections[i];if(!sec||!visible(sec))return;scroller.scrollTo({top:sec.offsetTop,behavior:now||still?'instant':'smooth'});}
 function swapPhoto(i){var imgs=Array.from(mo.querySelectorAll('.mo-side img')),next=imgs.find(function(im){return +im.dataset.ch===i;});if(!next)return;
  function show(){if(chapter!==i)return;imgs.forEach(function(im){im.classList.toggle('is-on',im===next);});}
  if(next.complete&&next.naturalWidth)show();else next.addEventListener('load',show,{once:true});
 }
 function setChapter(i){chapter=i;var key=sections[i].dataset.chapter;mo.dataset.chapter=key;$('sideCap').textContent=S.labels[key];swapPhoto(i);
  mo.querySelectorAll('[data-go]').forEach(function(b){b.setAttribute('aria-current',String(+b.dataset.go===i));});
 }
 function updateChapter(){var marker=scroller.scrollTop+Math.min(scroller.clientHeight*.35,220),i=0;sections.forEach(function(sec,j){if(visible(sec)&&sec.offsetTop<=marker)i=j;});if(i!==chapter)setChapter(i);}
 scroller.addEventListener('scroll',function(){if(scrollRaf)return;scrollRaf=requestAnimationFrame(function(){scrollRaf=0;updateChapter();});},{passive:true});
 window.addEventListener('resize',updateChapter);
 function focusSection(i){var title=sections[i].querySelector('h1,h2')||sections[i];title.tabIndex=-1;title.focus({preventScroll:true});}
 mo.addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(!b)return;var i=+b.dataset.go;if(!index.hidden)closeIndex(false);go(i);focusSection(i);});
 function openIndex(){index.hidden=false;guest.inert=true;$('indexOpen').setAttribute('aria-expanded','true');index.querySelector('.mo-index-close').focus();}
 function closeIndex(restore){index.hidden=true;guest.inert=false;$('indexOpen').setAttribute('aria-expanded','false');if(restore!==false)$('indexOpen').focus({preventScroll:true});}
 $('indexOpen').addEventListener('click',openIndex);index.querySelector('.mo-index-close').addEventListener('click',function(){closeIndex();});index.addEventListener('click',function(e){if(e.target===index)closeIndex();});
 function clear(){timers.forEach(clearTimeout);timers=[];}
 function enter(focus){clear();env.hidden=true;env.inert=true;env.setAttribute('aria-hidden','true');env.classList.remove('is-busy','is-open');guest.hidden=false;guest.inert=false;scroller.scrollTo({top:0,behavior:'instant'});setChapter(0);if(focus)focusSection(0);}
 function envelope(focus){clear();if(!index.hidden)closeIndex(false);if(!scrim.hidden)closeSheet(false);guest.hidden=true;env.hidden=false;env.inert=false;env.removeAttribute('aria-hidden');env.classList.remove('is-busy','is-open');if(focus)$('seal').focus();}
 $('seal').addEventListener('click',function(){if(env.classList.contains('is-busy'))return;clear();LazoMusic.play();env.classList.add('is-busy');
  if(still){env.style.transition='opacity .18s';env.style.opacity='0';timers.push(setTimeout(function(){enter(true);env.style.opacity='';},180));return;}
  timers.push(setTimeout(function(){guest.hidden=false;guest.inert=true;scroller.scrollTo({top:0,behavior:'instant'});setChapter(0);env.classList.add('is-open');},200));
  timers.push(setTimeout(function(){enter(true);},1850));
 });
 $('showEnv').addEventListener('click',function(){envelope(true);});
 window.LzTemplate={open:function(){enter(false);},envelope:function(){envelope(false);},scroll:function(el,now){var sec=el.closest('section')||el,i=sections.indexOf(sec);if(i>=0)go(i,now);}};
 mo.querySelectorAll('[data-acc]').forEach(function(acc){function setOpen(item,open){item.classList.toggle('is-open',open);item.querySelector('button').setAttribute('aria-expanded',String(open));item.lastElementChild.hidden=!open;}
  acc.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.parentNode.parentNode!==acc)return;var item=b.parentNode,open=!item.classList.contains('is-open');acc.querySelectorAll(':scope > .mo-faq').forEach(function(f){setOpen(f,false);});if(open)setOpen(item,true);});
  acc.addEventListener('lz-render',function(){acc.querySelectorAll(':scope > .mo-faq').forEach(function(f,i){setOpen(f,i===0);});});
 });
 $('dressBtn').addEventListener('click',function(){var open=!$('dress').classList.contains('is-open');$('dress').classList.toggle('is-open',open);this.setAttribute('aria-expanded',String(open));$('dressBody').hidden=!open;});
 var target=LazoTime.target('2027-06-12','16:00','America/Mexico_City'),cd={};mo.querySelectorAll('[data-cd]').forEach(function(e){cd[e.dataset.cd]=e;});
 function tick(){if(!Number.isFinite(target)){Object.keys(cd).forEach(function(k){cd[k].textContent='—';});return;}var s=Math.max(0,Math.floor((target-Date.now())/1000)),pad=function(n){return String(n).padStart(2,'0');};cd.d.textContent=Math.floor(s/86400);cd.h.textContent=pad(Math.floor(s/3600)%24);cd.m.textContent=pad(Math.floor(s/60)%60);cd.s.textContent=pad(s%60);}
 function sync(){var c=window.LazoContent&&LazoContent.current?LazoContent.current():null;
  if(c){var events=c.events||[],ev=events.find(function(e){return e.id===c.countdownId;})||events[0];target=c.date?LazoTime.target(c.date,ev&&ev.time||'00:00',c.timeZone||'America/Mexico_City'):NaN;}
  var gallery=Array.isArray(window.LZ_GALLERY)?window.LZ_GALLERY:mo.querySelectorAll('.mo-story img');mo.querySelector('.mo-gallery-total').textContent=gallery.length?'('+gallery.length+')':'';mo.querySelector('.mo-gallery-open').hidden=!gallery.length;
  var booking=mo.querySelector('[data-lz-href=hotelLink]'),valid=!!(c&&/^https?:\/\//.test(c.hotelLink||''));booking.hidden=!valid;var note=mo.querySelector('.mo-booking-demo');if(note)note.hidden=valid;
  sections.forEach(function(sec,i){mo.querySelectorAll('[data-go="'+i+'"]').forEach(function(b){b.hidden=!visible(sec);});});
  var title=mo.querySelector('.mo-cover h1');title.classList.toggle('long-names',Array.from(title.querySelectorAll('[data-lz]')).some(function(n){return n.textContent.trim().length>11;}));
  mo.querySelector('.mo-cover img').alt=EN?'Portrait of the couple':'Retrato de la pareja';mo.querySelector('.mo-story-photo img').alt=EN?'A moment from our story':'Un momento de nuestra historia';
  updateChapter();tick();
 }
 document.addEventListener('lz-content-applied',sync);document.addEventListener('lz-render',sync);
 function renderList(){var box=$('peopleList');box.textContent='';PEOPLE.forEach(function(n,i){var att=saved?saved[i]:null,row=document.createElement('div');row.className='mo-person';var name=document.createElement('span'),status=document.createElement('span');name.textContent=n;status.className='mo-status';status.textContent=att===null?S.pending:att?S.attends:S.declines;row.append(name,status);box.appendChild(row);});var yes=saved?saved.filter(Boolean).length:0;$('rsTitle').textContent=!saved?S.question:yes?S.soon:S.miss;$('rsText').textContent=saved?S.done:S.intro;$('rsOpen').textContent=saved?S.edit:S.confirm;}
 // Stable controls retain focus and expose errors next to each unanswered guest.
 PEOPLE.forEach(function(n,i){var row=document.createElement('div');row.className='mo-person';var name=document.createElement('span');name.id='seat'+i;name.textContent=n;var sw=document.createElement('div');sw.className='mo-switch';sw.setAttribute('role','group');sw.setAttribute('aria-labelledby',name.id);sw.setAttribute('aria-describedby','mo-error-'+i);
  [[S.yes,true],[S.no,false]].forEach(function(option){var b=document.createElement('button');b.type='button';b.textContent=option[0];b.setAttribute('aria-pressed','false');b.addEventListener('click',function(){draft[i]=option[1];renderSwitches();});sw.appendChild(b);});
  var err=document.createElement('p');err.id='mo-error-'+i;err.className='mo-person-error';err.textContent=S.missing;err.hidden=true;row.append(name,sw,err);$('switches').appendChild(row);
 });
 function renderSwitches(){Array.from($('switches').children).forEach(function(row,i){var sw=row.querySelector('.mo-switch');sw.classList.toggle('is-yes',draft[i]===true);sw.classList.toggle('is-no',draft[i]===false);sw.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-pressed',String(draft[i]===(j===0)));});if(draft[i]!==null){row.classList.remove('is-error');row.querySelector('.mo-person-error').hidden=true;sw.removeAttribute('aria-invalid');}});$('dietField').hidden=!draft.some(Boolean);if(draft.every(function(a){return a!==null;}))$('sheetErr').hidden=true;}
 function resetErrors(){$('sheetErr').hidden=true;$('switches').querySelectorAll('.mo-person').forEach(function(row){row.classList.remove('is-error');row.querySelector('.mo-person-error').hidden=true;row.querySelector('.mo-switch').removeAttribute('aria-invalid');});}
 function renderThanks(){var yes=saved.filter(Boolean).length;$('thanksText').textContent=S.summary(yes)+' '+S.done;var list=$('thanksList');list.textContent='';PEOPLE.forEach(function(n,i){var row=document.createElement('div');row.className='mo-person';var name=document.createElement('span'),status=document.createElement('span');name.textContent=n;status.className='mo-status';status.textContent=saved[i]?S.attends:S.declines;row.append(name,status);list.appendChild(row);});}
 function openSheet(){draft=saved?saved.slice():PEOPLE.map(function(){return null;});resetErrors();$('sheetForm').hidden=!!saved;$('sheetThanks').hidden=!saved;if(saved)renderThanks();renderSwitches();scrim.hidden=false;guest.inert=true;document.body.classList.add('sheet-open');$('sheetClose').focus();}
 function closeSheet(restore){scrim.hidden=true;guest.inert=false;document.body.classList.remove('sheet-open');if(restore!==false)$('rsOpen').focus({preventScroll:true});}
 $('rsOpen').addEventListener('click',openSheet);$('sheetClose').addEventListener('click',closeSheet);$('scrimClose').addEventListener('click',closeSheet);$('thanksBack').addEventListener('click',closeSheet);
 $('thanksEdit').addEventListener('click',function(){draft=saved.slice();$('sheetThanks').hidden=true;$('sheetForm').hidden=false;resetErrors();renderSwitches();$('switches').querySelector('button').focus();});
 $('allYes').addEventListener('click',function(){draft=PEOPLE.map(function(){return true;});renderSwitches();});
 $('sheetSend').textContent=S.send;
 $('sheetSend').addEventListener('click',function(){var missing=draft.indexOf(null);if(missing!==-1){$('sheetErr').textContent=S.error;$('sheetErr').hidden=false;Array.from($('switches').children).forEach(function(row,i){var bad=draft[i]===null;row.classList.toggle('is-error',bad);row.querySelector('.mo-person-error').hidden=!bad;if(bad)row.querySelector('.mo-switch').setAttribute('aria-invalid','true');});$('switches').children[missing].querySelector('button').focus();return;}
  saved=draft.slice();LazoPanel.setResponse(saved,mo.querySelector('#sheetForm textarea[maxlength="2000"]').value.trim());renderList();renderThanks();$('sheetForm').hidden=true;$('sheetThanks').hidden=false;$('sheetThanks').tabIndex=-1;$('sheetThanks').focus();
 });
 function trap(e,root){var items=Array.from(root.querySelectorAll('button:not([disabled]),a[href],textarea,input,[tabindex="0"]')).filter(function(el){return !el.closest('[hidden],[inert]')&&el.getClientRects().length&&el.tabIndex>=0;});if(!items.length)return;var first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){e.preventDefault();first.focus();}}
 document.addEventListener('keydown',function(e){if(document.body.classList.contains('panel-open')||document.body.classList.contains('viewer-open'))return;if(e.key==='Escape'){if(!index.hidden)closeIndex();else if(!scrim.hidden)closeSheet();return;}if(e.key==='Tab'){if(!index.hidden)trap(e,index);else if(!scrim.hidden)trap(e,mo.querySelector('.mo-sheet'));else if(!env.hidden&&env.contains(document.activeElement))trap(e,env);}});
 renderList();renderSwitches();sync();setInterval(tick,1000);
})();
