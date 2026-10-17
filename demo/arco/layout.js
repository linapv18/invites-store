
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
      dressK: 'Vestimenta', dressT: 'Código', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'Blanco y marfil',
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
      dressK: 'Dress code', dressT: 'What to wear', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory',
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
  var EXT = ICO('M5 11 11 5M6 5h5v5'), PREV = ICO('M10 3.5 5.5 8l4.5 4.5'), NEXT = ICO('M6 3.5 10.5 8 6 12.5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var BIG = function (d) { return '<svg class="tic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M2.5 13.5 21 6l-2.4 4.6-6 2.2 1.5 6-2.2.8-3-5.3-3.8 1.4z'), I_BUS = BIG('M5 4h14a2 2 0 0 1 2 2v10H3V6a2 2 0 0 1 2-2zM3 11h18M7 16v2.5M17 16v2.5M7 13.5h.01M17 13.5h.01');
  var I_SEE = BIG('M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6'), I_FOOD = BIG('M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11'), I_PLAN = BIG('M3 18 9 8l4 6 3-4 5 8z');
  // Arcada: el mismo dibujo lineal para cualquier lugar (no es el edificio de cada boda).
  var ARCADE = '<svg class="arcade" viewBox="0 0 220 70" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M6 68V34a24 24 0 0 1 48 0v34M60 68V34a24 24 0 0 1 48 0v34M114 68V34a24 24 0 0 1 48 0v34M168 68V34a24 24 0 0 1 48 0v34M2 68h216M2 6h216"/></svg>';
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
      '<div class="hero-panel arch"><p class="when"><span class="w-m" data-lz-date="' + S.monPat + '">' + S.monTxt + '</span><b data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</b><span class="w-t" data-lz="time0">' + S.time0 + '</span></p>' +
        '<p class="w-y" data-lz-date="' + S.yearPat + '">' + S.yearTxt + '</p><p class="k k-light" data-lz="city">' + S.city + '</p><a class="btn btn-light" href="#rsvp">' + S.confirm + '</a></div>' +
    '</section>' +

    '<section class="sec green welcome"><p class="lead" data-lz="msg">' + S.msg + '</p><p class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p>' +
      '<div class="venue" id="venue"><p class="k k-light">' + S.waitK + '</p>' + ARCADE + '<h2 id="venueName">' + S.events[0][2] + '</h2><p id="venueAddr">' + S.events[0][3] + '</p><a class="btn btn-line" id="venueMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div>' +
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

    '<section class="sec dress" data-lz-group="dressCode dressNotes dressColors"><div class="arch-card" data-rv><p class="k">' + S.dressK + '</p><h2>' + S.dressT + '</h2><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="b" data-lz-group="dressColors">' + S.reserved + ' <span data-lz="dressColors">' + S.dressColors + '</span></p></div></section>' +

    '<section class="sec travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="travel-main"><div class="head"><p class="k">' + S.travelK + '</p><h2>' + S.travel + '</h2></div><p class="intro" data-lz="travelIntro">' + S.travelIntro + '</p>' +
        '<div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div></div>' +
      '<div class="hotel arch" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="k k-light">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="soft" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
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
      '<div class="head"><p class="k">' + S.rsvpK + '</p><h2>' + S.rsvpT + '</h2></div>' +
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
