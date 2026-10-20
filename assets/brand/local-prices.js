/* Public cards use the same server-selected currency as checkout. No client country guess. */
(function () {
  'use strict';
  var prices = null;
  function update(root) {
    if (!prices || !root.querySelectorAll) return;
    var nodes = Array.prototype.slice.call(root.querySelectorAll('.lz-price'));
    if (root.matches && root.matches('.lz-price')) nodes.unshift(root);
    nodes.forEach(function (node) {
      var card=node.closest('.lz-card'),design=card?.dataset.id;
      if(!design){var link=card?.querySelector('.lz-buy');if(link)design=new URL(link.href).searchParams.get('diseno');}
      var price=prices[design];if(!price)return;
      var label=price.currency+' $'+new Intl.NumberFormat(price.currency==='COP'?'es-CO':'en-US').format(price.amount);
      if(node.textContent!==label)node.textContent=label;node.hidden=false;
    });
  }
  new MutationObserver(function (records) {
    records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType === 1) update(node); }); });
  }).observe(document.body, { childList: true, subtree: true });
  fetch('/api/checkout/', { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('PRICE_UNAVAILABLE');
    return response.json();
  }).then(function (price) {
    prices=price.prices;
    if(prices)update(document);
  }).catch(function () { /* Leave the price hidden rather than show another market's amount. */ });
})();
