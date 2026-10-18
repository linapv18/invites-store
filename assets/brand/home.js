/* Invitesse · inicio: menú, barra fija del celular, apertura del hero, recorrido del panel y complementos.
   Todo el texto está en el HTML; aquí solo se cambian clases y atributos. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* Cuántos diseños hay (sale del catálogo, así no queda desactualizado). */
  var C = window.LazoCatalog;
  if (C) document.querySelectorAll('[data-n]').forEach(function (e) { e.textContent = C.designs.length; });

  /* Menú del celular. */
  var nav = document.querySelector('.top nav'), btn = nav && nav.querySelector('.nav-toggle');
  if (btn) {
    var set = function (o) { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); btn.setAttribute('aria-label', o ? btn.dataset.close : btn.dataset.open); };
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.querySelectorAll('.links a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); } });
  }

  /* Hero: el estor de Encaje sube y deja ver la portada, como en la demo. Solo con un gesto. */
  var hero = document.getElementById('top'), toggle = hero && hero.querySelector('.toggle');
  if (toggle) {
    var label = toggle.querySelector('span');
    toggle.addEventListener('click', function () {
      var open = !hero.classList.contains('is-opening') && !hero.classList.contains('is-open');
      hero.classList.toggle('is-opening', open);
      hero.classList.remove('is-open');
      if (open) setTimeout(function () { if (hero.classList.contains('is-opening')) { hero.classList.remove('is-opening'); hero.classList.add('is-open'); } }, reduced.matches ? 250 : 1600);
      toggle.setAttribute('aria-pressed', String(open));
      label.textContent = open ? toggle.dataset.closeLabel : toggle.dataset.openLabel;
    });
  }

  /* Barra fija en el celular: aparece al pasar la portada y se esconde en el cierre. */
  var bar = document.getElementById('sticky'), end = document.getElementById('contacto');
  if (bar && hero && end && 'IntersectionObserver' in window) {
    document.body.classList.add('has-sticky');
    var past = false, atEnd = false, up = function () { bar.classList.toggle('on', past && !atEnd); };
    new IntersectionObserver(function (e) { past = !e[0].isIntersecting; up(); }).observe(hero);
    new IntersectionObserver(function (e) { atEnd = e[0].isIntersecting; up(); }).observe(end);
  }

  /* Recorrido del panel: invitación → confirmación → panel, una sola vez, 3 pasos de 700 ms. */
  var journey = document.querySelector('.journey');
  if (journey && !reduced.matches && 'IntersectionObserver' in window && matchMedia('(min-width: 961px)').matches) {
    var stations = journey.querySelectorAll('.station');
    var play = function () {
      journey.classList.add('is-playing');
      stations[0].classList.add('lit');
      setTimeout(function () { journey.classList.add('step-2'); stations[1].classList.add('lit'); }, 700);
      setTimeout(function () { journey.classList.add('step-3'); stations[2].classList.add('lit'); }, 1400);
      setTimeout(function () { journey.classList.remove('is-playing', 'step-2', 'step-3'); stations.forEach(function (s) { s.classList.remove('lit'); }); }, 2400);
    };
    var seen = new IntersectionObserver(function (items) {
      if (items[0].isIntersecting) { seen.disconnect(); play(); }
    }, { threshold: .4 });
    seen.observe(journey);
  }

  /* Complementos: pestañas, flechas y deslizar. */
  var box = document.querySelector('[data-addons]');
  if (box) {
    var tabs = [].slice.call(box.querySelectorAll('.ad-tab')), mocks = [].slice.call(box.querySelectorAll('.ad-mock')), copies = [].slice.call(box.querySelectorAll('.ad-copy')), i = 0, n = tabs.length;
    var go = function (k, focus, scroll) {
      i = (k + n) % n;
      tabs.forEach(function (t, j) { var on = j === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
      mocks.forEach(function (m, j) { m.hidden = j !== i; }); copies.forEach(function (c, j) { c.hidden = j !== i; });
      if (focus) tabs[i].focus();
      if (scroll !== false) { var t = tabs[i], s = t.parentNode; if (s.scrollWidth > s.clientWidth) s.scrollTo({ left: t.offsetLeft - s.firstElementChild.offsetLeft, behavior: 'smooth' }); }
    };
    tabs.forEach(function (t, j) { t.addEventListener('click', function () { go(j); }); });
    box.querySelector('.ad-tabs').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1, true); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1, true); }
    });
    box.querySelector('[data-prev]').addEventListener('click', function () { go(i - 1); });
    box.querySelector('[data-next]').addEventListener('click', function () { go(i + 1); });
    var x0 = null, stage = box.querySelector('.ad-stage');
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); });
    go(0, false, false);
  }
})();
