
(function () {
  var S = window.LinoS, $ = function (id) { return document.getElementById(id); };
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  function fitNames() { document.querySelector('.sc1').classList.toggle('long-names',[].some.call(document.querySelectorAll('.sc1 h1 [data-lz]'),function(e){return e.textContent.length>11;})); }

  // Lo que aparece o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null;
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .writes:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    var show = function (el) { el.classList.add('in'); el.querySelectorAll(':scope > .write').forEach(function (w) { w.classList.add('in'); }); };
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .writes').forEach(show); return; }
    // Lo escrito a mano está recortado (clip-path) y no cuenta como visible: se observa su contenedor.
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .15 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { fitNames(); observe(e.target); });
  fitNames();
  function booking(){var a=document.querySelector('[data-lz-href=hotelLink]'), notice=document.querySelector('.demo-booking');var valid=a && a.getAttribute('href') && a.getAttribute('href')!=='#viaje';if(a && !valid) a.hidden=true;if(notice) notice.hidden=!!(valid && !a.hidden);}
  document.addEventListener('lz-render',booking); booking();

  // Barra con los nombres al bajar.
  var bar = $('mbar'), raf = 0, opened = false;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520); });
  }, { passive: true });

  // Apertura: se retira la faja de papel vegetal y las hojas se separan ligeramente.
  var op = $('open'), suite = $('suite'), hint = $('hint'), timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function fanOut() { suite.classList.add('slid', 'fan'); $('band').tabIndex = -1; $('enter').disabled=false; $('enter').tabIndex=0; }
  $('band').addEventListener('click', function () {
    if (suite.classList.contains('slid')) return;
    clear(); LazoMusic.play();
    suite.classList.add('slid'); hint.textContent = $('closing').textContent;
    timers.push(setTimeout(function () { fanOut(); $('enter').focus({ preventScroll: true }); }, reduced ? 0 : 450));
  });
  function enter() { clear(); opened = true; op.classList.add('gone'); op.inert = true; $('invite').inert = false; document.body.classList.remove('locked'); watch(); }
  $('enter').addEventListener('click', function () { enter(); $('demoBar').hidden = false; window.scrollTo(0, 0); document.querySelector('.hero h1').focus({preventScroll:true}); });

  // Para el editor de Lazo (demo/shared/content.js): saltar o volver a mostrar las tarjetas.
  window.LzTemplate = {
    open: function () { fanOut(); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); suite.classList.remove('slid', 'fan'); $('enter').disabled=true; $('enter').tabIndex=-1; $('band').tabIndex=0; op.inert=false; $('invite').inert=true; hint.textContent = S.hint; op.classList.remove('gone'); document.body.classList.add('locked'); window.scrollTo(0, 0); },
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
