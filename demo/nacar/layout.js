
/* Plantilla Nácar: la invitación llega en un estuche de ante cerrado con un hilo de perlas; al soltar el broche
   se levanta la tapa y el mismo collar acompaña todo el día. Las perlas, el estuche, el sobre de papel vegetal y la
   etiqueta de equipaje son SVG/CSS (cambian con la paleta). El HTML se arma aquí ANTES de cargar
   demo/shared/content.js, para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Guardada como una joya', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación dentro de un estuche con un hilo de perlas', open: 'Abrir el estuche', hint: 'o toca el broche', for: 'Para',
      seats: '4 cupos', y: 'y', amp: '&amp;', married: 'nos casamos',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      numPat: '{dd} · {mm} · {Y}', numTxt: '14 · 03 · 2027', coverPat: '{d} de {M} de {Y}', coverTxt: '14 de marzo de 2027',
      confirm: 'Confirmar asistencia', seeProg: 'Ver el programa', program: 'Programa', confirmShort: 'Confirmar', sections: 'Secciones',
      storyK: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      galK: 'Galería', galA: 'un collar de recuerdos', allPhotos: 'Ver todas las fotos', prev: 'Fotos anteriores', next: 'Fotos siguientes',
      cdA: 'falta poco', units: ['Días', 'Horas', 'Minutos'], cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', monthPat: '{MU}', monthTxt: 'MARZO',
      progK: 'Programa', progA: 'del día', map: 'Ver en el mapa',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Vestimenta', dressA: 'código', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      travelK: 'Viaje', travelA: 'y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.', dest: 'Destino', waiting: 'te esperamos',
      airportL: 'En avión', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Qué hacer en la ciudad', foodL: 'Restaurantes', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades', plans: 'Hierve el Agua y Monte Albán.',
      stayK: 'Dónde dormir', hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Preguntas', faqA: 'por si acaso',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpK: 'Confirmación', rsvpA: '¿nos acompañas?', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 cupos', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistiré', no: 'No podré ir', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para', pending: 'Pendiente',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'Kept like a jewel', envClosing: 'With all our love', openAria: 'Invitation inside a box closed with a strand of pearls', open: 'Open the box', hint: 'or tap the clasp', for: 'For',
      seats: '4 seats', y: '&amp;', amp: '&amp;', married: 'we’re getting married',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      numPat: '{mm} · {dd} · {Y}', numTxt: '03 · 14 · 2027', coverPat: '{Mc} {d}, {Y}', coverTxt: 'March 14, 2027',
      confirm: 'RSVP', seeProg: 'See the program', program: 'Program', confirmShort: 'RSVP', sections: 'Sections',
      storyK: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      galK: 'Gallery', galA: 'a necklace of memories', allPhotos: 'See all photos', prev: 'Previous photos', next: 'Next photos',
      cdA: 'almost there', units: ['Days', 'Hours', 'Minutes'], cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', monthPat: '{MU}', monthTxt: 'MARCH',
      progK: 'Program', progA: 'of the day', map: 'See on the map',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Dress code', dressA: 'what to wear', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      travelK: 'Travel', travelA: 'and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.', dest: 'Destination', waiting: 'see you there',
      airportL: 'By plane', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Restaurants', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities', plans: 'Hierve el Agua and Monte Albán.',
      stayK: 'Where to stay', hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Questions', faqA: 'just in case',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpK: 'RSVP', rsvpA: 'will you join us?', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Can’t make it', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for', pending: 'Pending',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.NacarS = S;

  var A = '/assets/nacar/';
  var pearlId = 0;
  // Individual shaded pearls follow a measured SVG path, so every layout can resize.
  function strand(d, w, h, r, cls) {
    var id='naPearl'+(++pearlId);
    return '<svg class="strand '+(cls||'')+'" viewBox="0 0 '+w+' '+h+'" data-pearl-radius="'+r+'" aria-hidden="true" focusable="false"><defs><radialGradient id="'+id+'" cx="31%" cy="26%" r="74%"><stop offset="0" stop-color="#fffefa"/><stop offset=".23" stop-color="#faf6f1"/><stop offset=".48" stop-color="#eee5df"/><stop offset=".72" stop-color="#d8d1cd"/><stop offset=".9" stop-color="#bcb7b1"/><stop offset="1" stop-color="#e1d9cf"/></radialGradient></defs><path class="pearl-route" d="'+d+'" fill="none" stroke="var(--silver)" stroke-width=".65"/><g data-pearl-fill="'+id+'"></g></svg>';
  }
  var PEARL = '<span class="pearl broche" aria-hidden="true"></span>';
  var PIN = '<img class="pin" src="'+A+'alfiler.webp" alt="" loading="lazy" decoding="async">';
  var BOW = '<img class="bow" src="'+A+'lazo-perlas.webp" alt="" loading="lazy" decoding="async">';
  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M5 11 11 5M6 5h5v5'), PREV = ICO('M10 3.5 5.5 8l4.5 4.5'), NEXT = ICO('M6 3.5 10.5 8 6 12.5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var BIG = function (d) { return '<svg class="tic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M2.5 13.5 21 6l-2.4 4.6-6 2.2 1.5 6-2.2.8-3-5.3-3.8 1.4z'), I_BUS = BIG('M5 4h14a2 2 0 0 1 2 2v10H3V6a2 2 0 0 1 2-2zM3 11h18M7 16v2.5M17 16v2.5M7 13.5h.01M17 13.5h.01'), I_PIN = BIG('M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11zM12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z');
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var MONO = '<span data-lz-seal><span class="lz-seal">A<i>·</i>L</span></span>';
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };
  var ring = function (k, u) { return '<div class="ringc">'+strand('M50 6A44 44 0 1 1 49.99 6',100,100,3.3)+'<b data-cd="'+k+'">--</b><span>'+u+'</span></div>'; };
  var SWAG = 'M4 10C120 64 280 64 396 10', HALF_L = 'M8 30H150', HALF_R = 'M10 30H152';

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: el estuche con el hilo de perlas =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="op-mist" aria-hidden="true"></div>' +
    '<div class="op-box">' +
      '<div class="op-base" aria-hidden="true"><div class="op-satin"></div></div><div class="op-card" aria-hidden="true"><p class="op-card-n">' + N('n1') + '<br>' + N('n2') + '</p><p class="acc">' + S.married + '</p><p class="op-card-d" data-lz-date="' + S.numPat + '">' + S.numTxt + '</p></div>' +
      '<button type="button" class="op-lid" id="lid" aria-label="' + S.open + '"><span class="op-mono">' + MONO + '</span><span class="op-names">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</span><span class="op-intro" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</span></button>' +
      '<div class="op-strand" aria-hidden="true"><span class="half l"></span><span class="clasp"></span><span class="half r"></span></div>' +
    '</div>' +
    '<div class="op-ticket"><p class="k">' + S.for + '</p><p class="op-guest">' + S.guest + '</p><p class="op-seats">' + S.seats + '</p>' +
      '<button type="button" class="btn" id="enter">' + S.open + '</button><p class="op-hint">' + S.hint + '</p>' +
      '<p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '">' + MONO + '</a><nav aria-label="' + S.sections + '"><a href="#itinerario">' + S.program + '</a><a class="mbar-cta" href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada">' +
      '<div class="hero-txt"><p class="hero-top"><span class="mono">' + MONO + '</span><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span></p>' +
        '<h1 class="names" tabindex="-1">' + N('n1') + '<span class="amp">' + S.y + '</span>' + N('n2') + '</h1><p class="acc hero-acc">' + S.married + '</p>' +
        '<p class="k hero-when"><span data-lz-date="' + S.coverPat + '">' + S.coverTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
        '<div class="hero-act"><a class="btn" href="#rsvp">' + S.confirm + '</a><a class="lnk" href="#itinerario">' + S.seeProg + '</a></div></div>' +
      '<div class="hero-ph bw">' + strand(SWAG, 400, 70, 4.2, 'swag') + '<img class="ph-img" id="heroImg" fetchpriority="high" src="/assets/fotos/torre.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" decoding="async"></div>' +
    '</section>' +

    '<section class="sec story" id="historia" data-lz-anchor="historia" data-gallery="mono">' +
      '<div class="head"><h2>' + S.storyK + '</h2><p class="acc" data-lz="storyTitle">' + S.storyTitle + '</p></div>' +
      '<div class="env" data-rv><div class="vellum" aria-hidden="true"></div><div class="polaroid bw"><img class="ph-img" src="/assets/fotos/muro.jpg" data-lz-src="photo:1" alt="" loading="lazy"></div>' +
        '<div class="letter">' + PIN + '<p class="to">' + S.for + ' ' + S.guest + ':</p><p data-lz="msg">' + S.msg + '</p><p data-lz="story">' + S.storyTxt + '</p><p class="acc sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p></div></div>' +
    '</section>' +

    '<section class="sec gal" id="galeria" data-gallery="mono">' +
      '<div class="head"><h2>' + S.galK + '</h2><p class="acc">' + S.galA + '</p></div>' +
      '<div class="necklace">' + strand('M0 18H1000', 1000, 40, 4.2, 'line') +
        '<div class="hang" id="strip" data-lz-list="gallery">' + ['beso', 'escalera', 'muro', 'torre', 'paseo'].map(function (f, i) { return '<div class="charm bw" data-lz-item data-rv style="--r:' + [-3, 2, -1, 3, -2][i] + 'deg"><img class="ph-img" data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy"></div>'; }).join('') + '</div></div>' +
      '<div class="gal-foot"><div class="gal-nav"><button type="button" class="round" data-strip="-1" aria-label="' + S.prev + '">' + PREV + '</button><button type="button" class="round" data-strip="1" aria-label="' + S.next + '">' + NEXT + '</button></div><button type="button" class="btn" data-gallery-open>' + S.allPhotos + '</button></div>' +
    '</section>' +

    '<section class="sec cd">' +
      '<div class="cd-date"><div class="head"><h2 data-lz-date="' + S.monthPat + '">' + S.monthTxt + '</h2><p class="acc">' + S.cdA + '</p></div>' +
        '<div class="days" id="days">' + [0, 1, 2].map(function (i) { return '<div class="day' + (i === 1 ? ' on' : '') + '"><span class="wd"></span><b></b></div>'; }).join('') + '</div></div>' +
      '<div class="cd-count"><div class="rings" role="timer" aria-live="off">' + ring('d', S.units[0]) + ring('h', S.units[1]) + ring('m', S.units[2]) + '<b data-cd="s" hidden></b></div>' +
        '<p class="cd-when"><span data-lz="cdName">' + S.cdName + '</span> · <span data-lz="time0">' + S.time0 + '</span></p><p class="mute" data-lz="countdownNote">' + S.cdNote + '</p></div>' +
    '</section>' +

    '<section class="sec dark prog" id="itinerario" data-lz-anchor="itinerario musica">' +
      '<div class="head"><h2>' + S.progK + '</h2><p class="acc">' + S.progA + '</p></div>' +
      '<div class="thread">' +
        '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv><p class="ev-time" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="soft" data-lz-f="address">' + e[3] + '</p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></li>'; }).join('') + '</ol>' + PEARL + '</div>' +
    '</section>' +

    '<section class="sec dress" data-lz-group="dressCode dressNotes dressColors"><div class="head"><h2>' + S.dressK + '</h2><p class="acc">' + S.dressA + '</p></div>' +
      '<div class="pinned" data-rv>' + PIN + '<h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="b" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p></div>' +
    '</section>' +

    '<section class="sec travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="travel-main"><div class="head"><h2>' + S.travelK + '</h2><p class="acc">' + S.travelA + '</p></div>' +
        '<div class="tag" data-rv aria-hidden="true"><i class="tag-hole"></i><p class="k">' + S.dest + '</p><p class="tag-city" data-lz="city">' + S.city + '</p><p class="k tag-d" data-lz-date="' + S.numPat + '">' + S.numTxt + '</p><p class="acc">' + S.waiting + '</p></div>' +
        '<p class="intro" data-lz="travelIntro">' + S.travelIntro + '</p>' +
        '<div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div>' +
        '<div class="guide" data-lz-group="guideFood guideCulture guidePlans"><p class="k">' + S.guideK + '</p>' + info(I_PIN, 'guideFood', S.foodL, S.food) + info(I_PIN, 'guideCulture', S.cultureL, S.culture) + info(I_PIN, 'guidePlans', S.plansL, S.plans) + '</div></div>' +
      '<div class="stay"><p class="k">' + S.stayK + '</p><div class="hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="k soft">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="mute" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="lnk" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="mute demo-booking">' + S.demoBooking + '</p></div></div>' +
    '</section>' +

    '<section class="sec dark quote" data-lz-group="quote">' + BOW + '<div><blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="acc" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="head"><h2>' + S.faqK + '</h2><p class="acc">' + S.faqA + '</p></div>' +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec rsvp" id="rsvp" data-lz-anchor="rsvp"><div class="card" data-rv>' +
      '<div class="rs-head"><div class="head"><h2>' + S.rsvpK + '</h2><p class="acc">' + S.rsvpA + '</p></div><p class="chip" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p></div>' +
      '<p class="rs-for"><b>' + S.guest + '</b><span>' + S.seatsRes + '</span></p>' +
      '<div id="rsForm"><p class="mute" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><button type="button" class="btn" id="rsSave">' + S.send + '</button></div>' +
      '<div id="rsDone" hidden><div class="mini-box" aria-hidden="true"><span>' + S.thanks + '</span></div><p class="thanks">' + S.thanks + '</p><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      '<p class="mute demo-note">' + S.demoNote + '</p></div></section>' +

    '<section class="sec dark fin"><div class="mini-box" aria-hidden="true"><span class="mono">' + MONO + '</span></div>' + strand('M4 14H316', 320, 28, 3.2, 'fin-strand') +
      '<p class="fin-n">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p><p class="k"><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#itinerario">' + S.program + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></section>' +
  '</main>';

  function drawPearls(svg){
    var path=svg.querySelector('.pearl-route'),group=svg.querySelector('[data-pearl-fill]'),r=+svg.dataset.pearlRadius;group.replaceChildren();if(svg.classList.contains('line')){var w=svg.clientWidth||1000;svg.setAttribute('viewBox','0 0 '+w+' 40');path.setAttribute('d','M0 18H'+w);}var total=path.getTotalLength(),n=Math.max(2,Math.floor(total/(2*r+1.1))),id=group.dataset.pearlFill;
    for(var i=0;i<=n;i++){
      var p=path.getPointAtLength(total*i/n),size=r*(1+Math.sin(i*2.4)*.025);
      var shadow=document.createElementNS('http://www.w3.org/2000/svg','circle');shadow.setAttribute('cx',p.x+.35);shadow.setAttribute('cy',p.y+.85);shadow.setAttribute('r',size+.25);shadow.setAttribute('fill','#251e171b');group.appendChild(shadow);
      var bead=document.createElementNS(shadow.namespaceURI,'circle');bead.setAttribute('cx',p.x);bead.setAttribute('cy',p.y);bead.setAttribute('r',size);bead.setAttribute('fill','url(#'+id+')');group.appendChild(bead);
    }
  }
  document.querySelectorAll('svg[data-pearl-radius]').forEach(drawPearls);
  var galleryThread=document.querySelector('.necklace .line');if('ResizeObserver' in window)new ResizeObserver(function(){requestAnimationFrame(function(){drawPearls(galleryThread);});}).observe(galleryThread);

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
