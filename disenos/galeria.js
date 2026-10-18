/* Galería de diseños. Los diseños y sus etiquetas viven en /disenos/catalogo.js.
   Las pestañas «Cómo se abre» eligen un grupo de aperturas (catalogo.js → openings).
   Dentro de un grupo de filtros, las opciones suman (jardín o campo); entre grupos, se combinan (botánico y en el campo).
   Los filtros quedan en la URL (?estilo=botanico&lugar=playa&apertura=sobre&q=…) para compartir una búsqueda. */
(function () {
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'es', base = LANG === 'en' ? '/en' : '';
  var S = {
    es: { kicker: 'Los diseños', title: 'Encuentren el diseño <i>de su boda.</i>', store: 'Inicio', designs: 'Diseños', addons: 'Complementos', pricing: 'Opciones', login: 'Ingresar', cta: 'Explorar diseños',
      search: 'Buscar diseño', searchPh: 'Busquen por estilo, color o apertura', opening: 'Cómo se abre', all: 'Todos', tabsLbl: 'Cómo se abre la invitación',
      incl: 'Todos incluyen:', inclList: ['Apertura', 'Portada', 'Nuestra historia', 'Itinerario y mapas', 'Preguntas', 'Música', 'Viaje y hospedaje', 'Confirmación por persona'],
      filters: 'Filtros', clear: 'Borrar filtros', clearAll: 'Borrar todo', show: function (n) { return 'Ver ' + n + (n === 1 ? ' diseño' : ' diseños'); },
      count: function (n, t) { return n === t ? t + ' diseños<span class="xs-hide"> · prueben sus demos</span>' : n + ' de ' + t + ' diseños'; }, empty: 'Ningún diseño coincide con esos filtros todavía.',
      customH: '¿Ninguno es el suyo?', customP: 'Diseñamos uno a la medida de su boda.', customA: 'Ver la opción a medida',
      tailK: 'A la medida', tailH: 'Su invitación, <i>hecha desde cero.</i>', tailP: 'Una dirección visual y una apertura propias para su boda. Consultas disponibles con el lanzamiento.', tailA: 'Conocer la opción', tailB: 'Ver cómo funciona',
      foot: [['/', 'Inicio'], ['/#complementos', 'Complementos'], ['/#precios', 'Opciones'], ['/en/disenos/', 'English']], tagline: 'Invitaciones web de boda' },
    en: { kicker: 'The designs', title: 'Find the design <i>for your wedding.</i>', store: 'Home', designs: 'Designs', addons: 'Add-ons', pricing: 'Options', login: 'Log in', cta: 'Explore designs',
      search: 'Search designs', searchPh: 'Search by style, color or opening', opening: 'How it opens', all: 'All', tabsLbl: 'How the invitation opens',
      incl: 'Every one includes:', inclList: ['Opening', 'Cover', 'Our story', 'Schedule and maps', 'FAQ', 'Music', 'Travel and hotels', 'RSVP per person'],
      filters: 'Filters', clear: 'Clear filters', clearAll: 'Clear all', show: function (n) { return 'Show ' + n + (n === 1 ? ' design' : ' designs'); },
      count: function (n, t) { return n === t ? t + ' designs<span class="xs-hide"> · try the demos</span>' : n + ' of ' + t + ' designs'; }, empty: 'No design matches those filters yet.',
      customH: 'None feels like yours?', customP: 'We design one just for your wedding.', customA: 'Explore custom design',
      tailK: 'Custom', tailH: 'Your invitation, <i>made from scratch.</i>', tailP: 'A visual direction and opening created for your wedding. Enquiries available at launch.', tailA: 'Explore this option', tailB: 'See how it works',
      foot: [['/en/', 'Home'], ['/en/#add-ons', 'Add-ons'], ['/en/#precios', 'Options'], ['/disenos/', 'Español']], tagline: 'Wedding website invitations' }
  }[LANG];
  var C = window.LazoCatalog, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fold = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var LOOP = 'M2 48C10 34 22 26 31 30C39 34 35 45 27 43C19 41 21 26 36 17C46 11 58 10 66 15';
  var WM = '<span class="iv-wm" role="img" aria-label="Invitesse"><span aria-hidden="true">invite</span><b aria-hidden="true">ss</b><span aria-hidden="true">e</span><svg viewBox="0 0 70 54" aria-hidden="true"><path d="' + LOOP + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span>';
  var CHECK = function (s, w) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; };
  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var FILTER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>';
  var otherUrl = function (s) { return (LANG === 'es' ? '/en/disenos/' : '/disenos/') + (s ? '?' + s : ''); };

  $('nav').innerHTML = '<a class="logo" href="' + base + '/" aria-label="Invitesse">' + WM + '</a>' +
    '<div class="links"><a class="on" href="' + base + '/disenos/" aria-current="page">' + S.designs + '</a><a class="hide-sm" href="' + base + (LANG === 'en' ? '/#add-ons' : '/#complementos') + '">' + S.addons + '</a><a class="hide-sm" href="' + base + ('/#precios') + '">' + S.pricing + '</a>' +
    '<span class="lang">' + (LANG === 'es' ? '<b>ES</b> · <a href="' + otherUrl(location.search.slice(1)) + '" hreflang="en">EN</a>' : '<a href="' + otherUrl(location.search.slice(1)) + '" hreflang="es">ES</a> · <b>EN</b>') + '</span>' +
    '<a href="' + base + '/cuenta/">' + S.login + '</a></div>';
  $('kicker').textContent = S.kicker; $('title').innerHTML = S.title;
  $('q').setAttribute('aria-label', S.search); $('q').placeholder = S.searchPh;
  $('incl').innerHTML = '<b>' + S.incl + '</b>' + S.inclList.map(function (x) { return '<span>' + CHECK(14, 2) + esc(x) + '</span>'; }).join('');
  $('clear').textContent = S.clear; $('emptyTxt').textContent = S.empty; $('emptyClear').textContent = S.clear;
  $('foot').innerHTML = '<span style="display: flex; flex-direction: column; gap: 8px"><a class="logo" href="' + base + '/" aria-label="Invitesse">' + WM + '</a><span>' + S.tagline + '</span></span><nav>' + S.foot.map(function (f) { return '<a href="' + f[0] + '">' + f[1] + '</a>'; }).join('') + '</nav>';

  // Estado de los filtros (desde la URL)
  var q = new URLSearchParams(location.search), sel = {}, text = q.get('q') || '';
  C.filters.forEach(function (g) { sel[g.key] = (q.get(g.key) || '').split(',').filter(function (v) { return g.opts.some(function (o) { return o.id === v; }); }); });
  $('q').value = text;

  // Tarjetas: se pintan una vez; filtrar solo las muestra u oculta. Al final, la tarjeta del diseño a la medida.
  var selection = ['nacar','onix','arco','encaje','marfil','jardin'];
  var ordered = C.designs.slice().sort(function (a, b) { var x = selection.indexOf(a.id), y = selection.indexOf(b.id); return (x < 0 ? selection.length : x) - (y < 0 ? selection.length : y); });
  $('grid').innerHTML = ordered.map(function (d) { return C.card(d, LANG); }).join('') +
    '<div class="tailcard" id="tail"><div><p class="k">' + S.tailK + '</p><h3>' + S.tailH + '</h3><p>' + esc(S.tailP) + '</p></div><div style="display: flex; flex-wrap: wrap; gap: 10px"><a class="btn" style="background: var(--iv-paper); color: var(--iv-ink)" href="' + base + ('/#medida') + '">' + S.tailA + '</a><a class="btn" style="color: var(--iv-paper); box-shadow: inset 0 0 0 1.5px #F3EEE955" href="' + base + ('/#como') + '">' + S.tailB + '</a></div></div>';
  var cards = {}; $('grid').querySelectorAll('.lz-card').forEach(function (el) { cards[el.dataset.id] = el; });
  var words = {}; C.designs.forEach(function (d) {
    var t = d[LANG], w = [t.name, t.title, t.desc, t.opening, t.colors];
    C.filters.forEach(function (g) { (d.tags[g.key] || []).forEach(function (id) { var o = g.opts.filter(function (x) { return x.id === id; })[0]; if (o) w.push(o[LANG]); }); });
    words[d.id] = fold(w.join(' '));
  });
  function matches(d, skip) {
    if (text && fold(text).split(/\s+/).some(function (w) { return w && words[d.id].indexOf(w) < 0; })) return false;
    return C.filters.every(function (g) { return g.key === skip || !sel[g.key].length || sel[g.key].some(function (v) { return (d.tags[g.key] || []).indexOf(v) >= 0; }); });
  }
  var hasAny = function (d, opts) { return (d.tags.apertura || []).some(function (a) { return opts.indexOf(a) >= 0; }); };
  var sameSet = function (a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); };

  // Pestañas de apertura
  $('tabs').setAttribute('aria-label', S.tabsLbl);
  $('tabs').innerHTML = '<span class="k">' + S.opening + '</span><button type="button" class="tab" data-o="">' + S.all + ' <small></small></button>' +
    C.openings.map(function (o) { return '<button type="button" class="tab" data-o="' + o.id + '">' + esc(o[LANG]) + ' <small></small></button>'; }).join('');

  var styles = C.filters.filter(function (g) { return g.key === 'estilo'; })[0];
  $('styles').setAttribute('aria-label', LANG === 'es' ? 'Explorar por estilo' : 'Explore by style');
  $('styles').innerHTML = '<button type="button" class="style-filter" data-style="">' + S.all + '</button>' + styles.opts.map(function (o) { return '<button type="button" class="style-filter" data-style="' + o.id + '">' + esc(o[LANG]) + '</button>'; }).join('');
  $('styles').addEventListener('click', function (event) {
    var b = event.target.closest('[data-style]'); if (!b) return;
    sel.estilo = b.dataset.style ? [b.dataset.style] : []; render();
  });
  // Filtros de la barra lateral (todos menos la apertura, que va en las pestañas)
  $('filters').innerHTML = '<div class="sheet-head"><div><b id="filterTitle">' + S.filters + '</b><button type="button" class="clear" data-clear>' + S.clearAll + '</button></div></div>' +
    C.filters.filter(function (g) { return g.key !== 'apertura' && g.key !== 'estilo'; }).map(function (g) { return '<fieldset><legend>' + g[LANG] + '</legend>' + g.opts.map(function (o) { return '<button type="button" class="chk" data-g="' + g.key + '" data-v="' + o.id + '" aria-pressed="false"><i>' + CHECK(12, 2.4) + '</i>' + esc(o[LANG]) + '<small></small></button>'; }).join('') + '</fieldset>'; }).join('') +
    '<div class="custom"><b>' + S.customH + '</b><span>' + S.customP + '</span><a href="' + base + ('/#medida') + '">' + S.customA + ARROW + '</a></div>' +
    '<div class="sheet-foot"><button type="button" class="btn btn-dark" data-close></button></div>';

  function render() {
    var shown = 0, total = C.designs.length, active = text.trim() ? 1 : 0;
    C.designs.forEach(function (d) { var ok = matches(d); cards[d.id].hidden = !ok; if (ok) shown++; });
    C.filters.forEach(function (g) { active += sel[g.key].length ? (g.key === 'apertura' ? 1 : sel[g.key].length) : 0; });
    $('filters').querySelectorAll('.chk').forEach(function (b) {
      var g = b.dataset.g, v = b.dataset.v, on = sel[g].indexOf(v) >= 0;
      var n = C.designs.filter(function (d) { return matches(d, g) && (d.tags[g] || []).indexOf(v) >= 0; }).length;
      b.setAttribute('aria-pressed', String(on)); b.querySelector('small').textContent = n; b.disabled = !n && !on;
    });
    $('tabs').querySelectorAll('.tab').forEach(function (b) {
      var o = C.openings.filter(function (x) { return x.id === b.dataset.o; })[0];
      var n = C.designs.filter(function (d) { return matches(d, 'apertura') && (!o || hasAny(d, o.opts)); }).length;
      var on = o ? sameSet(sel.apertura, o.opts) : !sel.apertura.length;
      b.setAttribute('aria-pressed', String(on)); b.querySelector('small').textContent = n; b.disabled = !n && !on;
    });
    $('styles').querySelectorAll('[data-style]').forEach(function (b) {
      var id = b.dataset.style;
      b.setAttribute('aria-pressed', String(id ? sel.estilo.indexOf(id) >= 0 : !sel.estilo.length));
    });
    $('count').innerHTML = S.count(shown, total);
    $('clear').hidden = !active; $('empty').hidden = shown > 0; $('tail').hidden = shown === 0;
    $('ftoggle').innerHTML = FILTER + S.filters + (active ? ' <b style="display: inline-grid; place-items: center; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: var(--iv-ink); color: var(--iv-paper); font-size: 12px">' + active + '</b>' : '');
    $('filters').querySelector('[data-close]').textContent = S.show(shown);
    var p = new URLSearchParams(); if (text.trim()) p.set('q', text.trim());
    C.filters.forEach(function (g) { if (sel[g.key].length) p.set(g.key, sel[g.key].join(',')); });
    var s = p.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    var other = document.querySelector('.lang a'); if (other) other.href = otherUrl(s);
  }
  $('filters').addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) return sheet(false);
    if (e.target.closest('[data-clear]')) return clearAll();
    var b = e.target.closest('.chk'); if (!b) return;
    var l = sel[b.dataset.g], i = l.indexOf(b.dataset.v);
    if (i >= 0) l.splice(i, 1); else l.push(b.dataset.v);
    render();
  });
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b || b.disabled) return;
    var o = C.openings.filter(function (x) { return x.id === b.dataset.o; })[0];
    sel.apertura = o ? o.opts.slice() : []; render();
  });
  $('tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var t = [].slice.call($('tabs').querySelectorAll('.tab:not(:disabled)')), i = t.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); var n = t[(i + (e.key === 'ArrowRight' ? 1 : -1) + t.length) % t.length]; n.focus(); n.click();
  });
  $('q').addEventListener('input', function () { text = this.value; render(); });
  function clearAll() { text = ''; $('q').value = ''; Object.keys(sel).forEach(function (k) { sel[k] = []; }); render(); }
  $('clear').addEventListener('click', clearAll); $('emptyClear').addEventListener('click', clearAll);
  // En el celular, los filtros se abren en una hoja desde abajo.
  var mobileFilters = matchMedia('(max-width:960px)');
  var sheetBackground = document.querySelectorAll('.top,.head,.layout>div,.foot');
  function sheet(o) {
    o = o && mobileFilters.matches;
    $('filters').classList.toggle('open', o); $('sheetBg').classList.toggle('open', o); document.body.classList.toggle('sheet-open', o);
    $('ftoggle').setAttribute('aria-expanded', String(o));
    sheetBackground.forEach(function (el) { el.inert = o; });
    if (o) {
      $('filters').setAttribute('role', 'dialog'); $('filters').setAttribute('aria-modal', 'true'); $('filters').setAttribute('aria-labelledby', 'filterTitle');
      $('filters').querySelector('button').focus();
    } else {
      $('filters').removeAttribute('role'); $('filters').removeAttribute('aria-modal'); $('filters').removeAttribute('aria-labelledby');
      if (mobileFilters.matches) $('ftoggle').focus();
    }
  }
  mobileFilters.addEventListener('change', function () { if ($('filters').classList.contains('open')) sheet(false); });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab' || !$('filters').classList.contains('open')) return;
    var buttons = [].slice.call($('filters').querySelectorAll('button:not(:disabled)')).filter(function (b) { return b.getClientRects().length; });
    var first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  $('ftoggle').addEventListener('click', function () { sheet(!$('filters').classList.contains('open')); });
  $('sheetBg').addEventListener('click', function () { sheet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('filters').classList.contains('open')) sheet(false); });
  render();
})();
