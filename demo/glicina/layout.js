
/* Plantilla Glicina: jardín de glicinas con encaje. Los racimos, la rama, las hortensias y el encaje
   son imágenes de assets/glicina/ (los racimos se mecen con CSS); los íconos y el corazón de encaje son SVG.
   El HTML se arma aquí ANTES de cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz…. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación detrás de una cortina de glicinas', part: 'Abrir la cortina de glicinas', hint: 'Toca las glicinas', for: 'Para',
      invite: 'Invitación de boda', seats: '4 cupos', enter: 'Abrir invitación', y: 'y',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', getting: 'Nos vamos a casar', dear: 'Queridos familiares y amigos', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      datePat: '{dd} | {mm} | {Y}', dateTxt: '14 | 03 | 2027', heroPat: '{W} · {dd} | {mm} | {Y}', heroTxt: 'Domingo · 14 | 03 | 2027',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      monthPat: 'Nuestro {M}', monthTxt: 'Nuestro marzo', wd: ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'],
      cdName: 'Ceremonia civil', time0: '1:00 p. m.', yes2: 'Nos daremos el sí en…', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      program: 'Programa del día', map: 'Cómo llegar',
      events: [['13:00', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['14:30', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['20:00', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'Blanco y marfil',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y hospedaje', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitan saber', faqT: 'Preguntas frecuentes',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      rsvpT: 'Confirma tu asistencia', before: 'Antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistiré con gusto', no: 'No podré asistir', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', send: 'Enviar respuesta', err: 'Indiquen la respuesta de cada persona.',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      dateK: 'Guarden la fecha', dayK: 'El día', dressK: 'Qué ponerse', hotelK: 'Hotel sugerido', rsvpH: 'Los esperamos', colYes: 'Asistirá', colNo: 'No podrá', allPhotos: 'Ver todas las fotos', scroll: 'Desliza', sections: 'Secciones', storyNav: 'Historia', progNav: 'Programa', travelNav: 'Viaje', faqNav: 'Preguntas', confirm: 'Confirmar', demoNote: 'Demostración: las respuestas no se envían ni se guardan.', demoBooking: 'Demostración · reserva por personalizar', coverPat: '{W} · {d} de {M} de {Y}', coverTxt: 'Domingo · 14 de marzo de 2027', endPat: '{dd} · {mm} · {Y}', endTxt: '14 · 03 · 2027',
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation behind a curtain of wisteria', part: 'Open the wisteria curtain', hint: 'Tap the wisteria', for: 'For',
      invite: 'Wedding invitation', seats: '4 seats', enter: 'Open invitation', y: 'and',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', getting: 'We’re getting married', dear: 'Dear family and friends', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      datePat: '{mm} | {dd} | {Y}', dateTxt: '03 | 14 | 2027', heroPat: '{W} · {mm} | {dd} | {Y}', heroTxt: 'Sunday · 03 | 14 | 2027',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      monthPat: 'Our {Mc}', monthTxt: 'Our March', wd: ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'],
      cdName: 'Civil ceremony', time0: '1:00 PM', yes2: 'We’ll say “I do” in…', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      program: 'The day’s program', map: 'Directions',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory',
      fromAway: 'If you’re traveling', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      rsvpT: 'Please reply', before: 'Kindly reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Will gladly attend', no: 'Unable to attend', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', send: 'Send reply', err: 'Please answer for each person.',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      dateK: 'Save the date', dayK: 'The day', dressK: 'What to wear', hotelK: 'Suggested hotel', rsvpH: 'We hope to see you', colYes: 'Attending', colNo: 'Not attending', allPhotos: 'See all photos', scroll: 'Scroll', sections: 'Sections', storyNav: 'Story', progNav: 'Program', travelNav: 'Travel', faqNav: 'FAQ', confirm: 'RSVP', demoNote: 'Demo: responses are neither sent nor saved.', demoBooking: 'Demo · booking link to be personalized', coverPat: '{W} · {Mc} {d}, {Y}', coverTxt: 'Sunday · March 14, 2027', endPat: '{mm} · {dd} · {Y}', endTxt: '03 · 14 · 2027',
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.GlicinaS = S;
  var f1 = function (v) { return v.toFixed(1); };
const ORN = w => `<svg class="orn draw" viewBox="0 0 200 24" width="${w}" fill="none" stroke="currentColor" stroke-width="1"><path pathLength="1" d="M6 12H72c8 0 12-8 20-8 6 0 8 6 3 7-4 1-5-4-1-5"/><path pathLength="1" d="M194 12H128c-8 0-12-8-20-8-6 0-8 6-3 7 4 1 5-4 1-5"/><path pathLength="1" d="M88 15c5 5 9 6 12 6s7-1 12-6"/></svg>`;
const glIcon = {
  // Argollas entrelazadas, una con brillante
  rings: `<g fill="currentColor" fill-opacity=".16"><path fill-rule="evenodd" d="M30 31a11 11 0 1 1-22 0a11 11 0 1 1 22 0ZM27.3 31a8.3 8.3 0 1 0-16.6 0a8.3 8.3 0 1 0 16.6 0Z"/><path fill-rule="evenodd" d="M45 31a11 11 0 1 1-22 0a11 11 0 1 1 22 0ZM42.3 31a8.3 8.3 0 1 0-16.6 0a8.3 8.3 0 1 0 16.6 0Z"/></g>
    <circle cx="19" cy="31" r="11"/><circle cx="19" cy="31" r="8.3"/><circle cx="34" cy="31" r="11"/><circle cx="34" cy="31" r="8.3"/>
    <path d="M27.4 22.4A11 11 0 0 1 30 31" stroke-width="2.6" style="stroke:var(--cream)"/><path d="M27.4 22.4A11 11 0 0 1 30 31M25.4 24.9A8.3 8.3 0 0 1 27.3 31"/>
    <path d="M14 25a7 7 0 0 1 6-2.6" stroke-opacity=".45"/><path d="M30.5 26.5a7 7 0 0 1 6-2.6" stroke-opacity=".45"/>
    <path d="M30.6 20.2h6.8l-1.3 2.4h-4.2Z" fill="currentColor" fill-opacity=".3"/><path d="M29 15.6 31.6 12h4.8l2.6 3.6-5 5.4Z" fill="#fff"/><path d="M29 15.6h10M31.6 12l2.4 3.6 2.4-3.6M34 15.6V21" stroke-width=".7"/>
    <path d="M42 7v4.4M39.8 9.2h4.4M23 8.5v3M21.5 10h3" stroke-width=".8"/>`,
  // Dos copas que brindan, con champaña, burbujas y salpicadura
  glasses: `${[[21, 14], [35, -14]].map(([x, a]) => `<g transform="translate(${x} 30) rotate(${a})"><path d="M-4.3 -14L4.3 -14L4 -6C3.6 -2 1.8 0 0 0C-1.8 0 -3.6 -2 -4 -6Z" fill="#EAD9A0" fill-opacity=".7" stroke="none"/><path d="M-4.6 -21L4.6 -21L4 -6C3.6 -2 1.8 0 0 0C-1.8 0 -3.6 -2 -4 -6Z" fill="#fff" fill-opacity=".35"/><path d="M-3 -19.5L-2.6 -7" stroke-opacity=".35"/><path d="M0 0V11"/><ellipse cy="11.6" rx="5.2" ry="1.3" fill="currentColor" fill-opacity=".15"/><circle cx="-.8" cy="-5" r=".6" fill="currentColor"/><circle cx="1" cy="-8.5" r=".55" fill="currentColor"/><circle cx="-.4" cy="-11.5" r=".5" fill="currentColor"/></g>`).join('')}
    <path d="M28 6.5V3.5M24.6 7.6l-1.8-2.2M31.4 7.6l1.8-2.2" stroke-width=".8"/><circle cx="26" cy="3" r=".7" fill="currentColor"/><circle cx="30.4" cy="2.2" r=".6" fill="currentColor"/>`,
  // Plato con ramita de glicina, tenedor y cuchillo
  dinner: `<circle cx="28" cy="25" r="14" fill="currentColor" fill-opacity=".1"/><circle cx="28" cy="25" r="14"/><circle cx="28" cy="25" r="10.4"/><path d="M19.5 19.5a12 12 0 0 1 6-3.6" stroke-opacity=".45"/>
    <path d="M24 21c3 1 5 3 6 7" stroke-width=".7"/>${[[25, 22.5], [27, 23.8], [28.6, 25.6], [29.6, 27.8], [26.6, 21.4]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${1.4 - i * .12}" ry="${1.1 - i * .1}" style="fill:var(--lav)" stroke="none"/>`).join('')}<path d="M24 21l-1.6-1.4M24 21l-.6 2" stroke-width=".6"/>
    <path d="M6 8v7M8 8v7M10 8v7M6 15c0 3 4 3 4 0"/><path d="M7.2 17.6h1.6l.4 23.4a1.2 1.2 0 0 1-2.4 0Z" fill="currentColor" fill-opacity=".18"/>
    <path d="M49 8c-3.2 4-3.4 11-1.4 15h1.9V8Z" fill="currentColor" fill-opacity=".18"/><path d="M48.1 23h1.6l.3 18a1.1 1.1 0 0 1-2.2 0Z" fill="currentColor" fill-opacity=".18"/>`,
  // Candelabro con velas encendidas
  candles: `${[[14, 14], [27, 10], [40, 14]].map(([x, y]) => `<circle class="glw" cx="${x}" cy="${y - 5}" r="6" fill="url(#glGlow)" stroke="none"/><rect x="${x - 1.6}" y="${y}" width="3.2" height="${28 - y}" rx=".6" fill="#fff"/><path d="M${x - 1.6} ${y + 1.6}c.6 1.4 1.2 1.4 1.4 3.2M${x + .6} ${y}v2.2" stroke-width=".6"/><path class="fl" d="M${x} ${y - 1}c-1.9-2.3-.6-4.8 0-6.8c.6 2 1.9 4.5 0 6.8Z" fill="#F2C766" stroke="#C99434" stroke-width=".5"/><path d="M${x} ${y - 1.4}c-.6-1-.2-2 0-2.8c.3 .9.6 1.8 0 2.8Z" fill="#fff" stroke="none"/>`).join('')}
    <path d="M11 28h6M24 28h6M37 28h6" stroke-width="1.4"/><path d="M14 28c0 5 6 7 13 7s13-2 13-7" /><path d="M27 35v8"/><ellipse cx="27" cy="38.5" rx="2" ry="1.3" fill="currentColor" fill-opacity=".2"/><path d="M19 47c2-3 4.4-4 8-4s6 1 8 4Z" fill="currentColor" fill-opacity=".15"/>`
};
const GLI = k => `<svg class="ic" viewBox="0 0 56 50" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glIcon[k]}</svg>`;
const CHANDELIER = '<svg class="draw" viewBox="0 0 80 62" width="80" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" style="color:var(--sage);display:block;margin:0 auto"><path pathLength="1" d="M40 0v12M34 18a6 6 0 1 0 12 0a6 6 0 1 0-12 0M10 32c10 9 50 9 60 0M10 32c0-6 6-8 10-6M70 32c0-6-6-8-10-6M40 24v16M20 38v8M40 40v8M60 38v8M15 46h10M35 48h10M55 46h10M20 34c-1-2 0-3 0-4 1 1 1 3 0 4M40 36c-1-2 0-3 0-4 1 1 1 3 0 4M60 34c-1-2 0-3 0-4 1 1 1 3 0 4M30 54l10 6 10-6"/></svg>';
const tIcon = {
  hotel: '<svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M4 29V14L17 6l13 8v15M2 29h30M13 29v-8h8v8"/></svg>',
  plane: '<svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"><path d="M3 18 28 12c4-1 5 2 2 4L7 24Zm10-3L9 5h4l9 8M14 21l-3 8h4l6-10"/></svg>',
  map: '<svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M17 30s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15Z"/><circle cx="17" cy="15" r="3.4"/></svg>'
};
const HEART = '<svg viewBox="0 0 46 42" aria-hidden="true"><path d="M23 39C8 29 2 20 5 12c3-7 12-8 18-1 6-7 15-6 18 1 3 8-3 17-18 27Z" style="fill:var(--rose)" filter="url(#glSoft)"/></svg>';
const brush = c => `<svg viewBox="0 0 70 26" aria-hidden="true"><path d="M5 11C20 4 46 3 64 7c4 1 4 9 0 11-18 4-42 5-58 2-5-1-5-7-1-9Z" style="fill:${c};stroke:var(--sage2)" stroke-width=".9" filter="url(#glRough)"/></svg>`;

  var G = '/assets/glicina/optimized/';
  var floral = function () { return '<div class="floral-border" aria-hidden="true"><img src="' + G + 'glicinas-marfil.webp" alt="" loading="lazy" decoding="async"><img src="' + G + 'glicinas-marfil.webp" alt="" loading="lazy" decoding="async"></div>'; };
  var LACE = '<img class="lace" src="' + G + 'encaje-ovalo.webp" alt="">';
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var names = function (d) { return '<h1 class="writes"><span class="write" data-lz="n1">' + S.n1 + '</span><span class="y">' + S.y + '</span><span class="write" style="transition-delay:' + d + 's" data-lz="n2">' + S.n2 + '</span></h1>'; };
  var ovalNames = function (d) { return '<p class="mc">' + S.invite + '</p>' + names(d) + '<p class="dt" data-lz-date="' + S.datePat + '">' + S.dateTxt + '</p>'; };
  var ICONS = ['rings', 'dinner', 'glasses', 'candles'].map(function (k, i) { return GLI(k).replace('class="ic"', 'class="ic i' + i + '"'); }).join('');

  var ICO = function (d) { return '<svg class="gx-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var GRID = ICO('M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z'), PIN = ICO('M8 14s-4.5-4-4.5-7.5a4.5 4.5 0 0 1 9 0C12.5 10 8 14 8 14zM8 8.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z'), EXT = ICO('M5 11 11 5M6 5h5v5'), WARN = ICO('M8 2.5 14 13H2zM8 6.5v3M8 11.2v.1');
  var DIV = '<div class="gx-div" aria-hidden="true"><i></i><img src="' + G + 'racimo-largo.webp" alt="" loading="lazy" decoding="async"><i></i></div>';
  var dl = function (k, label, text) { return '<div class="gx-dl" data-lz-group="' + k + '"><p class="gx-k gx-mute">' + label.replace(/\.$/, '') + '</p><p class="gx-p" data-lz="' + k + '">' + text + '</p></div>'; };

  document.getElementById('app').innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="glRough" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter><radialGradient id="glGlow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".8"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient><filter id="glLaceSh" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx=".7" dy="1.3" stdDeviation=".9" flood-color="#3d3a20" flood-opacity=".38"/></filter><pattern id="glNet" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0L4 4M4 0L0 4" stroke="#8a8460" stroke-opacity=".2" stroke-width=".35"/></pattern></defs></svg>' +
  // ======================= APERTURA: cortina de glicinas =======================
  '<div class="opening garden" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="estate-scene" aria-hidden="true"></div><div class="opening-content"><p class="mc opening-intro" style="margin-top:40px" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="loval">' + LACE + ovalNames(.35) + '</div>' +
    '<div class="after" inert><p>' + S.for + ' <b style="font-weight:600">' + S.guest + '</b> · ' + S.seats + '</p><button type="button" class="btn" id="enter" tabindex="-1" disabled>' + S.enter + '</button><p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div></div>' +
    '<div class="curt l" aria-hidden="true">' + '<img class="curtain-botanical" src="' + G + 'cortina-velo.webp" alt="" fetchpriority="high" decoding="async">' + '</div>' +
    '<div class="curt r" aria-hidden="true">' + '<img class="curtain-botanical" src="' + G + 'cortina-velo.webp" alt="" fetchpriority="high" decoding="async">' + '</div>' +
    '<button type="button" class="curtain-trigger" data-part aria-label="' + S.part + '"></button><p class="ohint" id="hint" aria-live="polite"><span>' + S.hint + '</span></p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  // Papel de lino, filetes finos y la glicina como único adorno. En escritorio la portada queda fija a la izquierda.
  '<header class="mbar" id="mbar"><span class="gx-bar-names" aria-hidden="true">' + N('n1') + ' &amp; ' + N('n2') + '</span><nav aria-label="' + S.sections + '">' +
    [['historia', S.storyNav], ['itinerario', S.progNav], ['viaje', S.travelNav], ['faq', S.faqNav]].map(function (l) { return '<a class="gx-dk" href="#' + l[0] + '">' + l[1] + '</a>'; }).join('') +
    '<a class="gx-bar-cta" href="#rsvp">' + S.confirm + '</a></nav></header>' +
  '<main id="invite" inert>' +
    '<section class="gx-cover" id="portada" data-lz-anchor="portada"><div class="gx-cover-art" aria-hidden="true"></div><div class="gx-cover-in">' +
      '<div class="gx-oval ph-only">' + LACE + '<div class="gx-oval-in"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" decoding="async"></div></div>' +
      '<div class="gx-oval np-only" aria-hidden="true">' + LACE + '<div class="gx-oval-in gx-oval-text"><p class="gx-k">' + S.invite + '</p><p class="gx-oval-names">' + N('n1') + '<span>' + S.y + '</span>' + N('n2') + '</p></div></div>' +
      '<h1 class="gx-names" tabindex="-1">' + N('n1') + ' <span class="y">' + S.y + '</span> ' + N('n2') + '</h1>' +
      '<p class="gx-k gx-ink" data-lz-date="' + S.coverPat + '">' + S.coverTxt + '</p><p class="gx-city" data-lz="city">' + S.city + '</p>' +
      '<p class="gx-cue" aria-hidden="true"><span>' + S.scroll + '</span><i></i></p>' +
    '</div></section>' +
    '<div class="gx-flow">' +
    '<section class="gx-sec gx-welcome"><p class="gx-k">' + S.for + '</p><p class="gx-guest">' + S.guest + '</p>' +
      '<h2 class="gx-h">' + S.dear + '</h2><p class="gx-p" data-lz="msg">' + S.msg + '</p></section>' +
    DIV +
    '<section class="gx-sec" id="historia" data-lz-anchor="historia"><p class="gx-k">' + S.story + '</p><h2 class="gx-h" data-lz="storyTitle">' + S.storyTitle + '</h2><p class="gx-p gx-narrow" data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="gx-collage ph-only" data-lz-list="gallery" data-rv>' + ['beso', 'escalera', 'muro'].map(function (f) { return '<div class="gx-arch" data-lz-item><img class="ph-img" data-lz-f="img" src="/assets/fotos/' + f + '.jpg" alt="" loading="lazy" decoding="async"></div>'; }).join('') + '</div>' +
      '<button type="button" class="gx-link ph-only" data-gallery-open>' + GRID + S.allPhotos + '</button></section>' +
    '<div class="gx-band"><section class="gx-sec" id="cuando"><p class="gx-k">' + S.dateK + '</p><h2 class="gx-h" data-lz-date="' + S.monthPat + '">' + S.monthTxt + '</h2>' +
      '<div class="week" id="week">' + S.wd.map(function (d) { return '<span>' + d + '</span>'; }).join('') + [0, 1, 2, 3, 4, 5, 6].map(function () { return '<b></b>'; }).join('') + '</div>' +
      '<p class="gx-k gx-cd-k"><span data-lz="cdName">' + S.cdName + '</span> · <span data-lz="time0">' + S.time0 + '</span></p><p class="gx-h gx-h-s">' + S.yes2 + '</p>' +
      '<div class="gx-cd" aria-live="off">' + S.units.map(function (u, i) { return '<div><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' +
      '<p class="gx-m gx-it" data-lz="countdownNote">' + S.cdNote + '</p></section></div>' +
    '<section class="gx-sec" id="itinerario" data-lz-anchor="itinerario musica"><p class="gx-k">' + S.dayK + '</p><h2 class="gx-h">' + S.program + '</h2>' +
      '<div class="gx-prog" data-lz-list="events">' + S.events.map(function (e) { return '<div class="gx-ev" data-lz-item data-rv>' + ICONS + '<p class="gx-k gx-ink" data-lz-f="time">' + e[0] + '</p><h3 class="gx-h gx-h-s" data-lz-f="name">' + e[1] + '</h3><p class="gx-p" data-lz-f="place">' + e[2] + '</p><p class="gx-m" data-lz-f="address">' + e[3] + '</p><a class="gx-link" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + PIN + S.map + '</a></div>'; }).join('') + '</div></section>' +
    DIV +
    '<section class="gx-sec" data-lz-group="dressCode dressNotes dressColors"><p class="gx-k">' + S.dressK + '</p><h2 class="gx-h">' + S.dress + '</h2><p class="gx-code" data-lz="dressCode">' + S.dressCode + '</p>' +
      '<p class="gx-p gx-narrow" data-lz="dressNotes">' + S.dressNotes + '</p><p class="gx-m" data-lz-group="dressColors"><i>' + S.reserved + '</i> <span data-lz="dressColors">' + S.dressColors + '</span></p></section>' +
    DIV +
    '<section class="gx-sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn"><p class="gx-k">' + S.fromAway + '</p><h2 class="gx-h">' + S.travel + '</h2><p class="gx-p gx-narrow" data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="gx-hotel" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes"><p class="gx-k">' + S.hotelK + '</p><h3 class="gx-h gx-h-s" data-lz="hotel">' + S.hotel + '</h3><p class="gx-p" data-lz="hotelAddress">' + S.hotelAddress + '</p>' +
        '<div data-lz-group="hotelCode"><p class="gx-k gx-mute">' + S.rate + '</p><p class="gx-chip" data-lz="hotelCode">' + S.hotelCode + '</p></div><p class="gx-m gx-it" data-lz="hotelNotes">' + S.hotelNotes + '</p>' +
        '<a class="gx-btno" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + EXT + '</a><p class="gx-m gx-it gx-demo-booking">' + S.demoBooking + '</p></div>' +
      '<i class="gx-rule" aria-hidden="true"></i>' +
      '<div class="gx-info" data-lz-group="airport transport"><h3 class="gx-h gx-h-xs">' + S.getThere + '</h3>' + dl('airport', S.airportL, S.airport) + dl('transport', S.transportL, S.transport) + '</div>' +
      '<div class="gx-info" data-lz-group="guideFood guideCulture guidePlans"><h3 class="gx-h gx-h-xs">' + S.guide + '</h3>' + dl('guideFood', S.foodL, S.food) + dl('guideCulture', S.cultureL, S.culture) + dl('guidePlans', S.plansL, S.plans) + '</div></section>' +
    DIV +
    '<section class="gx-sec gx-quote" data-lz-group="quote"><div class="gx-vista" data-rv aria-hidden="true"><i></i></div>' +
      '<blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="gx-k" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></section>' +
    DIV +
    '<section class="gx-sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty><p class="gx-k">' + S.faqK + '</p><h2 class="gx-h">' + S.faqT + '</h2>' +
      '<div class="gx-faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div></section>' +
    '<section class="gx-sec gx-reply" id="rsvp" data-lz-anchor="rsvp"><div class="gx-card" data-rv>' +
      '<p class="gx-k">' + S.rsvpT + '</p><h2 class="gx-h">' + S.rsvpH + '</h2><p class="gx-k gx-mute" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
      '<p class="gx-guest">' + S.guest + '</p><p class="gx-k gx-mute">' + S.seatsRes + '</p>' +
      '<div id="rsForm"><p class="gx-m gx-rsvp-msg" data-lz="rsvpMsg">' + S.rsvpMsg + '</p>' +
        '<div class="gx-table"><div class="gx-thead" aria-hidden="true"><span></span><span>' + S.colYes + '</span><span>' + S.colNo + '</span></div><div id="people"></div></div>' +
        '<div class="gx-fields"><label class="gx-fld" data-lz-show="rsvpDiet"><span>' + S.diet + '</span><textarea rows="1"></textarea></label><label class="gx-fld" data-lz-show="rsvpNote"><span>' + S.note + '</span><textarea rows="1" id="note"></textarea></label></div>' +
        '<p class="gx-err" id="rsErr" role="alert" hidden>' + WARN + S.err + '</p><button type="button" class="gx-btn" id="rsSave">' + S.send + '</button></div>' +
      '<div id="rsDone" hidden><p class="gx-thanks">' + S.thanks + '</p><div id="rsSum" class="gx-p"></div><button type="button" class="gx-link" id="rsEdit">' + S.edit + '</button></div>' +
      '<p class="gx-m gx-it gx-demo">' + S.demoNote + '</p></div></section>' +
    '</div>' +
    '<section class="gx-end"><div class="gx-end-in"><p class="gx-k" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</p><p class="gx-end-names">' + N('n1') + ' &amp; ' + N('n2') + '</p>' +
      '<p class="gx-k gx-ink"><span data-lz-date="' + S.endPat + '">' + S.endTxt + '</span> · <span data-lz="city">' + S.city + '</span></p>' +
      '<nav class="gx-end-links" aria-label="' + (LANG === 'en' ? 'Wedding information' : 'Información de la boda') + '"><a class="gx-link" href="#itinerario">' + S.progNav + '</a><a class="gx-link" href="#rsvp">' + S.confirm + '</a></nav></div>' +
      '<img class="gx-end-flowers" src="' + G + 'hortensias.webp" alt="" loading="lazy" decoding="async"></section>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
