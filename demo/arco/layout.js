
/* Plantilla Arco: una boda bajo la lluvia de ciudad. La invitación es una ventana en arco empañada; al deslizar el dedo el
   cristal se limpia por trazos y aparece la pareja. Desde ahí la arquitectura acompaña distintas composiciones, en verde bosque
   y papel. El vaho combina una textura PNG transparente de lluvia y una superficie borrable en canvas; los arcos y las olas son CSS/SVG (cambian con la paleta). El HTML se arma aquí ANTES de
   cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con cariño, te esperamos en nuestra boda', openAria: 'Invitación detrás de una ventana empañada', open: 'Abrir la invitación', hint: 'Limpia el cristal con el dedo. La invitación se abrirá al despejarlo.', ready: 'La ventana está limpia. Abriendo la invitación…', for: 'Para',
      seats: '4 cupos', y: 'y', amp: '&amp;', saveDate: 'Guarda la fecha',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      numPat: '{dd} · {mm} · {Y}', numTxt: '14 · 03 · 2027', monPat: '{M}', monTxt: 'marzo', dayPat: '{d}', dayTxt: '14', yearPat: '{Y}', yearTxt: '2027',
      confirm: 'Confirmar asistencia', program: 'Programa', confirmShort: 'Confirmar', sections: 'Secciones',
      waitK: 'Te esperamos en', map: 'Ver en el mapa',
      storyK: 'Antes del sí', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      galK: 'Galería', galT: 'Momentos', allPhotos: 'Ver todas las fotos', prev: 'Fotos anteriores', next: 'Fotos siguientes',
      cdK: 'Faltan', cdA: 'para decirnos sí', units: ['Días', 'Horas', 'Minutos'], cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.',
      progK: 'El día', progT: 'Programa',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Vestimenta', dressT: 'Código', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      travelK: 'Para llegar', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      airportL: 'Aeropuerto', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Traslados', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Guía de la zona', foodL: 'Dónde comer', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Qué ver', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Planes', plans: 'Hierve el Agua y Monte Albán.',
      hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Dudas', faqT: 'Preguntas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpK: 'RSVP', rsvpT: 'Confirmación', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 cupos', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistiré', no: 'No podré ir', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With love, we’ll see you at our wedding', openAria: 'Invitation behind a misted window', open: 'Open the invitation', hint: 'Wipe the glass with your finger. The invitation opens when it is clear.', ready: 'The window is clear. Opening the invitation…', for: 'For',
      seats: '4 seats', y: '&amp;', amp: '&amp;', saveDate: 'Save the date',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      numPat: '{mm} · {dd} · {Y}', numTxt: '03 · 14 · 2027', monPat: '{Mc}', monTxt: 'March', dayPat: '{d}', dayTxt: '14', yearPat: '{Y}', yearTxt: '2027',
      confirm: 'RSVP', program: 'Program', confirmShort: 'RSVP', sections: 'Sections',
      waitK: 'We’ll see you at', map: 'See on the map',
      storyK: 'Before the I do', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      galK: 'Gallery', galT: 'Moments', allPhotos: 'See all photos', prev: 'Previous photos', next: 'Next photos',
      cdK: 'Only', cdA: 'until we say I do', units: ['Days', 'Hours', 'Minutes'], cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.',
      progK: 'The day', progT: 'Program',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Dress code', dressT: 'What to wear', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      travelK: 'Getting there', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      airportL: 'Airport', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Where to eat', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'What to see', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Plans', plans: 'Hierve el Agua and Monte Albán.',
      hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Questions', faqT: 'FAQ',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpK: 'RSVP', rsvpT: 'Will you join us?', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Can’t make it', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.ArcoS = S;

  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M3.5 12.5 12 4M4.5 4H12v7.5'), PREV = ICO('M12.5 8h-9M7.5 3.5 3 8l4.5 4.5'), NEXT = ICO('M3.5 8h9M8.5 3.5 13 8l-4.5 4.5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  // Ilustraciones de línea propias: cada objeto explica su sección; no representa un recinto concreto.
  var DRAW = function (name, body, extra) { return '<svg class="ar-symbol ' + (extra || '') + '" data-ar-icon="' + name + '" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>'; };
  var I_RINGS = DRAW('rings', '<circle cx="24" cy="37" r="14"/><path d="M13 30a12 12 0 0 1 13-5M15 46a12 12 0 0 0 12 2M29 27a14 14 0 1 1 1 20M34 26a11 11 0 0 1 13 4M38 19l-4-5 4-5h8l4 5-4 5zM34 14h16M38 9l4 10 4-10M20 13l-1-4m-5 9-4-1m15-2 2-4"/>');
  var I_PLACE = DRAW('location', '<path d="M9 32 24 26l16 6 15-6v28l-15 6-16-6-15 6zM24 38v16m16-13v19M12 45l8-3m24 6 7-3"/><path d="M44 17c0 9-12 20-12 20S20 26 20 17a12 12 0 0 1 24 0z"/><circle cx="32" cy="17" r="4.5"/><path d="M14 35v-9m0 5c-5-1-7-5-6-9 5 0 7 4 6 9zm0-4c5-1 7-5 6-8-5 0-7 4-6 8z"/><path d="M27 45c3-5 8-5 9-1s-4 5-2 9" stroke-dasharray="2 3"/>', 'venue-symbol');
  var I_PLANE = DRAW('airport', '<g transform="translate(32 32) rotate(45) scale(.85) translate(-32 -32)"><path d="M29 12c0-5 1-8 3-8s3 3 3 8v13l20 13v5l-20-7v13l8 6v4l-11-4-11 4v-4l8-6V36L9 43v-5l20-13z"/></g>', 'travel-symbol');
  var I_BUS = DRAW('transport', '<path d="M15 11h34a5 5 0 0 1 5 5v30H10V16a5 5 0 0 1 5-5zM10 31h44M32 15v16M15 17h34M9 22H6v10h4m45-10h3v10h-4M16 46v6h7v-6m18 0v6h7v-6M17 37h5m20 0h5M26 41h12M22 7h20M14 56h36"/><path d="m16 27 5-5m16 5 5-5" opacity=".6"/>', 'travel-symbol');
  var I_SEE = DRAW('culture', '<path d="m8 22 24-13 24 13zM12 25h40M10 49h44v5H10zM7 57h50M16 29v16m5-16v16m9-16v16m5-16v16m9-16v16m5-16v16M14 27h9m5 0h9m5 0h9M14 47h9m5 0h9m5 0h9"/><circle cx="32" cy="18" r="2"/>', 'travel-symbol');
  var I_FOOD = DRAW('dining', '<circle cx="33" cy="33" r="17"/><circle cx="33" cy="33" r="12"/><path d="M23 31a10 10 0 0 1 8-8M8 11v13c0 5 8 5 8 0V11M12 11v43M55 11c-5 5-6 12-5 20h5m0-20v43M30 38c4 1 8-1 9-5"/>', 'travel-symbol');
  var I_PLAN = DRAW('excursions', '<path d="M5 48 23 20l11 16 8-12 17 24M16 31l7 4 5-7m10 3 5 4 4-3M6 52h52M34 43c-8 2-9 5-3 8s5 6-1 9"/><circle cx="45" cy="13" r="5"/><path d="M45 4V2m0 22v-2m9-9h3m-24 0h3m15-7 2-2m-15 0 2 2"/>', 'travel-symbol');
  var I_DRESS = DRAW('dress', '<path d="M28 16a5 5 0 1 1 9 3l-5 4v5M32 28 7 44a3 3 0 0 0 2 5h46a3 3 0 0 0 2-5L32 28zM12 44h40M22 34v19c6 4 14 4 20 0V34M27 36v16m10-16v16M22 53l-3 5m23-5 3 5"/>');
  var I_HOTEL = DRAW('hotel', '<path d="M12 56V18h40v38M8 56h48M18 18v-7h28v7M27 56V44h10v12M18 26h7v7h-7zm21 0h7v7h-7zM18 39h5v8h-5zm23 0h5v8h-5zM27 18v-3h10v3M27 38h10M31 49v3"/><path d="M26 7h12"/>');
  var I_REPLY = DRAW('reply', '<path d="M8 27 32 11l24 16v27H8zM9 28l23 17 23-17M9 53l16-14m30 14L39 39M20 31V17h24v14M25 24h14M25 29h7"/><path d="m29 35 3 3 7-8"/>');
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };
  var WAVE = '<svg class="wave" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 22C60 4 120 4 200 20S340 40 400 18V40H0Z"/></svg>';

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: la ventana empañada =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<p class="op-intro" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<button type="button" class="win" id="win" aria-describedby="wipeHint" aria-label="' + S.hint + (LANG === 'en' ? '. Press Enter to clear using the keyboard.' : '. Pulsa Enter para limpiar con el teclado.') + '">' +
      '<span class="win-ph blur"><img src="/assets/fotos/torre.jpg" data-lz-src="photo:0" alt="" decoding="async"></span>' +
      '<canvas class="mist" aria-hidden="true"></canvas>' +
      '<span class="win-ph clear" aria-hidden="true"><img src="/assets/fotos/torre.jpg" data-lz-src="photo:0" alt="" decoding="async"></span>' +
      '<span class="fog-txt" aria-hidden="true"><span class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</span><span class="fog-d" data-lz-date="' + S.numPat + '">' + S.numTxt + '</span></span>' +
    '</button>' +
    '<div class="op-ticket"><p class="k">' + S.for + '</p><p class="op-guest">' + S.guest + '</p><p class="op-seats">' + S.seats + '</p>' +
      '<p class="op-hint" id="wipeHint" role="status" aria-live="polite">' + S.hint + '</p>' +
      '<p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '"><span data-lz-seal><span class="lz-seal">A<i>&amp;</i>L</span></span></a><nav aria-label="' + S.sections + '"><a href="#itinerario">' + S.program + '</a><a class="mbar-cta" href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada">' +
      '<div class="hero-ph"><img class="ph-img" id="heroImg" src="/assets/fotos/torre.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" decoding="async">' +
        '<p class="glass pill"><span class="k">' + S.saveDate + '</span><b data-lz-date="' + S.numPat + '">' + S.numTxt + '</b></p>' +
        '<h1 class="names" tabindex="-1"><em aria-hidden="true">&amp;</em>' + N('n1') + '<span class="sr"> ' + S.y + ' </span>' + N('n2') + '</h1></div>' +
      '<div class="hero-panel arch">' + I_RINGS + '<p class="when"><span class="w-m" data-lz-date="' + S.monPat + '">' + S.monTxt + '</span><b data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</b><span class="w-t" data-lz="time0">' + S.time0 + '</span></p>' +
        '<p class="w-y" data-lz-date="' + S.yearPat + '">' + S.yearTxt + '</p><p class="k k-light" data-lz="city">' + S.city + '</p><a class="btn btn-light" href="#rsvp">' + S.confirm + '</a></div>' +
    '</section>' +

    '<section class="sec green welcome"><p class="lead" data-lz="msg">' + S.msg + '</p><p class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p>' +
      '<div class="venue" id="venue"><p class="k k-light">' + S.waitK + '</p>' + I_PLACE + '<h2 id="venueName">' + S.events[0][2] + '</h2><p id="venueAddr">' + S.events[0][3] + '</p><a class="btn btn-line" id="venueMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div>' +
    '</section>' +

    '<section class="sec story" id="historia" data-lz-anchor="historia">' +
      '<div class="arch-ph" data-rv><img class="ph-img" src="/assets/fotos/escalera.jpg" data-lz-src="photo:1" alt="" loading="lazy"></div>' +
      '<div class="story-txt"><p class="k">' + S.storyK + '</p><h2 data-lz="storyTitle">' + S.storyTitle + '</h2><p data-lz="story">' + S.storyTxt + '</p><p class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p></div>' +
    '</section>' +

    '<section class="sec gal" id="galeria"><div class="head"><p class="k">' + S.galK + '</p><h2>' + S.galT + '</h2></div>' +
      '<div class="arcade-strip" id="strip" data-lz-list="gallery">' + ['beso', 'escalera', 'muro', 'torre', 'paseo'].map(function (f) { return '<div class="arc-item" data-lz-item><img class="ph-img" data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy"></div>'; }).join('') + '</div>' +
      '<div class="gal-foot"><div class="gal-nav"><button type="button" class="round" data-strip="-1" aria-label="' + S.prev + '">' + PREV + '</button><button type="button" class="round" data-strip="1" aria-label="' + S.next + '">' + NEXT + '</button></div><button type="button" class="btn" data-gallery-open>' + S.allPhotos + '</button></div>' +
    '</section>' +

    '<section class="cd"><img class="ph-img cd-bg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:2" alt="" loading="lazy"><div class="cd-in">' +
      '<p class="k k-light">' + S.cdK + '</p><div class="tiles" role="timer" aria-live="off">' + S.units.map(function (u, i) { return '<div class="glass tile"><b data-cd="' + 'dhm'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '<b data-cd="s" hidden></b></div>' +
      '<p class="sig">' + S.cdA + '</p><p class="cd-when"><span data-lz="cdName">' + S.cdName + '</span> · <span data-lz="time0">' + S.time0 + '</span></p><p class="cd-note" data-lz="countdownNote">' + S.cdNote + '</p></div>' + WAVE +
    '</section>' +

    '<section class="sec green prog" id="itinerario" data-lz-anchor="itinerario musica"><div class="head"><p class="k k-light">' + S.progK + '</p><h2>' + S.progT + '</h2></div>' +
      '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv><p class="ev-time" data-lz-f="time">' + e[0] + '</p><div><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="soft" data-lz-f="address">' + e[3] + '</p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div></li>'; }).join('') + '</ol>' +
    '</section>' +

    '<section class="sec dress" data-lz-group="dressCode dressNotes dressColors"><div class="arch-card" data-rv>' + I_DRESS + '<p class="k">' + S.dressK + '</p><h2>' + S.dressT + '</h2><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="b" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p></div></section>' +

    '<section class="sec travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="travel-main"><div class="head"><p class="k">' + S.travelK + '</p><h2>' + S.travel + '</h2></div><p class="intro" data-lz="travelIntro">' + S.travelIntro + '</p>' +
        '<div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div></div>' +
      '<div class="hotel arch" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes">' + I_HOTEL + '<p class="k k-light">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="soft" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="lnk" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="soft demo-booking">' + S.demoBooking + '</p></div>' +
      '<div class="guide" data-lz-group="guideFood guideCulture guidePlans"><p class="k">' + S.guideK + '</p>' + info(I_SEE, 'guideCulture', S.cultureL, S.culture) + info(I_FOOD, 'guideFood', S.foodL, S.food) + info(I_PLAN, 'guidePlans', S.plansL, S.plans) + '</div>' +
    '</section>' +

    '<section class="sec quote" data-lz-group="quote"><div class="arch-ph small" data-rv><img class="ph-img" src="/assets/fotos/muro.jpg" data-lz-src="photo:3" alt="" loading="lazy"></div>' +
      '<div><blockquote>«<span data-lz="quote">' + S.quote + '</span>»</blockquote><p class="sig" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="head"><p class="k">' + S.faqK + '</p><h2>' + S.faqT + '</h2></div>' +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec rsvp" id="rsvp" data-lz-anchor="rsvp"><div class="card" data-rv>' +
      '<div class="head">' + I_REPLY + '<p class="k">' + S.rsvpK + '</p><h2>' + S.rsvpT + '</h2></div>' +
      '<p class="rs-for"><b>' + S.guest + '</b><span>' + S.seatsRes + '</span></p><p class="chip" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
      '<div id="rsForm"><p class="mute" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><button type="button" class="btn" id="rsSave">' + S.send + '</button></div>' +
      '<div id="rsDone" hidden><div class="thanks arch"><p class="sig">' + S.thanks + '</p></div><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      '<p class="mute demo-note">' + S.demoNote + '</p></div></section>' +

    '<section class="fin"><img class="ph-img fin-bg" src="/assets/fotos/beso.jpg" data-lz-src="photo:4" alt="" loading="lazy">' +
      '<div class="fin-panel arch"><span class="fin-mono" data-lz-seal><span class="lz-seal">A<i>&amp;</i>L</span></span><p class="sig" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</p><p class="fin-n">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p><p class="k k-light" data-lz-date="' + S.numPat + '">' + S.numTxt + '</p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#itinerario">' + S.program + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></div></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
