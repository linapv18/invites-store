const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
async function rawBody(req) {
  // Never reconstruct JSON: Stripe signs the exact bytes received.
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk); size += bytes.length;
    if (size > 1024 * 1024) throw new Error('BODY_TOO_LARGE');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

function createHandler({ settings, verify, adminClient }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    }
    const config = settings();
    if (!config.ready) return res.status(503).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
    let event;
    try {
      event = verify(await rawBody(req), req.headers['stripe-signature'], config.webhookSecret);
    } catch (_) { return res.status(400).json({ error: 'INVALID_SIGNATURE' }); }
    // This endpoint belongs to the live account. Preview/test events never grant rights.
    if (event.livemode !== true) return res.status(400).json({ error: 'WRONG_PAYMENT_MODE' });
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
      return res.status(200).json({ received: true });
    }
    const session = event.data?.object;
    // A shared Stripe account can contain unrelated checkouts.
    if (session?.metadata?.integration !== 'invitesse') return res.status(200).json({ received: true });
    if (session.payment_status !== 'paid') return res.status(200).json({ received: true });
    const order = session.metadata.order_id;
    if (session.mode !== 'payment' || session.livemode !== true || !uuid.test(order || '') ||
        session.client_reference_id !== order || !Number.isSafeInteger(session.amount_total) || session.amount_total <= 0 ||
        !['usd', 'cop'].includes(session.currency) || typeof session.payment_intent !== 'string' ||
        !/^pi_[a-zA-Z0-9]+$/.test(session.payment_intent)) {
      return res.status(400).json({ error: 'INVALID_PAYMENT' });
    }
    try {
      const { error } = await adminClient().rpc('apply_verified_payment', {
        payment_provider: 'stripe', provider_event: event.id, target_order: order,
        external_payment: session.payment_intent, verified_amount: session.amount_total,
        verified_currency: session.currency.toUpperCase(),
      });
      if (error) throw error;
      // The database verifies the original order total and grants rights atomically,
      // deduplicating events. A browser success redirect never activates a purchase.
      return res.status(200).json({ received: true });
    } catch (_) {
      // Non-2xx lets Stripe retry; do not expose database details or customer data.
      return res.status(503).json({ error: 'PAYMENT_RECORDING_UNAVAILABLE' });
    }
  };
}

module.exports = createHandler({
  settings: () => ({
    ready: !!(process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') &&
      process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') &&
      process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_') &&
      (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  }),
  verify: (body, signature, secret) => Stripe.webhooks.constructEvent(body, signature, secret),
  adminClient: () => createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } }),
});
module.exports.config = { api: { bodyParser: false } };
module.exports.createHandler = createHandler;
