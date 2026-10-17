(function () {
  var S = window.EncajeS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
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

  var TARGET = new Date(2027, 2, 14, 13, 0).getTime();
  var when = function () { return new Date(window.LZ_T || TARGET); };

  // El lugar repite el lugar, la dirección y el mapa del primer evento del programa.
  function syncPlace() {
    var ev = document.querySelector('.evs > .ev'); if (!ev) return;
    var pl = ev.querySelector('[data-lz-f="place"]'), ad = ev.querySelector('[data-lz-f="address"]'), mp = ev.querySelector('[data-lz-f="map"]');
    $('whereName').textContent = pl ? pl.textContent : '';
    $('whereAddr').textContent = ad ? ad.textContent : '';
    $('whereMap').hidden = !mp || mp.classList.contains('lz-off');
    if (mp) $('whereMap').href = mp.href;
    $('where').classList.toggle('lz-off', !(pl && pl.textContent.trim()));
  }
  // La semana de la boda, con el día dentro de un corazón (lunes primero en español, domingo en inglés).
  var HEART = '<svg class="hrt" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 14.2s-5.6-3.5-5.6-7.6A3.1 3.1 0 0 1 8 4.7a3.1 3.1 0 0 1 5.6 1.9c0 4.1-5.6 7.6-5.6 7.6z"/></svg>';
  function syncCal() {
    var d = when(), off = LANG === 'en' ? d.getDay() : (d.getDay() + 6) % 7, html = S.week.map(function (w) { return '<span class="dn">' + w + '</span>'; }).join('');
    for (var i = 0; i < 7; i++) {
      var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - off + i), on = i === off;
      html += on ? '<span class="dd on">' + HEART + '<b>' + x.getDate() + '</b></span>' : '<span class="dd">' + x.getDate() + '</span>';
    }
    $('cal').innerHTML = html;
  }
  // Nombres largos: pasan a dos líneas con una letra más chica. Lo mismo con la familia de la borla.
  function fit() {
    var nm = document.querySelector('.hero .names'); nm.classList.toggle('long', nm.textContent.replace(/\s+/g, ' ').trim().length > 14);
    var tg = document.querySelector('.tag'); tg.classList.toggle('long', tg.querySelector('.tag-g').textContent.trim().length > 22);
  }
  function sync() { syncPlace(); syncCal(); fit(); }
  sync();

  // Añadir al calendario: un .ics con la fecha, la hora y el lugar de la invitación.
  $('addCal').addEventListener('click', function () {
    var d = when(), end = new Date(d.getTime() + 6 * 3600e3), p = function (n) { return String(n).padStart(2, '0'); };
    var f = function (x) { return x.getFullYear() + p(x.getMonth() + 1) + p(x.getDate()) + 'T' + p(x.getHours()) + p(x.getMinutes()) + '00'; };
    var esc = function (s) { return String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, ' '); };
    var names = document.querySelector('.hero .names').textContent.replace(/\s+/g, ' ').trim();
    var place = [$('whereName').textContent, $('whereAddr').textContent, document.querySelector('.hero-c').textContent].filter(function (s) { return s && s.trim(); }).join(', ');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lazo//Invitacion//ES', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@lazo', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(d), 'DTEND:' + f(end), 'SUMMARY:' + esc(S.wedding + ' ' + names), 'LOCATION:' + esc(place), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'boda.ics';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  // Apertura: dos paños se recogen lateralmente desde el centro.
  var op = $('open'), timers = [], clothRaf = 0, progress = 0;

  // Two hanging panels retain their full height and gather into vertical folds.
  // Canvas is decorative; controls remain native buttons.
  var cloth = document.createElement('canvas'), ctx = cloth.getContext('2d'), textile = new Image();
  var material = document.createElement('canvas'), surface, ready = false, lastPaint = -1;
  cloth.className = 'curtain-surface'; cloth.setAttribute('aria-hidden', 'true');
  op.querySelector('.blind').insertBefore(cloth, op.querySelector('.blind-edge'));
  function prepareCloth() {
    if (!textile.naturalWidth || !ctx) return;
    var w = innerWidth, h = innerHeight;
    material.width = w; material.height = h;
    surface = material.getContext('2d');
    var panels = Math.max(1, Math.round(w / (h * .9))), pw = w / panels;
    var fraction = Math.min(.92, (pw / h) / (textile.naturalWidth / textile.naturalHeight));
    var sw = textile.naturalWidth * fraction, sx = (textile.naturalWidth - sw) / 2;
    for (var panel = 0; panel < panels; panel++) {
      surface.drawImage(textile, sx, 0, sw, textile.naturalHeight, panel * pw, 0, pw + .5, h);
    }
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    cloth.width = Math.round(w * dpr); cloth.height = Math.round((h + 80) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ready = true;
    op.classList.add('fabric-ready'); lastPaint = -1; paintCloth(progress, true);
  }
  function paintCloth(p, force) {
    if (!ready) return;
    var now = performance.now(); if (!force && p > 0 && p < 1 && now - lastPaint < 32) return;
    lastPaint = now;
    var w = innerWidth, h = innerHeight, half = w / 2, columns = 144, rows = 12;
    var gathering = p * p * (3 - 2 * p), length = 1 - .84 * gathering;
    var exit = Math.max(0, (p - .8) / .2) * half * .2;
    ctx.clearRect(0, 0, w, h + 80);
    function x(t, v) {
      return t * half * length - exit +
        Math.sin(t * Math.PI * 14) * half * .022 * gathering * Math.sin(t * Math.PI) +
        Math.sin(v * Math.PI) * half * .018 * gathering * t;
    }
    for (var side = 0; side < 2; side++) {
      for (var c = 0; c < columns; c++) {
        var t = c / columns, t2 = (c + 1) / columns;
        for (var r = 0; r < rows; r++) {
          var v = r / rows, sy = v * h, dh = h / rows;
          var x1 = x(t, v), x2 = x(t2, v), dx = Math.max(.7, Math.abs(x2 - x1));
          var px = Math.min(x1, x2), sx = t * half;
          if (side) { px = w - Math.max(x1, x2); sx = w - t2 * half; }
          ctx.drawImage(material, sx, sy, half / columns, dh, px, sy, dx + .7, dh + .7);
          var light = Math.sin(t * Math.PI * 14) * .26 * gathering;
          ctx.fillStyle = light > 0 ? 'rgba(255,253,244,' + light + ')' : 'rgba(59,43,30,' + (-light) + ')';
          ctx.globalCompositeOperation = 'source-atop'; ctx.fillRect(px, sy, dx + .7, dh + .7);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
  }
  textile.onload = prepareCloth; textile.src = '/assets/encaje/cortina.webp';
  window.addEventListener('resize', prepareCloth);
  function fabric(p) {
    progress = p; var w = innerWidth, h = innerHeight, q = p * p * (3 - 2 * p);
    var edge = Math.max(0, 50 * (1 - .84 * q) - Math.max(0, (p - .8) / .2) * 10);
    op.style.setProperty('--cloth-bottom', h + 'px');
    op.style.setProperty('--panel-edge', edge + '%');
    op.style.setProperty('--panel-shift', (-w * .5 * q) + 'px');
    op.querySelector('.cloth-veil').style.clipPath = 'polygon(0 0,'+edge+'% 0,'+edge+'% 100%,0 100%,0 0,100% 0,100% 100%,'+(100-edge)+'% 100%,'+(100-edge)+'% 0,100% 0)';
    op.style.setProperty('--cord-end', (h * (h < 500 ? .38 : .62) + Math.sin(p * Math.PI) * 16) + 'px');
    paintCloth(p, p === 0 || p === 1);
    op.querySelector('.tag').style.transform = 'translateX(' + (-q * w * .35) + 'px) rotate(' + (-q * 5) + 'deg)';
    op.querySelector('.tag').style.opacity = Math.max(0, 1 - p * 3);
  }

  fabric(0); window.addEventListener('resize', function () { fabric(progress); });
  var clear = function () { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(clothRaf); };
  var at = function (ms, fn) { timers.push(setTimeout(fn, still ? 0 : ms)); };
  function enter() {
    clear(); opened = true; op.classList.add('gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch(); $('demoBar').hidden = false; window.scrollTo(0, 0);
    document.querySelector('.hero .names').focus({ preventScroll: true });
  }
  function part() {
    if (op.classList.contains('tug')) return; clear(); LazoMusic.play();
    op.classList.add('tug');
    if (still) { op.classList.add('lift'); timers.push(setTimeout(enter, 220)); return; }
    at(180, function () {
      op.classList.add('up'); var start = performance.now();
      function step(now) {
        var p = Math.min(1, (now - start) / 2900); fabric(p);
        if (p < 1) clothRaf = requestAnimationFrame(step);
        else { at(280, function () { op.classList.add('lift'); }); at(1000, enter); }
      }
      clothRaf = requestAnimationFrame(step);
    });
  }
  $('pull').addEventListener('click', part); $('enter').addEventListener('click', part);
  window.LzTemplate = {
    open: function () { op.classList.add('tug', 'up', 'lift'); enter(); },
    envelope: function () { clear(); fabric(0); opened = false; bar.classList.remove('show'); op.classList.remove('tug', 'up', 'lift', 'gone'); op.inert = false; op.removeAttribute('aria-hidden'); $('invite').inert = true; document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(tick, 1000);
  var lastT = window.LZ_T; setInterval(function () { if (window.LZ_T !== lastT) { lastT = window.LZ_T; syncCal(); } }, 1000);

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
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'en-p' + i;
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
