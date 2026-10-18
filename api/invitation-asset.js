const { createClient } = require('@supabase/supabase-js');

// POST body carries the family capability; it must not appear in a URL or access log.
function createHandler({ publicClient, adminClient }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' }); }
    const body = req.body;
    const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!body || typeof body !== 'object' || !uuid.test(body.assetId || '')) return res.status(400).json({ error: 'INVALID_REQUEST' });
    const guest = typeof body.guestToken === 'string' && /^[a-f0-9]{64}$/.test(body.guestToken);
    const publicLink = typeof body.slug === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug) && body.slug.length <= 80;
    if ((!guest && !publicLink) || (guest && publicLink)) return res.status(400).json({ error: 'INVALID_REQUEST' });
    try {
      const reader = publicClient();
      const { data: invitation, error } = await reader.rpc(guest ? 'get_guest_invitation' : 'get_published_invitation', guest ? { raw_token: body.guestToken } : { requested_slug: body.slug });
      if (error || !invitation || !Array.isArray(invitation.assets) || !invitation.assets.some(a => a.id === body.assetId)) return res.status(404).json({ error: 'ASSET_UNAVAILABLE' });
      // Never sign a path supplied by a browser. Fetch the server-owned manifest record.
      const admin = adminClient();
      const { data: asset, error: assetError } = await admin.from('invitation_assets').select('object_path').eq('id', body.assetId).eq('invitation_id', invitation.id).single();
      if (assetError || !asset) return res.status(404).json({ error: 'ASSET_UNAVAILABLE' });
      const { data, error: signError } = await admin.storage.from('invitation-assets').createSignedUrl(asset.object_path, 60);
      if (signError) return res.status(503).json({ error: 'ASSET_TEMPORARILY_UNAVAILABLE' });
      return res.status(200).json({ url: data.signedUrl, expiresIn: 60 });
    } catch (_) {
      return res.status(503).json({ error: 'ASSET_TEMPORARILY_UNAVAILABLE' });
    }
  };
}
function configuration(key) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key) throw new Error('SERVER_NOT_CONFIGURED');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
module.exports = createHandler({
  publicClient: () => configuration(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  adminClient: () => {
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!secret || !secret.startsWith('sb_secret_')) throw new Error('SERVER_NOT_CONFIGURED');
    return configuration(secret);
  },
});
module.exports.createHandler = createHandler;
