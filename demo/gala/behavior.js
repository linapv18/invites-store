
(function () {
  var S = window.GalaS, $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)'), invite = $('invite');
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  // Editable names and the stationary medallion inscription.
  function copy() {
    document.querySelectorAll('[data-split]').forEach(function (el) { var t = $(el.dataset.split).textContent.trim(); if (el._t !== t) { el._t = t; el.innerHTML = window.GalaSplit(t, +(el.dataset.off || 0)); } });
    var longest = Math.max($('srcN1').textContent.length,$('srcN2').textContent.length);
    document.querySelector('.hero h1').classList.toggle('gala-long-name',longest > 10);
    var i = $('srcIntro').textContent.trim().toUpperCase(); $('ringTxt').textContent = i + ' · ' + i + ' ·';
  }
  copy();
  function materialTheme() {
    var gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim().toLowerCase();
    document.documentElement.style.setProperty('--gala-metal-filter',gold === '#c9a45c' ? 'hue-rotate(18deg) saturate(.85)' : 'none');
  }
  var lastGold;
  new MutationObserver(function () {
    var gold = document.documentElement.style.getPropertyValue('--gold');
    if (gold !== lastGold) { lastGold = gold; materialTheme(); }
  }).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  materialTheme();

  // Draw each chamfered border to the actual card dimensions, including wrapped editor text.
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function drawBorder(box) {
    var svg = box.querySelector(':scope > .gala-border');
    if (!svg) {
      svg = document.createElementNS(SVG_NS,'svg'); svg.classList.add('gala-border'); svg.setAttribute('aria-hidden','true');
      for (var i=0;i<2;i++) { var path=document.createElementNS(SVG_NS,'path'); path.setAttribute('fill','none'); path.setAttribute('stroke','currentColor'); path.setAttribute('stroke-width',i ? '.6' : '1'); path.setAttribute('opacity',i ? '.32' : '.65'); svg.appendChild(path); }
      box.prepend(svg);
    }
    var w=box.clientWidth,h=box.clientHeight; if (!w || !h) return;
    svg.setAttribute('viewBox','0 0 '+w+' '+h);
    svg.querySelectorAll('path').forEach(function(path,i) {
      var p=i ? 7 : 1,c=i ? 10 : 14;
      path.setAttribute('d','M'+(p+c)+' '+p+'H'+(w-p-c)+'L'+(w-p)+' '+(p+c)+'V'+(h-p-c)+'L'+(w-p-c)+' '+(h-p)+'H'+(p+c)+'L'+p+' '+(h-p-c)+'V'+(p+c)+'Z');
    });
  }
  var borderObserver = window.ResizeObserver ? new ResizeObserver(function(entries){entries.forEach(function(e){drawBorder(e.target);});}) : null;
  function borders(root) { root.querySelectorAll('.frame').forEach(function(box){drawBorder(box);if(borderObserver)borderObserver.observe(box);}); }
  borders(document);
  document.addEventListener('lz-render',function(e){borders(e.target);});
  if (!borderObserver) window.addEventListener('resize',function(){borders(document);});
  // Unambiguous inline SVG controls; no platform-dependent glyphs.
  function faqIcons(root) { root.querySelectorAll('.faq summary,summary[data-lz-f="q"]').forEach(function(summary){
    if (summary.querySelector('.gala-faq-icon')) return;
    var icon=document.createElementNS(SVG_NS,'svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.classList.add('gala-faq-icon');
    var path=document.createElementNS(SVG_NS,'path');path.setAttribute('d','M5 12h14M12 5v14');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.2');icon.appendChild(path);summary.appendChild(icon);
  }); }
  faqIcons(document);
  document.addEventListener('lz-render',function(e){faqIcons(e.target);});
  ['srcN1', 'srcN2', 'srcIntro'].forEach(function (id) { new MutationObserver(copy).observe($(id), { childList: true, characterData: true, subtree: true }); });

  // Lo que aparece, se dibuja o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null;
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .fan:not(.in), .letters:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .fan, #invite .letters').forEach(function (el) { el.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .18 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  // Satin light and a gentle suspended motion; opening never creates particles.
  var op = $('open'), medal = $('medal'), timer = null;
  function enter() { clearTimeout(timer); invite.inert=false; invite.classList.add('is-open'); op.classList.add('is-leaving'); op.inert=true; op.classList.add('gone'); document.body.classList.remove('locked'); watch(); }
  op.removeAttribute('aria-modal');
  op.addEventListener('transitionend',function(e){if(e.target===op && e.propertyName==='opacity' && op.classList.contains('gone')) {medal.classList.remove('pop');op.classList.add('is-settled');}});
  medal.addEventListener('click', function () {
    if (op.classList.contains('gone') || medal.classList.contains('pop')) return;
    LazoMusic.play();
    if (reduce.matches) { enter(); $('demoBar').hidden = document.documentElement.classList.contains('lz-content'); document.querySelector('.hero h1').focus({preventScroll:true}); return; }
    medal.classList.add('pop');
    timer = setTimeout(function () { enter(); $('demoBar').hidden = document.documentElement.classList.contains('lz-content'); window.scrollTo({top:0,behavior:'instant'}); document.querySelector('.hero h1').focus({preventScroll:true}); }, 180);
  });

  // Para el editor de Lazo (demo/shared/content.js): saltar o volver a mostrar el medallón.
  window.LzTemplate = {
    open: function () { enter(); },
    envelope: function () { clearTimeout(timer); op.classList.remove('is-leaving','is-settled'); op.inert=false; invite.inert=true; invite.classList.remove('is-open'); medal.classList.remove('pop'); op.classList.remove('gone'); document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 10, behavior: now ? 'instant' : 'smooth' }); }
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
    var error=document.createElement('p');error.className='gala-person-error';error.id='gala-person-error-'+i;error.hidden=true;error.textContent=S.pendingPerson;
    [[S.yes, true, S.yes], [S.no, false, S.noL]].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-label', o[2]); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-describedby',error.id);
      b.addEventListener('click', function () { att[i] = o[1];row.classList.remove('is-invalid');error.hidden=true; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('rsErr').hidden = true; });
      g.appendChild(b);
    });
    row.appendChild(n); row.appendChild(g); row.appendChild(error); wrap.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    if (att.some(function (x) { return x === null; })) {
      $('rsErr').hidden=false;
      wrap.querySelectorAll('.person').forEach(function(row,i){var missing=att[i]===null;row.classList.toggle('is-invalid',missing);row.querySelector('.gala-person-error').hidden=!missing;});
      wrap.querySelectorAll('.person')[att.indexOf(null)].querySelector('button').focus();return;
    }
    $('rsGuests').replaceChildren();
    PEOPLE.forEach(function(name,i){var li=document.createElement('li');li.textContent=name+' — '+(att[i]?S.yes:S.no);$('rsGuests').appendChild(li);});
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex=-1; $('rsDone').focus({preventScroll:true}); $('rsDone').scrollIntoView({block:'center',behavior:reduce.matches?'instant':'smooth'});
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false;wrap.querySelector('button[aria-pressed=true]').focus(); });
})();
