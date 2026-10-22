/* Basic, cookieless page counts. Separate from consent-based GA4 and Clarity. */
(function () {
  'use strict';
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var publicPage = document.body.hasAttribute('data-marketing-page') ||
    ['/', '/en', '/disenos', '/en/disenos', '/cotizar', '/en/quote', '/quiz', '/en/quiz'].includes(path);
  var excluded = /^\/(?:en\/)?(?:admin|panel|demo|editor|cuenta|account|comprar|invitacion|privacidad|privacy|condiciones|terms)(?:\/|$)/;
  if (window.top !== window.self || excluded.test(path) || !publicPage ||
      !['www.invitesse.com', 'invitesse.com'].includes(location.hostname) ||
      navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' ||
      document.querySelector('script[data-invitesse-visitors]')) return;

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va('beforeSend', function (event) {
    // Page counts only: never send custom events, URL tokens or form values.
    try {
      var url = new URL(event.url);
      if (event.type !== 'pageview' || url.origin !== location.origin || excluded.test(url.pathname)) return null;
      return { type: 'pageview', url: url.origin + url.pathname };
    } catch (_) { return null; }
  });
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  script.dataset.invitesseVisitors = 'true';
  document.head.appendChild(script);
})();
