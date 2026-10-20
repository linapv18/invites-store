/* Public cards use the same server-selected currency as checkout. No client country guess. */
(function () {
  'use strict';
  var label = '';
  function update(root) {
    if (!label || !root.querySelectorAll) return;
    var nodes = Array.prototype.slice.call(root.querySelectorAll('.lz-price'));
    if (root.matches && root.matches('.lz-price')) nodes.unshift(root);
    nodes.forEach(function (node) { if (node.textContent !== label) node.textContent = label; node.hidden = false; });
  }
  new MutationObserver(function (records) {
    records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType === 1) update(node); }); });
  }).observe(document.body, { childList: true, subtree: true });
  fetch('/api/checkout/', { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('PRICE_UNAVAILABLE');
    return response.json();
  }).then(function (price) {
    if (price.currency === 'COP' && price.amount === 200000) label = 'COP $200.000';
    else if (price.currency === 'USD' && price.amount === 79) label = 'USD $79';
    if (label) update(document);
  }).catch(function () { /* Leave the price hidden rather than show another market's amount. */ });
})();
