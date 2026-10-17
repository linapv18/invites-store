
/* Plantilla Ónix: blanco y negro editorial. La invitación llega en un sobre negro sellado con lacre; al tocarlo se abre la
   solapa, por dentro el sobre está forrado con la foto de la pareja y la vista entra en el forro hasta que esa foto es la
   portada. El sobre, el lacre, el relicario y la bandeja son CSS/SVG (el sobre y las bandas cambian con la paleta; el lacre
   y la plata no). Las fotos siempre van en blanco y negro. El HTML se arma aquí ANTES de cargar demo/shared/content.js,
   para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en un sobre negro', open: 'Abrir la invitación', hint: 'o toca el sobre', for: 'Para',
      y: 'y', amp: '&amp;', guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', msg: 'Nos casamos y queremos celebrarlo con ustedes en uno de los días más especiales de nuestras vidas.', photoAlt: 'Ana y León',
      heroPat: '{d} de {M} de {Y}', heroTxt: '14 de marzo de 2027', dayPat: '{W} {d} de {M} de {Y}', dayTxt: 'Domingo 14 de marzo de 2027', dmPat: '{dd} · {mm}', dmTxt: '14 · 03', yPat: '{Y}', yTxt: '2027', numPat: '{dd} · {mm} · {Y}', numTxt: '14 · 03 · 2027',
      confirm: 'Confirmar asistencia', program: 'Horario', confirmShort: 'Confirmar', travelShort: 'Viaje', sections: 'Secciones',
      dear: '¡Queridos familiares<br>y amigos!',
      cdK: 'Faltan para', cdS: 'nuestra boda', units: ['días', 'horas', 'minutos', 'segundos'], cdNote: 'Cada vez falta menos para celebrar juntos.',
      placeT: 'Lugar de la celebración', map: 'Ver en el mapa', how: 'Cómo llegar', progT: 'Horario',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      storyA: 'Nuestra', storyB: 'historia', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      galA: 'Galería', galB: 'momentos', allPhotos: 'Ver todas las fotos',
      dressA: 'Código', dressB: 'de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'blanco y marfil',
      travelA: 'Viaje y', travelB: 'alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      airportL: 'Aeropuerto', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Traslados', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Guía de la zona', foodL: 'Dónde comer', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Qué ver', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Planes', plans: 'Hierve el Agua y Monte Albán.',
      hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      tray: 'detalles', faqT: 'Preguntas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpT: 'Confirmación<br>de asistencia', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 lugares', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistiré', no: 'No podré ir', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para',
      thanks: 'gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.', love: 'con amor',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation in a black envelope', open: 'Open the invitation', hint: 'or tap the envelope', for: 'For',
      y: 'and', amp: '&amp;', guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', msg: 'We’re getting married and want to celebrate with you on one of the most special days of our lives.', photoAlt: 'Anna and Leo',
      heroPat: '{Mc} {d}, {Y}', heroTxt: 'March 14, 2027', dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', dmPat: '{mm} · {dd}', dmTxt: '03 · 14', yPat: '{Y}', yTxt: '2027', numPat: '{mm} · {dd} · {Y}', numTxt: '03 · 14 · 2027',
      confirm: 'RSVP', program: 'Schedule', confirmShort: 'RSVP', travelShort: 'Travel', sections: 'Sections',
      dear: 'Dear family<br>and friends!',
      cdK: 'Counting down to', cdS: 'our wedding', units: ['days', 'hours', 'minutes', 'seconds'], cdNote: 'Every day brings us closer to celebrating together.',
      placeT: 'The venue', map: 'See on the map', how: 'Directions', progT: 'Schedule',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      storyA: 'Our', storyB: 'story', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      galA: 'Gallery', galB: 'moments', allPhotos: 'See all photos',
      dressA: 'Dress', dressB: 'code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'white and ivory',
      travelA: 'Travel and', travelB: 'stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      airportL: 'Airport', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Where to eat', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'What to see', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Plans', plans: 'Hierve el Agua and Monte Albán.',
      hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      tray: 'details', faqT: 'Questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpT: 'Kindly<br>reply', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Can’t make it', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for',
      thanks: 'thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.', love: 'with love',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.OnixS = S;

  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M5 11 11 5M6 5h5v5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var BIG = function (d) { return '<svg class="tic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M4 18 28 8l-3 6-8 3 2 8-3 1-4-7-5 2-2-3z'), I_BUS = BIG('M7 6h18a2 2 0 0 1 2 2v14H5V8a2 2 0 0 1 2-2zM5 15h22M10 22v3M22 22v3');
  var I_SEE = BIG('M5 12 16 5l11 7zM7 13v10M12 13v10M20 13v10M25 13v10M4 26h24'), I_FOOD = BIG('M10 4v9a3 3 0 0 0 6 0V4M13 4v24M22 4c-3 2-3 8 0 10v14'), I_PLAN = BIG('M4 24 12 11l5 7 4-5 7 11z');

  // Lacre marfil con una ramita en relieve (no cambia con la paleta).
  var SEAL = '<svg class="seal" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><radialGradient id="oxWax" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#F7EFE4"/><stop offset=".6" stop-color="#E2D2BE"/><stop offset="1" stop-color="#C6B095"/></radialGradient></defs>' +
    '<path d="M50 3C62 2 70 8 78 12C88 17 90 26 95 34C99 43 96 52 97 60C97 70 90 77 84 84C77 91 68 94 58 97C49 99 40 98 32 94C23 90 15 85 10 77C5 68 3 59 3 50C2 40 6 31 11 23C17 15 25 9 34 5C40 3 45 3 50 3Z" fill="url(#oxWax)"/>' +
    '<circle cx="50" cy="50" r="30" fill="none" stroke="#BCA487" stroke-width="2.5"/><circle cx="50" cy="50" r="26" fill="#E5D6C3"/>' +
    '<path d="M50 70V31M50 40C46 39 43 37 41 33M50 40C54 39 57 37 59 33M50 49C45 48 42 46 40 42M50 49C55 48 58 46 60 42M50 58C45 57 42 55 40 52M50 58C55 57 58 55 60 52" stroke="#A58D6B" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  // Sobre negro: fondo, forro (la foto 1) en la solapa y en el fondo, bolsillo y solapa con el lacre.
  var envelope = function (cls, liner) {
    return '<span class="env ' + cls + '">' +
      (liner ? '<span class="liner"><img src="/assets/fotos/beso.jpg" data-lz-src="photo:0" alt="" decoding="async"></span>' : '') +
      '<svg class="pocket" viewBox="0 0 310 206" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="e2" d="M0 0 150 106 0 206Z"/><path class="e2" d="M310 0 160 106 310 206Z"/><path class="e3" d="M0 206 155 112 310 206Z"/><path d="M0 206 155 112 310 206" fill="none" stroke="#000" stroke-opacity=".55"/></svg>' +
      '<span class="flap">' + (liner ? '<span class="flap-in"><img src="/assets/fotos/beso.jpg" data-lz-src="photo:0" alt="" decoding="async"></span>' : '') +
        '<svg class="flap-out" viewBox="0 0 310 122" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="e4" d="M0 0H310L155 122Z"/><path d="M0 0 155 122 310 0" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1.5"/></svg>' + SEAL + '</span>' +
    '</span>';
  };
  var HEART = 'M54 96C21 72 4 54 4 32C4 16 17 5 31 5C41 5 49 11 54 19C59 11 67 5 77 5C91 5 104 16 104 32C104 54 87 72 54 96Z';
  var heart = function (cls, n, src) {
    return '<span class="lk ' + cls + '"><img src="/assets/fotos/' + src + '.jpg" data-lz-src="photo:' + n + '" alt="" loading="lazy">' +
      '<svg viewBox="0 0 108 101" aria-hidden="true" focusable="false"><path d="' + HEART + '" fill="none" stroke="url(#oxSilver)" stroke-width="7"/><path d="M54 90C25 69 10 53 10 33C10 19 21 11 31 11C40 11 48 17 54 25C60 17 68 11 77 11C87 11 98 19 98 33C98 53 83 69 54 90Z" fill="none" stroke="#5E5E5B" stroke-width="1"/></svg></span>';
  };
  var SILVER = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="oxSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6F6F4"/><stop offset=".35" stop-color="#9E9E9B"/><stop offset=".55" stop-color="#EDEDEB"/><stop offset=".8" stop-color="#858582"/><stop offset="1" stop-color="#D6D6D3"/></linearGradient>' +
    '<linearGradient id="oxTray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6F6F4"/><stop offset=".3" stop-color="#A3A3A0"/><stop offset=".52" stop-color="#EFEFED"/><stop offset=".78" stop-color="#8A8A87"/><stop offset="1" stop-color="#DADAD7"/></linearGradient>' +
    '<linearGradient id="oxTray2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2D2CF"/><stop offset="1" stop-color="#A2A29F"/></linearGradient></defs></svg>';
  var TRAY = '<div class="tray" aria-hidden="true"><svg viewBox="0 0 330 236" focusable="false"><circle cx="30" cy="30" r="20" fill="url(#oxTray)"/><circle cx="300" cy="30" r="20" fill="url(#oxTray)"/><circle cx="30" cy="206" r="20" fill="url(#oxTray)"/><circle cx="300" cy="206" r="20" fill="url(#oxTray)"/>' +
    '<ellipse cx="165" cy="16" rx="40" ry="12" fill="url(#oxTray)"/><ellipse cx="165" cy="220" rx="40" ry="12" fill="url(#oxTray)"/><rect x="16" y="16" width="298" height="204" rx="44" fill="url(#oxTray)"/>' +
    '<rect x="27" y="27" width="276" height="182" rx="34" fill="none" stroke="#F8F8F6" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 9"/><rect x="36" y="36" width="258" height="164" rx="26" fill="url(#oxTray2)"/><rect x="44" y="44" width="242" height="148" rx="20" fill="#C9C9C6" stroke="#9A9A97"/></svg>' +
    '<span class="tray-card"><span class="scr">' + S.tray + '</span></span></div>';

  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var MONO = function (cls) { return '<span class="mg ' + (cls || '') + '" data-lz-mono aria-hidden="true"><b>A</b><b>L</b></span>'; };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };
  var duo = function (a, b) { return '<div class="duo"><h2>' + a + '</h2><span class="scr">' + b + '</span></div>'; };

  document.getElementById('app').innerHTML = SILVER +
  // ======================= APERTURA: el sobre negro =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="paper"><p class="op-intro" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p><p class="op-names">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p></div>' +
    '<button type="button" class="env-btn" id="envBtn" aria-label="' + S.open + '">' + envelope('big', true) + '</button>' +
    '<div class="paper op-foot"><p class="k">' + S.for + '</p><p class="op-guest">' + S.guest + '</p>' +
      '<button type="button" class="pill line" id="enter">' + S.open + '</button><p class="k op-hint">' + S.hint + '</p>' +
      '<p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '">' + MONO() + '</a><nav aria-label="' + S.sections + '"><a href="#horario">' + S.program + '</a><a class="pill solid" href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada"><img class="hero-img" src="/assets/fotos/beso.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" decoding="async">' +
      '<nav class="hero-nav" aria-label="' + S.sections + '">' + MONO() + '<span><a href="#horario">' + S.program + '</a><a href="#viaje" data-lz-show="viajeOn">' + S.travelShort + '</a><a href="#rsvp">' + S.confirmShort + '</a></span></nav>' +
      '<h1 class="names" tabindex="-1"><span class="nm" data-lz="n1">' + S.n1 + '</span><span class="scr">' + S.y + '</span><span class="nm" data-lz="n2">' + S.n2 + '</span></h1>' +
      '<div class="hero-foot"><p class="hero-d m" data-lz-date="' + S.heroPat + '">' + S.heroTxt + '</p><p class="hero-d d" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><p class="k light" data-lz="city">' + S.city + '</p><a class="pill line light" href="#rsvp">' + S.confirm + '</a></div>' +
    '</section>' +

    '<section class="sec welcome"><div class="wel-txt" data-rv><h2 class="h">' + S.dear + '</h2><p class="lead" data-lz="msg">' + S.msg + '</p></div>' +
      '<div class="wel-date" data-rv><span data-lz-date="' + S.dmPat + '">' + S.dmTxt + '</span>' + MONO('big') + '<span data-lz-date="' + S.yPat + '">' + S.yTxt + '</span></div></section>' +

    '<section class="sec band cd"><div class="cd-head"><p class="k light">' + S.cdK + '</p><span class="scr">' + S.cdS + '</span><p class="cd-note" data-lz="countdownNote">' + S.cdNote + '</p></div>' +
      '<div class="digits" role="timer" aria-live="off">' + S.units.map(function (u, i) { return (i ? '<span class="colon" aria-hidden="true">:</span>' : '') + '<div class="dg"><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div></section>' +

    '<section class="sec pair"><div class="place" id="where" data-rv><h2 class="h">' + S.placeT + '</h2><p class="pl-n" id="whereName">' + S.events[0][2] + '</p><p class="pl-a mute" id="whereAddr">' + S.events[0][3] + '</p>' +
        '<a class="pill line" id="whereMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + '</a>' +
        '<div class="locket" aria-hidden="true"><svg class="chain" viewBox="0 0 200 190" focusable="false"><path d="M-4 0C30 30 80 90 106 156"/><path d="M-4 0C40 20 120 70 148 168"/></svg>' + heart('l1', 1, 'muro') + heart('l2', 2, 'torre') + '<span class="bail"></span></div></div>' +
      '<div class="sched" id="horario" data-lz-anchor="itinerario musica"><h2 class="h">' + S.progT + '</h2>' +
        '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv><p class="ev-time" data-lz-f="time">' + e[0] + '</p><span class="ev-dot" aria-hidden="true"></span><div><h3 data-lz-f="name">' + e[1] + '</h3><p class="mute"><span data-lz-f="place">' + e[2] + '</span><span class="ev-a"> · <span data-lz-f="address">' + e[3] + '</span></span></p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div></li>'; }).join('') + '</ol></div>' +
    '</section>' +

    '<section class="sec tone story" id="historia" data-lz-anchor="historia"><img class="st-img" src="/assets/fotos/escalera.jpg" data-lz-src="photo:3" alt="" loading="lazy" data-rv>' +
      '<div class="st-txt" data-rv>' + duo(S.storyA, S.storyB) + '<p class="p" data-lz="story">' + S.storyTxt + '</p><p class="scr sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p></div></section>' +

    '<section class="sec gal" id="galeria"><div class="gal-head">' + duo(S.galA, S.galB) + '<button type="button" class="pill line gal-all d" data-gallery-open>' + S.allPhotos + '</button></div>' +
      '<div class="mosaic" data-lz-list="gallery">' + ['paseo', 'torre', 'escalera', 'muro', 'beso'].map(function (f) { return '<div class="tile" data-lz-item data-rv><img data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy"></div>'; }).join('') + '</div>' +
      '<button type="button" class="pill line gal-all m" data-gallery-open>' + S.allPhotos + '</button></section>' +

    '<section class="sec dress" data-lz-group="dressCode dressNotes dressColors"><div class="dress-in" data-rv>' + duo(S.dressA, S.dressB) + '<p class="dr-c" data-lz="dressCode">' + S.dressCode + '</p><p class="p" data-lz="dressNotes">' + S.dressNotes + '</p>' +
      '<div data-lz-group="dressColors"><span class="rule" aria-hidden="true"></span><p class="p"><b>' + S.reserved + '</b> <span data-lz="dressColors">' + S.dressColors + '</span>.</p></div></div></section>' +

    '<section class="sec tone travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="tr-a">' + duo(S.travelA, S.travelB) + '<p class="p" data-lz="travelIntro">' + S.travelIntro + '</p><div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div></div>' +
      '<div class="tr-b"><div class="hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="k">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p class="mute" data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="mute" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="pill solid" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="mute demo-booking">' + S.demoBooking + '</p></div></div>' +
      '<div class="tr-c guide" data-lz-group="guideFood guideCulture guidePlans"><p class="k">' + S.guideK + '</p>' + info(I_SEE, 'guideCulture', S.cultureL, S.culture) + info(I_FOOD, 'guideFood', S.foodL, S.food) + info(I_PLAN, 'guidePlans', S.plansL, S.plans) + '</div>' +
    '</section>' +

    '<section class="sec band quote" data-lz-group="quote"><div class="quote-in" data-rv><span class="qm" aria-hidden="true">“</span><blockquote data-lz="quote">' + S.quote + '</blockquote><p class="k light" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="faq-head" data-rv>' + TRAY + '<h2 class="h">' + S.faqT + '</h2></div>' +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span><span class="pm" aria-hidden="true"></span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="rsvp" id="rsvp" data-lz-anchor="rsvp">' +
      '<div class="rs-side"><img class="rs-img" src="/assets/fotos/paseo.jpg" data-lz-src="photo:4" alt="" loading="lazy"><h2 class="h">' + S.rsvpT + '</h2>' + envelope('small') + '<p class="rs-msg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p></div>' +
      '<div class="rs-form"><p class="rs-for"><b>' + S.guest + '</b><span>' + S.seatsRes + '</span></p><p class="chipd" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
        '<div id="rsForm"><div id="people"></div>' +
          '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
          '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><div class="rs-send"><button type="button" class="pill solid" id="rsSave">' + S.send + '</button><p class="mute demo-note">' + S.demoNote + '</p></div></div>' +
        '<div id="rsDone" hidden>' + SEAL + '<p class="scr thanks">' + S.thanks + '</p><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      '</div></section>' +

    '<section class="sec fin"><div class="fin-love"><span class="rule" aria-hidden="true"></span><span class="scr">' + S.love + '</span><span class="rule" aria-hidden="true"></span></div>' +
      '<img class="fin-img" src="/assets/fotos/torre.jpg" data-lz-src="photo:2" alt="" loading="lazy">' +
      '<p class="fin-n">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p><p class="k"><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#horario">' + S.program + '</a><a href="#viaje" data-lz-show="viajeOn">' + S.travelShort + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
