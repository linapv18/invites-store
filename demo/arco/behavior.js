
(function () {
  var S = window.ArcoS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (LANG === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lo que aparece (y las fotos que se revelan) al llegar a la pantalla, después de abrir la invitación.
  var io = null, show = function (el) { el.classList.add('in'); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in)').forEach(function (el) { io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv]').forEach(show); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .15 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); syncSala(); });

  // Los nombres van en mayúsculas grandes: si uno es largo, la letra baja hasta que cabe en su línea (nunca se parte).
  var namesEl = document.querySelector('.hero .names'), fitRaf = 0;
  function fitNames() {
    fitRaf = 0; namesEl.style.fontSize = '';
    var style = getComputedStyle(namesEl), w = namesEl.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), widest = 0;
    namesEl.querySelectorAll('[data-lz]').forEach(function (n) { widest = Math.max(widest, n.scrollWidth); });
    if (widest > w && widest) namesEl.style.fontSize = Math.floor(parseFloat(getComputedStyle(namesEl).fontSize) * w / widest) + 'px';
  }
  var fitSoon = function () { if (!fitRaf) fitRaf = requestAnimationFrame(fitNames); };
  new MutationObserver(fitSoon).observe(namesEl, { subtree: true, childList: true, characterData: true });
  if ('ResizeObserver' in window) new ResizeObserver(fitSoon).observe(namesEl); else window.addEventListener('resize', fitSoon);
  if (document.fonts) document.fonts.ready.then(fitSoon); fitSoon();

  function fitMonograms() {
    document.querySelectorAll('[data-lz-seal]').forEach(function (box) {
      var mark = box.querySelector('.lz-seal'); if (!mark) return;
      mark.style.transform = ''; var r = mark.getBoundingClientRect();
      mark.style.transform = 'scale(' + Math.min(1, box.clientWidth / (Math.max(r.width, mark.scrollWidth) || 1), box.clientHeight / (Math.max(r.height, mark.scrollHeight) || 1)) + ')';
    });
  }
  document.addEventListener('lz-render', function () { requestAnimationFrame(fitMonograms); });
  window.addEventListener('resize', fitMonograms); if (document.fonts) document.fonts.ready.then(fitMonograms); fitMonograms();

  var bar = $('mbar'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; bar.classList.toggle('show', opened && window.pageYOffset > 520); });
  }, { passive: true });

  // «Te esperamos en»: repite el lugar, la dirección y el mapa del primer evento del programa.
  function syncSala() {
    var ev = document.querySelector('.evs > .ev'); if (!ev) { $('venue').classList.add('lz-off'); return; }
    var pl = ev.querySelector('[data-lz-f="place"]'), ad = ev.querySelector('[data-lz-f="address"]'), mp = ev.querySelector('[data-lz-f="map"]');
    var sala = $('venue');
    $('venueName').textContent = pl ? pl.textContent : '';
    $('venueAddr').textContent = ad ? ad.textContent : '';
    $('venueMap').hidden = !mp || mp.classList.contains('lz-off');
    if (mp) $('venueMap').href = mp.href;
    sala.classList.toggle('lz-off', !(pl && pl.textContent.trim()));
  }
  syncSala();

  var TARGET = new Date(2027, 2, 14, 13, 0).getTime();

  // La arcada avanza de arco en arco con las flechas.
  var strip = $('strip');
  function stripState() { document.querySelectorAll('[data-strip]').forEach(function (b) { b.disabled = +b.dataset.strip < 0 ? strip.scrollLeft < 2 : strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 2; }); }
  strip.addEventListener('scroll', stripState, { passive: true });
  window.addEventListener('resize', stripState); document.addEventListener('lz-render', function () { requestAnimationFrame(stripState); }); stripState();
  document.querySelectorAll('[data-strip]').forEach(function (b) {
    b.addEventListener('click', function () { var f = strip.querySelector('.arc-item'); strip.scrollBy({ left: (+b.dataset.strip) * ((f ? f.offsetWidth : 150) + 20), behavior: still ? 'instant' : 'smooth' }); });
  });

  // El vaho es una superficie borrable: cada pasada persiste hasta reiniciar la apertura.
  var op = $('open'), win = $('win'), mist = win.querySelector('.mist'), rainTexture = new Image();
  rainTexture.src = '/assets/arco/lluvia-cristal.webp';
  var W = 280, H = 400, density = Math.min(devicePixelRatio || 1, 2), timers = [], guideRaf = 0;
  var surface = document.createElement('canvas'), erased = document.createElement('canvas');
  var ctx = mist.getContext('2d'), fog = surface.getContext('2d'), brush = erased.getContext('2d');
  [mist, surface, erased].forEach(function (c) { c.width = W * density; c.height = H * density; });
  [ctx, fog, brush].forEach(function (c) { c.scale(density, density); });
  var photo = win.querySelector('.clear img'), ready = false, pointer = null, last = null, lastMeasure = 0;
  var randomSeed = 271;
  function random() { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; }
  function paintMist() {
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(surface, 0, 0, W, H);
    ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(erased, 0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  }
  function makeMist() {
    fog.clearRect(0, 0, W, H); fog.fillStyle = '#acb8ac'; fog.fillRect(0, 0, W, H);
    if (photo.complete && photo.naturalWidth) {
      var scale = Math.max(W / photo.naturalWidth, H / photo.naturalHeight), iw = photo.naturalWidth * scale, ih = photo.naturalHeight * scale;
      fog.save(); fog.filter = 'blur(13px) saturate(.65)'; fog.drawImage(photo, (W - iw) / 2 - 8, (H - ih) * .7 - 8, iw + 16, ih + 16); fog.restore();
    }
    var veil = fog.createLinearGradient(0, 0, W, H); veil.addColorStop(0, '#e5eae2b8'); veil.addColorStop(.5, '#e2e8e0a8'); veil.addColorStop(1, '#c2d0c3b8'); fog.fillStyle = veil; fog.fillRect(0, 0, W, H);
    randomSeed = 271;
    // Overlapping cloudy patches and microscopic droplets, all in one cheap static layer.
    for (var i = 0; i < 55; i++) {
      var x = random() * W, y = random() * H, r = 15 + random() * 65, cloud = fog.createRadialGradient(x, y, 0, x, y, r);
      cloud.addColorStop(0, i % 2 ? '#ffffff10' : '#506b5910'); cloud.addColorStop(1, '#ffffff00'); fog.fillStyle = cloud; fog.fillRect(x-r,y-r,r*2,r*2);
    }
    // A photographic alpha texture replaces all synthetic circles and streaks.
    // It belongs to the wipeable surface, so water and condensation disappear together.
    if (rainTexture.complete && rainTexture.naturalWidth) {
      fog.save(); fog.globalAlpha = .72; fog.drawImage(rainTexture, 0, 0, W, H); fog.restore();
    }
    var text = win.querySelector('.fog-txt'), names = text.querySelector('.sig').textContent.trim(), date = text.querySelector('.fog-d').textContent;
    fog.save(); fog.textAlign = 'center'; fog.fillStyle = '#36513cb8'; fog.shadowColor = '#ffffffaa'; fog.shadowOffsetY = 1;
    fog.font = '42px "Mrs Saint Delafield", cursive'; var fs = Math.min(42, 240 / Math.max(1, fog.measureText(names).width) * 42);
    fog.font = fs + 'px "Mrs Saint Delafield", cursive'; fog.fillText(names, W/2, H*.48);
    fog.font = '11px "Albert Sans", sans-serif'; fog.fillText(date, W/2, H*.55); fog.restore(); paintMist();
  }
  function measure() {
    var pixels=brush.getImageData(0,0,erased.width,erased.height).data,total=0,clean=0;
    for(var y=8;y<H;y+=8)for(var x=8;x<W;x+=8){if(y<140 && Math.pow((x-140)/140,2)+Math.pow((y-140)/140,2)>1)continue;total++;if(pixels[(Math.floor(y*density)*erased.width+Math.floor(x*density))*4+3]>180)clean++;}
    if(!ready && clean/total>=.72){ready=true;$('wipeHint').textContent=S.ready;op.classList.add('wiped');timers.push(setTimeout(beginOpen,still?0:650));}
  }
  function dab(x,y) {
    var r=25, soft=brush.createRadialGradient(x,y,r*.64,x,y,r);soft.addColorStop(0,'#000');soft.addColorStop(.82,'#000e');soft.addColorStop(1,'#0000');brush.fillStyle=soft;brush.fillRect(x-r,y-r,r*2,r*2);
  }
  function stroke(point) {
    if(last){var distance=Math.hypot(point.x-last.x,point.y-last.y),steps=Math.ceil(distance/5);for(var i=1;i<=steps;i++)dab(last.x+(point.x-last.x)*i/steps,last.y+(point.y-last.y)*i/steps);}else dab(point.x,point.y);
    last=point;paintMist();var now=performance.now();if(now-lastMeasure>140){measure();lastMeasure=now;}
  }
  function point(e){var r=win.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  win.addEventListener('pointerdown',function(e){if(e.button!==0||pointer!==null||op.classList.contains('open'))return;e.preventDefault();pointer=e.pointerId;last=null;win.setPointerCapture(pointer);LazoMusic.play();stroke(point(e));});
  win.addEventListener('pointermove',function(e){if(e.pointerId!==pointer)return;e.preventDefault();var events=e.getCoalescedEvents?e.getCoalescedEvents():[e];if(!events.length)events=[e];events.forEach(function(sample){stroke(point(sample));});});
  function release(e){if(e.pointerId!==pointer)return;pointer=null;last=null;measure();}
  win.addEventListener('pointerup',release);win.addEventListener('pointercancel',release);win.addEventListener('lostpointercapture',release);
  var clear = function(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(guideRaf);guideRaf=0;};
  function enter(){clear();opened=true;op.classList.add('open','gone');op.inert=true;op.setAttribute('aria-hidden','true');$('invite').inert=false;document.body.classList.remove('locked');watch();$('demoBar').hidden=false;window.scrollTo(0,0);namesEl.focus({preventScroll:true});}
  // Keyboard users receive the same reveal as several slow cloth passes, rather than a tap-to-clear circle.
  win.addEventListener('click',function(e){if(e.detail!==0||ready||guideRaf)return;LazoMusic.play();if(still){brush.fillStyle='#000';brush.fillRect(0,0,W,H);paintMist();measure();return;}var start=performance.now();last=null;function guide(now){var t=Math.min(1,(now-start)/3600),row=Math.min(7,Math.floor(t*8)),u=(t*8)%1;stroke({x:row%2?250-u*220:30+u*220,y:30+row*48});if(t<1)guideRaf=requestAnimationFrame(guide);else{guideRaf=0;last=null;brush.fillStyle='#000';brush.fillRect(0,0,W,H);paintMist();measure();}}guideRaf=requestAnimationFrame(guide);});
  function beginOpen(){clear();if(pointer!==null&&win.hasPointerCapture(pointer))win.releasePointerCapture(pointer);pointer=null;last=null;op.classList.add('open');timers.push(setTimeout(enter,still?0:900));}
  function resetGlass(){clear();pointer=null;last=null;ready=false;brush.clearRect(0,0,W,H);$('wipeHint').textContent=S.hint;op.classList.remove('open','gone','wiped');makeMist();}
  photo.addEventListener('load',makeMist);new MutationObserver(makeMist).observe(win.querySelector('.fog-txt'),{childList:true,subtree:true,characterData:true});
  if(document.fonts)document.fonts.ready.then(makeMist);makeMist();
  rainTexture.addEventListener('load', makeMist);
  window.LzTemplate={open:function(){enter();},envelope:function(){opened=false;bar.classList.remove('show');op.inert=false;op.removeAttribute('aria-hidden');$('invite').inert=true;document.body.classList.add('locked');window.scrollTo(0,0);resetGlass();},scroll:function(el,now){window.scrollTo({top:el.getBoundingClientRect().top+scrollY-70,behavior:now||still?'instant':'smooth'});}};

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
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
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'ar-p' + i;
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
