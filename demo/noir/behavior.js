
(function () {
  var S = window.NoirS, $ = function (id) { return document.getElementById(id); };
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  // Nombres editables: legibles desde que aparece la tarjeta o el hero.
  function copy() { document.querySelectorAll('[data-split]').forEach(function (el) { var t = $(el.dataset.split).textContent.trim(); el.setAttribute('aria-label',t); if (el._t !== t) { el._t = t; el.textContent = t; } }); document.querySelector('.gin').classList.toggle('long-names',Math.max($('srcN1').textContent.length,$('srcN2').textContent.length)>11); }
  copy();
  function booking(){var a=document.querySelector('[data-lz-href=hotelLink]'),n=document.querySelector('.demo-booking');if(a.getAttribute('href')==='#viaje')a.hidden=true;n.hidden=!a.hidden;}
  document.addEventListener('lz-render',booking);booking();
  ['srcN1', 'srcN2'].forEach(function (id) { new MutationObserver(copy).observe($(id), { childList: true, characterData: true, subtree: true }); });

  // Lo que aparece o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null;
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .letters:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .letters').forEach(function (el) { el.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  // Monograma de consulta al desplazarse.
  var bar = $('mbar'), raf = 0, opened = false;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520); });
  }, { passive: true });

  // Apertura: se quita la faja de plata y las dos mitades se abren hacia arriba y hacia abajo.
  var op = $('open'), gate = $('gate'), hint = $('hint'), timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function openGate() { gate.classList.add('slid', 'open'); $('inLetters').classList.add('in'); $('enter').tabIndex = 0; $('enter').disabled=false; $('band').tabIndex=-1; }
  $('band').addEventListener('click', function () {
    if (gate.classList.contains('slid')) return;
    clear(); LazoMusic.play();
    gate.classList.add('slid'); hint.textContent = '';
    timers.push(setTimeout(function () { openGate(); $('enter').focus({ preventScroll: true }); }, reduced ? 0 : 350));
  });
  function enter() { clear(); opened = true; op.classList.add('gone'); op.inert=true; $('invite').inert=false; document.body.classList.remove('locked'); document.querySelector('.hc .letters').classList.add('in'); watch(); }
  $('enter').addEventListener('click', function () { enter(); $('demoBar').hidden = false; window.scrollTo(0, 0); var h=document.querySelector('.hc h1');h.tabIndex=-1;h.focus({preventScroll:true}); });

  // Para el editor de Lazo (demo/shared/content.js): saltar o volver a mostrar la tarjeta.
  window.LzTemplate = {
    open: function () { openGate(); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); gate.classList.remove('slid', 'open'); $('inLetters').classList.remove('in'); $('enter').tabIndex = -1; $('enter').disabled=true; $('band').tabIndex=0; op.inert=false; $('invite').inert=true; hint.textContent = S.hint; op.classList.remove('gone'); document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 70, behavior: now ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
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
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list=document.createElement('ul'); list.className='reply-list'; PEOPLE.forEach(function(name,i){var li=document.createElement('li'), b=document.createElement('b');b.textContent=name;li.appendChild(b);li.appendChild(document.createTextNode(att[i]?S.yes:S.no));list.appendChild(li);}); $('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex=-1; $('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrap.querySelector('button').focus(); });
})();
