
(function () {
  var S = window.CisneS, $ = function (id) { return document.getElementById(id); };
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (document.documentElement.lang === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fit the editor's text/ring/stack monogram to the safe interior of each wax seal.
  var monoFrame = 0;
  function fitMonograms() {
    monoFrame = 0;
    document.querySelectorAll('.photographic-seal .emb,.painted-envelope .mono b').forEach(function(box) {
      var mark = box.querySelector('.lz-seal'); if (!mark) return;
      mark.style.setProperty('--mono-fit','1');
      var r = mark.getBoundingClientRect(), safe = box.getBoundingClientRect();
      if(r.width && r.height) mark.style.setProperty('--mono-fit',Math.min(1,safe.width/r.width,safe.height/r.height).toFixed(4));
    });
  }
  function scheduleMonograms(){if(!monoFrame) monoFrame=requestAnimationFrame(fitMonograms);}
  document.querySelectorAll('.photographic-seal .emb,.painted-envelope .mono b').forEach(function(box){
    new MutationObserver(scheduleMonograms).observe(box,{childList:true,characterData:true,subtree:true});
    if('ResizeObserver' in window) new ResizeObserver(scheduleMonograms).observe(box);
  });
  scheduleMonograms(); window.addEventListener('resize',scheduleMonograms);
  if(document.fonts) document.fonts.ready.then(scheduleMonograms);

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

  // Barra con los nombres al bajar, y la foto de portada que se mueve más lento (profundidad).
  var bar = $('mbar'), img = $('heroImg'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520);  });
  }, { passive: true });

  // Envelope geometry follows the editor's actual card height, including long names.
  var op = $('open'), wrap = $('csWrap'), hint = $('hint'), timers = [], card = wrap.querySelector('.ocard');
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function measureCard() { wrap.style.setProperty('--card-height', card.offsetHeight + 'px'); }
  measureCard(); window.addEventListener('resize', measureCard);
  if(document.fonts) document.fonts.ready.then(measureCard);
  if('ResizeObserver' in window) new ResizeObserver(measureCard).observe(card);
  function reveal() {
    wrap.classList.add('open', 'rise', 'reveal'); card.inert = false;
    wrap.querySelectorAll('.grow, .writes').forEach(show);
    hint.textContent = $('envClosing').textContent; $('enter').disabled = false; $('enter').tabIndex = 0;
  }
  $('csSeal').addEventListener('click', function () {
    if (wrap.classList.contains('open')) return;
    clear(); measureCard(); LazoMusic.play(); this.disabled = true; wrap.classList.add('open');
    timers.push(setTimeout(function(){wrap.classList.add('rise');},still?0:450));
    timers.push(setTimeout(function(){
      reveal(); $('enter').focus({preventScroll:true});
      $('enter').scrollIntoView({block:'nearest',behavior:still?'instant':'smooth'});
    },still?0:1450));
  });
  function enter() {
    clear(); opened = true; op.classList.add('gone'); op.inert = true; op.setAttribute('aria-hidden','true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch();
    $('demoBar').hidden = false; window.scrollTo(0,0);
    var h=document.querySelector('.hero h1');h.tabIndex=-1;h.focus({preventScroll:true});
  }
  $('enter').addEventListener('click', enter);
  window.LzTemplate = {
    open: function(){reveal();enter();},
    envelope: function(){
      clear(); opened=false; bar.classList.remove('show');
      wrap.classList.remove('open','rise','reveal'); card.inert=true;
      wrap.querySelectorAll('.in').forEach(function(e){e.classList.remove('in');});
      $('enter').disabled=true;$('enter').tabIndex=-1;$('csSeal').disabled=false;
      hint.textContent=S.hint;op.classList.remove('gone');op.inert=false;op.removeAttribute('aria-hidden');
      $('invite').inert=true;document.body.classList.add('locked');window.scrollTo(0,0);op.scrollTop=0;measureCard();
    },
    scroll:function(el,now){window.scrollTo({top:el.getBoundingClientRect().top+scrollY-70,behavior:now||still?'instant':'smooth'});}
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(tick, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado)
  var att = PEOPLE.map(function () { return null; }), wrapP = $('people');
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('div'); row.className = 'person'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', name);
    var n = document.createElement('span'); n.textContent = name;
    var error=document.createElement('p');error.className='person-error';error.id='person-error-'+i;error.hidden=true;error.textContent=S.err;row.setAttribute('aria-describedby',error.id);
    var g = document.createElement('div');
    [[S.yes, true], [S.no, false]].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { att[i] = o[1]; error.hidden=true; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('rsErr').hidden = true; });
      g.appendChild(b);
    });
    row.appendChild(n); row.appendChild(g);row.appendChild(error); wrapP.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    wrapP.querySelectorAll('.person-error').forEach(function(e,i){e.hidden=att[i]!==null;});
    if (att.some(function (x) { return x === null; })) { $('rsErr').hidden = false; wrapP.children[att.indexOf(null)].querySelector('button').focus();return; }
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list=document.createElement('ul');list.className='reply-list';PEOPLE.forEach(function(name,i){var li=document.createElement('li'),b=document.createElement('b');b.textContent=name;li.appendChild(b);li.appendChild(document.createTextNode(att[i]?S.yes:S.no));list.appendChild(li);});$('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false;$('rsDone').tabIndex=-1;$('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false;wrapP.querySelector('button').focus(); });
})();
