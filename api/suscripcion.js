// Suscripción a correos de marketing desde el landing (sección «Su celebración empieza aquí»).
// Guarda el consentimiento en Supabase (newsletter_subscribers, 202610220001_newsletter.sql), crea un código único del 10%
// y lo envía con Resend. Solo responde ok cuando el proveedor aceptó el correo; si el envío falla, la suscripción queda
// pendiente y un nuevo intento vuelve a enviar el mismo código.
// Baja: el enlace de cada correo abre GET /api/suscripcion?baja=<token> (pide confirmar) y el formulario hace POST;
// el POST también atiende la baja en un clic de List-Unsubscribe.
// Variables en Vercel: SUPABASE_URL y SUPABASE_SECRET_KEY (las del checkout), RESEND_API_KEY y un remitente verificado
// en NEWSLETTER_FROM (o MARKETING_FROM / QUOTE_FROM). Sin ellas responde 503 NOT_CONFIGURED y no guarda nada.
const rt = require('../lib/payments/runtime');

const SITE = 'https://www.invitesse.com';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONSENT = {
  es: 'Acepto recibir correos de marketing de Invitesse con inspiración, novedades y promociones. He leído la política de privacidad.',
  en: 'I agree to receive marketing emails from Invitesse with inspiration, news and promotions. I have read the privacy policy.',
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function parse(body) {
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { return null; } }
  if (!body || typeof body !== 'object') return null;
  return {
    email: typeof body.email === 'string' ? body.email.replace(/[\s\u0000-\u001f\u007f]+/g, '').toLowerCase().slice(0, 300) : '',
    consent: body.consent === true,
    lang: body.lang === 'en' ? 'en' : 'es',
    website: typeof body.website === 'string' ? body.website.trim() : '',
  };
}

function unsubscribeUrl(token, lang) { return SITE + '/api/suscripcion?baja=' + encodeURIComponent(token) + (lang === 'en' ? '&lang=en' : ''); }

function welcome({ email, code, token, lang }) {
  const en = lang === 'en', link = unsubscribeUrl(token, lang), shop = SITE + (en ? '/en/designs/' : '/disenos/');
  const t = en ? {
    subject: 'Your 10% welcome code · Invitesse',
    hello: 'Thank you for joining Invitesse.',
    intro: 'Here is your code for 10% off your first invitation from the collection. Enter it at checkout.',
    terms: '10% off the first purchase of an invitation. One use per customer. Cannot be combined with other promotions.',
    cta: 'Explore the designs',
    why: 'You receive this email because you subscribed to Invitesse marketing emails.',
    leave: 'Unsubscribe',
  } : {
    subject: 'Su 10% de bienvenida · Invitesse',
    hello: 'Gracias por suscribirse a Invitesse.',
    intro: 'Este es su código del 10% para su primera invitación de la colección. Escríbanlo al pagar.',
    terms: '10% de descuento en la primera compra de una invitación. Un uso por cliente. No acumulable con otras promociones.',
    cta: 'Explorar diseños',
    why: 'Reciben este correo porque se suscribieron a los correos de marketing de Invitesse.',
    leave: 'Darse de baja',
  };
  const text = [t.hello, '', t.intro, '', code, '', t.terms, '', t.cta + ': ' + shop, '', '—', t.why, t.leave + ': ' + link].join('\n') + '\n';
  const html = '<div style="background:#F3EEE9;padding:32px 16px;font:15px/1.6 Helvetica,Arial,sans-serif;color:#352432">' +
    '<div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #35243226;border-radius:12px;padding:40px 32px;text-align:center">' +
    '<p style="margin:0 0 24px;font:28px/1 Georgia,serif;letter-spacing:-.04em">invitesse</p>' +
    '<p style="margin:0 0 8px;font:22px/1.3 Georgia,serif">' + escapeHtml(t.hello) + '</p>' +
    '<p style="margin:0 0 28px;color:#655560">' + escapeHtml(t.intro) + '</p>' +
    '<p style="margin:0 auto 28px;display:inline-block;padding:16px 28px;border:1px solid #B7A38A;border-radius:6px;font:600 22px/1 \'Courier New\',monospace;letter-spacing:.12em;color:#241320">' + escapeHtml(code) + '</p>' +
    '<p style="margin:0 0 28px"><a href="' + shop + '" style="display:inline-block;background:#241320;color:#F8F3EC;text-decoration:none;padding:14px 26px;border-radius:999px;font-size:14px">' + escapeHtml(t.cta) + '</a></p>' +
    '<p style="margin:0;font-size:12px;color:#655560">' + escapeHtml(t.terms) + '</p></div>' +
    '<p style="max-width:520px;margin:20px auto 0;font-size:12px;color:#655560;text-align:center">' + escapeHtml(t.why) + ' <a href="' + escapeHtml(link) + '" style="color:#352432">' + escapeHtml(t.leave) + '</a></p></div>';
  return { to: email, subject: t.subject, text, html, unsubscribe: link };
}

