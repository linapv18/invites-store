import assert from 'node:assert/strict';
import { canMeasure, metricEvent } from '../lib/vitals.mjs';

const events = [];
const scope = {
  location: { origin: 'https://www.invitesse.com', pathname: '/cotizar/', search: '?email=private@example.invalid', hash: '#secret' },
  document: { body: { hasAttribute: () => true } },
  navigator: {},
  localStorage: { getItem: () => JSON.stringify({ version: 1, analytics: true, at: Date.now() }) },
  gtag: (...args) => events.push(args)
};
scope.top = scope.self = scope;
assert.equal(canMeasure(scope), true);
metricEvent({ name: 'LCP', value: 2050, delta: 2050, rating: 'good', navigationType: 'navigate', entries: [{ element: 'private-selector', url: 'https://private.invalid/token' }] }, scope);
assert.equal(events.length, 1);
assert.equal(events[0][2].metric_value, 2050);
assert.equal(events[0][2].page_location, 'https://www.invitesse.com/cotizar/');
assert.ok(!/private|secret|token/.test(JSON.stringify(events)));
for (const pathname of ['/demo/rosa/', '/en/demo/nacar/', '/editor/', '/en/account/', '/cuenta/', '/comprar/', '/en/editor/pago/', '/privacidad/']) {
  scope.location.pathname = pathname;
  metricEvent({ name: 'CLS', value: 0.03, delta: 0.03 }, scope);
  assert.equal(canMeasure(scope), false, pathname);
}
assert.equal(events.length, 1);
scope.location.pathname = '/disenos/';
scope.localStorage.getItem = () => JSON.stringify({ version: 1, analytics: false, at: Date.now() });
assert.equal(canMeasure(scope), false);
metricEvent({ name: 'INP', value: 100, delta: 100 }, scope);
assert.equal(events.length, 1);
scope.localStorage.getItem = () => JSON.stringify({ version: 1, analytics: true, at: Date.now() - 181 * 86400000 });
assert.equal(canMeasure(scope), false);
scope.localStorage.getItem = () => JSON.stringify({ version: 1, analytics: true, at: Date.now() });
scope.navigator.globalPrivacyControl = true;
assert.equal(canMeasure(scope), false);
scope.navigator.globalPrivacyControl = false;
scope.top = {};
assert.equal(canMeasure(scope), false);
