/* Microsoft Clarity (proyecto «Invitesse»). Se carga en la tienda, el catálogo, la compra y las demos.
   No va en el editor, el panel ni «Mi cuenta», donde los novios escriben datos personales de sus invitados.
   Tampoco corre dentro de un iframe (la vista previa de las demos en el inicio) para no contar visitas dobles. */
(function (c, l, a, r, i, t, y) {
  if (window.top !== window.self) return;
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
  y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, 'clarity', 'script', 'yzwi7fw4jr');
