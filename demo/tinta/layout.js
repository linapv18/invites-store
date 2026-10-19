
/* Plantilla Tinta: papel crema, fotos en blanco y negro y tinta roja. El HTML se arma aquí ANTES de cargar
   demo/shared/content.js, para que el editor encuentre las marcas data-lz… al llenar el contenido. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación: marca nuestra fecha en el calendario', mark: 'Marcar la fecha', hint: 'Toca nuestra fecha', for: 'Para',
      saveDate: '¡guarda la fecha!', seats: '4 cupos', enter: 'Abrir invitación', love: 'te quiero', cheers: '¡salud!', y: 'y',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', loveIs: 'El amor es…', dreams: '…sueños compartidos', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      heroPat: '{d} de {M} de {Y}', heroTxt: '14 de marzo de 2027', dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027',
      cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      ourStory: 'nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      programK: 'el programa', progPat: '{W} {d} de {M}', progTxt: 'Domingo 14 de marzo', map: 'ver mapa <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      fromAway: 'si vienen de fuera', travel: 'Viaje', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stayK: 'dónde dormir', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa:', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThereK: 'cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideK: 'qué hacer', guideT: 'Guía de la ciudad', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'preguntas', faqT: 'Lo que nos preguntan',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      coming: '¿vienes?', rsvpT: 'Confirma tu asistencia', before: 'Antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Sí, voy', no: 'No podré', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', send: 'Enviar respuesta', err: 'Indiquen la respuesta de cada persona.',
      thanks: '¡gracias!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      withW: 'CON', loveW: 'amor', numPat: '{dd}.{mm}.{Y}', demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation: mark our date on the calendar', mark: 'Mark the date', hint: 'Tap our date', for: 'For',
      saveDate: 'save the date!', seats: '4 seats', enter: 'Open invitation', love: 'I love you', cheers: 'cheers!', y: '&',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', loveIs: 'Love is…', dreams: '…shared dreams', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      heroPat: '{Mc} {d}, {Y}', heroTxt: 'March 14, 2027', dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027',
      cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      ourStory: 'our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      programK: 'the program', progPat: '{W}, {Mc} {d}', progTxt: 'Sunday, March 14', map: 'see map <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      fromAway: 'if you’re traveling', travel: 'Travel', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stayK: 'where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code:', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThereK: 'getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guideK: 'what to do', guideT: 'City guide', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'questions', faqT: 'What people ask us',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      coming: 'coming?', rsvpT: 'Let us know', before: 'Kindly reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Yes, I’ll be there', no: 'Can’t make it', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', send: 'Send reply', err: 'Please answer for each person.',
      thanks: 'thank you!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      withW: 'WITH', loveW: 'love', numPat: '{mm}.{dd}.{Y}', demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.TintaS = S;
  var rng = function (seed) { var r = seed; return function () { return (r = (r * 9301 + 49297) % 233280) / 233280; }; };
  var f1 = function (v) { return v.toFixed(1); };
const se = (v, n) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);
// Trazo a mano alzada: rectángulo redondeado (n alto) o elipse (n = 2) que se pasa un poco al cerrar.
function wobble(w, h, n, seed, pad = 5, over = .5, grow = 0) {
  const Q = rng(seed), a = Q() * 6, b = Q() * 6, N = 96, pts = [];
  for (let k = 0; k <= N; k++) {
    const t = -.35 + k / N * (Math.PI * 2 + over), g = 1 + grow * k / N;
    pts.push([w / 2 + (w / 2 - pad) * se(Math.cos(t), n) * (1 + .014 * Math.sin(4 * t + a)) * g, h / 2 + (h / 2 - pad) * se(Math.sin(t), n) * (1 + .022 * Math.sin(3 * t + b)) * g]);
  }
  return 'M' + pts.map(p => p.map(f1).join(' ')).join('L');
}
const loopTxt = (t, n = 5) => { const s = (t + ' ').repeat(n); return `<span>${s}${s}</span>`; };
const RING = `<svg class="ring draw" viewBox="0 0 116 126" aria-hidden="true"><path pathLength="1" d="${wobble(116, 126, 2, 11, 8, .7, .06)}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// Las tres casillas (día anterior, el día y el siguiente) las llena calFill() con la fecha de la boda.
  const cal = (cls = '', attrs = '') => { const tag = attrs ? 'button' : 'div'; return `<${tag} class="cal ${cls}" ${attrs ? 'type="button"' : ''} ${attrs}>${[0,1,2].map(i=>`<span class="cal-cell"><span class="wd"></span><span class="mo"></span><span class="dn"></span>${i===1?RING:''}</span>`).join('')}</${tag}>`; };
const WAVE = (d = 'M-6 26C40 6 70 48 120 24S190 2 232 28 300 50 340 18 390 10 410 24') => `<svg class="wave draw" viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
const MINI = `<svg class="mini draw" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M20 8C60 2 90 14 140 8S230 2 280 9" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`;
const CLIP = '<svg class="pc" viewBox="0 0 18 46" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 30V9a4 4 0 0 1 8 0v27a6 6 0 0 1-12 0V12"/></svg>';

  var N = function (k, up) { return '<span data-lz="' + k + '"' + (up ? ' style="text-transform:uppercase"' : '') + '>' + S[k] + '</span>'; };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var img = function (src, n, cls, pos) { return '<img class="ph-img"' + (cls ? ' id="' + cls + '"' : '') + ' src="' + src + '" data-lz-src="photo:' + n + '" alt="" loading="lazy"' + (pos ? ' style="object-position:' + pos + '"' : '') + '>'; };
  var names = '<span data-lz="n1" style="text-transform:uppercase">' + S.n1 + '</span> <span class="ms">' + S.y + '</span> <span data-lz="n2" style="text-transform:uppercase">' + S.n2 + '</span>';

  document.getElementById('app').innerHTML =
  // ======================= APERTURA: marcar la fecha en el calendario =======================
  '<div class="opening paper" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="loop" style="top:22px;rotate:-6deg" aria-hidden="true">' + loopTxt(S.love) + '</div>' +
    '<div class="loop rev" style="bottom:18px;rotate:-6deg" aria-hidden="true">' + loopTxt(S.love) + '</div>' +
    '<div class="opening-content"><p class="cap" style="margin-top:40px" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<h1 class="oname">' + names + '</h1>' +
    cal('ocal', 'id="ttCal" aria-pressed="false" aria-label="' + S.mark + '"') +
    '<p class="hint" id="hint" aria-live="polite">' + S.hint + '</p>' +
    '<div class="after" inert><p class="save writes"><span class="write">' + S.saveDate + '</span></p><p style="font-size:12.5px">' + S.for + ' <b>' + S.guest + '</b> · ' + S.seats + '</p><button type="button" class="btn" style="margin-top:14px" id="enter" tabindex="-1" disabled>' + S.enter + '</button><p class="lz-closing" data-lz="envClosing" data-lz-keep hidden>' + S.envClosing + '</p></div></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="fm" style="font-size:16px;letter-spacing:.16em">' + names.replace('class="ms"', 'class="ms" style="font-size:28px"') + '</span><span style="font:700 10px \'Courier Prime\'" data-lz-date="' + S.numPat + '">14.03.2027</span></div>' +
  '<main id="invite" class="paper" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada">' +
      '<p class="cap">' + S.loveIs + '</p>' +
      '<div class="loops">' +
        '<div class="loop ink-line-a" aria-hidden="true">' + loopTxt(S.love) + '</div><div class="loop ink-line-b" aria-hidden="true">' + loopTxt(S.love) + '</div><div class="loop front ink-line-c" aria-hidden="true">' + loopTxt(S.love) + '</div>' +
        '<div class="ph bw"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.webp" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 40%"></div>' +
      '</div>' +
      '<div class="htxt"><p class="cap">' + S.dreams + '</p><h1>' + names + '</h1>' +
      '<p class="cap" style="font-size:11px;margin-top:6px"><span data-lz-date="' + S.heroPat + '">' + S.heroTxt + '</span> · <span data-lz="city">' + S.city + '</span></p></div>' +
    '</section>' +

    '<div class="flow">' +
    '<section class="sec letter-section" style="padding-top:20px">' +
      '<div class="renv" data-rv><div class="rflap"></div><div class="rback"></div>' +
        '<div class="letter"><p class="lt">' + S.for + ' <b>' + S.guest + '</b> · ' + S.seats + '</p><p style="font-size:12.5px"><span class="typer" data-lz="msg">' + S.msg + '</span></p><span class="sig">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</span></div>' +
        '<div class="rpocket"><p class="ms">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p><div class="stamp"><div class="pic bw">' + img('/assets/fotos/beso.webp', 1) + '<b data-lz-date="{d}">14</b></div></div>' +
          '<svg class="pmark" viewBox="0 0 130 60" fill="none" stroke="currentColor" aria-hidden="true"><defs><path id="ttPm" d="M84 30a16 16 0 1 1 32 0a16 16 0 1 1-32 0"/></defs><circle cx="100" cy="30" r="23" stroke-width="1.4"/><circle cx="100" cy="30" r="13" stroke-width=".8"/><text font-size="6.4" letter-spacing="1.2" fill="currentColor" stroke="none" font-family="Courier Prime,monospace"><textPath href="#ttPm" id="pmText">OAXACA · 14.03.2027 ·</textPath></text><path d="M40 21c6-4 10 4 16 0s10 4 16 0M40 30c6-4 10 4 16 0s10 4 16 0M40 39c6-4 10 4 16 0s10 4 16 0" stroke-width="1.3"/></svg></div>' +
      '</div>' +
    '</section>' +

    '<section class="sec date-section">' +
      '<h2 data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</h2>' + cal() +
      '<p class="hand writes" style="margin-top:18px"><span class="write">' + S.saveDate + '</span></p>' +
      '<p style="margin-top:12px"><b data-lz="cdName">' + S.cdName + '</b> · <span data-lz="time0">' + S.time0 + '</span></p><p data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="tcd" aria-live="off">' + S.units.map(function (u, i) { return '<div><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' + WAVE() +
    '</section>' +

    '<section class="sec" id="historia" data-lz-anchor="historia">' +
      '<p class="hand">' + S.ourStory + '</p><h2 data-lz="storyTitle">' + S.storyTitle + '</h2><p data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="prints" data-lz-list="gallery">' + ['/assets/fotos/beso.webp','/assets/fotos/escalera.webp','/assets/fotos/muro.webp'].map(function(src){return '<div class="print" data-lz-item data-rv><i class="tape" aria-hidden="true"></i><div class="pic bw"><img class="ph-img" data-lz-f="img" src="'+src+'" alt="" loading="lazy"></div></div>';}).join('') + '</div><button class="gallery-link" type="button" data-gallery-open>' + (LANG==='en'?'Open our photo album':'Abrir nuestro álbum') + '</button>' +
    '</section>' +

    '<section class="sec" id="itinerario" data-lz-anchor="itinerario musica">' +
      '<p class="hand">' + S.programK + '</p><h2 data-lz-date="' + S.progPat + '">' + S.progTxt + '</h2>' +
      '<div class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<div class="evw" data-lz-item>' + MINI + '<div class="evr" data-rv><p class="event-time" data-lz-f="time">' + e[0] + '</p><div><h3 data-lz-f="name">' + e[1] + '</h3><p><span data-lz-f="place">' + e[2] + '</span><br><span style="color:var(--muted)" data-lz-f="address">' + e[3] + '</span></p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + '</a></div></div></div>'; }).join('') + '</div>' +
      '<div class="bub" data-frame="tt-blob" data-seed="5" data-rv data-lz-group="dressCode dressNotes dressColors"><p class="cap" style="color:var(--red)">' + S.dress + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p style="margin-top:6px" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="swatch" hidden aria-hidden="true"><i style="background:#F4F1EA"></i><i style="background:#E8D9C0"></i></div></div>' +
    '</section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<p class="hand">' + S.fromAway + '</p><h2>' + S.travel + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p><div>' +
        '<div class="clip" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes">' + CLIP + '<p class="tag">' + S.stayK + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p><span data-lz="hotelAddress">' + S.hotelAddress + '</span><br><span data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></span><br><i data-lz="hotelNotes">' + S.hotelNotes + '</i></p><a class="btn" style="margin-top:14px" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG==='en'?'Demo · booking link to be personalized':'Demostración · reserva por personalizar') + '</p></div>' +
        '<div class="clip" data-rv data-lz-group="airport transport">' + CLIP + '<p class="tag">' + S.getThereK + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div class="clip" data-rv data-lz-group="guideFood guideCulture guidePlans">' + CLIP + '<p class="tag">' + S.guideK + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div>' +
    '</section>' +

    '<section class="sec" style="padding-top:30px">' +
      '<div class="cheers"><div class="loop" aria-hidden="true" style="top:20px;--du:60s">' + loopTxt(S.cheers, 7) + '</div><div class="loop rev" aria-hidden="true" style="top:240px;--du:64s;z-index:2">' + loopTxt(S.cheers, 7) + '</div><div class="ph bw">' + img('/assets/fotos/torre.webp', 4) + '</div></div>' +
      '<div data-lz-group="quote"><blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="cap" style="font-size:10px" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div>' +
    '</section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty>' +
      '<p class="hand">' + S.faqK + '</p><h2>' + S.faqT + '</h2>' +
      '<div data-lz-list="faqs">' + S.faqs.map(function (f, i) { return '<div class="wish" data-lz-item data-frame="tt-blob" data-seed="' + (i * 7 + 2) + '" data-rv><h3 data-lz-f="q">' + f[0] + '</h3><p data-lz-f="a">' + f[1] + '</p></div>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp">' +
      '<div class="clip" data-rv style="text-align:center;rotate:0deg">' + CLIP +
        '<p class="hand">' + S.coming + '</p><h2>' + S.rsvpT + '</h2>' +
        '<p data-lz-if="rsvpDeadline">' + S.before + ' <b data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</b></p>' +
        '<p class="fm" style="font-size:22px;letter-spacing:.08em;margin-top:12px">' + S.guest + '</p><p style="font-size:11px">' + S.seatsRes + '</p>' +
        '<p class="demo-note">' + (LANG==='en'?'Demo: responses are neither sent nor saved.':'Demostración: las respuestas no se envían ni se guardan.') + '</p><div id="rsForm"><p style="margin:14px 0 4px;text-align:left" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
          '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
          '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p><button type="button" class="btn" style="margin-top:20px" id="rsSave">' + S.send + '</button></div>' +
        '<div id="rsDone" hidden style="padding-top:14px"><p class="hand">' + S.thanks + '</p><p id="rsSum" style="margin:6px 0 18px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>' +
      '</div>' +
    '</section>' +

    '</div>' +

    '<footer><div class="fph bw">' + img('/assets/fotos/escalera.webp', 2) + '</div><div class="with"><b>' + S.withW + '</b><span class="ms">' + S.loveW + '</span></div>' +
      '<p class="cap">' + N('n1') + ' ' + S.y + ' ' + N('n2') + '</p><p style="font-size:11px;margin-top:4px"><span data-lz-date="' + S.numPat + '">14.03.2027</span> · <span data-lz="city">' + S.city + '</span></p><nav class="footer-links" aria-label="' + (LANG==='en'?'Wedding information':'Información de la boda') + '"><a href="#itinerario">' + (LANG==='en'?'Schedule':'Itinerario') + '</a><a href="#rsvp">' + (LANG==='en'?'RSVP':'Confirmar asistencia') + '</a></nav></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
