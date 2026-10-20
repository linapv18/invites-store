const Stripe = require('stripe');
const {verifiedSessionPayment}=require('../lib/payments/stripe');
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

function createHandler({ settings, verify, adminClient, retrievePayment = id => require('../lib/payments/runtime').stripeClient().paymentIntents.retrieve(id) }) {
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
    if (['charge.refunded', 'charge.dispute.created'].includes(event.type)) {
      const charge = event.data?.object;
      // Full refunds and disputes suspend only the matched Invitesse purchase.
      if (event.type === 'charge.refunded' && (!charge?.refunded || charge.amount_refunded !== charge.amount)) return res.status(200).json({ received: true });
      if (typeof charge?.payment_intent !== 'string') return res.status(200).json({ received: true });
      try {
        const admin = adminClient();
        const { data: payment, error: lookupError } = await admin.from('payments').select('order_id').eq('provider', 'stripe').eq('provider_payment_id', charge.payment_intent).maybeSingle();
        if (lookupError) throw lookupError;
        let orderId = payment?.order_id;
        if (!orderId) {
          const intent = await retrievePayment(charge.payment_intent);
          if (!intent.livemode || intent.metadata?.integration !== 'invitesse' || !uuid.test(intent.metadata?.order_id || '')) return res.status(200).json({ received: true });
          orderId = intent.metadata.order_id;
        }
        const { error } = await admin.rpc('revoke_stripe_order', { target_order: orderId });
        if (error) throw error;
        return res.status(200).json({ received: true });
      } catch (_) { return res.status(503).json({ error: 'PAYMENT_RECORDING_UNAVAILABLE' }); }
    }
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
      return res.status(200).json({ received: true });
    }
    const session = event.data?.object;
    // A shared Stripe account can contain unrelated checkouts.
    if (session?.metadata?.integration !== 'invitesse') return res.status(200).json({ received: true });
    if (!['paid','no_payment_required'].includes(session.payment_status)) return res.status(200).json({ received: true });
    const order = session.metadata.order_id;
    let payment;
    try { payment=verifiedSessionPayment(session); }
    catch (_) { return res.status(400).json({error:'INVALID_PAYMENT'}); }
    try {
      const { error } = await adminClient().rpc('apply_verified_payment', {
        payment_provider: 'stripe', provider_event: event.id, ...payment,
      });
      if (error) {
        const { data: existing } = await adminClient().from('orders').select('status').eq('id', order).maybeSingle();
        if (existing?.status === 'refunded') return res.status(200).json({ received: true });
        throw error;
      }
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
