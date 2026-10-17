/* "Mi cuenta" (/cuenta/) y compra de un diseño (/comprar/?diseno=clasico), en español e inglés.
   Usa LazoAuth (editor/auth.js), que por ahora es una simulación en el navegador.
   El pago de la plantilla queda pendiente (TODO); hay un botón de compra de prueba para probar el flujo. */
(function () {
  'use strict';
  var root = document.getElementById('lazo-account');
  if (!root || !window.LazoAuth) return;
  var A = window.LazoAuth;
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var BASE = LANG === 'en' ? '/en' : '';
  var VIEW = root.getAttribute('data-view') || 'account';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var q = new URLSearchParams(location.search);

  var S = {
    es: {
      store: 'Volver a la tienda', logout: 'Cerrar sesión', account: 'Mi cuenta',
      title: 'Tu cuenta', lead: 'Ingresa para editar las invitaciones que compraste.',
      login: 'Ingresar', register: 'Crear cuenta', email: 'Correo electrónico', pass: 'Contraseña', pass2: 'Repite la contraseña',
      passHint: 'Mínimo 8 caracteres.', show: 'Mostrar', hide: 'Ocultar',
      demoNote: 'Versión de prueba: las cuentas se guardan solo en este navegador. No uses una contraseña que uses en otros sitios.',
      err: { email: 'Escribe un correo válido.', short: 'La contraseña debe tener al menos 8 caracteres.', exists: 'Ya existe una cuenta con ese correo. Ingresa con tu contraseña.',
        nouser: 'No encontramos una cuenta con ese correo.', wrong: 'La contraseña no es correcta.', match: 'Las contraseñas no coinciden.', storage: 'Este navegador no permite guardar la cuenta.' },
      mine: 'Mis invitaciones', signedAs: 'Sesión iniciada como', edit: 'Editar', guest: 'Ver como invitado', notStarted: 'Aún sin editar',
      weddingOf: 'Boda de', none: 'Todavía no tienes ningún diseño.', choose: 'Elegir un diseño', others: 'Otros diseños', demo: 'Ver demo', buy: 'Comprar',
      design: 'Diseño', bought: 'Comprado', buyTitle: 'Comprar tu invitación', pick: 'Elige el diseño de tu invitación', pickBtn: 'Elegir este diseño',
      step1: '1. Tu cuenta', step2: '2. Pago', changeAcc: 'Usar otra cuenta', needAcc: 'Primero crea tu cuenta o ingresa.',
      method: 'Método de pago', card: 'Tarjeta', paypal: 'PayPal', cardName: 'Nombre en la tarjeta', cardNamePh: 'Como aparece en la tarjeta', cardNum: 'Número de tarjeta', exp: 'Vencimiento', expPh: 'MM / AA', cvc: 'CVC',
      paypalText: 'Al pagar te llevaremos a PayPal para terminar y volverás aquí con tu diseño listo para editar.',
      pay: 'Pagar [Precio]', payPaypal: 'Continuar con PayPal', notConnected: 'Los pagos todavía no están conectados, así que no se hizo ningún cargo. [Pendiente: enlace de pago]',
      testBuy: 'Simular compra (prueba)', testHint: 'Solo para probar: activa el diseño en tu cuenta sin pagar.',
      order: 'Tu pedido', inv: 'Invitación', total: 'Total', includes: ['Efecto de apertura del diseño', 'Enlace único por invitado y confirmación por persona', 'Historia, itinerario, preguntas, música y viaje', 'Panel para organizar invitados'],
      already: 'Ya tienes este diseño', alreadyText: 'Puedes editarlo cuando quieras desde tu cuenta.', payNote: 'Pago único. Recibirás el recibo en tu correo.',
      names: { clasico: ['Clásico', 'Sobre y carta'], moderno: ['Moderno', 'Puertas que se abren'], rosa: ['Romántico', 'Sobre lacrado'], jardin: ['Jardín', 'Sobre de semillas'], costa: ['Costa', 'Pase de abordar'], gala: ['Gala', 'Medallón dorado'], aurelia: ['Aurelia', 'Carpeta con faja dorada'], noir: ['Noir', 'Puerta doble con faja de plata'], lino: ['Lino', 'Juego de tarjetas'], marfil: ['Marfil', 'Papel vegetal y lazo de seda'], fiesta: ['Fiesta', 'Carta de lotería'], celeste: ['Celeste', 'Luna y constelación'], cisne: ['Cisne', 'Sobre con sello de lacre'], tinta: ['Tinta', 'Círculo en el calendario'], glicina: ['Glicina', 'Cortina de glicinas'], estreno: ['Estreno', 'Funda de terciopelo'], nacar: ['Nácar', 'Estuche con hilo de perlas'], arco: ['Arco', 'Ventana empañada'], corazones: ['Corazones', 'Baraja en abanico'], encaje: ['Encaje', 'Estor de encaje'], onix: ['Ónix', 'Sobre negro con forro de foto'], senal: ['Señal', 'Tele que cambia de canal'] }
    },
    en: {
      store: 'Back to the store', logout: 'Log out', account: 'My account',
      title: 'Your account', lead: 'Log in to edit the invitations you bought.',
      login: 'Log in', register: 'Create account', email: 'Email', pass: 'Password', pass2: 'Repeat password',
      passHint: 'At least 8 characters.', show: 'Show', hide: 'Hide',
      demoNote: 'Test version: accounts are stored only in this browser. Don’t use a password you use on other sites.',
      err: { email: 'Enter a valid email.', short: 'The password must be at least 8 characters.', exists: 'There is already an account with that email. Log in with your password.',
        nouser: 'We couldn’t find an account with that email.', wrong: 'That password isn’t right.', match: 'The passwords don’t match.', storage: 'This browser doesn’t allow saving the account.' },
      mine: 'My invitations', signedAs: 'Signed in as', edit: 'Edit', guest: 'View as guest', notStarted: 'Not edited yet',
      weddingOf: 'Wedding of', none: 'You don’t have a design yet.', choose: 'Choose a design', others: 'Other designs', demo: 'View demo', buy: 'Buy',
      design: 'Design', bought: 'Purchased', buyTitle: 'Buy your invitation', pick: 'Choose your invitation design', pickBtn: 'Choose this design',
      step1: '1. Your account', step2: '2. Payment', changeAcc: 'Use another account', needAcc: 'First create your account or log in.',
      method: 'Payment method', card: 'Card', paypal: 'PayPal', cardName: 'Name on card', cardNamePh: 'As it appears on the card', cardNum: 'Card number', exp: 'Expiry', expPh: 'MM / YY', cvc: 'CVC',
      paypalText: 'When you pay we’ll take you to PayPal to finish, and you’ll come back here with your design ready to edit.',
      pay: 'Pay [Precio]', payPaypal: 'Continue with PayPal', notConnected: 'Payments aren’t connected yet, so nothing was charged. [Pending: payment link]',
      testBuy: 'Simulate purchase (test)', testHint: 'For testing only: activates the design on your account without paying.',
      order: 'Your order', inv: 'Invitation', total: 'Total', includes: ['The design’s opening effect', 'A unique link per guest and RSVP per person', 'Story, schedule, FAQ, music and travel', 'Dashboard to organize guests'],
      already: 'You already have this design', alreadyText: 'You can edit it anytime from your account.', payNote: 'One-time payment. You’ll get the receipt by email.',
      names: { clasico: ['Classic', 'Envelope and letter'], moderno: ['Modern', 'Opening doors'], rosa: ['Romantic', 'Wax-sealed envelope'], jardin: ['Garden', 'Seed packet'], costa: ['Coast', 'Boarding pass'], gala: ['Gala', 'Gold medallion'], aurelia: ['Aurelia', 'Folder with a gold band'], noir: ['Noir', 'Double door with a silver band'], lino: ['Lino', 'Card set'], marfil: ['Marfil', 'Vellum and silk bow'], fiesta: ['Fiesta', 'Lotería card'], celeste: ['Celeste', 'Moon and constellation'], cisne: ['Cisne', 'Envelope with a wax seal'], tinta: ['Tinta', 'A circle on the calendar'], glicina: ['Glicina', 'Wisteria curtain'], estreno: ['Estreno', 'Velvet sleeve'], nacar: ['Nácar', 'Box with a pearl strand'], arco: ['Arco', 'Misted window'], corazones: ['Corazones', 'Deck that fans out'], encaje: ['Encaje', 'Lace blind'], onix: ['Ónix', 'Black envelope lined with a photo'], senal: ['Señal', 'TV that flips channels'] }
    }
  }[LANG];
  var IMG = { clasico: '/assets/clasico-demo-portada.jpg', moderno: '/assets/moderno-demo-portada.jpg', rosa: '/assets/romantico-portada.jpg', jardin: '/assets/jardin-portada.jpg', costa: '/assets/costa-portada.jpg', gala: '/assets/gala-portada.jpg', aurelia: '/assets/aurelia-portada.jpg', noir: '/assets/noir-portada.jpg', lino: '/assets/lino-portada.jpg', marfil: '/assets/marfil-portada.jpg', fiesta: '/assets/fiesta-portada.jpg', celeste: '/assets/celeste-portada.jpg', cisne: '/assets/cisne-portada.jpg', tinta: '/assets/tinta-portada.jpg', glicina: '/assets/glicina-portada.jpg', estreno: '/assets/estreno-portada.jpg', nacar: '/assets/nacar-portada.jpg', arco: '/assets/arco-portada.jpg', corazones: '/assets/corazones-portada.jpg', encaje: '/assets/encaje-portada.jpg', onix: '/assets/onix-portada.jpg', senal: '/assets/senal-portada.jpg' };
  var demoUrl = function (d) { return BASE + '/demo/' + d + '/'; };
  var editUrl = function (d) { return BASE + '/editor/?diseno=' + d; };
  var guestUrl = function (d) { return BASE + '/demo/' + d + '/?lz=vista&k=' + encodeURIComponent(A.invKey(d)); };
  function invOf(d) { try { var v = localStorage.getItem(A.invKey(d)); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  var mode = q.get('modo') === 'crear' || q.get('mode') === 'signup' ? 'register' : 'login';
  var method = 'card', notice = false, error = '';

  function header() {
    var u = A.current();
    return '<header class="co-top"><a class="co-back" href="' + BASE + '/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>' + esc(S.store) + '</a>' +
      '<div class="ed-spacer"></div><a class="ed-logo" href="' + BASE + '/" aria-label="Lazo"><span class="ed-logo-mark">&amp;</span><span class="ed-logo-word">lazo</span></a><div class="ed-spacer"></div>' +
      (u ? '<span class="ac-user"><a href="' + BASE + '/cuenta/">' + esc(S.account) + '</a><button type="button" class="ed-btn ed-btn-sm" data-act="logout">' + esc(S.logout) + '</button></span>' : '<span class="ac-user"></span>') +
      '</header>';
  }
  function authForm() {
    var reg = mode === 'register';
    return '<div class="ed-seg" role="tablist" aria-label="' + esc(S.title) + '">' +
      '<button type="button" role="tab" aria-selected="' + !reg + '" data-act="mode" data-id="login">' + esc(S.login) + '</button>' +
      '<button type="button" role="tab" aria-selected="' + reg + '" data-act="mode" data-id="register">' + esc(S.register) + '</button></div>' +
      '<form class="ac-form" novalidate data-form="auth">' +
      '<label class="ed-field">' + esc(S.email) + '<input type="email" name="email" autocomplete="email" required></label>' +
      '<label class="ed-field">' + esc(S.pass) + '<span class="ac-pass"><input type="password" name="pass" autocomplete="' + (reg ? 'new-password' : 'current-password') + '" required minlength="8"><button type="button" class="ed-link" data-act="peek">' + esc(S.show) + '</button></span>' + (reg ? '<span class="ed-hint">' + esc(S.passHint) + '</span>' : '') + '</label>' +
      (reg ? '<label class="ed-field">' + esc(S.pass2) + '<input type="password" name="pass2" autocomplete="new-password" required></label>' : '') +
      '<p class="ac-error" role="alert"' + (error ? '' : ' hidden') + '>' + esc(error) + '</p>' +
      '<button type="submit" class="ed-btn ed-btn-dark ed-btn-lg">' + esc(reg ? S.register : S.login) + '</button>' +
      '<p class="ac-note">' + esc(S.demoNote) + '</p></form>';
  }
  function designCard(d, actions, sub) {
    var n = S.names[d];
    return '<article class="ac-card"><img src="' + IMG[d] + '" alt="" loading="lazy"><div class="ac-card-body"><span class="ed-kicker">' + esc(S.design) + ' · ' + esc(n[1]) + '</span>' +
      '<h3>' + esc(n[0]) + '</h3>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '<div class="ac-actions">' + actions + '</div></div></article>';
  }

  function renderAccount() {
    var u = A.current(), h;
    if (!u) {
      h = '<section class="ac-narrow"><div class="ed-head"><h1>' + esc(S.title) + '</h1><p>' + esc(S.lead) + '</p></div>' + authForm() + '</section>';
    } else {
      var own = A.owned(), rest = A.DESIGNS.filter(function (d) { return own.indexOf(d) < 0; });
      h = '<section class="ac-wide"><div class="ed-head"><span class="ed-kicker">' + esc(S.signedAs) + ' ' + esc(u.email) + '</span><h1>' + esc(S.mine) + '</h1></div>' +
        (own.length ? '<div class="ac-grid">' + own.map(function (d) {
          var c = invOf(d), sub = c && (c.n1 || c.n2) ? S.weddingOf + ' ' + (c.n1 || '—') + ' & ' + (c.n2 || '—') : S.notStarted;
          return designCard(d, '<a class="ed-btn ed-btn-dark" href="' + editUrl(d) + '">' + esc(S.edit) + '</a>' + (c ? '<a class="ed-btn" href="' + guestUrl(d) + '" target="_blank" rel="noopener">' + esc(S.guest) + '</a>' : ''), sub);
        }).join('') + '</div>'
          : '<div class="ed-empty ac-empty"><p>' + esc(S.none) + '</p><a class="ed-btn ed-btn-dark" href="' + BASE + '/comprar/">' + esc(S.choose) + '</a></div>') +
        (rest.length ? '<h2 class="ac-h2">' + esc(S.others) + '</h2><div class="ac-grid">' + rest.map(function (d) {
          return designCard(d, '<a class="ed-btn ed-btn-dark" href="' + BASE + '/comprar/?diseno=' + d + '">' + esc(S.buy) + ' · [Precio]</a><a class="ed-btn" href="' + demoUrl(d) + '">' + esc(S.demo) + '</a>');
        }).join('') + '</div>' : '') + '</section>';
    }
    root.innerHTML = '<div class="ed">' + header() + '<div class="co-wrap ac-wrap">' + h + '</div></div>';
  }

  function renderBuy() {
    var d = q.get('diseno') || q.get('design'), u = A.current();
    if (A.DESIGNS.indexOf(d) < 0) {
      root.innerHTML = '<div class="ed">' + header() + '<div class="co-wrap ac-wrap"><section class="ac-wide"><div class="ed-head"><h1>' + esc(S.pick) + '</h1></div><div class="ac-grid">' +
        A.DESIGNS.map(function (x) { return designCard(x, '<a class="ed-btn ed-btn-dark" href="?diseno=' + x + '">' + esc(S.pickBtn) + '</a><a class="ed-btn" href="' + demoUrl(x) + '">' + esc(S.demo) + '</a>'); }).join('') +
        '</div></section></div></div>';
      return;
    }
    var n = S.names[d], owns = A.owns(d), f = function (label, ph, cls, extra) { return '<label class="ed-field' + (cls ? ' ' + cls : '') + '">' + esc(label) + '<input placeholder="' + esc(ph) + '" autocomplete="off"' + (u ? '' : ' disabled') + (extra || '') + '></label>'; };
    var step2 = owns
      ? '<div class="ac-done"><b>' + esc(S.already) + '</b><span>' + esc(S.alreadyText) + '</span><a class="ed-btn ed-btn-dark" href="' + editUrl(d) + '">' + esc(S.edit) + '</a></div>'
      : (!u ? '<p class="ed-hint">' + esc(S.needAcc) + '</p>' : '') +
        '<div class="co-methods" role="group" aria-label="' + esc(S.method) + '">' +
          '<button type="button" data-act="method" data-id="card" aria-pressed="' + (method === 'card') + '"' + (u ? '' : ' disabled') + '>' + esc(S.card) + '</button>' +
          '<button type="button" data-act="method" data-id="paypal" aria-pressed="' + (method === 'paypal') + '"' + (u ? '' : ' disabled') + '>' + esc(S.paypal) + '</button></div>' +
        (method === 'card'
          // TODO: sustituir por los campos del proveedor de pago al conectar el cobro. Estos no se leen ni se guardan.
          ? '<div class="ed-grid2 co-grid">' + f(S.cardName, S.cardNamePh, 'full') + f(S.cardNum, '0000 0000 0000 0000', 'full', ' inputmode="numeric"') + f(S.exp, S.expPh, '', ' inputmode="numeric"') + f(S.cvc, '123', '', ' inputmode="numeric"') + '</div>'
          : '<p class="co-paypal">' + esc(S.paypalText) + '</p>');
    root.innerHTML = '<div class="ed">' + header() + '<div class="co-wrap">' +
      '<section class="co-main"><div class="ed-head" style="gap:8px"><span class="ed-kicker">' + esc(S.design) + ' ' + esc(n[0]) + '</span><h1>' + esc(S.buyTitle) + '</h1></div>' +
        '<div class="ac-step"><h2>' + esc(S.step1) + '</h2>' + (u
          ? '<p class="ac-signed">' + esc(S.signedAs) + ' <b>' + esc(u.email) + '</b> · <button type="button" class="ed-link" data-act="logout">' + esc(S.changeAcc) + '</button></p>'
          : authForm()) + '</div>' +
        '<div class="ac-step' + (u ? '' : ' is-off') + '"><h2>' + esc(S.step2) + '</h2>' + step2 + '</div>' +
      '</section>' +
      '<aside class="co-sum" aria-label="' + esc(S.order) + '"><h2>' + esc(S.order) + '</h2>' +
        '<img class="ac-sum-img" src="' + IMG[d] + '" alt="">' +
        '<div class="co-line"><div><b>' + esc(S.inv) + ' · ' + esc(n[0]) + '</b><span>' + esc(n[1]) + '</span></div><span class="pr">[Precio]</span></div>' +
        '<ul class="ac-includes">' + S.includes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="co-total"><span>' + esc(S.total) + '</span><b>[Precio]</b></div>' +
        (owns ? '' :
          '<button type="button" class="ed-btn ed-btn-dark co-pay" data-act="pay"' + (u ? '' : ' disabled') + '>' + esc(method === 'card' ? S.pay : S.payPaypal) + '</button>' +
          '<div aria-live="polite">' + (notice ? '<p class="co-notice">' + esc(S.notConnected) + '</p>' : '') + '</div>' +
          '<button type="button" class="ed-btn ed-btn-dash" data-act="testbuy"' + (u ? '' : ' disabled') + '>' + esc(S.testBuy) + '</button>' +
          '<span class="co-note">' + esc(S.testHint) + '</span>') +
        '<span class="co-note">' + esc(S.payNote) + '</span></aside></div></div>';
  }
  var render = function () { if (VIEW === 'buy') renderBuy(); else renderAccount(); };

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'mode') { mode = b.getAttribute('data-id'); error = ''; render(); var t = root.querySelector('[data-act="mode"][aria-selected="true"]'); if (t) t.focus(); }
    else if (act === 'peek') { var i = b.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.textContent = show ? S.hide : S.show; }
    else if (act === 'logout') { A.logout(); error = ''; render(); }
    else if (act === 'method') { method = b.getAttribute('data-id'); notice = false; render(); }
    else if (act === 'pay') {
      // TODO: conectar el pago real de la plantilla (tarjeta o PayPal). Al confirmarse, el servidor activa el diseño en la cuenta.
      notice = true; render(); root.querySelector('.co-pay').focus();
    }
    else if (act === 'testbuy') { var d = q.get('diseno') || q.get('design'); if (A.buy(d)) location.href = editUrl(d); }
  });
  root.addEventListener('submit', function (e) {
    var form = e.target; if (form.getAttribute('data-form') !== 'auth') return;
    e.preventDefault();
    var email = form.email.value, pass = form.pass.value, btn = form.querySelector('[type="submit"]');
    var fail = function (code) { error = S.err[code] || code; var p = form.querySelector('.ac-error'); p.textContent = error; p.hidden = false; btn.disabled = false; (code === 'email' || code === 'nouser' || code === 'exists' ? form.email : form.pass).focus(); };
    if (mode === 'register' && pass !== form.pass2.value) return fail('match');
    btn.disabled = true;
    (mode === 'register' ? A.register(email, pass) : A.login(email, pass)).then(function (r) {
      if (r.error) return fail(r.error);
      error = '';
      var next = A.safeNext(q.get('next'));
      if (next) { location.href = next; return; }
      render();
      var h = root.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus(); }
    });
  });
  render();
})();
