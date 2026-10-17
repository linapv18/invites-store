
(function () {
  var S = window.EstrenoS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (LANG === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches, lights = null;

  // Lo que aparece (y las fotos que se revelan) al llegar a la pantalla, después de abrir la invitación.
  var io = null, show = function (el) { el.classList.add('in'); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in)').forEach(function (el) { io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv]').forEach(show); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .08 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); syncSala(); });

  // The heart is a real cutout in the velvet layer; the editable photo remains behind it.
  var sleeve=$('sleeve'),cut=sleeve.querySelector('.op-cut'),cutRAF=0;
  var heartPath='M66 118C24 92 4 66 4 40 4 18 20 4 38 4c12 0 22 6 28 16C72 10 82 4 94 4c18 0 34 14 34 36 0 26-20 52-62 78Z';
  function fitCutout(){
    cutRAF=0;var w=sleeve.clientWidth,h=sleeve.clientHeight,x=cut.offsetLeft,y=cut.offsetTop,cw=cut.offsetWidth,ch=cut.offsetHeight;
    if(!w||!h)return;
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><defs><mask id="cut"><rect width="100%" height="100%" fill="white"/><path d="'+heartPath+'" transform="translate('+x+' '+y+') scale('+(cw/132)+' '+(ch/120)+')" fill="black"/></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#cut)"/></svg>';
    sleeve.style.setProperty('--sleeve-mask','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');
    if(!cut.querySelector('.op-cut-rim')){var rim=document.createElementNS('http://www.w3.org/2000/svg','svg');rim.classList.add('op-cut-rim');rim.setAttribute('viewBox','0 0 132 120');rim.setAttribute('preserveAspectRatio','none');rim.setAttribute('aria-hidden','true');rim.innerHTML='<path d="'+heartPath+'" fill="none" stroke="#fff0c688" stroke-width="1.2"/>';cut.appendChild(rim);}
  }
  function scheduleCutout(){if(!cutRAF)cutRAF=requestAnimationFrame(fitCutout);}
  if('ResizeObserver' in window){var cutResize=new ResizeObserver(scheduleCutout);cutResize.observe(sleeve);cutResize.observe(cut);}else window.addEventListener('resize',scheduleCutout);
  scheduleCutout();if(document.fonts)document.fonts.ready.then(scheduleCutout);
  var monoRAF=0;
  function fitMonograms(){monoRAF=0;document.querySelectorAll('[data-lz-seal]').forEach(function(box){var mark=box.querySelector('.lz-seal');if(!mark)return;mark.style.setProperty('--mono-fit','1');var r=mark.getBoundingClientRect(),b=box.getBoundingClientRect();if(r.width&&r.height)mark.style.setProperty('--mono-fit',Math.min(1,b.width/r.width,b.height/r.height).toFixed(4));});}
  function scheduleMonograms(){if(!monoRAF)monoRAF=requestAnimationFrame(fitMonograms);}
  document.querySelectorAll('[data-lz-seal]').forEach(function(box){new MutationObserver(scheduleMonograms).observe(box,{subtree:true,childList:true,characterData:true});if('ResizeObserver' in window)new ResizeObserver(scheduleMonograms).observe(box);});
  scheduleMonograms();if(document.fonts)document.fonts.ready.then(scheduleMonograms);

  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; bar.classList.toggle('show', opened && window.pageYOffset > 520); });
  }, { passive: true });

  // La sala: el letrero repite el lugar, la dirección y el mapa del primer evento del programa.
  function syncSala() {
    var ev = document.querySelector('.evs > .ev'); if (!ev) { document.querySelector('.sala').classList.add('lz-off'); return; }
    var pl = ev.querySelector('[data-lz-f="place"]'), ad = ev.querySelector('[data-lz-f="address"]'), mp = ev.querySelector('[data-lz-f="map"]');
    var sala = document.querySelector('.sala');
    $('salaName').textContent = pl ? pl.textContent : '';
    $('salaAddr').textContent = ad ? ad.textContent : '';
    $('salaMap').hidden = !mp || mp.classList.contains('lz-off');
    if (mp) $('salaMap').href = mp.href;
    sala.classList.toggle('lz-off', !(pl && pl.textContent.trim()));
  }
  syncSala();

  // Semana de la boda (lunes a domingo) con un corazón en el día; la fecha del editor llega en window.LZ_T.
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), weekDay = '';
  var HEART_SVG = '<svg class="heart" viewBox="0 0 46 42" aria-hidden="true"><path d="M23 39C8 29 2 20 5 12c3-7 12-8 18-1 6-7 15-6 18 1 3 8-3 17-18 27Z"/></svg>';
  function weekFill() {
    var t = new Date(window.LZ_T || TARGET), key = t.toDateString(); if (key === weekDay) return; weekDay = key;
    var start = t.getDate() - (t.getDay() + 6) % 7;
    $('week').querySelectorAll('b').forEach(function (b, i) {
      var d = new Date(t.getFullYear(), t.getMonth(), start + i), hit = d.getDate() === t.getDate();
      b.className = hit ? 'hit' : ''; b.innerHTML = (hit ? HEART_SVG : '') + d.getDate();
    });
  }
  weekFill();

  // One clockwise ignition; every bulb stays lit afterwards, including on return scroll.
  var lightFrames=[].slice.call(document.querySelectorAll('.marquee,.board,.sign'));
  var lightNS='http://www.w3.org/2000/svg',lightCounter=0;
  function renderLamps(el){
    var w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;
    var old=el.querySelector(':scope > .marquee-lamps');
    if(old&&old.dataset.size===w+'x'+h)return;
    var inset=parseFloat(getComputedStyle(el).getPropertyValue('--b'))/2||13.5;
    var gap=parseFloat(getComputedStyle(el).getPropertyValue('--g'))||31;
    var nx=Math.max(1,Math.round((w-2*inset)/gap)),ny=Math.max(1,Math.round((h-2*inset)/gap)),points=[];
    for(var i=0;i<nx;i++)points.push([inset+(w-2*inset)*i/nx,inset]);
    for(var i=0;i<ny;i++)points.push([w-inset,inset+(h-2*inset)*i/ny]);
    for(var i=0;i<nx;i++)points.push([w-inset-(w-2*inset)*i/nx,h-inset]);
    for(var i=0;i<ny;i++)points.push([inset,h-inset-(h-2*inset)*i/ny]);
    var id='esLamp'+(++lightCounter),svg=document.createElementNS(lightNS,'svg');
    svg.classList.add('marquee-lamps');svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.dataset.size=w+'x'+h;
    svg.innerHTML='<defs><radialGradient id="'+id+'halo"><stop stop-color="var(--bulb)" stop-opacity=".6"/><stop offset=".38" stop-color="var(--bulb)" stop-opacity=".22"/><stop offset="1" stop-color="var(--bulb)" stop-opacity="0"/></radialGradient><radialGradient id="'+id+'glass" cx="32%" cy="25%" r="78%"><stop stop-color="#fffef5"/><stop offset=".24" stop-color="#fff7d9"/><stop offset=".62" stop-color="var(--bulb)"/><stop offset="1" stop-color="#b18345"/></radialGradient><linearGradient id="'+id+'socket" x2=".8" y2="1"><stop stop-color="#b09a71"/><stop offset=".4" stop-color="#554332"/><stop offset="1" stop-color="#19120d"/></linearGradient></defs>';
    svg.innerHTML+=points.map(function(p,i){var x=p[0].toFixed(2),y=p[1].toFixed(2);return '<g class="marquee-lamp" style="--lamp-delay:'+(i/points.length*1.0).toFixed(3)+'s"><circle cx="'+x+'" cy="'+y+'" r="6.2" fill="url(#'+id+'socket)" stroke="#0b0806" stroke-width=".7"/><g class="lamp-glow"><circle cx="'+x+'" cy="'+y+'" r="16" fill="url(#'+id+'halo)"/></g><g class="lamp-glass"><circle cx="'+x+'" cy="'+y+'" r="4.45" fill="url(#'+id+'glass)"/><ellipse cx="'+(p[0]-.95).toFixed(2)+'" cy="'+(p[1]-1.3).toFixed(2)+'" rx="1.1" ry=".65" fill="#fff" opacity=".82"/><path d="M'+(p[0]-1.8).toFixed(2)+' '+(p[1]+.9).toFixed(2)+'q1.8-1.4 3.6 0" fill="none" stroke="#fffce1" stroke-width=".65" opacity=".9"/></g></g>';}).join('');
    if(old)old.replaceWith(svg);else el.appendChild(svg);
  }
  function ignite(el){
    if(el.classList.contains('lit'))return;
    el.classList.add('lit');
    if(still)el.classList.add('lamps-settled');
    else el._lampTimer=setTimeout(function(){el.classList.add('lamps-settled');},1650);
  }
  lightFrames.forEach(renderLamps);
  var lightRAF=0;
  function resizeLights(){if(!lightRAF)lightRAF=requestAnimationFrame(function(){lightRAF=0;lightFrames.forEach(renderLamps);});}
  if('ResizeObserver' in window){var lightResize=new ResizeObserver(resizeLights);lightFrames.forEach(function(el){lightResize.observe(el);});}
  else window.addEventListener('resize',resizeLights);
  if(document.fonts)document.fonts.ready.then(resizeLights);
  if('IntersectionObserver' in window&&!still){
    lights=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting&&opened){ignite(e.target);lights.unobserve(e.target);}});},{threshold:.12});
    lightFrames.forEach(function(el){lights.observe(el);});
  }else lightFrames.forEach(ignite);
  function resetLights(){lightFrames.forEach(function(el){clearTimeout(el._lampTimer);el.classList.remove('lit','lamps-settled');if(lights){lights.unobserve(el);lights.observe(el);}else ignite(el);});}

  // La tira de película avanza de fotograma en fotograma con las flechas.
  var strip = $('strip');
  document.querySelectorAll('[data-strip]').forEach(function (b) {
    b.addEventListener('click', function () { var f = strip.querySelector('.frame'); strip.scrollBy({ left: (+b.dataset.strip) * ((f ? f.offsetWidth : 150) + 10), behavior: still ? 'instant' : 'smooth' }); });
  });

  function updateStrip(){document.querySelector('[data-strip="-1"]').disabled=strip.scrollLeft<2;document.querySelector('[data-strip="1"]').disabled=strip.scrollLeft+strip.clientWidth>=strip.scrollWidth-2;}
  strip.addEventListener('scroll',updateStrip,{passive:true});if('ResizeObserver' in window)new ResizeObserver(updateStrip).observe(strip);else window.addEventListener('resize',updateStrip);document.addEventListener('lz-render',function(){requestAnimationFrame(updateStrip);scheduleCutout();});requestAnimationFrame(updateStrip);

  // Apertura: un solo gesto. La tarjeta sale de la funda, la funda cae y la portada se enciende.
  var op = $('open'), timers = [];
  var clear = function () { timers.forEach(clearTimeout); timers = []; };
  function enter() {
    clear(); opened = true; op.classList.add('open', 'gone'); op.inert = true; op.setAttribute('aria-hidden', 'true');
    $('invite').inert = false; document.body.classList.remove('locked'); watch(); $('demoBar').hidden = false; window.scrollTo(0, 0);
    document.querySelector('.hero .names').focus({ preventScroll: true });
    if (lights) document.querySelectorAll('.marquee,.board,.sign').forEach(function (el) { lights.unobserve(el); lights.observe(el); });
  }
  function part() { if (op.classList.contains('open')) return; clear(); LazoMusic.play(); op.classList.add('open'); timers.push(setTimeout(enter, still ? 0 : 2200)); }
  $('sleeve').addEventListener('click', part); $('enter').addEventListener('click', part);
  window.LzTemplate = {
    open: function () { op.classList.add('open'); enter(); },
    envelope: function () { clear(); opened = false; resetLights();bar.classList.remove('show'); op.classList.remove('open', 'gone'); op.inert = false; op.removeAttribute('aria-hidden'); $('invite').inert = true; document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: now || still ? 'instant' : 'smooth' }); }
  };

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000),values={d:pad(Math.floor(s / 86400)),h:pad(Math.floor(s / 3600) % 24),m:pad(Math.floor(s / 60) % 60),s:pad(s % 60)};Object.keys(values).forEach(function(k){if(cd[k].textContent===values[k])return;var first=cd[k].textContent==='--';cd[k].textContent=values[k];if(!first&&k!=='s'&&!still&&cd[k].animate)cd[k].animate([{transform:'translateY(-3px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:220,easing:'ease-out'});}); }
  tick(); setInterval(function () { tick(); weekFill(); }, 1000);

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
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'es-p' + i;
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
