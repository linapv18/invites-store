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
      { id: 'colorido', es: 'Colorido', en: 'Colorful' },
      { id: 'natural', es: 'Natural', en: 'Natural' },
      { id: 'mexicano', es: 'Mexicano', en: 'Mexican' }
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
      { id: 'carpeta', es: 'Carpeta', en: 'Folder' },
      { id: 'tarjetas', es: 'Juego de tarjetas', en: 'Card set' },
      { id: 'lazo', es: 'Lazo de seda', en: 'Silk bow' },
      { id: 'carta', es: 'Carta de lotería', en: 'Lotería card' },
      { id: 'luna', es: 'Luna', en: 'Moon' },
      { id: 'calendario', es: 'Calendario', en: 'Calendar' },
      { id: 'cortina', es: 'Cortina de flores', en: 'Flower curtain' },
      { id: 'funda', es: 'Funda de terciopelo', en: 'Velvet sleeve' }
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
    { id: 'lino', bg: '#DCD8CC', shadow: 'rgba(47,52,48,0.55)', img: ['/assets/lino-tarjetas.jpg', '/assets/lino-portada.jpg'],
      tags: { estilo: ['natural', 'botanico'], lugar: ['campo'], apertura: ['tarjetas'], tono: ['claros'] },
      es: { name: 'Lino', title: 'Diseño lino', desc: 'Natural y artesanal: fondo de lino, papel de algodón, fotos con esquineros y flores prensadas. Llega como un juego de tres tarjetas con faja de papel vegetal; al retirarla, se abren en abanico.', opening: 'Apertura: juego de tarjetas', colors: 'Salvia, arena o piedra', alt: ['Diseño lino: juego de tarjetas con faja de papel vegetal y lacre', 'Diseño lino: portada con foto con esquineros y flores prensadas'] },
      en: { name: 'Lino', title: 'Lino', desc: 'Natural and handmade: linen background, cotton paper, photo corners and pressed flowers. It arrives as a set of three cards with a vellum band; remove it and they fan out.', opening: 'Opening: card set', colors: 'Sage, sand or stone', alt: ['Lino design: card set with a vellum band and wax seal', 'Lino design: cover with photo corners and pressed flowers'] } },
    { id: 'noir', bg: '#1E1E1C', shadow: 'rgba(0,0,0,0.8)', img: ['/assets/noir-puerta.jpg', '/assets/noir-portada.jpg'],
      tags: { estilo: ['elegante', 'moderno'], lugar: ['ciudad'], apertura: ['puertas'], tono: ['oscuros'] },
      es: { name: 'Noir', title: 'Diseño noir', desc: 'Etiqueta negra: negro profundo, marfil y plata. Una tarjeta de puerta doble con el monograma en relieve; al quitar la faja de plata se abre hacia arriba y hacia abajo. Fotos en blanco y negro.', opening: 'Apertura: puerta doble', colors: 'Negro, verde bosque o medianoche', alt: ['Diseño noir: tarjeta negra con monograma en relieve y faja de plata', 'Diseño noir: portada con foto en blanco y negro'] },
      en: { name: 'Noir', title: 'Noir', desc: 'Black tie: deep black, ivory and silver. A double-door card with an embossed monogram; remove the silver band and it opens up and down. Black-and-white photos.', opening: 'Opening: double door', colors: 'Black, forest green or midnight', alt: ['Noir design: black card with an embossed monogram and a silver band', 'Noir design: cover with a black-and-white photo'] } },
    { id: 'marfil', bg: '#E6DFD1', shadow: 'rgba(58,44,26,0.55)', img: ['/assets/marfil-lazo.jpg', '/assets/marfil-portada.jpg'],
      tags: { estilo: ['elegante', 'romantico'], lugar: ['ciudad', 'campo'], apertura: ['lazo'], tono: ['claros'] },
      es: { name: 'Marfil', title: 'Diseño marfil', desc: 'Clásica y elegante: papel de algodón, filos dorados, caligrafía y un escudo de laurel. Llega envuelta en papel vegetal con un lazo de seda; al desatarlo, el papel se abre y los nombres se escriben solos.', opening: 'Apertura: lazo de seda', colors: 'Burdeos, azul noche o verde inglés', alt: ['Diseño marfil: tarjeta envuelta en papel vegetal con lazo de seda', 'Diseño marfil: portada con escudo de laurel y marco dorado'] },
      en: { name: 'Marfil', title: 'Marfil', desc: 'Classic and elegant: cotton paper, gilded edges, calligraphy and a laurel crest. It arrives wrapped in vellum with a silk bow; untie it, the vellum opens and the names write themselves.', opening: 'Opening: silk bow', colors: 'Burgundy, midnight blue or British green', alt: ['Marfil design: card wrapped in vellum with a silk bow', 'Marfil design: cover with a laurel crest and gold frame'] } },
    { id: 'celeste', bg: '#1A2448', shadow: 'rgba(0,0,0,0.75)', img: ['/assets/celeste-luna.jpg', '/assets/celeste-portada.jpg'],
      tags: { estilo: ['romantico'], lugar: ['playa', 'campo'], apertura: ['luna'], tono: ['oscuros'] },
      es: { name: 'Celeste', title: 'Diseño celeste', desc: 'Noche estrellada: nebulosas, estrellas que titilan y estrellas fugaces. Al tocar la luna, las estrellas forman un corazón. Adentro, la foto es una luna con órbitas y la cuenta regresiva son cuatro lunas.', opening: 'Apertura: luna y constelación', colors: 'Medianoche, aurora o lavanda', alt: ['Diseño celeste: luna sobre un cielo estrellado', 'Diseño celeste: portada con foto en órbita y nombres plateados'] },
      en: { name: 'Celeste', title: 'Celeste', desc: 'A starry night: nebulas, twinkling and shooting stars. Tap the moon and the stars form a heart. Inside, the photo is a moon with orbits and the countdown is four moons.', opening: 'Opening: moon and constellation', colors: 'Midnight, aurora or lavender', alt: ['Celeste design: moon over a starry sky', 'Celeste design: cover with an orbiting photo and silver names'] } },
    { id: 'fiesta', bg: '#FCE3C4', shadow: 'rgba(42,27,61,0.6)', img: ['/assets/fiesta-carta.jpg', '/assets/fiesta-portada.jpg'],
      tags: { estilo: ['colorido', 'mexicano'], lugar: ['campo', 'ciudad'], apertura: ['carta'], tono: ['vivos'] },
      es: { name: 'Fiesta', title: 'Diseño fiesta', desc: 'Alegre y muy mexicana: papel picado que ondea, una carta de lotería con un corazón en llamas y rayas de sarape. Al tocar la carta se voltea; al entrar, estalla el confeti.', opening: 'Apertura: carta de lotería', colors: 'Fiesta, pastel o rosa mexicano', alt: ['Diseño fiesta: carta de lotería entre papel picado', 'Diseño fiesta: portada con foto tipo carta de lotería'] },
      en: { name: 'Fiesta', title: 'Fiesta', desc: 'Joyful and very Mexican: fluttering papel picado, a lotería card with a flaming heart and sarape stripes. Tap the card and it flips; step inside and confetti bursts.', opening: 'Opening: lotería card', colors: 'Fiesta, pastel or Mexican pink', alt: ['Fiesta design: lotería card among papel picado', 'Fiesta design: cover with a lotería-card photo'] } },
    { id: 'cisne', bg: '#EDE6DA', shadow: 'rgba(59,32,37,0.55)', img: ['/assets/cisne-sobre.jpg', '/assets/cisne-portada.jpg'],
      tags: { estilo: ['elegante', 'romantico'], lugar: ['ciudad', 'campo'], apertura: ['sobre'], tono: ['oscuros'] },
      es: { name: 'Cisne', title: 'Diseño cisne', desc: 'Papelería fina en burdeos y oliva: un sobre con forro pintado y sello de lacre; al romperlo, la tarjeta de terciopelo sube entre rosas y calas. Adentro, polaroids, sellos de cera, una bandeja de plata con encaje y una llave con borla.', opening: 'Apertura: sobre con sello de lacre', colors: 'Burdeos y oliva', alt: ['Diseño cisne: sobre oliva cerrado con un sello de lacre', 'Diseño cisne: portada con tarjeta burdeos, flores y polaroid'] },
      en: { name: 'Cisne', title: 'Cisne', desc: 'Fine stationery in burgundy and olive: an envelope with a painted liner and a wax seal; break it and the velvet card rises among roses and calla lilies. Inside, polaroids, wax seals, a silver tray with lace and a key with a tassel.', opening: 'Opening: envelope with a wax seal', colors: 'Burgundy and olive', alt: ['Cisne design: olive envelope closed with a wax seal', 'Cisne design: cover with a burgundy card, flowers and a polaroid'] } },
    { id: 'tinta', bg: '#E9E4DB', shadow: 'rgba(43,40,37,0.55)', img: ['/assets/tinta-calendario.jpg', '/assets/tinta-portada.jpg'],
      tags: { estilo: ['moderno', 'romantico'], lugar: ['ciudad'], apertura: ['calendario'], tono: ['claros'] },
      es: { name: 'Tinta', title: 'Diseño tinta', desc: 'Editorial y moderna: papel crema, fotos en blanco y negro y tinta roja a mano. Al tocar la fecha, un círculo rojo la marca. Adentro, «te quiero» corre alrededor de la foto, una carta sale de un sobre rojo y las preguntas van en globos dibujados.', opening: 'Apertura: círculo en el calendario', colors: 'Rojo, azul tinta o verde botella', alt: ['Diseño tinta: calendario con la fecha marcada con un círculo rojo', 'Diseño tinta: portada con foto en blanco y negro y caligrafía roja'] },
      en: { name: 'Tinta', title: 'Tinta', desc: 'Editorial and modern: cream paper, black-and-white photos and red handwriting. Tap the date and a red circle marks it. Inside, “I love you” runs around the photo, a letter slides out of a red envelope and the questions sit in hand-drawn bubbles.', opening: 'Opening: a circle on the calendar', colors: 'Red, ink blue or bottle green', alt: ['Tinta design: calendar with the date circled in red', 'Tinta design: cover with a black-and-white photo and red script'] } },
    { id: 'glicina', bg: '#DCE3CF', shadow: 'rgba(60,70,40,0.55)', img: ['/assets/glicina-cortina.jpg', '/assets/glicina-portada.jpg'],
      tags: { estilo: ['botanico', 'romantico'], lugar: ['campo'], apertura: ['cortina'], tono: ['claros'] },
      es: { name: 'Glicina', title: 'Diseño glicina', desc: 'Un jardín de cuento: la invitación está detrás de una cortina de glicinas que se mecen; al tocarla se abre y aparece un óvalo de encaje con los nombres. Hortensias, paneles con encaje, programa con íconos y la cita en un corazón. Se puede usar con o sin fotos.', opening: 'Apertura: cortina de glicinas', colors: 'Lavanda y oliva', alt: ['Diseño glicina: cortina de glicinas', 'Diseño glicina: portada con foto en un óvalo de encaje y hortensias'] },
      en: { name: 'Glicina', title: 'Glicina', desc: 'A fairy-tale garden: the invitation hides behind a swaying wisteria curtain; tap it and it parts to reveal a lace oval with the names. Hydrangeas, lace-trimmed panels, a program with icons and the quote in a heart. Works with or without photos.', opening: 'Opening: wisteria curtain', colors: 'Lavender and olive', alt: ['Glicina design: wisteria curtain', 'Glicina design: cover with a photo in a lace oval and hydrangeas'] } },
    { id: 'estreno', bg: '#2A1D1D', shadow: 'rgba(0,0,0,0.75)', img: ['/assets/estreno-funda.jpg', '/assets/estreno-portada.jpg'],
      tags: { estilo: ['elegante', 'moderno'], lugar: ['ciudad'], apertura: ['funda'], tono: ['oscuros'] },
      es: { name: 'Estreno', title: 'Diseño estreno', desc: 'La boda como noche de estreno: la invitación llega en una funda de terciopelo con un corazón troquelado por el que asoma la fecha. Adentro, marquesina de bombillas, fotos en blanco y negro que se revelan, tira de película, cartelera con la cuenta regresiva y una butaca para cada invitado.', opening: 'Apertura: funda de terciopelo', colors: 'Granate, noche o champán', alt: ['Diseño estreno: funda de terciopelo con un corazón troquelado y la fecha', 'Diseño estreno: portada con foto en blanco y negro dentro de una marquesina de bombillas'] },
      en: { name: 'Estreno', title: 'Estreno', desc: 'The wedding as an opening night: the invitation arrives in a velvet sleeve with a heart cut-out that shows the date. Inside, marquee lights, black-and-white photos that develop, a film strip, a countdown on the marquee board and a seat for every guest.', opening: 'Opening: velvet sleeve', colors: 'Garnet, night or champagne', alt: ['Estreno design: velvet sleeve with a heart cut-out and the date', 'Estreno design: cover with a black-and-white photo inside marquee lights'] } },
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
