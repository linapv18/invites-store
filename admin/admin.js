/* Panel de administración de Invitesse (/admin/).
   Acceso: correo y contraseña de Supabase; el servidor (api/admin.js) solo responde si el correo está en ADMIN_EMAILS.
   Vistas por hash: inicio, pedidos, borradores, archivados, papelera, descuentos y analíticas. Todo lo que viene de la base se escapa antes de pintarse. */
(function () {
  'use strict';
  var root = document.getElementById('admin');
  var B = window.InvitesseBackend, CAT = window.LazoCatalog;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var WM = '<span class="iv-wm"><span>invite</span><b>ss</b><span>e</span><svg viewBox="0 0 70 54" aria-hidden="true"><path d="M2 48C10 34 22 26 31 30C39 34 35 45 27 43C19 41 21 26 36 17C46 11 58 10 66 15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span>';
  var ICON = {
    resumen: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/>',
    ordenes: '<path d="M6 3h12l1 18H5zM9 7a3 3 0 0 0 6 0"/>',
    codigos: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    analiticas: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'
  };
  var svg = function (k, s) { return '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };
  ICON.borradores=ICON.ordenes; ICON.archivados=ICON.ordenes; ICON.papelera='<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>';
  var VIEWS = [['resumen', 'Inicio'], ['ordenes', 'Pedidos'], ['borradores', 'Borradores de pedido'], ['archivados', 'Archivados'], ['papelera', 'Papelera'], ['codigos', 'Códigos de descuento'], ['analiticas', 'Analíticas']];
  var STATUS = { paid: 'Pagado', pending: 'Pendiente', refunded: 'Reembolsado', cancelled: 'Cancelado' };
  var TIER = { esencial: 'Esencial', signature: 'Signature', luxury: 'Luxury' };
  var renderEpoch=0;
  var state = { email: '', days: 30, cur: 'COP', orders: { status: '', currency: '', tier: '', q: '', offset: 0 }, selected: null, kind: 'percent', badge: 0 };

  var designOf = function (id) { var d = CAT && CAT.designs.filter(function (x) { return x.id === id; })[0]; return d ? d.es.name : id || '—'; };
  var tierTag = function (t) { return t ? '<span class="tier ' + esc(t) + '">' + esc(TIER[t] || t) + '</span>' : ''; };
  var money = function (minor, cur) {
    if (minor == null) return '—';
    var n = Number(minor) / 100;
    return cur === 'USD' ? 'USD ' + n.toLocaleString('es-CO', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) : '$ ' + Math.round(n).toLocaleString('es-CO');
  };
  var date = function (v, withTime) {
    if (!v) return '—';
    var d = new Date(v), today = new Date(), y = new Date(Date.now() - 86400000);
    var t = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === today.toDateString()) return 'Hoy' + (withTime ? ', ' + t : '');
    if (d.toDateString() === y.toDateString()) return 'Ayer' + (withTime ? ', ' + t : '');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
  };
  var couple = function (r) { var a = (r.n1 || '').trim(), b = (r.n2 || '').trim(); return a || b ? a + (a && b ? ' & ' : '') + b : 'Sin nombres todavía'; };
  var pill = function (s) { return '<span class="pill ' + esc(s) + '">' + esc(STATUS[s] || s) + '</span>'; };
  var shortId = function (id) { return '#' + String(id || '').slice(0, 8); };
  function toast(msg) { var t = document.createElement('div'); t.className = 'ad-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }

  async function token() { var s = await B.client.auth.getSession(); return s.data.session && s.data.session.access_token; }
  async function api(action, params, body) {
    var requestedView = view(), requestedEpoch=renderEpoch; var t = await token(); if (!t) throw Object.assign(new Error('AUTH_REQUIRED'), { status: 401 });
    var url = '/api/admin/?action=' + encodeURIComponent(action) + (params ? '&' + new URLSearchParams(params).toString() : '');
    var r = await fetch(body ? '/api/admin/' : url, { method: body ? 'POST' : 'GET', cache: 'no-store', headers: Object.assign({ Authorization: 'Bearer ' + t }, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(Object.assign({ action: action }, body)) : undefined });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) throw Object.assign(new Error(j.error || 'ADMIN_UNAVAILABLE'), { status: r.status });
    if(!body && action !== 'me' && (requestedView !== view() || requestedEpoch !== renderEpoch)) throw Error('STALE_VIEW');
    return j;
  }

  /* ---------- Acceso ---------- */
  function login(msg) {
    root.innerHTML = '<div class="ad-login"><form novalidate><span aria-hidden="true">' + WM + '</span><h1>Panel de administración</h1>' +
      '<label class="ad-field">Correo<input name="email" type="email" autocomplete="username" required></label>' +
      '<label class="ad-field">Contraseña<input name="pass" type="password" autocomplete="current-password" required></label>' +
      '<p class="ad-error" role="alert"' + (msg ? '' : ' hidden') + '>' + esc(msg || '') + '</p>' +
      '<button class="ad-btn dark" type="submit">Entrar</button></form></div>';
    var f = root.querySelector('form'), err = f.querySelector('.ad-error');
    f.email.focus();
    f.addEventListener('submit', async function (e) {
      e.preventDefault(); err.hidden = true;
      var btn = f.querySelector('button'); btn.disabled = true;
      try {
        var r = await B.auth.signIn(f.email.value, f.pass.value);
        if (r.error) throw r.error;
        await start();
      } catch (_) { err.textContent = 'El correo o la contraseña no son correctos.'; err.hidden = false; btn.disabled = false; f.pass.value = ''; f.pass.focus(); }
    });
  }
  function blocked(title, text) {
    root.innerHTML = '<div class="ad-login"><form><span aria-hidden="true">' + WM + '</span><h1>' + esc(title) + '</h1><p class="ad-note">' + esc(text) + '</p><button class="ad-btn" type="button" data-out>Cerrar sesión</button></form></div>';
    root.querySelector('[data-out]').addEventListener('click', signOut);
  }
  async function signOut() { try { await B.auth.signOut(); } catch (_) {} login(); }
  async function start() {
    if (!B) { blocked('Sin conexión', 'No se pudo cargar la conexión con la base de datos.'); return; }
    try {
      var me = await api('me'); state.email = me.email; state.prices = me.prices || {};
      render();
    } catch (e) {
      if (e.status === 401) login();
      else if (e.status === 403) blocked('Sin acceso', 'Esta cuenta no tiene acceso al panel.');
      else if (e.message === 'ADMIN_NOT_CONFIGURED') blocked('Falta configurar el panel', 'Agrega tu correo en la variable ADMIN_EMAILS de Vercel y vuelve a desplegar.');
      else blocked('No se pudo abrir el panel', 'Inténtalo de nuevo en un momento.');
    }
  }

  /* ---------- Estructura ---------- */
  function view() { var h = location.hash.slice(1); return VIEWS.some(function (v) { return v[0] === h; }) ? h : 'resumen'; }
  function shell(content) {
    var v = view();
    return '<div class="ad"><aside class="ad-nav"><a class="iv-wm-link" href="#resumen" aria-label="Invitesse, resumen" style="text-decoration:none">' + WM + '</a>' +
      '<nav aria-label="Administración"><small>Panel</small>' + VIEWS.map(function (x) {
        return '<a class="ad-link" href="#' + x[0] + '"' + (x[0] === v ? ' aria-current="page"' : '') + '>' + svg(x[0]) + esc(x[1]) + (x[0] === 'borradores' && state.badge ? '<span class="ad-badge">' + state.badge + '</span>' : '') + '</a>';
      }).join('') + '</nav>' +
      '<div class="ad-me"><span><b>Admin</b><em>' + esc(state.email) + '</em></span><button type="button" data-out>Salir</button></div></aside>' +
      '<main class="ad-main" id="main" tabindex="-1"><div class="ad-wrap">' + content + '</div></main></div>';
  }
  function head(title, kicker, tools) { return '<header class="ad-head"><div><p class="ad-k">' + esc(kicker) + '</p><h1>' + esc(title) + '</h1></div><div class="ad-tools">' + (tools || '') + '</div></header>'; }
  function periodSelect() {
    return '<label class="ad-select">Periodo<select data-days>' + [[7, 'Últimos 7 días'], [30, 'Últimos 30 días'], [90, 'Últimos 90 días'], [365, 'Último año']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === state.days ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
  }
  function loading() { root.innerHTML = shell('<p class="ad-empty" role="status">Cargando…</p>'); bindShell(); }
  function bindShell() {
    var out = root.querySelector('[data-out]'); if (out) out.addEventListener('click', signOut);
    var d = root.querySelector('[data-days]'); if (d) d.addEventListener('change', function () { state.days = +d.value; render(); });
  }
  async function render() {
    var v = view(); renderEpoch++; loading();
    try {
      if (v === 'resumen') await renderSummary();
      else if (['ordenes','borradores','archivados','papelera'].includes(v)) await renderOrders();
      else if (v === 'codigos') await renderCodes();
      else await renderAnalytics();
    } catch (e) {
      if(e.message==='STALE_VIEW')return;
      if (e.status === 401) return login('Tu sesión terminó. Vuelve a entrar.');
      root.innerHTML = shell(head('Algo falló', 'Panel', '') + '<p class="ad-error" role="alert">No se pudieron cargar los datos. Inténtalo de nuevo en un momento.</p>'); bindShell();
    }
  }
  window.addEventListener('hashchange', function () { if (state.email) {state.orders.status='';state.orders.offset=0;state.selected=null;render();} });

  /* ---------- Resumen ---------- */
  async function renderSummary() {
    var s = await api('summary', { days: state.days });
    state.badge = s.pending || 0;
    var cur = state.cur, rev = (s.revenue || {})[cur] || { total: 0, orders: 0 }, other = cur === 'COP' ? 'USD' : 'COP', revOther = (s.revenue || {})[other];
    var tiers = s.by_tier || {}, tierTotal = Object.keys(tiers).reduce(function (a, k) { return a + tiers[k]; }, 0);
    var weeks = (s.weekly || []).filter(function (w) { return w.currency === cur; }).slice(-8), max = Math.max.apply(null, weeks.map(function (w) { return Number(w.total); }).concat([1]));
    var chart = weeks.length ? '<svg viewBox="0 0 640 220" role="img" aria-label="Ingresos por semana en ' + cur + '" style="width:100%;height:auto">' +
      [20, 80, 140, 200].map(function (y) { return '<line x1="0" y1="' + y + '" x2="640" y2="' + y + '" stroke="#E4DAD6"/>'; }).join('') +
      weeks.map(function (w, i) { var h = Math.max(4, Math.round(170 * Number(w.total) / max)), x = 20 + i * 78, last = i === weeks.length - 1;
        return '<rect x="' + x + '" y="' + (200 - h) + '" width="48" height="' + h + '" rx="6" fill="' + (last ? '#352432' : '#D0BBC7') + '"><title>' + esc(date(w.week) + ': ' + money(w.total, cur)) + '</title></rect>' +
          '<text x="' + (x + 24) + '" y="216" text-anchor="middle" font-size="11" fill="#71616B" font-family="Geist, sans-serif">' + esc(new Date(w.week).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })) + '</text>'; }).join('') + '</svg>'
      : '<p class="ad-empty">Todavía no hay pagos en ' + cur + ' en este periodo.</p>';
    var todo = [];
    if (s.pending_stale) todo.push(['#borradores', '#C08A3E', s.pending_stale + (s.pending_stale === 1 ? ' checkout pendiente' : ' checkouts pendientes'), 'Sin pago confirmado; revisar en Borradores de pedido']);
    if (s.paid_unpublished) todo.push(['#ordenes', '#71616B', s.paid_unpublished + (s.paid_unpublished === 1 ? ' invitación pagada sin publicar' : ' invitaciones pagadas sin publicar'), 'Podría necesitar ayuda']);
    (s.codes_ending || []).forEach(function (c) { todo.push(['#codigos', '#B7A38A', c.code + ' vence ' + date(c.ends_at), 'Usado ' + c.uses + (c.max_uses ? ' de ' + c.max_uses : '') + ' veces']); });
    todo.push(['mailto:hola@invitesse.com', '#674A60', 'Cotizaciones a medida', 'Llegan a hola@invitesse.com']);
    var html = head('Inicio', 'Ventas de los últimos ' + state.days + ' días', '<div class="ad-seg" role="group" aria-label="Moneda">' + ['COP', 'USD'].map(function (c) { return '<button type="button" data-cur="' + c + '" aria-pressed="' + (c === cur) + '">' + c + '</button>'; }).join('') + '</div>' + periodSelect()) +
      '<section class="ad-kpis" aria-label="Indicadores">' +
        '<article class="ad-kpi dark"><span class="ad-k">Ingresos</span><b>' + money(rev.total, cur) + '</b><span>' + cur + ' · ' + rev.orders + (rev.orders === 1 ? ' pedido pagado' : ' pedidos pagados') + '</span>' + (revOther ? '<span>Además ' + money(revOther.total, other) + '</span>' : '') + '</article>' +
        '<article class="ad-kpi"><span class="ad-k">Pedidos pagados</span><b>' + (s.paid || 0) + '</b><span>' + (s.discounted || 0) + ' con código de descuento</span></article>' +
        '<article class="ad-kpi"><span class="ad-k">Invitaciones publicadas</span><b>' + (s.published || 0) + '</b><span>' + (s.paid_unpublished || 0) + ' pagadas sin publicar</span></article>' +
        '<article class="ad-kpi"><span class="ad-k">Confirmaciones</span><b>' + (s.responses || 0) + '</b><span>' + (s.attending || 0) + ' asistirán · ' + (s.households || 0) + ' familias invitadas</span></article>' +
      '</section>' +
      '<div class="ad-row"><section class="ad-card wide"><h2>Ingresos por semana</h2>' + chart + '</section>' +
        '<section class="ad-card"><h2>Ventas por gama</h2><div class="ad-bars">' + ['esencial', 'signature', 'luxury'].map(function (t) {
          var n = tiers[t] || 0, pct = tierTotal ? Math.round(100 * n / tierTotal) : 0;
          return '<div class="ad-bar"><div>' + tierTag(t) + '<b>' + n + ' · ' + pct + ' %</b></div><i><span style="width:' + pct + '%;background:' + (t === 'luxury' ? '#B7A38A' : t === 'signature' ? '#674A60' : '#9C8D96') + '"></span></i></div>';
        }).join('') + '</div></section></div>' +
      '<div class="ad-row"><section class="ad-card wide"><div class="ad-head" style="align-items:baseline"><h2>Últimos pedidos</h2><a href="#ordenes">Ver todos</a></div>' + ordersTable(s.recent || [], false) + '</section>' +
        '<section class="ad-card ad-todo"><h2>Para revisar</h2>' + todo.map(function (t) { return '<a href="' + esc(t[0]) + '"><span class="dot" style="background:' + t[1] + '" aria-hidden="true"></span><span><b>' + esc(t[2]) + '</b><small>' + esc(t[3]) + '</small></span></a>'; }).join('') + '</section></div>';
    root.innerHTML = shell(html); bindShell();
    root.querySelectorAll('[data-cur]').forEach(function (b) { b.addEventListener('click', function () { state.cur = b.dataset.cur; render(); }); });
    bindOrderRows();
  }

  function ordersTable(rows, selectable) {
    if (!rows.length) return '<p class="ad-empty">No hay órdenes que mostrar.</p>';
    return '<div class="ad-table"><table><thead><tr><th>Orden</th><th>Pareja</th><th>Diseño</th><th>Total</th><th>Estado</th><th>Invitación</th></tr></thead><tbody>' + rows.map(function (r) {
      var inv = r.invitation_state === 'published' ? 'Publicada' + (r.responses ? ' · ' + r.responses + ' RSVP' : '') : r.status === 'paid' ? 'Sin publicar' : '—';
      return '<tr class="is-row" tabindex="0" data-order="' + esc(r.id) + '" aria-selected="' + (selectable && state.selected === r.id) + '">' +
        '<td><b>' + esc(shortId(r.id)) + '</b><small>' + esc(date(r.created_at, true)) + '</small></td>' +
        '<td><b>' + esc(couple(r)) + '</b><small>' + esc(r.email || '') + '</small></td>' +
        '<td>' + esc(designOf(r.design)) + '<small>' + tierTag(r.tier) + '</small></td>' +
        '<td class="num">' + esc(money(r.total_minor, r.currency)) + ' ' + esc(r.currency) + (r.code ? '<small>' + esc(r.code) + '</small>' : '') + '</td>' +
        '<td>' + pill(r.status) + '</td><td>' + esc(inv) + (r.event_date ? '<small>Boda ' + esc(new Date(r.event_date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })) + '</small>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  }
  function bindOrderRows() {
    root.querySelectorAll('[data-order]').forEach(function (tr) {
      var open = function () { var id=tr.dataset.order; if (!['ordenes','borradores','archivados','papelera'].includes(view())) {location.hash='ordenes';setTimeout(function(){state.selected=id;renderDetail();},0);} else {state.selected=id;renderDetail();} };
      tr.addEventListener('click', open);
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  /* ---------- Órdenes ---------- */
  async function renderOrders() {
    var v=view(), drafts=v==='borradores', o = state.orders, params = { offset: o.offset, bucket:drafts?'drafts':v==='ordenes'?'orders':'all', visibility:v==='papelera'?'trash':v==='archivados'?'archived':'active' };
    var title=drafts?'Borradores de pedido':v==='papelera'?'Papelera':v==='archivados'?'Archivados':'Pedidos';
    var help=drafts?'Checkouts sin compra confirmada. Los pagos completados pasan automáticamente a Pedidos.':v==='papelera'?'Registros eliminados del panel. Puedes restaurarlos; los pagos y las analíticas conservan su historial.':v==='archivados'?'Pedidos y borradores que apartaste de las listas activas.':'Compras confirmadas y reembolsos. Los checkouts sin pagar están en Borradores de pedido.';
    ['status', 'currency', 'tier', 'q'].forEach(function (k) { if (o[k]) params[k] = o[k]; });
    var data = await api('orders', params), c = data.counts || {};
    if(drafts) state.badge = c.pending || 0;
    var chips = [['','Todos',c.all]].concat(drafts?[['pending','Pendientes',c.pending],['cancelled','Cancelados',c.cancelled]]:v==='ordenes'?[['paid','Pagados',c.paid],['refunded','Reembolsados',c.refunded]]:[['paid','Pagados',c.paid],['pending','Pendientes',c.pending],['refunded','Reembolsados',c.refunded],['cancelled','Cancelados',c.cancelled]]);
    var from = data.total ? data.offset + 1 : 0, to = data.offset + data.rows.length;
    var html = head(title, data.total + (data.total === 1 ? ' registro' : ' registros'), '<button type="button" class="ad-btn" data-refresh>Actualizar</button>') + '<p class="ad-note">'+esc(help)+'</p>' +
      '<div class="ad-tools"><label class="ad-search">' + svg('search', 16) + '<span class="vh">Buscar</span><input data-q value="' + esc(o.q) + '" placeholder="Buscar por pareja, correo, código o número de orden"></label>' +
        '<div class="ad-chips" role="group" aria-label="Estado">' + chips.map(function (x) { return '<button type="button" class="ad-chip" data-status="' + x[0] + '" aria-pressed="' + (o.status === x[0]) + '">' + x[1] + ' ' + (x[2] || 0) + '</button>'; }).join('') + '</div>' +
        '<label class="ad-select">Gama<select data-tier><option value="">Todas</option>' + Object.keys(TIER).map(function (t) { return '<option value="' + t + '"' + (o.tier === t ? ' selected' : '') + '>' + TIER[t] + '</option>'; }).join('') + '</select></label>' +
        '<label class="ad-select">Moneda<select data-currency><option value="">Todas</option><option' + (o.currency === 'COP' ? ' selected' : '') + '>COP</option><option' + (o.currency === 'USD' ? ' selected' : '') + '>USD</option></select></label></div>' +
      '<div class="ad-row"><section class="ad-card wide" style="padding:0;gap:0;flex:3 1 560px" aria-label="Lista de órdenes">' + ordersTable(data.rows, true) +
        '<div class="ad-pager"><span>Mostrando ' + from + '–' + to + ' de ' + data.total + '</span><span class="ad-tools"><button type="button" class="ad-btn" data-page="-1" aria-label="Página anterior"' + (o.offset ? '' : ' disabled') + '>' + svg('left', 14) + '</button><button type="button" class="ad-btn" data-page="1" aria-label="Página siguiente"' + (to < data.total ? '' : ' disabled') + '>' + svg('right', 14) + '</button></span></div></section>' +
        '<aside class="ad-card ad-detail" id="detail" aria-live="polite"><section><p class="ad-empty">Elige una orden para ver su detalle.</p></section></aside></div>';
    root.innerHTML = shell(html); bindShell(); bindOrderRows();
    root.querySelector('[data-refresh]').addEventListener('click',render);
    if(data.total && !data.rows.length && o.offset){o.offset=Math.max(0,o.offset-25);return renderOrders();}
    var q = root.querySelector('[data-q]'), timer;
    q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { o.q = q.value.trim(); o.offset = 0; render().then(function () { var n = root.querySelector('[data-q]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }); }, 350); });
    root.querySelectorAll('[data-status]').forEach(function (b) { b.addEventListener('click', function () { o.status = b.dataset.status; o.offset = 0; render(); }); });
    root.querySelector('[data-tier]').addEventListener('change', function (e) { o.tier = e.target.value; o.offset = 0; render(); });
    root.querySelector('[data-currency]').addEventListener('change', function (e) { o.currency = e.target.value; o.offset = 0; render(); });
    root.querySelectorAll('[data-page]').forEach(function (b) { b.addEventListener('click', function () { o.offset = Math.max(0, o.offset + Number(b.dataset.page) * 25); render(); }); });
    if (state.selected) renderDetail();
  }
  async function renderDetail() {
    var box = root.querySelector('#detail'); if (!box) return;
    root.querySelectorAll('[data-order]').forEach(function (tr) { tr.setAttribute('aria-selected', String(tr.dataset.order === state.selected)); });
    box.innerHTML = '<section><p class="ad-empty" role="status">Cargando la orden…</p></section>';
    var r, requestedId=state.selected;
    try { r = await api('order', { id: requestedId }); if(state.selected!==requestedId || !box.isConnected)return; } catch (_) { box.innerHTML = '<section><p class="ad-error">No se pudo cargar esta orden.</p></section>'; return; }
    var items = (r.items || []).map(function (it) { return '<div class="line"><span>' + (it.design ? 'Diseño ' + esc(designOf(it.design)) + ' ' + tierTag(r.tier) : 'Complemento ' + esc(it.addon)) + '</span><span class="num">' + esc(money(it.unit_price_minor, r.currency)) + '</span></div>'; }).join('');
    var p = r.payment, ent = r.entitlement;
    var stripeUrl=p?(p.id.indexOf('cs_')===0?'https://dashboard.stripe.com/checkout/sessions/':'https://dashboard.stripe.com/payments/')+encodeURIComponent(p.id):null;
    box.innerHTML =
      '<section><div class="line"><span class="ad-k">Orden ' + esc(shortId(r.id)) + '</span>' + pill(r.status) + '</div><h2>' + esc(couple(r)) + '</h2><span style="color:var(--mute);font-size:13px">' + esc(r.email || '') + (r.event_date ? ' · Boda el ' + esc(new Date(r.event_date + 'T12:00:00').toLocaleDateString('es-CO', { dateStyle: 'long' })) : '') + '</span></section>' +
      '<section><span class="ad-k">Detalle</span>' + items +
        (r.discount_minor ? '<div class="line" style="color:var(--ok)"><span style="color:var(--ok)">Código ' + esc(r.code || '') + '</span><span class="num">− ' + esc(money(r.discount_minor, r.currency)) + '</span></div>' : '') +
        '<div class="line" style="padding-top:10px;border-top:1px dashed var(--line2)"><b>Total</b><b style="font:500 20px var(--serif)">' + esc(money(r.total_minor, r.currency)) + ' ' + esc(r.currency) + '</b></div></section>' +
      '<section><span class="ad-k">Pago</span>' + (p ? '<div class="line"><span>Confirmado</span><span>' + esc(date(p.verified_at, true)) + '</span></div><div class="line"><span>' + esc(p.provider === 'stripe' ? 'Stripe' : p.provider) + '</span><a href="' + stripeUrl + '" target="_blank" rel="noopener">' + esc(p.id.slice(0, 10)) + '…</a></div>' : '<p class="ad-empty">Todavía no hay pago confirmado.</p>') + '</section>' +
      '<section><span class="ad-k">Invitación</span>' +
        '<div class="line"><span>Diseño actual</span><span>'+esc(designOf(r.selected_design || r.design))+'</span></div><div class="line"><span>Estado</span><span>' + esc(r.invitation_state === 'published' ? 'Publicada' : r.invitation_state === 'paused' ? 'Pausada' : 'Sin publicar') + '</span></div>' +
        '<div class="line"><span>Familias · invitados</span><span>' + (r.households || 0) + ' · ' + (r.guests || 0) + '</span></div>' +
        '<div class="line"><span>Confirmaciones</span><span>' + (r.responses || 0) + ' (' + (r.attending || 0) + ' asistirán)</span></div>' +
        (ent ? '<div class="line"><span>Acceso hasta</span><span>' + esc(ent.revoked_at ? 'Retirado ' + date(ent.revoked_at) : date(ent.expires_at)) + '</span></div>' : '') + '</section>' +
      '<section class="actions">' + (r.email ? '<a class="ad-btn dark" href="mailto:' + encodeURIComponent(r.email) + '">Escribir a la pareja</a>' : '') +
        (!p && r.checkout_session_id?'<a class="ad-btn" href="https://dashboard.stripe.com/checkout/sessions/'+encodeURIComponent(r.checkout_session_id)+'" target="_blank" rel="noopener">Ver checkout en Stripe</a>':'') +
        (p ? '<a class="ad-btn" href="' + stripeUrl + '" target="_blank" rel="noopener">Ver en Stripe ' + svg('ext', 14) + '</a>' : '') +
        (p && p.id.indexOf('pi_')===0 && r.status === 'paid' ? '<a class="ad-btn danger" href="' + stripeUrl + '" target="_blank" rel="noopener" title="El reembolso se hace en Stripe; el acceso se retira solo al confirmarse">Reembolsar en Stripe</a>' : '') + '</section>' +
      '<section class="actions" aria-label="Gestionar registro">'+(r.deleted_at || r.archived_at?'<button type="button" class="ad-btn" data-manage="restore">Restaurar</button>':'<button type="button" class="ad-btn" data-manage="archive">Archivar</button>')+(!r.deleted_at?'<button type="button" class="ad-btn danger" data-manage="delete">Eliminar</button>':'')+'</section><section><p class="ad-note">Eliminar mueve el registro a la papelera. No reembolsa pagos ni retira el acceso a una invitación comprada.</p><p class="ad-error" role="alert" data-manage-error hidden></p></section>';
    box.querySelectorAll('[data-manage]').forEach(function(button){button.addEventListener('click',function(){confirmOrderAction(r,button.dataset.manage);});});
  }

  function confirmOrderAction(order,operation) {
    var dialog=document.createElement('dialog');dialog.className='ad-confirm';
    var label=operation==='delete'?'Eliminar':operation==='archive'?'Archivar':'Restaurar';
    var description=operation==='delete'?(order.status==='pending'?'Se comprobará Stripe y se cerrará el checkout si sigue sin pagar. El registro se moverá a la papelera. Si el pago ya se completó, se actualizará primero y no se eliminará.':'Se moverá a la papelera. Podrás restaurarlo. El pago, la invitación y las analíticas se conservan.'):operation==='archive'?'Se apartará de la lista activa. Podrás restaurarlo desde Archivados.':'Volverá a Pedidos o Borradores de pedido según su estado de pago.';
    dialog.innerHTML='<form method="dialog"><h2>'+label+' '+esc(shortId(order.id))+'?</h2><p>'+esc(description)+'</p><p class="ad-error" role="alert" hidden></p><div class="ad-tools"><button class="ad-btn" value="cancel">Volver</button><button class="ad-btn '+(operation==='delete'?'danger':'dark')+'" type="button" data-confirm>'+label+'</button></div></form>';
    document.body.appendChild(dialog);dialog.addEventListener('close',function(){dialog.remove();});dialog.showModal();
    dialog.querySelector('[data-confirm]').addEventListener('click',async function(){
      var button=this;button.disabled=true;var err=dialog.querySelector('.ad-error');err.hidden=true;
      try{await api('manage-order',null,{id:order.id,operation:operation});dialog.close();state.selected=null;toast(operation==='delete'?'Registro movido a la papelera':operation==='archive'?'Registro archivado':'Registro restaurado');await render();}
      catch(e){var messages={ORDER_STATE_CHANGED:'El estado de pago cambió. Actualiza el pedido antes de continuar.',CHECKOUT_BEING_PREPARED:'El checkout se está preparando. Espera unos minutos y actualiza el pedido.',PAYMENT_PROCESSING:'Stripe está procesando el pago. Espera su confirmación antes de eliminar.',ORDER_JUST_PAID:'Stripe confirmó la compra. Cierra esta ventana y actualiza: el registro ahora está en Pedidos.',CHECKOUT_STILL_OPEN:'No se pudo cerrar el checkout. Actualiza e inténtalo de nuevo.'};err.textContent=messages[e.message]||'No se pudo completar la acción. No se eliminó el registro. Inténtalo de nuevo.';err.hidden=false;button.disabled=false;}
    });
  }

  /* ---------- Códigos ---------- */
  async function renderCodes() {
    var codes = await api('codes'), active = codes.filter(function (c) { return c.active && !(c.ends_at && new Date(c.ends_at) < new Date()); }).length;
    var describe = function (c) {
      var off = c.kind === 'percent' ? c.percent_off + ' %' : money(c.amount_off_cop, 'COP') + ' · ' + money(c.amount_off_usd, 'USD');
      var tiers = c.tiers.length === 3 ? 'en toda la tienda' : 'en ' + c.tiers.map(function (t) { return TIER[t]; }).join(' y ');
      var when = c.ends_at ? (new Date(c.ends_at) < new Date() ? 'terminó el ' : 'hasta el ') + date(c.ends_at) : 'sin vencimiento';
      return off + ' ' + tiers + (c.once_per_customer ? ' · uno por cliente' : '') + ' · ' + when;
    };
    var list = codes.length ? codes.map(function (c) {
      var expired = c.ends_at && new Date(c.ends_at) < new Date(), off = !c.active || expired, pct = c.max_uses ? Math.min(100, Math.round(100 * c.uses / c.max_uses)) : 100;
      var saved = Object.keys(c.discounted || {}).map(function (k) { return money(c.discounted[k], k); }).join(' · ');
      return '<article class="ad-code' + (off ? ' off' : '') + '"><div class="name"><b' + (expired ? ' style="text-decoration:line-through"' : '') + '>' + esc(c.code) + '</b><span>' + esc(describe(c)) + '</span>' + (c.note ? '<span>' + esc(c.note) + '</span>' : '') + '</div>' +
        '<div class="use"><span>' + c.uses + (c.max_uses ? ' de ' + c.max_uses : '') + ' usos' + (c.pending ? ' · ' + c.pending + ' en pago' : '') + (saved ? ' · ' + esc(saved) + ' descontados' : '') + '</span><i><span style="width:' + pct + '%;' + (c.max_uses ? '' : 'background:#D0BBC7') + '"></span></i></div>' +
        (expired ? '<span class="pill cancelled">Vencido</span>' : '<label class="ad-switch"><input type="checkbox" data-toggle="' + esc(c.id) + '"' + (c.active ? ' checked' : '') + '>Activo</label>') + '</article>';
    }).join('') : '<p class="ad-empty">Todavía no hay códigos. Crea el primero con el formulario.</p>';
    var html = head('Códigos de descuento', active + (active === 1 ? ' activo' : ' activos') + ' · se aplican al pagar', '') +
      '<div class="ad-row"><section class="ad-codes" aria-label="Códigos">' + list + '</section>' +
      '<form class="ad-new" novalidate aria-labelledby="newT"><h2 id="newT">Nuevo código</h2>' +
        '<label class="ad-field">Código<input name="code" maxlength="32" required placeholder="NAVIDAD20" style="text-transform:uppercase;letter-spacing:.08em;font-weight:500"></label>' +
        '<fieldset><legend>Tipo de descuento</legend><div class="ad-seg" role="group"><button type="button" data-kind="percent" aria-pressed="' + (state.kind === 'percent') + '">Porcentaje</button><button type="button" data-kind="amount" aria-pressed="' + (state.kind === 'amount') + '">Monto fijo</button></div></fieldset>' +
        '<div data-when="percent"' + (state.kind === 'percent' ? '' : ' hidden') + '><label class="ad-field">Descuento (%)<input name="percent" type="number" min="1" max="100" value="15"></label></div>' +
        '<div class="ad-grid2" data-when="amount"' + (state.kind === 'amount' ? '' : ' hidden') + '><label class="ad-field">En pesos (COP)<input name="cop" type="number" min="1" step="1" placeholder="40000"></label><label class="ad-field">En dólares (USD)<input name="usd" type="number" min="0.5" step="0.5" placeholder="10"></label></div>' +
        '<fieldset><legend>Aplica a</legend><div class="ad-tiers">' + Object.keys(TIER).map(function (t) { return '<label><input type="checkbox" name="tier" value="' + t + '" checked>' + TIER[t] + '</label>'; }).join('') + '</div></fieldset>' +
        '<div class="ad-grid2"><label class="ad-field">Desde<input name="start" type="date"></label><label class="ad-field">Hasta<input name="end" type="date"></label></div>' +
        '<div class="ad-grid2"><label class="ad-field">Límite de usos<input name="max" type="number" min="1" placeholder="Sin límite"></label><label class="ad-switch"><input type="checkbox" name="once">Uno por cliente</label></div>' +
        '<label class="ad-field">Nota interna (opcional)<textarea name="note" maxlength="300" placeholder="Para qué es este código"></textarea></label>' +
        '<div class="ad-preview" aria-live="polite"></div><p class="ad-error" role="alert" hidden></p>' +
        '<button class="ad-btn" type="submit">Crear código</button></form></div>';
    root.innerHTML = shell(html); bindShell();
    root.querySelectorAll('[data-toggle]').forEach(function (cb) {
      cb.addEventListener('change', async function () {
        cb.disabled = true;
        try { await api('toggle-code', null, { id: cb.dataset.toggle, active: cb.checked }); toast(cb.checked ? 'Código activado' : 'Código desactivado'); render(); }
        catch (_) { cb.checked = !cb.checked; cb.disabled = false; toast('No se pudo cambiar el código'); }
      });
    });
    var f = root.querySelector('.ad-new'), err = f.querySelector('.ad-error'), prev = f.querySelector('.ad-preview');
    function payload() {
      var tiers = [].slice.call(f.querySelectorAll('[name=tier]:checked')).map(function (i) { return i.value; });
      var p = { code: f.code.value.trim().toUpperCase(), kind: state.kind, tiers: tiers, once_per_customer: f.once.checked, note: f.note.value.trim(), max_uses: f.max.value ? Number(f.max.value) : null,
        starts_at: f.start.value ? new Date(f.start.value + 'T00:00:00').toISOString() : null, ends_at: f.end.value ? new Date(f.end.value + 'T23:59:59').toISOString() : null };
      if (state.kind === 'percent') p.percent_off = Number(f.percent.value); else { p.amount_cop = Number(f.cop.value); p.amount_usd = Number(f.usd.value); }
      return p;
    }
    // COP en pesos enteros; el 100 % permite total cero. Otros descuentos conservan el mínimo de cobro.
    function off(base, cur, p) {
      var unit = cur === 'COP' ? 100 : 1, v = p.kind === 'percent' ? Math.floor(base * p.percent_off / 100 / unit) * unit : (cur === 'COP' ? (p.amount_cop || 0) * 100 : Math.round((p.amount_usd || 0) * 100));
      return Math.floor(v / unit) * unit;
    }
    function preview() {
      var p = payload(), ok = p.code && (p.kind === 'percent' ? p.percent_off >= 1 && p.percent_off <= 100 : p.amount_cop > 0 && p.amount_usd > 0) && p.tiers.length;
      var lines = p.tiers.map(function (t) {
        var pr = (state.prices || {})[t]; if (!pr) return '';
        return '<span>' + esc(TIER[t]) + ': ' + ['COP', 'USD'].map(function (cur) {
          var base = pr[cur] * 100, d = off(base, cur, p), min = cur === 'COP' ? 500000 : 100;
          return esc(money(base, cur)) + ' → <b>' + (base - d < min && !(p.kind === 'percent' && p.percent_off === 100) ? 'no aplica' : esc(money(base - d, cur))) + '</b>';
        }).join(' · ') + '</span>';
      }).join('');
      prev.innerHTML = '<span>Así lo verá la pareja al pagar</span>' + (ok ? '<b>' + esc(p.code) + ' · ' + esc(p.kind === 'percent' ? p.percent_off + ' %' : money(p.amount_cop * 100, 'COP') + ' / ' + money(Math.round(p.amount_usd * 100), 'USD')) + ' en ' + esc(p.tiers.length === 3 ? 'todos los diseños' : p.tiers.map(function (t) { return TIER[t]; }).join(' y ')) + '</b>' + lines : '<b>Completa el código y el descuento</b>');
    }
    f.addEventListener('input', preview); preview();
    f.querySelectorAll('[data-kind]').forEach(function (b) { b.addEventListener('click', function () { state.kind = b.dataset.kind; f.querySelectorAll('[data-kind]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); f.querySelectorAll('[data-when]').forEach(function (w) { w.hidden = w.dataset.when !== state.kind; }); preview(); }); });
    f.addEventListener('submit', async function (e) {
      e.preventDefault(); err.hidden = true;
      var p = payload(), btn = f.querySelector('[type=submit]');
      if (!/^[A-Z0-9]{3,32}$/.test(p.code)) { err.textContent = 'El código debe tener de 3 a 32 letras o números, sin espacios.'; err.hidden = false; f.code.focus(); return; }
      if (!p.tiers.length) { err.textContent = 'Elige al menos una gama.'; err.hidden = false; return; }
      btn.disabled = true;
      try { await api('create-code', null, p); toast('Código ' + p.code + ' creado'); render(); }
      catch (e2) { err.textContent = e2.message === 'CODE_EXISTS' ? 'Ya existe un código con ese nombre.' : e2.message === 'INVALID_REQUEST' ? 'Revisa los valores: el porcentaje va de 1 a 100 y las fechas deben tener sentido.' : 'No se pudo crear el código. Inténtalo de nuevo.'; err.hidden = false; btn.disabled = false; }
    });
  }

  /* ---------- Analíticas ---------- */
  async function renderAnalytics() {
    var a = await api('analytics', { days: state.days }), f = a.funnel || {}, g = a.guests || {};
    var step = function (n, of) { return of ? Math.round(100 * n / of) + ' %' : '—'; };
    var designs = (a.designs || []).filter(function (d) { return d.started || d.paid; });
    var html = head('Analíticas', 'Datos de Invitesse · últimos ' + state.days + ' días', periodSelect() +
      '<a class="ad-btn" href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener">Google Analytics ' + svg('ext', 14) + '</a><a class="ad-btn dark" href="https://clarity.microsoft.com/projects/view/yzwi7fw4jr/dashboard" target="_blank" rel="noopener">Mapas de calor en Clarity ' + svg('ext', 14) + '</a>') +
      '<section class="ad-card"><h2>De elegir un diseño a la invitación publicada</h2><div class="ad-funnel">' +
        '<div style="background:var(--plum);color:var(--paper)"><span>Eligieron un diseño</span><b>' + (f.started || 0) + '</b><span>Empezaron la compra</span></div>' +
        '<div style="background:var(--lacre);color:var(--paper)"><span>Fueron a pagar</span><b>' + (f.checkout || 0) + '</b><span>' + step(f.checkout, f.started) + ' de quienes eligieron</span></div>' +
        '<div style="background:var(--rose)"><span>Pagaron</span><b>' + (f.paid || 0) + '</b><span>' + step(f.paid, f.checkout) + ' de quienes fueron a pagar</span></div>' +
        '<div style="background:var(--blush)"><span>Publicaron</span><b>' + (f.published || 0) + '</b><span>' + step(f.published, f.paid) + ' de las compras</span></div></div>' +
        '<p class="ad-note">Las visitas, las demos y de dónde llega la gente (Instagram, Google, marca de agua) están en Google Analytics; la marca de agua llega con utm_medium=marca_agua.</p></section>' +
      '<div class="ad-row"><section class="ad-card wide"><h2>Diseños</h2>' + (designs.length ? '<div class="ad-table"><table><thead><tr><th>Diseño</th><th>Gama</th><th>Eligieron</th><th>Pagaron</th><th>Conversión</th></tr></thead><tbody>' + designs.map(function (d) {
          return '<tr><td><b>' + esc(designOf(d.design)) + '</b></td><td>' + tierTag(d.tier) + '</td><td class="num">' + d.started + '</td><td class="num">' + d.paid + '</td><td class="num">' + step(d.paid, d.started) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="ad-empty">Todavía no hay compras iniciadas en este periodo.</p>') + '</section>' +
        '<section class="ad-card"><h2>Monedas y códigos</h2><div class="ad-bars">' + ['COP', 'USD'].map(function (c) { var n = (a.currencies || {})[c] || 0, t = (f.paid || 0); return '<div class="ad-bar"><div><span>' + c + (c === 'COP' ? ' · Colombia' : ' · fuera de Colombia') + '</span><b>' + n + '</b></div><i><span style="width:' + (t ? Math.round(100 * n / t) : 0) + '%"></span></i></div>'; }).join('') + '</div>' +
          ((a.codes || []).length ? '<div class="ad-chips">' + a.codes.map(function (c) { return '<span class="pill paid">' + esc(c.code) + ' · ' + c.uses + '</span>'; }).join('') + '</div>' : '<p class="ad-empty">Sin códigos usados en este periodo.</p>') + '</section></div>' +
      '<section class="ad-dark"><h2>Lo que pasa con los invitados</h2><div class="stats">' +
        '<div><b>' + (g.households || 0) + '</b><small>Familias invitadas</small></div><div><b>' + (g.guests || 0) + '</b><small>Personas invitadas</small></div>' +
        '<div><b>' + (g.attending || 0) + '</b><small>Asistirán</small></div><div><b>' + (g.declined || 0) + '</b><small>No podrán</small></div><div><b>' + (g.messages || 0) + '</b><small>Mensajes a las parejas</small></div></div></section>';
    root.innerHTML = shell(html); bindShell();
  }

  start();
})();
