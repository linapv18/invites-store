/* Panel de los novios (demo), galería y música de fondo, compartidos por todas las demos.
   El idioma sale de <html lang="…"> ('es' o 'en').
   Uso:
     LazoPanel.init({ mono: 'M&A', couple: 'Melissa y Andrés', link: '/demo/rosa/', guest: 'Familia Rodríguez',
                      people: ['Carlos Rodríguez', 'Lucía Pérez', …] });
     LazoPanel.open();                        // abre el panel (pausa la música de la invitación)
     LazoPanel.setResponse([true, false…], m)  // refleja la confirmación hecha en la demo
     LazoMusic.init({ src: '/assets/musica/demo.mp3' }); LazoMusic.play();
   Nada se guarda: es una vista previa. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var STR = {
    es: {
      panel: 'Panel de los novios', exit: 'Salir', tabsLabel: 'Secciones del panel', tabs: { resumen: 'Resumen', invitados: 'Invitados', envio: 'Envío' },
      note: 'Vista previa del panel: así ven los novios sus confirmaciones. Los cambios no se guardan.',
      confirmed: 'Personas confirmadas', of: 'de', willAttend: 'Asistirán', wontAttend: 'No asistirán', noReply: 'Sin responder',
      invYes: 'Invitaciones asisten', invNo: 'No asisten', invPend: 'Sin respuesta', invitations: 'invitaciones', seatsAssigned: 'cupos asignados',
      messages: 'Mensajes', seeGuests: 'Ver invitados', noMessages: 'Aún no hay mensajes.',
      search: 'Buscar invitado', searchPh: 'Nombre o familia…', filterLabel: 'Filtrar por estado',
      filters: { todos: 'Todos', asiste: 'Asisten', no: 'No asisten', pendiente: 'Sin respuesta' },
      tapToEdit: 'Toca una invitación para editar nombres, cupos y asistencia.', noMatch: 'No hay invitados con ese filtro.',
      partial: 'Respuesta parcial', attending: 'Asisten', notAttending: 'No asisten', notSent: 'Sin enviar',
      newInv: '+ Nueva invitación', csv: 'Descargar CSV', invName: 'Nombre de la invitación', invNamePh: 'Ej. Familia Rodríguez',
      people: 'Personas y asistencia', peopleShort: 'Personas', personName: 'Nombre de la persona', name: 'Nombre',
      yes: 'Sí', no: 'No', none: 'Sin respuesta', attendanceOf: 'Asistencia de', thePerson: 'la persona', remove: 'Quitar a', thisPerson: 'esta persona', removePerson: 'Quitar persona',
      addPerson: '+ Agregar persona', confirmDelete: '¿Eliminar esta invitación?', deleteYes: 'Sí, eliminar', cancel: 'Cancelar', del: 'Eliminar invitación', done: 'Listo',
      newInvTitle: 'Nueva invitación', create: 'Crear invitación', msgTitle: 'Mensaje para los invitados', msgText: 'Texto del mensaje', insert: 'Insertar:',
      tokens: [['{nombre}', 'Nombre de la invitación'], ['{enlace}', 'Enlace único'], ['{novios}', 'Sus nombres']], preview: 'Vista previa',
      sendTitle: 'Enviar por WhatsApp', copy: 'Copiar mensaje', sent: 'Enviada', markSent: 'Marcar enviada', toSend: 'Por enviar',
      seat: ' cupo', seats: ' cupos', saved: 'Cambios guardados en la vista previa', deleted: 'Invitación eliminada', created: 'Invitación creada',
      needTitle: 'Escribe el nombre de la invitación', needPerson: 'Agrega al menos una persona', copied: 'Mensaje copiado', copyFail: 'No se pudo copiar', csvDone: 'CSV descargado',
      csvHead: ['Invitación', 'Persona', 'Asistencia', 'Mensaje', 'Enviada'], csvYes: 'Asiste', csvNo: 'No asiste', yesWord: 'Sí', noWord: 'No', csvFile: 'invitados-demo.csv', noName: 'Sin nombre',
      template: '¡Hola, {nombre}! Con mucha ilusión queremos invitarlos a celebrar nuestra boda.\n\nAquí encontrarán todos los detalles y podrán confirmar su asistencia:\n{enlace}\n\nEsperamos que puedan acompañarnos.\n{novios}',
      tk: { name: '{nombre}', link: '{enlace}', couple: '{novios}' }, linkParam: 'invitacion',
      photos: 'Fotos', close: 'Cerrar', prev: 'Foto anterior', next: 'Foto siguiente', seePhoto: function (i, n) { return 'Ver la foto ' + i + ' de ' + n + ' en grande'; },
      music: 'Música', play: 'Reproducir música', pause: 'Pausar música'
    },
    en: {
      panel: 'Couple’s dashboard', exit: 'Exit', tabsLabel: 'Dashboard sections', tabs: { resumen: 'Overview', invitados: 'Guests', envio: 'Sending' },
      note: 'Dashboard preview: this is how the couple sees their RSVPs. Changes are not saved.',
      confirmed: 'Confirmed guests', of: 'of', willAttend: 'Attending', wontAttend: 'Not attending', noReply: 'No reply',
      invYes: 'Invitations attending', invNo: 'Not attending', invPend: 'No reply', invitations: 'invitations', seatsAssigned: 'seats assigned',
      messages: 'Messages', seeGuests: 'See guests', noMessages: 'No messages yet.',
      search: 'Search guests', searchPh: 'Name or family…', filterLabel: 'Filter by status',
      filters: { todos: 'All', asiste: 'Attending', no: 'Not attending', pendiente: 'No reply' },
      tapToEdit: 'Tap an invitation to edit names, seats and attendance.', noMatch: 'No guests match that filter.',
      partial: 'Partial reply', attending: 'Attending', notAttending: 'Not attending', notSent: 'Not sent',
      newInv: '+ New invitation', csv: 'Download CSV', invName: 'Invitation name', invNamePh: 'e.g. The Rodríguez Family',
      people: 'Guests and attendance', peopleShort: 'Guests', personName: 'Guest name', name: 'Name',
      yes: 'Yes', no: 'No', none: 'No reply', attendanceOf: 'Attendance for', thePerson: 'guest', remove: 'Remove', thisPerson: 'this guest', removePerson: 'Remove guest',
      addPerson: '+ Add guest', confirmDelete: 'Delete this invitation?', deleteYes: 'Yes, delete', cancel: 'Cancel', del: 'Delete invitation', done: 'Done',
      newInvTitle: 'New invitation', create: 'Create invitation', msgTitle: 'Message for your guests', msgText: 'Message text', insert: 'Insert:',
      tokens: [['{name}', 'Invitation name'], ['{link}', 'Unique link'], ['{couple}', 'Your names']], preview: 'Preview',
      sendTitle: 'Send on WhatsApp', copy: 'Copy message', sent: 'Sent', markSent: 'Mark as sent', toSend: 'To send',
      seat: ' seat', seats: ' seats', saved: 'Changes saved in the preview', deleted: 'Invitation deleted', created: 'Invitation created',
      needTitle: 'Add the invitation name', needPerson: 'Add at least one guest', copied: 'Message copied', copyFail: 'Could not copy', csvDone: 'CSV downloaded',
      csvHead: ['Invitation', 'Guest', 'Attendance', 'Message', 'Sent'], csvYes: 'Attending', csvNo: 'Not attending', yesWord: 'Yes', noWord: 'No', csvFile: 'guests-demo.csv', noName: 'Untitled',
      template: 'Hi {name}! We would love for you to celebrate our wedding with us.\n\nHere you will find all the details and can RSVP:\n{link}\n\nWe hope you can join us.\n{couple}',
      tk: { name: '{name}', link: '{link}', couple: '{couple}' }, linkParam: 'invitation',
      photos: 'Photos', close: 'Close', prev: 'Previous photo', next: 'Next photo', seePhoto: function (i, n) { return 'View photo ' + i + ' of ' + n + ' full size'; },
      music: 'Music', play: 'Play music', pause: 'Pause music'
    }
  };
  var S = STR[LANG];
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cfg, data, root, tab = 'resumen', filter = 'todos', query = '', editing = -1, confirmDelete = false;
  var draftNames = ['', ''], draftTitle = '', template = S.template;

  var g = function (names, att) { return names.map(function (n, i) { return { name: n, att: att ? att[i] : null }; }); };
  var fam = function (last) { return LANG === 'en' ? 'The ' + last + ' Family' : 'Familia ' + last; };
  function sample(c) {
    var m = LANG === 'en'
      ? ['So excited! We’ll be there.', 'Wouldn’t miss it for the world.', 'We love you and are so sorry we can’t make it.', 'Counting the days.']
      : ['¡Qué emoción! Allí estaremos.', 'No me lo pierdo por nada.', 'Los queremos mucho, lamentamos no poder acompañarlos.', 'Contamos los días.'];
    return [
      { name: c.guest, guests: g(c.people), msg: '', sent: true },
      { name: fam('Gómez Restrepo'), guests: g(['Andrés Gómez', 'Paula Restrepo', 'Martina Gómez', 'Simón Gómez'], [true, true, true, true]), msg: m[0], sent: true },
      { name: 'Valentina Ruiz', guests: g(['Valentina Ruiz'], [true]), msg: m[1], sent: true },
      { name: fam('Martínez'), guests: g(['Jorge Martínez', 'Ana Duque', 'Luis Martínez'], [true, true, false]), msg: '', sent: true },
      { name: LANG === 'en' ? 'Andrés Castillo & Laura Mejía' : 'Andrés Castillo y Laura Mejía', guests: g(['Andrés Castillo', 'Laura Mejía'], [false, false]), msg: m[2], sent: true },
      { name: fam('Herrera'), guests: g(['Pedro Herrera', 'Clara Vélez', 'Elena Herrera', 'Tomás Herrera'], [true, true, true, false]), msg: m[3], sent: true },
      { name: 'Daniel Ospina', guests: g(['Daniel Ospina']), msg: '', sent: true },
      { name: fam('Torres'), guests: g(['Ricardo Torres', 'Mónica Salazar', 'Isabela Torres']), msg: '', sent: false },
      { name: 'Camila Restrepo', guests: g(['Camila Restrepo', 'Juan Pablo Arango'], [true, true]), msg: '', sent: true },
      { name: fam('Vargas'), guests: g(['Hernán Vargas', 'Rosa Pineda', 'Diana Vargas', 'Felipe Vargas'], [false, false, false, false]), msg: '', sent: true },
      { name: 'Juliana Pérez', guests: g(['Juliana Pérez'], [true]), msg: '', sent: true },
      { name: fam('López'), guests: g(['Mauricio López', 'Sandra Ruiz', 'Sara López']), msg: '', sent: false }
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
  var linkFor = function (i) { return location.origin + cfg.link + '?' + S.linkParam + '=' + encodeURIComponent(i.name.toLowerCase().replace(/\s+/g, '-')); };
  var messageFor = function (i) { return template.split(S.tk.name).join(i.name).split(S.tk.link).join(linkFor(i)).split(S.tk.couple).join(cfg.couple); };
  var seatsLabel = function (n) { return n + (n === 1 ? S.seat : S.seats); };

  /* ---------- Resumen ---------- */
  function resumen() {
    var t = totals(), pct = function (n) { return (t.seats ? n / t.seats * 100 : 0) + '%'; };
    var msgs = data.filter(function (i) { return i.msg; });
    return '<p class="lz-kicker">' + S.confirmed + '</p>' +
      '<div class="lz-big"><b>' + t.yes + '</b><i>' + S.of + ' ' + t.seats + '</i></div>' +
      '<div class="lz-meter" aria-hidden="true"><div style="width:' + pct(t.yes) + ';background:var(--p-ink)"></div><div style="width:' + pct(t.no) + ';background:var(--p-muted)"></div></div>' +
      '<div class="lz-legend"><span><i style="background:var(--p-ink)"></i>' + S.willAttend + ' ' + t.yes + '</span><span><i style="background:var(--p-muted)"></i>' + S.wontAttend + ' ' + t.no + '</span><span><i style="background:var(--p-line)"></i>' + S.noReply + ' ' + t.pend + '</span></div>' +
      '<div class="lz-stats">' +
      '<button type="button" data-filter="asiste"><strong>' + t.invYes + '</strong><span>' + S.invYes + '</span></button>' +
      '<button type="button" data-filter="no"><strong>' + t.invNo + '</strong><span>' + S.invNo + '</span></button>' +
      '<button type="button" data-filter="pendiente"><strong>' + t.invPend + '</strong><span>' + S.invPend + '</span></button></div>' +
      '<p class="lz-sub">' + data.length + ' ' + S.invitations + ' · ' + t.seats + ' ' + S.seatsAssigned + '</p>' +
      '<h2 class="lz-h2">' + S.messages + ' <button type="button" class="lz-link" data-tab="invitados">' + S.seeGuests + '</button></h2>' +
      (msgs.length ? '<div class="lz-cards">' + msgs.map(function (i) { return '<div class="lz-card"><q>' + esc(i.msg) + '</q><span class="lz-kicker">' + esc(i.name) + '</span></div>'; }).join('') + '</div>' : '<p class="lz-sub">' + S.noMessages + '</p>');
  }

  /* ---------- Invitados ---------- */
  function editor(i, n) {
    return '<div class="lz-edit" data-edit="' + n + '">' +
      '<label class="lz-field">' + S.invName + '<input type="text" data-f="title" value="' + esc(i.name) + '"></label>' +
      '<p class="lz-field" style="margin-bottom:6px">' + S.people + ' · ' + seatsLabel(i.guests.length) + '</p>' +
      i.guests.map(function (p, k) {
        var who = esc(p.name || S.thePerson + ' ' + (k + 1));
        return '<div class="lz-guest">' +
          '<input type="text" aria-label="' + S.personName + ' ' + (k + 1) + '" data-f="guest" data-k="' + k + '" value="' + esc(p.name) + '" placeholder="' + S.name + '">' +
          '<div class="lz-seg" role="group" aria-label="' + S.attendanceOf + ' ' + who + '">' +
          [[S.yes, true], [S.no, false], ['—', null]].map(function (o) {
            return '<button type="button" data-att="' + k + '" data-v="' + o[1] + '" aria-pressed="' + (p.att === o[1]) + '"' + (o[1] === null ? ' aria-label="' + S.none + '"' : '') + '>' + o[0] + '</button>';
          }).join('') + '</div>' +
          '<button type="button" class="lz-x" data-rm="' + k + '" aria-label="' + S.remove + ' ' + esc(p.name || S.thisPerson) + '"' + (i.guests.length === 1 ? ' disabled' : '') + '><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>';
      }).join('') +
      '<div class="lz-actions"><button type="button" class="lz-btn is-ghost" data-act="add-guest">' + S.addPerson + '</button></div>' +
      '<div class="lz-actions" style="justify-content:space-between;border-top:1px solid var(--p-line);padding-top:18px">' +
      (confirmDelete
        ? '<span style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:13px">' + S.confirmDelete + '<button type="button" class="lz-btn is-danger" data-act="delete-yes">' + S.deleteYes + '</button><button type="button" class="lz-btn is-ghost" data-act="delete-no">' + S.cancel + '</button></span>'
        : '<button type="button" class="lz-btn is-ghost is-danger-text" data-act="delete">' + S.del + '</button>') +
      '<button type="button" class="lz-btn" data-act="done">' + S.done + '</button></div></div>';
  }

  function invitados() {
    var counts = { todos: data.length, asiste: 0, no: 0, pendiente: 0 };
    data.forEach(function (i) { counts[stateOf(i)]++; });
    var q = query.trim().toLowerCase();
    var match = function (i) { return !q || i.name.toLowerCase().indexOf(q) > -1 || i.guests.some(function (p) { return p.name.toLowerCase().indexOf(q) > -1; }); };
    var list = data.map(function (i, n) { return [i, n]; }).filter(function (x) { return x[1] === editing || ((filter === 'todos' || stateOf(x[0]) === filter) && match(x[0])); });
    return '<label class="lz-kicker" for="lzSearch">' + S.search + '</label>' +
      '<input id="lzSearch" class="lz-search" type="search" placeholder="' + S.searchPh + '" value="' + esc(query) + '">' +
      '<div class="lz-chips" role="group" aria-label="' + S.filterLabel + '">' + Object.keys(S.filters).map(function (k) {
        return '<button type="button" data-filter="' + k + '" aria-pressed="' + (filter === k) + '">' + S.filters[k] + ' · ' + counts[k] + '</button>';
      }).join('') + '</div>' +
      '<p class="lz-sub">' + S.tapToEdit + '</p>' +
      '<div style="margin-top:8px">' + (list.length ? list.map(function (x) {
        var i = x[0], n = x[1], s = stateOf(i), y = yesOf(i);
        var sub = seatsLabel(i.guests.length) + ' · ' + (s === 'pendiente' ? (i.guests.some(function (p) { return p.att !== null; }) ? S.partial : S.invPend) : s === 'asiste' ? S.attending + ' ' + y : S.notAttending) + (i.sent ? '' : ' · ' + S.notSent);
        return '<div class="lz-item' + (n === editing ? ' is-open' : '') + '"><button type="button" class="lz-row" data-open="' + n + '" aria-expanded="' + (n === editing) + '">' +
          '<span class="lz-dot' + (s === 'asiste' ? ' is-yes' : s === 'no' ? ' is-no' : '') + '" aria-hidden="true"></span>' +
          '<span><strong>' + esc(i.name) + '</strong><small>' + sub + '</small></span><span>' + (s === 'pendiente' && !y ? '—' : y + '/' + i.guests.length) + '</span></button>' +
          (n === editing ? editor(i, n) : '') + '</div>';
      }).join('') : '<p class="lz-sub">' + S.noMatch + '</p>') + '</div>' +
      '<div class="lz-actions"><button type="button" class="lz-btn" data-tab="envio">' + S.newInv + '</button><button type="button" class="lz-btn is-ghost" data-act="csv">' + S.csv + '</button></div>';
  }

  /* ---------- Envío ---------- */
  function envio() {
    var first = data[0] || { name: cfg.guest };
    return '<div class="lz-grid"><div class="lz-box">' +
      '<p class="lz-kicker">' + S.newInvTitle + '</p>' +
      '<label class="lz-field">' + S.invName + '<input id="lzNewTitle" type="text" placeholder="' + S.invNamePh + '" autocomplete="off" value="' + esc(draftTitle) + '"></label>' +
      '<p class="lz-field" style="margin-bottom:6px">' + S.peopleShort + ' · ' + seatsLabel(draftNames.length) + '</p>' +
      draftNames.map(function (nm, k) {
        return '<div class="lz-guest is-simple"><input type="text" aria-label="' + S.personName + ' ' + (k + 1) + '" data-new="' + k + '" value="' + esc(nm) + '" placeholder="' + S.personName + ' ' + (k + 1) + '">' +
          '<button type="button" class="lz-x" data-newrm="' + k + '" aria-label="' + S.removePerson + ' ' + (k + 1) + '"' + (draftNames.length === 1 ? ' disabled' : '') + '><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>';
      }).join('') +
      '<div class="lz-actions"><button type="button" class="lz-btn is-ghost" data-act="new-add">' + S.addPerson + '</button><button type="button" class="lz-btn" data-act="create">' + S.create + '</button></div></div>' +

      '<div class="lz-box"><p class="lz-kicker">' + S.msgTitle + '</p>' +
      '<label class="lz-field" for="lzTpl">' + S.msgText + '</label>' +
      '<textarea id="lzTpl" class="lz-tpl" rows="8">' + esc(template) + '</textarea>' +
      '<p class="lz-sub" style="margin-top:10px">' + S.insert + '</p><div class="lz-chips" style="margin-top:8px">' +
      S.tokens.map(function (v) { return '<button type="button" data-ins="' + v[0] + '" aria-pressed="false">' + v[1] + '</button>'; }).join('') + '</div>' +
      '<p class="lz-field" style="margin-bottom:8px">' + S.preview + ' · ' + esc(first.name) + '</p><div class="lz-preview" id="lzPreview">' + esc(messageFor(first)) + '</div></div></div>' +

      '<p class="lz-kicker" style="margin-top:36px">' + S.sendTitle + '</p><div style="margin-top:12px">' + data.map(function (i, n) {
        return '<div class="lz-send"><div><strong>' + esc(i.name) + '</strong><small>' + seatsLabel(i.guests.length) + ' · ' + (i.sent ? S.sent : S.toSend) + '</small></div>' +
          '<div><button type="button" data-copy="' + n + '">' + S.copy + '</button><button type="button" data-sent="' + n + '" class="' + (i.sent ? 'is-on' : '') + '" aria-pressed="' + i.sent + '">' + (i.sent ? S.sent : S.markSent) + '</button></div></div>';
      }).join('') + '</div>';
  }

  function render(focusSel) {
    root.querySelector('.lz-tabs').innerHTML = Object.keys(S.tabs).map(function (k) {
      return '<button type="button" role="tab" data-tab="' + k + '" aria-selected="' + (tab === k) + '">' + S.tabs[k] + '</button>';
    }).join('');
    root.querySelector('.lz-inner').innerHTML = '<p class="lz-note">' + S.note + '</p>' +
      (tab === 'resumen' ? resumen() : tab === 'invitados' ? invitados() : envio());
    if (focusSel) { var el = root.querySelector(focusSel); if (el) { el.focus(); if (el.setSelectionRange && el.value != null) el.setSelectionRange(el.value.length, el.value.length); } }
  }

  function csv() {
    var rows = [S.csvHead];
    data.forEach(function (i) { i.guests.forEach(function (p) { rows.push([i.name, p.name, p.att === true ? S.csvYes : p.att === false ? S.csvNo : S.none, i.msg, i.sent ? S.yesWord : S.noWord]); }); });
    var text = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = S.csvFile; document.body.appendChild(a); a.click(); a.remove();
    toast(S.csvDone);
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
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(function () { toast(S.copied); }, function () { toast(S.copyFail); });
      return;
    }
    if (b.dataset.sent) { var s = data[Number(b.dataset.sent)]; s.sent = !s.sent; return render(); }
    switch (b.dataset.act) {
      case 'csv': return csv();
      case 'add-guest': inv.guests.push({ name: '', att: null }); return render('[data-f="guest"][data-k="' + (inv.guests.length - 1) + '"]');
      case 'done': editing = -1; confirmDelete = false; render(); return toast(S.saved);
      case 'delete': confirmDelete = true; return render('[data-act="delete-no"]');
      case 'delete-no': confirmDelete = false; return render();
      case 'delete-yes': data.splice(editing, 1); editing = -1; confirmDelete = false; render(); return toast(S.deleted);
      case 'new-add': draftNames.push(''); return render('[data-new="' + (draftNames.length - 1) + '"]');
      case 'create': {
        var names = draftNames.map(function (x) { return x.trim(); }).filter(Boolean);
        var title = draftTitle.trim() || (names.length === 1 ? names[0] : '');
        if (!title) { toast(S.needTitle); return render('#lzNewTitle'); }
        if (!names.length) { toast(S.needPerson); return render('[data-new="0"]'); }
        data.push({ name: title, guests: g(names), msg: '', sent: false });
        draftTitle = ''; draftNames = ['', '']; render(); return toast(S.created);
      }
    }
  }

  function insert(token) {
    var ta = root.querySelector('#lzTpl'), s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + token + ta.value.slice(e); template = ta.value;
    ta.focus(); ta.setSelectionRange(s + token.length, s + token.length); updatePreview();
  }
  function updatePreview() { var p = root.querySelector('#lzPreview'); if (p) p.textContent = messageFor(data[0] || { name: cfg.guest }); }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'lzSearch') { query = t.value; return render('#lzSearch'); }
    if (t.id === 'lzTpl') { template = t.value; return updatePreview(); }
    if (t.id === 'lzNewTitle') { draftTitle = t.value; return; }
    if (t.dataset.new !== undefined) { draftNames[Number(t.dataset.new)] = t.value; return; }
    var inv = data[editing]; if (!inv) return;
    if (t.dataset.f === 'title') { inv.name = t.value; var r = root.querySelector('.lz-item.is-open strong'); if (r) r.textContent = t.value || S.noName; return; }
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
      root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', S.panel);
      root.innerHTML = '<div class="lz-head"><div class="lz-brand"><b>' + esc(c.mono) + '</b><span>' + S.panel + '</span></div><button type="button" class="lz-exit" data-close>' + S.exit + '</button></div>' +
        '<div class="lz-tabs" role="tablist" aria-label="' + S.tabsLabel + '"></div><div class="lz-body"><div class="lz-inner"></div></div>';
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
     Con data-gallery="mono" las fotos se ven en blanco y negro (salvo que la invitación elija fotos a color: html.lz-photo-color). */
  function initGallery() {
    if (document.querySelector('.lz-viewer')) return;
    var photoSelector = 'img[data-lz-f="img"],img[data-lz-src^="photo:"], [data-lz-list="gallery"] img';
    document.querySelectorAll('#historia,[data-lz-anchor~="historia"]').forEach(function(section){
      if (!section.hasAttribute('data-gallery') && section.querySelector(photoSelector)) section.setAttribute('data-gallery',document.documentElement.dataset.lzTpl === 'tinta' ? 'mono' : '');
    });
    var box = document.createElement('div');
    box.className = 'lz-viewer'; box.hidden = true;
    box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',S.photos);
    box.innerHTML = '<button type="button" class="lz-v-scrim" tabindex="-1" aria-label="' + S.close + '"></button>' +
      '<figure class="lz-v-frame"><img alt=""><figcaption class="lz-v-count" aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="lz-v-btn is-close" aria-label="' + S.close + '"><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>' +
      '<button type="button" class="lz-v-btn is-prev" aria-label="' + S.prev + '"><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg></button>' +
      '<button type="button" class="lz-v-btn is-next" aria-label="' + S.next + '"><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M6 3.5 10.5 8 6 12.5"/></svg></button>';
    document.body.appendChild(box);
    var img=box.querySelector('img'),count=box.querySelector('.lz-v-count'),list=[],idx=0,last=null,activeGroup=null,touch=null;
    function groupFor(el){return el.closest('[data-gallery]') || el.closest('[data-lz-list="gallery"]');}
    function images(group){return [].slice.call(group.querySelectorAll('img')).filter(function(el){return el.matches(photoSelector) || group.matches('[data-gallery]') && el.classList.contains('lz-zoomable');});}
    function sources(group){
      if(Array.isArray(window.LZ_GALLERY)) return window.LZ_GALLERY.slice(0,12).map(function(src){return {src:src,alt:''};});
      return images(group).slice(0,12).map(function(el){return {src:el.currentSrc || el.src,alt:el.alt || ''};});
    }
    function indexFor(group,el){
      if(Array.isArray(window.LZ_GALLERY)){
        var container=el.closest('[data-lz-list="gallery"]');
        if(container)return [].slice.call(container.querySelectorAll('img')).indexOf(el);
        var binding=el.getAttribute('data-lz-src');
        if(binding && /^photo:[1-9]/.test(binding))return +binding.split(':')[1]-1;
        var found=window.LZ_GALLERY.indexOf(el.getAttribute('src'));return found<0?0:found;
      }
      return Math.max(0,images(group).indexOf(el));
    }
    function show(){
      if(!list.length)return;
      img.src=list[idx].src;img.alt=list[idx].alt || (LANG==='en'?'Wedding photo ':'Foto de la boda ')+(idx+1);
      count.textContent=(idx+1)+' / '+list.length;
      box.querySelector('.is-prev').hidden=box.querySelector('.is-next').hidden=list.length<2;
    }
    function open(group,el){
      list=sources(group);if(!list.length)return;
      idx=Math.min(list.length-1,Math.max(0,el.tagName==='IMG'?indexFor(group,el):0));last=el;activeGroup=group;
      box.classList.toggle('is-mono',group.dataset.gallery==='mono' && !document.documentElement.classList.contains('lz-photo-color'));
      show();box.hidden=false;document.body.classList.add('viewer-open');box.querySelector('.is-close').focus();
    }
    function close(){
      if(box.hidden)return;
      box.hidden=true;document.body.classList.remove('viewer-open');img.removeAttribute('src');
      var target=last && last.isConnected && last.getClientRects().length?last:activeGroup && activeGroup.querySelector('.lz-zoomable');
      if(target)target.focus({preventScroll:true});activeGroup=null;
    }
    function step(d){if(list.length){idx=(idx+d+list.length)%list.length;show();}}
    function refresh(){
      var seen=new Set();
      document.querySelectorAll('[data-gallery],[data-lz-list="gallery"]').forEach(function(group){
        var all=images(group),total=sources(group).length;
        all.forEach(function(el){
          if(seen.has(el))return;seen.add(el);
          el.classList.toggle('lz-zoomable',!!total);el.tabIndex=total?0:-1;el.setAttribute('role','button');el.setAttribute('aria-haspopup','dialog');
          if(total)el.setAttribute('aria-label',S.seePhoto(Math.min(total,indexFor(group,el)+1),total));
          else el.removeAttribute('role');
          if(el.closest('[hidden]') || !el.getClientRects().length)el.tabIndex=-1;
        });
      });
      if(!box.hidden && activeGroup){list=sources(activeGroup);if(!list.length)close();else{idx=Math.min(idx,list.length-1);show();}}
    }
    document.addEventListener('click',function(e){
      var el=e.target.closest('img.lz-zoomable,[data-gallery-open]');if(!el)return;
      var group=groupFor(el) || el.closest('section') && el.closest('section').querySelector('[data-lz-list="gallery"]');if(!group)return;
      e.preventDefault();e.stopPropagation();open(group,el);
    });
    document.addEventListener('keydown',function(e){
      if(!box.hidden){
        if(e.key==='Escape'){e.preventDefault();close();}
        else if(e.key==='ArrowRight'){e.preventDefault();step(1);}
        else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
        else if(e.key==='Tab'){
          var focusables=[].slice.call(box.querySelectorAll('.lz-v-btn:not([hidden])')),i=focusables.indexOf(document.activeElement);
          if(e.shiftKey && i<=0){e.preventDefault();focusables[focusables.length-1].focus();}
          else if(!e.shiftKey && (i===focusables.length-1 || i<0)){e.preventDefault();focusables[0].focus();}
        }
      }else if((e.key==='Enter'||e.key===' ') && e.target.matches('img.lz-zoomable')){e.preventDefault();open(groupFor(e.target),e.target);}
    });
    box.querySelector('.lz-v-scrim').addEventListener('click',close);box.querySelector('.is-close').addEventListener('click',close);
    box.querySelector('.is-prev').addEventListener('click',function(){step(-1);});box.querySelector('.is-next').addEventListener('click',function(){step(1);});
    box.addEventListener('touchstart',function(e){touch=e.touches.length===1?[e.touches[0].clientX,e.touches[0].clientY]:null;},{passive:true});
    box.addEventListener('touchend',function(e){if(!touch)return;var dx=e.changedTouches[0].clientX-touch[0],dy=e.changedTouches[0].clientY-touch[1];touch=null;if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy))step(dx<0?1:-1);},{passive:true});
    box.addEventListener('touchcancel',function(){touch=null;});
    document.addEventListener('lz-render',refresh);document.addEventListener('lz-gallery-change',refresh);refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGallery); else initGallery();

  /* Música de fondo: solo suena en la invitación; el panel la pausa. Si no hay archivo, el botón no aparece. */
  var audio, btn, available = false;
  function sync() { btn.classList.toggle('is-playing', !audio.paused); btn.setAttribute('aria-pressed', String(!audio.paused)); btn.setAttribute('aria-label', audio.paused ? S.play : S.pause); }
  window.LazoMusic = {
    init: function (c) {
      if (!c || !c.src) return;
      audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.src = c.src;
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'lz-music'; btn.hidden = true;
      btn.innerHTML = '<svg class="play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg><svg class="pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><span class="txt">' + S.music + '</span>';
      btn.addEventListener('click', function () { if (audio.paused) audio.play().catch(function () {}); else audio.pause(); });
      audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
      audio.addEventListener('error', function () { available = false; btn.hidden = true; });
      document.body.appendChild(btn);
      sync();
      fetch(c.src, { method: 'HEAD' }).then(function (r) { available = r.ok; if (available && document.querySelector('.lz-explore')) btn.hidden = false; }).catch(function () {});
    },
    play: function () {
      if (!audio) return;
      audio.play().then(function () { available = true; btn.hidden = false; sync(); }).catch(function () { if (available) btn.hidden = false; });
    },
    showControl: function () { if (available && btn) btn.hidden = false; },
    // Cambia la canción (la que eligieron en el editor: de la biblioteca o un MP3 subido).
    setSrc: function (src) { if (!audio || !src || audio.src === src) return; var was = !audio.paused; audio.src = src; available = true; if (was) audio.play().catch(function () {}); },
    suspend: function () { if (!audio) return false; var was = !audio.paused; audio.pause(); return was; },
    resume: function () { if (audio) audio.play().catch(function () {}); }
  };
})();

