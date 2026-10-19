(function () {
  'use strict';
  var EN = document.documentElement.lang.slice(0, 2) === 'en';
  var $ = function (id) { return document.getElementById(id); };
  var S = EN ? {
    yes:'Attending', no:'Not attending', missing:'Choose a reply for this guest.', error:'Please reply for every person on this invitation.',
    hint:'Touch the seal to open your invitation', opened:'A letter for you.', summary:'Your demo reply', ready:'Thank you, Familia Rodríguez!',
    count:function(n){return n+' '+(n===1?'guest attending':'guests attending');}, saved:'This is a preview. Your reply has not been saved.'
  } : {
    yes:'Asistirá', no:'No asistirá', missing:'Elige una respuesta para esta persona.', error:'Indica si cada persona de la invitación podrá asistir.',
    hint:'Toca el sello para abrir tu invitación', opened:'Una carta para ustedes.', summary:'Tu respuesta de demostración', ready:'¡Gracias, Familia Rodríguez!',
    count:function(n){return n+' '+(n===1?'persona asistirá':'personas asistirán');}, saved:'Esta es una vista previa. Tu respuesta no se ha guardado.'
  };
  var PEOPLE = ['Carlos Rodríguez','Lucía Pérez','Sofía Rodríguez','Mateo Rodríguez'];
  LazoPanel.init({mono:'V&M',couple:EN?'Valentina and Martín':'Valentina y Martín',link:location.pathname,guest:'Familia Rodríguez',people:PEOPLE});
  LazoMusic.init({src:'/assets/musica/demo.mp3'});
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cover=$('cover'), invitation=$('invitation'), letter=$('letter'), seal=$('seal'), replay=$('replay'), openingTimer;
  var menu=$('mobileMenu'), menuOpen=$('menuOpen'), menuClose=$('menuClose');
  // The menu remains available when its surrounding invitation is inert.
  document.body.appendChild(menu);
  var menuVisible=false;
  function showMenu(open, restore) {
    menuVisible=open; menu.hidden=!open; menuOpen.setAttribute('aria-expanded',String(open));
    invitation.inert=open || !cover.classList.contains('gone');
    document.body.style.overflow=open?'hidden':'';
    if(open) menuClose.focus(); else if(restore!==false) menuOpen.focus({preventScroll:true});
  }
  function setOpen(open) {
    clearTimeout(openingTimer); cover.classList.toggle('is-open',open); letter.inert=true;
    letter.setAttribute('aria-hidden',String(!open)); seal.disabled=open; replay.hidden=!open;
    $('hint').textContent=open?S.opened:S.hint;
    if(open) openingTimer=setTimeout(function(){
      letter.inert=false; $('enter').focus({preventScroll:true});
    },still?0:1750);
    else { cover.scrollTop=0; }
  }
  function enter(focus) {
    clearTimeout(openingTimer); cover.classList.add('gone'); cover.inert=true;
    cover.setAttribute('aria-hidden','true'); invitation.inert=false;
    document.body.classList.remove('locked'); $('demoBar').hidden=false; window.scrollTo(0,0);
    if(focus!==false){var title=document.querySelector('.hero-title');title.tabIndex=-1;title.focus({preventScroll:true});}
    reveal();
  }
  window.LzTemplate={
    open:function(){enter(false);},
    envelope:function(){showMenu(false,false);setOpen(false);cover.classList.remove('gone');cover.inert=false;cover.removeAttribute('aria-hidden');invitation.inert=true;document.body.classList.add('locked');window.scrollTo(0,0);},
    scroll:function(el,now){window.scrollTo({top:el.getBoundingClientRect().top+scrollY-80,behavior:now||still?'instant':'smooth'});}
  };
  seal.addEventListener('click',function(){setOpen(true);LazoMusic.play();});
  replay.addEventListener('click',function(){setOpen(false);seal.focus();});
  $('enter').addEventListener('click',function(){enter(true);});
  menuOpen.addEventListener('click',function(){showMenu(true);});
  menuClose.addEventListener('click',function(){showMenu(false);});
  menu.querySelectorAll('nav a').forEach(function(a){a.addEventListener('click',function(){showMenu(false,false);var t=document.querySelector(a.hash);if(t){t.tabIndex=-1;t.focus({preventScroll:true});}});});
  function trap(e,root){
    var els=Array.from(root.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex="0"]')).filter(function(el){return !el.closest('[inert],[hidden]')&&el.getClientRects().length;});
    if(!els.length)return;
    var first=els[0],last=els[els.length-1];
    if(e.shiftKey && (document.activeElement===first||!root.contains(document.activeElement))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){e.preventDefault();first.focus();}
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&menuVisible){showMenu(false);return;}
    if(e.key!=='Tab')return;
    if(menuVisible)trap(e,menu);
    else if(!cover.classList.contains('gone')&&cover.contains(document.activeElement))trap(e,cover);
  });
  // A fixed venue timezone keeps the same instant for every guest.
  var cd={};document.querySelectorAll('[data-cd]').forEach(function(e){cd[e.dataset.cd]=e;});
  var target=LazoTime.target('2026-12-12','19:30','America/Mexico_City');
  function content(){return window.LazoContent&&LazoContent.current?LazoContent.current():null;}
  function sync(){
    var c=content();
    if(c){var events=c.events||[],ev=events.find(function(e){return e.id===c.countdownId;})||events[0];target=c.date?LazoTime.target(c.date,ev&&ev.time||'00:00',c.timeZone||'America/Mexico_City'):NaN;}
    var booking=document.querySelector('[data-lz-href="hotelLink"]'),valid=!!(c&&/^https?:\/\//.test(c.hotelLink||''));
    booking.hidden=!valid;var demo=document.querySelector('.booking-demo');if(demo)demo.hidden=valid;
    var list=Array.isArray(window.LZ_GALLERY)?window.LZ_GALLERY:document.querySelectorAll('#historia img');
    document.querySelector('.story-thumbs').classList.toggle('has-story-photo',Array.isArray(window.LZ_GALLERY)&&window.LZ_GALLERY.length>1);
    var total=list.length;document.querySelector('.gallery-count').textContent=total?'('+total+')':'';
    var visible=document.querySelector('.story-thumbs').querySelectorAll(':scope > [data-lz-item]').length;
    document.querySelector('.gallery-open').hidden=total<=visible;
    var brand=document.querySelector('.nav-brand');if(c&&c.n1&&c.n2)brand.setAttribute('aria-label',c.n1+(EN?' and ':' y ')+c.n2+(EN?', home':', inicio'));
    var nm=document.querySelector('.hero-title');nm.classList.toggle('long-names',Array.from(nm.querySelectorAll('[data-lz]')).some(function(n){return n.textContent.trim().length>11;}));
    document.querySelectorAll('.photo[data-lz-src]').forEach(function(img){img.alt=EN?'A moment from our story':'Un momento de nuestra historia';});
    tick();observe();
  }
  function tick(){
    if(!Number.isFinite(target)){Object.keys(cd).forEach(function(k){cd[k].textContent='—';});return;}
    var s=Math.max(0,Math.floor((target-Date.now())/1000)),pad=function(n){return String(n).padStart(2,'0');};
    cd.d.textContent=pad(Math.floor(s/86400));cd.h.textContent=pad(Math.floor(s/3600)%24);cd.m.textContent=pad(Math.floor(s/60)%60);cd.s.textContent=pad(s%60);
  }
  var io;
  function observe(){if(io)document.querySelectorAll('.cl-reveal:not(.in)').forEach(function(el){io.observe(el);});}
  function reveal(){
    document.querySelectorAll('.story-image,.story-copy,.venue-keepsake,.schedule-heading,.travel-grid>div,.quote-section blockquote').forEach(function(el){el.classList.add('cl-reveal');});
    if(still||!window.IntersectionObserver){document.querySelectorAll('.cl-reveal').forEach(function(el){el.classList.add('in');});return;}
    if(!io)io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.08});
    observe();
  }
  document.addEventListener('lz-content-applied',sync);
  document.addEventListener('lz-render',sync);
  // A stable set of controls preserves keyboard focus while a reply changes.
  var att=PEOPLE.map(function(){return null;}),form=$('rsvpForm'),thanks=$('thanks'),people=$('people');
  PEOPLE.forEach(function(name,i){
    var row=document.createElement('div');row.className='person';row.setAttribute('role','group');row.setAttribute('aria-label',name);row.setAttribute('aria-describedby','cl-error-'+i);
    var label=document.createElement('span');label.textContent=name;row.appendChild(label);
    var options=document.createElement('div');
    [S.yes,S.no].forEach(function(text,j){var button=document.createElement('button');button.type='button';button.textContent=text;button.setAttribute('aria-pressed','false');
      button.addEventListener('click',function(){att[i]=j===0;renderReplies();});options.appendChild(button);});
    row.appendChild(options);var error=document.createElement('p');error.className='person-error';error.id='cl-error-'+i;error.textContent=S.missing;error.hidden=true;row.appendChild(error);people.appendChild(row);
  });
  function renderReplies(){
    Array.from(people.children).forEach(function(row,i){Array.from(row.querySelectorAll('button')).forEach(function(button,j){button.setAttribute('aria-pressed',String(att[i]===(j===0)));});if(att[i]!==null){row.classList.remove('is-error');row.querySelector('.person-error').hidden=true;row.removeAttribute('aria-invalid');}});
    $('yesFields').hidden=!att.some(Boolean);if(att.every(function(a){return a!==null;}))$('formErr').hidden=true;
  }
  form.querySelectorAll('[data-all]').forEach(function(button){button.addEventListener('click',function(){att=PEOPLE.map(function(){return button.dataset.all==='1';});renderReplies();});});
  form.addEventListener('submit',function(e){
    e.preventDefault();var missing=att.indexOf(null);
    if(missing!==-1){$('formErr').hidden=false;$('formErr').textContent=S.error;Array.from(people.children).forEach(function(row,i){var bad=att[i]===null;row.classList.toggle('is-error',bad);row.querySelector('.person-error').hidden=!bad;if(bad)row.setAttribute('aria-invalid','true');});people.children[missing].querySelector('button').focus();return;}
    thanks.querySelector('.eyebrow').textContent=S.summary;thanks.querySelector('h3').textContent=S.ready;
    var text=$('thanksText');text.textContent=S.count(att.filter(Boolean).length)+'. '+S.saved;
    var list=document.createElement('ul');list.className='reply-summary';
    PEOPLE.forEach(function(name,i){var li=document.createElement('li'),n=document.createElement('strong'),reply=document.createElement('span');n.textContent=name;reply.textContent=att[i]?S.yes:S.no;li.append(n,reply);list.appendChild(li);});var previous=thanks.querySelector('.reply-summary');if(previous)previous.remove();text.after(list);
    LazoPanel.setResponse(att,$('msg').value.trim());form.hidden=true;thanks.hidden=false;thanks.tabIndex=-1;thanks.focus();
  });
  $('editRsvp').addEventListener('click',function(){thanks.hidden=true;form.hidden=false;people.querySelector('button').focus();});
  renderReplies();sync();setInterval(tick,1000);
})();
