
(function () {
  var S = window.CorazonesS, $ = function (id) { return document.getElementById(id); };
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
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });
  document.addEventListener('lz-content-applied', syncContent);

  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; bar.classList.toggle('show', opened && window.pageYOffset > 520); });
  }, { passive: true });

  // La reina de «Dónde»: repite el lugar, la dirección y el mapa del primer evento del programa.
  function syncSala() {
    var ev = document.querySelector('.evs > .ev'); $('mainEvent').classList.toggle('lz-off', !ev); if (!ev) { $('where').classList.add('lz-off'); return; }
    var pl = ev.querySelector('[data-lz-f="place"]'), ad = ev.querySelector('[data-lz-f="address"]'), mp = ev.querySelector('[data-lz-f="map"]');
    var sala = $('where');
    $('whereName').textContent = pl ? pl.textContent : '';
    $('whereAddr').textContent = ad ? ad.textContent : '';
    $('whereMap').hidden = !mp || mp.classList.contains('lz-off');
    if (mp) $('whereMap').href = mp.href;
    sala.classList.toggle('lz-off', !(pl && pl.textContent.trim()));
  }
  function eventKind(name) {
    var n = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/ceremon|votos|vows/.test(n)) return 'ceremony';
    if (/comida|cena|almuerzo|banquete|meal|lunch|dinner/.test(n)) return 'meal';
    if (/fiesta|baile|party|dance/.test(n)) return 'party';
    if (/brindis|coctel|cocktail|toast|drinks/.test(n)) return 'drinks';
    if (/pastel|torta|cake/.test(n)) return 'cake';
    if (/traslado|transporte|salida|transport|departure/.test(n)) return 'transport';
    return 'arrival';
  }
  var kinds = ['ceremony','drinks','meal','party','cake','transport','arrival'];
  function syncContent() {
    syncSala();
    document.querySelectorAll('.ev').forEach(function (e) { var choice = e.querySelector('.event-kind').textContent.trim(); e.dataset.eventIcon = kinds.indexOf(choice) >= 0 ? choice : eventKind(e.querySelector('h3').textContent); });
    var data = window.LazoContent ? LazoContent.current() : {};
    document.querySelector('.mbar .mono').setAttribute('aria-label',(data.n1 || S.n1)+(LANG==='en'?' and ':' y ')+(data.n2 || S.n2));
    var pair = /^(KQ|QQ|KK|AA)$/.test(data.courtPair) ? data.courtPair : 'KQ';
    document.querySelectorAll('[data-co-rank]').forEach(function(e){e.textContent=pair[e.dataset.coRank==='first'?0:1];});
    document.querySelector('.gal').classList.toggle('lz-off',Array.isArray(window.LZ_GALLERY)&&!window.LZ_GALLERY.length);
    $('photoCount').textContent = S.photoCount(Array.isArray(window.LZ_GALLERY) ? window.LZ_GALLERY.length : document.querySelectorAll('.pcard').length);
    requestAnimationFrame(fitMonograms);
  }
  function fitMonograms() {
    document.querySelectorAll('[data-lz-seal]').forEach(function(box){var mark=box.querySelector('.lz-seal');if(!mark)return;mark.style.transform='';var r=mark.getBoundingClientRect();mark.style.transform='scale('+Math.min(1,box.clientWidth/Math.max(1,r.width,mark.scrollWidth),box.clientHeight/Math.max(1,r.height,mark.scrollHeight))+')';});
  }
  syncContent(); window.addEventListener('resize', fitMonograms); if(document.fonts)document.fonts.ready.then(fitMonograms);

  var TARGET = LazoTime.target('2027-03-14', '13:00', 'America/Mexico_City');

  // Apertura: un solo gesto. La baraja se abre en abanico y el rey y la reina se dan la vuelta.
  var op = $('open'), timers = [];
  function fitDeck(){var deck=$('deck'),w=deck.offsetWidth,space=innerWidth-48;if(innerHeight<600&&innerWidth>=600)space=Math.min(300,innerWidth*.43);deck.style.setProperty('--fan-scale',Math.min(1,space/(w*2.5)));deck.style.setProperty('--face-scale',Math.min(1,space/(w*2)));}
  fitDeck();window.addEventListener('resize',fitDeck);
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function enter() {
    clear(); opened = true; op.classList.add('open', 'gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch(); $('demoBar').hidden = false; window.scrollTo(0, 0);
    document.querySelector('.hero .names').focus({ preventScroll: true });
  }
  function part() { if (op.classList.contains('open')) return; clear(); LazoMusic.play(); op.classList.add('open'); timers.push(setTimeout(function () { op.classList.add('flip'); }, still ? 0 : 650)); timers.push(setTimeout(enter, still ? 0 : 2550)); }
  $('deck').addEventListener('click', part); $('enter').addEventListener('click', part);
  window.LzTemplate = {
    open: function () { op.classList.add('open'); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); op.classList.remove('open', 'flip', 'gone'); op.inert = false; op.removeAttribute('aria-hidden'); $('invite').inert = true; document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var target = typeof window.LZ_T === 'number' ? window.LZ_T : TARGET; var valid = Number.isFinite(target); $('timeError').hidden = valid; if(!valid){Object.keys(cd).forEach(function(k){cd[k].textContent='—';});return;} var s = Math.floor(Math.max(0, target - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); cd.d.parentNode.style.setProperty('--digit-scale',Math.min(1,3/cd.d.textContent.length)); }
  tick(); setInterval(tick, 1000); document.addEventListener('lz-content-applied', tick);

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
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'co-p' + i;
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
    var extras=$('rsExtras');extras.textContent='';
    [['diet',S.dietSummary],['note',S.noteSummary]].forEach(function(item){var field=$(item[0]);if(field.closest('.fld').classList.contains('lz-off')||!field.value.trim())return;var p=document.createElement('p'),label=document.createElement('b');label.textContent=item[1]+': ';p.appendChild(label);p.appendChild(document.createTextNode(field.value.trim()));extras.appendChild(p);});
    LazoPanel.setResponse(att, $('note').closest('.fld').classList.contains('lz-off') ? '' : $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrapP.querySelector('input').focus(); });
  document.addEventListener('visibilitychange', function () { document.documentElement.classList.toggle('motion-paused', document.hidden); });
})();
