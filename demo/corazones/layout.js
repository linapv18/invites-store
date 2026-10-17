
/* Plantilla Corazones: la boda como la mejor mano. Los novios son el rey y la reina de corazones y cada dato se
   reparte en un naipe sobre fieltro borgoña. La baraja, los dorsos, las fichas y los palos son CSS/SVG (cambian
   con la paleta; el rojo de los palos no). El HTML se arma aquí ANTES de cargar demo/shared/content.js, para que el
   editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en una baraja de cartas', open: 'Abrir la invitación', hint: 'o toca la baraja', for: 'Para',
      seats: '4 cupos', y: 'y', amp: '&amp;', weddingOf: 'La boda de',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      numPat: '{dd} · {mm} · {Y}', numTxt: '14 · 03 · 2027', dayPat: '{W} {d} de {M} de {Y}', dayTxt: 'Domingo 14 de marzo de 2027',
      confirm: 'Confirmar asistencia', program: 'Programa', confirmShort: 'Confirmar', sections: 'Secciones',
      handK: 'Lo esencial', handT: 'La mejor mano', whenT: 'Cuándo', whereT: 'Dónde', map: 'Ver en el mapa',
      storyK: 'Antes del sí', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.', storyH: 'Nuestra historia',
      galK: 'Galería', galT: 'Nuestras cartas', allPhotos: 'Ver todas las fotos',
      cdK: 'Cuenta regresiva', cdT: 'Falta poco', units: ['Días', 'Horas', 'Min'], cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.',
      progK: 'El gran día', progT: 'Programa',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Vestimenta', dressT: 'El as de la noche', dressCodeK: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'Blanco y marfil',
      travelK: 'Para llegar', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      airportL: 'Aeropuerto', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Traslados', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Guía de la zona', foodL: 'Dónde comer', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Qué ver', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Planes', plans: 'Hierve el Agua y Monte Albán.',
      hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Dudas', faqT: 'Preguntas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpK: 'Confirma tu lugar', rsvpT: 'En la mesa', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 cupos', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistiré', no: 'No podré ir', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para',
      thanks: '¡Gracias!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation in a deck of cards', open: 'Open the invitation', hint: 'or tap the deck', for: 'For',
      seats: '4 seats', y: '&amp;', amp: '&amp;', weddingOf: 'The wedding of',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      numPat: '{mm} · {dd} · {Y}', numTxt: '03 · 14 · 2027', dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027',
      confirm: 'RSVP', program: 'Program', confirmShort: 'RSVP', sections: 'Sections',
      handK: 'The essentials', handT: 'A winning hand', whenT: 'When', whereT: 'Where', map: 'See on the map',
      storyK: 'Before the I do', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.', storyH: 'Our story',
      galK: 'Gallery', galT: 'Our cards', allPhotos: 'See all photos',
      cdK: 'Countdown', cdT: 'Almost there', units: ['Days', 'Hours', 'Min'], cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.',
      progK: 'The big day', progT: 'Program',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Dress code', dressT: 'The ace of the night', dressCodeK: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory',
      travelK: 'Getting there', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      airportL: 'Airport', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Where to eat', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'What to see', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Plans', plans: 'Hierve el Agua and Monte Albán.',
      hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Questions', faqT: 'FAQ',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpK: 'Save your seat', rsvpT: 'At the table', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Can’t make it', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for',
      thanks: 'Thank you!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.CorazonesS = S;

  var HEART = 'M8 14.2s-5.6-3.5-5.6-7.6A3.1 3.1 0 0 1 8 4.7a3.1 3.1 0 0 1 5.6 1.9c0 4.1-5.6 7.6-5.6 7.6z';
  var SPADE = 'M8 1.6s-5.6 4.1-5.6 7.4a2.8 2.8 0 0 0 4.7 2.1L6.4 14.4h3.2l-.7-3.3a2.8 2.8 0 0 0 4.7-2.1C13.6 5.7 8 1.6 8 1.6z';
  var suit = function (d, cls) { return '<svg class="suit ' + (cls || '') + '" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var H = suit(HEART, 'red'), SP = suit(SPADE, 'black');
  // Esquinas de un naipe: letra y palo arriba a la izquierda y, girados, abajo a la derecha.
  var corners = function (l, s) { return '<span class="cn tl" aria-hidden="true"><b>' + l + '</b>' + (s || H) + '</span><span class="cn br" aria-hidden="true"><b>' + l + '</b>' + (s || H) + '</span>'; };
  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M5 11 11 5M6 5h5v5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var BIG = function (d, cls) { return '<svg class="tic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M2.5 13.5 21 6l-2.4 4.6-6 2.2 1.5 6-2.2.8-3-5.3-3.8 1.4z'), I_BUS = BIG('M5 4h14a2 2 0 0 1 2 2v10H3V6a2 2 0 0 1 2-2zM3 11h18M7 16v2.5M17 16v2.5M7 13.5h.01M17 13.5h.01');
  var I_SEE = BIG('M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6'), I_FOOD = BIG('M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11'), I_PLAN = BIG('M3 18 9 8l4 6 3-4 5 8z');
  // Iconos de línea del programa: se repiten en orden (anillos, copas, plato, música, pastel, coche).
  var EVI = ['M9 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M7 3h4l-.5 6a1.5 1.5 0 0 1-3 0zM9 10.5V20M6.5 20h5M14 3h4l-.5 6a1.5 1.5 0 0 1-3 0zM16 10.5V20M13.5 20h5', 'M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM3 4v6M21 4v16M3 10h2', 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z', 'M4 20h16M5 20v-7h14v7M7 13V9h10v4M12 9V5M12 5h.01', 'M3 15h18l-2-5H5zM6 15v2M18 15v2M7.5 12.5h.01M16.5 12.5h.01'];
  var evIcons = EVI.map(function (d, i) { return BIG(d, 'ei i' + i); }).join('');
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var MONO = '<span data-lz-mono>A<i>·</i>L</span>';
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };
  var back = function (cls) { return '<span class="back ' + (cls || '') + '" aria-hidden="true"><span class="back-m">' + MONO + '</span></span>'; };
  var court = function (big) {
    return '<div class="court' + (big ? ' big' : '') + '">' + corners('K') + '<span class="cn tr" aria-hidden="true"><b>Q</b>' + H + '</span><span class="cn bl" aria-hidden="true"><b>Q</b>' + H + '</span>' +
      '<span class="half top bw"><img src="/assets/fotos/muro.jpg" data-lz-src="photo:0" alt="' + (big ? S.photoAlt : '') + '" decoding="async"></span>' +
      '<span class="half bot bw"><img src="/assets/fotos/torre.jpg" data-lz-src="photo:1" alt="" decoding="async"></span><span class="mid" aria-hidden="true">' + H + '</span></div>';
  };

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: se reparten las cartas =======================
  '<div class="opening felt" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<p class="op-intro" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<button type="button" class="deck" id="deck" aria-label="' + S.open + '">' +
      [0, 1, 2, 3, 4].map(function (i) { return '<span class="dk c' + i + '">' + back() + '</span>'; }).join('') +
      '<span class="dk face fk"><span class="flip"><span class="fb">' + back() + '</span><span class="ff">' + corners('K') + '<span class="fph bw"><img src="/assets/fotos/muro.jpg" data-lz-src="photo:0" alt="" decoding="async"></span></span></span></span>' +
      '<span class="dk face fq"><span class="flip"><span class="fb">' + back() + '</span><span class="ff">' + corners('Q') + '<span class="fph bw"><img src="/assets/fotos/torre.jpg" data-lz-src="photo:1" alt="" decoding="async"></span></span></span></span>' +
    '</button>' +
    '<div class="op-ticket"><p class="k k-gold">' + S.for + '</p><p class="op-guest">' + S.guest + '</p><p class="op-seats">' + S.seats + '</p>' +
      '<button type="button" class="btn btn-light" id="enter">' + S.open + '</button><p class="op-hint">' + S.hint + '</p>' +
      '<p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '">' + MONO + '</a><nav aria-label="' + S.sections + '"><a href="#itinerario">' + S.program + '</a><a class="mbar-cta" href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero felt" id="portada" data-lz-anchor="portada">' +
      '<p class="hero-top"><span class="mono">' + MONO + '</span><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span></p>' +
      court(true) +
      '<div class="hero-txt"><p class="k k-gold">' + S.weddingOf + '</p><h1 class="names" tabindex="-1">' + N('n1') + ' <span class="amp">' + S.amp + '</span> ' + N('n2') + '</h1>' +
        '<p class="hero-d" data-lz-date="' + S.numPat + '">' + S.numTxt + '</p><p class="k k-light" data-lz="city">' + S.city + '</p><a class="btn btn-light" href="#rsvp">' + S.confirm + '</a></div>' +
    '</section>' +

    '<section class="sec felt hand"><div class="head"><p class="k k-gold">' + S.handK + '</p><h2>' + S.handT + '</h2><p class="lead" data-lz="msg">' + S.msg + '</p></div>' +
      '<div class="cards">' +
        '<div class="card-i" data-rv>' + corners('K') + '<h3>' + S.whenT + '</h3><p data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><p><span data-lz="cdName">' + S.cdName + '</span> · <span data-lz="time0">' + S.time0 + '</span></p></div>' +
        '<div class="card-i" id="where" data-rv>' + corners('Q') + '<h3>' + S.whereT + '</h3><p id="whereName">' + S.events[0][2] + '</p><p class="mute" id="whereAddr">' + S.events[0][3] + '</p><a class="lnk" id="whereMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div>' +
      '</div></section>' +

    '<section class="sec story" id="historia" data-lz-anchor="historia"><div class="head"><p class="k">' + S.storyK + '</p><h2>' + S.storyH + '</h2></div>' +
      '<div class="story-cards"><div class="photo-card bw" data-rv><img class="ph-img" src="/assets/fotos/escalera.jpg" data-lz-src="photo:2" alt="" loading="lazy"></div>' +
        '<div class="card-i text" data-rv>' + corners('J') + '<h3 data-lz="storyTitle">' + S.storyTitle + '</h3><p data-lz="story">' + S.storyTxt + '</p><p class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p></div></div>' +
    '</section>' +

    '<section class="sec felt gal" id="galeria"><div class="head"><p class="k k-gold">' + S.galK + '</p><h2>' + S.galT + '</h2></div>' +
      '<div class="deal" data-lz-list="gallery">' + ['beso', 'escalera', 'muro', 'torre', 'paseo'].map(function (f) { return '<div class="pcard bw" data-lz-item><img class="ph-img" data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy"></div>'; }).join('') + '</div>' +
      '<div class="gal-foot"><button type="button" class="btn btn-light" data-gallery-open>' + S.allPhotos + '</button></div>' +
    '</section>' +

    '<section class="sec cd"><div class="head"><p class="k">' + S.cdK + '</p><h2>' + S.cdT + '</h2></div>' +
      '<div class="chips" role="timer" aria-live="off">' + S.units.map(function (u, i) { return '<div class="chip-p"><b data-cd="' + 'dhm'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '<b data-cd="s" hidden></b></div>' +
      '<p class="cd-when"><span data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</span> · <span data-lz="time0">' + S.time0 + '</span></p><p class="mute" data-lz="countdownNote">' + S.cdNote + '</p>' +
    '</section>' +

    '<section class="sec prog" id="itinerario" data-lz-anchor="itinerario musica"><div class="head"><p class="k">' + S.progK + '</p><h2>' + S.progT + '</h2></div>' +
      '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv>' + evIcons + '<div><p class="ev-time" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="mute" data-lz-f="address">' + e[3] + '</p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div></li>'; }).join('') + '</ol>' +
    '</section>' +

    '<section class="sec felt dress" data-lz-group="dressCode dressNotes dressColors"><div class="head"><p class="k k-gold">' + S.dressK + '</p><h2>' + S.dressT + '</h2></div>' +
      '<div class="card-i ace" data-rv>' + corners('A', SP) + '<p class="k">' + S.dressCodeK + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="pips" aria-hidden="true">' + SP + H + SP + '</p><p class="b" data-lz-group="dressColors">' + S.reserved + ' <span data-lz="dressColors">' + S.dressColors + '</span></p></div>' +
    '</section>' +

    '<section class="sec travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="travel-main"><div class="head"><p class="k">' + S.travelK + '</p><h2>' + S.travel + '</h2><p class="intro" data-lz="travelIntro">' + S.travelIntro + '</p></div>' +
        '<div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div>' +
        '<div class="guide" data-lz-group="guideFood guideCulture guidePlans"><p class="k">' + S.guideK + '</p>' + info(I_SEE, 'guideCulture', S.cultureL, S.culture) + info(I_FOOD, 'guideFood', S.foodL, S.food) + info(I_PLAN, 'guidePlans', S.plansL, S.plans) + '</div></div>' +
      '<div class="card-i hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes">' + corners('7') + '<p class="k">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="mute" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="lnk" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="mute demo-booking">' + S.demoBooking + '</p></div>' +
    '</section>' +

    '<section class="sec felt quote" data-lz-group="quote"><div class="lattice" data-rv>' + H + '<blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="k k-gold" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="head"><p class="k">' + S.faqK + '</p><h2>' + S.faqT + '</h2></div>' +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec rsvp" id="rsvp" data-lz-anchor="rsvp"><div class="table" data-rv>' +
      '<div class="head"><p class="k">' + S.rsvpK + '</p><h2>' + S.rsvpT + '</h2></div>' +
      '<p class="rs-for"><b>' + S.guest + '</b><span>' + S.seatsRes + '</span></p><p class="chipd" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
      '<div id="rsForm"><p class="mute" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><button type="button" class="btn" id="rsSave">' + S.send + '</button></div>' +
      '<div id="rsDone" hidden><div class="card-i thanks">' + corners('A') + '<span class="big-h" aria-hidden="true">' + H + '</span><p class="sig">' + S.thanks + '</p></div><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      '<p class="mute demo-note">' + S.demoNote + '</p></div></section>' +

    '<section class="sec felt fin"><div class="fin-cards" aria-hidden="true">' + back('fin-back') + '<span class="card-i fin-q">' + corners('Q') + '<span class="big-h">' + H + '</span></span></div>' +
      '<p class="sig fin-n">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p><p class="k k-light"><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#itinerario">' + S.program + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
