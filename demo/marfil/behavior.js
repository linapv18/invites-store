
(function () {
  var S = window.MarfilS, $ = function (id) { return document.getElementById(id); };
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + ' ' + S.y + ' ' + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  function fitNames(){var n=document.querySelectorAll('.mcard .write');document.querySelector('.mcard').classList.toggle('long-names',[].some.call(n,function(e){return e.textContent.length>11;}));}
  function booking(){var a=document.querySelector('[data-lz-href=hotelLink]'),n=document.querySelector('.demo-booking');if(a.getAttribute('href')==='#viaje')a.hidden=true;n.hidden=!a.hidden;fitNames();}
  document.addEventListener('lz-render',booking);booking();

  // Lo que aparece, crece, se dibuja o se escribe al llegar a la pantalla (después de abrir la invitación).
  var io = null, show = function (el) { el.classList.add('in'); el.querySelectorAll(':scope > .write').forEach(function (w) { w.classList.add('in'); }); };
  function observe(root) { if (io) root.querySelectorAll('[data-rv]:not(.in), .grow:not(.in), .draw:not(.in), .writes:not(.in)').forEach(function (el) { if (!el.closest('.opening')) io.observe(el); }); }
  function watch() {
    if (io) return;
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('#invite [data-rv], #invite .grow, #invite .draw, #invite .writes').forEach(show); return; }
    // Los nombres escritos están recortados (clip-path) y no cuentan como visibles: se observa su contenedor.
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .18 });
    observe(document);
  }
  document.addEventListener('lz-render', function (e) { observe(e.target); });

  // Barra de consulta al bajar.
  var bar = $('mbar'), raf = 0, opened = false;
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520); });
  }, { passive: true });

  function tintBow(){
    var rgb=getComputedStyle(document.querySelector('.silk-tint')).backgroundColor.match(/[\d.]+/g).slice(0,3).map(Number),r=rgb[0]/255,g=rgb[1]/255,b=rgb[2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0;
    if(d)h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;
    document.querySelector('.wrap').style.setProperty('--bow-hue',(h*60-352).toFixed(1)+'deg');
  }
  tintBow();new MutationObserver(tintBow).observe(document.documentElement,{attributes:true,attributeFilter:['style']});

  // Apertura en dos pasos: seda, papel vegetal y tarjeta.
  var op = $('open'), wrap = $('wrap'), hint = $('hint'), timers = [], film = null, filmUrl = '', untying = false;
  var defaultClip = {animated:'/assets/marfil/lazo-desatar.webp?v=2',duration:2084}, animationCache = {};
  // Cache bytes, never an animated image decoder: Safari can retain its final frame.
  function animationBytes(src){
    if(!animationCache[src])animationCache[src]=fetch(src,{cache:'force-cache'}).then(function(response){
      if(!response.ok)throw new Error('Ribbon animation unavailable');return response.blob();
    }).catch(function(){delete animationCache[src];return null;});
    return animationCache[src];
  }
  if(!reduced)animationBytes((window.MarfilBowClip || defaultClip).animated || defaultClip.animated);
  function removeFilm(){
    var old=film;film=null;
    if(old){if(old.tagName==='VIDEO'){old.pause();old.querySelectorAll('source').forEach(function(source){source.removeAttribute('src');});old.removeAttribute('src');old.load();}else old.removeAttribute('src');old.remove();}
    if(filmUrl){URL.revokeObjectURL(filmUrl);filmUrl='';}
  }
  var clear = function () { timers.forEach(clearTimeout); timers = []; untying=false; removeFilm();wrap.classList.remove('playing-bow'); };
  function reveal() { wrap.classList.add('untie', 'open', 'reveal'); wrap.querySelectorAll('.grow, .draw, .writes').forEach(show); hint.textContent = $('closing').textContent; $('enter').tabIndex = 0; $('enter').disabled=false; $('bow').tabIndex=-1; }
  function finishUntie(){
    if(!untying)return;
    untying=false;timers.forEach(clearTimeout);timers=[];removeFilm();
    wrap.classList.remove('playing-bow');wrap.classList.add('untie');
    timers.push(setTimeout(function(){reveal();$('enter').focus({preventScroll:true});},reduced?0:400));
  }
  $('bow').addEventListener('click', function () {
    if (wrap.classList.contains('untie') || untying) return;
    clear(); LazoMusic.play();untying=true;
    var clip=window.MarfilBowClip || defaultClip;
    if(!reduced && clip && clip.animated){
      var image=document.createElement('img'),loadTimeout;
      film=image;image.className='bow-film';image.alt='';image.setAttribute('aria-hidden','true');
      image.addEventListener('load',function(){
        if(!untying || film!==image)return;
        clearTimeout(loadTimeout);wrap.classList.add('playing-bow');timers.push(setTimeout(finishUntie,clip.duration || 2084));
      },{once:true});
      image.addEventListener('error',function(){if(film===image)finishUntie();},{once:true});
      wrap.appendChild(image);loadTimeout=setTimeout(function(){if(film===image)finishUntie();},6000);timers.push(loadTimeout);
      animationBytes(clip.animated).then(function(blob){
        if(!untying || film!==image)return;
        if(!blob){finishUntie();return;}
        filmUrl=URL.createObjectURL(blob);image.src=filmUrl;
      });
    }else if(!reduced && clip && (clip.webm || clip.hevc)){
      film=document.createElement('video');film.className='bow-film';film.muted=true;film.playsInline=true;film.preload='auto';film.setAttribute('aria-hidden','true');film.setAttribute('playsinline','');
      [['hevc','video/mp4; codecs="hvc1"'],['webm','video/webm; codecs="vp9"']].forEach(function(pair){if(clip[pair[0]]){var source=document.createElement('source');source.src=clip[pair[0]];source.type=pair[1];film.appendChild(source);}});
      film.addEventListener('playing',function(){wrap.classList.add('playing-bow');},{once:true});
      film.addEventListener('ended',finishUntie,{once:true});film.addEventListener('error',finishUntie,{once:true});wrap.appendChild(film);
      film.play().catch(finishUntie);timers.push(setTimeout(finishUntie,3500));
    }else{finishUntie();}
  });
  function enter() { clear(); opened = true; op.classList.add('gone'); op.inert=true; $('invite').inert=false; document.body.classList.remove('locked'); watch(); }
  $('enter').addEventListener('click', function () { enter(); $('demoBar').hidden = false; window.scrollTo(0, 0); var h=document.querySelector('.hero h1');h.tabIndex=-1;h.focus({preventScroll:true}); });

  // Para el editor de Lazo (demo/shared/content.js): saltar o volver a mostrar el papel con el lazo.
  window.LzTemplate = {
    open: function () { reveal(); enter(); },
    envelope: function () { clear(); opened = false; bar.classList.remove('show'); wrap.classList.remove('untie', 'open', 'reveal'); wrap.querySelectorAll('.in').forEach(function (e) { e.classList.remove('in'); }); $('enter').tabIndex = -1; $('enter').disabled=true; $('bow').tabIndex=0; op.inert=false; $('invite').inert=true; hint.textContent = S.hint; op.classList.remove('gone'); document.body.classList.add('locked'); window.scrollTo(0, 0); },
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 70, behavior: now ? 'instant' : 'smooth' }); }
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
    var error=document.createElement('p'); error.className='person-error'; error.id='person-error-'+i; error.hidden=true; error.textContent=S.err; row.setAttribute('aria-describedby',error.id);
    var g = document.createElement('div');
    [[S.yes, true], [S.no, false]].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { att[i] = o[1]; error.hidden=true; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('rsErr').hidden = true; });
      g.appendChild(b);
    });
    row.appendChild(n); row.appendChild(g); row.appendChild(error); wrapP.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    wrapP.querySelectorAll('.person-error').forEach(function(e,i){e.hidden=att[i]!==null;});
    if (att.some(function (x) { return x === null; })) { $('rsErr').hidden = false; wrapP.children[att.indexOf(null)].querySelector('button').focus(); return; }
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list=document.createElement('ul'); list.className='reply-list'; PEOPLE.forEach(function(name,i){var li=document.createElement('li'), b=document.createElement('b');b.textContent=name;li.appendChild(b);li.appendChild(document.createTextNode(att[i]?S.yes:S.no));list.appendChild(li);}); $('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false; $('rsDone').tabIndex=-1; $('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false; wrapP.querySelector('button').focus(); });
})();
