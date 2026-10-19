// Solicitud de cotización de un diseño a medida (/cotizar/ y /en/quote/).
// Valida el formulario y lo envía por correo a hola@invitesse.com con Resend; la respuesta va al correo de la pareja.
// No guarda nada: el correo es el registro. Variables en Vercel: RESEND_API_KEY (obligatoria),
// QUOTE_TO (por defecto hola@invitesse.com) y QUOTE_FROM (remitente de un dominio verificado en Resend).
const LIMITS = { names: 120, email: 254, phone: 40, date: 60, place: 120, vision: 3000, why: 1500, refs: 600 };
const INTERESTS = {
  opening: ['Apertura propia', 'Custom opening'],
  venue: ['Ilustración del lugar', 'Venue illustration'],
  monogram: ['Monograma o sello propio', 'Custom monogram or seal'],
  palette: ['Paleta y tipografía propias', 'Custom palette and type'],
  bilingual: ['Invitación bilingüe', 'Bilingual invitation'],
  events: ['Varios eventos', 'Several events'],
};
const MIN_FILL_MS = 3000;

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim() : '').slice(0, max);
const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function parse(body) {
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { return null; } }
  if (!body || typeof body !== 'object') return null;
  const q = {};
  for (const k of Object.keys(LIMITS)) q[k] = clean(body[k], LIMITS[k]);
  q.names = oneLine(q.names); q.email = oneLine(q.email); q.phone = oneLine(q.phone); q.date = oneLine(q.date); q.place = oneLine(q.place);
  q.lang = body.lang === 'en' ? 'en' : 'es';
  q.interests = Array.isArray(body.interests) ? [...new Set(body.interests.filter((i) => Object.hasOwn(INTERESTS, i)))] : [];
  q.consent = body.consent === true;
  q.website = clean(body.website, 200);
  q.startedAt = Number(body.startedAt) || 0;
  return q;
}

function invalid(q) {
  if (!q.names) return 'names';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(q.email)) return 'email';
  if (q.vision.length < 20) return 'vision';
  if (q.why.length < 10) return 'why';
  if (!q.consent) return 'consent';
  return '';
}

function message(q) {
  const rows = [
    ['Pareja', q.names], ['Correo', q.email], ['WhatsApp', q.phone], ['Fecha', q.date], ['Lugar', q.place],
    ['Les interesa', q.interests.map((i) => INTERESTS[i][0]).join(', ')], ['Idioma de la página', q.lang === 'en' ? 'Inglés' : 'Español'],
  ].filter((r) => r[1]);
  const blocks = [['Qué buscan para su invitación', q.vision], ['Por qué la quieren a la medida', q.why], ['Referencias', q.refs]].filter((b) => b[1]);
  const text = rows.map((r) => r[0] + ': ' + r[1]).join('\n') + '\n\n' + blocks.map((b) => b[0] + ':\n' + b[1]).join('\n\n') + '\n';
  const html = '<table cellpadding="4" style="font:14px/1.5 sans-serif;color:#352432">' +
    rows.map((r) => '<tr><td style="color:#71616B;vertical-align:top">' + escapeHtml(r[0]) + '</td><td>' + escapeHtml(r[1]) + '</td></tr>').join('') + '</table>' +
    blocks.map((b) => '<h3 style="font:600 14px sans-serif;color:#352432;margin:20px 0 6px">' + escapeHtml(b[0]) + '</h3><p style="font:14px/1.6 sans-serif;color:#352432;white-space:pre-wrap;margin:0">' + escapeHtml(b[1]) + '</p>').join('');
  return { subject: 'Cotización a medida · ' + q.names, text, html, replyTo: q.email };
}

function createHandler({ send, now = Date.now }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' }); }
    // Solo desde el propio sitio: el navegador envía Origin en un POST con fetch.
    const origin = req.headers && req.headers.origin;
    if (origin) { try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'FORBIDDEN' }); } catch (_) { return res.status(403).json({ error: 'FORBIDDEN' }); } }
    const q = parse(req.body);
    if (!q) return res.status(400).json({ error: 'INVALID_REQUEST' });
    // Trampa para bots: un campo oculto relleno o un envío demasiado rápido se acepta sin enviar nada.
    if (q.website || !q.startedAt || now() - q.startedAt < MIN_FILL_MS) return res.status(200).json({ ok: true });
    const field = invalid(q);
    if (field) return res.status(400).json({ error: 'INVALID_FIELD', field });
    try {
      await send(message(q));
      return res.status(200).json({ ok: true });
    } catch (_) {
      return res.status(503).json({ error: 'SEND_FAILED' });
    }
  };
}

async function sendWithResend(m) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('SERVER_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM || 'Invitesse <cotizaciones@invitesse.com>',
      to: [process.env.QUOTE_TO || 'hola@invitesse.com'],
      reply_to: m.replyTo, subject: m.subject, text: m.text, html: m.html,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('RESEND_' + response.status);
}

module.exports = createHandler({ send: sendWithResend });
module.exports.createHandler = createHandler;
