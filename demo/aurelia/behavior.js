
(function () {
  var S = window.AureliaS, $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var invite = $('invite');
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  // Editable names, the stationary typographic seal and the photograph caption.
  function roman(n) { var r = '', m = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; m.forEach(function (p) { while (n >= p[0]) { r += p[1]; n -= p[0]; } }); return r; }
  function copy() {
    document.querySelectorAll('[data-split]').forEach(function (el) { var t = $(el.dataset.split).textContent.trim(); if (el._t !== t) { el._t = t; el.innerHTML = window.AureliaSplit(t, +(el.dataset.off || 0)); } });
    var n1 = $('srcN1').textContent.trim().toUpperCase(), n2 = $('srcN2').textContent.trim().toUpperCase(), d = $('srcDate').textContent.trim(), y = +(d.split('.')[2] || 0);
    var longest = Math.max(n1.length,n2.length);
    $('inLetters').style.fontSize = longest > 13 ? '26px' : longest > 8 ? '32px' : '';
    document.querySelector('.names').classList.toggle('au-long-name',longest > 10);
    var ringName = n1.length + n2.length > 20 ? Array.from(n1)[0] + ' & ' + Array.from(n2)[0] : n1 + ' & ' + n2;
    $('ringTxt').textContent = ringName + ' · ' + d + ' · ' + ringName + ' ·';
    $('vcap').textContent = $('srcCity').textContent.trim().toUpperCase() + (y ? ' — ' + roman(y) : '');
  }
  copy();
  function materialTheme() {
    var gold = document.documentElement.style.getPropertyValue('--gold').trim().toLowerCase();
    document.documentElement.dataset.auMetal = gold === '#9ea3a8' ? 'silver' : gold === '#b98374' ? 'rose' : 'gold';
  }
  materialTheme();
  new MutationObserver(materialTheme).observe(document.documentElement, {attributes:true,attributeFilter:['style']});
  ['srcN1', 'srcN2', 'srcCity', 'srcDate'].forEach(function (id) { new MutationObserver(copy).observe($(id), { childList: true, characterData: true, subtree: true }); });

  // Lo que aparece o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null;
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .letters:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .letters, .divd').forEach(function (el) { el.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  // Quiet editorial running head, without moving the photograph out of its crop.
  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520);  });
  }, { passive: true });

  // Apertura: la faja se desliza y la carpeta se abre como un libro.
  var op = $('open'), fold = $('fold'), hint = $('hint'), timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function openFold() { fold.classList.add('slid', 'open'); $('inLetters').classList.add('in'); document.querySelector('.inside').inert = false; $('enter').tabIndex = 0; }
  op.removeAttribute('aria-modal');
  function startOpening() {
    if (fold.classList.contains('slid')) return;
    clear(); LazoMusic.play();
    fold.classList.add('slid'); $('band').disabled = true; hint.textContent = $('closing').textContent;
    if (reduce.matches) { openFold(); $('enter').focus({ preventScroll: true }); return; }
    timers.push(setTimeout(function () { fold.classList.add('open'); }, 250));
    timers.push(setTimeout(openFold, 1500));
    timers.push(setTimeout(function () { $('enter').focus({ preventScroll: true }); }, 2200));
  }
  $('band').addEventListener('click', startOpening);
  var drag = null;
  $('band').addEventListener('pointerdown', function (e) { if (e.button !== 0) return; drag = [e.clientX, e.clientY]; this.setPointerCapture(e.pointerId); });
  $('band').addEventListener('pointerup', function (e) { if (drag && Math.hypot(e.clientX - drag[0], e.clientY - drag[1]) > 28) startOpening(); drag = null; });
  $('band').addEventListener('pointercancel', function () { drag = null; });
  function enter() { clear(); opened = true; invite.inert = false; invite.classList.add('is-open'); op.classList.add('gone'); op.inert = true; document.body.classList.remove('locked'); watch(); }
  $('enter').addEventListener('click', function () { enter(); $('demoBar').hidden = false; window.scrollTo({top:0,behavior:'instant'}); document.querySelector('.names').focus({preventScroll:true}); });

  // Para el editor de Lazo (demo/shared/content.js): saltar o volver a mostrar la carpeta.
  window.LzTemplate = {
    open: function () { openFold(); enter(); },
    envelope: function () { clear(); opened = false; op.inert = false; invite.inert = true; invite.classList.remove('is-open'); document.querySelector('.inside').inert = true; $('band').disabled = false; bar.classList.remove('show'); fold.classList.remove('slid', 'open'); $('inLetters').classList.remove('in'); $('enter').tabIndex = -1; hint.textContent = S.hint; op.classList.remove('gone'); document.body.classList.add('locked'); window.scrollTo(0, 0); },
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
    var g = document.createElement('div');
    var error = document.createElement('p'); error.className = 'au-person-error'; error.id = 'au-person-error-' + i; error.hidden = true; error.textContent = S.pendingPerson;
    [[S.yes, true], [S.no, false]].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-describedby', error.id);
      b.addEventListener('click', function () { att[i] = o[1]; row.classList.remove('is-invalid'); error.hidden = true; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('rsErr').hidden = true; });
      g.appendChild(b);
    });
    row.appendChild(n); row.appendChild(g); row.appendChild(error); wrap.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    if (att.some(function (x) { return x === null; })) {
      $('rsErr').hidden = false;
      wrap.querySelectorAll('.person').forEach(function (row,i) { var missing = att[i] === null; row.classList.toggle('is-invalid',missing); row.querySelector('.au-person-error').hidden = !missing; });
      wrap.querySelectorAll('.person')[att.indexOf(null)].querySelector('button').focus(); return;
    }
    $('rsGuests').replaceChildren();
    PEOPLE.forEach(function (name,i) { var li = document.createElement('li'); li.textContent = name + ' — ' + (att[i] ? S.yes : S.no); $('rsGuests').appendChild(li); });
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').setAttribute('tabindex','-1'); $('rsDone').focus({preventScroll:true}); $('rsDone').scrollIntoView({block:'center',behavior:reduce.matches?'instant':'smooth'});
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrap.querySelector('button[aria-pressed=true]').focus(); });
})();
