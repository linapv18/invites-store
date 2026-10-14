/* Panel de los novios (demo) y música de fondo, compartidos por todas las demos.
   Uso:
     LazoPanel.init({ mono: 'M&A', couple: 'Melissa y Andrés', link: '/demo/rosa/', guest: 'Familia Rodríguez', seats: 4 });
     LazoPanel.open();                       // abre el panel
     LazoPanel.setResponse([true, false…]);  // refleja la confirmación hecha en la demo
     LazoMusic.init({ src: '/assets/musica/demo.mp3' }); LazoMusic.play();
   Nada se guarda: es una vista previa. */
(function () {
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cfg, data, root, tab = 'resumen', filter = 'todos', query = '', newSeats = 2;

  function sample(guest, seats) {
    return [
      { name: guest, seats: seats, att: null, msg: '', sent: true },
      { name: 'Familia Gómez Restrepo', seats: 4, att: [true, true, true, true], msg: '¡Qué emoción! Allí estaremos.', sent: true },
      { name: 'Valentina Ruiz', seats: 1, att: [true], msg: 'No me lo pierdo por nada.', sent: true },
      { name: 'Familia Martínez', seats: 3, att: [true, true, false], msg: '', sent: true },
      { name: 'Andrés Castillo y Laura Mejía', seats: 2, att: [false, false], msg: 'Los queremos mucho, lamentamos no poder acompañarlos.', sent: true },
      { name: 'Familia Herrera', seats: 4, att: [true, true, true, false], msg: 'Contamos los días.', sent: true },
      { name: 'Daniel Ospina', seats: 1, att: null, msg: '', sent: true },
      { name: 'Familia Torres', seats: 3, att: null, msg: '', sent: false },
      { name: 'Camila Restrepo', seats: 2, att: [true, true], msg: '', sent: true },
      { name: 'Familia Vargas', seats: 4, att: [false, false, false, false], msg: '', sent: true },
      { name: 'Juliana Pérez', seats: 1, att: [true], msg: '', sent: true },
      { name: 'Familia López', seats: 3, att: null, msg: '', sent: false }
    ];
  }
  var yesOf = function (i) { return i.att ? i.att.filter(Boolean).length : 0; };
  var stateOf = function (i) { return !i.att ? 'pendiente' : yesOf(i) ? 'asiste' : 'no'; };

  function totals() {
    var t = { seats: 0, yes: 0, no: 0, pend: 0, invYes: 0, invNo: 0, invPend: 0 };
    data.forEach(function (i) {
      t.seats += i.seats;
      if (!i.att) { t.pend += i.seats; t.invPend++; return; }
      var y = yesOf(i); t.yes += y; t.no += i.seats - y;
      if (y) t.invYes++; else t.invNo++;
    });
    return t;
  }

  function toast(text) {
    var el = document.createElement('div'); el.className = 'lz-toast'; el.setAttribute('role', 'status'); el.textContent = text;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1800);
  }

  function messageFor(i) {
    var first = i.name.split(' ')[0] === 'Familia' ? i.name : i.name.split(' ')[0];
    return '¡Hola ' + first + '! Con mucha ilusión queremos invitarte a celebrar nuestra boda.\n\nAquí te dejamos todos los detalles:\n' +
      location.origin + cfg.link + '\n\nEsperamos que puedas acompañarnos.\n\n' + cfg.couple;
  }

  function resumen() {
    var t = totals(), pct = function (n) { return (t.seats ? n / t.seats * 100 : 0) + '%'; };
    var msgs = data.filter(function (i) { return i.msg; });
    return '<p class="lz-kicker">Personas confirmadas</p>' +
      '<div class="lz-big"><b>' + t.yes + '</b><i>de ' + t.seats + '</i></div>' +
      '<div class="lz-meter" aria-hidden="true"><div style="width:' + pct(t.yes) + ';background:var(--p-ink)"></div><div style="width:' + pct(t.no) + ';background:var(--p-muted)"></div></div>' +
      '<div class="lz-legend"><span><i style="background:var(--p-ink)"></i>Asistirán ' + t.yes + '</span><span><i style="background:var(--p-muted)"></i>No asistirán ' + t.no + '</span><span><i style="background:var(--p-line)"></i>Sin responder ' + t.pend + '</span></div>' +
      '<div class="lz-stats">' +
      '<button type="button" data-filter="asiste"><strong>' + t.invYes + '</strong><span>Invitaciones asisten</span></button>' +
      '<button type="button" data-filter="no"><strong>' + t.invNo + '</strong><span>No asisten</span></button>' +
      '<button type="button" data-filter="pendiente"><strong>' + t.invPend + '</strong><span>Sin respuesta</span></button></div>' +
      '<p class="lz-sub">' + data.length + ' invitaciones · ' + t.seats + ' cupos asignados</p>' +
      '<h2 class="lz-h2">Mensajes <button type="button" class="lz-link" data-tab="invitados">Ver invitados</button></h2>' +
      '<div class="lz-cards">' + msgs.map(function (i) { return '<div class="lz-card"><q>' + esc(i.msg) + '</q><span class="lz-kicker">' + esc(i.name) + '</span></div>'; }).join('') + '</div>';
  }

  function invitados() {
    var counts = { todos: data.length, asiste: 0, no: 0, pendiente: 0 };
    data.forEach(function (i) { counts[stateOf(i)]++; });
    var labels = { todos: 'Todos', asiste: 'Asisten', no: 'No asisten', pendiente: 'Sin respuesta' };
    var q = query.trim().toLowerCase();
    var list = data.filter(function (i) { return (filter === 'todos' || stateOf(i) === filter) && (!q || i.name.toLowerCase().indexOf(q) > -1); });
    return '<label class="lz-kicker" for="lzSearch">Buscar invitado</label>' +
      '<input id="lzSearch" class="lz-search" type="search" placeholder="Nombre o familia…" value="' + esc(query) + '">' +
      '<div class="lz-chips" role="group" aria-label="Filtrar por estado">' + Object.keys(labels).map(function (k) {
        return '<button type="button" data-filter="' + k + '" aria-pressed="' + (filter === k) + '">' + labels[k] + ' · ' + counts[k] + '</button>';
      }).join('') + '</div>' +
      '<div style="margin-top:18px">' + (list.length ? list.map(function (i) {
        var s = stateOf(i), y = yesOf(i);
        var sub = i.seats + (i.seats === 1 ? ' cupo' : ' cupos') + ' · ' + (s === 'pendiente' ? 'Sin respuesta' : s === 'asiste' ? 'Asisten ' + y : 'No asisten') + (i.sent ? '' : ' · Sin enviar');
        return '<div class="lz-row"><span class="lz-dot' + (s === 'asiste' ? ' is-yes' : s === 'no' ? ' is-no' : '') + '" aria-hidden="true"></span><div><strong>' + esc(i.name) + '</strong><small>' + sub + '</small></div><span>' + (s === 'pendiente' ? '—' : y + '/' + i.seats) + '</span></div>';
      }).join('') : '<p class="lz-sub">No hay invitados con ese filtro.</p>') + '</div>' +
      '<div class="lz-actions"><button type="button" class="lz-btn" data-act="csv">Descargar CSV</button></div>';
  }

  function envio() {
    return '<div class="lz-grid"><div class="lz-box">' +
      '<p class="lz-kicker">Nueva invitación</p>' +
      '<label class="lz-field">Nombre de la invitación<input id="lzNewName" type="text" placeholder="Ej. Familia Rodríguez" autocomplete="off"></label>' +
      '<p class="lz-field" style="margin-bottom:0">Cupos</p><div class="lz-stepper"><button type="button" data-act="minus" aria-label="Quitar un cupo">−</button><output id="lzSeats">' + newSeats + '</output><button type="button" data-act="plus" aria-label="Agregar un cupo">+</button></div>' +
      '<div class="lz-actions"><button type="button" class="lz-btn" data-act="create">Crear invitación</button></div></div>' +
      '<div><p class="lz-kicker">Enviar por WhatsApp</p><div style="margin-top:12px">' + data.map(function (i, n) {
        return '<div class="lz-send"><div><strong>' + esc(i.name) + '</strong><small>' + i.seats + (i.seats === 1 ? ' cupo' : ' cupos') + ' · ' + (i.sent ? 'Enviada' : 'Por enviar') + '</small></div>' +
          '<div><button type="button" data-copy="' + n + '">Copiar mensaje</button><button type="button" data-sent="' + n + '" class="' + (i.sent ? 'is-on' : '') + '" aria-pressed="' + i.sent + '">' + (i.sent ? 'Enviada' : 'Marcar enviada') + '</button></div></div>';
      }).join('') + '</div></div></div>';
  }

  function render(focusSearch) {
    var tabs = { resumen: 'Resumen', invitados: 'Invitados', envio: 'Envío' };
    root.querySelector('.lz-tabs').innerHTML = Object.keys(tabs).map(function (k) {
      return '<button type="button" role="tab" data-tab="' + k + '" aria-selected="' + (tab === k) + '">' + tabs[k] + '</button>';
    }).join('');
    root.querySelector('.lz-inner').innerHTML = '<p class="lz-note">Vista previa del panel: así ven los novios sus confirmaciones. Los cambios no se guardan.</p>' +
      (tab === 'resumen' ? resumen() : tab === 'invitados' ? invitados() : envio());
    if (focusSearch) { var s = root.querySelector('#lzSearch'); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }
  }

  function csv() {
    var rows = [['Invitación', 'Cupos', 'Estado', 'Asisten', 'Mensaje', 'Enviada']].concat(data.map(function (i) {
      return [i.name, i.seats, { pendiente: 'Sin respuesta', asiste: 'Asiste', no: 'No asiste' }[stateOf(i)], yesOf(i), i.msg, i.sent ? 'Sí' : 'No'];
    }));
    var text = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = 'invitados-demo.csv'; document.body.appendChild(a); a.click(); a.remove();
    toast('CSV descargado');
  }

  function onClick(e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.close !== undefined) return close();
    if (b.dataset.tab) { tab = b.dataset.tab; return render(); }
    if (b.dataset.filter) { filter = b.dataset.filter; tab = 'invitados'; return render(); }
    if (b.dataset.copy) {
      var msg = messageFor(data[Number(b.dataset.copy)]);
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(function () { toast('Mensaje copiado'); }, function () { toast('No se pudo copiar'); });
      return;
    }
    if (b.dataset.sent) { var i = data[Number(b.dataset.sent)]; i.sent = !i.sent; return render(); }
    var act = b.dataset.act;
    if (act === 'csv') return csv();
    if (act === 'minus') { newSeats = Math.max(1, newSeats - 1); root.querySelector('#lzSeats').textContent = newSeats; return; }
    if (act === 'plus') { newSeats = Math.min(12, newSeats + 1); root.querySelector('#lzSeats').textContent = newSeats; return; }
    if (act === 'create') {
      var input = root.querySelector('#lzNewName'), name = input.value.trim();
      if (!name) { input.focus(); toast('Escribe un nombre'); return; }
      data.push({ name: name, seats: newSeats, att: null, msg: '', sent: false }); newSeats = 2; render(); toast('Invitación creada');
    }
  }

  var lastFocus = null;
  function open() { lastFocus = document.activeElement; root.hidden = false; document.documentElement.style.overflow = 'hidden'; render(); root.querySelector('[data-close]').focus(); }
  function close() { root.hidden = true; document.documentElement.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }

  window.LazoPanel = {
    init: function (c) {
      cfg = c; data = sample(c.guest, c.seats);
      root = document.createElement('div');
      root.className = 'lz-panel'; root.hidden = true;
      root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Panel de los novios');
      root.innerHTML = '<div class="lz-head"><div class="lz-brand"><b>' + esc(c.mono) + '</b><span>Panel de los novios</span></div><button type="button" class="lz-exit" data-close>Salir</button></div>' +
        '<div class="lz-tabs" role="tablist" aria-label="Secciones del panel"></div><div class="lz-body"><div class="lz-inner"></div></div>';
      document.body.appendChild(root);
      root.addEventListener('click', onClick);
      root.addEventListener('input', function (e) { if (e.target.id === 'lzSearch') { query = e.target.value; render(true); } });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !root.hidden) close(); });
      document.querySelectorAll('[data-open-panel]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    },
    open: open,
    setResponse: function (att, msg) { data[0].att = att ? att.slice() : null; data[0].msg = msg || ''; }
  };

  /* Música de fondo: botón flotante. Si no hay archivo de música, el botón no aparece. */
  var audio, btn;
  function sync() { btn.classList.toggle('is-playing', !audio.paused); btn.setAttribute('aria-pressed', String(!audio.paused)); btn.setAttribute('aria-label', audio.paused ? 'Reproducir música' : 'Pausar música'); }
  window.LazoMusic = {
    init: function (c) {
      if (!c || !c.src) return;
      audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.src = c.src;
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'lz-music'; btn.hidden = true;
      btn.innerHTML = '<svg class="play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="txt">Música</span>';
      btn.addEventListener('click', function () { if (audio.paused) audio.play().catch(function () {}); else audio.pause(); });
      audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
      audio.addEventListener('error', function () { btn.hidden = true; });
      document.body.appendChild(btn);
      fetch(c.src, { method: 'HEAD' }).then(function (r) { if (r.ok) { btn.hidden = !c.showNow; sync(); } }).catch(function () {});
      this.ready = function () { return fetch(c.src, { method: 'HEAD' }).then(function (r) { return r.ok; }).catch(function () { return false; }); };
    },
    show: function () { if (btn && audio && audio.networkState !== 3) LazoMusic.ready().then(function (ok) { if (ok) btn.hidden = false; }); },
    play: function () { if (!audio) return; LazoMusic.show(); audio.play().catch(function () {}); }
  };
})();
