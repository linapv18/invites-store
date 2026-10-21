
(function () {
  var S = window.GlicinaS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A long personal quotation is set smaller and wider so it never crowds the framed garden.
  var quote=document.querySelector('[data-lz="quote"]'),heart=quote.closest('.gx-quote');
  function fitQuote(){heart.classList.toggle('is-long',quote.textContent.trim().length>140);}
  fitQuote();new MutationObserver(fitQuote).observe(quote,{childList:true,characterData:true,subtree:true});

  // Lo que aparece, crece, se dibuja o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null, show = function (el) { el.classList.add('in'); el.querySelectorAll(':scope > .write, .typer').forEach(function (w) { w.classList.add('in'); }); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .grow:not(.in), .draw:not(.in), .writes:not(.in), .typer:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .grow, #invite .draw, #invite .writes, #invite .typer').forEach(show); return; }
    // Los nombres escritos están recortados (clip-path) y no cuentan como visibles: se observa su contenedor.
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .18 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  var bar = $('mbar'), img = $('heroImg'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520);  });
  }, { passive: true });

  // Semana de la boda (lunes a domingo) con un corazón en el día; la fecha del editor llega en window.LZ_T.
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), weekDay = '';
  function weekFill() {
    var t = new Date(window.LZ_T || TARGET), key = t.toDateString(); if (key === weekDay) return; weekDay = key;
    var start = t.getDate() - (t.getDay() + 6) % 7;
    $('week').querySelectorAll('b').forEach(function (b, i) {
      var d = new Date(t.getFullYear(), t.getMonth(), start + i), hit = d.getDate() === t.getDate();
      b.className = hit ? 'hit' : ''; b.innerHTML = (hit ? HEART_SVG : '') + d.getDate();
    });
  }
  var HEART_SVG = '<svg viewBox="0 0 46 42" aria-hidden="true"><path d="M23 39C8 29 2 20 5 12c3-7 12-8 18-1 6-7 15-6 18 1 3 8-3 17-18 27Z" fill="none" stroke="#C9808E" stroke-width="1.3"/></svg>';
  weekFill();

  // One native curtain action, followed by the invitation's own entry button.
  var op=$('open'),hint=$('hint'),timers=[],after=op.querySelector('.after'),trigger=op.querySelector('[data-part]');
  var clear=function(){timers.forEach(clearTimeout);timers=[];};
  function reveal(){op.classList.add('parted');trigger.disabled=true;}
  function enableEntry(){after.inert=false;$('enter').disabled=false;$('enter').tabIndex=0;$('enter').focus({preventScroll:true});$('enter').scrollIntoView({block:'nearest',behavior:still?'instant':'smooth'});}
  function part(){if(op.classList.contains('parted'))return;clear();LazoMusic.play();reveal();timers.push(setTimeout(enableEntry,still?0:1050));}
  trigger.addEventListener('click',part);
  function enter(){clear();opened=true;op.classList.add('gone');op.inert=true;op.setAttribute('aria-hidden','true');$('invite').inert=false;document.body.classList.remove('locked');watch();$('demoBar').hidden=false;window.scrollTo(0,0);var title=document.querySelector('.gx-names');title.focus({preventScroll:true});}
  $('enter').addEventListener('click',enter);
  window.LzTemplate={
    open:function(){reveal();enter();},
    envelope:function(){clear();opened=false;bar.classList.remove('show');op.classList.remove('parted','gone');op.inert=false;op.removeAttribute('aria-hidden');trigger.disabled=false;after.inert=true;$('enter').disabled=true;$('enter').tabIndex=-1;$('invite').inert=true;document.body.classList.add('locked');window.scrollTo(0,0);op.scrollTop=0;},
    scroll:function(el,now){window.scrollTo({top:el.getBoundingClientRect().top+scrollY-70,behavior:now||still?'instant':'smooth'});}
  };
  if('IntersectionObserver' in window){var motion=new IntersectionObserver(function(entries){entries.forEach(function(e){e.target.classList.toggle('motion-active',e.isIntersecting);});});document.querySelectorAll('.opening,.gx-cover,.gx-sec,.gx-end').forEach(function(e){motion.observe(e);});}
  document.addEventListener('visibilitychange',function(){document.documentElement.classList.toggle('motion-paused',document.hidden);});

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(function () { tick(); weekFill(); }, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado): una fila por persona con dos círculos.
  var att = PEOPLE.map(function () { return null; }), wrapP = $('people');
  var WARN_ICON = '<svg class="gx-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1"/></svg>';
  var missing = LANG === 'en' ? 'Answer missing' : 'Falta su respuesta';
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('fieldset'); row.className = 'gx-person';
    var lg = document.createElement('legend'); lg.textContent = name; row.appendChild(lg);
    var nm = document.createElement('span'); nm.className = 'gx-person-name'; nm.setAttribute('aria-hidden', 'true'); nm.textContent = name;
    var error = document.createElement('span'); error.className = 'gx-person-err'; error.id = 'person-error-' + i; error.hidden = true; error.innerHTML = WARN_ICON; error.appendChild(document.createTextNode(missing)); nm.appendChild(error);
    row.appendChild(nm); row.setAttribute('aria-describedby', error.id);
    [[S.yes, true], [S.no, false]].forEach(function (o) {
      var l = document.createElement('label'); l.className = 'gx-radio';
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'gx-p' + i;
      var sr = document.createElement('span'); sr.className = 'gx-sr'; sr.textContent = o[0];
      l.appendChild(inp); l.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 22 22" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="9.5"/><circle class="dot" cx="11" cy="11" r="5"/></svg>'); l.appendChild(sr);
      inp.addEventListener('change', function () { att[i] = o[1]; error.hidden = true; row.classList.remove('is-err'); if (att.every(function (x) { return x !== null; })) $('rsErr').hidden = true; });
      row.appendChild(l);
    });
    wrapP.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    var rows = wrapP.querySelectorAll('.gx-person');
    rows.forEach(function (r, i) { var miss = att[i] === null; r.classList.toggle('is-err', miss); r.querySelector('.gx-person-err').hidden = !miss; });
    if (att.some(function (x) { return x === null; })) { $('rsErr').hidden = false; rows[att.indexOf(null)].querySelector('input').focus(); return; }
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list = document.createElement('ul'); list.className = 'reply-list'; PEOPLE.forEach(function (name, i) { var li = document.createElement('li'), b = document.createElement('b'); b.textContent = name; li.appendChild(b); li.appendChild(document.createTextNode(att[i] ? S.yes : S.no)); list.appendChild(li); }); $('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex = -1; $('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrapP.querySelector('input').focus(); });
})();
