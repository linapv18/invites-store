
/* Plantilla Celeste. El HTML se arma aquí (cielo, luna y constelaciones son SVG generados) ANTES de cargar
   demo/shared/content.js, para que el editor encuentre las marcas data-lz… al llenar el contenido.
   Los nombres que aparecen letra por letra (data-split) se copian de elementos ocultos con data-lz. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación bajo una noche estrellada', moon: 'Tocar la luna', tapMoon: 'Toca la luna', for: 'Para', seats: '4 cupos', enter: 'Abrir invitación',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', y: 'y', city: 'Oaxaca, México', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León', MU: 'MARZO',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      bigDay: 'El gran día', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027', schedule: 'Nuestra constelación', how: 'Cómo llegar <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M5 11 11 5M6 5h5v5"/></svg>',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stay: 'Alojamiento', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', guideT: 'Turismo y actividades', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitas saber', faqT: 'Preguntas frecuentes',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      before: 'Confirma antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Asistirá', no: 'No asistirá', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Enviar confirmación', err: 'Indiquen si asistirá o no cada persona.',
      wish: 'Pide un deseo: ¡confirmado!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos bajo las estrellas.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation under a starry night', moon: 'Tap the moon', tapMoon: 'Tap the moon', for: 'For', seats: '4 seats', enter: 'Open invitation',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', y: 'and', city: 'Oaxaca, Mexico', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo', MU: 'MARCH',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      bigDay: 'The big day', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', schedule: 'Our constellation', how: 'Directions <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M5 11 11 5M6 5h5v5"/></svg>',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      fromAway: 'If you’re traveling', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stay: 'Where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', guideT: 'Sights and activities', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      before: 'Please reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Attending', no: 'Not attending', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Send RSVP', err: 'Please answer for each person.',
      wish: 'Make a wish: confirmed!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you under the stars.' : 'Thanks for letting us know. We’ll miss you.'; },
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.CelesteS = S;

  var rng = function (seed) { var r = seed; return function () { return (r = (r * 9301 + 49297) % 233280) / 233280; }; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var root = document.documentElement.style;
  // Cielo: dos capas de estrellas
  function starfield(w, h, n, seed, maxR) {
    var Q = rng(seed), s = '';
    for (var i = 0; i < n; i++) s += "<circle cx='" + (Q() * w).toFixed(1) + "' cy='" + (Q() * h).toFixed(1) + "' r='" + (.3 + Q() * maxR).toFixed(2) + "' fill='%23fff' opacity='" + (.25 + Q() * .75).toFixed(2) + "'/>";
    return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E" + s.replace(/</g, '%3C').replace(/>/g, '%3E') + '%3C/svg%3E")';
  }
  root.setProperty('--st1', starfield(320, 320, 70, 5, .9));
  root.setProperty('--st2', starfield(520, 520, 40, 9, 1.4));
  root.setProperty('--moonimg', 'url("/assets/celeste/luna.webp")');
  var CSTAR = '<svg viewBox="0 0 20 20"><path d="M10 0C11 7 13 9 20 10C13 11 11 13 10 20C9 13 7 11 0 10C7 9 9 7 10 0Z" fill="#fff"/></svg>';
  var twk = function (n, seed) { var Q = rng(seed), s = ''; for (var i = 0; i < n; i++) s += '<span style="left:' + (3 + Q() * 92).toFixed(0) + '%;top:' + (3 + Q() * 92).toFixed(0) + '%;--s:' + (6 + Q() * 10).toFixed(0) + 'px;--du:' + (2.4 + Q() * 3).toFixed(1) + 's;--de:-' + (Q() * 5).toFixed(1) + 's">' + CSTAR + '</span>'; return '<div class="twk" aria-hidden="true">' + s + '</div>'; };
  // Pequeñas constelaciones que se dibujan al aparecer
  var cst = function (seed, style) { var Q = rng(seed), pts = [], i, s = ''; for (i = 0; i < 6; i++) pts.push([10 + i * 18 + Q() * 8, 14 + Q() * 70]); for (i = 1; i < 6; i++) s += '<line pathLength="1" x1="' + pts[i - 1][0].toFixed(1) + '" y1="' + pts[i - 1][1].toFixed(1) + '" x2="' + pts[i][0].toFixed(1) + '" y2="' + pts[i][1].toFixed(1) + '" style="transition-delay:' + (i - 1) * .25 + 's"/>'; pts.forEach(function (p, k) { s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (k % 2 ? 1.4 : 2.2) + '"/>'; }); return '<svg class="cst draw" viewBox="0 0 120 100" style="' + style + '" aria-hidden="true">' + s + '</svg>'; };
  var shoot = function (top, left, du, de) { return '<i class="shoot" aria-hidden="true" style="top:' + top + 'px;left:' + left + 'px;--du:' + du + 's;--de:' + de + 's"></i>'; };
  var phases = '<div class="phases" aria-hidden="true">' + [10, 6, 2, -1, 0, 1, -2, -6, -10].map(function (x) { return '<i style="--x:' + x + 'px' + (x === 0 ? ';box-shadow:0 0 10px #F4E9C8aa' : '') + '"></i>'; }).join('') + '</div>';
  // Constelación en forma de corazón
  var heartPts = []; for (var h = 0; h < 14; h++) { var t = h / 14 * Math.PI * 2; heartPts.push([125 + 6.6 * 16 * Math.pow(Math.sin(t), 3), 112 - 6.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  var CONST = '<div class="constellation"><svg class="constel" viewBox="0 0 250 230" aria-hidden="true"><path class="ln" pathLength="1" d="M' + heartPts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z"/>' + heartPts.map(function (p, i) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i % 3 ? 1.8 : 3) + '"/>'; }).join('') + '</svg><span class="constellation-mark" data-lz-seal>A · L</span></div>';
  var ticks = '';
  for (var k=0;k<72;k++) {
    var angle=k*5*Math.PI/180, inner=k%6===0?207:214;
    ticks+='<path d="M'+(240+Math.sin(angle)*inner).toFixed(2)+' '+(240-Math.cos(angle)*inner).toFixed(2)+'L'+(240+Math.sin(angle)*222).toFixed(2)+' '+(240-Math.cos(angle)*222).toFixed(2)+'"/>';
  }
  var dial='<svg class="celestial-dial" viewBox="0 0 480 480" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width=".6"><circle cx="240" cy="240" r="230"/><circle cx="240" cy="240" r="202"/>'+ticks+'<path d="M240 3v30M240 447v30M3 240h30m414 0h30"/><ellipse cx="240" cy="240" rx="229" ry="92" transform="rotate(-32 240 240)"/></g><g fill="currentColor"><path d="m240 0 3 9-3 9-3-9Z"/><circle cx="431" cy="367" r="3"/><circle cx="68" cy="89" r="2"/></g></svg>';
  var ICON = [
    '<svg width="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M5 27V8l10-5 10 5v19M2 27h26M12 27v-7h6v7M9 11h3m6 0h3M9 15h3m6 0h3"/><path d="M15 7v5m-2.5-2.5h5"/></svg>',
    '<svg width="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 17 24 11q4-1 3 2L7 21Z"/><path d="M12 14 8 5h3l7 8M13 19l-2 7h3l4-8"/><circle cx="25" cy="25" r="1" fill="currentColor"/><circle cx="4" cy="6" r=".8" fill="currentColor"/></svg>',
    '<svg width="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="15" cy="15" r="12"/><path d="M15 3v24M3 15h24" stroke-dasharray="1 3"/><path d="M15 7l2 8-2 8-2-8Z" fill="currentColor" fill-opacity=".4"/></svg>'
  ];
  var spl = function (t, k) { return Array.from(t).map(function (ch, i) { return '<b class="silver" style="--i:' + (i + (k || 0)) + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</b>'; }).join(''); };
  window.CelesteSplit = spl;
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.webp', '/assets/fotos/escalera.webp', '/assets/fotos/muro.webp'];
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var dateL = '<span data-lz-date="{d}">14</span><i class="star4"></i><span data-lz-date="{MU}">' + S.MU + '</span><i class="star4"></i><span data-lz-date="{Y}">2027</span>';

  document.getElementById('app').innerHTML =
  '<div hidden><span data-lz="n1" id="srcN1">' + S.n1 + '</span><span data-lz="n2" id="srcN2">' + S.n2 + '</span></div>' +
  // ======================= APERTURA =======================
  '<div class="opening sky" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    twk(9, 2) + shoot(90, -40, 7, 1) + shoot(380, -80, 11, 5) + phases +
    '<p class="tn" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="opening-dial">' + dial + '</div><button type="button" class="moonbtn moonball" id="moon" aria-label="' + S.moon + '"></button>' + CONST +
    '<div class="ask"><p class="it" style="font-size:22px">' + S.for + ' ' + S.guest + '</p><p class="tn" style="margin-top:8px;color:var(--silver)">' + S.tapMoon + '</p></div>' +
    '<div class="told" inert>' +
      '<p class="it silver" style="font-size:42px;line-height:1">' + N('n1') + ' &amp; ' + N('n2') + '</p>' +
      '<p class="tn" style="margin:10px 0 6px" data-lz-date="{d} · {MU} · {Y}">14 · ' + S.MU + ' · 2027</p>' +
      '<p style="font-style:italic;font-size:15px">' + S.for + ' ' + S.guest + ' · ' + S.seats + ' · <span class="cl" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</span></p>' +
      '<button type="button" class="btn" style="margin-top:14px" id="enter" tabindex="-1" disabled>' + S.enter + '</button>' +
    '</div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="it silver" style="font-size:22px">' + N('n1') + ' &amp; ' + N('n2') + '</span><span class="tn" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span></div>' +
  '<main id="invite" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada"><div class="aurora" aria-hidden="true"></div>' + twk(12, 13) + shoot(160, -60, 10, 3) +
      '<div class="in-w">' + phases + '<p class="tn" style="margin-top:18px">' + S.getting + '</p>' +
      '<div class="orbit">' + dial + '<span class="orbital-moon moonball" aria-hidden="true"></span><div class="ring" style="--du:28s;--c:#F4E9C8"></div><div class="ring r2" style="--du:18s;--c:var(--accent)"></div><div class="pic ph-only"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.webp" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div><span class="pic pic-moon moonball np-only" aria-hidden="true"></span></div>' +
      '<h1 class="letters" tabindex="-1"><span data-split="srcN1">' + spl(S.n1) + '</span><span class="amp">' + S.y + '</span><span data-split="srcN2" data-off="4">' + spl(S.n2, 4) + '</span></h1>' +
      '<div class="date">' + dateL + '</div>' +
      '<p class="tn" style="margin-top:12px;color:var(--silver)" data-lz="city">' + S.city + '</p>' +
      '<p class="msg" data-lz="msg">' + S.msg + '</p></div>' +
    '</section>' +

    '<section class="sec story-section" id="historia" data-lz-anchor="historia"><div class="in-w"><div class="story-editorial" data-rv><div class="story-copy"><p class="tn">' + S.story + '</p><h2 data-lz="storyTitle">' + S.storyTitle + '</h2><p data-lz="story">' + S.storyTxt + '</p></div>' +
      '<div class="planets" data-lz-list="gallery"><svg class="draw" viewBox="0 0 300 250" preserveAspectRatio="none" fill="none" stroke="#ffffff40" stroke-dasharray="2 5" aria-hidden="true"><path pathLength="1" d="M20 210C80 60 220 30 290 120"/></svg>' + photos.map(function (g) { return '<div class="p" data-lz-item><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div>'; }).join('') + '</div><button class="gallery-link" type="button" data-gallery-open>' + (LANG === 'en' ? 'Explore our photographs' : 'Ver nuestras fotografías') + '</button>' +
    '</div></div></section>' +

    '<section class="sec countdown-section">' + twk(5, 21) + '<div class="in-w"><p class="tn">' + S.bigDay + '</p><h2>' + (LANG === 'en' ? 'Closer to our night' : 'Más cerca de nuestra noche') + '</h2><p style="margin-top:10px;font-style:italic" data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="moons" aria-live="off">' + S.units.map(function (u, i) { return '<div><div class="moonball"><b data-cd="' + 'dhms'[i] + '">--</b></div><span>' + u + '</span></div>'; }).join('') + '</div></div></section>' +

    '<section class="sec" id="itinerario" data-lz-anchor="itinerario musica">' + cst(29, 'right:4px;top:4px;width:90px') + '<div class="in-w"><p class="tn" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><h2>' + S.schedule + '</h2>' +
      '<div class="tl" data-lz-list="events"><svg class="line draw" viewBox="0 0 12 100" preserveAspectRatio="none" fill="none" stroke="#F4E9C888" stroke-width="1" aria-hidden="true"><path pathLength="1" d="M6 0C0 25 12 40 6 55S0 85 6 100"/></svg>' + S.events.map(function (e) { return '<div data-lz-item data-rv><p class="tm" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p><span data-lz-f="place">' + e[2] + '</span><br><span data-lz-f="address">' + e[3] + '</span></p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div>'; }).join('') + '</div>' +
      '<div class="glass gc" data-rv data-lz-group="dressCode dressNotes dressColors"><p class="tn">' + S.dress + '</p><h2 style="margin:8px 0" data-lz="dressCode">' + S.dressCode + '</h2><p data-lz="dressNotes">' + S.dressNotes + '</p><p style="margin-top:8px;font-size:15px" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="planetchips" hidden aria-hidden="true"><i style="background-color:#F4F1EA"></i><i style="background-color:#E8D9C0"></i></div></div>' +
    '</div></section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' + cst(7, 'right:6px;top:18px') + '<div class="in-w"><p class="tn">' + S.fromAway + '</p><h2>' + S.travel + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="gcs">' +
        '<div class="glass" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes">' + ICON[0] + '<p class="tn" style="margin-top:6px">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p data-lz="hotelNotes">' + S.hotelNotes + '</p><a class="btn" style="margin-top:14px;padding:12px 20px" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG === 'en' ? 'Demo · booking link to be personalized' : 'Demostración · reserva por personalizar') + '</p></div>' +
        '<div class="glass" data-rv data-lz-group="airport transport">' + ICON[1] + '<p class="tn" style="margin-top:6px">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div class="glass" data-rv data-lz-group="guideFood guideCulture guidePlans">' + ICON[2] + '<p class="tn" style="margin-top:6px">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div></div></section>' +

    '<section class="sec quote-section" data-lz-group="quote">' + shoot(30, -40, 8, 2) + '<div class="in-w"><div class="quote-moon moonball" aria-hidden="true"></div>' + phases + '<blockquote class="silver" style="margin-top:20px">“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="tn" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></div></section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty>' + cst(19, 'left:6px;top:10px') + '<div class="in-w"><p class="tn">' + S.faqK + '</p><h2>' + S.faqT + '</h2>' +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary data-lz-f="q">' + f[0] + '</summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div></div></section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp"><div class="in-w"><div class="glass" style="padding:32px 22px" data-rv><p class="tn" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p><h2>' + S.guest + '</h2><p class="tn" style="color:var(--silver)">' + S.seatsRes + '</p>' +
      '<p class="demo-note">' + (LANG === 'en' ? 'Demo: responses are neither sent nor saved.' : 'Demostración: las respuestas no se envían ni se guardan.') + '</p><div id="rsForm"><p style="margin:14px 0 4px;text-align:left" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
        '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
        '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
        '<button type="button" class="btn" style="margin-top:22px" id="rsSave">' + S.save + '</button></div>' +
      '<div id="rsDone" hidden style="padding-top:14px"><p class="it silver" style="font-size:26px">' + S.wish + '</p><p id="rsSum" style="margin:10px 0 0"></p><button type="button" class="btn" style="margin-top:18px" id="rsEdit">' + S.edit + '</button></div>' +
    '</div></div></section>' +

    '<footer><div class="footer-horizon" aria-hidden="true"></div>' + twk(8, 41) + '<div class="moonball" style="width:70px;height:70px;margin:0 auto 18px"></div><p class="it silver" style="font-size:40px">' + N('n1') + ' &amp; ' + N('n2') + '</p><p class="tn" style="margin-top:8px;color:var(--silver)"><span data-lz-date="{d} · {MU} · {Y}">14 · ' + S.MU + ' · 2027</span> · <span data-lz="city">' + S.city + '</span></p></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
