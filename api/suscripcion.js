// Suscripción a correos de marketing desde el landing (sección «Su celebración empieza aquí»).
// Guarda el consentimiento en Supabase (newsletter_subscribers, 202610220001_newsletter.sql) y envía con Resend el
// correo de bienvenida con el código INVITESSE10 (debe estar activo en el admin). Solo responde ok cuando el proveedor
// aceptó el correo; si el envío falla, la suscripción queda pendiente y un nuevo intento vuelve a enviarlo.
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

// Correo de bienvenida (diseño «Correo de bienvenida» del lienzo): tablas y estilos en línea para Gmail, Outlook y Apple Mail.
// Bodoni Moda solo se ve donde el cliente la tiene; el resto usa Georgia.
const SERIF = "'Bodoni Moda',Georgia,'Times New Roman',serif";
const SANS = 'Helvetica,Arial,sans-serif';
const COPY = {
  es: {
    subject: 'Su 10% de bienvenida · Invitesse',
    preheader: 'Su código INVITESSE10 para su primera invitación.',
    kicker: 'Bienvenidos a Invitesse', title: 'Su celebración', titleItalic: 'empieza aquí.',
    intro: 'Gracias por suscribirse. Como prometimos, este es su regalo de bienvenida para la primera invitación de su boda.',
    card: 'Tarjeta de bienvenida', forFirst: 'en su primera invitación', yourCode: 'Su código', cta: 'Explorar diseños', how: 'Cómo usarlo',
    steps: [['Elijan su diseño.', 'Abran las demos y recorran cada apertura antes de decidir.'], ['Escriban {code} al pagar.', 'El descuento se aplica antes de confirmar la compra.'], ['Personalicen y compartan.', 'Sus textos, fotos e invitados, con un enlace para cada familia.']],
    termsLabel: 'Condiciones.', terms: '10% de descuento en la primera compra de una invitación de la colección. Un uso por cliente. No acumulable con otras promociones.',
    questions: '¿Preguntas? Respondan a este correo o escríbannos a', why: 'Reciben este correo porque se suscribieron a los correos de marketing de Invitesse en invitesse.com.',
    leave: 'Darse de baja', privacy: 'Política de privacidad', shop: '/disenos/', privacyPath: '/privacidad/#marketing',
  },
  en: {
    subject: 'Your 10% welcome gift · Invitesse',
    preheader: 'Your code INVITESSE10 for your first invitation.',
    kicker: 'Welcome to Invitesse', title: 'Your celebration', titleItalic: 'starts here.',
    intro: 'Thank you for subscribing. As promised, here is your welcome gift for your first wedding invitation.',
    card: 'Welcome card', forFirst: 'off your first invitation', yourCode: 'Your code', cta: 'Explore the designs', how: 'How to use it',
    steps: [['Choose your design.', 'Open the demos and explore each opening before deciding.'], ['Enter {code} at checkout.', 'The discount is applied before you confirm the purchase.'], ['Personalize and share.', 'Your texts, photos and guests, with a link for each family.']],
    termsLabel: 'Terms.', terms: '10% off the first purchase of an invitation from the collection. One use per customer. Cannot be combined with other promotions.',
    questions: 'Questions? Reply to this email or write to', why: 'You receive this email because you subscribed to Invitesse marketing emails at invitesse.com.',
    leave: 'Unsubscribe', privacy: 'Privacy policy', shop: '/en/disenos/', privacyPath: '/en/privacy/#marketing',
  },
};

