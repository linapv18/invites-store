// Explicit endpoint allowlist for production builds. Changing this does not provision DNS/TLS.
export function supabaseOrigin(value) {
  let url;
  try { url = new URL(value); } catch (_) { throw new Error('Invalid Supabase project URL.'); }
  const allowed = /^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.hostname === 'auth.invitesse.com';
  if (!allowed || url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Use an HTTPS Supabase project endpoint or the verified auth.invitesse.com domain.');
  }
  return url.origin;
}
