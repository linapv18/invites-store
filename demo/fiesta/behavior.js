
(function () {
  var S = window.FiestaS, $ = function (id) { return document.getElementById(id); };
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var COLOR_KEYS = ['--pink','--orange','--yellow','--teal','--blue','--green'];
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function contentFit(){
    document.querySelector('.lback').classList.toggle('long-names',[].some.call(document.querySelectorAll('.lback [data-lz=n1],.lback [data-lz=n2]'),function(e){return e.textContent.length>11;}));
    var a=document.querySelector('[data-lz-href=hotelLink]'),n=document.querySelector('.demo-booking');if(a.getAttribute('href')==='#viaje')a.hidden=true;n.hidden=!a.hidden;
  }
  document.addEventListener('lz-render',contentFit);contentFit();

  // Cartas de lotería de la galería con su número y nombre (también cuando el editor cambia la galería).
  function captions() { document.querySelectorAll('.cards3 .mini').forEach(function (el, i) { var c = S.caps[i % S.caps.length]; el.querySelector('.n').textContent = i<3?c[0]:String(i+1); el.querySelector('.t').textContent = c[1]; }); }

  // Lo que aparece al llegar a la pantalla (después de abrir la invitación).
  var io = null;
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv]').forEach(function (el) { el.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .18 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { captions(); observe(e.target); });
  captions();

  function burst(x, y, n) {
    if (still || !Element.prototype.animate) return;
    var theme=getComputedStyle(document.documentElement),cols=COLOR_KEYS.map(function(k){return theme.getPropertyValue(k).trim();});
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 210, w = 5 + Math.random() * 6, dx = Math.cos(a) * d, dy = Math.sin(a) * d;
      p.className = 'conf'; p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + (w * (Math.random() < .5 ? 2 : 1)).toFixed(1) + 'px;background:' + cols[i % cols.length] + ';' + (Math.random() < .3 ? 'border-radius:50%' : '');
      var layer=document.querySelector('.confetti-layer');if(!layer){layer=document.createElement('div');layer.className='confetti-layer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);}layer.appendChild(p);
      p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(' + Math.random() * 720 + 'deg)', opacity: 1, offset: .5 }, { transform: 'translate(calc(-50% + ' + dx * 1.1 + 'px), calc(-50% + ' + (dy + 260) + 'px)) rotate(' + Math.random() * 1080 + 'deg)', opacity: 0 }], { duration: 1700 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(p);
    }
  }

  // Nombres y fecha al consultar las secciones inferiores.
  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520); });
  }, { passive: true });

  // Apertura: la carta de lotería se voltea; al entrar, el papel picado se levanta y estalla el confeti.
  var op=$('open'),card=$('card'),hint=$('hint'),timer=null,entering=false;
  function flip(){
    if(card.classList.contains('flip'))return;
    LazoMusic.play();card.classList.add('flip');$('flipCard').disabled=true;$('flipCard').inert=true;$('flipCard').tabIndex=-1;hint.textContent=S.loteria;
    timer=setTimeout(function(){document.querySelector('.lback').inert=false;$('enter').disabled=false;$('enter').tabIndex=0;$('enter').focus({preventScroll:true});},still?0:650);
  }
  $('flipCard').addEventListener('click',flip);
  function enter(){clearTimeout(timer);opened=true;op.classList.add('gone');op.inert=true;$('invite').inert=false;document.body.classList.remove('locked');watch();}
  $('enter').addEventListener('click',function(){
    if(entering)return;entering=true;var r=this.getBoundingClientRect();op.classList.add('party');enter();burst(r.left+r.width/2,r.top,28);window.scrollTo(0,0);var h=document.querySelector('.hero h1');h.tabIndex=-1;h.focus({preventScroll:true});
  });
  window.LzTemplate={
    open:function(){card.classList.add('flip');enter();},
    envelope:function(){clearTimeout(timer);entering=false;opened=false;bar.classList.remove('show');card.classList.remove('flip');$('flipCard').disabled=false;$('flipCard').inert=false;$('flipCard').tabIndex=0;document.querySelector('.lback').inert=true;$('enter').disabled=true;$('enter').tabIndex=-1;hint.textContent=S.hint;op.classList.remove('gone','party');op.inert=false;$('invite').inert=true;document.body.classList.add('locked');window.scrollTo(0,0);},
    scroll:function(el,now){window.scrollTo({top:el.getBoundingClientRect().top+scrollY-70,behavior:now||still?'instant':'smooth'});}
  };
  // Only animate visible parts of the invitation; decorative loops stop off screen.
  function motion(){
    if(!('IntersectionObserver' in window))return;
    var mo=new IntersectionObserver(function(entries){entries.forEach(function(e){e.target.classList.toggle('motion-active',e.isIntersecting);});});
    document.querySelectorAll('.picado,.cinta,.lart,.countdown').forEach(function(e){mo.observe(e);});
  }
  motion();
  document.addEventListener('visibilitychange',function(){document.documentElement.classList.toggle('motion-paused',document.hidden);});

  // Cuenta regresiva en la tabla: cada número salta como un frijolito al cambiar.
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function set(el, t) { if (el.textContent === t) return; if (!still && el.dataset.cd !== 's' && document.querySelector('.countdown').classList.contains('motion-active') && el.textContent !== '--' && el.animate) el.animate([{ transform: 'scale(1.5) rotate(-8deg)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.6,.5,1)' }); el.textContent = t; }
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); set(cd.d, pad(Math.floor(s / 86400))); set(cd.h, pad(Math.floor(s / 3600) % 24)); set(cd.m, pad(Math.floor(s / 60) % 60)); set(cd.s, pad(s % 60)); }
  tick(); setInterval(tick, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado)
  var att = PEOPLE.map(function () { return null; }), wrap = $('people');
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('div'); row.className = 'person'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', name);
    var n = document.createElement('span'); n.textContent = name;
    var error=document.createElement('p'); error.className='person-error'; error.id='person-error-'+i; error.hidden=true; error.textContent=S.err; row.setAttribute('aria-describedby',error.id);
    var g = document.createElement('div');
    [[S.yes, true], [S.no, false]].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { att[i] = o[1]; error.hidden=true; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('rsErr').hidden = true; });
      g.appendChild(b);
    });
    row.appendChild(n); row.appendChild(g); row.appendChild(error); wrap.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    wrap.querySelectorAll('.person-error').forEach(function(e,i){e.hidden=att[i]!==null;});
    if (att.some(function (x) { return x === null; })) { $('rsErr').hidden = false; wrap.children[att.indexOf(null)].querySelector('button').focus(); return; }
    var r=this.getBoundingClientRect();burst(r.left+r.width/2,r.top,24);
    document.querySelector('.sent').textContent=att.some(Boolean)?S.sent:(document.documentElement.lang==='en'?'Reply received':'¡Respuesta recibida!');
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list=document.createElement('ul'); list.className='reply-list'; PEOPLE.forEach(function(name,i){var li=document.createElement('li'), b=document.createElement('b');b.textContent=name;li.appendChild(b);li.appendChild(document.createTextNode(att[i]?S.yes:S.no));list.appendChild(li);}); $('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex=-1; $('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrap.querySelector('button').focus(); });
})();