function welcome({ email, code, token, lang }) {
  const t = COPY[lang === 'en' ? 'en' : 'es'], link = unsubscribeUrl(token, lang), shop = SITE + t.shop, privacy = SITE + t.privacyPath;
  const e = escapeHtml, c = e(code);
  const steps = t.steps.map(([head, body], i) =>
    '<tr><td width="44" valign="top" style="padding:0 0 18px;font:italic 22px/1.2 ' + SERIF + ';color:#775932">0' + (i + 1) + '</td>' +
    '<td valign="top" style="padding:2px 0 18px;font:14px/1.6 ' + SANS + ';color:#655560"><b style="color:#352432;font-weight:600">' + e(head).replace('{code}', c) + '</b> ' + e(body) + '</td></tr>').join('');
  const html = '<!doctype html><html lang="' + (lang === 'en' ? 'en' : 'es') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>' + e(t.subject) + '</title>' +
    '<style>@media (max-width:520px){.px{padding-left:20px!important;padding-right:20px!important}.code{padding:12px 16px!important;font-size:18px!important}.pct{font-size:72px!important}}</style></head>' +
    '<body style="margin:0;padding:0;background:#F3EEE9">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + e(t.preheader) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EEE9"><tr><td align="center" style="padding:32px 12px">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #E4DCD8;border-radius:12px;border-collapse:separate;overflow:hidden">' +
    '<tr><td align="center" bgcolor="#241320" style="background:#241320;padding:30px 0;font:34px/1 ' + SERIF + ';letter-spacing:-1.5px;color:#F8F3EC">invitesse</td></tr>' +
    '<tr><td class="px" align="center" style="padding:48px 40px 8px">' +
    '<p style="margin:0 0 16px;font:bold 11px/1.6 ' + SANS + ';letter-spacing:2px;text-transform:uppercase;color:#775932">' + e(t.kicker) + '</p>' +
    '<h1 style="margin:0;font:normal 38px/1.15 ' + SERIF + ';color:#241320">' + e(t.title) + ' <i style="color:#77596D">' + e(t.titleItalic) + '</i></h1>' +
    '<p style="margin:18px auto 0;max-width:420px;font:15px/1.65 ' + SANS + ';color:#655560">' + e(t.intro) + '</p></td></tr>' +
    '<tr><td class="px" style="padding:32px 48px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EEE9;border-radius:6px"><tr><td style="padding:10px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #B7A38A"><tr><td style="padding:4px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #B7A38A"><tr><td align="center" style="padding:32px 20px 30px">' +
    '<p style="margin:0;font:bold 10px/1.6 ' + SANS + ';letter-spacing:2.2px;text-transform:uppercase;color:#775932">' + e(t.card) + '</p>' +
    '<p class="pct" style="margin:10px 0 0;font:italic 88px/1 ' + SERIF + ';letter-spacing:-3px;color:#674A60">10%</p>' +
    '<p style="margin:8px 0 0;font:19px/1.3 ' + SERIF + ';color:#352432">' + e(t.forFirst) + '</p>' +
    '<p style="margin:26px 0 8px;font:bold 10px/1.6 ' + SANS + ';letter-spacing:2px;text-transform:uppercase;color:#655560">' + e(t.yourCode) + '</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="code" style="padding:14px 26px;background:#ffffff;border:1px dashed #B7A38A;border-radius:6px;font:bold 22px/1 \'Courier New\',Courier,monospace;letter-spacing:3px;color:#241320">' + c + '</td></tr></table>' +
    '</td></tr></table></td></tr></table></td></tr></table></td></tr>' +
    '<tr><td align="center" style="padding:32px 40px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#241320" style="border-radius:999px"><a href="' + shop + '" style="display:inline-block;padding:16px 32px;font:14px/1 ' + SANS + ';color:#F8F3EC;text-decoration:none;border-radius:999px">' + e(t.cta) + '</a></td></tr></table></td></tr>' +
    '<tr><td class="px" style="padding:44px 48px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E4DCD8"><tr><td align="center" style="padding:32px 0 22px;font:24px/1.2 ' + SERIF + ';color:#241320">' + e(t.how) + '</td></tr></table>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + steps + '</table></td></tr>' +
    '<tr><td class="px" style="padding:18px 48px 44px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px 20px;background:#F8F3EC;border-radius:8px;font:12px/1.6 ' + SANS + ';color:#655560"><b style="color:#352432;font-weight:600">' + e(t.termsLabel) + '</b> ' + e(t.terms) + '</td></tr></table></td></tr>' +
    '</table>' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tr><td align="center" style="padding:28px 20px 0;font:12px/1.7 ' + SANS + ';color:#655560">' +
    e(t.questions) + ' <a href="mailto:hola@invitesse.com" style="color:#352432">hola@invitesse.com</a> · <a href="https://www.instagram.com/invitesse/" style="color:#352432">@invitesse</a><br><br>' +
    e(t.why) + '<br><a href="' + e(link) + '" style="color:#352432">' + e(t.leave) + '</a> · <a href="' + privacy + '" style="color:#352432">' + e(t.privacy) + '</a><br><br>Invitesse · Barranquilla, Colombia' +
    '</td></tr></table></td></tr></table></body></html>';
  const text = [t.kicker, '', t.title + ' ' + t.titleItalic, '', t.intro, '', t.yourCode + ': ' + code + ' — 10% ' + t.forFirst, '',
    t.how + ':', ...t.steps.map(([h, b], i) => (i + 1) + '. ' + h.replace('{code}', code) + ' ' + b), '', t.termsLabel + ' ' + t.terms, '', t.cta + ': ' + shop, '', '—', t.questions + ' hola@invitesse.com', t.why, t.leave + ': ' + link, 'Invitesse · Barranquilla, Colombia'].join('\n') + '\n';
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
    // configured() devuelve los nombres de lo que falta (nunca valores), visibles en los logs de Vercel.
    const missing = configured();
    if (missing.length) { console.error('invitesse.newsletter.not_configured missing=' + missing.join(',')); return res.status(503).json({ error: 'NOT_CONFIGURED' }); }
    let subscriber;
    try {
      subscriber = await subscribe({ email: q.email, lang: q.lang, consent: CONSENT[q.lang] });
    } catch (error) {
      if (/INVALID_EMAIL/.test(error && error.message)) return res.status(400).json({ error: 'INVALID_FIELD', field: 'email' });
      // INVITESSE10 inactivo o vencido: no se guarda nada ni se promete un código que no funciona.
      if (/OFFER_INACTIVE/.test(error && error.message)) { console.error('invitesse.newsletter.offer_inactive INVITESSE10'); return res.status(503).json({ error: 'NOT_CONFIGURED' }); }
      console.error('invitesse.newsletter.subscribe_failed ' + String(error && (error.code || error.message) || '').slice(0, 120));
      return res.status(503).json({ error: 'SEND_FAILED' });
    }
    if (subscriber.state === 'already') return res.status(409).json({ error: 'ALREADY_SUBSCRIBED' });
    try {
      await send(welcome(subscriber));
    } catch (error) {
      console.error('invitesse.newsletter.send_failed ' + String(error && error.message || '').slice(0, 60));
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
  configured: () => [
    !process.env.RESEND_API_KEY && 'RESEND_API_KEY',
    !sender() && 'NEWSLETTER_FROM',
    !(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && 'SUPABASE_URL',
    !process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_') && 'SUPABASE_SECRET_KEY',
  ].filter(Boolean),
  subscribe: ({ email, lang, consent }) => rpc('newsletter_subscribe', { requested_email: email, requested_lang: lang, requested_source: 'landing', requested_consent: consent }),
  confirmSent: (email) => rpc('newsletter_confirm_sent', { requested_email: email }),
  unsubscribe: (token) => rpc('newsletter_unsubscribe', { token }),
  send: sendWithResend,
});
module.exports.createHandler = createHandler;
module.exports.welcome = welcome;