function page(lang, title, body, form) {
  const en = lang === 'en';
  return '<!doctype html><html lang="' + (en ? 'en' : 'es') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>' + escapeHtml(title) + ' — Invitesse</title>' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F8F3EC;color:#352432;font:16px/1.6 system-ui,sans-serif;padding:24px;box-sizing:border-box}main{max-width:460px;text-align:center}h1{font:400 34px/1.15 Georgia,serif;margin:0 0 12px}p{margin:0 0 24px;color:#655560}button,a.b{display:inline-flex;min-height:48px;align-items:center;padding:0 26px;border:0;border-radius:999px;background:#241320;color:#F8F3EC;font:500 14px system-ui,sans-serif;text-decoration:none;cursor:pointer}:focus-visible{outline:2px solid #77507A;outline-offset:4px}</style></head>' +
    '<body><main><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(body) + '</p>' + (form || '<a class="b" href="' + SITE + (en ? '/en/' : '/') + '">Invitesse</a>') + '</main></body></html>';
}

function createHandler({ subscribe, confirmSent, unsubscribe, send, configured }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const url = new URL(req.url || '/', SITE);
    const token = url.searchParams.get('baja');
    const en = url.searchParams.get('lang') === 'en';

    if (token !== null) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      const reply = (code, title, body, form) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.status(code).send(page(en ? 'en' : 'es', title, body, form)); };
      if (!TOKEN.test(token)) return reply(400, en ? 'Invalid link' : 'Enlace no válido', en ? 'Write to hola@invitesse.com and we will unsubscribe you.' : 'Escríbannos a hola@invitesse.com y les daremos de baja.');
      // GET solo pide confirmación: los lectores de correo que abren enlaces por adelantado no dan de baja a nadie.
      if (req.method === 'GET') return reply(200, en ? 'Unsubscribe' : 'Darse de baja', en ? 'You will stop receiving Invitesse marketing emails.' : 'Dejarán de recibir los correos de marketing de Invitesse.',
        '<form method="post"><button type="submit">' + (en ? 'Confirm' : 'Confirmar la baja') + '</button></form>');
      if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' }); }
      try {
        const found = await unsubscribe(token);
        if (!found) return reply(404, en ? 'Invalid link' : 'Enlace no válido', en ? 'Write to hola@invitesse.com and we will unsubscribe you.' : 'Escríbannos a hola@invitesse.com y les daremos de baja.');
        return reply(200, en ? 'You have unsubscribed' : 'Baja confirmada', en ? 'You will no longer receive Invitesse marketing emails.' : 'Ya no recibirán correos de marketing de Invitesse.');
      } catch (_) {
        return reply(503, en ? 'Something went wrong' : 'Algo salió mal', en ? 'Please try again in a few minutes or write to hola@invitesse.com.' : 'Inténtenlo de nuevo en unos minutos o escríbannos a hola@invitesse.com.');
      }
    }

    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' }); }
    const origin = req.headers && req.headers.origin;
    if (origin) { try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'FORBIDDEN' }); } catch (_) { return res.status(403).json({ error: 'FORBIDDEN' }); } }
    const q = parse(req.body);
    if (!q) return res.status(400).json({ error: 'INVALID_REQUEST' });
    // Trampa para bots: el campo oculto relleno se acepta sin guardar ni enviar nada.
    if (q.website) return res.status(200).json({ ok: true });
    if (q.email.length > 254 || !EMAIL.test(q.email)) return res.status(400).json({ error: 'INVALID_FIELD', field: 'email' });
    if (!q.consent) return res.status(400).json({ error: 'INVALID_FIELD', field: 'consent' });
    if (!configured()) return res.status(503).json({ error: 'NOT_CONFIGURED' });
    let subscriber;
    try {
      subscriber = await subscribe({ email: q.email, lang: q.lang, consent: CONSENT[q.lang] });
    } catch (error) {
      if (/INVALID_EMAIL/.test(error && error.message)) return res.status(400).json({ error: 'INVALID_FIELD', field: 'email' });
      console.error('invitesse.newsletter.subscribe_failed');
      return res.status(503).json({ error: 'SEND_FAILED' });
    }
    if (subscriber.state === 'already') return res.status(409).json({ error: 'ALREADY_SUBSCRIBED' });
    try {
      await send(welcome(subscriber));
    } catch (_) {
      console.error('invitesse.newsletter.send_failed');
      return res.status(503).json({ error: 'SEND_FAILED' });
    }
    // El correo ya salió: un fallo al marcarlo solo provoca un reenvío del mismo código si vuelven a intentarlo.
    try { await confirmSent(subscriber.email); } catch (_) { console.error('invitesse.newsletter.confirm_failed'); }
    return res.status(200).json({ ok: true });
  };
}

function sender() { return process.env.NEWSLETTER_FROM || process.env.MARKETING_FROM || process.env.QUOTE_FROM; }

async function sendWithResend(m) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: sender(), to: [m.to], reply_to: 'hola@invitesse.com', subject: m.subject, text: m.text, html: m.html,
      headers: { 'List-Unsubscribe': '<' + m.unsubscribe + '>, <mailto:hola@invitesse.com?subject=Baja>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('RESEND_' + response.status);
}

const rpc = (name, args) => rt.unwrap(rt.adminClient().rpc(name, args));

module.exports = createHandler({
  configured: () => Boolean(process.env.RESEND_API_KEY && sender() && (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_')),
  subscribe: ({ email, lang, consent }) => rpc('newsletter_subscribe', { requested_email: email, requested_lang: lang, requested_source: 'landing', requested_consent: consent }),
  confirmSent: (email) => rpc('newsletter_confirm_sent', { requested_email: email }),
  unsubscribe: (token) => rpc('newsletter_unsubscribe', { token }),
  send: sendWithResend,
});
module.exports.createHandler = createHandler;
module.exports.welcome = welcome;
