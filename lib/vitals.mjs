import { onCLS, onINP, onLCP } from 'web-vitals';

// Only the public storefront participates, and only while optional analytics is
// allowed. Never collect DOM selectors, query strings, fragments or user content.
export function canMeasure(scope = window) {
  try {
    const path = scope.location.pathname.replace(/\/+$/, '') || '/';
    if (scope.top !== scope.self || scope.navigator.globalPrivacyControl === true) return false;
    if (/^\/(?:en\/)?(?:demo|editor|cuenta|account|comprar|invitacion)(?:\/|$)/.test(path)) return false;
    if (['/privacidad', '/condiciones', '/en/privacy', '/en/terms'].includes(path)) return false;
    if (!scope.document.body.hasAttribute('data-marketing-page')) return false;
    const consent = JSON.parse(scope.localStorage.getItem('invitesse.privacy.v1'));
    const age = Date.now() - consent.at;
    return consent.version === 1 && consent.analytics === true && Number.isFinite(consent.at) && Number.isFinite(age) && age >= 0 && age < 180 * 86400000;
  } catch { return false; }
}

export function metricEvent(metric, scope = window) {
  if (!canMeasure(scope) || typeof scope.gtag !== 'function') return;
  const { name, value, delta, rating, navigationType } = metric;
  if (!['LCP', 'INP', 'CLS'].includes(name) || !Number.isFinite(value) || !Number.isFinite(delta)) return;
  scope.gtag('event', 'web_vital', {
    metric_name: name,
    metric_value: value,
    metric_delta: delta,
    metric_rating: rating,
    navigation_type: navigationType,
    page_location: scope.location.origin + scope.location.pathname,
    page_referrer: '',
    non_interaction: true
  });
}

if (typeof window !== 'undefined' && canMeasure()) {
  onCLS(metricEvent);
  onINP(metricEvent);
  onLCP(metricEvent);
}
