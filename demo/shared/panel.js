/* Panel de los novios (demo) y música de fondo, compartidos por todas las demos.
   Uso:
     LazoPanel.init({ mono: 'M&A', couple: 'Melissa y Andrés', link: '/demo/rosa/', guest: 'Familia Rodríguez',
                      people: ['Carlos Rodríguez', 'Lucía Pérez', …] });
     LazoPanel.open();                        // abre el panel (pausa la música de la invitación)
     LazoPanel.setResponse([true, false…], m)  // refleja la confirmación hecha en la demo
     LazoMusic.init({ src: '/assets/musica/demo.mp3' }); LazoMusic.play();
   Nada se guarda: es una vista previa. */
(function () {
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cfg, data, root, tab = 'resumen', filter = 'todos', query = '', editing = -1, confirmDelete = false;
  var draftNames = ['', ''], draftTitle = '';
  var template = '¡Hola, {nombre}! Con mucha ilusión queremos invitarlos a celebrar nuestra boda.\n\nAquí encontrarán todos los detalles y podrán confirmar su asistencia:\n{enlace}\n\nEsperamos que puedan acompañarnos.\n{novios}';

  var g = function (names, att) { return names.map(function (n, i) { return { name: n, att: att ? att[i] : null }; }); };
  function sample(c) {
    return [
      { name: c.guest, guests: g(c.people), msg: '', sent: true },
      { name: 'Familia Gómez Restrepo', guests: g(['Andrés Gómez', 'Paula Restrepo', 'Martina Gómez', 'Simón Gómez'], [true, true, true, true]), msg: '¡Qué emoción! Allí estaremos.', sent: true },
      { name: 'Valentina Ruiz', guests: g(['Valentina Ruiz'], [true]), msg: 'No me lo pierdo por nada.', sent: true },
      { name: 'Familia Martínez', guests: g(['Jorge Martínez', 'Ana Duque', 'Luis Martínez'], [true, true, false]), msg: '', sent: true },
      { name: 'Andrés Castillo y Laura Mejía', guests: g(['Andrés Castillo', 'Laura Mejía'], [false, false]), msg: 'Los queremos mucho, lamentamos no poder acompañarlos.', sent: true },
      { name: 'Familia Herrera', guests: g(['Pedro Herrera', 'Clara Vélez', 'Elena Herrera', 'Tomás Herrera'], [true, true, true, false]), msg: 'Contamos los días.', sent: true },
      { name: 'Daniel Ospina', guests: g(['Daniel Ospina']), msg: '', sent: true },
      { name: 'Familia Torres', guests: g(['Ricardo Torres', 'Mónica Salazar', 'Isabela Torres']), msg: '', sent: false },
      { name: 'Camila Restrepo', guests: g(['Camila Restrepo', 'Juan Pablo Arango'], [true, true]), msg: '', sent: true },
      { name: 'Familia Vargas', guests: g(['Hernán Vargas', 'Rosa Pineda', 'Diana Vargas', 'Felipe Vargas'], [false, false, false, false]), msg: '', sent: true },
      { name: 'Juliana Pérez', guests: g(['Juliana Pérez'], [true]), msg: '', sent: true },
      { name: 'Familia López', guests: g(['Mauricio López', 'Sandra Ruiz', 'Sara López']), msg: '', sent: false }
    ];
  }
  var yesOf = function (i) { return i.guests.filter(function (p) { return p.att === true; }).length; };
  var answered = function (i) { return i.guests.length > 0 && i.guests.every(function (p) { return p.att !== null; }); };
  var stateOf = function (i) { return !answered(i) ? 'pendiente' : yesOf(i) ? 'asiste' : 'no'; };

  function totals() {
    var t = { seats: 0, yes: 0, no: 0, pend: 0, invYes: 0, invNo: 0, invPend: 0 };
    data.forEach(function (i) {
      t.seats += i.guests.length;
      i.guests.forEach(function (p) { if (p.att === true) t.yes++; else if (p.att === false) t.no++; else t.pend++; });
      var s = stateOf(i); if (s === 'asiste') t.invYes++; else if (s === 'no') t.invNo++; else t.invPend++;
    });
    return t;
  }

  function toast(text) {
    var el = document.createElement('div'); el.className = 'lz-toast'; el.setAttribute('role', 'status'); el.textContent = text;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1800);
  }
  var linkFor = function (i) { return location.origin + cfg.link + '?invitacion=' + encodeURIComponent(i.name.toLowerCase().replace(/\s+/g, '-')); };
  var messageFor = function (i) { return template.split('{nombre}').join(i.name).split('{enlace}').join(linkFor(i)).split('{novios}').join(cfg.couple); };
  var seatsLabel = function (n) { return n + (n === 1 ? ' cupo' : ' cupos'); };

  /* ---------- Resumen ---------- */
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
      (msgs.length ? '<div class="lz-cards">' + msgs.map(function (i) { return '<div class="lz-card"><q>' + esc(i.msg) + '</q><span class="lz-kicker">' + esc(i.name) + '</span></div>'; }).join('') + '</div>' : '<p class="lz-sub">Aún no hay mensajes.</p>');
  }

  /* ---------- Invitados ---------- */
  function editor(i, n) {
    return '<div class="lz-edit" data-edit="' + n + '">' +
      '<label class="lz-field">Nombre de la invitación<input type="text" data-f="title" value="' + esc(i.name) + '"></label>' +
      '<p class="lz-field" style="margin-bottom:6px">Personas y asistencia · ' + seatsLabel(i.guests.length) + '</p>' +
      i.guests.map(function (p, k) {
        return '<div class="lz-guest">' +
          '<input type="text" aria-label="Nombre de la persona ' + (k + 1) + '" data-f="guest" data-k="' + k + '" value="' + esc(p.name) + '" placeholder="Nombre">' +
          '<div class="lz-seg" role="group" aria-label="Asistencia de ' + esc(p.name || 'la persona ' + (k + 1)) + '">' +
          [['Sí', true], ['No', false], ['—', null]].map(function (o) {
            return '<button type="button" data-att="' + k + '" data-v="' + o[1] + '" aria-pressed="' + (p.att === o[1]) + '"' + (o[1] === null ? ' aria-label="Sin respuesta"' : '') + '>' + o[0] + '</button>';
          }).join('') + '</div>' +
          '<button type="button" class="lz-x" data-rm="' + k + '" aria-label="Quitar a ' + esc(p.name || 'esta persona') + '"' + (i.guests.length === 1 ? ' disabled' : '') + '>×</button></div>';
      }).join('') +
      '<div class="lz-actions"><button type="button" class="lz-btn is-ghost" data-act="add-guest">+ Agregar persona</button></div>' +
      '<div class="lz-actions" style="justify-content:space-between;border-top:1px solid var(--p-line);padding-top:18px">' +
      (confirmDelete
        ? '<span style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:13px">¿Eliminar esta invitación?<button type="button" class="lz-btn is-danger" data-act="delete-yes">Sí, eliminar</button><button type="button" class="lz-btn is-ghost" data-act="delete-no">Cancelar</button></span>'
        : '<button type="button" class="lz-btn is-ghost is-danger-text" data-act="delete">Eliminar invitación</button>') +
      '<button type="button" class="lz-btn" data-act="done">Listo</button></div></div>';
  }

  function invitados() {
    var counts = { todos: data.length, asiste: 0, no: 0, pendiente: 0 };
    data.forEach(function (i) { counts[stateOf(i)]++; });
    var labels = { todos: 'Todos', asiste: 'Asisten', no: 'No asisten', pendiente: 'Sin respuesta' };
    var q = query.trim().toLowerCase();
    var match = function (i) { return !q || i.name.toLowerCase().indexOf(q) > -1 || i.guests.some(function (p) { return p.name.toLowerCase().indexOf(q) > -1; }); };
    var list = data.map(function (i, n) { return [i, n]; }).filter(function (x) { return x[1] === editing || ((filter === 'todos' || stateOf(x[0]) === filter) && match(x[0])); });
    return '<label class="lz-kicker" for="lzSearch">Buscar invitado</label>' +
      '<input id="lzSearch" class="lz-search" type="search" placeholder="Nombre o familia…" value="' + esc(query) + '">' +
      '<div class="lz-chips" role="group" aria-label="Filtrar por estado">' + Object.keys(labels).map(function (k) {
        return '<button type="button" data-filter="' + k + '" aria-pressed="' + (filter === k) + '">' + labels[k] + ' · ' + counts[k] + '</button>';
      }).join('') + '</div>' +
      '<p class="lz-sub">Toca una invitación para editar nombres, cupos y asistencia.</p>' +
      '<div style="margin-top:8px">' + (list.length ? list.map(function (x) {
        var i = x[0], n = x[1], s = stateOf(i), y = yesOf(i);
        var sub = seatsLabel(i.guests.length) + ' · ' + (s === 'pendiente' ? (i.guests.some(function (p) { return p.att !== null; }) ? 'Respuesta parcial' : 'Sin respuesta') : s === 'asiste' ? 'Asisten ' + y : 'No asisten') + (i.sent ? '' : ' · Sin enviar');
        return '<div class="lz-item' + (n === editing ? ' is-open' : '') + '"><button type="button" class="lz-row" data-open="' + n + '" aria-expanded="' + (n === editing) + '">' +
          '<span class="lz-dot' + (s === 'asiste' ? ' is-yes' : s === 'no' ? ' is-no' : '') + '" aria-hidden="true"></span>' +
          '<span><strong>' + esc(i.name) + '</strong><small>' + sub + '</small></span><span>' + (s === 'pendiente' && !y ? '—' : y + '/' + i.guests.length) + '</span></button>' +
          (n === editing ? editor(i, n) : '') + '</div>';
      }).join('') : '<p class="lz-sub">No hay invitados con ese filtro.</p>') + '</div>' +
      '<div class="lz-actions"><button type="button" class="lz-btn" data-tab="envio">+ Nueva invitación</button><button type="button" class="lz-btn is-ghost" data-act="csv">Descargar CSV</button></div>';
  }

  /* ---------- Envío ---------- */
  function envio() {
    var sample = data[0] || { name: 'Familia Rodríguez' };
    return '<div class="lz-grid"><div class="lz-box">' +
      '<p class="lz-kicker">Nueva invitación</p>' +
      '<label class="lz-field">Nombre de la invitación<input id="lzNewTitle" type="text" placeholder="Ej. Familia Rodríguez" autocomplete="off" value="' + esc(draftTitle) + '"></label>' +
      '<p class="lz-field" style="margin-bottom:6px">Personas · ' + seatsLabel(draftNames.length) + '</p>' +
      draftNames.map(function (nm, k) {
        return '<div class="lz-guest is-simple"><input type="text" aria-label="Nombre de la persona ' + (k + 1) + '" data-new="' + k + '" value="' + esc(nm) + '" placeholder="Nombre de la persona ' + (k + 1) + '">' +
          '<button type="button" class="lz-x" data-newrm="' + k + '" aria-label="Quitar persona ' + (k + 1) + '"' + (draftNames.length === 1 ? ' disabled' : '') + '>×</button></div>';
      }).join('') +
      '<div class="lz-actions"><button type="button" class="lz-btn is-ghost" data-act="new-add">+ Agregar persona</button><button type="button" class="lz-btn" data-act="create">Crear invitación</button></div></div>' +

      '<div class="lz-box"><p class="lz-kicker">Mensaje para los invitados</p>' +
      '<label class="lz-field" for="lzTpl">Texto del mensaje</label>' +
      '<textarea id="lzTpl" class="lz-tpl" rows="8">' + esc(template) + '</textarea>' +
      '<p class="lz-sub" style="margin-top:10px">Insertar:</p><div class="lz-chips" style="margin-top:8px">' +
      [['{nombre}', 'Nombre de la invitación'], ['{enlace}', 'Enlace único'], ['{novios}', 'Sus nombres']].map(function (v) {
        return '<button type="button" data-ins="' + v[0] + '" aria-pressed="false">' + v[1] + '</button>';
      }).join('') + '</div>' +
      '<p class="lz-field" style="margin-bottom:8px">Vista previa · ' + esc(sample.name) + '</p><div class="lz-preview" id="lzPreview">' + esc(messageFor(sample)) + '</div></div></div>' +

      '<p class="lz-kicker" style="margin-top:36px">Enviar por WhatsApp</p><div style="margin-top:12px">' + data.map(function (i, n) {
        return '<div class="lz-send"><div><strong>' + esc(i.name) + '</strong><small>' + seatsLabel(i.guests.length) + ' · ' + (i.sent ? 'Enviada' : 'Por enviar') + '</small></div>' +
          '<div><button type="button" data-copy="' + n + '">Copiar mensaje</button><button type="button" data-sent="' + n + '" class="' + (i.sent ? 'is-on' : '') + '" aria-pressed="' + i.sent + '">' + (i.sent ? 'Enviada' : 'Marcar enviada') + '</button></div></div>';
      }).join('') + '</div>';
  }

  function render(focusSel) {
    var tabs = { resumen: 'Resumen', invitados: 'Invitados', envio: 'Envío' };
    root.querySelector('.lz-tabs').innerHTML = Object.keys(tabs).map(function (k) {
      return '<button type="button" role="tab" data-tab="' + k + '" aria-selected="' + (tab === k) + '">' + tabs[k] + '</button>';
    }).join('');
    root.querySelector('.lz-inner').innerHTML = '<p class="lz-note">Vista previa del panel: así ven los novios sus confirmaciones. Los cambios no se guardan.</p>' +
      (tab === 'resumen' ? resumen() : tab === 'invitados' ? invitados() : envio());
    if (focusSel) { var el = root.querySelector(focusSel); if (el) { el.focus(); if (el.setSelectionRange && el.value != null) el.setSelectionRange(el.value.length, el.value.length); } }
  }

  function csv() {
    var rows = [['Invitación', 'Persona', 'Asistencia', 'Mensaje', 'Enviada']];
    data.forEach(function (i) { i.guests.forEach(function (p) { rows.push([i.name, p.name, p.att === true ? 'Asiste' : p.att === false ? 'No asiste' : 'Sin respuesta', i.msg, i.sent ? 'Sí' : 'No']); }); });
    var text = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = 'invitados-demo.csv'; document.body.appendChild(a); a.click(); a.remove();
    toast('CSV descargado');
  }

  function onClick(e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.close !== undefined) return close();
    if (b.dataset.tab) { tab = b.dataset.tab; editing = -1; confirmDelete = false; return render(); }
    if (b.dataset.filter) { filter = b.dataset.filter; tab = 'invitados'; return render(); }
    if (b.dataset.open) { var n = Number(b.dataset.open); editing = editing === n ? -1 : n; confirmDelete = false; return render(); }
    var inv = data[editing];
    if (b.dataset.att !== undefined && inv) { inv.guests[Number(b.dataset.att)].att = JSON.parse(b.dataset.v); return render(); }
    if (b.dataset.rm !== undefined && inv) { inv.guests.splice(Number(b.dataset.rm), 1); return render(); }
    if (b.dataset.newrm !== undefined) { draftNames.splice(Number(b.dataset.newrm), 1); return render(); }
    if (b.dataset.ins) { insert(b.dataset.ins); return; }
    if (b.dataset.copy) {
      var msg = messageFor(data[Number(b.dataset.copy)]);
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(function () { toast('Mensaje copiado'); }, function () { toast('No se pudo copiar'); });
      return;
    }
    if (b.dataset.sent) { var s = data[Number(b.dataset.sent)]; s.sent = !s.sent; return render(); }
    switch (b.dataset.act) {
      case 'csv': return csv();
      case 'add-guest': inv.guests.push({ name: '', att: null }); return render('[data-f="guest"][data-k="' + (inv.guests.length - 1) + '"]');
      case 'done': editing = -1; confirmDelete = false; render(); return toast('Cambios guardados en la vista previa');
      case 'delete': confirmDelete = true; return render('[data-act="delete-no"]');
      case 'delete-no': confirmDelete = false; return render();
      case 'delete-yes': data.splice(editing, 1); editing = -1; confirmDelete = false; render(); return toast('Invitación eliminada');
      case 'new-add': draftNames.push(''); return render('[data-new="' + (draftNames.length - 1) + '"]');
      case 'create': {
        var names = draftNames.map(function (x) { return x.trim(); }).filter(Boolean);
        var title = draftTitle.trim() || (names.length === 1 ? names[0] : '');
        if (!title) { toast('Escribe el nombre de la invitación'); return render('#lzNewTitle'); }
        if (!names.length) { toast('Agrega al menos una persona'); return render('[data-new="0"]'); }
        data.push({ name: title, guests: g(names), msg: '', sent: false });
        draftTitle = ''; draftNames = ['', '']; render(); return toast('Invitación creada');
      }
    }
  }

  function insert(token) {
    var ta = root.querySelector('#lzTpl'), s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + token + ta.value.slice(e); template = ta.value;
    ta.focus(); ta.setSelectionRange(s + token.length, s + token.length); updatePreview();
  }
  function updatePreview() { var p = root.querySelector('#lzPreview'); if (p) p.textContent = messageFor(data[0] || { name: 'Familia Rodríguez' }); }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'lzSearch') { query = t.value; return render('#lzSearch'); }
    if (t.id === 'lzTpl') { template = t.value; return updatePreview(); }
    if (t.id === 'lzNewTitle') { draftTitle = t.value; return; }
    if (t.dataset.new !== undefined) { draftNames[Number(t.dataset.new)] = t.value; return; }
    var inv = data[editing]; if (!inv) return;
    if (t.dataset.f === 'title') { inv.name = t.value; var r = root.querySelector('.lz-item.is-open strong'); if (r) r.textContent = t.value || 'Sin nombre'; return; }
    if (t.dataset.f === 'guest') { inv.guests[Number(t.dataset.k)].name = t.value; }
  }

  var lastFocus = null, musicWas = false;
  function open() {
    lastFocus = document.activeElement; musicWas = LazoMusic.suspend();
    root.hidden = false; document.body.classList.add('panel-open'); document.documentElement.style.overflow = 'hidden';
    render(); root.querySelector('[data-close]').focus();
  }
  function close() {
    root.hidden = true; document.body.classList.remove('panel-open'); document.documentElement.style.overflow = '';
    if (musicWas) LazoMusic.resume();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  window.LazoPanel = {
    init: function (c) {
      cfg = c; data = sample(c);
      root = document.createElement('div');
      root.className = 'lz-panel'; root.hidden = true;
      root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Panel de los novios');
      root.innerHTML = '<div class="lz-head"><div class="lz-brand"><b>' + esc(c.mono) + '</b><span>Panel de los novios</span></div><button type="button" class="lz-exit" data-close>Salir</button></div>' +
        '<div class="lz-tabs" role="tablist" aria-label="Secciones del panel"></div><div class="lz-body"><div class="lz-inner"></div></div>';
      document.body.appendChild(root);
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !root.hidden) close(); });
      document.querySelectorAll('[data-open-panel]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    },
    open: open,
    setResponse: function (att, msg) {
      var first = data[0]; if (!first) return;
      first.guests.forEach(function (p, i) { p.att = att && i < att.length ? att[i] : null; });
      first.msg = msg || '';
    }
  };

  /* Galería: toda imagen dentro de [data-gallery] se abre en grande al tocarla.
     Con data-gallery="mono" las fotos se ven en blanco y negro. */
  function initGallery() {
    var groups = document.querySelectorAll('[data-gallery]'); if (!groups.length) return;
    var box = document.createElement('div');
    box.className = 'lz-viewer'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Fotos');
    box.innerHTML = '<button type="button" class="lz-v-scrim" tabindex="-1" aria-label="Cerrar"></button>' +
      '<figure class="lz-v-frame"><img alt=""><figcaption class="lz-v-count" aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="lz-v-btn is-close" aria-label="Cerrar">×</button>' +
      '<button type="button" class="lz-v-btn is-prev" aria-label="Foto anterior">‹</button>' +
      '<button type="button" class="lz-v-btn is-next" aria-label="Foto siguiente">›</button>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), count = box.querySelector('.lz-v-count'), list = [], idx = 0, last = null, touchX = null;
    function show() {
      var src = list[idx];
      img.src = src.currentSrc || src.src; img.alt = src.alt || '';
      count.textContent = (idx + 1) + ' / ' + list.length;
      box.querySelector('.is-prev').hidden = box.querySelector('.is-next').hidden = list.length < 2;
    }
    function open(group, el) {
      list = [].slice.call(group.querySelectorAll('img')); idx = Math.max(0, list.indexOf(el)); last = el;
      box.classList.toggle('is-mono', group.dataset.gallery === 'mono');
      show(); box.hidden = false; document.body.classList.add('viewer-open');
      box.querySelector('.is-close').focus();
    }
    function close() { box.hidden = true; document.body.classList.remove('viewer-open'); if (last) last.focus({ preventScroll: true }); }
    function step(d) { idx = (idx + d + list.length) % list.length; show(); }
    groups.forEach(function (group) {
      group.querySelectorAll('img').forEach(function (el, i, all) {
        el.classList.add('lz-zoomable'); el.tabIndex = 0; el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Ver la foto ' + (i + 1) + ' de ' + all.length + ' en grande');
        el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); open(group, el); });
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(group, el); } });
      });
    });
    box.querySelector('.lz-v-scrim').addEventListener('click', close);
    box.querySelector('.is-close').addEventListener('click', close);
    box.querySelector('.is-prev').addEventListener('click', function () { step(-1); });
    box.querySelector('.is-next').addEventListener('click', function () { step(1); });
    box.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (touchX === null) return; var dx = e.changedTouches[0].clientX - touchX; touchX = null; if (Math.abs(dx) > 50 && list.length > 1) step(dx < 0 ? 1 : -1); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') { var f = [].slice.call(box.querySelectorAll('.lz-v-btn:not([hidden])')); var i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGallery); else initGallery();

  /* Música de fondo: solo suena en la invitación; el panel la pausa. Si no hay archivo, el botón no aparece. */
  var audio, btn, available = false;
  function sync() { btn.classList.toggle('is-playing', !audio.paused); btn.setAttribute('aria-pressed', String(!audio.paused)); btn.setAttribute('aria-label', audio.paused ? 'Reproducir música' : 'Pausar música'); }
  window.LazoMusic = {
    init: function (c) {
      if (!c || !c.src) return;
      audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.src = c.src;
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'lz-music'; btn.hidden = true;
      btn.innerHTML = '<svg class="play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="txt">Música</span>';
      btn.addEventListener('click', function () { if (audio.paused) audio.play().catch(function () {}); else audio.pause(); });
      audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
      audio.addEventListener('error', function () { available = false; btn.hidden = true; });
      document.body.appendChild(btn);
      fetch(c.src, { method: 'HEAD' }).then(function (r) { available = r.ok; }).catch(function () {});
    },
    play: function () {
      if (!audio) return;
      audio.play().then(function () { available = true; btn.hidden = false; sync(); }).catch(function () { if (available) btn.hidden = false; });
    },
    suspend: function () { if (!audio) return false; var was = !audio.paused; audio.pause(); return was; },
    resume: function () { if (audio) audio.play().catch(function () {}); }
  };
})();
