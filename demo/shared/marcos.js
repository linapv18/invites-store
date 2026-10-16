/* Marcos dibujados a la medida del contenido, compartidos por Cisne, Tinta y Glicina.
   Un elemento con data-frame="cs-scal|tt-blob|gl-heart" recibe un <svg class="fr"> del tamaño real del
   bloque; si el texto del editor lo hace crecer, el marco se vuelve a dibujar (ResizeObserver).
   Cada plantilla pone en su HTML los filtros y degradados que usa (lzPaper, csSheen, glLaceSh, glNet).
   Se carga después de que la plantilla arma su HTML y antes de demo/shared/content.js. */
(function () {
  'use strict';
  var f1 = function (v) { return v.toFixed(1); };
  var rng = function (seed) { var r = seed; return function () { return (r = (r * 9301 + 49297) % 233280) / 233280; }; };
  var ell = function (cx, cy, rx, ry) { return 'M' + cx + ' ' + (cy - ry) + 'A' + rx + ' ' + ry + ' 0 1 1 ' + cx + ' ' + (cy + ry) + 'A' + rx + ' ' + ry + ' 0 1 1 ' + cx + ' ' + (cy - ry) + 'Z'; };
  function heartD(x, y, W, H) {
    return 'M' + (x + W / 2) + ' ' + (y + H * .97) + 'C' + (x + W * .06) + ' ' + (y + H * .66) + ' ' + (x - W * .02) + ' ' + (y + H * .3) + ' ' + (x + W * .18) + ' ' + (y + H * .1) +
      'C' + (x + W * .32) + ' ' + (y - H * .01) + ' ' + (x + W * .46) + ' ' + (y + H * .05) + ' ' + (x + W / 2) + ' ' + (y + H * .2) +
      'C' + (x + W * .54) + ' ' + (y + H * .05) + ' ' + (x + W * .68) + ' ' + (y - H * .01) + ' ' + (x + W * .82) + ' ' + (y + H * .1) +
      'C' + (x + W * 1.02) + ' ' + (y + H * .3) + ' ' + (x + W * .94) + ' ' + (y + H * .66) + ' ' + (x + W / 2) + ' ' + (y + H * .97) + 'Z';
  }
  var se = function (v, n) { return Math.sign(v) * Math.pow(Math.abs(v), 2 / n); };
  // Trazo a mano alzada: rectángulo redondeado (n alto) o elipse (n = 2) que se pasa un poco al cerrar.
  function wobble(w, h, n, seed, pad, over, grow) {
    pad = pad == null ? 5 : pad; over = over == null ? .5 : over; grow = grow || 0;
    var Q = rng(seed), a = Q() * 6, b = Q() * 6, N = 96, pts = [];
    for (var k = 0; k <= N; k++) {
      var t = -.35 + k / N * (Math.PI * 2 + over), g = 1 + grow * k / N;
      pts.push(f1(w / 2 + (w / 2 - pad) * se(Math.cos(t), n) * (1 + .014 * Math.sin(4 * t + a)) * g) + ' ' + f1(h / 2 + (h / 2 - pad) * se(Math.sin(t), n) * (1 + .022 * Math.sin(3 * t + b)) * g));
    }
    return 'M' + pts.join('L');
  }
  // Silueta troquelada: esquinas cóncavas y un arco suave al centro de cada lado; a = cuánto se mete hacia adentro.
  function ogee(w, h, a) {
    var m = 12, r = 18, B = 10, B2 = 6, T = m + a, L = m + a, R = w - m - a, D = h - m - a, cx = w / 2, cy = h / 2, rho = r + a, k = Math.sqrt(rho * rho - a * a);
    var hw = Math.min(48, (R - L) / 2 - k - 8), hh = Math.min(42, (D - T) / 2 - k - 8), n = f1;
    return 'M' + n(m + k) + ' ' + n(T) + 'H' + n(cx - hw) + 'C' + n(cx - hw * .45) + ' ' + n(T) + ' ' + n(cx - hw * .4) + ' ' + n(T - B) + ' ' + n(cx) + ' ' + n(T - B) + 'C' + n(cx + hw * .4) + ' ' + n(T - B) + ' ' + n(cx + hw * .45) + ' ' + n(T) + ' ' + n(cx + hw) + ' ' + n(T) + 'H' + n(w - m - k) + 'A' + n(rho) + ' ' + n(rho) + ' 0 0 0 ' + n(R) + ' ' + n(m + k) +
      'V' + n(cy - hh) + 'C' + n(R) + ' ' + n(cy - hh * .45) + ' ' + n(R + B2) + ' ' + n(cy - hh * .4) + ' ' + n(R + B2) + ' ' + n(cy) + 'C' + n(R + B2) + ' ' + n(cy + hh * .4) + ' ' + n(R) + ' ' + n(cy + hh * .45) + ' ' + n(R) + ' ' + n(cy + hh) + 'V' + n(h - m - k) + 'A' + n(rho) + ' ' + n(rho) + ' 0 0 0 ' + n(w - m - k) + ' ' + n(D) +
      'H' + n(cx + hw) + 'C' + n(cx + hw * .45) + ' ' + n(D) + ' ' + n(cx + hw * .4) + ' ' + n(D + B) + ' ' + n(cx) + ' ' + n(D + B) + 'C' + n(cx - hw * .4) + ' ' + n(D + B) + ' ' + n(cx - hw * .45) + ' ' + n(D) + ' ' + n(cx - hw) + ' ' + n(D) + 'H' + n(m + k) + 'A' + n(rho) + ' ' + n(rho) + ' 0 0 0 ' + n(L) + ' ' + n(h - m - k) +
      'V' + n(cy + hh) + 'C' + n(L) + ' ' + n(cy + hh * .45) + ' ' + n(L - B2) + ' ' + n(cy + hh * .4) + ' ' + n(L - B2) + ' ' + n(cy) + 'C' + n(L - B2) + ' ' + n(cy - hh * .4) + ' ' + n(L) + ' ' + n(cy - hh * .45) + ' ' + n(L) + ' ' + n(cy - hh) + 'V' + n(m + k) + 'A' + n(rho) + ' ' + n(rho) + ' 0 0 0 ' + n(m + k) + ' ' + n(T) + 'Z';
  }
  // Encaje: festón con picots y una banda con calados (pétalos y ojales que dejan ver el fondo), red fina y relieve.
  var mp = null;
  function measurer() {
    if (mp) return mp;
    var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('aria-hidden', 'true'); sv.style.cssText = 'position:absolute;width:0;height:0';
    mp = document.createElementNS(sv.namespaceURI, 'path'); sv.appendChild(mp); document.body.appendChild(sv); return mp;
  }
  function samplePath(d, m) {
    var p = measurer(); p.setAttribute('d', d);
    var L = p.getTotalLength(), at = function (u) { return p.getPointAtLength(((u % L) + L) % L); }, pts = [], A = 0, i;
    for (i = 0; i < m; i++) { var a = at(i / m * L), b = at((i + .3) / m * L), c = at((i - .3) / m * L); pts.push({ x: a.x, y: a.y, tx: b.x - c.x, ty: b.y - c.y }); }
    pts.forEach(function (q, i) { var r = pts[(i + 1) % m]; A += q.x * r.y - r.x * q.y; });
    var sg = A >= 0 ? 1 : -1; // normal hacia afuera según el sentido del trazo
    pts.forEach(function (q) { var l = Math.hypot(q.tx, q.ty) || 1; q.nx = sg * q.ty / l; q.ny = -sg * q.tx / l; });
    return pts;
  }
  var laceN = 0;
  function lace(d, o) {
    o = o || {};
    var band = o.band || 20, sp = o.sp || 14, dep = o.dep || 4.2, p = measurer(); p.setAttribute('d', d);
    var n = Math.max(8, Math.round(p.getTotalLength() / sp)), pts = samplePath(d, n * 2);
    var P = function (q, k) { return f1(q.x + q.nx * k) + ' ' + f1(q.y + q.ny * k); }, V = function (i) { return pts[(2 * i) % (2 * n)]; };
    var outer = 'M' + P(V(0), 0), inner = 'M' + P(V(0), -band), holes = '', thread = '', picots = '', cord = 'M' + P(pts[0], -band * .17), i;
    for (i = 0; i < n; i++) {
      var m = pts[2 * i + 1], v = V(i), ang = Math.atan2(m.ny, m.nx) * 180 / Math.PI, px = m.x - m.nx * band * .47, py = m.y - m.ny * band * .47;
      outer += 'Q' + P(m, dep * 2) + ' ' + P(V(i + 1), 0); inner += 'Q' + P(m, -band - 4.4) + ' ' + P(V(i + 1), -band);
      picots += '<circle cx="' + f1(m.x + m.nx * (dep + 1.5)) + '" cy="' + f1(m.y + m.ny * (dep + 1.5)) + '" r="1.1"/>';
      var petal = '<ellipse cx="' + f1(px) + '" cy="' + f1(py) + '" rx="' + f1(band * .22) + '" ry="' + f1(sp * .15) + '" transform="rotate(' + ang.toFixed(0) + ' ' + f1(px) + ' ' + f1(py) + ')"/>';
      holes += petal + '<circle cx="' + f1(v.x - v.nx * band * .47) + '" cy="' + f1(v.y - v.ny * band * .47) + '" r="1.4"/><circle cx="' + f1(m.x - m.nx * band * .86) + '" cy="' + f1(m.y - m.ny * band * .86) + '" r=".85"/>';
      thread += petal;
    }
    for (i = 1; i <= 2 * n; i++) cord += 'L' + P(pts[i % (2 * n)], -band * .17);
    var id = 'lzLace' + (laceN++);
    return '<defs><mask id="' + id + '"><path d="' + outer + 'Z" fill="#fff"/><path d="' + inner + 'Z" fill="#000"/><g fill="#000">' + holes + '</g></mask></defs>' +
      (o.fill ? '<path d="' + inner + 'Z" style="fill:' + o.fill + '"/>' : '') +
      '<g filter="url(#glLaceSh)"><g mask="url(#' + id + ')"><path d="' + outer + 'Z" style="fill:var(--lace)"/><path d="' + outer + 'Z" fill="url(#glNet)"/></g></g>' +
      '<g fill="none" stroke="#CDC5AB" stroke-width=".55">' + thread + '</g><path d="' + cord + 'Z" fill="none" stroke="#D3CCB4" stroke-width=".8"/>' +
      '<g style="fill:var(--lace)" filter="url(#glLaceSh)">' + picots + '</g>';
  }

  var KINDS = {
    // Cisne: tarjeta troquelada marfil con borde burdeos y filetes
    'cs-scal': function (w, h) { var O = function (a) { return ogee(w, h, a); }; return '<path d="' + O(0) + '" style="fill:var(--ivory)" filter="url(#lzPaper)"/><path d="' + O(0) + '" fill="url(#csSheen)"/><path d="' + O(2.5) + '" fill="none" style="stroke:var(--wine)" stroke-width="5"/><path d="' + O(.3) + '" fill="none" stroke="#3b202566" stroke-width=".6"/><path d="' + O(11) + '" fill="none" style="stroke:var(--wine)" stroke-width=".9"/><path d="' + O(14.5) + '" fill="none" style="stroke:var(--gold)" stroke-width=".7" stroke-dasharray="1 2.6" stroke-linecap="round"/>'; },
    // Cisne hero: softly shouldered crest, resized for editable names and dates.
    'cs-crest': function(w,h) {
      var path=function(i){var l=10+i,r=w-10-i,top=22+i,b=h-10-i,c=w/2,s=Math.min(48,w*.14);return 'M'+l+' '+(top+44)+'Q'+l+' '+top+' '+(l+s)+' '+top+'H'+(c-s)+'Q'+c+' '+(-14+i)+' '+(c+s)+' '+top+'H'+(r-s)+'Q'+r+' '+top+' '+r+' '+(top+44)+'V'+(b-38)+'Q'+r+' '+b+' '+(r-36)+' '+b+'H'+(l+36)+'Q'+l+' '+b+' '+l+' '+(b-38)+'Z';};
      return '<path d="'+path(0)+'" style="fill:var(--wine)" filter="url(#lzPaper)"/><path d="'+path(3)+'" fill="none" style="stroke:var(--gold)" stroke-width="1.3"/><path d="'+path(9)+'" fill="none" style="stroke:var(--gold2)" stroke-width=".55" opacity=".65"/>';
    },
    // Tinta: globo dibujado a mano con tinta
    'tt-blob': function (w, h, el) { return '<path pathLength="1" d="' + wobble(w, h, 7, +(el.getAttribute('data-seed') || 3), 4, .55) + '" fill="none" style="stroke:var(--red)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>'; },
    // Glicina: corazón de encaje con la cita
    'gl-heart': function (w, h) { return lace(heartD(15, 15, w - 30, h - 30), { band: 18, sp: 13, fill: 'var(--sage)' }); }
  };
  function frame(el) {
    var w = el.offsetWidth, h = el.offsetHeight, k = el.getAttribute('data-frame');
    if (!w || !h || !KINDS[k] || el._fs === w + 'x' + h) return;
    el._fs = w + 'x' + h;
    var old = el.querySelector(':scope > .fr'); if (old) old.remove();
    el.insertAdjacentHTML('afterbegin', '<svg class="fr' + (k === 'tt-blob' ? ' draw' : '') + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' + KINDS[k](w, h, el) + '</svg>');
  }
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { frame(e.target); }); }) : null;
  function refresh(root) { (root || document).querySelectorAll('[data-frame]').forEach(function (el) { frame(el); if (ro) ro.observe(el); }); }
  refresh();
  // Las listas del editor (preguntas, eventos) se vuelven a armar con copias: sus marcos se dibujan de nuevo.
  document.addEventListener('lz-render', function (e) { refresh(e.target); });
  window.addEventListener('load', function () { refresh(); });

  window.LzMarcos = { rng: rng, f1: f1, ell: ell, wobble: wobble, refresh: refresh };
})();
