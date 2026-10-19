
/* Plantilla Aurelia. El HTML se arma aquí ANTES de cargar demo/shared/content.js, para que el editor
   encuentre las marcas data-lz… al llenar el contenido. Los nombres que aparecen letra por letra
   (data-split), el texto que gira en el sello y la leyenda vertical de la foto se copian de elementos
   ocultos con data-lz, que son los que llena el editor. Los encabezados y las preguntas no llevan numeración. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en una carpeta con faja dorada', band: 'Deslizar la faja dorada', hint: 'Toca o desliza la faja para abrir', for: 'Para',
      married: '¡Nos casamos!', seats: '4 cupos', enter: 'Abrir invitación',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', y: 'y', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      dateL: 'Fecha', placeL: 'Lugar', metaPat: '{W} {d} de {M}', metaTxt: 'Domingo 14 de marzo',
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
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil; están reservados para la pareja.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. La pareja podrá añadir aquí sus datos o enlace de regalos.']],
      before: 'Confirma antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistirá', no: 'No asistirá', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Enviar confirmación', err: 'Indiquen si asistirá o no cada persona.',
      bookingPending: 'Demostración · enlace de reserva por personalizar', demoNotice: 'Demostración: las respuestas no se envían y se reinician al recargar.', pendingPerson: 'Indica si esta persona asistirá.', summaryLabel: 'Tu respuesta', thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      love: 'Con amor', footPat: '{d} · {Mc} · {Y}', footTxt: '14 · Marzo · 2027', demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation in a folder with a gold band', band: 'Slide off the gold band', hint: 'Tap or slide the band to open', for: 'For',
      married: 'We’re getting married!', seats: '4 seats', enter: 'Open invitation',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', y: 'and', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      dateL: 'Date', placeL: 'Place', metaPat: '{W}, {Mc} {d}', metaTxt: 'Sunday, March 14',
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
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory, reserved for the couple.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. The couple can add their gift details or registry link here.']],
      before: 'Please reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Not attending', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Send RSVP', err: 'Please answer for each person.',
      bookingPending: 'Demo · booking link to be personalized', demoNotice: 'Demo: replies are not sent and reset when you reload.', pendingPerson: 'Choose whether this guest will attend.', summaryLabel: 'Your reply', thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      love: 'With love', footPat: '{Mc} {d} · {Y}', footTxt: 'March 14 · 2027', demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.AureliaS = S;

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var spl = function (t, k) { return Array.from(t).map(function (ch, i) { return '<b style="--i:' + (i + (k || 0)) + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</b>'; }).join(''); };
  window.AureliaSplit = spl;
  var ICONS = [
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 34V13h26v21M5 34h30M13 13V7h14v6M13 7V4h14v3"/><path d="M13 18h3v3h-3zm11 0h3v3h-3zm-11 7h3v3h-3zm11 0h3v3h-3zM18 34v-8h4v8"/><path d="M18 9h4"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4c1.2 0 2 1.8 2 4v8l13 8v3l-13-4v7l5 4v2l-7-2-7 2v-2l5-4v-7L5 27v-3l13-8V8c0-2.2.8-4 2-4Z"/><path d="M10 20v-3m20 3v-3M18 10h4"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 10 10-4 12 4 10-4v26l-10 4-12-4-10 4V10Z"/><path d="M14 6v26m12-4v8M8 17l3-1m-3 7 3-1m7 6 4 1"/><path d="M30 15c0 4-6 10-6 10s-6-6-6-10a6 6 0 0 1 12 0Z"/><circle cx="24" cy="15" r="2"/></svg>'
  ];
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.jpg', '/assets/fotos/escalera.jpg', '/assets/fotos/muro.jpg'];
  var sh = function (eb, title, anchorAttr) { return '<div class="sh" data-rv><p class="eb"' + (anchorAttr || '') + '>' + eb + '</p><h2>' + title + '</h2></div>'; };
  var mono = '<span data-lz-mono>A<i>—</i>L</span>';

  document.getElementById('app').innerHTML =
  // Fuentes ocultas: el editor las llena y la plantilla copia su texto donde va letra por letra o en el sello.
  '<div hidden><span data-lz="n1" id="srcN1">' + S.n1 + '</span><span data-lz="n2" id="srcN2">' + S.n2 + '</span><span data-lz="city" id="srcCity">' + S.city + '</span><span data-lz-date="{dd}.{mm}.{Y}" id="srcDate">14.03.2027</span></div>' +
  // ======================= APERTURA =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<p class="eb" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="fold" id="fold">' +
      '<div class="inside" inert>' +
        '<p class="bd foil mono" style="font-size:22px;letter-spacing:.1em">' + mono + '</p>' +
        '<p class="eb" style="margin-top:10px">' + S.married + '</p>' +
        '<h1 class="letters" id="inLetters"><span data-split="srcN1">' + spl(S.n1) + '</span><em>&amp;</em><span data-split="srcN2" data-off="4">' + spl(S.n2, 4) + '</span></h1>' +
        '<div class="hl" style="width:60px;margin:8px auto;background:var(--gold)"></div>' +
        '<p class="bd" style="font-size:13px;letter-spacing:.24em" data-lz-date="{d} · {MU} · {Y}">14 · ' + (LANG === 'en' ? 'MARCH' : 'MARZO') + ' · 2027</p>' +
        '<p style="font:italic 16px \'Cormorant Garamond\';margin-top:8px" data-lz="msg">' + S.msg + '</p>' +
        '<p>' + S.for + ' <b style="font-weight:500">' + S.guest + '</b> · ' + S.seats + '</p>' +
        '<button type="button" class="btn" id="enter" tabindex="-1">' + S.enter + '</button>' +
      '</div>' +
      '<div class="cover" aria-hidden="true"><div class="cv cv-f"><span class="ring"></span><span class="emb au-monogram" data-lz-seal>A<i>&amp;</i>L</span></div><div class="cv cv-b"><svg class="au-engraving" viewBox="0 0 180 60" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 30C38-3 65-3 90 30S142 63 174 30C142-3 115-3 90 30S38 63 6 30Z"/><path d="M15 30C43 5 66 5 90 30S137 55 165 30C137 5 114 5 90 30S43 55 15 30Z"/><path d="M25 30C49 13 69 13 90 30S131 47 155 30C131 13 111 13 90 30S49 47 25 30Z"/><ellipse cx="90" cy="30" rx="8" ry="19"/><path d="M90 6v48M2 30h12m152 0h12"/></svg></div></div>' +
      '<button type="button" class="band foilbg" id="band" aria-label="' + S.band + '"><span class="eb">' + S.for + '</span><b>' + S.guest + '</b><span class="eb" data-lz="envClosing" data-lz-keep id="closing">' + S.envClosing + '</span></button>' +
    '</div>' +
    '<p class="hint" id="hint" aria-live="polite">' + S.hint + '</p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="mono">' + mono + '</span><span class="eb" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span></div>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada"><div class="in-w">' +
      '<div class="topbar"><span class="mono">' + mono + '</span><span class="eb" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span></div>' +
      '<p class="eb" style="margin-top:44px">' + S.getting + '</p>' +
      '<h1 class="names letters" tabindex="-1"><span class="ln" data-split="srcN1">' + spl(S.n1) + '</span><em class="foil">&amp;</em><span class="ln" data-split="srcN2" data-off="4">' + spl(S.n2, 4) + '</span></h1>' +
      '<div class="hl hero-rule" data-rv="line"></div>' +
      '<div class="photo zoomin" data-rv><div class="pic"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div><span class="vcap" id="vcap">OAXACA, MÉXICO — MMXXVII</span>' +
        '<div class="stamp" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="auRing" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text font-family="Montserrat" font-size="7.4" letter-spacing="2.6" fill="currentColor"><textPath href="#auRing" textLength="235" id="ringTxt"></textPath></text></svg><b class="au-monogram" data-lz-seal>A<i>&amp;</i>L</b></div></div>' +
      '<div class="meta"><div><span class="eb">' + S.dateL + '</span><p data-lz-date="' + S.metaPat + '">' + S.metaTxt + '</p></div><div><span class="eb">' + S.placeL + '</span><p data-lz="city">' + S.city + '</p></div></div>' +
      '<p class="msg" data-lz="msg">' + S.msg + '</p>' +
    '</div></section>' +
    '<div class="divd" data-rv><svg class="au-engraving" viewBox="0 0 180 60" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 30C38-3 65-3 90 30S142 63 174 30C142-3 115-3 90 30S38 63 6 30Z"/><path d="M15 30C43 5 66 5 90 30S137 55 165 30C137 5 114 5 90 30S43 55 15 30Z"/><path d="M25 30C49 13 69 13 90 30S131 47 155 30C131 13 111 13 90 30S49 47 25 30Z"/><ellipse cx="90" cy="30" rx="8" ry="19"/><path d="M90 6v48M2 30h12m152 0h12"/></svg></div>' +

    '<section class="sec" id="historia" data-lz-anchor="historia"><div class="in-w">' + sh(S.story, '<span data-lz="storyTitle">' + S.storyTitle + '</span>') + '<p class="lead" data-rv data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="gal" data-lz-list="gallery">' + photos.map(function (g, i) { return '<figure class="gi zoomin" data-lz-item data-rv style="transition-delay:' + i * .14 + 's"><div class="pic"><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div></figure>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec au-countdown"><div class="in-w">' + sh(S.bigDay, '<span data-lz="cdName">' + S.cdName + '</span>') + '<p class="big" data-rv data-lz="time0">' + S.time0 + '</p><p class="cnote" data-rv data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="cdx" aria-live="off">' + S.units.map(function (u, i) { return '<div><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="itinerario" data-lz-anchor="itinerario musica"><div class="in-w">' + sh(S.dayTxt, S.schedule, ' data-lz-date="' + S.dayPat + '"') +
      '<div class="evs" data-lz-list="events">' + S.events.map(function (e, i) { return '<div class="ev" data-lz-item data-rv style="transition-delay:' + i * .1 + 's"><p class="t" data-lz-f="time">' + e[0] + '</p><div><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="addr" data-lz-f="address">' + e[3] + '</p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div></div>'; }).join('') + '</div>' +
      '<div class="dress" data-rv data-lz-group="dressCode dressNotes dressColors"><p class="eb">' + S.dress + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p class="small" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="sws" aria-hidden="true"><i style="background:#F4F1EA"></i><i style="background:#E8D9C0"></i></div></div>' +
    '</div></section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn"><div class="in-w">' + sh(S.fromAway, S.travel) + '<p class="lead" data-rv data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="trv">' +
        '<div class="tc" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><span class="ic" aria-hidden="true">' + ICONS[0] + '</span><p class="eb">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p><i data-lz="hotelNotes">' + S.hotelNotes + '</i></p><a class="btn" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="au-demo au-booking">' + S.bookingPending + '</p></div>' +
        '<div class="tc" data-rv data-lz-group="airport transport"><span class="ic" aria-hidden="true">' + ICONS[1] + '</span><p class="eb">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div class="tc" data-rv data-lz-group="guideFood guideCulture guidePlans"><span class="ic" aria-hidden="true">' + ICONS[2] + '</span><p class="eb">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div>' +
    '</div></section>' +

    '<section class="sec s-q" data-lz-group="quote"><div class="in-w" data-rv><span class="qm" aria-hidden="true"><svg viewBox="0 0 64 48" fill="currentColor"><path d="M27 5C13 11 7 20 7 32c0 8 4 12 10 12 6 0 10-4 10-10 0-6-4-10-10-10h-2c1-7 5-12 14-17L27 5Zm30 0C43 11 37 20 37 32c0 8 4 12 10 12 6 0 10-4 10-10 0-6-4-10-10-10h-2c1-7 5-12 14-17L57 5Z"/></svg></span><blockquote data-lz="quote">' + S.quote + '</blockquote><p class="eb" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="in-w">' + sh(S.faqK, S.faqT) +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp"><div class="in-w"><div class="rcard" data-rv>' +
      '<p class="eb" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p><h2>' + S.guest + '</h2><p class="seats">' + S.seatsRes + '</p>' +
      '<div id="rsForm"><p class="rmsg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
        '<button type="button" class="btn" id="rsSave">' + S.save + '</button></div>' +
      '<p class="au-demo au-notice">' + S.demoNotice + '</p><div id="rsDone" hidden style="padding-top:18px"><p class="bd" style="font-size:34px;font-style:italic">' + S.thanks + '</p><ul id="rsGuests" class="au-summary"></ul><p id="rsSum" style="margin:10px 0 0;font-size:14px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>' +
    '</div></div></section>' +

    '<footer><div class="au-footer-mono au-monogram" data-lz-seal>A<i>&amp;</i>L</div><p class="eb">' + S.love + '</p><p class="bd" style="font-size:clamp(46px,7vw,60px);letter-spacing:-.03em;margin:12px 0 6px"><span data-lz="n1">' + S.n1 + '</span> <span class="foil" style="font:italic 400 34px \'Cormorant Garamond\'">&amp;</span> <span data-lz="n2">' + S.n2 + '</span></p><div class="hl" data-rv="line" style="width:80px;margin:14px auto;background:var(--gold)"></div><p class="eb"><span data-lz-date="' + S.footPat + '">' + S.footTxt + '</span> · <span data-lz="city">' + S.city + '</span></p><nav class="au-footnav" aria-label="'+ (LANG==='en'?'Invitation sections':'Secciones de la invitación') +'"><a href="#itinerario">'+ S.schedule +'</a><a href="#viaje">'+ S.travel +'</a><a href="#rsvp">'+ (LANG==='en'?'RSVP':'Confirmación') +'</a></nav></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
