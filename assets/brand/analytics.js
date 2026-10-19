/* Analítica de Invitesse: Microsoft Clarity (proyecto «Invitesse») y Google Analytics 4 (flujo web «Invitesse»).
   Se carga en la tienda, el catálogo, la compra y las demos.
   No va en el editor, el panel ni «Mi cuenta», donde los novios escriben datos personales de sus invitados.
   Tampoco corre dentro de un iframe (la vista previa de las demos en el inicio) para no contar visitas dobles. */
(function () {
  if (window.top !== window.self) return;
  var load = function (src) {
    var s = document.createElement('script'), y = document.getElementsByTagName('script')[0];
    s.async = true; s.src = src; y.parentNode.insertBefore(s, y);
  };

  // Microsoft Clarity
  window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
  load('https://www.clarity.ms/tag/yzwi7fw4jr');

  // Google Analytics 4 (gtag.js)
  var GA = 'G-2YPN2SZT3R';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA);
  load('https://www.googletagmanager.com/gtag/js?id=' + GA);
})();
