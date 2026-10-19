import { AuthClient } from '@supabase/auth-js';
import { PostgrestClient } from '@supabase/postgrest-js';
import { StorageClient } from '@supabase/storage-js';
import { createServices } from './services.mjs';

// This is a static frontend, so the SDK persists and refreshes sessions directly.
// Database authorization must always come from RLS, never from browser state.
// Only auth, PostgREST and Storage are assembled here (instead of @supabase/supabase-js,
// which also bundles realtime and functions) and wired the same way createClient does.
const config = window.INVITESSE_SUPABASE_CONFIG;
if (config && config.url && config.publishableKey) {
  const key = config.publishableKey;
  const base = config.url.replace(/\/+$/, '') + '/';
  const auth = new AuthClient({
    url: new URL('auth/v1', base).href,
    headers: { Authorization: 'Bearer ' + key, apikey: key },
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'invitesse.auth.v1',
  });
  // Every REST/Storage request carries the signed-in user's JWT (or the publishable key
  // when signed out), read fresh from the auth session so refreshed tokens are used.
  async function fetchWithAuth(input, init) {
    const { data } = await auth.getSession();
    const headers = new Headers(init?.headers);
    if (!headers.has('apikey')) headers.set('apikey', key);
    if (!headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + (data.session?.access_token ?? key));
    return fetch(input, { ...init, headers });
  }
  const rest = new PostgrestClient(new URL('rest/v1', base).href, { schema: 'public', fetch: fetchWithAuth });
  const client = {
    auth,
    storage: new StorageClient(new URL('storage/v1', base).href, {}, fetchWithAuth),
    from: (relation) => rest.from(relation),
    rpc: (fn, args, options) => rest.rpc(fn, args, options),
  };
  window.InvitesseBackend = createServices(client, config);
}
