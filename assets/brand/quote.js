/* Solicitud de cotización a medida: envía el formulario a /api/cotizacion, que lo manda por correo a hola@invitesse.com.
   Los textos de error y de confirmación vienen del HTML (data-msg-*), para que cada idioma tenga los suyos. */
(function () {
  'use strict';
  var form = document.getElementById('quote');
  if (!form) return;
  var startedAt = Date.now(), errorBox = form.querySelector('.qt-error'), button = form.querySelector('.qt-submit');
  var msg = function (k) { return form.getAttribute('data-msg-' + k) || ''; };
  function fail(text, field) {
    errorBox.textContent = text; errorBox.hidden = false;
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var el = field && form.elements[field];
    if (el && el.focus) { el.setAttribute('aria-invalid', 'true'); el.focus(); } else errorBox.focus();
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = form.elements, data = {
      names: f.names.value, email: f.email.value, vision: f.vision.value, consent: f.consent.checked, website: f.website.value,
      lang: document.documentElement.lang === 'en' ? 'en' : 'es', startedAt: startedAt
    };
    // Las mismas reglas que el servidor, para avisar sin esperar la respuesta.
    if (!data.names.trim()) return fail(msg('names'), 'names');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) return fail(msg('email'), 'email');
    if (data.vision.trim().length < 20) return fail(msg('vision'), 'vision');
    if (!data.consent) return fail(msg('consent'), 'consent');
    errorBox.hidden = true; button.disabled = true; button.setAttribute('aria-busy', 'true');
    try {
      var r = await fetch('/api/cotizacion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var body = await r.json().catch(function () { return {}; });
      if (!r.ok) { button.disabled = false; button.removeAttribute('aria-busy'); return fail(body.field ? msg(body.field) : msg('send'), body.field); }
      var done = document.getElementById('quote-done');
      done.querySelector('[data-email]').textContent = data.email.trim();
      form.hidden = true; done.hidden = false; done.focus();
      if (window.gtag) window.gtag('event', 'generate_lead', { form: 'cotizacion' });
    } catch (_) {
      button.disabled = false; button.removeAttribute('aria-busy'); fail(msg('send'));
    }
  });
})();
