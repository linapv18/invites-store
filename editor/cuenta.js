/* "Mi cuenta" (/cuenta/) y compra de un diseño (/comprar/?diseno=clasico), en español e inglés.
   Usa LazoAuth (editor/auth.js), conectado a Supabase para cuentas y borradores.
   Los pagos y la publicación siguen pendientes; preparar un borrador no concede derechos de compra. */
(async function () {
  'use strict';
  var root = document.getElementById('lazo-account');
  if (!root || !window.LazoAuth) return;
  var A = window.LazoAuth;
  // Se consulta ya, en paralelo con la sesión, para que el botón de Google no aparezca tarde.
  var googleCheck = window.InvitesseBackend ? A.googleAvailable() : Promise.resolve(false);
  var oauthError = new URLSearchParams(location.search).has('error') || new URLSearchParams(location.hash.slice(1)).has('error');
  // La pantalla de carga (.ed-boot) ya viene en el HTML; se reemplaza al pintar la vista.
  try { await A.ready; } catch (_) {
    var boot = root.querySelector('.ed-boot'), en = document.documentElement.lang === 'en';
    root.innerHTML = '<div class="ed-boot is-error">' + (boot && boot.querySelector('.iv-wm') ? boot.querySelector('.iv-wm').outerHTML : '') +
      '<p class="ed-boot-msg" role="alert">' + (en ? 'Unable to connect. Your drafts have not been changed.' : 'No se pudo conectar. Sus borradores no se han modificado.') + '</p>' +
      '<button type="button" class="ed-btn ed-btn-dark" onclick="location.reload()">' + (en ? 'Retry' : 'Reintentar') + '</button></div>'; return;
  }

  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var BASE = LANG === 'en' ? '/en' : '';
  var ACCOUNT = LANG === 'en' ? '/en/account/' : '/cuenta/';
  var VIEW = root.getAttribute('data-view') || 'account';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var q = new URLSearchParams(location.search);

  var S = {
    es: {
      store: 'Volver a la tienda', logout: 'Cerrar sesión', account: 'Mi cuenta',
      title: 'Su cuenta', lead: 'Ingresen para editar las invitaciones que compraron.',
      login: 'Ingresar', register: 'Crear cuenta', email: 'Correo electrónico', pass: 'Contraseña', pass2: 'Repitan la contraseña',
      passHint: 'Mínimo 8 caracteres.', show: 'Mostrar', hide: 'Ocultar',
      demoNote: 'Versión de prueba: las cuentas se guardan solo en este navegador. No usen una contraseña que usen en otros sitios.',
      err: { email: 'Escriban un correo válido.', short: 'La contraseña debe tener al menos 8 caracteres.', exists: 'Ya existe una cuenta con ese correo. Ingresen con su contraseña.',
        nouser: 'No encontramos una cuenta con ese correo.', wrong: 'La contraseña no es correcta.', match: 'Las contraseñas no coinciden.', storage: 'Este navegador no permite guardar la cuenta.' },
      guestsK: 'Panel de invitados', guestsT: 'Sus invitados', guestsLead: 'Su lista de invitaciones y las personas que incluye cada una.',
      guestsOpen: 'Abrir panel', guestsNone: 'Aún sin invitados',
      guestsSum: function (n, p) { return n + (n === 1 ? ' invitación' : ' invitaciones') + ' · ' + p + (p === 1 ? ' persona' : ' personas'); },
      mine: 'Mis invitaciones', signedAs: 'Sesión iniciada como', edit: 'Editar', guest: 'Ver como invitado', notStarted: 'Aún sin editar',
      weddingOf: 'Boda de', none: 'Todavía no tienen ningún diseño.', choose: 'Elegir un diseño', others: 'Otros diseños', demo: 'Ver demo', buy: 'Comprar',
      design: 'Diseño', bought: 'Comprado', buyTitle: 'Comprar su invitación', pick: 'Elijan el diseño de su invitación', pickBtn: 'Elegir este diseño',
      step1: '1. Su cuenta', step2: '2. Pago', changeAcc: 'Usar otra cuenta', needAcc: 'Primero creen su cuenta o ingresen.',
      method: 'Método de pago', card: 'Tarjeta', paypal: 'PayPal', cardName: 'Nombre en la tarjeta', cardNamePh: 'Como aparece en la tarjeta', cardNum: 'Número de tarjeta', exp: 'Vencimiento', expPh: 'MM / AA', cvc: 'CVC',
      paypalText: 'Al pagar los llevaremos a PayPal para terminar y volverán aquí con su diseño listo para editar.',
      pay: 'Pagar [Precio]', payPaypal: 'Continuar con PayPal', notConnected: 'Los pagos todavía no están conectados, así que no se hizo ningún cargo. [Pendiente: enlace de pago]',
      testBuy: 'Simular compra (prueba)', testHint: 'Solo para probar: activa el diseño en su cuenta sin pagar.',
      order: 'Su pedido', inv: 'Invitación', total: 'Total', includes: ['Efecto de apertura del diseño', 'Enlace único por invitado y confirmación por persona', 'Historia, itinerario, preguntas, música y viaje', 'Panel para organizar invitados'],
      already: 'Ya tienen este diseño', alreadyText: 'Pueden editarlo cuando quieran desde su cuenta.', payNote: 'Pago único. Recibirán el recibo en su correo.',
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
      guestsK: 'Guest panel', guestsT: 'Your guests', guestsLead: 'Your invitation list and the people each one includes.',
      guestsOpen: 'Open panel', guestsNone: 'No guests yet',
      guestsSum: function (n, p) { return n + (n === 1 ? ' invitation' : ' invitations') + ' · ' + p + (p === 1 ? ' guest' : ' guests'); },
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
  S.demoNote = LANG === 'en' ? 'Choose your design and pay once to unlock editing. Publishing has no additional charge.' : 'Elijan su diseño y paguen una sola vez para desbloquear la edición. Publicar no tiene otro cobro.';
  S.lead = LANG === 'en' ? 'Log in to continue preparing your invitation.' : 'Ingresen para seguir preparando su invitación.';
  S.mine = LANG === 'en' ? 'My invitations' : 'Mis invitaciones';
  S.none = LANG === 'en' ? 'You do not have a draft yet.' : 'Todavía no tienen un borrador.';
  S.buy = LANG === 'en' ? 'Buy invitation' : 'Comprar invitación';
  Object.assign(S.err, {
    credentials: LANG === 'en' ? 'Check your email and password.' : 'Revisen el correo y la contraseña.',
    unconfirmed: LANG === 'en' ? 'Confirm your email before logging in.' : 'Confirmen su correo antes de ingresar.',
    rate: LANG === 'en' ? 'Too many attempts. Please try again later.' : 'Demasiados intentos. Vuelvan a intentarlo más tarde.',
    network: LANG === 'en' ? 'Unable to complete the request. Check your connection and try again.' : 'No se pudo completar la solicitud. Revisen su conexión y vuelvan a intentarlo.'
  });
  var IMG = { clasico: '/assets/clasico-demo-portada.jpg', moderno: '/assets/moderno-demo-portada.jpg', rosa: '/assets/romantico-portada.jpg', jardin: '/assets/jardin-portada.jpg', costa: '/assets/costa-portada.jpg', gala: '/assets/gala-portada.jpg', aurelia: '/assets/aurelia-portada.jpg', noir: '/assets/noir-portada.jpg', lino: '/assets/lino-portada.jpg', marfil: '/assets/marfil-portada.jpg', fiesta: '/assets/fiesta-portada.jpg', celeste: '/assets/celeste-portada.jpg', cisne: '/assets/cisne-portada.jpg', tinta: '/assets/tinta-portada.jpg', glicina: '/assets/glicina-portada.jpg', estreno: '/assets/estreno-portada.jpg', nacar: '/assets/nacar-portada.jpg', arco: '/assets/arco-portada.jpg', corazones: '/assets/corazones-portada.jpg', encaje: '/assets/encaje-portada.jpg', onix: '/assets/onix-portada.jpg', senal: '/assets/senal-portada.jpg' };
  var demoUrl = function (d) { return BASE + '/demo/' + d + '/'; };
  var editUrl = function (d) { return BASE + '/editor/?diseno=' + d; };
  // Acceso al panel de invitados (sección «Invitados» del editor). Solo se pinta en la vista con sesión iniciada;
  // el editor vuelve a exigir la sesión antes de mostrar la lista.
  function guestPanel(own) {
    var icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.3.1 4 1.6 4.5 4.3"/></svg>';
    return '<section class="ac-guests" aria-labelledby="acGuestsH"><div class="ac-guests-head"><span class="ed-kicker">' + esc(S.guestsK) + '</span>' +
      '<h2 id="acGuestsH">' + esc(S.guestsT) + '</h2><p>' + esc(S.guestsLead) + '</p></div><ul class="ac-guests-list">' +
      own.map(function (d) {
        var list = ((invOf(d) || {}).invitations || []).filter(function (x) { return x && typeof x === 'object'; });
        var people = list.reduce(function (n, x) { return n + (Array.isArray(x.people) ? x.people.length : 0); }, 0);
        return '<li><span class="ac-guests-d"><b>' + esc(S.names[d][0]) + '</b><span>' + esc(list.length ? S.guestsSum(list.length, people) : S.guestsNone) + '</span></span>' +
          '<a class="ed-btn ed-btn-dark" href="' + editUrl(d) + '#invitados">' + icon + esc(S.guestsOpen) + '</a></li>';
      }).join('') + '</ul></section>';
  }
  var guestUrl = function (d) { return ((invOf(d) || {}).invitationLanguage === 'en' ? '/en' : '') + '/demo/' + d + '/?lz=vista&k=' + encodeURIComponent(A.invKey(d)); };
  function invOf(d) { try { var v = localStorage.getItem(A.invKey(d)); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  var mode = q.get('modo') === 'crear' || q.get('mode') === 'signup' ? 'register' : 'login';
  var method = 'card', notice = false, error = '', message = '';
  if (A.recovery()) mode = 'update';
  var googleEnabled = false;
  try {
    var oauthReturn = JSON.parse(sessionStorage.getItem('invitesse.oauth.return') || 'null');
    sessionStorage.removeItem('invitesse.oauth.return');
    if (oauthReturn && !oauthError && A.current() && Date.now()-oauthReturn.at>=0 && Date.now()-oauthReturn.at<600000) {
      var returnPath = A.safeNext(oauthReturn.path);
      if (returnPath && returnPath !== location.pathname + location.search) { location.replace(returnPath); return; }
    }
  } catch (_) {}
  if (oauthError) error = LANG === 'en' ? 'Google sign-in was not completed. Please try again or use your email.' : 'No se completó el acceso con Google. Reintenten o ingresen con su correo.';


  function header() {
    var u = A.current();
    return '<header class="co-top"><a class="co-back" href="' + BASE + '/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>' + esc(S.store) + '</a>' +
      '<div class="ed-spacer"></div><a class="ed-logo ed-logo-full" href="' + BASE + '/" aria-label="Invitesse"><span class="iv-wm" aria-hidden="true"><span>invite</span><b>ss</b><span>e</span><svg viewBox="0 0 70 54"><path d="M2 48C10 34 22 26 31 30C39 34 35 45 27 43C19 41 21 26 36 17C46 11 58 10 66 15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span></a><div class="ed-spacer"></div>' +
      (u ? '<span class="ac-user"><a href="' + ACCOUNT + '">' + esc(S.account) + '</a><button type="button" class="ed-btn ed-btn-sm" data-act="logout">' + esc(S.logout) + '</button></span>' : '<span class="ac-user"></span>') +
      '</header>';
  }
  function authForm() {
    var reg = mode === 'register', reset = mode === 'reset', update = mode === 'update';
    var label = update ? (LANG === 'en' ? 'Save new password' : 'Guardar nueva contraseña') : reset ? (LANG === 'en' ? 'Send recovery link' : 'Enviar enlace de recuperación') : reg ? S.register : S.login;
    return '<div class="ed-seg" role="group" aria-label="'+esc(S.title)+'">'+
      '<button type="button" aria-pressed="'+(mode==='login')+'" data-act="mode" data-id="login">'+esc(S.login)+'</button>'+
      '<button type="button" aria-pressed="'+reg+'" data-act="mode" data-id="register">'+esc(S.register)+'</button></div>'+
      (!reset&&!update ? '<div data-google-slot></div>' : '')+
      '<form class="ac-form" novalidate data-form="auth">'+
      (update ? '' : '<label class="ed-field">'+esc(S.email)+'<input type="email" name="email" autocomplete="email" required></label>')+
      (reset ? '' : '<label class="ed-field">'+esc(update ? (LANG==='en'?'New password':'Nueva contraseña') : S.pass)+'<span class="ac-pass"><input type="password" name="pass" autocomplete="'+(reg||update?'new-password':'current-password')+'" required minlength="8"><button type="button" class="ed-link" data-act="peek" style="min-height:44px;min-width:44px">'+esc(S.show)+'</button></span><span class="ed-hint">'+esc(S.passHint)+'</span></label>')+
      (reg||update ? '<label class="ed-field">'+esc(S.pass2)+'<input type="password" name="pass2" autocomplete="new-password" required></label>' : '')+
      '<p class="ac-error" role="alert"'+(error?'':' hidden')+'>'+esc(error)+'</p>'+
      (message?'<p role="status">'+esc(message)+'</p>':'')+
      '<button type="submit" class="ed-btn ed-btn-dark ed-btn-lg">'+esc(label)+'</button>'+
      (mode==='login'?'<button type="button" class="ed-link" data-act="mode" data-id="reset">'+(LANG==='en'?'Forgot your password?':'¿Olvidaron su contraseña?')+'</button>':'')+
      '<p class="ac-note">'+esc(S.demoNote)+'</p><p class="ac-note"><a href="'+(LANG==='en'?'/en/privacy/':'/privacidad/')+'">'+(LANG==='en'?'Privacy policy':'Política de privacidad')+'</a> · <a href="'+(LANG==='en'?'/en/terms/':'/condiciones/')+'">'+(LANG==='en'?'Terms of service':'Condiciones del servicio')+'</a></p></form>';
  }
  function designCard(d, actions, sub) {
    var n = S.names[d];
    return '<article class="ac-card" data-id="' + esc(d) + '"><img src="' + IMG[d] + '" alt="" loading="lazy"><div class="ac-card-body"><span class="ed-kicker">' + esc(S.design) + ' · ' + esc(n[1]) + '</span>' +
      '<h3>' + esc(n[0]) + '</h3>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '<div class="ac-actions">' + actions + '</div></div></article>';
  }

  function renderAccount() {
    var u = A.current(), h;
    if (!u || mode === 'update') {
      h = '<section class="ac-narrow"><div class="ed-head"><h1>' + esc(S.title) + '</h1><p>' + esc(S.lead) + '</p></div>' + authForm() + '</section>';
    } else {
      var own=A.purchased(),en=LANG==='en',shop=BASE+'/disenos/';
      var browse=en?'Explore designs':'Explorar diseños';
      h='<section class="ac-wide ac-library"><div class="ac-library-head"><div class="ed-head"><span class="ed-kicker">'+esc(S.signedAs)+' '+esc(u.email)+'</span><h1>'+esc(S.mine)+'</h1><p>'+(en?'Your purchased invitations, together in one place.':'Sus invitaciones compradas, reunidas en un solo lugar.')+'</p></div>'+
        (own.length?'<a class="ed-btn ed-btn-dark ac-browse" href="'+shop+'">'+(en?'Buy another design':'Comprar otro diseño')+' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></a>':'')+'</div>'+
        (own.length?'<p class="ac-library-count">'+own.length+' '+(en?(own.length===1?'purchased invitation':'purchased invitations'):(own.length===1?'invitación comprada':'invitaciones compradas'))+'</p><div class="ac-grid">'+own.map(function(d){
          var c=invOf(d),active=A.canEdit(d),sub=c && (c.n1 || c.n2)?S.weddingOf+' '+(c.n1 || '—')+' & '+(c.n2 || '—'):S.notStarted;
          var actions=active?'<a class="ed-btn ed-btn-dark" href="'+editUrl(d)+'">'+esc(S.edit)+'</a>':'<span class="ac-expired">'+(en?'Publication period ended':'Vigencia finalizada')+'</span><a class="ed-btn" href="mailto:hola@invitesse.com">'+(en?'Contact support':'Contactar soporte')+'</a>';
          if(active && c)actions+='<a class="ed-btn" href="'+guestUrl(d)+'" target="_blank" rel="noopener">'+esc(S.guest)+'</a>';
          return designCard(d,actions,sub);
        }).join('')+'</div>':'<div class="ac-library-empty"><span class="ac-empty-mark" aria-hidden="true">♡</span><h2>'+(en?'Your invitation starts here.':'Su invitación empieza aquí.')+'</h2><p>'+(en?'You have not purchased an invitation yet. Explore the collection and find the design for your celebration.':'Aún no han comprado una invitación. Exploren la colección y encuentren el diseño para su celebración.')+'</p><a class="ed-btn ed-btn-dark" href="'+shop+'">'+browse+' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></a></div>')+'</section>';
    }
    root.innerHTML = '<div class="ed">' + header() + '<div class="co-wrap ac-wrap">' + h + '</div></div>';
  }

  function renderBuy() {
    var d=q.get('diseno')||q.get('design'), u=A.current();
    if (A.DESIGNS.indexOf(d)<0) {
      root.innerHTML='<div class="ed">'+header()+'<div class="co-wrap ac-wrap"><section class="ac-wide"><h1>'+esc(S.choose)+'</h1><div class="ac-grid">'+A.DESIGNS.map(function(id){return designCard(id,'<a class="ed-btn ed-btn-dark" href="?diseno='+id+'">'+esc(S.buy)+'</a>');}).join('')+'</div></section></div></div>';return;
    }
    if(u){window.InvitesseCheckout.mount(root,d);return;}
    root.innerHTML='<div class="ed">'+header()+'<div class="co-wrap ac-wrap"><section class="ac-narrow"><div class="ed-head"><h1>'+esc(S.names[d][0])+'</h1><p>'+(LANG==='en'?'Sign in to purchase your invitation and unlock the editor.':'Ingresen a su cuenta para comprar la invitación y desbloquear el editor.')+'</p></div>'+
      (!u?authForm():'<p role="alert"'+(error?'':' hidden')+'>'+esc(error)+'</p><a class="ed-btn" href="'+demoUrl(d)+'">'+esc(S.demo)+'</a> '+(A.owns(d)?'<a class="ed-btn ed-btn-dark" href="'+editUrl(d)+'">'+esc(S.edit)+'</a>':'<button class="ed-btn ed-btn-dark" type="button" data-act="testbuy">'+esc(S.buy)+'</button>'))+'</section></div></div>';
  }
  function renderGoogle() {
    root.querySelectorAll('[data-google-slot]').forEach(function(slot) {
      slot.innerHTML = googleEnabled ? '<button type="button" class="ac-google" data-act="google"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg><span>'+(LANG==='en'?'Continue with Google':'Continuar con Google')+'</span></button><div class="ac-auth-divider">'+(LANG==='en'?'or use your email':'o con su correo')+'</div>' : '';
    });
  }
  function render() { if (VIEW === 'buy') renderBuy(); else renderAccount(); renderGoogle(); }
  root.addEventListener('click', async function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'google') {
      b.disabled = true;
      var result = await A.google(VIEW === 'buy' ? location.pathname + location.search : A.safeNext(q.get('next')) || ACCOUNT);
      if (result.error) { error = S.err[result.error] || S.err.network; render(); }
    }
    else if (act === 'mode') { mode = b.getAttribute('data-id'); error = ''; message = ''; render(); var t = root.querySelector('[data-act="mode"][aria-pressed="true"]'); if (t) t.focus(); }
    else if (act === 'peek') { var i = b.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.textContent = show ? S.hide : S.show; }
    else if (act === 'logout') { try { await A.logout(); error=''; render(); } catch (_) { error=S.err.network; render(); } }
    else if (act === 'method') { method = b.getAttribute('data-id'); notice = false; render(); }
    else if (act === 'pay') {
      // TODO: conectar el pago real de la plantilla (tarjeta o PayPal). Al confirmarse, el servidor activa el diseño en la cuenta.
      notice = true; render(); root.querySelector('.co-pay').focus();
    }
    else if (act === 'testbuy') { var d = q.get('diseno') || q.get('design'); b.disabled=true; try { if (await A.buy(d)) location.href=editUrl(d); } catch (_) { error=S.err.network; render(); } }
  });
  root.addEventListener('submit', async function(e) {
    var form=e.target;if(form.getAttribute('data-form')!=='auth')return;e.preventDefault();
    var btn=form.querySelector('[type="submit"]'), email=form.email?form.email.value:'', pass=form.pass?form.pass.value:'';
    function fail(code){error=S.err[code]||S.err.network;var el=form.querySelector('.ac-error');el.textContent=error;el.hidden=false;btn.disabled=false;var field=code==='email'?form.email:form.pass||form.email;if(field)field.focus();}
    if(mode!=='update'&&!A.validEmail(email))return fail('email');
    if(mode!=='reset'&&pass.length<8)return fail('short');
    if((mode==='register'||mode==='update')&&pass!==form.pass2.value)return fail('match');
    btn.disabled=true;
    try {
      var r=mode==='reset'?await A.resetPassword(email):mode==='update'?await A.updatePassword(pass):mode==='register'?await A.register(email,pass):await A.login(email,pass);
      if(r.error)return fail(r.error);
      error='';
      if(mode==='reset'||r.verify){message=r.verify?(LANG==='en'?'Check your email to confirm your account before logging in.':'Revisen su correo y confirmen la cuenta antes de ingresar.'):(LANG==='en'?'If the address belongs to an account, you will receive a recovery link.':'Si el correo corresponde a una cuenta, recibirán un enlace de recuperación.');render();return;}
      if(mode==='update'){mode='login';message=LANG==='en'?'Password updated.':'Contraseña actualizada.';}
      var next=A.safeNext(q.get('next'));if(next){location.href=next;return;}
      render();var heading=root.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus();}
    } catch(_){fail('network');}
  });
  window.addEventListener('invitesse:signed-out',function(){mode='login';message='';render();});
  render();
  googleCheck.then(function(enabled) { googleEnabled = enabled; renderGoogle(); });
})();
