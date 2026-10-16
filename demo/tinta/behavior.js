
(function () {
  var S = window.TintaS, $ = function (id) { return document.getElementById(id); };
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var PEOPLE = ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  LazoPanel.init({ mono: 'A&L', couple: S.n1 + (LANG === 'en' ? ' and ' : ' y ') + S.n2, link: location.pathname, guest: S.guest, people: PEOPLE });
  LazoMusic.init({ src: '/assets/musica/demo.mp3' });

  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The envelope follows the actual length of the editor's letter.
  var letter=document.querySelector('.letter'), envelope=document.querySelector('.renv');
  function measureLetter(){envelope.style.setProperty('--letter-height',letter.offsetHeight+'px');}
  measureLetter();window.addEventListener('resize',measureLetter);
  if(document.fonts)document.fonts.ready.then(measureLetter);
  if('ResizeObserver' in window)new ResizeObserver(measureLetter).observe(letter);

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

  var bar = $('mbar'), img = $('heroImg'), raf = 0, opened = false;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; var y = window.pageYOffset; bar.classList.toggle('show', opened && y > 520);  });
  }, { passive: true });

  // Calendario (día anterior, el día y el siguiente) y matasellos con la fecha de la boda: la del editor llega en window.LZ_T.
  var TARGET = new Date(2027, 2, 14, 13, 0).getTime(), calDay = '';
  function calFill() {
    var t = new Date(window.LZ_T || TARGET), city = (document.querySelector('[data-lz="city"]') || {}).textContent || S.city, key = t.toDateString() + '|' + city; if (key === calDay) return; calDay = key;
    var loc = LANG === 'en' ? 'en-US' : 'es', pad = function (n) { return String(n).padStart(2, '0'); };
    document.querySelectorAll('.cal').forEach(function (c) {
      c.querySelectorAll(':scope > .cal-cell').forEach(function (cell, i) {
        var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i - 1);
        cell.querySelector('.wd').textContent = d.toLocaleDateString(loc, { weekday: 'long' });
        cell.querySelector('.mo').textContent = d.toLocaleDateString(loc, { month: 'long' });
        cell.querySelector('.dn').textContent = d.getDate();
      });
    });
    $('ttCal').setAttribute('aria-label',S.mark + ': ' + t.toLocaleDateString(loc,{dateStyle:'full'}));
    $('pmText').textContent = city.split(',')[0].toUpperCase() + ' · ' + (LANG === 'en' ? pad(t.getMonth() + 1) + '.' + pad(t.getDate()) : pad(t.getDate()) + '.' + pad(t.getMonth() + 1)) + '.' + t.getFullYear() + ' ·';
  }
  calFill();

  // The calendar is a native button. Reveal text and enable entry together.
  var op=$('open'),hint=$('hint'),timers=[],after=op.querySelector('.after');
  var clear=function(){timers.forEach(clearTimeout);timers=[];};
  function reveal(){
    op.classList.add('open');$('ttCal').classList.add('circled');$('ttCal').setAttribute('aria-pressed','true');$('ttCal').disabled=true;
    hint.textContent=op.querySelector('.lz-closing').textContent;
  }
  function enableEntry(){after.inert=false;$('enter').disabled=false;$('enter').tabIndex=0;$('enter').focus({preventScroll:true});$('enter').scrollIntoView({block:'nearest',behavior:still?'instant':'smooth'});}
  function mark(){if(op.classList.contains('open'))return;clear();LazoMusic.play();reveal();timers.push(setTimeout(enableEntry,still?0:750));}
  $('ttCal').addEventListener('click',mark);
  function enter(){
    clear();opened=true;op.classList.add('gone');op.inert=true;op.setAttribute('aria-hidden','true');
    $('invite').inert=false;document.body.classList.remove('locked');watch();$('demoBar').hidden=false;window.scrollTo(0,0);
    var title=document.querySelector('.hero h1');title.tabIndex=-1;title.focus({preventScroll:true});
  }
  $('enter').addEventListener('click',enter);
  window.LzTemplate={
    open:function(){reveal();enter();},
    envelope:function(){
      clear();opened=false;bar.classList.remove('show');op.classList.remove('open','gone');op.inert=false;op.removeAttribute('aria-hidden');
      $('ttCal').classList.remove('circled');$('ttCal').setAttribute('aria-pressed','false');$('ttCal').disabled=false;
      after.inert=true;$('enter').disabled=true;$('enter').tabIndex=-1;hint.textContent=S.hint;$('invite').inert=true;
      document.body.classList.add('locked');window.scrollTo(0,0);op.scrollTop=0;
    },
    scroll:function(el,now){window.scrollTo({top:el.getBoundingClientRect().top+scrollY-70,behavior:now||still?'instant':'smooth'});}
  };
  if('IntersectionObserver' in window){var motion=new IntersectionObserver(function(entries){entries.forEach(function(e){e.target.classList.toggle('motion-active',e.isIntersecting);});});document.querySelectorAll('.hero,.cheers').forEach(function(e){motion.observe(e);});}
  document.addEventListener('visibilitychange',function(){document.documentElement.classList.toggle('motion-paused',document.hidden);});

  // Cuenta regresiva (la fecha del editor llega en window.LZ_T)
  var pad = function (n) { return String(n).padStart(2, '0'); }, cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (e) { cd[e.dataset.cd] = e; });
  function tick() { var s = Math.floor(Math.max(0, (window.LZ_T || TARGET) - Date.now()) / 1000); cd.d.textContent = pad(Math.floor(s / 86400)); cd.h.textContent = pad(Math.floor(s / 3600) % 24); cd.m.textContent = pad(Math.floor(s / 60) % 60); cd.s.textContent = pad(s % 60); }
  tick(); setInterval(function () { tick(); calFill(); }, 1000);

  // Confirmación por persona (demo: no se envía a ningún lado)
  var att = PEOPLE.map(function () { return null; }), wrapP = $('people');
  PEOPLE.forEach(function (name, i) {
    var row = document.createElement('div'); row.className = 'person'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', name);
    var n = document.createElement('span'); n.textContent = name;
    var error=document.createElement('p');error.className='person-error';error.id='person-error-'+i;error.hidden=true;error.textContent=LANG==='en'?'Please select an answer.':'Selecciona una respuesta.';row.setAttribute('aria-describedby',error.id);
    var g = document.createElement('div');
    [[S.yes, true], [S.no, false]].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { att[i] = o[1];error.hidden=true; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('rsErr').hidden = true; });
      g.appendChild(b);
    });
    row.appendChild(n); row.appendChild(g);row.appendChild(error); wrapP.appendChild(row);
  });
  $('rsSave').addEventListener('click', function () {
    wrapP.querySelectorAll('.person-error').forEach(function(e,i){e.hidden=att[i]!==null;});
    if (att.some(function (x) { return x === null; })) { $('rsErr').hidden = false;wrapP.children[att.indexOf(null)].querySelector('button').focus();return; }
    $('rsSum').textContent = S.will(att.filter(Boolean).length, PEOPLE.length);
    var list=document.createElement('ul');list.className='reply-list';PEOPLE.forEach(function(name,i){var li=document.createElement('li'),b=document.createElement('b');b.textContent=name;li.appendChild(b);li.appendChild(document.createTextNode(att[i]?S.yes:S.no));list.appendChild(li);});$('rsSum').appendChild(list);
    $('rsForm').hidden = true; $('rsDone').hidden = false;$('rsDone').tabIndex=-1;$('rsDone').focus();
    LazoPanel.setResponse(att, $('note').value.trim());
  });
  $('rsEdit').addEventListener('click', function () { $('rsDone').hidden = true; $('rsForm').hidden = false;wrapP.querySelector('button').focus(); });
})();
