/* Lleva el contenido del editor a las plantillas reales (clásico, moderno, romántico).
   Solo actúa si la URL trae ?lz=editor (vista previa dentro del editor) o ?lz=vista (ver como invitado),
   junto con &k=<clave de localStorage> donde el editor guardó la invitación. Sin esos parámetros
   la demo de la tienda se ve exactamente igual que siempre.
   Se carga ANTES de panel.js y de los scripts de cada plantilla, para que la galería, los acordeones
   y la cuenta regresiva ya encuentren el contenido de los novios.
   Marcas en el HTML de cada plantilla:
     data-lz="n1|n2|city|msg|storyTitle|story|hotel|rsvpMsg|time0|cdName|…"   texto (time0 y cdName: evento de la cuenta regresiva)
     data-lz-date="{W} · {d} de {M} · {Y}" [data-lz-from="rsvpDeadline"]               fecha con formato
     data-lz-src="photo:N"     foto N de [portada, ...galería] (se repite si hay menos)
     data-lz-href="hotelLink"  enlace
     data-lz-list="gallery|events|faqs" con hijos data-lz-item y campos data-lz-f="…" lista que se repite
     data-lz-show="viajeOn|rsvpDiet|rsvpNote"  se oculta si está apagado
     data-lz-if="k1 k2"        solo se muestra si alguno de esos campos tiene valor (huecos que la demo no trae)
     data-lz-group="k1 k2"     al ver como invitado se oculta si todos esos campos están vacíos (título + texto)
     data-lz-seal              contenido del sello
     data-lz-mono              monograma ya maquetado ("V<span>&</span>M", "S — T"): solo cambia las dos letras
     data-lz-anchor="portada|historia|itinerario|faq|viaje|rsvp"  destino al cambiar de sección en el editor
   Si un texto está vacío: en el editor se ve el texto de ejemplo de la plantilla, atenuado; al ver como
   invitado (?lz=vista) se oculta, para que nunca salga texto de ejemplo en la invitación. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), MODE = q.get('lz'), KEY = q.get('k');
  if (MODE !== 'editor' && MODE !== 'vista') return;
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var html = document.documentElement;
  html.classList.add('lz-content', 'lz-' + MODE);

  var css = document.createElement('style');
  css.textContent =
    '.demo-bar{display:none !important}.lz-off{display:none !important}.lz-editor .lz-ph{opacity:.42}' +
    '.lz-seal{display:inline-flex !important;align-items:center;justify-content:center;font-family:Georgia,"Times New Roman",serif !important;font-style:normal !important;line-height:1 !important;letter-spacing:0 !important;white-space:nowrap;color:inherit}' +
    '.lz-seal *{font:inherit !important;color:inherit !important}' +
    '.lz-seal i{font-style:italic !important;font-size:.7em !important;margin:0 .04em}' +
    '.lz-seal-stack{flex-direction:column}.lz-seal-stack hr{width:1.1em;height:1px;border:0;background:currentColor;margin:.1em 0}' +
    '.lz-seal-ring{width:2.3em;height:2.3em;border-radius:50%;border:1px solid currentColor;font-style:italic !important}' +
    '.lz-seal img{width:100%;height:100%;object-fit:contain}' +
    '.mo-seal>.lz-seal{font-size:20px}' +
    '.lz-seal-over{display:flex;align-items:center;justify-content:center;position:absolute;left:24%;top:24%;width:52%;height:52%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#D8AE76,#A8743E 70%);color:#FFF4DF;box-shadow:inset 0 0 0 2px #8C5E2C55;font-size:calc(var(--ss,160px) * .2) !important;pointer-events:none}' +
    '.lz-seal-over.is-img{background:none;box-shadow:none}' +
    '.venue-card [data-lz-f="time"]:not(:empty)::before{content:" · "}';
  document.head.appendChild(css);

  function read() {
    try { var v = KEY && localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  var C = read() || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var has = function (v) { return v != null && String(v).trim() !== ''; };
  var init = function (s) { return (String(s || '').trim().charAt(0) || '').toUpperCase(); };
  function dateObj(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmtDate(v, pat) {
    var d = dateObj(v); if (!d) return null;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var M = d.toLocaleDateString(LANG, { month: 'long' }), W = d.toLocaleDateString(LANG, { weekday: 'long' });
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    return pat.replace(/\{(\w+)\}/g, function (_, t) {
      return { d: d.getDate(), dd: pad(d.getDate()), mm: pad(d.getMonth() + 1), M: M, Mc: cap(M), MU: M.toUpperCase(), w: W, W: cap(W), Y: d.getFullYear(), YY: String(d.getFullYear()).slice(2) }[t];
    });
  }
  function fmtTime(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); if (!m) return t || '';
    var d = new Date(2000, 0, 1, +m[1], +m[2]);
    try { return d.toLocaleTimeString(LANG === 'en' ? 'en-US' : 'es', { hour: 'numeric', minute: '2-digit' }); } catch (e) { return t; }
  }
  function splitPlace(p) {
    p = String(p || '');
    var i = p.search(/\s[·\-–—]\s|,|\n/);
    return i < 0 ? [p.trim(), ''] : [p.slice(0, i).trim(), p.slice(i).replace(/^[\s·\-–—,]+/, '').trim()];
  }
  // Solo enlaces de Google Maps (los que da el botón Compartir); cualquier otro se ignora.
  function isMapsUrl(u) {
    try { var x = new URL(u); return x.protocol === 'https:' && (/(^|\.)goo\.gl$/.test(x.hostname) || x.hostname === 'g.co' || (/(^|\.)google\.[a-z.]+$/.test(x.hostname) && (/^\/maps/.test(x.pathname) || /^maps\./.test(x.hostname)))); } catch (e) { return false; }
  }
  function sealHTML(c) {
    var i1 = esc(init(c.n1)), i2 = esc(init(c.n2));
    if (c.sealMode === 'text') return has(c.sealText) ? '<span class="lz-seal" style="font-size:' + (c.sealText.length > 6 ? '.55em' : c.sealText.length > 4 ? '.7em' : '1em') + '">' + esc(c.sealText) + '</span>' : null;
    if (c.mono === 'custom' && c.monoImg) return '<span class="lz-seal" style="width:80%;height:80%"><img src="' + esc(c.monoImg) + '" alt=""></span>';
    if (!i1 && !i2) return null;
    if (c.mono === 'stack') return '<span class="lz-seal lz-seal-stack" style="font-size:.8em"><span>' + i1 + '</span><hr><span>' + i2 + '</span></span>';
    if (c.mono === 'ring') return '<span class="lz-seal lz-seal-ring" style="font-size:.8em">' + i1 + i2 + '</span>';
    return '<span class="lz-seal">' + i1 + '<i>&amp;</i>' + i2 + '</span>';
  }
  var PALETTES = { rosa: ['#4A2F2E', '#6B4442'], azul: ['#26304A', '#34405A'], terracota: ['#4A2B1F', '#6A3D2A'] };

  function photos(c) { var l = []; if (has(c.cover)) l.push(c.cover); (c.gallery || []).forEach(function (g) { if (has(g)) l.push(g); }); return l; }
  function setText(el, v) {
    if (el._lz === undefined) el._lz = el.innerHTML;
    if (has(v)) { el.textContent = v; el.style.whiteSpace = /\n/.test(v) ? 'pre-line' : ''; el.classList.remove('lz-ph', 'lz-off'); }
    else { el.innerHTML = el._lz; el.style.whiteSpace = ''; el.classList.toggle('lz-off', MODE === 'vista'); el.classList.toggle('lz-ph', MODE !== 'vista'); }
  }
  function fill(item, data) {
    var els = [].slice.call(item.querySelectorAll('[data-lz-f]'));
    if (item.hasAttribute('data-lz-f')) els.unshift(item);
    els.forEach(function (el) {
      var f = el.getAttribute('data-lz-f'), v = data[f];
      if (f === 'map') { if (has(data.mapUrl) || has(data.mapQuery)) { el.href = data.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(data.mapQuery); el.target = '_blank'; el.rel = 'noopener'; el.classList.remove('lz-off'); } else el.classList.add('lz-off'); return; }
      if (f === 'img') { if (has(v)) { el.src = v; el.removeAttribute('srcset'); } return; }
      if (f === 'hide') { el.classList.add('lz-off'); return; }
      if (el._lz === undefined) el._lz = el.innerHTML;
      if (has(v)) { el.textContent = v; el.classList.remove('lz-off'); }
      else if (data._keepEmpty) el.innerHTML = el._lz;
      else { el.textContent = ''; el.classList.add('lz-off'); }
    });
  }
  function renderList(box, rows) {
    if (!box._lzTpl) {
      var items = [].slice.call(box.querySelectorAll(':scope > [data-lz-item]'));
      if (!items.length) return;
      box._lzTpl = items[0].cloneNode(true);
      box._lzMark = document.createComment('lz');
      box.insertBefore(box._lzMark, items[0]);
      items.forEach(function (n) { n.remove(); });
    }
    box.querySelectorAll(':scope > [data-lz-item]').forEach(function (n) { n.remove(); });
    rows.forEach(function (r) { var n = box._lzTpl.cloneNode(true); fill(n, r); box.insertBefore(n, box._lzMark); });
    var sec = box.closest('[data-lz-hide-empty]');
    if (sec) sec.classList.toggle('lz-off', !rows.length);
    box.dispatchEvent(new CustomEvent('lz-render', { bubbles: true }));
  }

  function apply(c) {
    C = c || C || {};
    var c0 = C, ph = photos(c0), evs = c0.events || [];
    // Evento elegido en el editor para la cuenta regresiva (si no hay, el primero).
    var cdEv = evs.filter(function (e) { return e.id === c0.countdownId; })[0] || evs[0];
    var v = {
      n1: c0.n1, n2: c0.n2, i1: init(c0.n1), i2: init(c0.n2), city: c0.city, msg: c0.msg, countdownNote: c0.countdownNote,
      storyTitle: c0.storyTitle, story: c0.story, quote: c0.quote, quoteAuthor: c0.quoteAuthor,
      dressCode: c0.dressCode, dressNotes: c0.dressNotes, dressColors: c0.dressColors,
      travelIntro: c0.travelIntro, hotel: c0.hotel, hotelAddress: c0.hotelAddress, hotelCode: c0.hotelCode, hotelNotes: c0.hotelNotes || c0.travelNotes,
      airport: c0.airport, transport: c0.transport, guideFood: c0.guideFood, guideCulture: c0.guideCulture, guidePlans: c0.guidePlans,
      rsvpMsg: c0.rsvpMsg, time0: cdEv ? fmtTime(cdEv.time) : '', cdName: cdEv ? cdEv.name : ''
    };
    var filled = function (keys) { return keys.split(/\s+/).some(function (k) { return has(k in v ? v[k] : c0[k]); }); };
    document.querySelectorAll('[data-lz-if]').forEach(function (el) { el.hidden = !filled(el.getAttribute('data-lz-if')); });
    document.querySelectorAll('[data-lz-group]').forEach(function (el) { el.classList.toggle('lz-off', MODE === 'vista' && !filled(el.getAttribute('data-lz-group'))); });
    document.querySelectorAll('[data-lz]').forEach(function (el) { setText(el, v[el.getAttribute('data-lz')]); });
    document.querySelectorAll('[data-lz-mono]').forEach(function (el) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, t = [];
      while ((n = w.nextNode())) if (n.nodeValue.trim() && !/^[\s&—–·-]+$/.test(n.nodeValue)) t.push(n);
      t.forEach(function (x) { if (x._lz === undefined) x._lz = x.nodeValue; x.nodeValue = x._lz; });
      if (!v.i1 && !v.i2) return;
      if (t.length >= 2) { t[0].nodeValue = t[0]._lz.replace(/\S+/, v.i1); t[t.length - 1].nodeValue = t[t.length - 1]._lz.replace(/\S+(?=\s*$)/, v.i2); }
      else if (t.length === 1) t[0].nodeValue = t[0]._lz.replace(/^(\s*)\S+(.*?)\S+(\s*)$/, '$1' + v.i1 + '$2' + v.i2 + '$3');
    });
    document.querySelectorAll('[data-lz-date]').forEach(function (el) {
      if (el._lz === undefined) el._lz = el.innerHTML;
      var t = fmtDate(c0[el.getAttribute('data-lz-from') || 'date'], el.getAttribute('data-lz-date'));
      if (t) el.textContent = t; else el.innerHTML = el._lz;
    });
    document.querySelectorAll('[data-lz-src]').forEach(function (el) {
      if (el._lz === undefined) el._lz = el.getAttribute('src');
      var n = +(el.getAttribute('data-lz-src').split(':')[1] || 0);
      el.removeAttribute('srcset');
      el.src = ph.length ? ph[n % ph.length] : el._lz;
    });
    document.querySelectorAll('[data-lz-href]').forEach(function (el) {
      var u = c0[el.getAttribute('data-lz-href')];
      if (/^https?:\/\//.test(u || '')) { el.href = u; el.target = '_blank'; el.rel = 'noopener'; }
    });
    document.querySelectorAll('[data-lz-show]').forEach(function (el) {
      var k = el.getAttribute('data-lz-show');
      el.classList.toggle('lz-off', c0[k] === false);
    });
    document.querySelectorAll('[data-lz-seal]').forEach(function (el) {
      if (el._lz === undefined) el._lz = el.innerHTML;
      var s = sealHTML(c0);
      el.innerHTML = s || el._lz;
      if (el.classList.contains('lz-seal-over')) { el.classList.toggle('lz-off', !s); el.classList.toggle('is-img', c0.sealMode !== 'text' && c0.mono === 'custom' && !!c0.monoImg); }
    });
    document.querySelectorAll('[data-lz-list]').forEach(function (box) {
      var k = box.getAttribute('data-lz-list'), rows;
      if (k === 'gallery') rows = (c0.gallery || []).filter(has).map(function (g) { return { img: g, _keepEmpty: true }; });
      else if (k === 'events') rows = evs.map(function (e) {
        // Lugar y dirección van en campos separados; las invitaciones antiguas los tenían juntos ("Lugar · dirección").
        var p = e.address === undefined ? splitPlace(e.place) : [e.place || '', e.address || ''];
        return { name: e.name, time: fmtTime(e.time), place: p[0], address: p[1], mapUrl: isMapsUrl(e.mapUrl) ? e.mapUrl : '', mapQuery: p.filter(has).length ? p.concat(c0.city || '').filter(has).join(', ') : '',
          mapText: p[1] || (has(p[0]) ? (LANG === 'en' ? 'Directions' : 'Cómo llegar') : '') };
      });
      else if (k === 'faqs') rows = (c0.faqs || []).map(function (f) { return { q: f.q, a: f.a }; });
      else return;
      if (k === 'gallery' && !rows.length) return;
      renderList(box, rows);
    });
    var pal = PALETTES[c0.pal];
    if (html.getAttribute('data-lz-palette') !== null) {
      html.style.setProperty('--dark', pal ? pal[0] : '');
      html.style.setProperty('--accent', pal ? pal[1] : '');
    }
    // Cuenta regresiva: las plantillas leen window.LZ_T en cada segundo.
    var d = dateObj(c0.date);
    if (d) { var m = /^(\d{1,2}):(\d{2})$/.exec(cdEv && cdEv.time || ''); if (m) d.setHours(+m[1], +m[2]); window.LZ_T = d.getTime(); }
    if (window.LazoMusic && c0.musicOn === false) { window.LazoMusic.play = function () {}; var mb = document.querySelector('.lz-music'); if (mb) mb.classList.add('lz-off'); }
  }

  /* Navegación desde el editor: cada plantilla define window.LzTemplate = { open(), envelope(), scroll(el) }. */
  function goto(sec, now) {
    var T = window.LzTemplate; if (!T) return;
    if (sec === 'apertura') { T.envelope(); return; }
    T.open();
    var el = document.querySelector('[data-lz-anchor~="' + sec + '"]') || document.querySelector('[data-lz-anchor~="portada"]');
    if (el) {
      setTimeout(function () { T.scroll(el, now); }, 60);
      // Las fotos cargan después y mueven la página: se corrige la posición cuando ya están.
      setTimeout(function () { T.scroll(el, true); }, 900);
    }
  }

  window.LazoContent = { apply: apply, goto: goto };
  apply(C);
  // Lo que todavía no estaba en el DOM (p. ej. el botón de música) se ajusta al terminar de cargar.
  document.addEventListener('DOMContentLoaded', function () {
    apply(C);
    if (MODE === 'editor') { var s = q.get('sec'); if (s) goto(s, true); }
  });
  // Algunas plantillas reajustan el scroll al terminar de cargar fotos y fuentes: se repite al final.
  var asked = false; // si el editor ya pidió una sección, no se vuelve a la de la URL inicial
  window.addEventListener('load', function () { if (MODE === 'editor' && !asked) { var s = q.get('sec'); if (s) setTimeout(function () { if (!asked) goto(s, true); }, 50); } });
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || typeof e.data !== 'object') return;
    if (e.data.lz === 'content') apply(e.data.content);
    else if (e.data.lz === 'goto') { asked = true; goto(e.data.sec); }
  });
})();
