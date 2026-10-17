
/* Plantilla Señal: una tele de los años cincuenta que reserva la fecha. Al abrir el enlace la tele se enciende sola y pasa
   cuatro canales (cada uno una foto del editor con una palabra y, al final, la fecha); luego se apaga en una línea de luz
   y queda la estática. Al tocar «Abrir la invitación» la vista entra por la pantalla y empieza la transmisión. El gabinete y la perilla son imágenes transparentes; la pantalla y
   los contenidos siguen siendo HTML editable; el fondo cambia con la paleta, la tele y el oro no. Fotos siempre en blanco y negro.
   El HTML se arma aquí ANTES de cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Están invitados a la boda de', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en una tele antigua', open: 'Abrir la invitación', knob: 'Cambiar de canal', knobHint: 'Gira la perilla para cambiar de canal', for: 'Para',
      words: ['Reserva', 'la', 'fecha'], channel: 'Canal', y: 'y', amp: '&amp;', guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', live: 'En vivo', photoAlt: 'Ana y León',
      wedding: 'Nuestra boda', chPat: '{dd}.{mm}.{Y}', chTxt: '14.03.2027', numPat: '{dd} · {mm} · {Y}', numTxt: '14 · 03 · 2027', dayPat: '{W} {d} de {M} de {Y}', dayTxt: 'Domingo 14 de marzo de 2027',
      confirm: 'Confirmar asistencia', program: 'Programa', seeProgram: 'Ver la programación', confirmShort: 'Confirmar', travelShort: 'Viaje', sections: 'Secciones',
      msgK: 'Mensaje especial', msgS: 'para ustedes', msg: 'Nos casamos y queremos celebrarlo con ustedes en uno de los días más especiales de nuestras vidas.',
      cdK: 'Cuenta regresiva', cdS: 'al gran estreno', units: ['Días', 'Horas', 'Min', 'Seg'], cdNote: 'Cada vez falta menos para celebrar juntos.',
      liveFrom: 'En vivo desde', map: 'Ver en el mapa', how: 'Cómo llegar', progK: 'Guía de programación', progS: 'el gran día',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      storyK: 'Episodio piloto', storyTitle: 'nuestra historia', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      galK: 'Nuestro archivo', galS: 'momentos para volver a ver', allPhotos: 'Ver todas las fotos',
      dressK: 'Vestuario', dressS: 'código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'blanco y marfil',
      travelK: 'Para llegar', travelS: 'viaje y hotel', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      airportL: 'Aeropuerto', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Traslados', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Guía de la zona', foodL: 'Dónde comer', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Qué ver', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Planes', plans: 'Hierve el Agua y Monte Albán.',
      hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Preguntas del público', faqS: 'dudas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil, reservados para la novia.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpK: 'Confirma tu lugar', rsvpS: 'en primera fila', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 lugares', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.', rsvpWord: '¿vienes?',
      yes: 'Asistiré', no: 'No podré ir', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para',
      thanks: '¡Gracias!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.', fin: 'Fin de la transmisión',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'You’re invited to the wedding of', envClosing: 'With all our love', openAria: 'Invitation on a vintage TV', open: 'Open invitation', knob: 'Change channel', knobHint: 'Turn the dial to change channel', for: 'For',
      words: ['Save', 'the', 'date'], channel: 'Channel', y: 'and', amp: '&amp;', guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', live: 'Live', photoAlt: 'Anna and Leo',
      wedding: 'Our wedding', chPat: '{mm}.{dd}.{Y}', chTxt: '03.14.2027', numPat: '{mm} · {dd} · {Y}', numTxt: '03 · 14 · 2027', dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027',
      confirm: 'RSVP', program: 'Schedule', seeProgram: 'See the schedule', confirmShort: 'RSVP', travelShort: 'Travel', sections: 'Sections',
      msgK: 'Special message', msgS: 'for you', msg: 'We’re getting married and want to celebrate with you on one of the most special days of our lives.',
      cdK: 'Countdown', cdS: 'to the big premiere', units: ['Days', 'Hours', 'Min', 'Sec'], cdNote: 'Every day brings us closer to celebrating together.',
      liveFrom: 'Live from', map: 'See on the map', how: 'Directions', progK: 'TV guide', progS: 'the big day',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      storyK: 'Pilot episode', storyTitle: 'our story', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      galK: 'Our archive', galS: 'moments worth watching again', allPhotos: 'See all photos',
      dressK: 'Wardrobe', dressS: 'dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'white and ivory',
      travelK: 'Getting there', travelS: 'travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      airportL: 'Airport', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Where to eat', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'What to see', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Plans', plans: 'Hierve el Agua and Monte Albán.',
      hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Audience questions', faqS: 'questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory, reserved for the bride.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpK: 'Save your seat', rsvpS: 'in the front row', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats', rsvpMsg: 'Let us know who from this invitation can join us.', rsvpWord: 'coming?',
      yes: 'Attending', no: 'Can’t make it', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for',
      thanks: 'Thank you!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.', fin: 'End of broadcast',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.SenalS = S;

  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M5 11 11 5M6 5h5v5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var BIG = function (d) { return '<svg class="tic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M28 4c-1.4-1.4-4.1-.2-5.5 1.2l-5.2 5.2L7 7 4 10l9 5-5 5-4-1-2 2 6 3 3 6 2-2-1-4 5-5 5 9 3-3-3.4-10.3 5.2-5.2C28.2 8.1 29.4 5.4 28 4Z'), I_BUS = BIG('M7 6h18a2 2 0 0 1 2 2v14H5V8a2 2 0 0 1 2-2zM5 15h22M10 22v3M22 22v3');
  var I_SEE = BIG('M5 12 16 5l11 7zM7 13v10M12 13v10M20 13v10M25 13v10M4 26h24'), I_FOOD = BIG('M10 4v9a3 3 0 0 0 6 0V4M13 4v24M22 4c-3 2-3 8 0 10v14'), I_PLAN = BIG('M4 24 12 11l5 7 4-5 7 11z');
  var STAR = '<svg class="star" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 0C8.6 5 11 7.4 16 8C11 8.6 8.6 11 8 16C7.4 11 5 8.6 0 8C5 7.4 7.4 5 8 0Z"/></svg>';
  var DIV = '<div class="dv" aria-hidden="true"><span></span>' + STAR + '<span></span></div>';
  // Fixed-resolution noise is drawn only during brief channel changes.
  var STATIC = '<canvas class="static" width="160" height="120" aria-hidden="true"></canvas>';
  var PHOTOS = ['escalera', 'beso', 'muro', 'torre'];
  var channels = PHOTOS.map(function (f, i) {
    var word = i < 3 ? '<span class="word">' + S.words[i] + '</span>' : '<span class="word date" data-lz-date="' + S.chPat + '">' + S.chTxt + '</span>';
    return '<span class="ch" data-ch="' + (i + 1) + '"><img src="/assets/fotos/' + f + '.jpg" data-lz-src="photo:' + i + '" alt="" decoding="async">' + word + '<span class="osd">' + S.channel + ' ' + (i + 1) + '</span></span>';
  }).join('');
  // La pantalla editable queda bajo el gabinete fotografiado y la perilla interactiva.
  var tv = function (cls, screen, knobBtn) {
    return '<div class="tv ' + (cls || '') + '"><div class="tv-in"><div class="bez"><div class="scr">' + screen + '<span class="lines" aria-hidden="true"></span></div></div>' +
      '<div class="side" aria-hidden="' + (knobBtn ? 'false' : 'true') + '">' + (knobBtn ? '<button type="button" class="kb" id="knob" aria-label="' + S.knob + '"><span class="knob"></span></button>' : '<span class="kb"><span class="knob"></span></span>') +
      '<span class="ctl"><i></i><i></i><i></i></span><span class="sw"></span><span class="grill"></span><span class="dots"><i></i><i></i><i></i></span></div></div></div>';
  };
  var crt = function (cls, src, n, alt, extra) { return '<div class="crt ' + cls + '"><div><img src="/assets/fotos/' + src + '.jpg" data-lz-src="photo:' + n + '" alt="' + (alt || '') + '" loading="lazy"><span class="lines" aria-hidden="true"></span>' + (extra || '') + '</div></div>'; };
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var MONO = '<span data-lz-mono>A<i> &amp; </i>L</span>';
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };
  var hd = function (k, s, cls) { return '<div class="hd ' + (cls || '') + '"><h2 class="k">' + k + '</h2><span class="sc">' + s + '</span></div>'; };
  var LIVE = function (city) { return '<span class="live"><span class="dot" aria-hidden="true"></span>' + S.live + (city ? ' · <span data-lz="city">' + S.city + '</span>' : '') + '</span>'; };

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: la tele =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="op-top"><p class="k light op-intro" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p><p class="op-names"><span data-lz="n1">' + S.n1 + '</span> ' + S.amp + '<br><span class="n2" data-lz="n2">' + S.n2 + '</span></p>' + DIV + '</div>' +
    '<div class="tv-wrap" id="tvWrap">' + tv('big', '<span class="blank"></span>' + channels + '<span class="off"></span>' + STATIC, true) + '</div><p class="knob-hint">' + S.knobHint + '</p>' +
    '<div class="op-foot"><p class="k">' + S.for + '</p><p class="op-guest">' + S.guest + '</p>' +
      '<button type="button" class="pill line" id="enter">' + STAR + S.open + STAR + '</button>' +
      '<p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono sc" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '">' + MONO + '</a><nav aria-label="' + S.sections + '"><a href="#horario">' + S.program + '</a><a class="pill gold" href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada"><div class="hero-txt"><p class="k light">' + S.wedding + '</p><h1 class="names sc" tabindex="-1">' + N('n1') + ' <span class="amp">' + S.amp + '</span> ' + N('n2') + '</h1>' + DIV +
        '<p class="hero-d m" data-lz-date="' + S.numPat + '">' + S.numTxt + '</p><p class="hero-d d" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><p class="k mute hero-c" data-lz="city">' + S.city + '</p>' +
        '<div class="hero-ctas"><a class="pill gold" href="#rsvp">' + S.confirm + '</a><a class="lnk hero-prog" href="#horario">' + S.seeProgram + '</a></div></div>' +
      '<div class="hero-ph">' + crt('c-hero', 'beso', 0, S.photoAlt, LIVE(true)) + '</div></section>' +

    '<section class="sec alt welcome"><div class="wel" data-rv>' + hd(S.msgK, S.msgS) + '<p class="lead" data-lz="msg">' + S.msg + '</p>' + DIV + '</div></section>' +

    '<section class="sec cd"><div class="cd-head">' + hd(S.cdK, S.cdS) + '<p class="mute cd-note" data-lz="countdownNote">' + S.cdNote + '</p></div>' +
      '<div class="panel" role="timer" aria-live="off"><div class="digits">' + S.units.map(function (u, i) { return (i ? '<span class="colon" aria-hidden="true">:</span>' : '') + '<div class="dg"><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div><span class="lines" aria-hidden="true"></span></div></section>' +

    '<section class="sec alt pair"><div class="place" id="where" data-rv><p class="live-from"><span class="dot" aria-hidden="true"></span>' + S.liveFrom + '</p><p class="pl-n" id="whereName">' + S.events[0][2] + '</p><p class="mute" id="whereAddr">' + S.events[0][3] + '</p>' +
        '<a class="pill line" id="whereMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + '</a></div>' +
      '<div class="guide-tv" id="horario" data-lz-anchor="itinerario musica">' + hd(S.progK, S.progS) +
        '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv><div class="ev-l"><p class="ev-time" data-lz-f="time">' + e[0] + '</p></div><div><h3 data-lz-f="name">' + e[1] + '</h3><p class="mute"><span data-lz-f="place">' + e[2] + '</span><span class="ev-a"> · <span data-lz-f="address">' + e[3] + '</span></span></p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div></li>'; }).join('') + '</ol></div>' +
    '</section>' +

    '<section class="sec story" id="historia" data-lz-anchor="historia">' + crt('c-story', 'escalera', 1, '') +
      '<div class="st-txt">' + hd(S.storyK, '<span data-lz="storyTitle">' + S.storyTitle + '</span>') + '<p class="p" data-lz="story">' + S.storyTxt + '</p><p class="sc sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p></div></section>' +

    '<section class="sec alt gal" id="galeria"><div class="gal-head">' + hd(S.galK, S.galS) + '<button type="button" class="pill line gal-all d" data-gallery-open>' + S.allPhotos + '</button></div>' +
      '<div class="grid" data-lz-list="gallery">' + ['paseo', 'torre', 'muro', 'beso', 'escalera'].map(function (f) { return '<div class="crt tile" data-lz-item data-rv><div><img data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy"><span class="lines" aria-hidden="true"></span></div></div>'; }).join('') + '</div>' +
      '<button type="button" class="pill line gal-all m" data-gallery-open>' + S.allPhotos + '</button></section>' +

    '<section class="sec dress" data-lz-group="dressCode dressNotes dressColors"><div class="dress-in" data-rv>' + hd(S.dressK, S.dressS) + '<p class="dr-c" data-lz="dressCode">' + S.dressCode + '</p><p class="p" data-lz="dressNotes">' + S.dressNotes + '</p>' +
      '<div data-lz-group="dressColors">' + DIV + '<p class="p"><b>' + S.reserved + '</b> <span data-lz="dressColors">' + S.dressColors + '</span>.</p></div></div></section>' +

    '<section class="sec alt travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="tr-a">' + hd(S.travelK, S.travelS) + '<p class="p" data-lz="travelIntro">' + S.travelIntro + '</p><div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div></div>' +
      '<div class="tr-b"><div class="hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="k">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p class="mute" data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="mute" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="pill gold" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="mute demo-booking">' + S.demoBooking + '</p></div></div>' +
      '<div class="tr-c guide" data-lz-group="guideFood guideCulture guidePlans"><p class="k">' + S.guideK + '</p>' + info(I_SEE, 'guideCulture', S.cultureL, S.culture) + info(I_FOOD, 'guideFood', S.foodL, S.food) + info(I_PLAN, 'guidePlans', S.plansL, S.plans) + '</div>' +
    '</section>' +

    '<section class="sec quote" data-lz-group="quote"><div class="quote-in" data-rv>' + DIV + '<blockquote>«<span data-lz="quote">' + S.quote + '</span>»</blockquote><p class="k" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec alt faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty>' + hd(S.faqK, S.faqS) +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span><span class="pm" aria-hidden="true"></span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec rsvp" id="rsvp" data-lz-anchor="rsvp"><div class="rs-side">' + hd(S.rsvpK, S.rsvpS) + '<p class="mute rs-msg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p>' +
        '<div class="rs-signature" aria-hidden="true">' + STAR + '<span class="sc">' + MONO + '</span><span class="rs-line"></span></div>' + '</div>' +
      '<div class="rs-form"><p class="rs-for"><b>' + S.guest + '</b><span>' + S.seatsRes + '</span></p><p class="chipd" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
        '<div id="rsForm"><div id="people"></div>' +
          '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
          '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><div class="rs-send"><button type="button" class="pill gold" id="rsSave">' + S.send + '</button><p class="mute demo-note">' + S.demoNote + '</p></div></div>' +
        '<div id="rsDone" hidden>' + STAR + '<p class="sc thanks">' + S.thanks + '</p><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      '</div></section>' +

    '<section class="sec alt fin">' + tv('fin-tv', '<span class="off on"></span>') + '<p class="k fin-k">' + S.fin + '</p>' +
      '<p class="sc fin-n">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p><p class="fin-d"><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#horario">' + S.program + '</a><a href="#viaje" data-lz-show="viajeOn">' + S.travelShort + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
