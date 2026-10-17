
/* Plantilla Estreno: la boda como noche de estreno. Papel marfil, fotos en blanco y negro, terciopelo y
   bombillas de marquesina. Todo es CSS y SVG (sin imágenes propias): cambia con la paleta.
   El HTML se arma aquí ANTES de cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una noche de estreno', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación dentro de una funda de terciopelo', open: 'Abrir la invitación', hint: 'o toca la funda', admit: 'Admite a',
      seats: '4 cupos', y: 'y', show: 'Estreno', single: 'Función única',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      coverPat: '{W} {d} de {M} de {Y}', coverTxt: 'Domingo 14 de marzo de 2027', dayPat: '{d}', dayTxt: '14', monPat: '{M}', monTxt: 'marzo', endPat: '{dd}.{mm}.{Y}', endTxt: '14.03.2027',
      confirm: 'Confirmar asistencia', seeProg: 'Ver el programa', program: 'Programa', confirmShort: 'Confirmar', sections: 'Secciones',
      storyK: 'Antes del estreno', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.', forG: 'Para',
      galK: 'Fotogramas', galT: 'Escenas favoritas', allPhotos: 'Ver todas las fotos', prev: 'Fotograma anterior', next: 'Fotograma siguiente',
      cdK: 'En cartelera', cdT: 'Falta poco', units: ['Días', 'Horas', 'Min', 'Seg'], cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', monthPat: '{M} {Y}', monthTxt: 'marzo 2027', wd: ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'],
      progK: 'Programa de la función', progT: 'El día', map: 'Ver en el mapa',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      salaK: 'La sala', salaT: 'Te esperamos',
      dressK: 'Vestuario', dressT: 'Qué ponerse', dressCodeK: 'Código', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Reservado:', dressColors: 'Blanco y marfil',
      travelK: 'Para llegar a la función', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      airportL: 'En avión', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Qué hacer en la ciudad', foodL: 'Restaurantes', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades', plans: 'Hierve el Agua y Monte Albán.',
      stayK: 'Dónde dormir', hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Notas del programa', faqT: 'Preguntas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpK: 'Reserva tu butaca', rsvpT: '¿Nos acompañas?', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 butacas a su nombre', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Ahí estaré', no: 'No podré ir', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos en el estreno.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.',
      fin: 'Fin', finTxt: '…y el comienzo. Nos vemos en el estreno.',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An opening night', envClosing: 'With all our love', openAria: 'Invitation inside a velvet sleeve', open: 'Open the invitation', hint: 'or tap the sleeve', admit: 'Admit',
      seats: '4 seats', y: '&', show: 'Premiere', single: 'One night only',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      coverPat: '{W}, {Mc} {d}, {Y}', coverTxt: 'Sunday, March 14, 2027', dayPat: '{d}', dayTxt: '14', monPat: '{Mc}', monTxt: 'March', endPat: '{mm}.{dd}.{Y}', endTxt: '03.14.2027',
      confirm: 'RSVP', seeProg: 'See the program', program: 'Program', confirmShort: 'RSVP', sections: 'Sections',
      storyK: 'Before the premiere', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.', forG: 'For',
      galK: 'Film frames', galT: 'Favorite scenes', allPhotos: 'See all photos', prev: 'Previous frame', next: 'Next frame',
      cdK: 'Now showing', cdT: 'Almost there', units: ['Days', 'Hours', 'Min', 'Sec'], cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', monthPat: '{Mc} {Y}', monthTxt: 'March 2027', wd: ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'],
      progK: 'Tonight’s program', progT: 'The day', map: 'See on the map',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      salaK: 'The venue', salaT: 'We’ll see you at',
      dressK: 'Wardrobe', dressT: 'What to wear', dressCodeK: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved:', dressColors: 'White and ivory',
      travelK: 'Getting to the show', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      airportL: 'By plane', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Restaurants', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities', plans: 'Hierve el Agua and Monte Albán.',
      stayK: 'Where to stay', hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Program notes', faqT: 'Questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpK: 'Save your seat', rsvpT: 'Will you join us?', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats in your name', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'I’ll be there', no: 'Can’t make it', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you at the premiere.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.',
      fin: 'The End', finTxt: '…and the beginning. See you at the premiere.',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.EstrenoS = S;

  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M5 11 11 5M6 5h5v5'), DOWN = ICO('M8 3v10M4 9l4 4 4-4'), PREV = ICO('M10 3.5 5.5 8l4.5 4.5'), NEXT = ICO('M6 3.5 10.5 8 6 12.5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var BIG = function (d) { return '<svg class="tic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M2.5 13.5 21 6l-2.4 4.6-6 2.2 1.5 6-2.2.8-3-5.3-3.8 1.4z'), I_BUS = BIG('M5 4h14a2 2 0 0 1 2 2v10H3V6a2 2 0 0 1 2-2zM3 11h18M7 16v2.5M17 16v2.5M7 13.5h.01M17 13.5h.01'), I_PIN = BIG('M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11zM12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z');
  var HEART = '<svg class="heart" viewBox="0 0 46 42" aria-hidden="true" focusable="false"><path d="M23 39C8 29 2 20 5 12c3-7 12-8 18-1 6-7 15-6 18 1 3 8-3 17-18 27Z"/></svg>';
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var MONO = '<span data-lz-seal><span class="lz-seal">A<i>·</i>L</span></span>';
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: la tarjeta sale de su funda de terciopelo =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="op-stage">' +
      '<div class="op-card" aria-hidden="true"><p class="op-card-k">' + S.show + '</p><div class="op-card-ph"><img src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="" decoding="async"></div><p class="op-card-names">' + N('n1') + ' <em>' + S.y + '</em> ' + N('n2') + '</p></div>' +
      '<button type="button" class="op-sleeve" id="sleeve" aria-label="' + S.open + '">' +
        '<span class="op-intro" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</span>' +
        '<span class="op-cut" aria-hidden="true"><span class="op-day" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</span><span class="op-mon" data-lz-date="' + S.monPat + '">' + S.monTxt + '</span></span>' +
        '<span class="op-names">' + N('n1') + ' <em>' + S.y + '</em> ' + N('n2') + '</span>' +
      '</button>' +
    '</div>' +
    '<div class="op-ticket"><p class="op-admit">' + S.admit + '</p><p class="op-guest">' + S.guest + '</p><p class="op-seats">' + S.seats + '</p>' +
      '<button type="button" class="btn btn-light" id="enter">' + S.open + DOWN + '</button><p class="op-hint" id="hint">' + S.hint + '</p>' +
      '<p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '">' + MONO + '</a><nav aria-label="' + S.sections + '"><a href="#itinerario">' + S.program + '</a><a class="mbar-cta" href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada">' +
      '<div class="marquee hero-ph"><div class="ph bw"><img class="ph-img" id="heroImg" fetchpriority="high" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" decoding="async"></div></div>' +
      '<div class="hero-txt"><p class="k">' + S.show + ' · ' + S.single + '</p>' +
        '<h1 class="names" tabindex="-1">' + N('n1') + ' <em>' + S.y + '</em> ' + N('n2') + '</h1>' +
        '<p class="hero-date"><b data-lz-date="' + S.coverPat + '">' + S.coverTxt + '</b><span data-lz="city">' + S.city + '</span></p>' +
        '<div class="hero-act"><a class="btn" href="#rsvp">' + S.confirm + '</a><a class="lnk" href="#itinerario">' + S.seeProg + DOWN + '</a></div></div>' +
    '</section>' +

    '<section class="sec story" id="historia" data-lz-anchor="historia" data-gallery="mono">' +
      '<div class="story-art"><span class="initials" data-lz-seal aria-hidden="true"><span class="lz-seal"><span>A</span><span>L</span></span></span><div class="torn" aria-hidden="true"></div><div class="story-ph bw" data-rv><img class="ph-img" src="/assets/fotos/escalera.jpg" data-lz-src="photo:1" alt="" loading="lazy"></div></div>' +
      '<div class="story-txt"><p class="k">' + S.storyK + '</p><h2 data-lz="storyTitle">' + S.storyTitle + '</h2>' +
        '<p class="lead" data-lz="msg">' + S.msg + '</p><p data-lz="story">' + S.storyTxt + '</p></div>' +
    '</section>' +

    '<section class="sec gal" id="galeria" data-gallery="mono">' +
      '<div class="gal-head"><div><p class="k">' + S.galK + '</p><h2>' + S.galT + '</h2></div><div class="gal-nav"><button type="button" class="round" data-strip="-1" aria-label="' + S.prev + '">' + PREV + '</button><button type="button" class="round" data-strip="1" aria-label="' + S.next + '">' + NEXT + '</button></div></div>' +
      '<div class="film"><div class="strip" id="strip" data-lz-list="gallery">' + ['beso', 'escalera', 'muro', 'torre', 'paseo'].map(function (f) { return '<div class="frame bw" data-lz-item><img class="ph-img" data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy"></div>'; }).join('') + '</div></div>' +
      '<div class="gal-foot"><button type="button" class="btn btn-dark" data-gallery-open>' + S.allPhotos + '</button></div>' +
    '</section>' +

    '<section class="sec velvet cd">' +
      '<p class="k k-bulb">' + S.cdK + '</p><h2>' + S.cdT + '</h2>' +
      '<div class="board" role="timer" aria-live="off">' + S.units.map(function (u, i) { return '<div class="tile"><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' +
      '<p class="cd-when"><span data-lz="cdName">' + S.cdName + '</span> · <span data-lz="time0">' + S.time0 + '</span></p>' +
      '<div class="cal"><p class="cal-m" data-lz-date="' + S.monthPat + '">' + S.monthTxt + '</p><div class="week" id="week">' + [0, 1, 2, 3, 4, 5, 6].map(function () { return '<b></b>'; }).join('') + '</div></div>' +
      '<p class="cd-note" data-lz="countdownNote">' + S.cdNote + '</p>' +
    '</section>' +

    '<section class="sec prog" id="itinerario" data-lz-anchor="itinerario musica">' +
      '<p class="k">' + S.progK + '</p><h2>' + S.progT + '</h2>' +
      '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv><p class="ev-time" data-lz-f="time">' + e[0] + '</p><div class="ev-body"><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="mute" data-lz-f="address">' + e[3] + '</p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div></li>'; }).join('') + '</ol>' +
    '</section>' +

    '<section class="sec sala" aria-labelledby="salaName"><div class="beams" aria-hidden="true"><i></i><i></i></div>' +
      '<p class="k k-bulb">' + S.salaK + '</p><h2>' + S.salaT + '</h2>' +
      '<div class="sign"><p id="salaName">' + S.events[0][2] + '</p></div><p class="sala-addr" id="salaAddr">' + S.events[0][3] + '</p>' +
      '<a class="btn btn-light" id="salaMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a>' +
    '</section>' +

    '<section class="sec dress" data-lz-group="dressCode dressNotes dressColors"><p class="k">' + S.dressK + '</p><h2>' + S.dressT + '</h2>' +
      '<div class="ticket" data-rv><p class="k">' + S.dressCodeK + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="acc" data-lz-group="dressColors">' + S.reserved + ' <span data-lz="dressColors">' + S.dressColors + '</span></p></div>' +
    '</section>' +

    '<section class="sec velvet quote" data-lz-group="quote">' + HEART +
      '<blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="k k-bulb" data-lz="quoteAuthor">' + S.quoteAuthor + '</p>' +
    '</section>' +

    '<section class="sec travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="travel-main"><p class="k">' + S.travelK + '</p><h2>' + S.travel + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p>' +
        '<div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div>' +
        '<div class="guide" data-lz-group="guideFood guideCulture guidePlans"><p class="k">' + S.guideK + '</p>' + info(I_PIN, 'guideFood', S.foodL, S.food) + info(I_PIN, 'guideCulture', S.cultureL, S.culture) + info(I_PIN, 'guidePlans', S.plansL, S.plans) + '</div></div>' +
      '<div class="stay"><p class="k k-ink">' + S.stayK + '</p><div class="hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="k">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="mute" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="lnk" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="mute demo-booking">' + S.demoBooking + '</p></div></div>' +
    '</section>' +

    '<section class="sec dark faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty><p class="k k-bulb">' + S.faqK + '</p><h2>' + S.faqT + '</h2>' +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec rsvp" id="rsvp" data-lz-anchor="rsvp"><div class="seat" data-rv>' + HEART +
      '<p class="k">' + S.rsvpK + '</p><h2>' + S.rsvpT + '</h2>' +
      '<p class="chip" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
      '<p class="seat-for"><b>' + S.guest + '</b> · ' + S.seatsRes + '</p>' +
      '<div id="rsForm"><p class="mute" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><button type="button" class="btn" id="rsSave">' + S.send + '</button></div>' +
      '<div id="rsDone" hidden><p class="thanks">' + S.thanks + '</p><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      '<p class="mute demo-note">' + S.demoNote + '</p></div></section>' +

    '<section class="sec fin"><div class="fin-mono" aria-hidden="true">' + MONO + '</div><p class="fin-t">' + S.fin + '</p><p class="fin-s">' + S.finTxt + '</p>' +
      '<p class="k k-bulb">' + N('n1') + ' ' + S.y + ' ' + N('n2') + ' · <span data-lz-date="' + S.endPat + '">' + S.endTxt + '</span></p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#itinerario">' + S.program + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
