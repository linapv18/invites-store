
/* Plantilla Lino. El HTML se arma aquí ANTES de cargar demo/shared/content.js, para que el editor
   encuentre las marcas data-lz… al llenar el contenido. Las dos versiones de idioma comparten composición y comportamiento. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en un juego de tres tarjetas con faja de papel vegetal', band: 'Retirar la faja de papel vegetal', hint: 'Retira la faja de papel vegetal', for: 'Para',
      married: '¡Nos casamos!', seats: '4 cupos', enter: 'Abrir invitación', details: 'Detalles', pleaseBy: 'Favor de confirmar antes del',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', y: 'y', city: 'Oaxaca, México', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León', W: 'Domingo', MU: 'MARZO',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      bigDay: 'El gran día', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027', schedule: 'Itinerario', how: 'Cómo llegar',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'Blanco y marfil',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stay: 'Alojamiento', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', guideT: 'Turismo y actividades', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitan saber', faqT: 'Preguntas frecuentes',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Los novios pueden añadir aquí su enlace o instrucciones de regalos al personalizar la invitación.']],
      before: 'Confirma antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Sí, asistiré', no: 'No podré', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Enviar confirmación', err: 'Indiquen sí o no para cada persona.',
      thanks: '¡Gracias!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation as a set of three cards with a vellum band', band: 'Remove the vellum band', hint: 'Remove the vellum band', for: 'For',
      married: 'We’re getting married!', seats: '4 seats', enter: 'Open invitation', details: 'Details', pleaseBy: 'Kindly reply by',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', y: 'and', city: 'Oaxaca, Mexico', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo', W: 'Sunday', MU: 'MARCH',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      bigDay: 'The big day', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', schedule: 'Schedule', how: 'Directions',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory',
      fromAway: 'If you’re traveling', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stay: 'Where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', guideT: 'Sights and activities', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. The couple can add their registry link or gift instructions when personalizing the invitation.']],
      before: 'Please reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Yes, I’ll be there', no: 'Can’t make it', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Send RSVP', err: 'Please answer yes or no for each person.',
      thanks: 'Thank you!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.LinoS = S;

  var ICONS = [
    '<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="17" r="6"/><circle cx="11" cy="17" r="2.4"/><path d="M17 17h14M27 17v5M23 17v4"/></svg>',
    '<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 20 27 13q5-1 4 3L8 24Z"/><path d="M14 17 9 6h4l9 9M15 22l-3 8h4l6-9"/></svg>',
    '<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M17 31s10-9.5 10-17A10 10 0 0 0 7 14c0 7.5 10 17 10 17Z"/><circle cx="17" cy="14" r="3.5"/></svg>'
  ];
  // Fotografía de una ramita prensada; nombres y monograma siguen siendo editables.
  var PRESSED = function (w, style) { return '<img class="pressed" src="/assets/lino/ramita-prensada.webp" width="' + w + '" style="' + style + '" alt="" aria-hidden="true">'; };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.jpg', '/assets/fotos/escalera.jpg', '/assets/fotos/muro.jpg'];
  var sh = function (eb, title, attr) { return '<div class="sh" data-rv><p class="eb"' + (attr || '') + '>' + eb + '</p><h2>' + title + '</h2></div>'; };
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var dots = function (mid) { return '<div class="dots"><span data-lz-date="{d}">14</span><i></i><span data-lz-date="' + (mid ? '{MU}' : '{mm}') + '">' + (mid ? S.MU : '03') + '</span><i></i><span data-lz-date="{Y}">2027</span></div>'; };

  document.getElementById('app').innerHTML =
  // ======================= APERTURA =======================
  '<div class="opening linen" id="open" role="region" aria-label="' + S.openAria + '">' +
    '<p class="eb" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="suite" id="suite">' +
      '<div class="sc sc3 pap" aria-hidden="true"></div>' +
      '<div class="sc sc2 pap" aria-hidden="true"></div>' +
      '<div class="sc sc1 pap">' +
        '<p class="eb">' + S.married + '</p>' +
        '<h1>' + N('n1') + '<small>' + S.y + '</small>' + N('n2') + '</h1>' +
        dots().replace('class="dots"', 'class="dots" style="margin:10px 0 4px"') +
        '<p data-lz="msg">' + S.msg + '</p>' +
        '<p>' + S.for + ' <b style="font-weight:500">' + S.guest + '</b> · ' + S.seats + '</p>' +
        '<button type="button" class="btn" id="enter" tabindex="-1" disabled>' + S.enter + '</button>' +
      '</div>' +
      '<button type="button" class="vb" id="band" aria-label="' + S.band + '"><span class="eb">' + S.for + '</span><b>' + S.guest + '</b><span class="eb" style="color:var(--muted)" data-lz="envClosing" data-lz-keep id="closing">' + S.envClosing + '</span><span class="lseal"><span data-lz-seal>AL</span></span></button>' +
    '</div>' +
    '<p class="hint" id="hint" aria-live="polite">' + S.hint + '</p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="fr" style="font:italic 300 21px Fraunces">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</span><span class="eb" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span></div>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada"><div class="in-w">' +
      '<p class="eb">' + S.getting + '</p>' +
      '<div class="tipped pap zoomin" data-rv>' + PRESSED(92, 'right:-34px;top:-40px;rotate:18deg') + '<i></i><i></i><i></i><i></i><div class="pic"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div><span data-lz="city">' + S.city + '</span></div>' +
      '<h1 class="writes" tabindex="-1"><span class="write" data-lz="n1">' + S.n1 + '</span><small>' + S.y + '</small><span class="write" data-lz="n2">' + S.n2 + '</span></h1>' +
      dots(true) +
      '<p class="eb" style="color:var(--muted)"><span data-lz-date="{W}">' + S.W + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<p class="msg" data-lz="msg">' + S.msg + '</p>' +
    '</div></section>' +

    '<section class="sec" id="historia" data-lz-anchor="historia"><div class="in-w">' + sh(S.story, '<span data-lz="storyTitle">' + S.storyTitle + '</span>') + '<p class="lead" data-rv data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="gal" data-lz-list="gallery">' + photos.map(function (g, i) { return '<figure class="gi pap zoomin" data-lz-item data-rv style="transition-delay:' + i * .14 + 's"><div class="pic"><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div></figure>'; }).join('') + '</div>' +
    '<button class="gallery-open" data-gallery-open>' + (LANG === 'es' ? 'Ver todas las fotos' : 'View all photos') + '</button></div></section>' +

    '<section class="sec countdown"><div class="in-w">' + sh(S.bigDay, '<span data-lz="cdName">' + S.cdName + '</span>') + '<p class="big" data-rv data-lz="time0">' + S.time0 + '</p><p class="cnote" data-rv data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="cdx" aria-live="off">' + S.units.map(function (u, i) { return '<div class="pap"><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="itinerario" data-lz-anchor="itinerario musica"><div class="in-w">' + sh(S.dayTxt, S.schedule, ' data-lz-date="' + S.dayPat + '"') +
      '<div class="evs" data-lz-list="events">' + S.events.map(function (e, i) { return '<div class="ev pap" data-lz-item data-rv style="transition-delay:' + i * .1 + 's"><p class="t" data-lz-f="time">' + e[0] + '</p><div><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="addr" data-lz-f="address">' + e[3] + '</p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div></div>'; }).join('') + '</div>' +
      '<div class="dress pap" data-rv data-lz-group="dressCode dressNotes dressColors"><p class="eb">' + S.dress + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="small" data-lz-group="dressColors">' + S.reserved + ' <span data-lz="dressColors">' + S.dressColors + '</span></p><div class="sws" aria-hidden="true"><i style="background:#F4F1EA"></i><i style="background:#E8D9C0"></i></div></div>' +
    '</div></section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn"><div class="in-w">' + sh(S.fromAway, S.travel) + '<p class="lead" data-rv data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="trv">' +
        '<div class="tc pap" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><span class="ic" aria-hidden="true">' + ICONS[0] + '</span><p class="eb">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p><i data-lz="hotelNotes">' + S.hotelNotes + '</i></p><a class="btn" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG === 'es' ? 'Demostración · reserva por personalizar' : 'Demo · booking link to be personalized') + '</p></div>' +
        '<div class="tc pap" data-rv data-lz-group="airport transport"><span class="ic" aria-hidden="true">' + ICONS[1] + '</span><p class="eb">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div class="tc pap" data-rv data-lz-group="guideFood guideCulture guidePlans"><span class="ic" aria-hidden="true">' + ICONS[2] + '</span><p class="eb">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div>' +
    '</div></section>' +

    '<section class="sec s-q" data-lz-group="quote"><div class="in-w"><div class="q" data-rv><blockquote data-lz="quote">' + S.quote + '</blockquote><p class="eb" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></div></section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="in-w">' + sh(S.faqK, S.faqT) +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details class="pap" data-lz-item data-rv><summary data-lz-f="q">' + f[0] + '</summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp"><div class="in-w"><div class="rcard pap" data-rv>' + PRESSED(80, 'left:-26px;top:-34px;rotate:-24deg') +
      '<p class="eb" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p><h2>' + S.guest + '</h2><p class="seats">' + S.seatsRes + '</p>' +
      '<p class="demo-note">' + (LANG === 'es' ? 'Demostración: puedes probar el formulario. Las respuestas no se envían ni se guardan.' : 'Demo: try the form. Responses are neither sent nor saved.') + '</p><div id="rsForm"><p class="rmsg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2" placeholder="' + (LANG === 'es' ? 'Nombre y restricción alimentaria' : 'Guest name and dietary restriction') + '"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
        '<button type="button" class="btn" id="rsSave">' + S.save + '</button></div>' +
      '<div id="rsDone" hidden style="padding-top:18px"><p class="fr" style="font:italic 300 36px Fraunces">' + S.thanks + '</p><p id="rsSum" style="margin:10px 0 0;font-size:14px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>' +
    '</div></div></section>' +

    '<footer><nav class="footer-nav" aria-label="' + (LANG === 'es' ? 'Enlaces de la invitación' : 'Invitation links') + '"><a href="#itinerario">' + S.schedule + '</a><a href="#viaje">' + S.travel + '</a><a href="#rsvp">R.S.V.P.</a></nav><p class="fr" style="font:italic 300 48px/1.1 Fraunces">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p>' + dots() + '<p class="eb" style="color:var(--muted)" data-lz="city">' + S.city + '</p></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
