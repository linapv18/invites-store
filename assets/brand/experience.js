/* Invitesse: motion follows the real product. No template or audio loads before a preview is requested. */
(function () {
  'use strict';
  var body = document.body, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!body.classList.contains('iv-home')) return;
  if ('IntersectionObserver' in window) {
    var hero = document.querySelector('.hero-visual');
    new IntersectionObserver(function (items) { items.forEach(function (item) { item.target.classList.toggle('is-in-view', item.isIntersecting); }); }).observe(hero);
    if (!reduced.matches) {
      body.classList.add('iv-motion-enabled');
      var reveal = new IntersectionObserver(function (items) {
        items.forEach(function (item) { if (item.isIntersecting) { item.target.classList.add('iv-visible'); reveal.unobserve(item.target); } });
      }, { rootMargin: '100px 0px', threshold: .05 });
      document.querySelectorAll('.dcard .ph,.tool .shot').forEach(function (item) { item.classList.add('iv-reveal'); reveal.observe(item); });
    }
  }
  document.addEventListener('visibilitychange', function () { document.documentElement.classList.toggle('iv-motion-paused', document.hidden); });
  var en = document.documentElement.lang === 'en', base = en ? '/en' : '';
  var S = en ? {
    label: 'A real invitation', text: 'Watch the actual opening, then scroll and explore the invitation. This preview is silent.',
    close: 'Close preview', replay: 'Replay opening', full: 'Open full demo', loading: 'Loading the design…',
    ready: 'Actual template · silent preview', fallback: 'The preview could not load. Open the full demo.', opening: 'The invitation is opening…'
  } : {
    label: 'Una invitación real', text: 'Miren cómo se abre y después recorran la invitación. Esta vista se reproduce sin sonido.',
    close: 'Cerrar vista previa', replay: 'Repetir apertura', full: 'Abrir demo completa', loading: 'Cargando el diseño…',
    ready: 'Plantilla real · vista sin sonido', fallback: 'No se pudo cargar la vista. Pueden abrir la demo completa.', opening: 'La invitación se está abriendo…'
  };
  var names = { encaje: 'Encaje', onix: 'Ónix', jardin: 'Jardín' };
  var dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return; // Native links still open each full demo.
  dialog.className = 'iv-preview'; dialog.setAttribute('aria-labelledby', 'ivPreviewTitle');
  dialog.innerHTML = '<button type="button" class="iv-preview-close" aria-label="' + S.close + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>' +
    '<div class="iv-preview-copy"><p class="k">' + S.label + '</p><h2 id="ivPreviewTitle"></h2><p>' + S.text + '</p><span class="iv-preview-status" role="status"></span></div>' +
    '<div class="iv-preview-mount"><div class="iv-preview-viewport"></div></div>' +
    '<div class="iv-preview-actions"><button type="button" disabled>' + S.replay + '</button><a>' + S.full + '</a></div>';
  document.body.appendChild(dialog);
  var mount = dialog.querySelector('.iv-preview-viewport'), frame, opener, id, version = 0, timers = [];
  var status = dialog.querySelector('.iv-preview-status'), replay = dialog.querySelector('.iv-preview-actions button');
  // Desktop actions share the left column, mobile actions follow the actual preview.
  function positionActions() {
    var actions = dialog.querySelector('.iv-preview-actions');
    if (innerWidth > 720) dialog.querySelector('.iv-preview-copy').appendChild(actions); else dialog.appendChild(actions);
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function size() {
    if (!dialog.open) return;
    positionActions();
    var mobile = innerWidth <= 720, availableH = Math.max(160, innerHeight - (mobile ? 240 : 100));
    var availableW = Math.min(390, innerWidth - (mobile ? 72 : 340));
    var scale = Math.max(.25, Math.min(availableW / 390, availableH / 780));
    mount.style.width = (390 * scale) + 'px'; mount.style.height = (780 * scale) + 'px';
    if (frame) { frame.style.width = '390px'; frame.style.height = '780px'; frame.style.transform = 'scale(' + scale + ')'; }
  }
  function start() {
    if (!frame || !frame.contentWindow || !frame.contentWindow.LzTemplate) return;
    clearTimers();
    var w = frame.contentWindow, doc = w.document, token = version;
    w.LzTemplate.envelope(); w.scrollTo(0, 0);
    status.textContent = S.opening;
    later(function () {
      if (!dialog.open || token !== version) return;
      if (id === 'jardin') {
        doc.getElementById('sticker').click();
        later(function () { if (dialog.open && token === version) doc.getElementById('enter').click(); }, reduced.matches ? 350 : 1950);
      } else {
        var trigger = doc.getElementById('enter'); if (trigger) trigger.click();
      }
      later(function () { if (dialog.open && token === version) status.textContent = S.ready; }, reduced.matches ? 600 : 4600);
    }, reduced.matches ? 100 : 450);
  }
  function openPreview(design, from) {
    if (!names[design]) return;
    clearTimers(); version++; id = design; opener = from;
    if (frame) frame.remove();
    replay.disabled = true; status.textContent = S.loading;
    dialog.querySelector('h2').textContent = names[id];
    dialog.querySelector('.iv-preview-actions a').href = base + '/demo/' + id + '/';
    frame = document.createElement('iframe');
    frame.title = names[id] + ' · ' + S.label;
    frame.setAttribute('allow', "autoplay 'none'");
    var token = version;
    frame.addEventListener('load', function () {
      if (!dialog.open || token !== version) return;
      try {
        var w = frame.contentWindow, doc = w.document;
        if (w.location.href === 'about:blank') return;
        if (!w.LzTemplate) { status.textContent = S.fallback; return; }
        if (w.LazoMusic) { w.LazoMusic.suspend(); w.LazoMusic.play = function () {}; w.LazoMusic.resume = function () {}; }
        var style = doc.createElement('style');
        style.textContent = '.lz-explore,.lz-music,.demo-bar{display:none!important}';
        doc.head.appendChild(style);
        doc.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); dialog.close(); } });
        replay.disabled = false;
        start();
      } catch (error) { status.textContent = S.fallback; }
    });
    mount.appendChild(frame);
    body.classList.add('iv-preview-open');
    if (!dialog.open) dialog.showModal();
    size(); frame.src = base + '/demo/' + id + '/?preview=invitesse';
    dialog.querySelector('.iv-preview-close').focus();
    later(function () { if (dialog.open && token === version && replay.disabled) status.textContent = S.fallback; }, 15000);
  }
  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-preview]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0 || !names[link.dataset.preview]) return;
    event.preventDefault(); openPreview(link.dataset.preview, link);
  });
  replay.addEventListener('click', start);
  dialog.querySelector('.iv-preview-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', function () {
    version++; clearTimers();
    try { if (frame && frame.contentWindow.LazoMusic) frame.contentWindow.LazoMusic.suspend(); } catch (error) {}
    if (frame) { frame.remove(); frame = null; }
    body.classList.remove('iv-preview-open');
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('resize', size);
})();
