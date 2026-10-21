
(function () {
  var S = window.CelesteS, $ = function (id) { return document.getElementById(id); };
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nombres letra por letra: se copian de las fuentes que llena el editor.
  function copy() { document.querySelectorAll('[data-split]').forEach(function (el) { var t = $(el.dataset.split).textContent.trim(); if (el._t !== t) { el._t = t; el.textContent = t; } }); }
  copy();
  ['srcN1', 'srcN2'].forEach(function (id) { new MutationObserver(copy).observe($(id), { childList: true, characterData: true, subtree: true }); });

  // Lo que aparece, se dibuja o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null;
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .draw:not(.in), .letters:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .draw, #invite .letters').forEach(function (el) { el.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .18 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  // Barra con los nombres al bajar, y la foto de portada que se mueve más lento (profundidad).
  var bar = $('mbar'), img = $('heroImg'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520);  });
  }, { passive: true });

  // The moon travels using transforms only; the reveal never reserves initial layout space.
  var op = $('open'), timer = null, revealTimer = null, main = $('invite');
  function moonPosition() {
    var details = op.querySelector('.told');
    var baseTop = matchMedia('(max-height:650px)').matches ? 280 : 344;
    var moonTop = 76 - parseFloat(getComputedStyle($('moon')).width) * .13;
    var bottom = baseTop + details.offsetHeight;
    // Centre the complete revealed composition, leaving room for floating controls.
    var offset = Math.max(0, (op.clientHeight - 64 - moonTop - bottom) / 2);
    op.style.setProperty('--reveal-offset', offset + 'px');
    op.style.setProperty('--reveal-bottom', (bottom + offset + 32) + 'px');
    var rise = Math.max(0, op.clientHeight / 2 - 76 - offset);
    op.style.setProperty('--moon-rise', -rise + 'px');
  }
  moonPosition(); window.addEventListener('resize', moonPosition);
  if (document.fonts) document.fonts.ready.then(moonPosition);
  if ('ResizeObserver' in window) new ResizeObserver(moonPosition).observe(op.querySelector('.told'));
  $('moon').addEventListener('click', function () {
    if (op.classList.contains('lit')) return;
    LazoMusic.play(); op.classList.add('lit'); this.disabled = true;
    revealTimer = setTimeout(function () {
      $('enter').disabled = false; $('enter').tabIndex = 0;
      op.querySelector('.told').inert = false;
      $('enter').focus({ preventScroll: true });
    }, still ? 0 : 1150);
  });
  function enter() {
    clearTimeout(timer); clearTimeout(revealTimer); opened = true;
    op.classList.add('gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    main.inert = false; document.body.classList.remove('locked'); watch();
    window.scrollTo(0, 0); $('demoBar').hidden = false;
    main.querySelector('h1').focus({ preventScroll: true });
  }
  $('enter').addEventListener('click', enter);
  window.LzTemplate = {
    open: enter,
    envelope: function () {
      clearTimeout(timer); clearTimeout(revealTimer); opened = false;
      bar.classList.remove('show'); op.classList.remove('gone', 'lit', 'warp');
      op.inert = false; op.removeAttribute('aria-hidden'); main.inert = true;
      $('enter').disabled = true; $('enter').tabIndex = -1;
      op.querySelector('.told').inert = true; $('moon').disabled = false;
      document.body.classList.add('locked'); window.scrollTo(0, 0); moonPosition();
    },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  if ('IntersectionObserver' in window) {
    var motionObserver=new IntersectionObserver(function(entries){entries.forEach(function(e){e.target.classList.toggle('motion-active',e.isIntersecting);});});
    document.querySelectorAll('.hero,.sec,footer').forEach(function(e){motionObserver.observe(e);});
  }
  document.addEventListener('visibilitychange',function(){document.documentElement.classList.toggle('motion-paused',document.hidden);});

  // Cuenta regresiva en cuatro lunas (la fecha del editor llega en window.LZ_T)
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(tick, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado); al confirmar cruzan estrellas fugaces.
  function wishes(x, y) {
    if (still || !Element.prototype.animate) return;
    var layer=document.createElement('div'); layer.className='wish-layer'; layer.setAttribute('aria-hidden','true'); document.body.appendChild(layer); setTimeout(function(){layer.remove();},2200);
    for (var i = 0; i < 5; i++) {
      var s = document.createElement('i'), a = -Math.PI / 2 + (i - 4) * .28, d = 220 + Math.random() * 120, deg = a * 180 / Math.PI;
      s.className = 'wish'; s.style.left = x + 'px'; s.style.top = y + 'px'; layer.appendChild(s);
      s.animate([{ transform: 'rotate(' + deg + 'deg) translateX(0) scaleX(.2)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'rotate(' + deg + 'deg) translateX(' + d + 'px) scaleX(1)', opacity: 0 }], { duration: 1100 + i * 60, delay: i * 70, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' }).onfinish = (function (n) { return function () { n.remove(); }; })(s);
    }
  }
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
    var r = this.getBoundingClientRect(); if (att.some(Boolean)) wishes(r.left + r.width / 2, r.top);
    $('rsDone').querySelector('p').textContent = att.some(Boolean) ? S.wish : (document.documentElement.lang === 'en' ? 'Thank you for letting us know' : 'Gracias por avisarnos');
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list=document.createElement('ul'); list.className='reply-list'; PEOPLE.forEach(function(name,i){var li=document.createElement('li'),b=document.createElement('b');b.textContent=name;li.appendChild(b);li.appendChild(document.createTextNode(att[i]?S.yes:S.no));list.appendChild(li);});$('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex=-1; $('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrap.querySelector('button').focus(); });
})();
