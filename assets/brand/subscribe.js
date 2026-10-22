/* Suscripción a correos de marketing del landing: envía el formulario a /api/suscripcion, que guarda el consentimiento
   y manda el código del 10% por correo. El mensaje de éxito solo aparece cuando el servidor confirma el envío.
   Los textos vienen del HTML (data-msg-*), para que cada idioma tenga los suyos. */
(function () {
  'use strict';
  var form = document.getElementById('subscribe');
  if (!form) return;
  var email = form.elements.email, consent = form.elements.consent, button = form.querySelector('.sub-submit');
  var label = button.querySelector('.sub-label'), idleLabel = label.textContent, alertBox = document.getElementById('sub-alert');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, busy = false;
  var msg = function (k) { return form.getAttribute('data-msg-' + k) || ''; };

  function fieldError(input, text) {
    var box = document.getElementById(input === email ? 'sub-email-error' : 'sub-consent-error');
    if (text) { box.textContent = text; box.hidden = false; input.setAttribute('aria-invalid', 'true'); }
    else { box.hidden = true; box.textContent = ''; input.removeAttribute('aria-invalid'); }
  }
  function notice(title, text, isError) {
    if (!title) { alertBox.hidden = true; return; }
    alertBox.querySelector('.sub-alert-title').textContent = title;
    alertBox.querySelector('.sub-alert-text').textContent = text;
    alertBox.classList.toggle('is-error', !!isError);
    alertBox.hidden = false;
    alertBox.focus();
  }
  function setBusy(on, text) {
    busy = on;
    button.setAttribute('aria-busy', String(on));
    email.readOnly = on;
    label.textContent = on ? msg('busy') : (text || idleLabel);
  }
  function emailProblem() {
    var v = email.value.trim();
    if (!v) return msg('email-empty');
    return EMAIL.test(v) ? '' : msg('email');
  }

  // Los errores aparecen al enviar (sin mover el formulario bajo el cursor) y se retiran en cuanto el dato es válido.
  email.addEventListener('input', function () { if (email.getAttribute('aria-invalid') && !emailProblem()) fieldError(email, ''); });
  consent.addEventListener('change', function () { if (consent.checked) fieldError(consent, ''); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (busy) return;
    notice('');
    var problem = emailProblem();
    fieldError(email, problem);
    fieldError(consent, consent.checked ? '' : msg('consent'));
    if (problem) return email.focus();
    if (!consent.checked) return consent.focus();
    var value = email.value.trim();
    setBusy(true);
    try {
      var r = await fetch('/api/suscripcion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, consent: true, website: form.elements.website.value, lang: document.documentElement.lang === 'en' ? 'en' : 'es' })
      });
      var body = await r.json().catch(function () { return {}; });
      if (r.ok && body.ok === true) {
        var done = document.getElementById('subscribe-done');
        done.querySelector('[data-email]').textContent = value;
        form.hidden = true; done.hidden = false; done.focus();
        // Solo el evento: el correo no se envía a la analítica.
        if (window.gtag) window.gtag('event', 'sign_up', { method: 'newsletter', page_location: location.origin + location.pathname, page_referrer: '' });
        return;
      }
      setBusy(false);
      if (body.error === 'INVALID_FIELD' && body.field === 'email') { fieldError(email, msg('email')); return email.focus(); }
      if (body.error === 'INVALID_FIELD' && body.field === 'consent') { fieldError(consent, msg('consent')); return consent.focus(); }
      if (body.error === 'ALREADY_SUBSCRIBED') return notice(msg('already-title'), msg('already'));
      if (body.error === 'NOT_CONFIGURED') return notice(msg('send-title'), msg('config'), true);
      setBusy(false, msg('retry'));
      notice(msg('send-title'), msg('send'), true);
    } catch (_) {
      setBusy(false, msg('retry'));
      notice(msg('send-title'), msg('send'), true);
    }
  });
})();
