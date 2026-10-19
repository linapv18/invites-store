/* Optional analytics: basic consent mode, no Google requests before opt-in. */
(function () {
  'use strict';
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var commercial = ['/', '/en', '/disenos', '/en/disenos'].indexOf(path) !== -1;
  var legal = ['/privacidad', '/condiciones', '/en/privacy', '/en/terms'].indexOf(path) !== -1;
  // A copied script must never enable analytics on an invitation, account or editor.
  if ((!commercial && !legal) || window.top !== window.self) return;
  var id = 'G-2YPN2SZT3R', key = 'invitesse.privacy.v1', lifetime = 180 * 86400000;
  var en = document.documentElement.lang.indexOf('en') === 0, loaded = false, opener;
  var gpc = navigator.globalPrivacyControl === true;
  var text = en ? {
    title: 'Your privacy', body: 'We use necessary storage to provide the site. With your permission, Google Analytics measures visits and selected clicks; Microsoft Clarity creates heatmaps and session replays of the public website. Accounts, the editor and private invitations are excluded.',
    accept: 'Accept analytics', reject: 'Reject optional', settings: 'Privacy preferences', save: 'Save preferences', close: 'Close',
    necessary: 'Necessary storage', necessaryNote: 'Required for access and features you request. Always active.', analytics: 'Google Analytics and Microsoft Clarity', analyticsNote: 'Optional visits, selected clicks, heatmaps and session replays. Disabled until you agree.', policy: 'Privacy policy', gpc: 'Your browser requests not to be tracked. Analytics stays disabled.', failure: 'Your preference could not be saved on this device. Analytics stays disabled.'
  } : {
    title: 'Su privacidad', body: 'Usamos almacenamiento necesario para prestar el servicio. Con su permiso, Google Analytics mide visitas y clics seleccionados; Microsoft Clarity genera mapas de calor y reproducciones de sesiones de la web comercial. Se excluyen cuentas, editor e invitaciones privadas.',
    accept: 'Aceptar analítica', reject: 'Rechazar opcionales', settings: 'Preferencias de privacidad', save: 'Guardar preferencias', close: 'Cerrar',
    necessary: 'Almacenamiento necesario', necessaryNote: 'Necesario para el acceso y las funciones que soliciten. Siempre activo.', analytics: 'Google Analytics y Microsoft Clarity', analyticsNote: 'Visitas, clics seleccionados, mapas de calor y reproducciones de sesiones. Desactivados hasta que acepten.', policy: 'Política de privacidad', gpc: 'Su navegador solicita no ser rastreado. La analítica permanece desactivada.', failure: 'No pudimos guardar la preferencia en este dispositivo. La analítica permanece desactivada.'
  };
  var policy = en ? '/en/privacy/' : '/privacidad/';
  function read() {
    try {
      var p = JSON.parse(localStorage.getItem(key));
      return p && p.version === 1 && typeof p.analytics === 'boolean' && Number.isFinite(p.at) && p.at <= Date.now() && Date.now() - p.at < lifetime ? p : null;
    } catch (_) { return null; }
  }
  function allowed() { var p = read(); return !gpc && !!(p && p.analytics); }
  function clearCookies() {
    var domains = ['', location.hostname, '.' + location.hostname, 'invitesse.com', '.invitesse.com'];
    ['_ga', '_ga_' + id.slice(2).replace(/-/g, ''), '_clck', '_clsk'].forEach(function (name) {
      domains.forEach(function (domain) { document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + (domain ? '; Domain=' + domain : ''); });
    });
  }
  function start() {
    if (!commercial || loaded || !allowed()) return;
    loaded = true; window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    function tag() { window.dataLayer.push(arguments); }
    tag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    tag('js', new Date());
    var safeLocation = location.origin + location.pathname;
    var title = path.indexOf('disenos') !== -1 ? 'Invitesse — Designs' : 'Invitesse — Digital invitations';
    tag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: safeLocation, page_referrer: '', page_title: title, ignore_referrer: true,
      cookie_expires: lifetime / 1000, cookie_update: false, cookie_flags: 'SameSite=Lax;Secure' });
    tag('event', 'page_view', { page_location: safeLocation, page_referrer: '', page_title: title });
    window.gtag = tag;
    var script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(script);
    // Do not send arbitrary URL parameters/fragments to session replay providers.
    if (!location.search && (!location.hash || /^#(disenos|designs|como|medida|preguntas|faq|opciones|planes|rsvp)$/.test(location.hash))) {
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      document.querySelectorAll('input,textarea,select,form,.iv-privacy').forEach(function (el) { el.setAttribute('data-clarity-mask', 'true'); });
      window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
      var heatmap = document.createElement('script'); heatmap.async = true;
      heatmap.src = 'https://www.clarity.ms/tag/yzwi7fw4jr'; document.head.appendChild(heatmap);
    }
  }
  var host = document.createElement('div'); host.className = 'iv-privacy';
  host.innerHTML = '<button type="button" class="iv-privacy-launch" data-privacy="settings">' + text.settings + '</button>' +
    '<section class="iv-privacy-banner" aria-labelledby="iv-privacy-title" hidden><h2 id="iv-privacy-title">' + text.title + '</h2><p>' + text.body + '</p><a href="' + policy + '">' + text.policy + '</a><div class="iv-privacy-actions"><button type="button" data-privacy="reject">' + text.reject + '</button><button type="button" data-privacy="settings">' + text.settings + '</button><button type="button" data-privacy="accept">' + text.accept + '</button></div></section>' +
    '<dialog aria-labelledby="iv-privacy-dialog-title"><h2 id="iv-privacy-dialog-title">' + text.settings + '</h2><p>' + text.body + '</p><h3>' + text.necessary + '</h3><p>' + text.necessaryNote + '</p><label class="iv-privacy-choice"><input type="checkbox" id="iv-privacy-analytics">' + text.analytics + '</label><p>' + text.analyticsNote + '</p><p data-privacy-gpc hidden>' + text.gpc + '</p><a href="' + policy + '">' + text.policy + '</a><div class="iv-privacy-actions"><button type="button" data-privacy="reject">' + text.reject + '</button><button type="button" data-privacy="save">' + text.save + '</button><button type="button" data-privacy="close">' + text.close + '</button></div></dialog><p class="iv-privacy-error" role="status" hidden></p>';
  document.body.appendChild(host);
  var banner = host.querySelector('section'), dialog = host.querySelector('dialog'), check = host.querySelector('input');
  function close() { dialog.close(); if (opener && opener.isConnected && !opener.closest('[hidden]')) opener.focus(); }
  function stop() {
    window['ga-disable-' + id] = true;
    if (window.clarity && loaded) window.clarity('stop');
    clearCookies();
  }
  // Selected commercial actions only: no element text, field values or full URLs.
  document.addEventListener('click', function (e) {
    if (!commercial || !allowed() || !loaded) return;
    var el = e.target.closest('a,button'); if (!el || el.closest('.iv-privacy')) return;
    var action = '', design = '';
    if (el.matches('a[href]')) {
      var url; try { url = new URL(el.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      var match = /^\/(?:en\/)?demo\/([a-z]+)\/$/.exec(url.pathname);
      if (match) { action = 'open_demo'; design = match[1]; }
      else if (/^\/(?:en\/)?comprar\/$/.test(url.pathname)) {
        action = 'prepare_draft'; var candidate = url.searchParams.get('diseno') || '';
        if (/^[a-z]{1,20}$/.test(candidate)) design = candidate;
      } else if (/^\/(cuenta|en\/account)\/$/.test(url.pathname)) action = 'sign_in';
      else if (/^\/(?:en\/)?disenos\/$/.test(url.pathname)) action = 'view_catalogue';
      else if (url.hash) action = 'section_link';
    } else if (el.matches('[data-o],[data-style],[data-g],[data-clear]')) action = 'filter_designs';
    if (!action) return;
    window.gtag('event', 'commercial_click', { action: action, design_id: design, page_location: location.origin + location.pathname, page_referrer: '' });
  });
  function choose(value) {
    value = value && !gpc;
    try { localStorage.setItem(key, JSON.stringify({ version: 1, analytics: value, at: Date.now() })); }
    catch (_) {
      stop();
      var error = host.querySelector('[role="status"]'); error.hidden = false; error.textContent = text.failure; return;
    }
    var withdrawing = loaded && !value;
    if (!value) { stop(); }
    banner.hidden = true; if (dialog.open) close();
    if (withdrawing) { location.reload(); return; } // Unload Google code after disabling collection.
    start();
  }
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-privacy]'); if (!b) return;
    switch (b.dataset.privacy) {
      case 'settings': opener = b; check.checked = allowed(); check.disabled = gpc; host.querySelector('[data-privacy-gpc]').hidden = !gpc; dialog.showModal(); break;
      case 'close': close(); break;
      case 'accept': choose(true); break;
      case 'reject': choose(false); break;
      case 'save': choose(check.checked); break;
    }
  });
  window.addEventListener('storage', function (e) {
    if (e.key !== key && e.key !== null) return;
    if (!allowed()) { stop(); if (loaded) { location.reload(); return; } }
    banner.hidden = !!read() || gpc || !commercial; start();
  });
  if (!allowed()) { stop(); }
  banner.hidden = !!read() || gpc || !commercial;
  start();
})();
