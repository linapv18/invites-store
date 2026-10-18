/* The storefront uses native links to full demos; openings run only inside each demo. */
(function () {
  'use strict';
  var nav = document.querySelector('.top nav');
  var button = nav && nav.querySelector('.nav-toggle');
  if (!button) return;
  var narrow = matchMedia('(max-width:800px)');
  function setOpen(open, focus) {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? button.dataset.close : button.dataset.open);
    if (focus) button.focus();
  }
  button.addEventListener('click', function () { setOpen(button.getAttribute('aria-expanded') !== 'true'); });
  nav.querySelectorAll('.links a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) setOpen(false, true);
  });
  document.addEventListener('click', function (event) {
    if (nav.classList.contains('open') && !nav.contains(event.target)) setOpen(false);
  });
  narrow.addEventListener('change', function () { setOpen(false); });
})();
