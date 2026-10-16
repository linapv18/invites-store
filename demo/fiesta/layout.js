
/* Plantilla Fiesta. El HTML se arma aquí (papel picado, carta de lotería y cempasúchiles son SVG
   generados) ANTES de cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz…
   al llenar el contenido. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en una carta de lotería', card: 'Voltear la carta de lotería', hint: '¡Toca la carta!', loteria: '¡Lotería!', love: 'EL AMOR',
      married: '¡Nos casamos!', enter: '¡Vamos a la fiesta!', forTxt: 'Para Familia Rodríguez · 4 cupos',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', y: 'y', city: 'Oaxaca, México', getting: '¡Nos vamos a casar!', couple: 'LOS NOVIOS', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León', MU: 'MARZO',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      caps: [['7', 'NOSOTROS'], ['22', 'LOS RECUERDOS'], ['14', 'EL AMOR']],
      almost: '¡Ya casi!', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      cheer: '¡Que vivan los novios!',
      dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027', program: 'El programa', how: 'Cómo llegar <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'Blanco y marfil',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y alojamiento', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      tHotel: 'EL HOTEL', tPlane: 'EL AVIÓN', tCity: 'LA CIUDAD',
      hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código:', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto:', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte:', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guideT: 'Qué hacer', foodL: 'Comer:', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura:', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Planes:', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitas saber', faqT: 'Preguntas',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Los novios pueden añadir su enlace o instrucciones de regalos al personalizar la invitación.']],
      limit: 'Fecha límite:', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', rsvpT: '¡Confirma tu lugar!', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: '¡Ahí estaré!', no: 'No podré', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Enviar confirmación', err: 'Indiquen la respuesta de cada persona.',
      sent: '¡Confirmado!', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. ¡Nos vemos en la fiesta!' : 'Gracias por avisarnos. Los extrañaremos.'; },
      demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation as a lotería card', card: 'Flip the lotería card', hint: 'Tap the card!', loteria: '¡Lotería!', love: 'EL AMOR',
      married: 'We’re getting married!', enter: 'Let’s party!', forTxt: 'For The Rodríguez family · 4 seats',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', y: 'and', city: 'Oaxaca, Mexico', getting: 'We’re getting married!', couple: 'THE COUPLE', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo', MU: 'MARCH',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      caps: [['7', 'THE TWO OF US'], ['22', 'THE MEMORIES'], ['14', 'THE LOVE']],
      almost: 'Almost there!', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      cheer: 'Long live the newlyweds!',
      dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', program: 'The program', how: 'Directions <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.15em;flex:none"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory',
      fromAway: 'If you’re traveling', travel: 'Travel and stay', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      tHotel: 'THE HOTEL', tPlane: 'THE PLANE', tCity: 'THE CITY',
      hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Code:', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThereT: 'Airport and transport', airportL: 'Airport:', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport:', transport: 'Shuttles will run from the hotel to the party and back.',
      guideT: 'Things to do', foodL: 'Eat:', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture:', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Plans:', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. The couple can add their registry link or gift instructions when personalizing the invitation.']],
      limit: 'Reply by:', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', rsvpT: 'Save your spot!', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'I’ll be there!', no: 'Can’t make it', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Send RSVP', err: 'Please answer for each person.',
      sent: 'Confirmed!', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you at the party!' : 'Thanks for letting us know. We’ll miss you.'; },
      demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.FiestaS = S;

  var rng = function (seed) { var r = seed; return function () { return (r = (r * 9301 + 49297) % 233280) / 233280; }; };
  var petalsAt = function (r, c, n, cc) { var s = ''; for (var i = 0; i < n; i++) s += '<ellipse cx="0" cy="' + -r * .55 + '" rx="' + r * .3 + '" ry="' + r * .55 + '" transform="rotate(' + i * 360 / n + ')" style="fill:' + c + '"/>'; return s + '<circle r="' + r * .24 + '" style="fill:' + cc + '"/>'; };
  // Papel picado: banderitas con figuras recortadas (máscara SVG con huecos).
  var circ = function (cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z'; };
  var dia = function (x, y, s) { return 'M' + x + ' ' + (y - s) + 'l' + s + ' ' + s + '-' + s + ' ' + s + '-' + s + '-' + s + 'Z'; };
  function flagMask(v) {
    var outer = 'M0 0H60V62', holes = '', i;
    for (i = 0; i < 12; i++) outer += 'L' + (60 - (i + .5) * 5) + ' ' + (i % 2 ? 62 : 69);
    outer += 'L0 62ZM4 4H56V5.5H4Z';
    if (v === 0) { for (i = 0; i < 6; i++) { var a = i * Math.PI / 3; holes += circ(30 + 9 * Math.cos(a), 33 + 9 * Math.sin(a), 3.8); } holes += circ(30, 33, 2.8) + dia(10, 13, 4) + dia(50, 13, 4) + dia(10, 53, 4) + dia(50, 53, 4); }
    if (v === 1) { holes += 'M30 46C17 37 17 24 24.5 24c3 0 5.5 2 5.5 5 0-3 2.5-5 5.5-5 7.5 0 7.5 13-5.5 22Z' + [12, 21, 39, 48].map(function (x) { return circ(x, 14, 2); }).join('') + dia(11, 50, 3.5) + dia(49, 50, 3.5) + dia(30, 55, 3); }
    if (v === 2) { [[18, 18], [30, 18], [42, 18], [24, 30], [36, 30], [18, 42], [30, 42], [42, 42]].forEach(function (p) { holes += dia(p[0], p[1], 4.6); }); holes += [12, 48].map(function (x) { return circ(x, 30, 2.2); }).join('') + circ(30, 54, 2.4); }
    // Comillas simples codificadas: el valor va dentro de un atributo style="…".
    return "url('data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 70'><path fill-rule='evenodd' d='" + outer + holes + "'/></svg>").replace(/'/g, '%27') + "')";
  }
  var FM = [flagMask(0), flagMask(1), flagMask(2)];
  var FCOLS = ['var(--pink)', 'var(--orange)', 'var(--yellow)', 'var(--teal)', 'var(--blue)', 'var(--green)', 'var(--red)'];
  var W = 1000;
  function picado(sag, cls, off) {
    var n = 14, Q = rng(n * 7 + sag + off), flags = '';
    for (var i = 0; i < n; i++) {
      var t = (i + .5) / n, x = t * W, yy = (1 - t) * (1 - t) * 3 + 2 * (1 - t) * t * (sag * 2) + t * t * 3;
      flags += '<i class="flag" style="left:' + (t * 100).toFixed(2) + '%;top:' + (yy - 1).toFixed(1) + 'px;--fm:' + FM[(i + off) % 3] + ';--c:' + FCOLS[(i + off) % FCOLS.length] + ';--du:' + (1.4 + Q() * 1.2).toFixed(2) + 's;--de:-' + (Q() * 2).toFixed(2) + 's"></i>';
    }
    return '<div class="picado ' + (cls || '') + '" style="height:' + (sag + 68) + 'px" aria-hidden="true"><svg class="str" viewBox="0 0 ' + W + ' ' + (sag + 6) + '" height="' + (sag + 6) + '" preserveAspectRatio="none"><path d="M-10 3Q' + W / 2 + ' ' + sag * 2 + ' ' + (W + 10) + ' 3" fill="none" style="stroke:var(--ink)" stroke-opacity=".55" stroke-width="1.4"/></svg>' + flags + '</div>';
  }
  var HEART = '<svg viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g class="rays">' + Array.from({ length: 18 }, function (_, i) { return '<path d="M50 56 ' + (50 + 70 * Math.cos(i * Math.PI / 9)).toFixed(1) + ' ' + (56 + 70 * Math.sin(i * Math.PI / 9)).toFixed(1) + ' ' + (50 + 70 * Math.cos(i * Math.PI / 9 + .09)).toFixed(1) + ' ' + (56 + 70 * Math.sin(i * Math.PI / 9 + .09)).toFixed(1) + 'Z" fill="#fff" opacity=".35"/>'; }).join('') + '</g>' +
    '<g class="flame"><path d="M50 40c-10-8-4-18 0-28 2 8 10 12 6 22-1 3-3 5-6 6Z" fill="var(--orange)"/><path d="M50 40c-5-5-2-11 0-16 1 5 5 8 3 13-1 2-2 2-3 3Z" fill="var(--yellow)"/></g>' +
    '<path d="M50 96C20 76 13 56 25 45c8-7 18-4 25 4 7-8 17-11 25-4 12 11 5 31-25 51Z" style="fill:var(--red)" stroke="var(--ink)" stroke-width="2.5"/><path d="M30 52c3-5 9-6 13-3" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M28 66c10 5 34 5 44 0" stroke="var(--ink)" stroke-width="2" fill="none" stroke-dasharray="3 3"/>' +
    [[30, 74, 'var(--yellow)'], [50, 80, '#fff'], [70, 74, 'var(--yellow)'], [40, 86, 'var(--pink)'], [60, 86, 'var(--pink)']].map(function (p) { return '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + petalsAt(6, p[2], 5, '#2A1B3D') + '</g>'; }).join('') + '<path d="M50 40v8" stroke="var(--ink)" stroke-width="2.5"/><g fill="none" stroke="var(--ink)" stroke-width=".5" opacity=".35"><path d="m23 55 6 3m-7 2 6 3m-6 2 7 3m-5 2 8 4m-4 1 8 4m-4 1 8 5m-4 0 9 6m25-37-5 3m7 1-5 3m4 1-5 3m3 1-6 4m3 1-7 4m3 1-6 4"/></g><path d="M34 46q10-3 16 9 8-13 18-10" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".8"/></svg>';
  // Cempasúchil
  var marigold = function (col) { var s = ''; [1, .78, .55].forEach(function (k, j) { for (var i = 0; i < 16; i++) s += '<ellipse cy="' + -17 * k + '" rx="' + 5 * k + '" ry="' + 10 * k + '" transform="rotate(' + (i * 22.5 + j * 11) + ')" style="fill:' + (j === 1 ? 'var(--yellow)' : col) + '" stroke="var(--ink)" stroke-width=".8"/>'; }); return '<svg viewBox="-30 -30 60 60" aria-hidden="true"><g class="mg">' + s + '<circle r="5" fill="#8B4A1C" stroke="var(--ink)" stroke-width="1"/></g></svg>'; };
  var conffall = function (n) { var Q = rng(77), s = ''; for (var i = 0; i < n; i++) s += '<i style="left:' + (Q() * 96).toFixed(0) + '%;--c:' + FCOLS[i % 7] + ';--du:' + (7 + Q() * 6).toFixed(1) + 's;--de:-' + (Q() * 12).toFixed(1) + 's"></i>'; return '<div class="conffall" aria-hidden="true">' + s + '</div>'; };
  var ICON = {
    hotel: '<svg width="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M6 36V12l14-8 14 8v24Z" style="fill:var(--pink)" stroke="var(--ink)" stroke-width="2"/><path d="M16 36V26h8v10" style="fill:var(--yellow)" stroke="var(--ink)" stroke-width="2"/><circle cx="20" cy="16" r="3.5" fill="#fff" stroke="var(--ink)" stroke-width="2"/></svg>',
    plane: '<svg width="42" viewBox="0 0 40 40" aria-hidden="true"><path d="M4 22 32 16q6 0 4 4L8 28Z" style="fill:var(--blue)" stroke="var(--ink)" stroke-width="2"/><path d="M16 19 10 6h5l11 11ZM17 25l-3 9h5l6-11Z" style="fill:var(--teal)" stroke="var(--ink)" stroke-width="2"/></svg>',
    city: '<svg width="44" viewBox="0 0 48 48" aria-hidden="true"><path d="M5 41h38M10 41V17l14-9 14 9v24M8 19h32M15 22v13m9-13v13m9-13v13M18 41v-4h12v4" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="m8 17 16-10 16 10z" fill="var(--orange)" stroke="var(--ink)" stroke-width="2"/></svg>'
  };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.jpg', '/assets/fotos/escalera.jpg', '/assets/fotos/muro.jpg'];
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var cheer = ''; for (var i = 0; i < 16; i++) cheer += '<span>' + [S.cheer, '<svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" style="vertical-align:-.15em"><path d="M8 1.5c.5 3.6 1.3 4.4 4.9 4.9-3.6.5-4.4 1.3-4.9 4.9-.5-3.6-1.3-4.4-4.9-4.9 3.6-.5 4.4-1.3 4.9-4.9Z"/></svg>', N('n1') + ' &amp; ' + N('n2'), '<svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" style="vertical-align:-.15em"><path d="M8 1.5c.5 3.6 1.3 4.4 4.9 4.9-3.6.5-4.4 1.3-4.9 4.9-.5-3.6-1.3-4.4-4.9-4.9 3.6-.5 4.4-1.3 4.9-4.9Z"/></svg>'][i % 4] + '</span>';

  document.getElementById('app').innerHTML =
  // ======================= APERTURA =======================
  '<div class="opening papel" id="open" role="region" aria-label="' + S.openAria + '">' +
    picado(22, 'pc1', 0) + picado(16, 'pc3', 5) +
    '<p class="eb" style="margin-top:0" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="lcard" id="card"><div class="lin">' +
      '<button type="button" class="lface lfront" id="flipCard" aria-label="' + S.card + '"><span class="lart"><span class="num" data-lz-date="{d}">14</span>' + HEART + '</span><span class="ltitle">' + S.love + '</span></button>' +
      '<div class="lface lback" inert><span class="back-mark" data-lz-seal aria-hidden="true">AL</span>' +
        '<p class="eb" style="color:var(--ink)">' + S.married + '</p>' +
        '<p class="back-names slab">' + N('n1') + '<br><span class="pac" style="font-size:26px;color:#fff;text-shadow:2px 2px 0 var(--ink)">&amp;</span><br>' + N('n2') + '</p>' +
        '<p style="font:900 12px Nunito;letter-spacing:.14em" data-lz-date="{d} · {MU} · {Y}">14 · ' + S.MU + ' · 2027</p>' +
        '<p style="font-size:13px;margin:8px 0" data-lz="msg">' + S.msg + '</p>' +
        '<button type="button" class="btn" id="enter" tabindex="-1" disabled>' + S.enter + '</button>' +
      '</div>' +
    '</div></div>' +
    '<p class="forline">' + S.forTxt + '</p>' +
    '<p class="pac hint" id="hint" aria-live="polite">' + S.hint + '</p>' +
    '<p class="eb" style="color:var(--ink);opacity:.7" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="slab" style="font-size:18px">' + N('n1') + ' &amp; ' + N('n2') + '</span><span class="eb" style="color:var(--ink)" data-lz-date="{d} · {MU}">14 · ' + S.MU + '</span></div>' +
  '<main id="invite" inert>' +
    '<section class="hero papel" id="portada" data-lz-anchor="portada">' + picado(20, '', 1) +
      '<div class="in-w"><p class="eb">' + S.getting + '</p>' +
      '<div class="lfr"><span class="num" data-lz-date="{d}">14</span><div class="pic"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div><p class="t">' + S.couple + '</p></div>' +
      '<h1>' + N('n1') + '<span class="pac">&amp;</span>' + N('n2') + '</h1>' +
      '<div class="chips"><span style="background:var(--pink)" data-lz-date="{d}">14</span><span style="background:var(--orange)" data-lz-date="{MU}">' + S.MU + '</span><span style="background:var(--teal)" data-lz-date="{Y}">2027</span></div>' +
      '<p class="eb" style="margin-top:14px;color:var(--ink)" data-lz="city">' + S.city + '</p>' +
      '<p class="pac msg" data-lz="msg">' + S.msg + '</p></div>' +
    '</section>' +
    '<div class="sarape" aria-hidden="true"></div>' +

    '<section class="sec papel" id="historia" data-lz-anchor="historia"><div class="in-w"><p class="eb">' + S.story + '</p><h2 data-lz="storyTitle">' + S.storyTitle + '</h2><p data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="cards3" data-lz-list="gallery">' + photos.map(function (g, i) { return '<div class="mini" data-lz-item data-rv="pop" style="transition-delay:' + i * .12 + 's"><span class="n">' + S.caps[i][0] + '</span><div class="pic"><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div><p class="t">' + S.caps[i][1] + '</p></div>'; }).join('') + '</div>' +
    '<button class="gallery-open" data-gallery-open>' + (LANG === 'en' ? 'See all our photos' : 'Ver todas nuestras fotos') + '</button></div></section>' +

    '<section class="sec dark countdown"><div class="in-w"><p class="eb" style="color:var(--yellow)">' + S.almost + '</p><h2>' + (LANG === 'en' ? 'The party is getting closer' : 'Cada vez más cerca') + '</h2><p style="margin-top:8px" data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="tabla" aria-live="off">' + S.units.map(function (u, i) { return '<div><b data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div></div></section>' +
    '<div class="cinta" aria-hidden="true"><div>' + cheer + cheer + '</div></div>' +

    '<section class="sec papel" id="itinerario" data-lz-anchor="itinerario musica"><div class="in-w"><p class="eb" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><h2>' + S.program + '</h2>' +
      '<div class="tickets" data-lz-list="events">' + S.events.map(function (e, i) { return '<div class="ticket" data-lz-item data-rv="' + (i % 2 ? 'right' : 'left') + '">' + marigold(['var(--orange)', 'var(--pink)', 'var(--yellow)'][i]) + '<div><span class="tm" data-lz-f="time">' + e[0] + '</span><h3 data-lz-f="name">' + e[1] + '</h3><p><span data-lz-f="place">' + e[2] + '</span> · <span data-lz-f="address">' + e[3] + '</span></p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.how + '</a></div></div>'; }).join('') + '</div>' +
      '<div class="bigcard" data-rv="pop" data-lz-group="dressCode dressNotes dressColors"><p class="eb">' + S.dress + '</p><h2 style="margin:8px 0" data-lz="dressCode">' + S.dressCode + '</h2><p data-lz="dressNotes">' + S.dressNotes + '</p><p style="margin-top:8px;font-weight:800" data-lz-group="dressColors">' + S.reserved + ' <span data-lz="dressColors">' + S.dressColors + '</span></p><div class="dots" aria-hidden="true"><i style="background:#F4F1EA"></i><i style="background:#E8D9C0"></i></div></div>' +
    '</div></section>' +
    '<div class="sarape" aria-hidden="true"></div>' +

    '<section class="sec papel" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn"><div class="in-w"><p class="eb">' + S.fromAway + '</p><h2>' + S.travel + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="trav">' +
        '<div data-rv="left" data-lz-group="hotel hotelAddress hotelCode hotelNotes"><div class="mini"><div class="art" style="background:#FFE9F0">' + ICON.hotel + '</div><p class="t">' + S.tHotel + '</p></div><div><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p data-lz="hotelNotes">' + S.hotelNotes + '</p><a class="btn" style="margin-top:10px;padding:10px 16px;font-size:11px" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG === 'en' ? 'Demo · booking link to be personalized' : 'Demostración · reserva por personalizar') + '</p></div></div>' +
        '<div data-rv="right" data-lz-group="airport transport"><div class="mini"><div class="art" style="background:#E5EBFF">' + ICON.plane + '</div><p class="t">' + S.tPlane + '</p></div><div><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div></div>' +
        '<div data-rv="left" data-lz-group="guideFood guideCulture guidePlans"><div class="mini"><div class="art" style="background:#FFF1D6">' + ICON.city + '</div><p class="t">' + S.tCity + '</p></div><div><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div></div>' +
      '</div></div></section>' +

    '<section class="sec papel" style="padding-top:0" data-lz-group="quote">' + picado(16, '', 2) + '<div class="in-w"><div class="bubble" data-rv="pop" style="margin-top:26px">“<span data-lz="quote">' + S.quote + '</span>”</div><p class="eb" style="color:var(--ink)">— <span data-lz="quoteAuthor">' + S.quoteAuthor + '</span></p></div></section>' +

    '<section class="sec papel" id="faq" data-lz-anchor="faq" data-lz-hide-empty style="padding-top:10px"><div class="in-w"><p class="eb">' + S.faqK + '</p><h2>' + S.faqT + '</h2>' +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary data-lz-f="q">' + f[0] + '</summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div></div></section>' +

    '<section class="sec papel" id="rsvp" data-lz-anchor="rsvp" style="padding-top:10px"><div class="in-w"><p class="eb" data-lz-if="rsvpDeadline">' + S.limit + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p><h2>' + S.rsvpT + '</h2>' +
      '<div class="bigcard" data-rv style="text-align:left"><p class="slab" style="font-size:25px;text-align:center">' + S.guest + '</p><p style="text-align:center;font-weight:800;color:var(--pink)">' + S.seatsRes + '</p>' +
        '<p class="demo-note">' + (LANG === 'en' ? 'Demo: try the form. Responses are neither sent nor saved.' : 'Demostración: puedes probar el formulario. Las respuestas no se envían ni se guardan.') + '</p><div id="rsForm"><p style="margin:12px 0 4px" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
          '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2" placeholder="' + (LANG === 'en' ? 'Guest name and dietary restriction' : 'Nombre y restricción alimentaria') + '"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
          '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
          '<div style="text-align:center;margin-top:20px"><button type="button" class="btn" id="rsSave">' + S.save + '</button></div></div>' +
        '<div id="rsDone" hidden style="text-align:center;padding-top:14px"><span class="sent">' + S.sent + '</span><p id="rsSum" style="margin:14px 0 4px"></p><button type="button" class="btn" style="margin-top:12px" id="rsEdit">' + S.edit + '</button></div>' +
      '</div></div></section>' +

    '<footer class="papel">' + picado(18, '', 4) + '<nav class="footer-nav" aria-label="' + (LANG === 'en' ? 'Invitation links' : 'Enlaces de la invitación') + '"><a href="#itinerario">' + S.program + '</a><a href="#viaje">' + S.travel + '</a><a href="#rsvp">R.S.V.P.</a></nav>' + '<p class="slab" style="font-size:36px;text-shadow:3px 3px 0 var(--yellow)">' + N('n1') + ' &amp; ' + N('n2') + '</p><p class="eb" style="margin-top:8px;color:var(--ink)"><span data-lz-date="{dd}.{mm}.{Y}">14.03.2027</span> · <span data-lz="city">' + S.city + '</span></p></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
