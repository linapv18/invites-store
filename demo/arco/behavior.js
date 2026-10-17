
(function () {
  var S = window.ArcoS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (LANG === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lo que aparece (y las fotos que se revelan) al llegar a la pantalla, después de abrir la invitación.
  var io = null, show = function (el) { el.classList.add('in'); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in)').forEach(function (el) { io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv]').forEach(show); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .15 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); syncSala(); });

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

  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; bar.classList.toggle('show', opened && window.pageYOffset > 520); });
  }, { passive: true });

  // «Te esperamos en»: repite el lugar, la dirección y el mapa del primer evento del programa.
  function syncSala() {
    var ev = document.querySelector('.evs > .ev'); if (!ev) return;
    var pl = ev.querySelector('[data-lz-f="place"]'), ad = ev.querySelector('[data-lz-f="address"]'), mp = ev.querySelector('[data-lz-f="map"]');
    var sala = $('venue');
    $('venueName').textContent = pl ? pl.textContent : '';
    $('venueAddr').textContent = ad ? ad.textContent : '';
    $('venueMap').hidden = !mp || mp.classList.contains('lz-off');
    if (mp) $('venueMap').href = mp.href;
    sala.classList.toggle('lz-off', !(pl && pl.textContent.trim()));
  }
  syncSala();

  var TARGET = new Date(2027, 2, 14, 13, 0).getTime();

  // La arcada avanza de arco en arco con las flechas.
  var strip = $('strip');
  document.querySelectorAll('[data-strip]').forEach(function (b) {
    b.addEventListener('click', function () { var f = strip.querySelector('.arc-item'); strip.scrollBy({ left: (+b.dataset.strip) * ((f ? f.offsetWidth : 150) + 12), behavior: still ? 'instant' : 'smooth' }); });
  });

  // Apertura: un solo gesto. El cristal se limpia desde el punto tocado y la ventana crece hasta ser la portada.
  var op = $('open'), timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function enter() {
    clear(); opened = true; op.classList.add('open', 'gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch(); $('demoBar').hidden = false; window.scrollTo(0, 0);
    document.querySelector('.hero .names').focus({ preventScroll: true });
  }
  function part(ev) {
    if (op.classList.contains('open')) return; clear(); LazoMusic.play();
    var w = $('win'), r = w.getBoundingClientRect();
    if (ev && ev.clientX && ev.currentTarget === w) { w.style.setProperty('--x', (ev.clientX - r.left) + 'px'); w.style.setProperty('--y', (ev.clientY - r.top) + 'px'); }
    w.style.setProperty('--r', '70px'); op.classList.add('open'); timers.push(setTimeout(enter, still ? 0 : 1250));
  }
  $('win').addEventListener('click', part); $('enter').addEventListener('click', part);
  window.LzTemplate = {
    open: function () { op.classList.add('open'); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); op.classList.remove('open', 'gone'); op.inert = false; op.removeAttribute('aria-hidden'); $('invite').inert = true; document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(tick, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado)
  var att = PEOPLE.map(function () { return null; }), wrapP = $('people');
  var CHECK = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  var WARN = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1"/></svg>';
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('fieldset'); row.className = 'person';
    var lg = document.createElement('legend'); lg.textContent = name; row.appendChild(lg);
    var opts = document.createElement('div'); opts.className = 'opts';
    var error = document.createElement('p'); error.className = 'person-err'; error.id = 'person-error-' + i; error.hidden = true; error.innerHTML = WARN; error.appendChild(document.createTextNode(S.missing + ' ' + name.split(' ')[0]));
    row.setAttribute('aria-describedby', error.id);
    [[S.yes, true, 'yes'], [S.no, false, 'no']].forEach(function (o) {
      var l = document.createElement('label'); l.className = 'opt ' + o[2];
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'ar-p' + i;
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
