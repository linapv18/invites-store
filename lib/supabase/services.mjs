// A separate API from LazoAuth: the legacy purchase simulation grants no cloud access.
// Inject the SDK client so the contract can be tested without real accounts or emails.
export function createServices(client, configuration = {}) {
  // getUser() validates the session with the server. A check made in the last few seconds
  // (e.g. right before listing drafts on page load) is reused instead of repeating the round trip.
  // Any sign-in, sign-out or user change clears it. RLS remains the authorization boundary.
  const VERIFIED_FOR_MS = 5000;
  let verified = null;
  async function getUser() {
    const result = await client.auth.getUser();
    verified = !result.error && result.data?.user ? { id: result.data.user.id, at: Date.now() } : null;
    return result;
  }
  async function userId() {
    if (verified && Date.now() - verified.at < VERIFIED_FOR_MS) return verified.id;
    const { data, error } = await getUser();
    if (error) throw error;
    if (!data.user) throw new Error('AUTH_REQUIRED');
    return data.user.id;
  }
  function redirectUrl(path) {
    const allowed = ['/cuenta/', '/en/account/', '/en/cuenta/'];
    if (!allowed.includes(path)) throw new Error('INVALID_REDIRECT');
    // The legacy English callback is already allowlisted in Supabase and redirects
    // to the canonical /en/account/ route without dropping code/query/fragment.
    return new URL(path === '/en/account/' ? '/en/cuenta/' : path, window.location.origin).href;
  }
  function unwrap(result) {
    if (result.error) throw result.error;
    return result.data;
  }
  return Object.freeze({
    client,
    auth: {
      async googleAvailable() {
        try {
          const response = await fetch(configuration.url + '/auth/v1/settings', { headers: { apikey: configuration.publishableKey }, signal: AbortSignal.timeout(8000) });
          if (!response.ok) return false;
          return (await response.json()).external?.google === true;
        } catch (_) { return false; }
      },
      signInWithGoogle: (path = '/cuenta/') => client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl(path), queryParams: { prompt: 'select_account' } },
      }),
      signUp: (email, password, path = '/cuenta/') => client.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: redirectUrl(path) },
      }),
      signIn: (email, password) => client.auth.signInWithPassword({ email: email.trim(), password }),
      signOut: () => { verified = null; return client.auth.signOut(); },
      resetPassword: (email, path = '/cuenta/') => client.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl(path) }),
      updatePassword: (password) => client.auth.updateUser({ password }),
      getUser,
      onChange: (callback) => client.auth.onAuthStateChange((event, session) => {
        if (event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED') verified = null;
        callback(event, session);
      }),
    },
    invitations: {
      async list() {
        await userId();
        return unwrap(await client.from('invitations').select('id,design_id,slug,state,access_mode,published_version_id').order('created_at', { ascending: false }));
      },
      async publish(id, revision, slug, accessMode = 'family') {
        await userId();
        return unwrap(await client.rpc('publish_invitation', { target: id, expected_revision: revision, requested_slug: slug, requested_access: accessMode }));
      },
      async pause(id) {
        await userId();
        return unwrap(await client.rpc('pause_invitation', { target: id }));
      },
      public: (slug) => client.rpc('get_published_invitation', { requested_slug: slug }).then(unwrap),
    },
    households: {
      async create(invitationId, name, people, email = '', phone = '') {
        await userId();
        return unwrap(await client.rpc('create_household', { target: invitationId, family_name: name, guest_names: people, contact_email: email, contact_phone: phone }));
      },
      async edit(householdId, name, people, revision, email = '', phone = '') {
        await userId();
        return unwrap(await client.rpc('edit_household', { target_household: householdId, family_name: name, people, expected_revision: revision, contact_email: email, contact_phone: phone }));
      },
      async remove(householdId, revision) {
        await userId();
        return unwrap(await client.rpc('delete_household', { target_household: householdId, expected_revision: revision }));
      },
      async rotateLink(householdId, expiresAt = null) {
        await userId();
        return unwrap(await client.rpc('rotate_guest_link', { target_household: householdId, valid_until: expiresAt }));
      },
    },
    guests: {
      open: (token) => client.rpc('get_guest_invitation', { raw_token: token }).then(unwrap),
      submit: (token, answers, message, revision, requestId) => client.rpc('submit_guest_response', { raw_token: token, answers, response_message: message, expected_revision: revision, request_id: requestId }).then(unwrap),
    },
    assets: {
      async upload(invitationId, file) {
        const owner = await userId();
        const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'audio/mpeg': 'mp3' };
        const extension = extensions[file.type];
        if (!extension || !file.size || file.size > 15728640) throw new Error('INVALID_FILE');
        const path = owner + '/' + invitationId + '/' + crypto.randomUUID() + '.' + extension;
        unwrap(await client.storage.from('invitation-assets').upload(path, file, { contentType: file.type, upsert: false }));
        const asset = unwrap(await client.rpc('register_invitation_asset', { target: invitationId, path, asset_kind: file.type.startsWith('image/') ? 'image' : 'audio' }));
        return { ...asset, reference: 'asset:' + asset.id };
      },
      async preview(path) {
        await userId();
        return unwrap(await client.storage.from('invitation-assets').createSignedUrl(path, 60));
      },
    },
    addons: {
      async save(invitationId, code, settings) {
        await userId();
        return unwrap(await client.rpc('save_addon_settings', { target: invitationId, addon: code, payload: settings }));
      },
    },
    drafts: {
      async list() {
        await userId();
        return unwrap(await client.from('invitation_drafts').select('id,design_id,content,revision,updated_at').order('updated_at', { ascending: false }));
      },
      async create(designId, content = {}) {
        const owner = await userId();
        return unwrap(await client.from('invitation_drafts').insert({ owner_id: owner, design_id: designId, content }).select().single());
      },
      async get(id) {
        await userId();
        return unwrap(await client.from('invitation_drafts').select().eq('id', id).single());
      },
      async save(id, content, revision) {
        await userId();
        // Optimistic locking: stale tabs cannot silently overwrite newer revisions.
        return unwrap(await client.rpc('save_invitation_draft', { draft_id: id, draft_content: content, expected_revision: revision }));
      },
    },
  });
}
