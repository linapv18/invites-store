// A separate API from LazoAuth: the legacy purchase simulation grants no cloud access.
// Inject the SDK client so the contract can be tested without real accounts or emails.
export function createServices(client) {
  async function userId() {
    const { data, error } = await client.auth.getUser();
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
      signUp: (email, password, path = '/cuenta/') => client.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: redirectUrl(path) },
      }),
      signIn: (email, password) => client.auth.signInWithPassword({ email: email.trim(), password }),
      signOut: () => client.auth.signOut(),
      resetPassword: (email, path = '/cuenta/') => client.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl(path) }),
      updatePassword: (password) => client.auth.updateUser({ password }),
      getUser: () => client.auth.getUser(),
      onChange: (callback) => client.auth.onAuthStateChange(callback),
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
