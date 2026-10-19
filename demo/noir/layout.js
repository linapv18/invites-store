
/* Noir comparte composición y comportamiento entre ambos idiomas.
   Las fuentes data-lz de los nombres se sincronizan con la tarjeta y el hero. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en una tarjeta de puerta doble con faja de plata', band: 'Quitar la faja de plata', hint: 'Quita la faja de plata', for: 'Para',
      married: '¡Nos casamos!', seats: '4 cupos', enter: 'Abrir invitación',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', y: 'y', city: 'Oaxaca, México', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León', W: 'Domingo',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      bigDay: 'El gran día', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027', schedule: 'Itinerario', how: 'Cómo llegar',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stay: 'Alojamiento', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', guideT: 'Turismo y actividades', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitan saber', faqT: 'Preguntas frecuentes',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Los novios pueden añadir su enlace o instrucciones de regalos al personalizar la invitación.']],
      before: 'Confirma antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistirá', no: 'No asistirá', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Enviar confirmación', err: 'Indiquen si asistirá o no cada persona.',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      footPat: '{d} · {Mc} · {Y}', footTxt: '14 · Marzo · 2027', demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation in a double-door card with a silver band', band: 'Remove the silver band', hint: 'Remove the silver band', for: 'For',
      married: 'We’re getting married!', seats: '4 seats', enter: 'Open invitation',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', y: 'and', city: 'Oaxaca, Mexico', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo', W: 'Sunday',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      bigDay: 'The big day', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', schedule: 'Schedule', how: 'Directions',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      fromAway: 'If you’re traveling', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stay: 'Where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', guideT: 'Sights and activities', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. The couple can add their registry link or gift instructions when personalizing the invitation.']],
      before: 'Please reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Not attending', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Send RSVP', err: 'Please answer for each person.',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      footPat: '{Mc} {d} · {Y}', footTxt: 'March 14 · 2027', demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.NoirS = S;

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ICONS = [
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 35h28M10 35V10l10-5 10 5v25M15 35V25h10v10M14 11h12M16 15v3m8-3v3M16 21h0m8 0h0M20 25v10"/><path d="M7 13h3m20 0h3M7 13v22m26-22v22"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 23 11-5-3-11 3-2 8 9 8-4c4-2 5 1 2 4l-8 6 1 12-3 2-6-10-6 3-2 5-3 1 1-8z"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 10-4 12 4 10-4v24l-10 4-12-4-10 4zM14 8v24m12-20v24"/><path d="M20 23s7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 7 11 7 11z" fill="var(--bg)"/><circle cx="20" cy="12" r="2.5"/></svg>'
  ];
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.jpg', '/assets/fotos/escalera.jpg', '/assets/fotos/muro.jpg'];
  var sh = function (eb, title, attr) { return '<div class="sh" data-rv><p class="eb"' + (attr || '') + '>' + eb + '</p><h2>' + title + '</h2></div>'; };
  var names = function (id) { return '<h1 class="letters"' + (id ? ' id="' + id + '"' : '') + '><span data-split="srcN1">' + esc(S.n1) + '</span><em>' + S.y + '</em><span data-split="srcN2" data-off="4">' + esc(S.n2) + '</span></h1>'; };

  document.getElementById('app').innerHTML =
  // Fuentes ocultas: el editor las llena y la plantilla copia su texto donde va letra por letra.
  '<div hidden><span data-lz="n1" id="srcN1">' + S.n1 + '</span><span data-lz="n2" id="srcN2">' + S.n2 + '</span></div>' +
  // ======================= APERTURA =======================
  '<div class="opening tex" id="open" role="region" aria-label="' + S.openAria + '">' +
    '<p class="eb" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="gate" id="gate">' +
      '<div class="gin">' +
        '<p class="eb">' + S.married + '</p>' + names('inLetters') +
        '<p style="font:400 11px Manrope;letter-spacing:.34em" data-lz-date="{d} · {MU} · {Y}">14 · ' + (LANG === 'en' ? 'MARCH' : 'MARZO') + ' · 2027</p>' +
        '<p style="margin-top:12px" data-lz="msg">' + S.msg + '</p>' +
        '<p>' + S.for + ' <b style="font-weight:500">' + S.guest + '</b> · ' + S.seats + '</p>' +
        '<button type="button" class="btn" id="enter" tabindex="-1" disabled>' + S.enter + '</button>' +
      '</div>' +
      '<div class="half ht" aria-hidden="true"><p class="eb" data-lz-mono>A · L</p><span class="hm"><span data-lz-seal>AL</span></span></div>' +
      '<div class="half hb" aria-hidden="true"><span class="hm"><span data-lz-seal>AL</span></span></div>' +
      '<button type="button" class="nband metal sweep" id="band" aria-label="' + S.band + '"><span class="eb">' + S.for + '</span><b>' + S.guest + '</b></button>' +
    '</div>' +
    '<p class="hint" id="hint" aria-live="polite">' + S.hint + '</p>' +
    '<p class="eb" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="pr chrome" style="font-size:19px" data-lz-mono>A · L</span><span class="eb" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span></div>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada">' +
      '<div class="hp zoomin" data-rv><div class="pic"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div><div class="top"><i></i><span class="eb" style="color:var(--ink)" data-lz-mono>A · L</span><i></i></div></div>' +
      '<div class="hc in-w">' +
        '<p class="eb">' + S.getting + '</p>' + names().replace('<h1 class="letters"', '<h1 class="letters" style="margin-top:14px"') +
        '<div class="dt"><i></i><span class="chrome" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span><i></i></div>' +
        '<p class="eb"><span data-lz-date="{W}">' + S.W + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
        '<p class="msg" data-lz="msg">' + S.msg + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="sec" data-gallery="mono" id="historia" data-lz-anchor="historia"><div class="in-w">' + sh(S.story, '<span data-lz="storyTitle">' + S.storyTitle + '</span>') + '<p class="lead" data-rv data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="gal" data-lz-list="gallery">' + photos.map(function (g, i) { return '<figure class="gi zoomin" data-lz-item data-rv style="transition-delay:' + i * .14 + 's"><div class="pic"><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div></figure>'; }).join('') + '</div>' +
    '<button class="gallery-open" data-gallery-open>' + (LANG === 'en' ? 'View all photos' : 'Ver todas las fotos') + '</button></div></section>' +

    '<section class="sec s-cd"><span class="ghost" aria-hidden="true" data-lz-date="{Y}">2027</span><div class="in-w">' + sh(S.bigDay, LANG === 'en' ? 'Counting down to our wedding' : 'Cada vez más cerca') + '<p class="cnote" data-rv data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="cdx" aria-live="off">' + S.units.map(function (u, i) { return '<div><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="itinerario" data-lz-anchor="itinerario musica"><div class="in-w">' + sh(S.dayTxt, S.schedule, ' data-lz-date="' + S.dayPat + '"') +
      '<div class="evs" data-lz-list="events">' + S.events.map(function (e, i) { return '<div class="ev" data-lz-item data-rv style="transition-delay:' + i * .1 + 's"><p class="t" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="addr" data-lz-f="address">' + e[3] + '</p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div>'; }).join('') + '</div>' +
      '<div class="dress" data-rv data-lz-group="dressCode dressNotes dressColors"><p class="eb">' + S.dress + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="small" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="sws" aria-hidden="true"><i style="background:#F4F1EA"></i><i style="background:#E8D9C0"></i></div></div>' +
    '</div></section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn"><div class="in-w">' + sh(S.fromAway, S.travel) + '<p class="lead" data-rv data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="trv">' +
        '<div class="tc" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><span class="ic" aria-hidden="true">' + ICONS[0] + '</span><p class="eb">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p><i data-lz="hotelNotes">' + S.hotelNotes + '</i></p><a class="btn" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG === 'en' ? 'Demo · booking link to be personalized' : 'Demostración · reserva por personalizar') + '</p></div>' +
        '<div class="tc" data-rv data-lz-group="airport transport"><span class="ic" aria-hidden="true">' + ICONS[1] + '</span><p class="eb">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div class="tc" data-rv data-lz-group="guideFood guideCulture guidePlans"><span class="ic" aria-hidden="true">' + ICONS[2] + '</span><p class="eb">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div>' +
    '</div></section>' +

    '<section class="sec s-q" data-lz-group="quote"><div class="in-w" data-rv><span class="qm" aria-hidden="true">“</span><blockquote data-lz="quote">' + S.quote + '</blockquote><p class="eb" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="in-w">' + sh(S.faqK, S.faqT) +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp"><div class="in-w"><div class="rcard" data-rv>' +
      '<p class="eb" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p><h2>' + S.guest + '</h2><p class="seats">' + S.seatsRes + '</p>' +
      '<p class="demo-note">' + (LANG === 'en' ? 'Demo: try the form. Responses are neither sent nor saved.' : 'Demostración: puedes probar el formulario. Las respuestas no se envían ni se guardan.') + '</p><div id="rsForm"><p class="rmsg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2" placeholder="' + (LANG === 'en' ? 'Guest name and dietary restriction' : 'Nombre y restricción alimentaria') + '"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
        '<button type="button" class="btn" id="rsSave">' + S.save + '</button></div>' +
      '<div id="rsDone" hidden style="padding-top:18px"><p class="pr" style="font-size:34px">' + S.thanks + '</p><p id="rsSum" style="margin:10px 0 0;font-size:14px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>' +
    '</div></div></section>' +

    '<footer><nav class="footer-nav" aria-label="' + (LANG === 'en' ? 'Invitation links' : 'Enlaces de la invitación') + '"><a href="#itinerario">' + S.schedule + '</a><a href="#viaje">' + S.travel + '</a><a href="#rsvp">R.S.V.P.</a></nav><p class="pr chrome" style="font-size:46px" data-lz-mono>A · L</p><p class="pr" style="font-size:30px;margin:14px 0 8px"><span data-lz="n1">' + S.n1 + '</span> ' + S.y + ' <span data-lz="n2">' + S.n2 + '</span></p><p class="eb"><span data-lz-date="' + S.footPat + '">' + S.footTxt + '</span> · <span data-lz="city">' + S.city + '</span></p></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
