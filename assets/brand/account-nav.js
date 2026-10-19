/* Account display only. Authentication and authorization remain with Supabase. */
(function () {
  'use strict';
  var link = document.querySelector('.nav-account');
  if (!link) return;
  var en = document.documentElement.lang.indexOf('en') === 0;
  var sessionKey = 'invitesse.auth.v1', generation = 0, backendPromise, subscribed = false, timer;
  var account = en ? 'My account' : 'Mi cuenta', signIn = en ? 'Sign in' : 'Iniciar sesión';
  var label = document.createElement('span'); label.className = 'nav-account-label';
  link.replaceChildren(label); link.setAttribute('data-clarity-mask', 'true');
  link.href = en ? '/en/account/' : '/cuenta/';
  function hasSession() {
    try { return !!localStorage.getItem(sessionKey); } catch (_) { return false; }
  }
  function firstName(user) {
    var m = user && user.user_metadata || {};
    var names = [m.given_name, m.full_name, m.name];
    for (var i = 0; i < names.length; i++) {
      if (typeof names[i] !== 'string') continue;
      var name = names[i].replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '').trim();
      if (name && name.indexOf('@') < 0) return Array.from(name.split(/\s+/)[0]).slice(0, 32).join('');
    }
    return '';
  }
  function paint(user, pending) {
    var name = firstName(user);
    label.textContent = name ? (en ? 'Hi, ' : 'Hola, ') + name : (user || pending ? account : signIn);
    link.setAttribute('aria-label', user || pending ? account : signIn);
    link.dataset.authState = user ? 'signed-in' : (pending ? 'pending' : 'signed-out');
    link.removeAttribute('aria-busy');
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 0); }
  function backend() {
    if (window.InvitesseBackend) return Promise.resolve(window.InvitesseBackend);
    if (!backendPromise) backendPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script'); script.src = '/assets/backend/client.js'; script.async = true;
      script.onload = function () {
        if (window.InvitesseBackend) resolve(window.InvitesseBackend);
        else { backendPromise = null; reject(new Error('BACKEND_UNAVAILABLE')); }
      };
      script.onerror = function () { script.remove(); backendPromise = null; reject(new Error('BACKEND_UNAVAILABLE')); };
      document.head.appendChild(script);
    });
    return backendPromise;
  }
  async function refresh() {
    var current = ++generation;
    if (!hasSession()) { paint(null); return; }
    link.setAttribute('aria-busy', 'true');
    try {
      var b = await backend();
      if (!subscribed) {
        subscribed = true;
        b.auth.onChange(function (event) {
          if (event === 'SIGNED_OUT') { ++generation; paint(null); }
          else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') schedule();
        });
      }
      var result = await b.auth.getUser();
      if (current !== generation) return;
      if (result.error) paint(null, hasSession());
      else paint(result.data && result.data.user);
    } catch (_) { if (current === generation) paint(null, hasSession()); }
  }
  // Anonymous storefront visits do not load the Supabase SDK or fetch private drafts.
  paint(null, hasSession()); refresh();
  window.addEventListener('storage', function (e) { if (e.key === sessionKey || e.key === null) schedule(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) schedule(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') schedule(); });
})();
