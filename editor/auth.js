/* Cuentas de Lazo — VERSIÓN SIMULADA.
   Todo se guarda en localStorage de este navegador: sirve para probar el flujo
   (crear cuenta → comprar un diseño → editarlo desde "Mi cuenta"), pero NO es seguro ni
   compartible entre dispositivos. La contraseña se guarda como hash SHA-256 con sal, solo
   para no dejarla en texto plano; cualquiera con acceso al navegador puede leer los datos.
   TODO: reemplazar por un servicio real de cuentas (p. ej. Supabase o Firebase) y confirmar
   las compras desde el servidor cuando el pago esté conectado.
   Uso:
     LazoAuth.register(email, pass) / LazoAuth.login(email, pass) → Promise<{ ok } | { error }>
     LazoAuth.current()  → { email, purchases: { clasico: { at } }, last } | null
     LazoAuth.buy('clasico')  (compra de prueba)   LazoAuth.owns('clasico')   LazoAuth.logout()
     LazoAuth.invKey('clasico') / LazoAuth.cartKey()  → claves de localStorage del usuario */
(function () {
  'use strict';
  var USERS = 'lazo.accounts.v1', SESSION = 'lazo.session.v1';
  var DESIGNS = ['clasico', 'moderno', 'rosa', 'jardin', 'costa', 'gala', 'aurelia', 'noir', 'lino', 'marfil', 'fiesta', 'celeste', 'cisne', 'tinta', 'glicina', 'estreno', 'nacar'];
  function load(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var norm = function (e) { return String(e || '').trim().toLowerCase(); };
  var validEmail = function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); };
  var users = function () { return load(USERS) || {}; };
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function hash(pass, salt) {
    if (!window.crypto || !crypto.subtle) return Promise.resolve('plain:' + salt + ':' + pass);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pass)).then(hex);
  }
  function salt() {
    var a = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (var i = 0; i < 16; i++) a[i] = Math.random() * 256;
    return hex(a);
  }
  function session() { var s = load(SESSION); return s && s.email ? s.email : null; }

  window.LazoAuth = {
    DESIGNS: DESIGNS,
    validEmail: validEmail,
    register: function (email, pass) {
      email = norm(email);
      if (!validEmail(email)) return Promise.resolve({ error: 'email' });
      if (String(pass || '').length < 8) return Promise.resolve({ error: 'short' });
      var all = users();
      if (all[email]) return Promise.resolve({ error: 'exists' });
      var s = salt();
      return hash(pass, s).then(function (h) {
        all = users();
        all[email] = { salt: s, hash: h, created: Date.now(), purchases: {}, last: '' };
        if (!store(USERS, all)) return { error: 'storage' };
        store(SESSION, { email: email });
        return { ok: true };
      });
    },
    login: function (email, pass) {
      email = norm(email);
      var u = users()[email];
      if (!u) return Promise.resolve({ error: 'nouser' });
      return hash(pass, u.salt).then(function (h) {
        if (h !== u.hash) return { error: 'wrong' };
        store(SESSION, { email: email });
        return { ok: true };
      });
    },
    logout: function () { try { localStorage.removeItem(SESSION); } catch (e) {} },
    current: function () {
      var e = session(); if (!e) return null;
      var u = users()[e]; if (!u) return null;
      return { email: e, purchases: u.purchases || {}, last: u.last || '' };
    },
    owns: function (d) { var u = this.current(); return !!(u && u.purchases[d]); },
    owned: function () { var u = this.current(); return u ? DESIGNS.filter(function (d) { return u.purchases[d]; }) : []; },
    // TODO: con pagos reales, la compra la registra el servidor al confirmarse el pago; esto es solo para pruebas.
    buy: function (d) {
      var e = session(), all = users();
      if (!e || !all[e] || DESIGNS.indexOf(d) < 0) return false;
      all[e].purchases = all[e].purchases || {};
      if (!all[e].purchases[d]) all[e].purchases[d] = { at: Date.now(), test: true };
      return store(USERS, all);
    },
    setLast: function (d) { var e = session(), all = users(); if (e && all[e]) { all[e].last = d; store(USERS, all); } },
    invKey: function (d) { return 'lazo.inv.v1:' + session() + ':' + d; },
    cartKey: function () { return 'lazo.cart.v1:' + session(); },
    // Solo rutas internas para ?next= (evita redirigir a otros sitios).
    safeNext: function (n) { return typeof n === 'string' && /^\/(?!\/)/.test(n) && n.indexOf('\\') < 0 ? n : ''; }
  };
})();
