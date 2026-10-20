/* Supabase accounts and private drafts. Local storage is a preview cache, never authorization. */
(function () {
  'use strict';
  var DESIGNS = ['clasico', 'moderno', 'rosa', 'jardin', 'costa', 'gala', 'aurelia', 'noir', 'lino', 'marfil', 'fiesta', 'celeste', 'cisne', 'tinta', 'glicina', 'estreno', 'nacar', 'arco', 'corazones', 'encaje', 'onix', 'senal'];
  var B = window.InvitesseBackend, user = null, drafts = {}, recovery = false, entitlements = {}, purchases = {};
  function cache(row) {
    drafts[row.design_id] = row;
    try { localStorage.setItem(api.invKey(row.design_id), JSON.stringify(row.content)); } catch (_) {}
  }
  async function refresh() {
    var result = await B.auth.getUser();
    if (result.error && result.error.name !== 'AuthSessionMissingError') throw result.error;
    user = result.data && result.data.user;
    drafts = {}; entitlements = {}; purchases = {};
    if (user) {
      (await B.drafts.list()).forEach(cache);
      var rights = await B.client.from('invitation_entitlements').select('invitation_id,source,expires_at,revoked_at');
      if(rights.error)throw rights.error;
      (rights.data || []).forEach(function(r){entitlements[r.invitation_id]=!r.revoked_at && (!r.expires_at || Date.parse(r.expires_at)>Date.now());purchases[r.invitation_id]=r.source==='purchase' && !r.revoked_at;});
    }
  }
  function errorCode(e) {
    if (!e) return '';
    if (e.code === 'invalid_credentials') return 'credentials';
    if (e.code === 'email_not_confirmed') return 'unconfirmed';
    if (e.code === 'over_email_send_rate_limit' || e.status === 429) return 'rate';
    if (e.code === 'weak_password') return 'short';
    return 'network';
  }
  var api = window.LazoAuth = {
    DESIGNS: DESIGNS, cloud: true,
    validEmail: function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim()); },
    safeNext: function (n) { return typeof n === 'string' && /^\/(?!\/)/.test(n) && n.indexOf('\\') < 0 ? n : ''; },
    current: function () {
      if (!user) return null;
      var owned = {}; Object.keys(drafts).forEach(function (d) { owned[d] = { draft: true }; });
      return { id: user.id, email: user.email, purchases: owned, last: '', editorGuideSeen: !!(user.user_metadata && user.user_metadata.invitesse_editor_guide_seen === true) };
    },
    owned: function () { return DESIGNS.filter(function (d) { return !!drafts[d]; }); },
    purchased: function(){return user?DESIGNS.filter(function(d){return drafts[d] && purchases[drafts[d].id];}):[];},
    canEdit: function(d) { return !!(user && drafts[d] && entitlements[drafts[d].id]); },
    refresh: refresh,
    draft: function(d) { return drafts[d]; },
    owns: function (d) { return !!(user && drafts[d]); },
    invKey: function (d) { return 'invitesse.preview.v1:' + (user ? user.id : 'none') + ':' + d; },
    cartKey: function () { return 'invitesse.cart.v1:' + (user ? user.id : 'none'); },
    setLast: function () {},
    recovery: function () { return recovery; },
    googleAvailable: function () { return B.auth.googleAvailable(); },
    async google(next) {
      var destination = api.safeNext(next);
      try {
        sessionStorage.setItem('invitesse.oauth.return', JSON.stringify({ path: destination, at: Date.now() }));
        var result = await B.auth.signInWithGoogle(document.documentElement.lang === 'en' ? '/en/account/' : '/cuenta/');
        if (result.error) { sessionStorage.removeItem('invitesse.oauth.return'); return { error: errorCode(result.error) }; }
        return { ok: true };
      } catch (_) {
        try { sessionStorage.removeItem('invitesse.oauth.return'); } catch (_) {}
        return { error: 'network' };
      }
    },
    async register(email, pass) {
      try {
        var r = await B.auth.signUp(email, pass, document.documentElement.lang === 'en' ? '/en/account/' : '/cuenta/');
        if (r.error) return { error: errorCode(r.error) };
        if (!r.data.session) return { verify: true };
        await refresh(); return { ok: true };
      } catch (_) { return { error: 'network' }; }
    },
    async login(email, pass) {
      try { var r = await B.auth.signIn(email, pass); if (r.error) return { error: errorCode(r.error) }; await refresh(); return { ok: true }; }
      catch (_) { return { error: 'network' }; }
    },
    async logout() {
      var keys = Object.keys(drafts).map(function(d){ return api.invKey(d); });
      var r = await B.auth.signOut(); if (r.error) throw r.error;
      keys.forEach(function(k){ try { localStorage.removeItem(k); } catch (_) {} });
      user = null; drafts = {};
    },
    async rememberEditorGuideSeen() {
      if (!user) throw new Error('AUTH_REQUIRED');
      if (user.user_metadata && user.user_metadata.invitesse_editor_guide_seen === true) return;
      var result = await B.auth.markEditorGuideSeen();
      if (result.error) throw result.error;
      user = result.data.user;
    },
    async buy(d) {
      // Creates an editable draft only: no payment, purchase or publication rights.
      if (!user || DESIGNS.indexOf(d) < 0) throw new Error('AUTH_REQUIRED');
      if (!drafts[d]) {
        try { cache(await B.drafts.create(d)); } catch(e) { if (e.code !== '23505') throw e; await refresh(); if (!drafts[d]) throw e; }
      }
      return true;
    },
    async saveDraft(d, content) {
      if (!user || !drafts[d]) throw new Error('AUTH_REQUIRED');
      var row = await B.drafts.save(drafts[d].id, content, drafts[d].revision);
      drafts[d] = row; return row;
    },
    resetPassword: async function (email) {
      var r = await B.auth.resetPassword(email, document.documentElement.lang === 'en' ? '/en/account/' : '/cuenta/');
      return r.error ? { error: errorCode(r.error) } : { ok: true };
    },
    updatePassword: async function (password) {
      var r = await B.auth.updatePassword(password);
      if (r.error) return { error: errorCode(r.error) };
      recovery = false; return { ok: true };
    }
  };
  api.ready = (async function () {
    if (!B) throw new Error('SUPABASE_NOT_CONFIGURED');
    B.auth.onChange(function (event, session) {
      if (event === 'SIGNED_IN' && user && session && session.user.id !== user.id) { location.reload(); return; }
      if (event === 'PASSWORD_RECOVERY') recovery = true;
      if (event === 'SIGNED_OUT') {
        Object.keys(drafts).forEach(function(d) { try { localStorage.removeItem(api.invKey(d)); } catch (_) {} });
        user = null; drafts = {};
        window.dispatchEvent(new Event('invitesse:signed-out'));
      }
    });
    await refresh();
  })();
})();
