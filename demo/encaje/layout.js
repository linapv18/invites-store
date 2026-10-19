
/* Plantilla Encaje: una ventana con visillo y la luz de la tarde. La invitación se abre como una ventana en casa: se tira
   de la borla, sube el estor de encaje en pliegues y aparece la pareja en un óvalo calado. El encaje, los pliegues, los
   bordes, la borla y los medallones son CSS/SVG (cambian con la paleta; el encaje siempre es claro). El HTML se arma aquí
   ANTES de cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con cariño, te esperamos en nuestra boda.', openAria: 'Invitación tras cortinas de encaje', open: 'Abrir la invitación', hint: 'o tira de la borla', for: 'Para', tassel: 'Tirar de la borla',
      y: 'y', amp: '&amp;', weddingOf: 'Nuestra boda',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', msg: 'Nos haría muy felices que celebren con nosotros el día en que unimos nuestras vidas.', photoAlt: 'Ana y León',
      numPat: '{dd} · {mm} · {Y}', numTxt: '14 · 03 · 2027', dayPat: '{W} {d} de {M} de {Y}', dayTxt: 'Domingo 14 de marzo de 2027', monthPat: '{Mc} {Y}', monthTxt: 'Marzo 2027', shortPat: '{W} {d} de {M}', shortTxt: 'Domingo 14 de marzo',
      week: ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'], addCal: 'Añadir al calendario',
      confirm: 'Confirmar asistencia', program: 'Programa', seeProgram: 'Ver el programa', confirmShort: 'Confirmar', sections: 'Secciones',
      placeK: 'El lugar', placeT: 'La celebración', map: 'Ver en el mapa',
      storyK: 'Antes del sí', storyTitle: 'Nuestra historia', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      galK: 'Galería', galT: 'Momentos', allPhotos: 'Ver todas las fotos',
      cdK: 'Cuenta regresiva', cdT: 'Falta poco', units: ['Días', 'Horas', 'Min'], cdName: 'Ceremonia civil', time0: '13:00', cdNote: 'para el día más feliz de nuestras vidas',
      progK: 'El día', progT: 'Programa',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Vestimenta', dressT: 'Código', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Evita', dressColors: 'el blanco y el marfil',
      travelK: 'Para llegar', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      airportL: 'Aeropuerto', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Traslados', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'Guía de la zona', foodL: 'Dónde comer', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Qué ver', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Planes', plans: 'Hierve el Agua y Monte Albán.',
      hotelK: 'Hotel sugerido', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar', demoBooking: 'Demostración · reserva por personalizar',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Dudas', faqT: 'Preguntas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpK: 'RSVP', rsvpT: 'Confirmación', before: 'Responde antes del', rsvpDatePat: '{d} de {M}', deadline: '14 de febrero', seatsRes: '4 lugares', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistiré', no: 'No podré ir', yesSum: 'Asistirá', noSum: 'No asistirá', replies: 'Sus respuestas', diet: 'Alergias o restricciones alimentarias', note: 'Mensaje para los novios', optional: 'Opcional', send: 'Confirmar asistencia', err: 'Elige una opción para cada persona.', missing: 'Elige una opción para',
      thanks: '¡Gracias!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demoNote: 'Demostración: las respuestas no se envían ni se guardan.',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos', wedding: 'Boda de'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With love, we look forward to seeing you at our wedding.', openAria: 'Invitation behind lace curtains', open: 'Open the invitation', hint: 'or pull the tassel', for: 'For', tassel: 'Pull the tassel',
      y: '&amp;', amp: '&amp;', weddingOf: 'Our wedding',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', msg: 'It would make us so happy to have you celebrate with us the day we join our lives.', photoAlt: 'Anna and Leo',
      numPat: '{mm} · {dd} · {Y}', numTxt: '03 · 14 · 2027', dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', monthPat: '{Mc} {Y}', monthTxt: 'March 2027', shortPat: '{W}, {Mc} {d}', shortTxt: 'Sunday, March 14',
      week: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], addCal: 'Add to calendar',
      confirm: 'RSVP', program: 'Program', seeProgram: 'See the program', confirmShort: 'RSVP', sections: 'Sections',
      placeK: 'The venue', placeT: 'The celebration', map: 'See on the map',
      storyK: 'Before the I do', storyTitle: 'Our story', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      galK: 'Gallery', galT: 'Moments', allPhotos: 'See all photos',
      cdK: 'Countdown', cdT: 'Almost there', units: ['Days', 'Hours', 'Min'], cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'until the happiest day of our lives',
      progK: 'The day', progT: 'Program',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dressK: 'Dress code', dressT: 'Attire', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Please avoid', dressColors: 'white and ivory',
      travelK: 'Getting there', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      airportL: 'Airport', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'Around town', foodL: 'Where to eat', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'What to see', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Plans', plans: 'Hierve el Agua and Monte Albán.',
      hotelK: 'Suggested hotel', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book', demoBooking: 'Demo · booking link to be personalized',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Questions', faqT: 'FAQ',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpK: 'RSVP', rsvpT: 'Will you join us?', before: 'Reply by', rsvpDatePat: '{Mc} {d}', deadline: 'February 14', seatsRes: '4 seats', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Can’t make it', yesSum: 'Attending', noSum: 'Not attending', replies: 'Your replies', diet: 'Allergies or dietary restrictions', note: 'A message for the couple', optional: 'Optional', send: 'Send RSVP', err: 'Choose an option for each person.', missing: 'Choose an option for',
      thanks: 'Thank you!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      demoNote: 'Demo: responses are neither sent nor saved.',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs', wedding: 'Wedding of'
    }
  }[LANG];
  window.EncajeS = S;

  var HEART = 'M8 14.2s-5.6-3.5-5.6-7.6A3.1 3.1 0 0 1 8 4.7a3.1 3.1 0 0 1 5.6 1.9c0 4.1-5.6 7.6-5.6 7.6z';
  var heart = function (cls) { return '<svg class="hrt ' + (cls || '') + '" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="' + HEART + '"/></svg>'; };
  var ICO = function (d, w) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.6) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var EXT = ICO('M5 11 11 5M6 5h5v5'), DOWN = ICO('M8 3v10M4 9l4 4 4-4'), CAL = ICO('M3 4.5h10v9H3zM3 7.5h10M6 3v3M10 3v3'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1', 1.5);
  var BIG = function (d) { return '<svg class="tic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLANE = BIG('M4 18 28 8l-3 6-8 3 2 8-3 1-4-7-5 2-2-3z'), I_BUS = BIG('M7 6h18a2 2 0 0 1 2 2v14H5V8a2 2 0 0 1 2-2zM5 15h22M10 22v3M22 22v3M10 18.5h.01M22 18.5h.01');
  var I_SEE = BIG('M5 12 16 5l11 7zM7 13v10M12 13v10M20 13v10M25 13v10M4 26h24'), I_FOOD = BIG('M10 4v9a3 3 0 0 0 6 0V4M13 4v24M22 4c-3 2-3 8 0 10v14'), I_PLAN = BIG('M4 21h24l-3 5H7zM16 4v15M16 6l8 11H16');

  // Borde de encaje: festones con un calado en cada uno y una fila de puntos finos. Se repite con un patrón, así sirve
  // para cualquier ancho. La clase dice de qué color es la tela (t-*) y de qué color son los calados (h-*).
  var uid = 0;
  var edge = function (cls) { return '<span class="edge ' + cls + '" aria-hidden="true"></span>'; };
  // Óvalo calado alrededor de una foto: un anillo de festones con calados y un filete fino pegado a la imagen.
  // np: lo que va dentro del óvalo cuando la invitación es sin fotos (html.lz-no-photos).
  var oval = function (cls, src, n, alt, lazy, np) {
    return '<div class="oval ' + cls + '"><img class="ph-only" src="/assets/fotos/' + src + '.jpg" data-lz-src="photo:' + n + '" alt="' + (alt || '') + '" decoding="async"' + (lazy ? ' loading="lazy"' : '') + '>' +
      (np ? '<div class="oval-np np-only" aria-hidden="true">' + np + '</div>' : '') + '<span class="lace-ring" aria-hidden="true"></span></div>';
  };
  // Medallón de encaje: doce pétalos, un botón y una corona de puntos.
  var medal = function (cls) {
    return '<span class="medal ' + (cls || '') + '" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="' + HEART + '"/></svg></span>';
  };
  var divider = '<svg class="divider" viewBox="0 0 120 16" aria-hidden="true" focusable="false"><path d="M0 8H46M74 8H120" stroke="currentColor" stroke-width="1"/><path d="' + HEART + '" transform="translate(52 0)" fill="currentColor"/></svg>';
  var tassel = '<span class="tassel" aria-hidden="true"></span>';

  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var MONO = '<span data-lz-mono>A<i>&amp;</i>L</span>';
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var info = function (icon, k, label, text) { return '<div class="tinfo" data-lz-group="' + k + '">' + icon + '<div><h3>' + label + '</h3><p data-lz="' + k + '">' + text + '</p></div></div>'; };
  var head = function (k, t, extra) { return '<div class="head"><p class="ey">' + k + '</p><h2>' + t + '</h2>' + (extra || '') + '</div>'; };

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: el estor de encaje =======================
  '<div class="opening" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="blind" aria-hidden="true"><div class="cloth-veil"></div><div class="folds">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return '<span class="fold"><span class="fold-shade"></span></span>'; }).join('') + '</div>' + edge('t-blind h-blind blind-edge') + '</div>' +
    '<span class="cord-line" aria-hidden="true"></span>' +
    '<button type="button" class="pull" id="pull" aria-label="' + S.tassel + '"><span class="cord"></span>' + tassel + '</button>' +
    '<div class="tag"><p class="tag-k">' + S.for + '</p><p class="tag-g">' + S.guest + '</p></div>' +
    '<p class="op-intro" data-lz="envIntro" data-lz-keep hidden>' + S.envIntro + '</p>' +
    '<div class="op-foot"><button type="button" class="cta" id="enter">' + S.open + '</button><p class="op-hint">' + S.hint + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<header class="mbar" id="mbar"><a class="mono" href="#portada" aria-label="' + S.n1 + ' ' + S.y + ' ' + S.n2 + '">' + MONO + '</a><nav aria-label="' + S.sections + '"><a href="#itinerario">' + S.program + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="hero dark" id="portada" data-lz-anchor="portada"><div class="hero-in">' +
      '<div class="hero-ph">' + oval('o-hero', 'muro', 0, S.photoAlt, false, N('n1') + '<span class="amp">' + S.amp + '</span>' + N('n2')) + '</div>' +
      '<div class="hero-txt"><p class="ey">' + S.weddingOf + '</p><h1 class="names" tabindex="-1">' + N('n1') + ' <span class="amp">' + S.amp + '</span> ' + N('n2') + '</h1>' +
        '<div class="hero-when"><p class="hero-d m" data-lz-date="' + S.numPat + '">' + S.numTxt + '</p><p class="hero-d d" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><p class="hero-c" data-lz="city">' + S.city + '</p></div>' +
        '<div class="hero-ctas"><a class="cta light" href="#rsvp">' + S.confirm + '</a><a class="lnk hero-prog" href="#itinerario">' + S.seeProgram + DOWN + '</a></div></div>' +
    '</div>' + edge('hero-trim') + '</section>' +

    '<section class="sec lacebg-solid welcome"><div class="wel-txt"><p class="lead" data-lz="msg">' + S.msg + '</p>' + divider + '</div>' +
      '<div class="wel-cal" data-rv><p class="ey" data-lz-date="' + S.monthPat + '">' + S.monthTxt + '</p><div class="cal" id="cal" aria-hidden="true"></div>' +
        '<p class="cal-when"><span data-lz-date="' + S.shortPat + '">' + S.shortTxt + '</span> · <span data-lz="time0">' + S.time0 + '</span></p>' +
        '<button type="button" class="cta line" id="addCal">' + CAL + S.addCal + '</button></div>' +
    '</section>' +

    '<section class="sec ivory pair">' +
      '<div class="place" id="where" data-rv>' + head(S.placeK, S.placeT) + medal() + '<p class="pl-n" id="whereName">' + S.events[0][2] + '</p><p class="pl-a" id="whereAddr">' + S.events[0][3] + '</p>' +
        '<a class="cta" id="whereMap" href="' + maps(S.events[0][2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div>' +
      '<div class="story" id="historia" data-lz-anchor="historia" data-rv>' + head(S.storyK, '<span data-lz="storyTitle">' + S.storyTitle + '</span>') + oval('o-story', 'torre', 1, '', true, '<span data-lz="i1">' + S.n1.charAt(0) + '</span><span class="amp">' + S.amp + '</span><span data-lz="i2">' + S.n2.charAt(0) + '</span>') +
        '<p class="p" data-lz="story">' + S.storyTxt + '</p><p class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p></div>' +
    '</section>' +

    '<section class="sec dark gal" id="galeria">' +
      '<div class="gal-head">' + head(S.galK, S.galT) + '<button type="button" class="cta light gal-all d" data-gallery-open>' + S.allPhotos + '</button></div>' +
      '<div class="frames" data-lz-list="gallery">' + ['beso', 'escalera', 'paseo', 'torre', 'muro'].map(function (f) { return '<div class="frame" data-lz-item><img data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy">' + edge('t-lace h-paper frame-edge') + '</div>'; }).join('') + '</div>' +
      '<button type="button" class="cta light gal-all m" data-gallery-open>' + S.allPhotos + '</button>' +
    '</section>' +

    '<section class="sec dark cd"><div class="cd-head">' + head(S.cdK, S.cdT) + '<p class="cd-note" data-lz="countdownNote">' + S.cdNote + '</p></div>' +
      '<div class="ovals" role="timer" aria-live="off">' + S.units.map(function (u, i) { return '<div class="ov-n"><b data-cd="' + 'dhm'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '<b data-cd="s" hidden></b></div>' +
    '</section>' +

    '<section class="sec dark2 prog" id="itinerario" data-lz-anchor="itinerario musica">' +
      head(S.progK, S.progT) +
      '<ol class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<li class="ev" data-lz-item data-rv>' + heart('ev-h') + '<div><p class="ev-time" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p class="ev-p" data-lz-f="place">' + e[2] + '</p><p class="ev-a" data-lz-f="address">' + e[3] + '</p><a class="lnk" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + EXT + '</a></div></li>'; }).join('') + '</ol>' +
    '</section>' +

    '<section class="sec ivory dress" data-lz-group="dressCode dressNotes dressColors">' +
      '<div class="dress-in" data-rv>' + head(S.dressK, S.dressT) + '<p class="dr-c" data-lz="dressCode">' + S.dressCode + '</p><p class="p" data-lz="dressNotes">' + S.dressNotes + '</p>' +
        '<div data-lz-group="dressColors">' + divider + '<p class="p dr-x"><b>' + S.reserved + ' <span data-lz="dressColors">' + S.dressColors + '</span>.</b></p></div></div>' +
    '</section>' +

    '<section class="sec ivory travel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="tr-a">' + head(S.travelK, S.travel, '<p class="p" data-lz="travelIntro">' + S.travelIntro + '</p>') +
        '<div class="tlist">' + info(I_PLANE, 'airport', S.airportL, S.airport) + info(I_BUS, 'transport', S.transportL, S.transport) + '</div></div>' +
      '<div class="tr-b"><div class="hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="ey">' + S.hotelK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p class="mute" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<p class="code" data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p>' +
        '<a class="cta" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="mute demo-booking">' + S.demoBooking + '</p>' + edge('t-lace h-iv hotel-edge') + '</div></div>' +
      '<div class="tr-c guide" data-lz-group="guideFood guideCulture guidePlans"><p class="ey">' + S.guideK + '</p>' + info(I_SEE, 'guideCulture', S.cultureL, S.culture) + info(I_FOOD, 'guideFood', S.foodL, S.food) + info(I_PLAN, 'guidePlans', S.plansL, S.plans) + '</div>' +
    '</section>' +

    '<section class="sec lacebg quote" data-lz-group="quote"><div class="quote-in" data-rv>' + medal('sm') + '<blockquote>«<span data-lz="quote">' + S.quote + '</span>»</blockquote><p class="sig" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec lacebg-solid faq" id="faq" data-lz-anchor="faq" data-lz-hide-empty>' + head(S.faqK, S.faqT) +
      '<div class="qs" data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<details data-lz-item' + (i ? '' : ' open') + '><summary><span data-lz-f="q">' + f[0] + '</span><span class="pm" aria-hidden="true"></span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec ivory rsvp" id="rsvp" data-lz-anchor="rsvp"><div class="card" data-rv>' +
      '<div class="rs-top">' + head(S.rsvpK, S.rsvpT) + '<p class="chipd" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p></div>' +
      '<p class="rs-for"><b>' + S.guest + '</b><span>' + S.seatsRes + '</span></p>' +
      '<div id="rsForm"><p class="mute rs-msg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<div class="fields"><label class="fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><input type="text" placeholder="' + S.optional + '"></label><label class="fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><input type="text" id="note" placeholder="' + S.optional + '"></label></div>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><div class="rs-send"><button type="button" class="cta" id="rsSave">' + S.send + '</button><p class="mute demo-note">' + S.demoNote + '</p></div></div>' +
      '<div id="rsDone" hidden>' + medal() + '<p class="sig thanks">' + S.thanks + '</p><div id="rsSum"></div><button type="button" class="lnk" id="rsEdit">' + S.edit + '</button></div>' +
      edge('t-lace h-iv card-edge') + '</div></section>' +

    '<section class="sec dark fin">' + edge('footer-trim') + medal('fin-m') +
      '<p class="fin-c" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</p><p class="fin-n">' + N('n1') + ' ' + S.amp + ' ' + N('n2') + '</p><p class="fin-d"><span data-lz-date="' + S.numPat + '">' + S.numTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<nav class="fin-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a href="#itinerario">' + S.program + '</a><a href="#viaje" data-lz-show="viajeOn">' + S.travelK + '</a><a href="#rsvp">' + S.confirmShort + '</a></nav></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
