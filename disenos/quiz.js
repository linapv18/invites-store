/* Quiz «Encuentra su diseño» (/quiz/ y /en/quiz/): seis preguntas sobre gustos y un resultado con el diseño más afín y dos alternativas.
   Puntúa con las etiquetas de catalogo.js (estilo, lugar, tono, apertura) más los detalles y el uso sin fotos que se definen aquí.
   Al sumar un diseño: sus etiquetas ya cuentan; si tiene algún detalle de DETAILS o funciona sin fotos, agréguenlo también aquí. */
(function () {
  var C = window.LazoCatalog;
  // Diseños que se pueden publicar sin fotos (los mismos de NO_PHOTOS en demo/shared/content.js).
  var NO_PHOTOS = ['glicina', 'encaje', 'jardin', 'celeste', 'corazones'];
  // Respuestas de «apertura» → opciones del filtro «apertura» del catálogo.
  var OPEN = {
    sobre: ['sobre'],
    sorpresa: ['puertas', 'cortina', 'estor', 'lazo', 'ventana', 'funda', 'estuche', 'carpeta', 'medallon', 'luna'],
    concepto: ['pase', 'tele', 'baraja', 'carta', 'calendario', 'tarjetas']
  };
  // Respuestas de «estilo» → etiquetas de estilo del catálogo.
  var STYLE = { elegante: ['elegante'], romantico: ['romantico'], moderno: ['moderno'], botanico: ['botanico', 'natural'], colorido: ['colorido', 'mexicano'] };
  // Detalles favoritos → diseños que los tienen.
  var DETAILS = {
    flores: ['jardin', 'glicina', 'cisne', 'lino'],
    sobre: ['rosa', 'cisne', 'onix', 'clasico', 'jardin'],
    dorado: ['rosa', 'aurelia', 'gala', 'marfil', 'senal'],
    encaje: ['encaje', 'glicina', 'cisne'],
    caligrafia: ['marfil', 'rosa', 'tinta', 'arco'],
    lineas: ['moderno', 'aurelia', 'noir', 'onix', 'tinta', 'arco'],
    ilustracion: ['jardin', 'glicina', 'fiesta', 'celeste', 'costa'],
    papel: ['fiesta'],
    estrellas: ['celeste', 'gala'],
    mar: ['costa', 'nacar'],
    retro: ['senal', 'estreno', 'tinta'],
    viaje: ['costa', 'nacar'],
    cartas: ['corazones', 'fiesta', 'lino'],
    perlas: ['nacar', 'marfil']
  };
  var W = { estilo: 3, lugar: 2, tono: 2, apertura: 2, detalles: 1.5, fotos: 3 };

  var ICON = {
    city: '<path d="M3 21h18M5 21V9l5-3v15M10 21V4h9v17"/><path d="M13 8h3M13 12h3M13 16h3"/>',
    field: '<path d="M12 21v-8M12 13c-4 0-6-3-6-6 3 0 6 2 6 6zM12 11c0-4 3-7 7-7 0 4-3 7-7 7zM3 21h18"/>',
    beach: '<circle cx="17" cy="7" r="3"/><path d="M2 16c2.5 0 2.5-1.5 5-1.5s2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5M2 20c2.5 0 2.5-1.5 5-1.5s2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5"/>',
    unsure: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    envelope: '<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/>',
    doors: '<path d="M4 4h7v16H4zM13 4h7v16h-7z"/><path d="M9 12h.01M15 12h.01"/>',
    ticket: '<rect x="3" y="7" width="18" height="11" rx="1.5"/><path d="M15 7v11" stroke-dasharray="2 2"/><path d="M6 11h6M6 14h4"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    photos: '<rect x="7" y="3" width="14" height="14" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="M7 14l4-4 3 3 2-2 5 5"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M3 17l5-5 4 4 3-3 6 6"/>',
    nophoto: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M4 21L20 3"/>'
  };
  var svg = function (path, size) { return '<svg viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>'; };
  var CHECK = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var BACK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var REDO = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>';

  var QUESTIONS = [
    { id: 'estilo', kind: 'img', max: 2,
      es: { title: '¿Qué ambiente imaginan para su boda?', sub: 'Elijan hasta dos.' },
      en: { title: 'What mood do you imagine for your wedding?', sub: 'Choose up to two.' },
      opts: [
        { id: 'elegante', img: 'cisne', es: ['Elegante', 'Clásica y sobria'], en: ['Elegant', 'Classic and refined'] },
        { id: 'romantico', img: 'rosa', es: ['Romántico', 'Suave y delicada'], en: ['Romantic', 'Soft and delicate'] },
        { id: 'moderno', img: 'arco', es: ['Moderno', 'Limpia y gráfica'], en: ['Modern', 'Clean and graphic'] },
        { id: 'botanico', img: 'jardin', es: ['Botánico', 'Flores y naturaleza'], en: ['Botanical', 'Flowers and nature'] },
        { id: 'colorido', img: 'fiesta', es: ['Colorido', 'Fiesta y color'], en: ['Colorful', 'Party and color'] },
        { id: 'nose', es: ['Aún no sé', 'Sorpréndannos'], en: ['Not sure yet', 'Surprise us'] }
      ] },
    { id: 'lugar', kind: 'row', max: 1,
      es: { title: '¿Dónde va a ser la celebración?', sub: 'Si aún no lo saben, no pasa nada.' },
      en: { title: 'Where will the celebration be?', sub: 'If you don’t know yet, that’s fine.' },
      opts: [
        { id: 'ciudad', icon: 'city', es: ['En la ciudad', 'Un salón, un hotel o un restaurante.'], en: ['In the city', 'A venue, a hotel or a restaurant.'] },
        { id: 'campo', icon: 'field', es: ['En el campo', 'Una hacienda, una finca o un jardín.'], en: ['In the countryside', 'An estate, a farm or a garden.'] },
        { id: 'playa', icon: 'beach', es: ['En la playa', 'Frente al mar, con los pies en la arena.'], en: ['On the beach', 'By the sea, toes in the sand.'] },
        { id: 'nose', icon: 'unsure', es: ['Aún no lo sabemos', 'Les mostramos opciones para todo.'], en: ['We don’t know yet', 'We’ll show options for everything.'] }
      ] },
    { id: 'tono', kind: 'palette', max: 1,
      es: { title: '¿Qué paleta los enamora?', sub: 'Piensen en las flores, la decoración o los vestidos.' },
      en: { title: 'Which palette do you love?', sub: 'Think of the flowers, the decor or the outfits.' },
      opts: [
        { id: 'claros', colors: ['#F6F1EA', '#EAD9D6', '#D8C3B0', '#C9D2BE', '#B7A38A'], es: ['Claros y suaves', 'Marfil, rosa, salvia'], en: ['Light and soft', 'Ivory, blush, sage'] },
        { id: 'oscuros', colors: ['#1F1A1E', '#3A2232', '#5B1F2B', '#21382E', '#A8894E'], es: ['Profundos', 'Vino, verde, negro'], en: ['Deep', 'Wine, green, black'] },
        { id: 'vivos', colors: ['#E0457B', '#F08A24', '#F4C542', '#2BA6A0', '#7B4FB5'], es: ['Vivos y alegres', 'Fucsia, naranja, turquesa'], en: ['Bright and joyful', 'Fuchsia, orange, teal'] },
        { id: 'todos', colors: ['#F6F1EA', '#D8C3B0', '#5B1F2B', '#2BA6A0', '#F4C542'], es: ['Me gustan varias', 'Que decida el diseño'], en: ['We like several', 'Let the design decide'] }
      ] },
    { id: 'apertura', kind: 'row', max: 1,
      es: { title: '¿Cómo quieren que se abra la invitación?', sub: 'Es lo primero que verán sus invitados.' },
      en: { title: 'How should the invitation open?', sub: 'It’s the first thing your guests will see.' },
      opts: [
        { id: 'sobre', icon: 'envelope', es: ['Un sobre que se abre', 'El gesto clásico, con lacre y todo.'], en: ['An envelope that opens', 'The classic gesture, wax seal and all.'] },
        { id: 'sorpresa', icon: 'doors', es: ['Un gesto sorpresa', 'Puertas, una cortina o un lazo que se desata.'], en: ['A surprise gesture', 'Doors, a curtain or a bow coming undone.'] },
        { id: 'concepto', icon: 'ticket', es: ['Algo con concepto', 'Un pase de abordar, una tele antigua, una baraja.'], en: ['Something with a concept', 'A boarding pass, a vintage TV, a deck of cards.'] },
        { id: 'igual', icon: 'spark', es: ['Me da igual', 'Lo importante es el diseño.'], en: ['We don’t mind', 'The design is what matters.'] }
      ] },
    { id: 'detalles', kind: 'chip', max: 3,
      es: { title: '¿Qué detalles no pueden faltar?', sub: 'Elijan hasta tres.' },
      en: { title: 'Which details are a must?', sub: 'Choose up to three.' },
      opts: [
        { id: 'flores', es: ['Flores'], en: ['Flowers'] }, { id: 'sobre', es: ['Sobre con lacre'], en: ['Sealed envelope'] },
        { id: 'dorado', es: ['Toques dorados'], en: ['Gold touches'] }, { id: 'encaje', es: ['Encaje y bordados'], en: ['Lace and embroidery'] },
        { id: 'caligrafia', es: ['Letra caligráfica'], en: ['Calligraphy'] }, { id: 'lineas', es: ['Líneas limpias'], en: ['Clean lines'] },
        { id: 'ilustracion', es: ['Ilustraciones'], en: ['Illustrations'] }, { id: 'papel', es: ['Papel picado'], en: ['Papel picado'] },
        { id: 'estrellas', es: ['Estrellas y luna'], en: ['Stars and moon'] }, { id: 'mar', es: ['Mar y conchas'], en: ['Sea and shells'] },
        { id: 'retro', es: ['Cine y retro'], en: ['Film and retro'] }, { id: 'viaje', es: ['Viajes'], en: ['Travel'] },
        { id: 'cartas', es: ['Juegos y cartas'], en: ['Games and cards'] }, { id: 'perlas', es: ['Perlas'], en: ['Pearls'] }
      ] },
    { id: 'fotos', kind: 'row', max: 1,
      es: { title: '¿Quieren mostrar fotos de ustedes?', sub: 'Algunos diseños lucen igual de bien sin fotos.' },
      en: { title: 'Do you want to show photos of yourselves?', sub: 'Some designs look just as good without photos.' },
      opts: [
        { id: 'muchas', icon: 'photos', es: ['Sí, muchas', 'Queremos una galería con nuestra historia.'], en: ['Yes, lots', 'We want a gallery with our story.'] },
        { id: 'pocas', icon: 'photo', es: ['Unas pocas', 'Una o dos fotos especiales.'], en: ['Just a few', 'One or two special photos.'] },
        { id: 'ninguna', icon: 'nophoto', es: ['Mejor sin fotos', 'Que hable el diseño.'], en: ['Rather no photos', 'Let the design speak.'] }
      ] }
  ];

  var has = function (list, v) { return (list || []).indexOf(v) > -1; };
  var some = function (list, values) { return values.some(function (v) { return has(list, v); }); };

  // Puntúa todos los diseños para unas respuestas ({ estilo: [...], lugar: [...], ... }) y los ordena de más a menos afín.
  // Cada resultado trae `pct` (afinidad que se muestra) y `reasons` (lo que coincidió, para explicar el resultado).
  function rank(answers) {
    var a = answers || {}, pick = function (k) { return a[k] || []; };
    var styles = pick('estilo').filter(function (s) { return STYLE[s]; });
    var place = pick('lugar').filter(function (p) { return p !== 'nose'; })[0];
    var tone = pick('tono').filter(function (t) { return t !== 'todos'; })[0];
    var opening = pick('apertura').filter(function (o) { return OPEN[o]; })[0];
    var details = pick('detalles').filter(function (d) { return DETAILS[d]; });
    var noPhotos = pick('fotos')[0] === 'ninguna';
    var max = styles.length * W.estilo + (place ? W.lugar : 0) + (tone ? W.tono : 0) + (opening ? W.apertura : 0) + details.length * W.detalles + (noPhotos ? W.fotos : 0);
    return C.designs.map(function (d, order) {
      var t = d.tags, score = 0, reasons = [];
      styles.forEach(function (s) { if (some(t.estilo, STYLE[s])) { score += W.estilo; reasons.push({ type: 'estilo', id: s }); } });
      if (place && has(t.lugar, place)) { score += W.lugar; reasons.push({ type: 'lugar', id: place }); }
      if (tone && has(t.tono, tone)) { score += W.tono; reasons.push({ type: 'tono', id: tone }); }
      if (opening && some(t.apertura, OPEN[opening])) { score += W.apertura; reasons.push({ type: 'apertura', id: opening }); }
      details.forEach(function (x) { if (has(DETAILS[x], d.id)) { score += W.detalles; reasons.push({ type: 'detalles', id: x }); } });
      if (noPhotos) {
        if (has(NO_PHOTOS, d.id)) { score += W.fotos; reasons.push({ type: 'fotos', id: 'ninguna' }); }
        else score -= W.fotos;
      }
      var pct = max ? Math.round(55 + 43 * Math.max(score, 0) / max) : 80;
      return { design: d, score: score, pct: Math.min(pct, 98), reasons: reasons, order: order };
    }).sort(function (x, y) { return y.score - x.score || x.order - y.order; });
  }

  var api = { questions: QUESTIONS, rank: rank, noPhotos: NO_PHOTOS, details: DETAILS };
  window.LazoQuiz = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  var root = typeof document !== 'undefined' && document.getElementById('quiz');
  if (!root) return;

  var LANG = root.dataset.lang === 'en' ? 'en' : 'es', base = LANG === 'en' ? '/en' : '';
  var S = {
    es: { back: 'Volver', next: 'Siguiente', finish: 'Ver mi diseño ideal', progress: 'Pregunta', of: 'de', ideal: 'Su diseño ideal', love: 'Les va a encantar', match: '% afín', why: 'Por qué encaja con ustedes',
      choose: 'Elegir', demo: 'Ver demo', alts: 'También les pueden gustar', more: 'Ver todos los diseños con su estilo', custom: '¿Ninguno los convence?', customLink: 'Pidan una cotización a medida', redo: 'Rehacer',
      place: { ciudad: 'Boda en la ciudad', campo: 'Boda en el campo', playa: 'Boda en la playa' }, tone: { claros: 'Tonos claros', oscuros: 'Tonos profundos', vivos: 'Colores vivos' },
      opening: 'Se abre con', noPhotos: 'Funciona sin fotos', selected: function (n, m) { return n + ' de ' + m; } },
    en: { back: 'Back', next: 'Next', finish: 'See my ideal design', progress: 'Question', of: 'of', ideal: 'Your ideal design', love: 'You’re going to love', match: '% match', why: 'Why it suits you',
      choose: 'Choose', demo: 'View demo', alts: 'You may also like', more: 'See every design in your style', custom: 'None of them feel right?', customLink: 'Ask for a custom design', redo: 'Start over',
      place: { ciudad: 'City wedding', campo: 'Countryside wedding', playa: 'Beach wedding' }, tone: { claros: 'Light tones', oscuros: 'Deep tones', vivos: 'Bright colors' },
      opening: 'Opens with', noPhotos: 'Works without photos', selected: function (n, m) { return n + ' of ' + m; } }
  }[LANG];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var filterName = function (key, id) { var g = C.filters.filter(function (f) { return f.key === key; })[0]; var o = g && g.opts.filter(function (x) { return x.id === id; })[0]; return o ? o[LANG] : id; };
  var thumb = function (id, size) { return '/assets/brand/thumbs/' + id + '-' + size + '.webp'; };

  var intro = root.querySelector('.qz-intro'), stage = document.createElement('div');
  stage.className = 'qz-stage'; root.appendChild(stage);
  var step = -1, answers = {};

  function progress() {
    var dots = QUESTIONS.map(function (_, i) { return '<span' + (i <= step ? ' class="on"' : '') + '></span>'; }).join('');
    return '<div class="qz-top"><button type="button" class="qz-icon" data-back aria-label="' + S.back + '">' + BACK + '</button>' +
      '<div class="qz-bar" role="progressbar" aria-label="' + S.progress + '" aria-valuemin="1" aria-valuemax="' + QUESTIONS.length + '" aria-valuenow="' + (step + 1) + '" aria-valuetext="' + S.progress + ' ' + (step + 1) + ' ' + S.of + ' ' + QUESTIONS.length + '">' + dots + '</div>' +
      '<span class="qz-count" aria-hidden="true">' + (step + 1) + ' / ' + QUESTIONS.length + '</span></div>';
  }
  function option(q, o, on) {
    var t = o[LANG], attrs = ' type="button" class="qz-opt qz-' + q.kind + '" data-opt="' + o.id + '" aria-pressed="' + on + '"';
    if (q.kind === 'chip') return '<button' + attrs + '>' + CHECK + '<span>' + esc(t[0]) + '</span></button>';
    var mark = '<span class="qz-mark" aria-hidden="true">' + (q.max > 1 ? CHECK : '') + '</span>';
    var text = '<span class="qz-txt"><span class="qz-label">' + esc(t[0]) + '</span><span class="qz-hint">' + esc(t[1]) + '</span></span>';
    if (q.kind === 'img') return '<button' + attrs + (o.img ? '' : ' data-empty') + '>' + (o.img ? '<img src="' + thumb(o.img, 280) + '" srcset="' + thumb(o.img, 280) + ' 280w, ' + thumb(o.img, 554) + ' 554w" sizes="(max-width:600px) 45vw, 280px" width="280" height="607" alt="">' : '') + '<span class="qz-foot">' + text + mark + '</span></button>';
    if (q.kind === 'palette') return '<button' + attrs + '><span class="qz-swatches" aria-hidden="true">' + o.colors.map(function (c) { return '<span style="background:' + c + '"></span>'; }).join('') + '</span><span class="qz-foot">' + text + mark + '</span></button>';
    return '<button' + attrs + '><span class="qz-badge" aria-hidden="true">' + svg(ICON[o.icon]) + '</span>' + text + mark + '</button>';
  }
  function renderQuestion() {
    var q = QUESTIONS[step], t = q[LANG], picked = answers[q.id] || [], last = step === QUESTIONS.length - 1;
    stage.innerHTML = '<div class="qz-q">' + progress() +
      '<h2 tabindex="-1">' + esc(t.title) + '</h2><p class="qz-sub">' + esc(t.sub) + (q.max > 2 ? ' <b>' + S.selected(picked.length, q.max) + '</b>' : '') + '</p>' +
      '<div class="qz-opts qz-opts-' + q.kind + '" role="group" aria-label="' + esc(t.title) + '">' + q.opts.map(function (o) { return option(q, o, has(picked, o.id)); }).join('') + '</div>' +
      '<button type="button" class="qz-btn qz-next" data-next' + (picked.length ? '' : ' disabled') + '>' + (last ? S.finish + ARROW : S.next) + '</button></div>';
  }
  function reasonText(r, d) {
    if (r.type === 'estilo') return filterName('estilo', r.id) + (LANG === 'en' ? ' style' : '');
    if (r.type === 'lugar') return S.place[r.id];
    if (r.type === 'tono') return S.tone[r.id];
    if (r.type === 'apertura') return S.opening + ' ' + String(d[LANG].opening).replace(/^(Apertura|Opening):\s*/, '');
    if (r.type === 'fotos') return S.noPhotos;
    var o = QUESTIONS[4].opts.filter(function (x) { return x.id === r.id; })[0];
    return o ? o[LANG][0] : r.id;
  }
  function tier(d) { var id = (d.tags.gama || [])[0]; return id ? '<span class="qz-tier qz-tier-' + id + '">' + esc(filterName('gama', id)) + '</span>' : ''; }
  function renderResult() {
    var list = rank(answers), top = list[0], d = top.design, t = d[LANG];
    var seen = {}, reasons = top.reasons.filter(function (r) { var k = reasonText(r, d); if (seen[k]) return false; seen[k] = 1; return true; });
    var styles = (answers.estilo || []).reduce(function (all, s) { return all.concat(STYLE[s] || []); }, []).filter(function (s) { return C.filters[0].opts.some(function (o) { return o.id === s; }); });
    var params = new URLSearchParams(); if (styles.length) params.set('estilo', styles.join(','));
    var place = (answers.lugar || [])[0]; if (place && place !== 'nose') params.set('lugar', place);
    var qs = params.toString();
    stage.innerHTML = '<div class="qz-res">' +
      '<div class="qz-res-top"><p class="qz-eyebrow">' + S.ideal + '</p><button type="button" class="qz-redo" data-redo>' + REDO + S.redo + '</button></div>' +
      '<article class="qz-match">' +
        '<a class="qz-art" href="' + base + '/demo/' + d.id + '/" style="--card-bg:' + d.bg + '" aria-label="' + esc(S.demo + ': ' + t.name) + '"><img src="' + thumb(d.id, 554) + '" width="554" height="1200" alt="' + esc(t.alt[0]) + '"><span class="qz-pct">' + top.pct + ' ' + S.match + '</span></a>' +
        '<div class="qz-info">' + tier(d) + '<h2 tabindex="-1">' + S.love + ' <i>' + esc(t.name) + '</i></h2><p class="qz-desc">' + esc(t.desc) + '</p>' +
          (reasons.length ? '<p class="qz-why-k">' + S.why + '</p><ul class="qz-why">' + reasons.map(function (r) { return '<li>' + CHECK + esc(reasonText(r, d)) + '</li>'; }).join('') + '</ul>' : '') +
          '<div class="qz-cta"><a class="qz-btn" href="' + base + '/comprar/?diseno=' + d.id + '">' + S.choose + ' ' + esc(t.name) + '</a><a class="qz-btn qz-line" href="' + base + '/demo/' + d.id + '/">' + S.demo + '</a></div>' +
        '</div></article>' +
      '<section class="qz-alts" aria-labelledby="qz-alts"><h3 id="qz-alts">' + S.alts + '</h3><div class="qz-alt-grid">' + list.slice(1, 3).map(function (x) {
        var a = x.design;
        return '<a class="qz-alt" href="' + base + '/disenos/' + a.id + '/"><span class="qz-alt-art" style="--card-bg:' + a.bg + '"><img src="' + thumb(a.id, 280) + '" width="280" height="607" alt="" loading="lazy"></span><span class="qz-alt-meta"><span class="qz-alt-name">' + esc(a[LANG].name) + '</span><span class="qz-alt-pct">' + x.pct + ' %</span></span>' + tier(a) + '</a>';
      }).join('') + '</div></section>' +
      '<p class="qz-more"><a href="' + base + '/disenos/' + (qs ? '?' + qs : '') + '">' + S.more + ARROW + '</a></p>' +
      '<p class="qz-custom">' + S.custom + ' <a href="' + (LANG === 'en' ? '/en/quote/' : '/cotizar/') + '">' + S.customLink + '</a></p></div>';
    if (window.gtag) window.gtag('event', 'quiz_result', { design_id: d.id, page_location: location.origin + location.pathname, page_referrer: '' });
  }
  function go(next) {
    step = next;
    intro.classList.toggle('is-gone', step >= 0);
    root.classList.toggle('is-result', step >= QUESTIONS.length);
    if (step < 0) { stage.innerHTML = ''; intro.querySelector('[data-start]').focus(); return; }
    if (step >= QUESTIONS.length) renderResult(); else renderQuestion();
    var h = stage.querySelector('h2'); if (h) h.focus({ preventScroll: true });
    var top = root.getBoundingClientRect().top; if (top < 0) window.scrollTo({ top: window.scrollY + top - 16 });
  }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('button');
    if (!el || !root.contains(el)) return;
    if (el.hasAttribute('data-start')) return go(0);
    if (el.hasAttribute('data-back')) return go(step - 1);
    if (el.hasAttribute('data-redo')) { answers = {}; return go(0); }
    if (el.hasAttribute('data-next')) return go(step + 1);
    var id = el.dataset.opt; if (!id) return;
    var q = QUESTIONS[step], picked = (answers[q.id] || []).slice(), at = picked.indexOf(id);
    if (q.max === 1) picked = [id];
    else if (at > -1) picked.splice(at, 1);
    else if (id === 'nose') picked = [id];
    else {
      picked = picked.filter(function (x) { return x !== 'nose'; });
      if (picked.length < q.max) picked.push(id); else if (q.max === 2) { picked.shift(); picked.push(id); } else return;
    }
    answers[q.id] = picked;
    renderQuestion();
    var again = stage.querySelector('[data-opt="' + id + '"]'); if (again) again.focus();
  });
})();