/* Shared Explore sheet, based on Jardín, for every demo and language. */
(function () {
  function mount() {
    var bar = document.querySelector('.demo-bar');
    if (!bar || document.documentElement.classList.contains('lz-content') || bar.classList.contains('lz-explore')) return;
    var en = document.documentElement.lang.slice(0, 2) === 'en';
    var title = en ? 'Explore demo' : 'Explorar demo';
    var icon = function (path) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + path + '</svg>'; };
    var arrow = icon('<path d="M5 12h14m-5-5 5 5-5 5"/>');
    var compass = icon('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>');
    var colors = document.querySelector('.lz-colors');
    var store = bar.querySelector('a');
    var href = store ? store.getAttribute('href') : (en ? '/en/#designs' : '/#disenos');
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/demo/shared/explore.css'; document.head.appendChild(css);
    bar.classList.add('lz-explore');
    bar.innerHTML = '<button type="button" id="dbToggle" class="lx-toggle" aria-expanded="false" aria-controls="lzExploreSheet">' + compass + title + '</button>' +
      '<div id="lzExploreSheet" class="lx-sheet" role="group" aria-label="' + title + '" hidden><div class="lx-head"><b>' + title + '</b>' +
      '<button type="button" class="lx-min" aria-label="' + (en ? 'Minimize' : 'Minimizar') + '">' + icon('<path d="M6 12h12"/>') + '</button></div>' +
      '<div id="dbColors" class="lx-colors"></div><button type="button" class="lx-action" data-explore-panel>' + (en ? 'Couple’s dashboard' : 'Panel de novios') + arrow + '</button>' +
      '<a class="lx-action" href="' + href + '">' + (en ? 'Back to the store' : 'Volver a la tienda') + arrow + '</a></div>';
    if (colors) bar.querySelector('.lx-colors').appendChild(colors);
    var toggle = bar.querySelector('.lx-toggle'), sheet = bar.querySelector('.lx-sheet');
    function setOpen(on, focus) {
      sheet.hidden = !on;
      toggle.setAttribute('aria-expanded', String(on)); bar.classList.toggle('is-open', on);
      if (focus) (on ? sheet.querySelector('button') : toggle).focus({ preventScroll: true });
    }
    toggle.addEventListener('click', function () { setOpen(sheet.hidden, true); });
    bar.querySelector('.lx-min').addEventListener('click', function () { setOpen(false, true); });
    bar.querySelector('[data-explore-panel]').addEventListener('click', function () {
      setOpen(false, true); window.LazoPanel.open();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { e.preventDefault(); setOpen(false, true); } });
    document.addEventListener('click', function (e) { if (!sheet.hidden && !bar.contains(e.target)) setOpen(false, false); });
    // Template opening/scroll code must never hide or disable the demo controls.
    function keepAvailable(el) {
      if (!el) return;
      function restore() {
        if (el === bar && el.hidden) el.hidden = false;
        if (el.inert) el.inert = false;
        if (el.hasAttribute('aria-hidden')) el.removeAttribute('aria-hidden');
      }
      new MutationObserver(restore).observe(el, { attributes: true, attributeFilter: ['hidden', 'inert', 'aria-hidden'] });
      restore();
    }
    keepAvailable(bar); keepAvailable(document.querySelector('.lz-music'));
    if (window.LazoMusic) window.LazoMusic.showControl();

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
