
(function () {
  var S = window.NacarS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (LANG === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lo que aparece (y las fotos que se revelan) al llegar a la pantalla, después de abrir la invitación.
  var io = null, show = function (el) { el.classList.add('in'); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in)').forEach(function (el) { io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv]').forEach(show); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .08 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  // Los nombres van en mayúsculas grandes: si uno es largo, la letra baja hasta que cabe en su línea (nunca se parte).
  var namesEl = document.querySelector('.hero .names'), fitRaf = 0;
  function fitNames() {
    fitRaf = 0; namesEl.style.fontSize = '';
    var w = namesEl.clientWidth, widest = 0;
    namesEl.querySelectorAll('[data-lz]').forEach(function (n) { widest = Math.max(widest, n.scrollWidth); });
    if (widest > w && widest) namesEl.style.fontSize = Math.floor(parseFloat(getComputedStyle(namesEl).fontSize) * w / widest) + 'px';
  }
  var fitSoon = function () { if (!fitRaf) fitRaf = requestAnimationFrame(fitNames); };
  new MutationObserver(fitSoon).observe(namesEl, { subtree: true, childList: true, characterData: true });
  if ('ResizeObserver' in window) new ResizeObserver(fitSoon).observe(namesEl); else window.addEventListener('resize', fitSoon);
  if (document.fonts) document.fonts.ready.then(fitSoon); fitSoon();

  var monoRaf=0;
  function fitMonograms(){monoRaf=0;document.querySelectorAll('[data-lz-seal]').forEach(function(box){var mark=box.querySelector('.lz-seal');if(!mark)return;mark.style.setProperty('--mono-fit','1');var r=mark.getBoundingClientRect(),b=box.getBoundingClientRect();if(r.width&&r.height)mark.style.setProperty('--mono-fit',Math.min(1,b.width/r.width,b.height/r.height).toFixed(4));});}
  function scheduleMonos(){if(!monoRaf)monoRaf=requestAnimationFrame(fitMonograms);}
  document.querySelectorAll('[data-lz-seal]').forEach(function(box){new MutationObserver(scheduleMonos).observe(box,{childList:true,subtree:true,characterData:true});if('ResizeObserver' in window)new ResizeObserver(scheduleMonos).observe(box);});
  scheduleMonos();if(document.fonts)document.fonts.ready.then(scheduleMonos);

  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; bar.classList.toggle('show', opened && window.pageYOffset > 520); });
  }, { passive: true });

  // Tres días (el anterior, el de la boda y el siguiente); la fecha del editor llega en window.LZ_T.
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), dayKey = '', loc = LANG === 'en' ? 'en-US' : 'es';
  function daysFill() {
    var t = new Date(window.LZ_T || TARGET), key = t.toDateString(); if (key === dayKey) return; dayKey = key;
    $('days').querySelectorAll('.day').forEach(function (c, i) { var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i - 1); c.querySelector('.wd').textContent = d.toLocaleDateString(loc, { weekday: 'long' }); c.querySelector('b').textContent = d.getDate(); });
  }
  daysFill();

  // El collar de fotos avanza de foto en foto con las flechas.
  var strip = $('strip');
  document.querySelectorAll('[data-strip]').forEach(function (b) {
    b.addEventListener('click', function () { var f = strip.querySelector('.charm'); strip.scrollBy({ left: (+b.dataset.strip) * ((f ? f.offsetWidth : 118) + 18), behavior: still ? 'instant' : 'smooth' }); });
  });

  function updateStrip(){document.querySelector('[data-strip="-1"]').disabled=strip.scrollLeft<2;document.querySelector('[data-strip="1"]').disabled=strip.scrollLeft+strip.clientWidth>=strip.scrollWidth-2;}
  strip.addEventListener('scroll',updateStrip,{passive:true});new ResizeObserver(updateStrip).observe(strip);document.addEventListener('lz-render',function(){requestAnimationFrame(updateStrip);});requestAnimationFrame(updateStrip);

  // Apertura: un solo gesto. Se suelta el broche, se levanta la tapa y la tarjeta sube hasta ser la portada.
  var op = $('open'), timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function loadPhotos() { document.querySelectorAll('[data-invite-src]').forEach(function (img) { img.src = img.getAttribute('data-invite-src'); img.removeAttribute('data-invite-src'); }); }
  function enter() {
    loadPhotos();
    clear(); opened = true; op.classList.add('open', 'gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch(); $('demoBar').hidden = false; window.scrollTo(0, 0);
    document.querySelector('.hero .names').focus({ preventScroll: true });
  }
  function part() { if (op.classList.contains('open')) return; loadPhotos(); clear(); var card=op.querySelector('.op-card'),from=card.getBoundingClientRect(),to=namesEl.getBoundingClientRect();op.style.setProperty('--card-x',((to.left+to.width/2)-(from.left+from.width/2))+'px');op.style.setProperty('--card-y',((to.top+to.height/2)-(from.top+from.height/2))+'px');op.style.setProperty('--card-grow',Math.min(1.8,Math.max(1.1,to.width/from.width)).toFixed(3));LazoMusic.play(); op.classList.add('open'); timers.push(setTimeout(enter, still ? 0 : 2600)); }
  $('lid').addEventListener('click', part); $('enter').addEventListener('click', part);
  window.LzTemplate = {
    open: function () { op.classList.add('open'); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); op.classList.remove('open', 'gone'); op.inert = false; op.removeAttribute('aria-hidden'); $('invite').inert = true; document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(function () { tick(); daysFill(); }, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado)
  var att = PEOPLE.map(function () { return null; }), wrapP = $('people');
  var CHECK = '<span class="dot" aria-hidden="true"></span>';
  var WARN = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1"/></svg>';
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('div'); row.className = 'person'; row.setAttribute('role','group'); row.setAttribute('aria-label',name);
    var lg = document.createElement('div'); lg.className='person-name'; lg.textContent = name; row.appendChild(lg);
    var opts = document.createElement('div'); opts.className = 'opts';
    var error = document.createElement('p'); error.className = 'person-err'; error.id = 'person-error-' + i; error.hidden = true; error.innerHTML = WARN; error.appendChild(document.createTextNode(S.missing + ' ' + name.split(' ')[0]));
    row.setAttribute('aria-describedby', error.id);
    [[S.yes, true, 'yes'], [S.no, false, 'no']].forEach(function (o) {
      var l = document.createElement('label'); l.className = 'opt ' + o[2];
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'na-p' + i;
      l.appendChild(inp); l.insertAdjacentHTML('beforeend', CHECK); l.appendChild(document.createTextNode(o[0]));
      inp.addEventListener('change', function () { att[i] = o[1]; error.hidden = true; row.classList.remove('is-err'); if (att.every(function (x) { return x !== null; })) $('rsErr').hidden = true; });
      opts.appendChild(l);
    });
    row.appendChild(opts); row.appendChild(error); wrapP.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    var rows = wrapP.querySelectorAll('.person');
    rows.forEach(function (r, i) { var miss = att[i] === null; r.classList.toggle('is-err', miss); r.querySelector('.person-err').hidden = !miss; });
    if (att.some(function (x) { return x === null; })) { $('rsErr').hidden = false; rows[att.indexOf(null)].querySelector('input').focus(); return; }
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list = document.createElement('ul'); list.className = 'reply-list'; PEOPLE.forEach(function (name, i) { var li = document.createElement('li'), b = document.createElement('b'); b.textContent = name; li.appendChild(b); li.appendChild(document.createTextNode(att[i] ? S.yes : S.no)); list.appendChild(li); }); $('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex = -1; $('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrapP.querySelector('input').focus(); });
  document.addEventListener('visibilitychange', function () { document.documentElement.classList.toggle('motion-paused', document.hidden); });
})();
