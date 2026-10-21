
/* Plantilla Gala. El HTML se arma aquí (abanicos, destellos y burbujas son SVG generados) ANTES de cargar
   demo/shared/content.js, para que el editor encuentre las marcas data-lz… al llenar el contenido.
   Los nombres editables (data-split) y el texto del anillo del medallón se copian
   de elementos ocultos con data-lz, que son los que llena el editor. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación con medallón dorado', medal: 'Abrir la invitación', hint: 'Toca el medallón', for: 'Para',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', y: 'y', city: 'Oaxaca, México', M: 'Marzo', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      night: 'Cada vez más cerca', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027', program: 'El programa', how: 'Cómo llegar',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados ·', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stay: 'Alojamiento', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', guideT: 'Turismo y actividades', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitas saber', faqT: 'Preguntas frecuentes',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil; están reservados para la pareja.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. La pareja podrá añadir aquí su enlace o información de regalos.']],
      seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.', until: 'Confirmen antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027',
      yes: 'Asistirá', no: 'No asistirá', noL: 'No asistirá', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Confirmar', err: 'Indiquen si asistirá o no cada persona.',
      bookingPending: 'Demostración · enlace de reserva por personalizar', demoNotice: 'Demostración: las respuestas no se envían y se reinician al recargar.', pendingPerson: 'Indica si esta persona asistirá.', thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos en la gala.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation with a gold medallion', medal: 'Open the invitation', hint: 'Tap the medallion', for: 'For',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', y: 'and', city: 'Oaxaca, Mexico', M: 'March', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      night: 'Closer every day', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', program: 'The program', how: 'Directions',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors ·', dressColors: 'White and ivory are reserved for the bride.',
      fromAway: 'If you’re traveling', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stay: 'Where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', guideT: 'Sights and activities', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory, reserved for the couple.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. The couple can add their gift information or registry link here.']],
      seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.', until: 'Please reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027',
      yes: 'Attending', no: 'Not attending', noL: 'Not attending', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Confirm', err: 'Please answer for each person.',
      bookingPending: 'Demo · booking link to be personalized', demoNotice: 'Demo: replies are not sent and reset when you reload.', pendingPerson: 'Choose whether this guest will attend.', thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you at the gala.' : 'Thanks for letting us know. We’ll miss you.'; },
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.GalaS = S;

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  // Abanico art déco que se dibuja solo
  function fan(w) {
    var l = ''; for (var i = 0; i < 13; i++) { var a = Math.PI * (1 + i / 12), c = Math.cos(a), s = Math.sin(a); l += '<line pathLength="1" stroke-width="' + (i % 3 === 0 ? 1.2 : .6) + '" x1="' + (60 + 18 * c).toFixed(1) + '" y1="' + (60 + 18 * s).toFixed(1) + '" x2="' + (60 + 56 * c).toFixed(1) + '" y2="' + (60 + 56 * s).toFixed(1) + '"/>'; }
    return '<svg class="fan" viewBox="0 0 120 62" width="' + w + '" fill="none" stroke="currentColor" stroke-width=".9" aria-hidden="true">' + l + '<path pathLength="1" style="transition-duration:1.6s" d="M4 60a56 56 0 0 1 112 0M18 60a42 42 0 0 1 84 0M42 60a18 18 0 0 1 36 0"/><path pathLength="1" d="M0 60h120"/></svg>';
  }
  var ORN = '<div class="orn">' + fan(40) + '</div>';
  var spl = function (t) { return '<b>' + esc(t) + '</b>'; };
  window.GalaSplit = spl;
  var ARCH = '<svg viewBox="0 0 236 330" fill="none" stroke="currentColor" aria-hidden="true"><path d="M118 2 152 14h24l24 18h20l14 30V328H2V62l14-30h20l24-18h24Z" stroke-width="1.2"/><path d="M118 8 150 20h24l24 18h18l12 26V322H8V64l12-26h18l24-18h24Z" stroke-width=".6" opacity=".6"/></svg>';
  var RING = '<svg viewBox="0 0 230 230" aria-hidden="true"><defs><path id="gRing" d="M115 115m-98 0a98 98 0 1 1 196 0a98 98 0 1 1-196 0"/></defs><circle cx="115" cy="115" r="108" fill="none" stroke="currentColor" stroke-width=".8" opacity=".7" style="color:var(--gold)"/><circle cx="115" cy="115" r="88" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="1 5" opacity=".8" style="color:var(--gold)"/><text font-family="Josefin Sans" font-size="9" style="fill:var(--gold2)"><textPath href="#gRing" textLength="612" lengthAdjust="spacingAndGlyphs" id="ringTxt" data-lz-opening-field="envIntro"></textPath></text></svg>';
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.webp', '/assets/fotos/escalera.webp', '/assets/fotos/muro.webp'];

  document.getElementById('app').innerHTML =
  // Fuentes ocultas: el editor las llena y la plantilla copia su texto donde va letra por letra o en el anillo.
  '<div hidden><span data-lz="n1" id="srcN1">' + S.n1 + '</span><span data-lz="n2" id="srcN2">' + S.n2 + '</span><span data-lz="envIntro" data-lz-keep id="srcIntro">' + S.envIntro + '</span></div>' +
  // ======================= APERTURA =======================
  '<div class="opening velvet" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="border"></div>' +
    '<div class="fan-top">' + fan(110) + '</div>' +
    '<div class="medal-wrap">' + RING + '<button type="button" class="medal" id="medal" aria-label="' + S.medal + '"><span data-lz-seal>A·L</span></button></div>' +
    '<div><p class="eb">' + S.for + '</p><p class="to foil" style="margin-top:6px">' + S.guest + '</p>' + ORN + '<p class="eb" style="color:var(--muted)" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</p></div>' +
    '<p class="hint">' + S.hint + '</p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<main id="invite" inert>' +
    '<section class="hero velvet" id="portada" data-lz-anchor="portada">' +
      '<div class="in-w"><div class="hero-fan" style="color:var(--gold)">' + fan(80) + '</div>' +
      '<p class="eb hero-kicker" style="margin-top:6px">' + S.getting + '</p>' +
      '<div class="arch"><div class="ph"><img class="ph-img" src="/assets/fotos/paseo.webp" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div>' + ARCH + '</div>' +
      '<h1 class="letters" tabindex="-1"><span data-split="srcN1">' + spl(S.n1) + '</span><span class="foil amp">&amp;</span><span data-split="srcN2" data-off="4">' + spl(S.n2, 4) + '</span></h1>' +
      '<div class="date"><span data-lz-date="{Mc}">' + S.M + '</span><b class="foil" data-lz-date="{d}">14</b><span data-lz-date="{Y}">2027</span></div><p class="eb hero-city" style="margin-top:14px;color:var(--muted)" data-lz="city">' + S.city + '</p>' +
      ORN + '<p class="msg" data-lz="msg">' + S.msg + '</p></div>' +
    '</section>' +

    '<section class="sec velvet2 edge" id="historia" data-lz-anchor="historia"><div class="in-w"><div class="frame" data-rv>' + fan(46) +
      '<p class="eb" style="margin-top:16px">' + S.story + '</p><h2 class="foil" data-lz="storyTitle">' + S.storyTitle + '</h2><p data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="mosaic" data-lz-list="gallery">' + photos.map(function (g) { return '<div data-lz-item><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div>'; }).join('') + '</div>' +
    '</div></div></section>' +

    '<section class="sec velvet gala-countdown">' + '<div class="in-w"><p class="eb">' + S.night + '</p><h2 data-lz="cdName">' + S.cdName + '</h2><p class="cz foil" style="font-size:46px;line-height:1.3" data-lz="time0">' + S.time0 + '</p><p style="margin-top:8px" data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="cd" aria-live="off">' + S.units.map(function (u, i) { return '<div><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div></div></section>' +

    '<section class="sec velvet2 edge" id="itinerario" data-lz-anchor="itinerario musica"><div class="in-w"><p class="eb" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><h2 class="foil">' + S.program + '</h2>' +
      '<div class="ev" data-lz-list="events">' + S.events.map(function (e) { return '<div class="frame" data-lz-item data-rv>' + fan(46) + '<p class="tm foil" style="margin-top:10px" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p><span data-lz-f="place">' + e[2] + '</span><br><span data-lz-f="address">' + e[3] + '</span></p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div>'; }).join('') + '</div>' +
      '<div style="margin-top:44px" data-lz-group="dressCode dressNotes dressColors">' + ORN + '<p class="eb">' + S.dress + '</p><h2 class="foil" data-lz="dressCode">' + S.dressCode + '</h2><p data-lz="dressNotes">' + S.dressNotes + '</p><p style="margin-top:10px;font-size:12px;letter-spacing:.1em;text-transform:uppercase" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="colors" aria-hidden="true"><i style="background:#F4F1EA"></i><i style="background:#E8D9C0"></i></div></div>' +
    '</div></section>' +

    '<section class="sec velvet edge" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn"><div class="in-w"><p class="eb">' + S.fromAway + '</p><h2 class="foil">' + S.travel + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="tv">' +
        '<div data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><i aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M7 34V13h26v21M5 34h30M13 13V5h14v8M13 19h4v4h-4zm10 0h4v4h-4zM18 34v-8h4v8M17 9h6"/></svg></i><p class="eb">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p data-lz="hotelNotes">' + S.hotelNotes + '</p><a class="btn" hidden style="margin-top:14px;padding:12px 22px" href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="gala-demo gala-booking">' + S.bookingPending + '</p></div>' +
        '<div data-rv data-lz-group="airport transport"><i aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c1 0 2 2 2 4v8l13 8v3l-13-4v7l5 4v2l-7-2-7 2v-2l5-4v-7L5 27v-3l13-8V8c0-2 1-4 2-4Z"/></svg></i><p class="eb">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div data-rv data-lz-group="guideFood guideCulture guidePlans"><i aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="m4 10 10-4 12 4 10-4v26l-10 4-12-4-10 4V10ZM14 6v26m12-4v8"/><path d="M30 15c0 4-6 10-6 10s-6-6-6-10a6 6 0 0 1 12 0Z"/><circle cx="24" cy="15" r="2"/></svg></i><p class="eb">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div></div></section>' +

    '<section class="sec velvet2 gala-quote" data-lz-group="quote">' + '<div class="in-w"><span class="bigq" aria-hidden="true"><svg viewBox="0 0 64 48" fill="currentColor"><path d="M27 5C13 11 7 20 7 32c0 8 4 12 10 12 6 0 10-4 10-10 0-6-4-10-10-10h-2c1-7 5-12 14-17L27 5Zm30 0C43 11 37 20 37 32c0 8 4 12 10 12 6 0 10-4 10-10 0-6-4-10-10-10h-2c1-7 5-12 14-17L57 5Z"/></svg></span><blockquote data-lz="quote">' + S.quote + '</blockquote>' + ORN + '<p class="eb" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec velvet edge" id="faq" data-lz-anchor="faq" data-lz-hide-empty><div class="in-w"><p class="eb">' + S.faqK + '</p><h2 class="foil">' + S.faqT + '</h2>' +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary data-lz-f="q">' + f[0] + '</summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div></div></section>' +

    '<section class="sec velvet" id="rsvp" data-lz-anchor="rsvp" style="padding-top:10px"><div class="in-w"><div class="frame">' + fan(46) +
      '<p class="eb" style="margin-top:16px">R.S.V.P.</p><h2 class="foil">' + S.guest + '</h2><p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)">' + S.seatsRes + '</p>' +
      '<div id="rsForm"><p style="margin:14px 0 6px;text-align:left"><span data-lz="rsvpMsg">' + S.rsvpMsg + '</span> <span data-lz-if="rsvpDeadline">' + S.until + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span>.</span></p>' +
        '<div id="people"></div>' +
        '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
        '<button type="button" class="btn" style="margin-top:22px" id="rsSave">' + S.save + '</button></div>' +
      '<p class="gala-demo gala-notice">' + S.demoNotice + '</p><div id="rsDone" hidden style="padding:18px 0 4px"><p class="cz foil" style="font-size:30px">' + S.thanks + '</p><ul id="rsGuests" class="gala-summary"></ul><p id="rsSum" style="margin:10px 0 20px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>' +
    '</div></div></section>' +

    '<footer class="velvet2"><div class="gala-seal"><span data-lz-seal>A·L</span></div>' + '<div style="color:var(--gold)">' + fan(70) + '</div><p class="cz foil" style="margin-top:10px"><span data-lz="n1">' + S.n1 + '</span> &amp; <span data-lz="n2">' + S.n2 + '</span></p>' + ORN + '<p class="eb" style="color:var(--muted)"><span data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span> · <span data-lz="city">' + S.city + '</span></p><nav class="gala-footnav" aria-label="'+ (LANG==='en'?'Invitation sections':'Secciones de la invitación') +'"><a href="#itinerario">'+ S.program +'</a><a href="#viaje" data-lz-show="viajeOn">'+ S.travel +'</a><a href="#rsvp">'+ (LANG==='en'?'RSVP':'Confirmación') +'</a></nav></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
