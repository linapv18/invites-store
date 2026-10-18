import { createClient } from '@supabase/supabase-js';
import { createServices } from './services.mjs';

// This is a static frontend, so the SDK persists and refreshes sessions directly.
// Database authorization must always come from RLS, never from browser state.
const config = window.INVITESSE_SUPABASE_CONFIG;
if (config && config.url && config.publishableKey) {
  const client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'invitesse.auth.v1',
    },
  });
  window.InvitesseBackend = createServices(client, config);
}
