/* Catálogo de diseños: lo usan la landing (los destacados) y la galería (/disenos/, con filtros).
   Para sumar un diseño: agregar su entrada aquí (con sus etiquetas) y su plantilla en /demo/<id>/.
   featured: true → sale en la landing (se muestran los 3 primeros marcados, en el orden de la lista).
   Las etiquetas de cada filtro están en FILTERS; un diseño puede tener varias en cada grupo. */
(function () {
  var FILTERS = [
    { key: 'estilo', es: 'Estilo', en: 'Style', opts: [
      { id: 'elegante', es: 'Elegante', en: 'Elegant' },
      { id: 'romantico', es: 'Romántico', en: 'Romantic' },
      { id: 'moderno', es: 'Moderno', en: 'Modern' },
      { id: 'botanico', es: 'Botánico', en: 'Botanical' },
      { id: 'colorido', es: 'Colorido', en: 'Colorful' }
    ] },
    { key: 'lugar', es: 'Para una boda en', en: 'For a wedding at', opts: [
      { id: 'ciudad', es: 'Ciudad o salón', en: 'City or venue' },
      { id: 'campo', es: 'Jardín o campo', en: 'Garden or countryside' },
      { id: 'playa', es: 'Playa o destino', en: 'Beach or destination' }
    ] },
    { key: 'apertura', es: 'Apertura', en: 'Opening', opts: [
      { id: 'sobre', es: 'Sobre', en: 'Envelope' },
      { id: 'puertas', es: 'Puertas', en: 'Doors' },
      { id: 'pase', es: 'Pase de abordar', en: 'Boarding pass' },
      { id: 'medallon', es: 'Medallón', en: 'Medallion' },
      { id: 'carpeta', es: 'Carpeta', en: 'Folder' }
    ] },
    { key: 'tono', es: 'Colores', en: 'Colors', opts: [
      { id: 'claros', es: 'Claros', en: 'Light' },
      { id: 'oscuros', es: 'Oscuros', en: 'Dark' },
      { id: 'vivos', es: 'Vivos', en: 'Bright' }
    ] }
  ];

  var DESIGNS = [
    { id: 'jardin', featured: true, bg: '#DFE3D3', shadow: 'rgba(47,59,44,0.55)', img: ['/assets/jardin-sobre.jpg', '/assets/jardin-portada.jpg'],
      tags: { estilo: ['botanico', 'romantico'], lugar: ['campo'], apertura: ['sobre'], tono: ['claros'] },
      es: { name: 'Jardín', title: 'Diseño jardín', desc: 'Botánico y de papelería: llega en un sobre de semillas; al despegar la estampilla sale la tarjeta y nace un jardín. Adentro, flores en acuarela que crecen a medida que bajas.', opening: 'Apertura: sobre de semillas', colors: 'Hoja, lavanda o eucalipto', alt: ['Diseño jardín: sobre de semillas kraft con estampilla', 'Diseño jardín: portada con corona de flores en acuarela'] },
      en: { name: 'Garden', title: 'Garden', desc: 'Botanical stationery: it arrives in a seed packet; peel off the sticker, the card comes out and a garden blooms. Inside, watercolor flowers grow as you scroll.', opening: 'Opening: seed packet', colors: 'Leaf, lavender or eucalyptus', alt: ['Garden design: kraft seed packet with a sticker', 'Garden design: cover with a watercolor flower wreath'] } },
    { id: 'costa', featured: true, bg: '#D8E2EE', shadow: 'rgba(29,53,87,0.6)', img: ['/assets/costa-pase.jpg', '/assets/costa-portada.jpg'],
      tags: { estilo: ['colorido'], lugar: ['playa'], apertura: ['pase'], tono: ['vivos'] },
      es: { name: 'Costa', title: 'Diseño costa', desc: 'Para bodas destino: un pase de abordar que pierde el talón y un avión que despega. Azulejos, limones, postales con matasellos y un tablero de salidas para la cuenta regresiva.', opening: 'Apertura: pase de abordar', colors: 'Cobalto, verde agua o barro', alt: ['Diseño costa: pase de abordar sobre azulejos y limones', 'Diseño costa: portada con foto, estampilla y el mar en movimiento'] },
      en: { name: 'Coast', title: 'Coast', desc: 'For destination weddings: a boarding pass that loses its stub and a plane that takes off. Painted tiles, lemons, postmarked postcards and a departures board for the countdown.', opening: 'Opening: boarding pass', colors: 'Cobalt, sea green or clay', alt: ['Coast design: boarding pass over tiles and lemons', 'Coast design: cover with photo, stamp and a moving sea'] } },
    { id: 'rosa', featured: true, bg: '#EDE3D2', shadow: 'rgba(110,95,70,0.65)', img: ['/assets/romantico-sobre.jpg', '/assets/romantico-portada.jpg'],
      tags: { estilo: ['romantico', 'elegante'], lugar: ['ciudad', 'campo'], apertura: ['sobre'], tono: ['claros'] },
      es: { name: 'Romántico', title: 'Diseño romántico', desc: 'Champaña o rosa empolvado, damasco y un sobre lacrado que se abre al tocar el sello. Delicado y lleno de detalles dorados.', opening: 'Apertura: sobre lacrado', colors: 'Champaña o rosado', alt: ['Diseño romántico: sobre lacrado con sello dorado', 'Diseño romántico: portada con los nombres'] },
      en: { name: 'Romantic', title: 'Romantic', desc: 'Champagne or dusty rose, damask and a wax-sealed envelope that opens when guests tap the seal. Delicate, with golden details.', opening: 'Opening: wax-sealed envelope', colors: 'Champagne or blush', alt: ['Romantic design: wax-sealed envelope with a gold seal', 'Romantic design: cover with the couple’s names'] } },
    { id: 'aurelia', bg: '#ECE6DA', shadow: 'rgba(29,27,25,0.55)', img: ['/assets/aurelia-carpeta.jpg', '/assets/aurelia-portada.jpg'],
      tags: { estilo: ['elegante', 'moderno'], lugar: ['ciudad', 'campo'], apertura: ['carpeta'], tono: ['claros'] },
      es: { name: 'Aurelia', title: 'Diseño Aurelia', desc: 'Editorial y luminoso: blanco roto, tipografía Didot, filetes finos y detalles en pan de oro. Llega en una carpeta con monograma en relieve; al deslizar la faja dorada, se abre como un libro.', opening: 'Apertura: carpeta con faja', colors: 'Oro, plata u oro rosa', alt: ['Diseño aurelia: carpeta blanca con monograma en relieve y faja dorada', 'Diseño aurelia: portada editorial con los nombres en Didot'] },
      en: { name: 'Aurelia', title: 'Aurelia', desc: 'Editorial and luminous: off-white, Didot type, fine rules and gold-leaf details. It arrives in a folder with an embossed monogram; slide off the gold band and it opens like a book.', opening: 'Opening: folder with a band', colors: 'Gold, silver or rose gold', alt: ['Aurelia design: white folder with an embossed monogram and a gold band', 'Aurelia design: editorial cover with the names in Didot'] } },
    { id: 'gala', bg: '#2A2620', shadow: 'rgba(0,0,0,0.8)', img: ['/assets/gala-medallon.jpg', '/assets/gala-portada.jpg'],
      tags: { estilo: ['elegante'], lugar: ['ciudad'], apertura: ['medallon'], tono: ['oscuros'] },
      es: { name: 'Gala', title: 'Diseño gala', desc: 'Art déco de noche: terciopelo negro, oro y destellos. Al tocar el medallón estalla confeti dorado y la invitación se abre en círculo; los nombres aparecen letra por letra.', opening: 'Apertura: medallón dorado', colors: 'Negro, esmeralda o burdeos', alt: ['Diseño gala: medallón dorado sobre terciopelo negro', 'Diseño gala: portada art déco con arco dorado'] },
      en: { name: 'Gala', title: 'Gala', desc: 'Art deco by night: black velvet, gold and sparkles. Tap the medallion and gold confetti bursts as the invitation opens in a circle; the names appear letter by letter.', opening: 'Opening: gold medallion', colors: 'Black, emerald or burgundy', alt: ['Gala design: gold medallion on black velvet', 'Gala design: art deco cover with a gold arch'] } },
    { id: 'clasico', bg: '#D9DDD0', shadow: 'rgba(34,32,28,0.6)', img: ['/assets/clasico-sobre.jpg', '/assets/clasico-demo-portada.jpg'],
      tags: { estilo: ['elegante'], lugar: ['ciudad', 'campo'], apertura: ['sobre'], tono: ['claros', 'oscuros'] },
      es: { name: 'Clásico', title: 'Diseño clásico', desc: 'Verde salvia y marfil, nombres en serif grande y un sobre que se abre para mostrar una carta con el nombre de cada familia. Atemporal.', opening: 'Apertura: sobre con carta', colors: 'Paleta a elección', alt: ['Diseño clásico: sobre con sello verde para la familia invitada', 'Diseño clásico: portada con los nombres y foto en arco'] },
      en: { name: 'Classic', title: 'Classic', desc: 'Sage green and ivory, large serif names and an envelope that opens to reveal a letter addressed to each family. Timeless.', opening: 'Opening: envelope and letter', colors: 'Your palette', alt: ['Classic design: envelope with a green seal for the guest family', 'Classic design: cover with the names and an arched photo'] } },
    { id: 'moderno', bg: '#D6D6D2', shadow: 'rgba(0,0,0,0.7)', img: ['/assets/moderno-puertas.jpg', '/assets/moderno-demo-portada.jpg'],
      tags: { estilo: ['moderno'], lugar: ['ciudad'], apertura: ['puertas'], tono: ['oscuros', 'claros'] },
      es: { name: 'Moderno', title: 'Diseño moderno', desc: 'Editorial y por capítulos, en blanco y negro o en arena, oliva, azul marino o vino: las puertas se abren al tocar el sello y la invitación se recorre como una revista.', opening: 'Apertura: puertas', colors: '5 paletas', alt: ['Diseño moderno: puertas en blanco y negro con monograma y sello', 'Diseño moderno: portada con los nombres'] },
      en: { name: 'Modern', title: 'Modern', desc: 'Editorial and told in chapters, in black and white or in sand, olive, navy or wine: the doors open when guests tap the seal, and the invitation reads like a magazine.', opening: 'Opening: doors', colors: '5 palettes', alt: ['Modern design: black-and-white doors with a monogram and seal', 'Modern design: cover with the names'] } }
  ];

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var UI = { es: { demo: 'Ver demo', buy: 'Elegir este diseño', featured: 'Destacado' }, en: { demo: 'View demo', buy: 'Choose this design', featured: 'Featured' } };

  // Tarjeta de un diseño (el mismo estilo en la landing y en la galería).
  function card(d, lang, o) {
    var t = d[lang], u = UI[lang], base = lang === 'en' ? '/en' : '', o2 = o || {};
    var phone = function (i, w, extra, r) { return '<div style="width: ' + w + 'px; flex-shrink: 0; ' + extra + 'padding: ' + (i ? 6 : 7) + 'px; background: #1C1A17; border-radius: ' + (i ? 32 : 36) + 'px; box-shadow: 0 24px 50px -26px ' + d.shadow + '"><img src="' + d.img[i] + '" alt="' + esc(t.alt[i]) + '" loading="lazy" style="display: block; width: 100%; height: auto; aspect-ratio: 375 / 812; object-fit: cover; border-radius: ' + r + 'px"></div>'; };
    return '<article class="lz-card" data-id="' + d.id + '" style="background: #F5F2EA; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column">' +
      '<div style="position: relative; background: ' + d.bg + '; padding: 32px 12px 0; display: flex; justify-content: center; align-items: flex-start; gap: 14px; height: 380px; overflow: hidden">' +
        (o2.badge && d.featured ? '<span style="position: absolute; top: 14px; left: 14px; font-size: 12px; font-weight: 500; padding: 6px 11px; border-radius: 999px; background: #2B3A33; color: #F5F2EA">' + u.featured + '</span>' : '') +
        phone(0, 175, '', 29) + phone(1, 140, 'margin-top: 50px; ', 26) +
      '</div>' +
      '<div style="flex: 1; padding: 26px 28px 28px; display: flex; flex-direction: column; gap: 14px">' +
        '<h3 style="margin: 0; font-family: \'Cormorant Garamond\', serif; font-weight: 600; font-size: 36px; color: #2B3A33">' + esc(t.title) + '</h3>' +
        '<p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4A4640">' + esc(t.desc) + '</p>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 8px">' + [t.opening, t.colors].map(function (x) { return '<span style="font-size: 12px; padding: 6px 11px; border-radius: 999px; background: #EAE4D7; color: #4A4640">' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; padding-top: 6px"><a href="' + base + '/demo/' + d.id + '/" style="text-decoration: none; padding: 14px 26px; border-radius: 999px; border: 1px solid #22201C; color: #22201C; font-weight: 500; font-size: 15px">' + u.demo + '</a><a href="' + base + '/comprar/?diseno=' + d.id + '" style="text-decoration: none; padding: 14px 26px; border-radius: 999px; background: #2B3A33; color: #F5F2EA; font-weight: 500; font-size: 15px">' + u.buy + '</a></div>' +
      '</div>' +
    '</article>';
  }

  window.LazoCatalog = {
    designs: DESIGNS, filters: FILTERS, card: card,
    featured: function () { return DESIGNS.filter(function (d) { return d.featured; }).slice(0, 3); }
  };
})();
