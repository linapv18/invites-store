/* Romantic invitation: shared behavior for Spanish/English, with transient demo RSVP. */
(function () {
  'use strict';
  var en = document.documentElement.lang.slice(0, 2) === 'en';
  var S = en ? {
    dialog: 'Your invitation', yes: 'Yes', no: 'No', missing: 'Please answer for each guest.',
    personMissing: 'Choose Yes or No for this guest.', title: 'Will you join us?',
    intro: 'We have saved 4 seats for you. Please reply for each guest.',
    attending: 'See you soon', declining: 'We will miss you', received: 'Thank you for trying the RSVP. You can edit your answers below.',
    summary: function (n, total) { return n ? n + ' of ' + total + ' guests will attend.' : 'Thank you for letting us know.'; },
    demo: 'Demo: this reply is not sent and resets when you reload.', diet: 'Dietary requirements:', message: 'Message:'
  } : {
    dialog: 'Su invitación', yes: 'Sí', no: 'No', missing: 'Indiquen Sí o No para cada persona.',
    personMissing: 'Elige Sí o No para esta persona.', title: '¿Nos acompañan?',
    intro: 'Tienen 4 cupos reservados. Confirmen por persona.',
    attending: 'Nos vemos pronto', declining: 'Los extrañaremos', received: 'Gracias por probar la confirmación. Pueden editar sus respuestas abajo.',
    summary: function (n, total) { return n ? 'Asistirán ' + n + ' de ' + total + ' personas.' : 'Gracias por avisarnos.'; },
    demo: 'Demostración: esta respuesta no se envía y se reinicia al recargar.', diet: 'Restricciones:', message: 'Mensaje:'
  };
  var $ = function (id) { return document.getElementById(id); };
  var env = $('env'), card = $('card'), base = $('base'), invite = $('invite'), seal = $('sealBtn');
  var enter = $('enter'), replay = $('replay'), timers = [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function layout() {
    var w = innerWidth, h = innerHeight, fh = Math.round(h * .545);
    var ss = Math.round(Math.max(120, Math.min(210, Math.min(w * .42, h * .24))));
    base.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    env.style.setProperty('--fh', fh + 'px'); env.style.setProperty('--ss', ss + 'px');
    env.style.setProperty('--cx', w / 2 + 'px'); env.style.setProperty('--cy', fh + 'px');
  }
  layout(); window.addEventListener('resize', layout);
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function phase(name) {
    env.dataset.phase = name;
    var ready = name === 'card';
    card.inert = !ready; enter.tabIndex = ready ? 0 : -1; replay.tabIndex = ready ? 0 : -1;
    seal.disabled = name !== 'closed';
  }
  // Only the invitation is inert. Persistent shared demo/music tools remain available.
  env.removeAttribute('aria-modal');
  function envelope() {
    clear(); invite.classList.remove('is-revealed'); env.inert = false; phase('closed'); env.classList.remove('gone');
    env.setAttribute('aria-label', seal.getAttribute('aria-label'));
    invite.inert = true; document.body.classList.add('locked'); card.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function open() {
    clear(); invite.classList.add('is-revealed'); env.classList.add('gone'); env.inert = true; invite.inert = false;
    document.body.classList.remove('locked');
  }
  envelope();
  window.LzTemplate = {
    open: open, envelope: envelope,
    scroll: function (el, now) { window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 24, behavior: now || reduce.matches ? 'instant' : 'smooth' }); }
  };
  seal.addEventListener('click', function () {
    if (env.dataset.phase !== 'closed') return;
    clear(); window.LazoMusic.play();
    if (reduce.matches) { phase('card'); env.setAttribute('aria-label', S.dialog); enter.focus({ preventScroll: true }); return; }
    phase('glow'); later(function () { phase('open'); }, 350);
    later(function () { phase('card'); env.setAttribute('aria-label', S.dialog); }, 1750);
    later(function () { enter.focus({ preventScroll: true }); }, 2800);
  });
  replay.addEventListener('click', function () { envelope(); seal.focus({ preventScroll: true }); });
  enter.addEventListener('click', function () {
    open(); $('demoBar').hidden = document.documentElement.classList.contains('lz-content');
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('#portada h1').focus({ preventScroll: true });
  });
  var head = $('siteHead'), menuButton = $('menuBtn');
  function menu(on) {
    head.classList.toggle('open', on); menuButton.setAttribute('aria-expanded', String(on));
    menuButton.setAttribute('aria-label', en ? (on ? 'Close menu' : 'Open menu') : (on ? 'Cerrar menú' : 'Abrir menú'));
  }
  menuButton.addEventListener('click', function () { menu(!head.classList.contains('open')); });
  head.querySelectorAll('#secNav a,.head-cta').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && head.classList.contains('open')) { menu(false); menuButton.focus(); } });
  var target = Date.parse('2027-06-12T16:00:00-05:00'), cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (el) { cd[el.dataset.cd] = el; });
  function tick() {
    var s = Math.floor(Math.max(0, (window.LZ_T || target) - Date.now()) / 1000);
    var values = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    Object.keys(cd).forEach(function (k) { cd[k].textContent = k === 'd' ? values[k] : String(values[k]).padStart(2, '0'); });
  }
  tick(); setInterval(tick, 1000);

  // Answers stay in memory: no localStorage/sessionStorage and no network submission.
  var people = window.InvitessePublication ? window.InvitessePublication.guests.map(function(g){return g.name;}) : ['Carlos Rodríguez', 'Lucía Pérez', 'Sofía Rodríguez', 'Mateo Rodríguez'];
  var answers = people.map(function () { return null; }), wrap = $('people'), form = $('rsForm'), done = $('rsDone');
  var intro = $('rsText').textContent, title = $('rsTitle').textContent;
  function svg(path) { return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="' + path + '"/></svg>'; }
  people.forEach(function (name, i) {
    var row = document.createElement('div'); row.className = 'r-person'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', name);
    row.innerHTML = '<div class="r-person-row"><span class="r-name"></span><div class="r-options"></div></div><p class="r-person-error" id="rError' + i + '" hidden>' + S.personMissing + '</p>';
    row.querySelector('.r-name').textContent = name;
    [[S.yes, true], [S.no, false]].forEach(function (option) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'att';
      b.innerHTML = svg(option[1] ? 'M3 8l3 3 7-7' : 'M4 4l8 8M12 4l-8 8'); b.appendChild(document.createTextNode(option[0]));
      b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-describedby', 'rError' + i);
      b.addEventListener('click', function () {
        answers[i] = option[1]; row.querySelectorAll('button').forEach(function (other) { other.setAttribute('aria-pressed', String(other === b)); });
        row.classList.remove('invalid'); row.removeAttribute('aria-invalid'); row.querySelector('.r-person-error').hidden = true;
        if (answers.every(function (a) { return a !== null; })) $('rsError').hidden = true;
      });
      row.querySelector('.r-options').appendChild(b);
    });
    wrap.appendChild(row);
  });
  var demoNote = document.createElement('p'); demoNote.className = 'r-demo'; demoNote.textContent = S.demo; form.appendChild(demoNote);
  var summaryList = document.createElement('ul'); summaryList.className = 'r-summary'; done.insertBefore(summaryList, $('rsEdit'));
  var extra = document.createElement('div'); extra.className = 'r-demo'; done.insertBefore(extra, $('rsEdit'));
  var saved = document.createElement('p'); saved.className = 'r-demo'; saved.textContent = S.demo; done.appendChild(saved);
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var first = null;
    wrap.querySelectorAll('.r-person').forEach(function (row, i) {
      var missing = answers[i] === null; row.classList.toggle('invalid', missing); row.querySelector('.r-person-error').hidden = !missing;
      if (missing) { row.setAttribute('aria-invalid', 'true'); if (!first) first = row; } else row.removeAttribute('aria-invalid');
    });
    $('rsError').hidden = !first;
    if (first) { $('rsError').textContent = S.missing; first.querySelector('button').focus(); first.scrollIntoView({ block: 'center', behavior: reduce.matches ? 'instant' : 'smooth' }); return; }
    var count = answers.filter(Boolean).length;
    $('rsTitle').textContent = count ? S.attending : S.declining; $('rsText').textContent = S.received;
    $('rsSummary').textContent = S.summary(count, people.length); summaryList.textContent = '';
    people.forEach(function (name, i) {
      var li = document.createElement('li'), n = document.createElement('span'), a = document.createElement('strong');
      n.textContent = name; a.textContent = answers[i] ? S.yes : S.no; li.appendChild(n); li.appendChild(a); summaryList.appendChild(li);
    });
    extra.textContent = '';
    [[S.diet, $('diet').value], [S.message, $('msg').value]].forEach(function (field) { if (field[1].trim()) { var p = document.createElement('p'); p.textContent = field[0] + ' ' + field[1].trim(); extra.appendChild(p); } });
    form.hidden = true; done.hidden = false; done.focus(); window.LazoPanel.setResponse(answers, $('msg').value.trim());
  });
  $('rsEdit').addEventListener('click', function () {
    done.hidden = true; form.hidden = false; $('rsTitle').textContent = title; $('rsText').textContent = intro;
    wrap.querySelector('button[aria-pressed="true"],button').focus({ preventScroll: true });
  });
})();
