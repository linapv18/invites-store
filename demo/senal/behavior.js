(function () {
  var S = window.SenalS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (LANG === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lo que aparece al llegar a la pantalla, después de abrir la invitación.
  var io = null, show = function (el) { el.classList.add('in'); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in)').forEach(function (el) { io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv]').forEach(show); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .15 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); sync(); });

  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; bar.classList.toggle('show', opened && window.pageYOffset > 520); });
  }, { passive: true });

  var TARGET = LazoTime.target('2027-03-14', '13:00', 'America/Mexico_City'), target = TARGET;
  function syncTarget() {
    var c = window.LazoContent && LazoContent.current ? LazoContent.current() : null;
    if (!c) { target = TARGET; return; }
    var events = c.events || [], ev = events.find(function (e) { return e.id === c.countdownId; }) || events[0];
    target = c.date ? LazoTime.target(c.date, ev && ev.time || '00:00', c.timeZone || 'America/Mexico_City') : NaN;
  }

  // El lugar repite el lugar, la dirección y el mapa del primer evento del programa.
  function syncPlace() {
    var ev = document.querySelector('.evs > .ev');
    if (!ev) { $('whereName').textContent = ''; $('whereAddr').textContent = ''; $('whereMap').hidden = true; $('whereMap').removeAttribute('href'); $('where').hidden = true; return; }
    $('where').hidden = false;
    var pl = ev.querySelector('[data-lz-f="place"]'), ad = ev.querySelector('[data-lz-f="address"]'), mp = ev.querySelector('[data-lz-f="map"]');
    $('whereName').textContent = pl ? pl.textContent : '';
    $('whereAddr').textContent = ad ? ad.textContent : '';
    $('whereMap').hidden = !mp || mp.classList.contains('lz-off');
    if (mp) $('whereMap').href = mp.href;
    var empty = !(pl && pl.textContent.trim()); $('where').hidden = empty; $('where').classList.toggle('lz-off', empty);
  }
  // Nombres largos: la caligrafía baja de tamaño. Lo mismo con la familia bajo la tele.
  function fit() {
    var nm = document.querySelector('.hero .names'); nm.classList.toggle('long', nm.textContent.replace(/\s+/g, ' ').trim().length > 14);
    var on = document.querySelector('.op-names'); on.classList.toggle('long', on.textContent.replace(/\s+/g, ' ').trim().length > 14);
    var g = document.querySelector('.op-guest'); g.classList.toggle('long', g.textContent.trim().length > 24);
  }
  function sync() { syncPlace(); fit(); syncTarget(); }
  document.addEventListener('lz-content-applied', sync);
  sync();

  // Apertura: la tele se enciende sola, pasa cuatro canales (foto + palabra, y al final la fecha), se apaga en una línea
  // de luz y permanece apagada hasta que se toca la perilla. «Abrir la invitación» funciona en todo momento: la vista entra por la pantalla.
  var op = $('open'), wrap = $('tvWrap'), noise = op.querySelector('canvas.static'), timers = [], boilT = 0, cur = 0;
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
  var noiseCtx = noise.getContext('2d'), noiseFrames = [], noiseIndex = 0;
  for (var f = 0; f < 4; f++) {
    var frame = noiseCtx.createImageData(noise.width, noise.height);
    for (var px = 0; px < frame.data.length; px += 4) {
      var value = 40 + Math.floor(Math.random() * 170);
      frame.data[px] = frame.data[px + 1] = frame.data[px + 2] = value; frame.data[px + 3] = 255;
    }
    noiseFrames.push(frame);
  }
  function boil(on) {
    clearInterval(boilT); boilT = 0;
    if (on && !still) {
      noiseCtx.putImageData(noiseFrames[noiseIndex++ % 4], 0, 0);
      boilT = setInterval(function () { if (!document.hidden) noiseCtx.putImageData(noiseFrames[noiseIndex++ % 4], 0, 0); }, 90);
    }
  }
  function state(st) { op.dataset.st = st; boil(false); }
  function selectChannel(n) {
    cur = n; $('knob').setAttribute('aria-label', S.knob + ' · ' + S.channel + ' ' + n); $('knob').style.setProperty('--dial-angle', (n - 1) * 32 + 'deg');
    op.querySelectorAll('.ch').forEach(function (c) { c.classList.toggle('cur', +c.dataset.ch === n); });
  }
  function channel(n) {
    if (still) { selectChannel(n); state('ch'); return; }
    op.classList.add('burst'); boil(true);
    at(160, function () { op.classList.remove('burst'); selectChannel(n); state('ch'); });
  }
  function sequence() {
    clear(); boil(false); cur = 0;
    if (still) { selectChannel(4); state('ch'); return; }
    state('pre');
    at(300, function () { state('on'); });
    [1000, 2450, 3900, 5350].forEach(function (t, i) { at(t - 160, function () { channel(i + 1); }); });
    at(7550, function () { state('off'); });
  }
  function zoom() {
    var t = wrap.getBoundingClientRect(), r = wrap.querySelector('.scr').getBoundingClientRect(), W = innerWidth, H = innerHeight;
    var s = Math.max(W / r.width, H / r.height) * 1.25, cx = r.left - t.left + r.width / 2, cy = r.top - t.top + r.height / 2;
    wrap.style.transform = 'translate(' + (W / 2 - t.left - s * cx) + 'px,' + (H / 2 - t.top - s * cy) + 'px) scale(' + s.toFixed(2) + ')';
  }
  function enter() {
    clear(); op.classList.remove('burst'); boil(false); opened = true; op.classList.add('gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch(); $('demoBar').hidden = false; window.scrollTo(0, 0);
    document.querySelector('.hero .names').focus({ preventScroll: true });
  }
  function part() {
    if (op.classList.contains('zoom')) return; clear(); LazoMusic.play();
    if (still) { op.classList.add('lift'); timers.push(setTimeout(enter, 200)); return; }
    op.classList.add('zoom'); boil(true); zoom();
    at(1050, function () { op.classList.add('lift'); });
    at(1500, enter);
  }
  $('enter').addEventListener('click', part);
  $('knob').addEventListener('click', function () { if (op.classList.contains('zoom')) return; clear(); op.classList.remove('burst'); channel(cur % 4 + 1); });
  sequence();
  window.LzTemplate = {
    open: function () { clear(); op.classList.add('zoom', 'lift'); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); op.classList.remove('zoom', 'lift', 'gone', 'burst'); wrap.style.transform = ''; op.inert = false; op.removeAttribute('aria-hidden'); $('invite').inert = true; document.body.classList.add('locked'); window.scrollTo(0, 0); sequence(); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { if (!Number.isFinite(target)) { Object.keys(cd).forEach(function (k) { cd[k].textContent = '—'; }); return; } var s = Math.floor(Math.max(0, target - Date.now()) / 1000); cd.d.textContent = String(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(tick, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado)
  var att = PEOPLE.map(function () { return null; }), wrapP = $('people');
  var CHECK = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  var WARN = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1"/></svg>';
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('div'); row.className = 'person'; row.setAttribute('role','group'); row.setAttribute('aria-label',name);
    var lg = document.createElement('div'); lg.className='person-name'; lg.textContent = name; row.appendChild(lg);
    var opts = document.createElement('div'); opts.className = 'opts';
    var error = document.createElement('p'); error.className = 'person-err'; error.id = 'person-error-' + i; error.hidden = true; error.innerHTML = WARN; error.appendChild(document.createTextNode(S.missing + ' ' + name.split(' ')[0]));
    row.setAttribute('aria-describedby', error.id);
    [[S.yes, true, 'yes'], [S.no, false, 'no']].forEach(function (o) {
      var l = document.createElement('label'); l.className = 'opt ' + o[2];
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'sn-p' + i;
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
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || op.classList.contains('gone') || !op.contains(document.activeElement)) return;
    var controls = [$('knob'), $('enter')], first = controls[0], last = controls[1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('visibilitychange', function () { document.documentElement.classList.toggle('motion-paused', document.hidden); });
})();
