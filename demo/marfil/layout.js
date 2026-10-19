
/* Plantilla Marfil. El HTML se arma aquí (el laurel, los filetes y el lazo son SVG generados) ANTES de
   cargar demo/shared/content.js, para que el editor encuentre las marcas data-lz… al llenar el contenido.
   Los números romanos de las preguntas son un contador de CSS. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación envuelta en papel vegetal con un lazo de seda', bow: 'Desatar el lazo de seda', hint: 'Desata el lazo de seda', for: 'Para',
      joy: 'Con mucha alegría', seats: '4 cupos', enter: 'Abrir invitación',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', y: 'y', city: 'Oaxaca, México', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      heroPat: '{W} · {d} de {M} · {Y}', heroTxt: 'Domingo · 14 de marzo · 2027', MU: 'MARZO',
      story: 'Nuestra historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      bigDay: 'El gran día', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      dayPat: '{W}, {d} de {M} de {Y}', dayTxt: 'Domingo, 14 de marzo de 2027', program: 'El <em>programa</em>', map: 'Ver mapa',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      fromAway: 'Si vienen de fuera', travel: 'Viaje y <em>alojamiento</em>', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stay: 'Alojamiento', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', guideT: 'Turismo y actividades', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitan saber', faqT: 'Preguntas <em>frecuentes</em>',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Por favor, evita blanco y marfil.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Los novios pueden añadir su enlace o instrucciones de regalos al personalizar la invitación.']],
      kindly: 'Se ruega confirmar antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Acepta con gusto', no: 'Declina con pena', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', save: 'Enviar respuesta', err: 'Indiquen la respuesta de cada persona.',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      footPat: '{d} · {MU} · {Y}', demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation wrapped in vellum with a silk bow', bow: 'Untie the silk bow', hint: 'Untie the silk bow', for: 'For',
      joy: 'With great joy', seats: '4 seats', enter: 'Open invitation',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', y: 'and', city: 'Oaxaca, Mexico', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      heroPat: '{W} · {Mc} {d} · {Y}', heroTxt: 'Sunday · March 14 · 2027', MU: 'MARCH',
      story: 'Our story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      bigDay: 'The big day', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      dayPat: '{W}, {Mc} {d}, {Y}', dayTxt: 'Sunday, March 14, 2027', program: 'The <em>program</em>', map: 'See map',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      fromAway: 'If you’re traveling', travel: 'Travel and <em>stay</em>', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stay: 'Where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', guideT: 'Sights and activities', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked <em>questions</em>',
      faqs: [['What is the dress code?', 'Formal. Please avoid white and ivory.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. The couple can add their registry link or gift instructions when personalizing the invitation.']],
      kindly: 'Kindly reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Accepts with pleasure', no: 'Declines with regret', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', save: 'Send reply', err: 'Please answer for each person.',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      footPat: '{MU} {d} · {Y}', demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.MarfilS = S;

  var rng = function (seed) { var r = seed; return function () { return (r = (r * 9301 + 49297) % 233280) / 233280; }; };
  var bez = function (t, a, b, c, d) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  var gstem = function (d, del, t) { return '<path class="st" pathLength="1" d="' + d + '" fill="none" stroke-linecap="round" style="stroke:var(--gold);--d:' + del.toFixed(2) + 's;--t:' + (t || 1.3) + 's" stroke-width="1.2"/>'; };
  var gleaf = function(x,y,l,a,c,del){
    return '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+a.toFixed(0)+')"><g class="lf" style="--d:'+del.toFixed(2)+'s"><path d="M0 0C'+l*.22+' '+(-l*.32)+' '+l*.73+' '+(-l*.25)+' '+l+' 0C'+l*.68+' '+l*.27+' '+l*.27+' '+l*.19+' 0 0Z" fill="'+c+'" opacity=".84"/><path d="M1 0Q'+l*.5+' '+(-l*.025)+' '+l*.9+' 0M'+l*.38+' 0l'+l*.14+' '+(-l*.1)+'M'+l*.58+' 0l'+l*.13+' '+l*.08+'" fill="none" stroke="var(--gold-ink)" stroke-width=".35" opacity=".55"/></g></g>';
  };
  // Escudo de laurel que crece
  function laurel(w) {
    var P = [[60, 96], [26, 92], [8, 62], [22, 18]], s = '';
    [1, -1].forEach(function (side) {
      var X = function (x) { return side === 1 ? x : 120 - x; };
      s += gstem('M' + X(P[0][0]) + ' ' + P[0][1] + 'C' + X(P[1][0]) + ' ' + P[1][1] + ' ' + X(P[2][0]) + ' ' + P[2][1] + ' ' + X(P[3][0]) + ' ' + P[3][1], 0, 1.4);
      for (var i = 1; i <= 9; i++) {
        var t = i / 10, x = bez(t, P[0][0], P[1][0], P[2][0], P[3][0]), y = bez(t, P[0][1], P[1][1], P[2][1], P[3][1]);
        var x2 = bez(t + .01, P[0][0], P[1][0], P[2][0], P[3][0]), y2 = bez(t + .01, P[0][1], P[1][1], P[2][1], P[3][1]);
        var a = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI, A = function (v) { return side === 1 ? v : 180 - v; };
        s += gleaf(X(x), y, 12 - i * .45, A(a - 42), 'var(--gold)', .15 + t * 1.3);
        s += gleaf(X(x), y, 11 - i * .45, A(a + 42), 'var(--gold2)', .25 + t * 1.3);
      }
    });
    return '<svg class="grow" viewBox="0 0 120 100" width="' + w + '" aria-hidden="true"><g fill="none" stroke="var(--gold)" stroke-width=".5"><ellipse cx="60" cy="53" rx="28" ry="33"/><ellipse cx="60" cy="53" rx="25.5" ry="30.5" stroke-opacity=".55"/><path d="m56 17 4-5 4 5-4 4zM54 90q6-5 12 0M60 91v6M47 94q7-1 13 3 6-4 13-3"/><path d="M34 43q-3 10 0 20M86 43q3 10 0 20" stroke-dasharray=".5 2"/></g>' + s + '</svg>';
  }
  var crest = function (style) { return '<div class="crest"' + (style ? ' style="' + style + '"' : '') + '>' + laurel(96) + '<b data-lz-seal>AL</b></div>'; };
  var FL = function (w) { return '<svg class="fl draw" viewBox="0 0 200 24" width="' + w + '" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path pathLength="1" d="M4 12H70c8 0 12-8 20-8 6 0 8 6 3 7-4 1-5-4-1-5"/><path pathLength="1" d="M196 12H130c-8 0-12-8-20-8-6 0-8 6-3 7 4 1 5-4 1-5"/><path pathLength="1" d="M86 15c5 5 9 6 14 6s9-1 14-6"/><path d="M100 8l3.5 4-3.5 4-3.5-4z" fill="currentColor"/></svg>'; };
  var CORNER = '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width=".7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 42V14C2 6 6 2 14 2h28M7 42V17C7 10 10 7 17 7h25M11 34V20c0-6 3-9 9-9h14"/><path d="M3 27c10-2 17-8 20-17M12 24c-5-7-3-13 2-13 5 0 5 7 1 8M21 15c1-7 7-10 10-6 3 4-2 7-7 7M12 25c2 7 8 8 10 4 2-4-4-7-8-4M26 11c-2-5 0-8 3-8M11 26c-5 2-8 0-8-3"/><path d="m8 8 3-3 3 3-3 3zM17 31q6 2 11-3M31 17q2 6-3 11M29 28l3 3"/><circle cx="31" cy="31" r="1.4"/><path d="M16 40h24V16" stroke-opacity=".35"/></svg>';

  // Seda fotografiada; el tinte sigue el color elegido para la invitación.
  var BOW = '<img src="/assets/marfil/lazo-inicio.webp?v=2" width="240" height="240" alt="" aria-hidden="true"><span class="silk-tint" aria-hidden="true"></span>';
  var ICON = [
    '<svg width="36" height="36" aria-hidden="true" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 35h28M10 35V10l10-5 10 5v25M15 35V25h10v10M14 11h12M16 15v3m8-3v3M16 21h0m8 0h0M20 25v10"/><path d="M7 13h3m20 0h3M7 13v22m26-22v22"/></svg>',
    '<svg width="36" height="36" aria-hidden="true" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 23 11-5-3-11 3-2 8 9 8-4c4-2 5 1 2 4l-8 6 1 12-3 2-6-10-6 3-2 5-3 1 1-8z"/></svg>',
    '<svg width="36" height="36" aria-hidden="true" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 10-4 12 4 10-4v24l-10 4-12-4-10 4zM14 8v24m12-20v24"/><path d="M20 23s7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 7 11 7 11z" fill="var(--bg)"/><circle cx="20" cy="12" r="2.5"/></svg>'
  ];
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var photos = ['/assets/fotos/beso.jpg', '/assets/fotos/escalera.jpg', '/assets/fotos/muro.jpg'];
  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var names = function (d) { return '<h1 class="writes"><span class="write" data-lz="n1">' + S.n1 + '</span><span class="y">' + S.y + '</span><span class="write" style="transition-delay:' + d + 's" data-lz="n2">' + S.n2 + '</span></h1>'; };
  var wm = function (style) { return '<span class="wm" aria-hidden="true"' + (style ? ' style="' + style + '"' : '') + ' data-lz-mono>A<i>&amp;</i>L</span>'; };

  document.getElementById('app').innerHTML =
  // ======================= APERTURA =======================
  '<div class="opening linen" id="open" role="region" aria-label="' + S.openAria + '">' +
    '<p class="sc" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="wrap" id="wrap">' +
      '<div class="mcard cotton deboss"><div class="card-corners" aria-hidden="true"><i>' + CORNER + '</i><i>' + CORNER + '</i><i>' + CORNER + '</i><i>' + CORNER + '</i></div>' + crest() +
        '<p class="sc" style="margin-top:10px">' + S.joy + '</p>' + names(.9) +
        '<p class="date bd" data-lz-date="{d} · {MU} · {Y}">14 · ' + S.MU + ' · 2027</p>' +
        '<div class="after"><p style="margin-top:6px">' + S.for + ' <b style="font-weight:500">' + S.guest + '</b> · ' + S.seats + '</p><button type="button" class="btn" style="margin-top:14px" id="enter" tabindex="-1" disabled>' + S.enter + '</button></div>' +
      '</div>' +
      '<div class="vel vel-l"></div><div class="vel vel-r"></div>' +
      '<div class="vprint">' + crest().replace('class="grow"','class="engraved"') + '<p class="sc">' + S.for + '</p><h3 class="goldtxt">' + S.guest + '</h3><p class="sc" style="color:var(--muted)" data-lz="envClosing" data-lz-keep id="closing">' + S.envClosing + '</p></div>' +
      '<div class="ribbon-contact" aria-hidden="true"></div><i class="ribbon-return return-l" aria-hidden="true"></i><i class="ribbon-return return-r" aria-hidden="true"></i>' +
      '<button type="button" class="bow" id="bow" aria-label="' + S.bow + '">' + BOW + '</button>' +
    '</div>' +
    '<p class="hint" id="hint" aria-live="polite">' + S.hint + '</p>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="gv" style="font-size:27px;color:var(--wine)">' + N('n1') + ' &amp; ' + N('n2') + '</span><span class="sc" data-lz-date="{dd} · {mm} · {Y}">14 · 03 · 2027</span></div>' +
  '<main id="invite" inert>' +
    '<section class="hero cotton" id="portada" data-lz-anchor="portada">' +
      '<div class="frameg" aria-hidden="true"><i>' + CORNER + '</i><i>' + CORNER + '</i><i>' + CORNER + '</i><i>' + CORNER + '</i></div>' +
      '<div class="in-w">' + crest() +
        '<p class="sc" style="margin-top:14px">' + S.getting + '</p>' + names(1) +
        '<svg class="swash draw" viewBox="0 0 220 30" width="190" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path pathLength="1" d="M8 20C46 4 88 28 128 15S188 2 210 12c-6 7-19 9-31 4"/></svg>' + FL(150) +
        '<p class="date" data-lz-date="' + S.heroPat + '">' + S.heroTxt + '</p><p style="margin-top:6px;font-style:italic;color:var(--muted);font-size:17px" data-lz="city">' + S.city + '</p>' +
        '<div class="gold-frame goldbg" data-rv><div><div class="pic"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.jpg" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div></div></div>' +
        '<p class="msg" data-lz="msg">' + S.msg + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="sec" id="historia" data-lz-anchor="historia" style="background:var(--bg)">' + wm() + '<div class="in-w">' +
      '<p class="sc">' + S.story + '</p><h2 data-lz="storyTitle">' + S.storyTitle + '</h2>' +
      '<p class="drop" style="text-align:left" data-lz="story">' + S.storyTxt + '</p>' +
      '<div class="gallery" data-lz-list="gallery">' + photos.map(function (g, i) { return '<div class="gframe goldbg" data-lz-item data-rv style="transition-delay:' + i * .15 + 's"><div><div class="pic"><img class="ph-img" data-lz-f="img" src="' + g + '" alt="" loading="lazy"></div></div></div>'; }).join('') + '</div>' +
    '<button class="gallery-open" data-gallery-open>' + (LANG === 'en' ? 'View all photos' : 'Ver todas las fotos') + '</button></div></section>' +

    '<section class="sec damask countdown"><div class="in-w">' +
      '<p class="sc" style="color:var(--gold2)">' + S.bigDay + '</p><h2 style="color:#FBF6EC">' + (LANG === 'en' ? 'Counting down to our wedding' : 'Cada vez más cerca') + '</h2>' +
      '<p style="margin-top:10px;font-style:italic;color:#F1E6D8" data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="cdgrid" aria-live="off">' + S.units.map(function (u, i) { return '<div><b class="goldtxt" data-cd="' + 'dhms'[i] + '">--</b><span>' + u + '</span></div>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec cotton" id="itinerario" data-lz-anchor="itinerario musica"><div class="in-w">' +
      '<p class="sc" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><h2>' + S.program + '</h2>' +
      '<div class="prog" data-lz-list="events">' + S.events.map(function (e) { return '<div data-lz-item data-rv>' + FL(90) + '<p class="sc" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="addr" data-lz-f="address">' + e[3] + '</p><a data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + '</a></div>'; }).join('') + '</div>' +
      '<div class="ccard cotton deboss" data-rv data-lz-group="dressCode dressNotes dressColors"><p class="sc">' + S.dress + '</p><h2 style="margin:10px 0 8px" data-lz="dressCode">' + S.dressCode + '</h2><p data-lz="dressNotes">' + S.dressNotes + '</p><p style="margin-top:10px;font-size:15px" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="fabric" aria-hidden="true"><i style="background-color:#F4F1EA"></i><i style="background-color:#E8D9C0"></i></div></div>' +
    '</div></section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn" style="background:var(--bg)"><div class="in-w">' +
      '<p class="sc">' + S.fromAway + '</p><h2>' + S.travel + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="tcards">' +
        '<div class="cotton deboss" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes">' + ICON[0] + '<p class="sc">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p data-lz="hotelAddress">' + S.hotelAddress + '</p><p data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></p><p><i data-lz="hotelNotes">' + S.hotelNotes + '</i></p><a class="btn" style="margin-top:14px" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG === 'en' ? 'Demo · booking link to be personalized' : 'Demostración · reserva por personalizar') + '</p></div>' +
        '<div class="cotton deboss" data-rv data-lz-group="airport transport">' + ICON[1] + '<p class="sc">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p></div>' +
        '<div class="cotton deboss" data-rv data-lz-group="guideFood guideCulture guidePlans">' + ICON[2] + '<p class="sc">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p></div>' +
      '</div>' +
    '</div></section>' +

    '<section class="sec cotton" data-lz-group="quote"><div class="in-w">' + FL(150) + '<blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="sc" data-lz="quoteAuthor">' + S.quoteAuthor + '</p>' + FL(150) + '</div></section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty style="background:var(--bg)"><div class="in-w"><p class="sc">' + S.faqK + '</p><h2>' + S.faqT + '</h2>' +
      '<div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp" style="background:var(--bg);padding-top:24px">' + wm('top:auto;bottom:10px') + '<div class="in-w">' +
      '<div class="reply cotton deboss" data-rv>' +
        '<div class="wax" data-rv="stamp" aria-hidden="true"><span data-lz-seal>AL</span></div>' +
        '<p class="rsvp">R.S.V.P.</p>' +
        '<p style="font-style:italic;color:var(--muted)" data-lz-if="rsvpDeadline">' + S.kindly + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' + FL(120) +
        '<p class="gv" style="font-size:38px;color:var(--wine)">' + S.guest + '</p><p class="sc" style="margin-top:4px">' + S.seatsRes + '</p>' +
        '<p class="demo-note">' + (LANG === 'en' ? 'Demo: try the form. Responses are neither sent nor saved.' : 'Demostración: puedes probar el formulario. Las respuestas no se envían ni se guardan.') + '</p><div id="rsForm"><p style="margin:16px 0 6px;text-align:left" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
          '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2" placeholder="' + (LANG === 'en' ? 'Guest name and dietary restriction' : 'Nombre y restricción alimentaria') + '"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
          '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p>' +
          '<button type="button" class="btn" style="margin-top:22px" id="rsSave">' + S.save + '</button></div>' +
        '<div id="rsDone" hidden style="padding-top:18px"><p class="gv" style="font-size:46px;color:var(--wine)">' + S.thanks + '</p><p id="rsSum" style="margin:6px 0 18px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>' +
      '</div>' +
    '</div></section>' +

    '<footer class="damask"><nav class="footer-nav" aria-label="' + (LANG === 'en' ? 'Invitation links' : 'Enlaces de la invitación') + '"><a href="#itinerario">' + S.program + '</a><a href="#viaje">' + S.travel + '</a><a href="#rsvp">R.S.V.P.</a></nav>' + crest('--wine:#F3E2B8') + '<p class="gv goldtxt" style="font-size:48px;margin-top:8px">' + N('n1') + ' &amp; ' + N('n2') + '</p><p class="sc" style="color:#E9D9B9;margin-top:6px"><span data-lz-date="' + S.footPat + '">14 · ' + S.MU + ' · 2027</span> · <span data-lz="city" style="text-transform:uppercase">' + S.city + '</span></p></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
