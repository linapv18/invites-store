
/* Plantilla Cisne. El HTML se arma aquí (cisnes, sobre, lacres y llave son SVG generados; el ramo, la bandeja
   y el óvalo del RSVP son imágenes de assets/cisne/) ANTES de cargar demo/shared/content.js, para que el
   editor encuentre las marcas data-lz… al llenar el contenido. */
(function () {
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var S = {
    es: {
      envIntro: 'Una invitación para un día inolvidable', envClosing: 'Con todo nuestro cariño', openAria: 'Invitación en un sobre cerrado con un sello de lacre', seal: 'Romper el sello', hint: 'Rompe el sello de lacre', for: 'Para',
      invite: 'Te invitamos a la boda de', seats: '4 cupos', enter: 'Abrir invitación',
      guest: 'Familia Rodríguez', n1: 'Ana', n2: 'León', city: 'Oaxaca, México', getting: 'Nos vamos a casar', msg: 'Nos casamos y queremos celebrarlo contigo.', photoAlt: 'Ana y León',
      openPat: '{d} · {M} · {Y}', openTxt: '14 · marzo · 2027', heroPat: '{W} · {d} {M} {Y}', heroTxt: 'Domingo · 14 marzo 2027',
      save: 'Guarda la fecha', d: '14', M: 'MARZO', Y: '2027', cdName: 'Ceremonia civil', time0: '1:00 p. m.', cdNote: 'Cada vez falta menos para celebrar juntos.', units: ['Días', 'Horas', 'Min', 'Seg'],
      since: 'Desde el principio', ourStory: 'Nuestra<br>historia', storyTitle: 'Cómo empezó todo', storyTxt: 'Nos conocimos en una boda —qué ironía— y desde ese baile no hemos dejado de caminar juntos. Ahora queremos que estén con nosotros en el capítulo más bonito.',
      dayPat: '{W} {d}', dayTxt: 'Domingo 14', details: 'Los<br>detalles', program: 'El programa', map: 'Ver mapa',
      events: [['1:00 p. m.', 'Ceremonia civil', 'Jardín Etnobotánico', 'Reforma s/n, Centro'], ['2:30 p. m.', 'Comida familiar', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 p. m.', 'Fiesta', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Código de vestimenta', dressCode: 'Formal', dressNotes: 'Telas frescas: en marzo Oaxaca es cálida de día y fresca de noche.', reserved: 'Colores reservados:', dressColors: 'El blanco y el marfil quedan reservados para la novia.',
      fromAway: 'Si vienen de fuera', travel: 'Viaje', travelIntro: 'Si vienen de fuera, aquí tienen todo para organizar su viaje.',
      stay: 'Alojamiento', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Código de tarifa', hotelCode: 'BODA-AL', hotelNotes: 'Tarifa válida hasta el 1 de febrero.', book: 'Reservar',
      getThere: 'Cómo llegar', getThereT: 'Aeropuerto y transporte', airportL: 'Aeropuerto.', airport: 'Aeropuerto Internacional de Oaxaca (OAX), a 20 minutos del centro.', transportL: 'Transporte.', transport: 'Habrá camionetas del hotel a la fiesta y de regreso.',
      guide: 'Guía de la ciudad', guideT: 'Turismo y actividades', foodL: 'Restaurantes.', food: 'Levadura de Olla, Casa Oaxaca y los mercados.', cultureL: 'Cultura.', culture: 'Santo Domingo y el Museo Textil.', plansL: 'Actividades.', plans: 'Hierve el Agua y Monte Albán.',
      quote: 'Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Todo lo que necesitan saber', faqT: 'Preguntas frecuentes',
      faqs: [['¿Cuál es el código de vestimenta?', 'Formal. Evita el blanco, por favor.'], ['¿Pueden ir niños?', 'Nuestra celebración es solo para adultos.'], ['¿Hay mesa de regalos?', 'Su compañía es nuestro mejor regalo. Si desean tener un detalle, los novios compartirán los detalles de su mesa de regalos.']],
      confirm: 'Confirma aquí', before: 'Antes del', rsvpDatePat: '{d} de {M} de {Y}', deadline: '14 de febrero de 2027', seatsRes: '4 cupos reservados', rsvpMsg: 'Confirma quiénes de esta invitación podrán acompañarnos.',
      yes: 'Acepta con gusto', no: 'Declina con pena', diet: 'Restricciones alimentarias (opcional)', note: 'Un mensaje para nosotros (opcional)', send: 'Enviar respuesta', err: 'Indiquen la respuesta de cada persona.',
      thanks: 'Gracias', edit: 'Editar respuesta', will: function (y, n) { return y ? 'Asistirán ' + y + ' de ' + n + ' personas. Nos vemos pronto.' : 'Gracias por avisarnos. Los extrañaremos.'; },
      footPat: '{d} · {M} · {Y}', barPat: '{dd} · {mm} · {Y}', demo: 'Demo', panel: 'Panel de novios', store: 'Tienda', storeUrl: '/#disenos'
    },
    en: {
      envIntro: 'An invitation to an unforgettable day', envClosing: 'With all our love', openAria: 'Invitation in an envelope closed with a wax seal', seal: 'Break the seal', hint: 'Break the wax seal', for: 'For',
      invite: 'You are invited to the wedding of', seats: '4 seats', enter: 'Open invitation',
      guest: 'The Rodríguez family', n1: 'Anna', n2: 'Leo', city: 'Oaxaca, Mexico', getting: 'We’re getting married', msg: 'We’re getting married and want to celebrate with you.', photoAlt: 'Anna and Leo',
      openPat: '{Mc} {d} · {Y}', openTxt: 'March 14 · 2027', heroPat: '{W} · {Mc} {d} {Y}', heroTxt: 'Sunday · March 14 2027',
      save: 'Save the date', d: '14', M: 'MARCH', Y: '2027', cdName: 'Civil ceremony', time0: '1:00 PM', cdNote: 'Every day brings us closer to celebrating together.', units: ['Days', 'Hours', 'Min', 'Sec'],
      since: 'From the beginning', ourStory: 'Our<br>story', storyTitle: 'How it all began', storyTxt: 'We met at a wedding —how ironic— and since that dance we haven’t stopped walking together. Now we want you with us for the most beautiful chapter.',
      dayPat: '{W} {d}', dayTxt: 'Sunday 14', details: 'The<br>details', program: 'The program', map: 'See map',
      events: [['1:00 PM', 'Civil ceremony', 'Ethnobotanical Garden', 'Reforma s/n, Centro'], ['2:30 PM', 'Family lunch', 'Casa Oaxaca', 'García Vigil 407, Centro'], ['8:00 PM', 'Party', 'Hacienda Los Laureles', 'Hidalgo 21, San Felipe del Agua']],
      dress: 'Dress code', dressCode: 'Formal', dressNotes: 'Light fabrics: in March Oaxaca is warm by day and cool at night.', reserved: 'Reserved colors:', dressColors: 'White and ivory are reserved for the bride.',
      fromAway: 'If you’re traveling', travel: 'Travel', travelIntro: 'If you’re coming from out of town, here’s everything to plan your trip.',
      stay: 'Where to stay', hotel: 'Hotel Casa Antigua', hotelAddress: 'Calle Macedonio Alcalá 304, Centro', rate: 'Rate code', hotelCode: 'BODA-AL', hotelNotes: 'Rate valid until February 1.', book: 'Book',
      getThere: 'Getting there', getThereT: 'Airport and transport', airportL: 'Airport.', airport: 'Oaxaca International Airport (OAX), 20 minutes from downtown.', transportL: 'Transport.', transport: 'Shuttles will run from the hotel to the party and back.',
      guide: 'City guide', guideT: 'Sights and activities', foodL: 'Restaurants.', food: 'Levadura de Olla, Casa Oaxaca and the markets.', cultureL: 'Culture.', culture: 'Santo Domingo and the Textile Museum.', plansL: 'Activities.', plans: 'Hierve el Agua and Monte Albán.',
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', quoteAuthor: 'Antoine de Saint-Exupéry',
      faqK: 'Everything you need to know', faqT: 'Frequently asked questions',
      faqs: [['What is the dress code?', 'Formal. Please avoid white.'], ['Are kids welcome?', 'Our celebration is adults only.'], ['Is there a gift registry?', 'Your presence is our best gift. If you’d like to give something, the couple will share their registry details.']],
      confirm: 'Reply here', before: 'Kindly reply by', rsvpDatePat: '{Mc} {d}, {Y}', deadline: 'February 14, 2027', seatsRes: '4 seats reserved', rsvpMsg: 'Let us know who from this invitation can join us.',
      yes: 'Accepts with pleasure', no: 'Declines with regret', diet: 'Dietary restrictions (optional)', note: 'A message for us (optional)', send: 'Send reply', err: 'Please answer for each person.',
      thanks: 'Thank you', edit: 'Edit answer', will: function (y, n) { return y ? y + ' of ' + n + ' people will attend. See you soon.' : 'Thanks for letting us know. We’ll miss you.'; },
      footPat: '{MU} {d} · {Y}', barPat: '{mm} · {dd} · {Y}', demo: 'Demo', panel: 'Couple’s dashboard', store: 'Store', storeUrl: '/en/#designs'
    }
  }[LANG];
  window.CisneS = S;
  var rng = function (seed) { var r = seed; return function () { return (r = (r * 9301 + 49297) % 233280) / 233280; }; };
  var f1 = function (v) { return v.toFixed(1); };

const gleaf = (x, y, l, a, c, del, o = .9) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a.toFixed(0)})"><path class="lf" d="M0 0C${l * .3} ${-l * .32} ${l * .7} ${-l * .32} ${l} 0C${l * .7} ${l * .32} ${l * .3} ${l * .32} 0 0Z" style="fill:${c};--d:${del.toFixed(2)}s" opacity="${o}"/></g>`;
const SWAN_BODY = 'M3 30C9 32 13 34 17 34C24 41 38 42 47 37C51 33 50 27 46 23C42 19 40 15 41 11C42 8 44 7 46 7.5L52 9.5L56 9L50 6C48 3.5 44 3 41 4.5C37 7 36 13 39 19C42 24 43 28 39 30C34 26 26 22 18 22C12 22 8 25 3 30Z';
const swanHalf = fo => `<path d="${SWAN_BODY}" fill="currentColor" fill-opacity="${fo}"/><path d="M17 26C24 25 31 27 36 31M12 29C18 28 24 30 29 33M21 23.5C25 24.5 28 26 30.5 28" opacity=".65"/><path d="M50 6L52 9.5L48.6 8Z" fill="currentColor"/><circle cx="45.6" cy="6.3" r=".8" fill="currentColor" stroke="none"/><path d="M4 45H24M32 47H50" opacity=".45"/>`;
// Dos cisnes que se miran: los cuellos dibujan un corazón.
const SWAN = (w, sw = 1, fo = .16) => `<svg class="swan" viewBox="0 0 124 50" width="${w}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g transform="translate(4 1)">${swanHalf(fo)}</g><g transform="translate(120 1) scale(-1 1)">${swanHalf(fo)}</g></svg>`;
// Degradados de Cisne: viven dentro de la pantalla para heredar los colores de la paleta.
const CSDEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="csGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E7B6"/><stop offset=".25" stop-color="#C29E52"/><stop offset=".5" stop-color="#FBF0C8"/><stop offset=".75" stop-color="#94742F"/><stop offset="1" stop-color="#E2C88A"/></linearGradient>
  <linearGradient id="csGoldV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E6128"/><stop offset=".35" stop-color="#F3E1A6"/><stop offset=".6" stop-color="#C29E52"/><stop offset="1" stop-color="#6F5422"/></linearGradient>
  <radialGradient id="csTas" cx=".35" cy=".3" r=".8"><stop offset="0" style="stop-color:color-mix(in srgb,var(--wine),#fff 30%)"/><stop offset=".5" style="stop-color:var(--wine)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--wine),#000 60%)"/></radialGradient>
  <linearGradient id="csSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#3b2025" stop-opacity="0"/><stop offset="1" stop-color="#3b2025" stop-opacity=".1"/></linearGradient>
  <linearGradient id="csBead" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--wine),#fff 18%)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--wine),#000 25%)"/></linearGradient>
  <filter id="csBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="csBlur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".8"/></filter>
</defs></svg>`;
// Lacre: borde irregular de cera derramada, hueco del sello con canto en sombra y luz, y brillo.
let wxN = 0;
function WAX(seed = 1, gold = false) {
  const id = 'csW' + (wxN++), Q = rng(seed * 31 + 7), N = 30, pts = [];
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, r = 45 + (Q() - .5) * 3.6 + (Q() < .2 ? 3.2 : 0); pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]); }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = 'M' + mid(pts[N - 1], pts[0]).map(f1).join(' ');
  for (let i = 0; i < N; i++) { const m = mid(pts[i], pts[(i + 1) % N]); d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(m[0])} ${f1(m[1])}`; }
  const arc = (r, a0, a1) => { const P = a => [50 + r * Math.cos(a * Math.PI / 180), 50 + r * Math.sin(a * Math.PI / 180)].map(f1).join(' '); return `M${P(a0)}A${r} ${r} 0 0 1 ${P(a1)}`; };
  const c = gold ? ['#F7EABB', '#C6A253', '#7A5C22', '#4E3A12'] : ['color-mix(in srgb,var(--wine),#fff 40%)', 'var(--wine)', 'color-mix(in srgb,var(--wine),#000 42%)', 'color-mix(in srgb,var(--wine),#000 66%)'];
  return `<svg class="wxs" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}a" cx=".36" cy=".3" r=".78"><stop offset="0" style="stop-color:${c[0]}"/><stop offset=".42" style="stop-color:${c[1]}"/><stop offset="1" style="stop-color:${c[2]}"/></radialGradient><radialGradient id="${id}b" cx=".64" cy=".7" r=".85"><stop offset="0" style="stop-color:${c[1]}"/><stop offset=".72" style="stop-color:${c[2]}"/><stop offset="1" style="stop-color:${c[3]}"/></radialGradient></defs>
    <path d="${d}" fill="url(#${id}a)"/><path d="${d}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.2"/>
    <path d="${arc(39, 150, 300)}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3" filter="url(#csBlur1)"/>
    <circle cx="50" cy="50" r="32" fill="url(#${id}b)"/>
    <path d="${arc(31, 150, 300)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3.2" filter="url(#csBlur1)"/>
    <path d="${arc(31.5, -30, 120)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1.6" filter="url(#csBlur1)"/>
    <ellipse cx="31" cy="23" rx="11" ry="4.5" transform="rotate(-32 31 23)" fill="#fff" opacity=".42" filter="url(#csBlur1)"/></svg>`;
}
// Ramo (rosas, calas, hortensia y bayas): imagen con fondo transparente. rv = florece al aparecer en pantalla.
const BQ = (w, cls = '', style = '', rv = true) => `<img class="bqs ${cls}" src="/assets/cisne/flores.webp" alt="" width="${w}" style="${style}"${rv ? ' data-rv="bloom"' : ''}>`;
// Forro del sobre: lago con cipreses, un árbol grande y un cisne (tonos sepia).
const LINER = '<image href="/assets/cisne/paisaje.webp" width="290" height="114" preserveAspectRatio="xMidYMax slice"/><path d="M8 112L145 8L282 112" fill="none" stroke="#B9A46F" stroke-width="1.2"/>';
const FOLDS = '<svg class="folds" viewBox="0 0 290 190" preserveAspectRatio="none" aria-hidden="true"><path d="M290 0L145 106L290 190Z" fill="#00000014"/><path d="M0 0L145 106L0 190Z" fill="#ffffff0c"/><path d="M0 190L145 98L290 190Z" fill="#ffffff14"/><path d="M0 190L145 98L290 190" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="3" filter="url(#csBlur1)"/><path d="M1 189L145 99L289 189" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width=".8"/></svg>';
const icoSvg = inner => `<div class="ico"><svg viewBox="0 0 48 48" width="44" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg></div>`;
const csIcon = {
  // Timbre de recepción
  bell: icoSvg('<path d="M9 34.5c0-8.8 6.7-15.5 15-15.5s15 6.7 15 15.5Z" fill="currentColor" fill-opacity=".1"/><path d="M14 30.5c.7-4.3 3.6-7.6 7.4-8.8" opacity=".5"/><path d="M5 35h38"/><path d="M7 38.5h34" stroke-width="1.7"/><path d="M24 19v-3"/><rect x="20.5" y="12.5" width="7" height="3.5" rx="1.2" fill="currentColor" fill-opacity=".25"/><path d="M38 12l-2.6 2.6M41 18.5h-3.6M32.5 9l-.9 3.4" opacity=".55"/>'),
  // Avión con su ruta punteada
  plane: icoSvg('<path d="M5 41C13 39 15 31 22 29" stroke-dasharray="1.4 3"/><circle cx="5" cy="41" r="1.6" fill="currentColor"/><g transform="rotate(45 31 19)"><path d="M31 4.5c1.4 0 2.2 1.4 2.2 3.6v7.2l10 5.8v2.6l-10-2.9v6.4l3.4 2.6V32l-5.6-1.6-5.6 1.6v-2.2l3.4-2.6v-6.4l-10 2.9v-2.6l10-5.8V8.1c0-2.2.8-3.6 2.2-3.6Z" fill="currentColor" fill-opacity=".12"/></g>'),
  // Mapa plegado con ruta y punto
  map: icoSvg('<path d="M5 13l12-5 14 5 12-5v28l-12 5-14-5-12 5Z" fill="currentColor" fill-opacity=".07"/><path d="M17 8v28M31 13v28" opacity=".5"/><path d="M9 32c4-1 6-6 10-6s5 4 9 3" stroke-dasharray="1.4 2.6"/><path d="M34 27s-5-5.2-5-9a5 5 0 0 1 10 0c0 3.8-5 9-5 9Z" fill="currentColor" fill-opacity=".18"/><circle cx="34" cy="18" r="1.8"/>')
};
const KEY = '<img class="key key-photo" src="/assets/cisne/llave.webp" alt="" width="512" height="768" loading="lazy" decoding="async" aria-hidden="true">';
const MONO = '<svg viewBox="0 0 66 52" fill="none" stroke="currentColor" stroke-width=".8"><ellipse cx="33" cy="26" rx="30" ry="23"/><ellipse cx="33" cy="26" rx="27" ry="20" stroke-dasharray="1 2.4"/></svg>';
const wreath = () => {
  // Dos ramas de laurel que suben por los lados del óvalo y casi se juntan arriba.
  let s = '';
  [[100, 250, 1], [80, -70, -1]].forEach(([a0, a1, dir]) => { for (let i = 0; i < 10; i++) { const p = (a0 + (a1 - a0) * i / 9) * Math.PI / 180, x = 60 + 40 * Math.cos(p), y = 50 + 34 * Math.sin(p), tan = p * 180 / Math.PI + 90 * dir; s += gleaf(x, y, 11, tan + 32, 'var(--gold2)', .08 * i, .9) + gleaf(x, y, 10, tan - 32, 'color-mix(in srgb,var(--gold2),#000 15%)', .08 * i + .04, .85); } });
  return `<svg class="grow" viewBox="0 0 120 96">${s}<ellipse cx="60" cy="50" rx="30" ry="25" fill="none" style="stroke:var(--gold2)" stroke-width=".8"/></svg>`;
};
const notch = (cls, inner, style = '') => `<div class="notch ${cls}" style="${style}"><div class="nline"></div><div class="nc">${inner}</div></div>`;

  var N = function (k) { return '<span data-lz="' + k + '">' + S[k] + '</span>'; };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', Oaxaca'); };
  var MONOTXT = '<span class="lz-seal">A<i>&amp;</i>L</span>';
  var names = function (d) { return '<h1 class="gtxt writes"><span class="write in" data-lz="n1">' + S.n1 + '</span> &amp;<br><span class="write in" style="transition-delay:' + d + 's" data-lz="n2">' + S.n2 + '</span></h1>'; };

  document.getElementById('app').innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="lzPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="g"/><feComponentTransfer in="g" result="g2"><feFuncR type="linear" slope=".3" intercept=".78"/><feFuncG type="linear" slope=".3" intercept=".78"/><feFuncB type="linear" slope=".3" intercept=".78"/></feComponentTransfer><feBlend in="SourceGraphic" in2="g2" mode="multiply" result="b"/><feComposite in="b" in2="SourceGraphic" operator="in"/></filter></defs></svg>' + CSDEFS + '<span hidden id="envClosing" data-lz="envClosing" data-lz-keep>' + S.envClosing + '</span>' +
  // ======================= APERTURA: sobre oliva con sello de lacre =======================
  '<div class="opening table" id="open" role="dialog" aria-modal="true" aria-label="' + S.openAria + '">' +
    '<div class="opening-content"><p class="cz" style="color:var(--wine)" data-lz="envIntro" data-lz-keep>' + S.envIntro + '</p>' +
    '<div class="opening-suite"><div class="suite-underlay" aria-hidden="true"></div>' + BQ(200, 'suite-flowers', '', false) + '<img class="suite-key" src="/assets/cisne/llave.webp" alt="" width="512" height="768" aria-hidden="true"><div class="cwrap" id="csWrap">' +
      '<div class="eclip"><div class="eback"></div>' +
        '<div class="piece ocard" inert>' + notch('lacey', SWAN(66) + '<p class="cz" style="margin-top:8px">' + S.invite + '</p>' + names(.8) +
          '<p class="cz" data-lz-date="' + S.openPat + '">' + S.openTxt + '</p><p class="cz" style="opacity:.8" data-lz="city">' + S.city + '</p>' +
          '<div class="after"><p style="margin-top:10px;font-size:15px;color:#F4E7D2">' + S.for + ' <b style="font-weight:600">' + S.guest + '</b> · ' + S.seats + '</p><button type="button" class="btn" style="margin-top:12px" id="enter" tabindex="-1" disabled>' + S.enter + '</button></div>') + '</div>' +
        '<div class="epocket">' + FOLDS + '<svg class="envelope-filet" viewBox="0 0 410 250" preserveAspectRatio="none" aria-hidden="true"><path d="M13 32V237H397V32M20 48V230H390V48M28 221h35m284 0h35"/><path d="M185 220q20-10 40 0m-24-1 4-4 4 4-4 4Z"/></svg></div><p class="envelope-recipient ps">' + S.for + ' ' + S.guest + '</p><div class="efsh"><i></i></div>' +
      '</div>' +
      '<div class="eflap"><div class="ef front"><svg class="envelope-engraving" viewBox="0 0 410 160" preserveAspectRatio="none" aria-hidden="true"><path d="M16 9H394L205 150ZM34 16H376L205 141Z"/><path d="M170 37q35-28 70 0M176 41q29-20 58 0M191 30l14-12 14 12"/><path d="M60 24q25 3 43 23m-32-18 1 12m12-6-1 13m-2-17 14-1M350 24q-25 3-43 23m32-18-1 12m-12-6 1 13m2-17-14-1"/></svg><span class="flap-emblem">' + SWAN(58) + '</span></div><div class="ef back"><svg viewBox="0 0 290 114" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + LINER + '</svg></div></div>' +
      '<button type="button" class="seal wax gold photographic-seal" id="csSeal" aria-label="' + S.seal + '"><img class="wax-photo" src="/assets/rosa/lacre-dorado.webp" alt="" width="512" height="512"><span class="emb" data-lz-seal><span class="lz-seal">A<i>&amp;</i>L</span></span></button>' +
    '</div>' +
    '</div><p class="hint" id="hint" aria-live="polite">' + S.hint + '</p></div>' +
  '</div>' +

  // ======================= INVITACIÓN =======================
  '<div class="mbar" id="mbar" aria-hidden="true"><span class="ps" style="font-size:24px;color:var(--wine)">' + N('n1') + ' &amp; ' + N('n2') + '</span><span class="cz" style="color:var(--olive)" data-lz-date="' + S.barPat + '">14 · 03 · 2027</span></div>' +
  '<main id="invite" class="table" inert>' +
    '<section class="hero" id="portada" data-lz-anchor="portada">' + BQ(150, 'hbq') +
      '<div class="piece hcard" data-frame="cs-crest">' + notch('lacey', SWAN(70) + '<p class="cz" style="margin-top:10px">' + S.getting + '</p>' + names(.9) +
        '<p class="cz" data-lz-date="' + S.heroPat + '">' + S.heroTxt + '</p><p class="cz" style="opacity:.8" data-lz="city">' + S.city + '</p>') + '</div>' +
      '<div class="pola"><div class="pic"><img class="ph-img" id="heroImg" src="/assets/fotos/paseo.webp" data-lz-src="photo:0" alt="' + S.photoAlt + '" style="object-position:center 60%"></div><p class="cap">' + N('n1') + ' &amp; ' + N('n2') + '</p><div class="wax gold photographic-seal"><img class="wax-photo" src="/assets/rosa/lacre-dorado.webp" alt="" width="512" height="512"><span class="emb" data-lz-seal>AL</span></div></div>' +
      BQ(116, 'hbq2') +
      '<p class="lead" data-lz="msg">' + S.msg + '</p>' +
    '</section>' +

    '<div class="flow">' +
    '<section class="sec date-section">' +
      '<div class="std" data-frame="cs-scal" data-rv>' + SWAN(70) + '<p class="cz">' + S.save + '</p>' +
        '<p class="n" data-lz-date="{d}">' + S.d + '</p><p class="m" data-lz-date="{MU}">' + S.M + '</p><p class="n" data-lz-date="{Y}">' + S.Y + '</p>' +
        '<p class="cz" style="margin-top:10px" data-lz="time0">' + S.time0 + '</p><p class="cz" style="color:var(--wine)" data-lz="cdName">' + S.cdName + '</p><p class="cz" data-lz="city">' + S.city + '</p></div>' +
      '<p style="font-style:italic;margin-top:30px" data-lz="countdownNote">' + S.cdNote + '</p>' +
      '<div class="seals" aria-live="off">' + S.units.map(function (u, i) { return '<div><span class="wax">' + WAX(i * 7 + 3) + '<span class="emb"><b data-cd="' + 'dhms'[i] + '">--</b></span></span><small>' + u + '</small></div>'; }).join('') + '</div>' +
    '</section>' +

    '<section class="sec" id="historia" data-lz-anchor="historia">' +
      '<div class="story-heading"><div class="piece lace" data-rv="left">' + notch('lacey', '<p class="cz">' + S.since + '</p><h3 class="gtxt">' + S.ourStory + '</h3>') + '</div><div class="story-copy"><h2 data-lz="storyTitle">' + S.storyTitle + '</h2><p data-lz="story">' + S.storyTxt + '</p></div></div>' +
      '<div class="album" data-lz-list="gallery">' + ['/assets/fotos/beso.webp','/assets/fotos/escalera.webp','/assets/fotos/muro.webp'].map(function(src){return '<div class="spol" data-lz-item data-rv><div class="pic"><img class="ph-img" data-lz-f="img" src="'+src+'" alt="" loading="lazy"></div></div>';}).join('') + '</div><button type="button" class="gallery-link" data-gallery-open>' + (LANG==='en'?'Open our photo album':'Abrir nuestro álbum') + '</button>' +
    '</section>' +

    '<section class="sec" id="itinerario" data-lz-anchor="itinerario musica">' +
      '<div class="tray" data-rv><img src="/assets/cisne/bandeja.webp" alt="" loading="lazy" decoding="async"><div class="dcard"><p class="cz" style="font-size:7px;color:var(--wine)" data-lz-date="' + S.dayPat + '">' + S.dayTxt + '</p><h3>' + S.details + '</h3><p class="cz" style="font-size:7px;margin-top:6px">' + S.program + '</p></div></div>' +
      '<div class="evs" data-lz-list="events">' + S.events.map(function (e) { return '<div class="piece ev" data-lz-item data-rv>' + notch('ivory', '<p class="cz" data-lz-f="time">' + e[0] + '</p><h3 data-lz-f="name">' + e[1] + '</h3><p data-lz-f="place">' + e[2] + '</p><p class="ad" data-lz-f="address">' + e[3] + '</p><a class="mlink" data-lz-f="map" href="' + maps(e[2]) + '" target="_blank" rel="noopener">' + S.map + '</a>') + '</div>'; }).join('') + '</div>' +
      '<div class="piece dress" data-rv data-lz-group="dressCode dressNotes dressColors">' + notch('moss', '<p class="cz" style="color:var(--gold2)">' + S.dress + '</p><h3 data-lz="dressCode">' + S.dressCode + '</h3><p data-lz="dressNotes">' + S.dressNotes + '</p><p style="margin-top:10px;font-size:14px" data-lz-group="dressColors"><span data-lz="dressColors">' + S.dressColors + '</span></p><div class="fabric" hidden aria-hidden="true"><i style="background-color:#F4F1EA"></i><i style="background-color:#E8D9C0"></i></div>') + '</div>' +
    '</section>' +

    '<section class="sec" id="viaje" data-lz-anchor="viaje" data-lz-show="viajeOn">' +
      '<div class="tenv painted-envelope" data-rv><div class="tflap"><div class="tlin"><svg viewBox="0 0 290 114" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + LINER + '</svg></div></div><div class="tback"></div>' +
        '<div class="tcard"><p class="cz">' + S.fromAway + '</p><h2>' + S.travel + '</h2></div><div class="tpocket">' + FOLDS + '<svg class="travel-filet" viewBox="0 0 300 126" preserveAspectRatio="none" aria-hidden="true"><path d="M12 18v96h276V18M18 28v80h264V28"/></svg><div class="mono">' + MONO + '<b data-lz-seal>' + MONOTXT + '</b></div></div></div>' +
      '<h2 class="travel-heading">' + (LANG==='en'?'Travel & stay':'Viaje y alojamiento') + '</h2><p data-lz="travelIntro">' + S.travelIntro + '</p>' +
      '<div class="tcs">' +
        '<div class="piece" data-rv data-lz-group="hotel hotelAddress hotelCode hotelNotes">' + notch('ivory', csIcon.bell + '<p class="cz">' + S.stay + '</p><h3 data-lz="hotel">' + S.hotel + '</h3><p><span data-lz="hotelAddress">' + S.hotelAddress + '</span><br><span data-lz-group="hotelCode">' + S.rate + ' <b data-lz="hotelCode">' + S.hotelCode + '</b></span><br><i data-lz="hotelNotes">' + S.hotelNotes + '</i></p><a class="btn" style="margin-top:14px" hidden href="#viaje" data-lz-href="hotelLink" data-lz-if="hotelLink">' + S.book + '</a><p class="demo-booking">' + (LANG==='en'?'Demo · booking link to be personalized':'Demostración · reserva por personalizar') + '</p>') + '</div>' +
        '<div class="piece" data-rv data-lz-group="airport transport">' + notch('ivory', csIcon.plane + '<p class="cz">' + S.getThere + '</p><h3>' + S.getThereT + '</h3><p data-lz-group="airport"><b>' + S.airportL + '</b> <span data-lz="airport">' + S.airport + '</span></p><p data-lz-group="transport"><b>' + S.transportL + '</b> <span data-lz="transport">' + S.transport + '</span></p>') + '</div>' +
        '<div class="piece" data-rv data-lz-group="guideFood guideCulture guidePlans">' + notch('ivory', csIcon.map + '<p class="cz">' + S.guide + '</p><h3>' + S.guideT + '</h3><p data-lz-group="guideFood"><b>' + S.foodL + '</b> <span data-lz="guideFood">' + S.food + '</span></p><p data-lz-group="guideCulture"><b>' + S.cultureL + '</b> <span data-lz="guideCulture">' + S.culture + '</span></p><p data-lz-group="guidePlans"><b>' + S.plansL + '</b> <span data-lz="guidePlans">' + S.plans + '</span></p>') + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="sec quote-section" style="padding:70px 34px" data-lz-group="quote">' + BQ(128, 'qbq', 'left:-30px;top:-6px;rotate:-12deg') + BQ(112, 'qbq', 'right:-30px;bottom:0;scale:-1 1;rotate:12deg') +
      SWAN(64) + '<blockquote>“<span data-lz="quote">' + S.quote + '</span>”</blockquote><p class="cz" data-lz="quoteAuthor">' + S.quoteAuthor + '</p></section>' +

    '<section class="sec" id="faq" data-lz-anchor="faq" data-lz-hide-empty style="padding-top:10px"><div class="piece faqc" data-rv>' + notch('lacey', '<p class="cz">' + S.faqK + '</p><h2 class="gtxt">' + S.faqT + '</h2><div class="faq" data-lz-list="faqs">' + S.faqs.map(function (f) { return '<details data-lz-item><summary><span data-lz-f="q">' + f[0] + '</span></summary><p data-lz-f="a">' + f[1] + '</p></details>'; }).join('') + '</div>') + '</div></section>' +

    '<section class="sec" id="rsvp" data-lz-anchor="rsvp" style="padding-top:20px">' +
      '<div class="rov" data-rv><p class="cz">' + S.confirm + '</p><p class="r">Rsvp</p><p class="cz" style="font-size:8px" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' + SWAN(56, 1.4) + '</div>' + KEY +
      '<div class="piece form" data-rv>' + notch('ivory', '<p class="ps" style="font-size:36px;color:var(--wine)">' + S.guest + '</p><p class="cz">' + S.seatsRes + '</p><p class="rsvp-deadline" data-lz-if="rsvpDeadline">' + S.before + ' <span data-lz-date="' + S.rsvpDatePat + '" data-lz-from="rsvpDeadline">' + S.deadline + '</span></p>' +
        '<p class="demo-note">' + (LANG==='en'?'Demo: responses are neither sent nor saved.':'Demostración: las respuestas no se envían ni se guardan.') + '</p><div id="rsForm"><p style="margin:16px 0 6px;text-align:left" data-lz="rsvpMsg">' + S.rsvpMsg + '</p><div id="people"></div>' +
          '<label data-lz-show="rsvpDiet">' + S.diet + '<textarea rows="2"></textarea></label><label data-lz-show="rsvpNote">' + S.note + '<textarea rows="2" id="note"></textarea></label>' +
          '<p class="rs-err" id="rsErr" role="alert" hidden>' + S.err + '</p><button type="button" class="btn" style="margin-top:22px" id="rsSave">' + S.send + '</button></div>' +
        '<div id="rsDone" hidden style="padding-top:18px"><p class="ps" style="font-size:46px;color:var(--wine)">' + S.thanks + '</p><p id="rsSum" style="margin:6px 0 18px"></p><button type="button" class="btn" id="rsEdit">' + S.edit + '</button></div>') + '</div>' +
    '</section>' +

    '</div>' +

    '<footer class="keepsake-footer"><div class="footer-border" aria-hidden="true"></div>' + BQ(180,'footer-bouquet','',false) + '<div class="footer-inner"><div class="footer-swans">' + SWAN(82) + '</div><div class="wax gold photographic-seal footer-seal"><img class="wax-photo" src="/assets/rosa/lacre-dorado.webp" alt="" width="512" height="512"><span class="emb" data-lz-seal>' + MONOTXT + '</span></div><p class="ps footer-names">' + N('n1') + ' &amp; ' + N('n2') + '</p><p class="cz footer-date"><span data-lz-date="' + S.footPat + '">14 · ' + S.M + ' · 2027</span></p><p class="footer-city" data-lz="city">' + S.city + '</p><nav class="footer-links" aria-label="' + (LANG==='en'?'Wedding information':'Información de la boda') + '"><a href="#itinerario">' + (LANG==='en'?'Schedule':'Itinerario') + '</a><a href="#rsvp">' + (LANG==='en'?'RSVP':'Confirmar asistencia') + '</a></nav></div></footer>' +
  '</main>';

  document.getElementById('demoBar').innerHTML = '<span class="lbl">' + S.demo + '</span><button type="button" data-open-panel>' + S.panel + '</button><a href="' + S.storeUrl + '">' + S.store + '</a>';
})();
