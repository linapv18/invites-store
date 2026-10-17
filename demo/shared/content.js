/* Lleva el contenido del editor a las plantillas reales (clásico, moderno, romántico, jardín y costa).
   Solo actúa si la URL trae ?lz=editor (vista previa dentro del editor) o ?lz=vista (ver como invitado),
   junto con &k=<clave de localStorage> donde el editor guardó la invitación. Sin esos parámetros
   la demo de la tienda se ve exactamente igual que siempre.
   Se carga ANTES de panel.js y de los scripts de cada plantilla, para que la galería, los acordeones
   y la cuenta regresiva ya encuentren el contenido de los novios.
   Marcas en el HTML de cada plantilla:
     data-lz="n1|n2|city|msg|storyTitle|story|hotel|rsvpMsg|time0|cdName|…"   texto (time0 y cdName: evento de la cuenta regresiva)
     data-lz-date="{W} · {d} de {M} · {Y}" [data-lz-from="rsvpDeadline"]               fecha con formato
     data-lz-src="photo:N"     foto N de [portada, ...galería] (se repite si hay menos)
     data-lz-href="hotelLink"  enlace
     data-lz-list="gallery|events|faqs" con hijos data-lz-item y campos data-lz-f="…" lista que se repite
     data-lz-show="viajeOn|rsvpDiet|rsvpNote"  se oculta si está apagado
     data-lz-keep              si el campo está vacío se deja el texto del diseño (frases del sobre)
     data-lz-if="k1 k2"        solo se muestra si alguno de esos campos tiene valor (huecos que la demo no trae)
     data-lz-group="k1 k2"     al ver como invitado se oculta si todos esos campos están vacíos (título + texto)
     data-lz-seal              contenido del sello
     data-lz-mono              monograma ya maquetado ("V<span>&</span>M", "S — T"): solo cambia las dos letras
     data-lz-anchor="portada|historia|itinerario|faq|viaje|rsvp"  destino al cambiar de sección en el editor
   Si un texto está vacío: en el editor se ve el texto de ejemplo de la plantilla, atenuado; al ver como
   invitado (?lz=vista) se oculta, para que nunca salga texto de ejemplo en la invitación. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), MODE = q.get('lz'), KEY = q.get('k');
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var html = document.documentElement, TPL = html.getAttribute('data-lz-tpl');

  /* ---------- Colores de cada plantilla ----------
     Clásico: paletas a partir de un color oscuro (o uno propio); Romántico: champaña (base) o rosado;
     Moderno: blanco y negro (base), arena, oliva, azul marino o vino. La primera de cada lista es la original del diseño (sin variables). */
  var THEMES = {
    clasico: [
      { id: 'salvia', es: 'Salvia', en: 'Sage', sw: '#293c35' },
      { id: 'rosa', es: 'Rosa antiguo', en: 'Dusty rose', sw: '#4A2F2E', dark: '#4A2F2E', accent: '#6B4442' },
      { id: 'azul', es: 'Azul noche', en: 'Midnight blue', sw: '#26304A', dark: '#26304A', accent: '#34405A' },
      { id: 'terracota', es: 'Terracota', en: 'Terracotta', sw: '#4A2B1F', dark: '#4A2B1F', accent: '#6A3D2A' }
    ],
    rosa: [
      { id: 'champana', es: 'Champaña', en: 'Champagne', sw: '#E9DCC4' },
      { id: 'rosado', es: 'Rosado', en: 'Blush', sw: '#EBD3D2', vars: { 'r-bg': '#F6EBEC', 'r-bg2': '#F0E2E0', 'r-card': '#FBF4F3', 'r-line': '#E2CFC6', 'r-on': '#F7EEF0', 'r-ink': '#3E3236', 'r-text': '#6E5F64', 'r-muted': '#7D6A70', 'r-field': '#D9C5BE', 'r-on2': '#E8DADC', 'r-body': '#4E4247', 'r-row': '#E8D8D4', 'r-soft40': '#5E525740', 'r-soft': '#5E5257', 'r-shadow': '#6B515818', 'r-shade': '#6B5158', 'r-liner1': '#F8ECE8', 'r-liner2': '#F7EDEA', 'r-liner3': '#EBD6D5', 'r-liner4': '#F5E6EB', 'r-pat': '#B8978B', 'r-pat2': '#D3BBAF', 'r-sh1': '#9C7E80', 'r-sh2': '#8E7F84', 'r-sh3': '#6A5550' } }
    ],
    moderno: [
      { id: 'bn', es: 'Blanco y negro', en: 'Black & white', sw: '#141414' },
      { id: 'arena', es: 'Arena', en: 'Sand', sw: '#2E2A25', vars: { 't-ink': '#2E2A25', 't-ivory': '#F3EEE6', 't-sand': '#E6DED2', 't-stone': '#C2B6A5', 't-muted': '#7A6F62', 't-body': '#4D453C', 't-soft': '#9A8E7F', 'sand2': '#D8CEBF', 'tone1': '#231F1B', 'tone2': '#332D27', 'tone3': '#463F37', 'p-bg': '#F3EEE6', 'p-ink': '#2E2A25', 'p-muted': '#7A6F62', 'p-accent': '#2E2A25', 'p-on-accent': '#F3EEE6', 'm-bg': '#2E2A25', 'm-fg': '#F3EEE6' } },
      { id: 'oliva', es: 'Oliva', en: 'Olive', sw: '#262B22', vars: { 't-ink': '#262B22', 't-ivory': '#F2F1EA', 't-sand': '#E2E3D7', 't-stone': '#B9BBA8', 't-muted': '#6A6E5F', 't-body': '#464A3E', 't-soft': '#8C907F', 'sand2': '#D3D5C6', 'tone1': '#1D211A', 'tone2': '#2A3026', 'tone3': '#3B4235', 'p-bg': '#F2F1EA', 'p-ink': '#262B22', 'p-muted': '#6A6E5F', 'p-accent': '#262B22', 'p-on-accent': '#F2F1EA', 'm-bg': '#262B22', 'm-fg': '#F2F1EA' } },
      { id: 'marino', es: 'Azul marino', en: 'Navy', sw: '#1B2433', vars: { 't-ink': '#1B2433', 't-ivory': '#F3F4F6', 't-sand': '#E3E6EB', 't-stone': '#B7BDC8', 't-muted': '#626B7A', 't-body': '#3F4756', 't-soft': '#868E9C', 'sand2': '#D3D8DF', 'tone1': '#151C28', 'tone2': '#212B3B', 'tone3': '#2F3B4E', 'p-bg': '#F3F4F6', 'p-ink': '#1B2433', 'p-muted': '#626B7A', 'p-accent': '#1B2433', 'p-on-accent': '#F3F4F6', 'm-bg': '#1B2433', 'm-fg': '#F3F4F6' } },
      { id: 'vino', es: 'Vino', en: 'Wine', sw: '#3A1E24', vars: { 't-ink': '#3A1E24', 't-ivory': '#F6F0EE', 't-sand': '#EADFDC', 't-stone': '#C7B2AD', 't-muted': '#7A5F63', 't-body': '#523A3E', 't-soft': '#9B8285', 'sand2': '#DDCDC9', 'tone1': '#2C161B', 'tone2': '#402329', 'tone3': '#553139', 'p-bg': '#F6F0EE', 'p-ink': '#3A1E24', 'p-muted': '#7A5F63', 'p-accent': '#3A1E24', 'p-on-accent': '#F6F0EE', 'm-bg': '#3A1E24', 'm-fg': '#F6F0EE' } }
    ],
    // Jardín y Costa: las ilustraciones, el papel y el panel salen de estas variables.
    jardin: [
      { id: 'hoja', es: 'Hoja', en: 'Leaf', sw: '#2F3B2C' },
      { id: 'lavanda', es: 'Lavanda', en: 'Lavender', sw: '#5B3A4A', vars: { ink: '#4A2F3C', leaf: '#8A6274', soft: '#C7A9B5', accent: '#A85E6E', bloom: '#C97B93', bloom2: '#E8B9C6', bg: '#F5EEEA', paper: '#FCF7F5' } },
      { id: 'eucalipto', es: 'Eucalipto', en: 'Eucalyptus', sw: '#2E4057', vars: { ink: '#24344A', leaf: '#5C7A8F', soft: '#A9BCC9', accent: '#C08B4A', bloom: '#7E9CC4', bloom2: '#E4C88F', bg: '#F1F1EA', paper: '#FAFAF5' } }
    ],
    costa: [
      { id: 'cobalto', es: 'Cobalto', en: 'Cobalt', sw: '#1F4E8C' },
      { id: 'verde', es: 'Verde agua', en: 'Sea green', sw: '#2F6F62', vars: { ink: '#1F3B36', blue: '#2F6F62', blue2: '#DCEBE6', sun: '#E9B949', clay: '#C8643B' } },
      { id: 'barro', es: 'Barro', en: 'Clay', sw: '#B5522E', vars: { ink: '#4A2A1C', blue: '#B5522E', blue2: '#F3E1D6', sun: '#E3A43A', clay: '#3E6B8A' } }
    ],
    gala: [
      { id: 'burdeos', es: 'Ciruela y oro rosa', en: 'Plum and rose gold', sw: '#301B2B', vars: { bg: '#241321', bg2: '#301B2B', gold: '#D1A88A', gold2: '#EDD3C0' } },
      { id: 'negro', es: 'Negro y oro', en: 'Black and gold', sw: '#0F0F0E', vars: { bg: '#0F0E0C', bg2: '#181612', gold: '#C9A45C', gold2: '#E6CF97' } },
      { id: 'esmeralda', es: 'Esmeralda', en: 'Emerald', sw: '#0F2A24', vars: { bg: '#0B1F1A', bg2: '#10291F', gold: '#C9A45C', gold2: '#E6CF97' } }
    ],
    aurelia: [
      { id: 'oro', es: 'Oro', en: 'Gold', sw: '#B4955E' },
      { id: 'plata', es: 'Plata', en: 'Silver', sw: '#A3A7AC', vars: { gold: '#9EA3A8', gold2: '#E4E7EA', bg: '#F7F7F5' } },
      { id: 'rosa', es: 'Oro rosa', en: 'Rose gold', sw: '#C39488', vars: { gold: '#B98374', gold2: '#EBCFC4', bg: '#FBF7F4' } }
    ],
    noir: [
      { id: 'negro', es: 'Negro', en: 'Black', sw: '#121211' },
      { id: 'bosque', es: 'Verde bosque', en: 'Forest green', sw: '#0F1A15', vars: { bg: '#0E1813' } },
      { id: 'medianoche', es: 'Medianoche', en: 'Midnight', sw: '#0E1422', vars: { bg: '#0D1320' } }
    ],
    lino: [
      { id: 'salvia', es: 'Salvia', en: 'Sage', sw: '#52634C' },
      { id: 'arena', es: 'Arena', en: 'Sand', sw: '#B49B7E', vars: { sage: '#72583D', bg: '#ECE6DC' } },
      { id: 'piedra', es: 'Piedra', en: 'Stone', sw: '#8A939B', vars: { sage: '#505F6B', bg: '#E4E5E6' } }
    ],
    marfil: [
      { id: 'burdeos', es: 'Burdeos', en: 'Burgundy', sw: '#5E1F2B' },
      { id: 'azul', es: 'Azul noche', en: 'Midnight blue', sw: '#1F2A44', vars: { wine: '#1F2A44' } },
      { id: 'verde', es: 'Verde inglés', en: 'British green', sw: '#23392E', vars: { wine: '#23392E' } }
    ],
    fiesta: [
      { id: 'fiesta', es: 'Fiesta', en: 'Fiesta', sw: 'conic-gradient(#E8457C 0 25%,#F28C28 0 50%,#19A39A 0 75%,#3B5BDB 0)' },
      { id: 'pastel', es: 'Pastel', en: 'Pastel', sw: 'conic-gradient(#F2A7BF 0 25%,#F7C59F 0 50%,#8FD3C8 0 75%,#A9B8F2 0)', vars: { pink: '#E07A9E', orange: '#F2A774', yellow: '#F6D88A', teal: '#5DBFB2', blue: '#7F94E3', green: '#93C98A', red: '#E88A94', ink: '#3D2F52', bg: '#FFF7EE' } },
      { id: 'rosa', es: 'Rosa mexicano', en: 'Mexican pink', sw: 'conic-gradient(#C2185B 0 33%,#E91E63 0 66%,#F8BBD0 0)', vars: { pink: '#C2185B', orange: '#E91E63', yellow: '#F8BBD0', teal: '#AD1457', blue: '#880E4F', green: '#F06292', red: '#D81B60', bg: '#FFF1F5' } }
    ],
    celeste: [
      { id: 'medianoche', es: 'Medianoche', en: 'Midnight', sw: '#0B1430' },
      { id: 'aurora', es: 'Aurora', en: 'Aurora', sw: '#0A2630', vars: { bg: '#081E26', bg2: '#0F2E3A', accent: '#7FE0C8', neb1: '#1D7A6A', neb2: '#3B5FA0' } },
      { id: 'lavanda', es: 'Lavanda', en: 'Lavender', sw: '#241B42', vars: { bg: '#1C1636', bg2: '#2A2150', accent: '#C3A8F0', neb1: '#7A4C9A', neb2: '#B0607E' } }
    ],
    // Cisne: una sola paleta (las flores, la bandeja y el óvalo son fotos burdeos y oliva).
    cisne: [
      { id: 'burdeos', es: 'Burdeos y oliva', en: 'Burgundy and olive', sw: 'conic-gradient(#6E1A27 0 50%,#66682F 0)' }
    ],
    tinta: [
      { id: 'rojo', es: 'Rojo', en: 'Red', sw: '#B42A30' },
      { id: 'azul', es: 'Azul tinta', en: 'Ink blue', sw: '#23468C', vars: { red: '#23468C' } },
      { id: 'verde', es: 'Verde botella', en: 'Bottle green', sw: '#2F6A48', vars: { red: '#2F6A48', paper: '#EFEEE6' } }
    ],
    // Estreno: el terciopelo cambia, la luz de las bombillas no.
    estreno: [
      { id: 'granate', es: 'Granate', en: 'Garnet', sw: '#5E0F1A' },
      { id: 'noche', es: 'Noche', en: 'Night', sw: '#1F1C24', vars: { vel: '#1F1C24', acc: '#B0202F', paper: '#EFEAE2', ink: '#141217', bulb: '#F3DDB0' } },
      { id: 'champan', es: 'Champán', en: 'Champagne', sw: '#8A7354', vars: { vel: '#8A7354', acc: '#6E1220', paper: '#F7F1E7', ink: '#231D17', bulb: '#FBE7C0' } }
    ],
    // Nácar: el ante y la sección oscura cambian; el nácar no.
    nacar: [
      { id: 'nacar', es: 'Nácar', en: 'Nacre', sw: '#8F8270' },
      { id: 'bruma', es: 'Bruma', en: 'Mist', sw: '#7F8A96', vars: { dark: '#5F6B78', suede: '#7F8A96', paper: '#F3F1EC', ink: '#22262B', silver: '#B9BCC0', sand: '#E4E4E0' } },
      { id: 'oliva', es: 'Oliva', en: 'Olive', sw: '#7B826A', vars: { dark: '#5E6650', suede: '#7B826A', paper: '#F4F0E6', ink: '#25271F', silver: '#B5B3A8', sand: '#E6E3D5' } }
    ],
    // Arco: verde bosque (base), noche o vino; las fotos no se tiñen.
    arco: [
      { id: 'bosque', es: 'Bosque', en: 'Forest', sw: '#1F3A2B' },
      { id: 'noche', es: 'Noche', en: 'Night', sw: '#1F2A3D', vars: { g: '#1F2A3D', g2: '#2D3A52', sage: '#9AA6BC', paper: '#F2F2EE', p2: '#E4E5E2' } },
      { id: 'vino', es: 'Vino', en: 'Wine', sw: '#4A1E27', vars: { g: '#4A1E27', g2: '#5E2A34', sage: '#C2A3A3', paper: '#F4F0EB', p2: '#E9E2DB' } }
    ],
    // Corazones: cambia el fieltro y el oro; el rojo de los palos no.
    corazones: [
      { id: 'burdeos', es: 'Burdeos', en: 'Burgundy', sw: '#5A0E1E' },
      { id: 'tapete', es: 'Tapete', en: 'Card table', sw: '#0F3D2E', vars: { bur: '#0F3D2E', bur2: '#1A5240', bur3: '#082419', gold: '#D2B06A' } },
      { id: 'medianoche', es: 'Medianoche', en: 'Midnight', sw: '#141B33', vars: { bur: '#141B33', bur2: '#222C4F', bur3: '#0A0F1F', gold: '#D9C08A' } }
    ],
    // Glicina: una sola paleta (los racimos, la rama y las hortensias son imágenes).
    glicina: [
      { id: 'lavanda', es: 'Lavanda y oliva', en: 'Lavender and olive', sw: 'conic-gradient(#8E79BD 0 50%,#7C8454 0)' }
    ]
  };
  function hexRgb(h) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return null; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(c) { return [0, 1, 2].reduce(function (sum, i) { var x = c[i] / 255; x = x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return sum + x * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  var mix = function (c, t, a) { return c.map(function (x, i) { return Math.round(x + (t[i] - x) * a); }); };
  var toHex = function (c) { return '#' + c.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); };
  // Color propio (selector de color): se oscurece si hace falta para que el texto claro se lea.
  function customPalette(hex) {
    var c = hexRgb(hex); if (!c) return null;
    for (var i = 0; i < 25 && lum(c) > 0.12; i++) c = mix(c, [0, 0, 0], 0.15);
    return [toHex(c), toHex(mix(c, [255, 255, 255], 0.12))];
  }
  var themeVars = {};
  function applyTheme(id, custom) {
    var list = THEMES[TPL] || [], t = list.filter(function (x) { return x.id === id; })[0], vars = {};
    if (TPL === 'clasico') {
      // Todo lo que en la plantilla es de ese color sale del color elegido: texto y fondos (--dark, --accent),
      // el sobre exterior y su sello, los detalles claros sobre fondo oscuro y el botón de música.
      var pal = id === 'custom' ? customPalette(custom) : t && t.dark ? [t.dark, t.accent] : null, c = pal && hexRgb(pal[0]), W = [255, 255, 255], K = [0, 0, 0];
      if (c) vars = {
        '--dark': pal[0], '--accent': pal[1], '--env-bg': toHex(mix(c, K, 0.12)), '--env-glow': toHex(mix(c, W, 0.22)),
        '--seal-hi': toHex(mix(c, W, 0.28)), '--seal-lo': toHex(mix(c, K, 0.05)), '--seal-ring': toHex(mix(c, W, 0.5)),
        '--pale': toHex(mix(c, W, 0.68)), '--m-bg': pal[0], '--p-ink': pal[0], '--p-accent': pal[0]
      };
    } else if (t && t.vars) Object.keys(t.vars).forEach(function (k) { vars['--' + k] = t.vars[k]; });
    Object.keys(themeVars).concat(Object.keys(vars)).forEach(function (k) { html.style.setProperty(k, vars[k] || ''); });
    themeVars = vars;
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) { if (tc._lz === undefined) tc._lz = tc.content; tc.content = vars['--env-bg'] || vars['--r-bg2'] || vars['--t-ink'] || vars['--bg'] || vars['--blue'] || tc._lz; }
  }
  window.LazoTheme = { list: function () { return THEMES[TPL] || []; }, apply: applyTheme };

  // Convert a venue's wall-clock date/time to one instant, independent of the guest's device zone.
  // Invalid zones and nonexistent daylight-saving times remain invalid instead of silently shifting the event.
  window.LazoTime = { target: function (date, time, zone) {
    var d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || ''), t = /^(\d{1,2}):(\d{2})$/.exec(time || '00:00');
    if (!d || !t || +t[1] > 23 || +t[2] > 59) return NaN;
    var expected = Date.UTC(+d[1], +d[2]-1, +d[3], +t[1], +t[2]), guess = expected;
    var check = new Date(expected); if(check.getUTCFullYear() !== +d[1] || check.getUTCMonth() !== +d[2]-1 || check.getUTCDate() !== +d[3]) return NaN;
    try {
      var formatter = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
      function wall(instant) { var parts = {}; formatter.formatToParts(new Date(instant)).forEach(function (p) { parts[p.type] = p.value; }); return Date.UTC(+parts.year, +parts.month-1, +parts.day, +parts.hour, +parts.minute, +parts.second); }
      for (var i = 0; i < 4; i++) { var delta = expected - wall(guess); if (!delta) return guess; guess += delta; }
      return wall(guess) === expected ? guess : NaN;
    } catch (e) { return NaN; }
  } };

  if (MODE !== 'editor' && MODE !== 'vista') {
    // Demo de la tienda: elegir entre los colores del diseño desde la barra de la demo (o con ?color=champana).
    var themes = THEMES[TPL] || [];
    // Con una sola paleta no hay selector de color (Glicina igual muestra su botón «Sin fotos»).
    if (themes.length < 2 && TPL !== 'glicina') return;
    var start = q.get('color');
    if (start) applyTheme(start);
    var photoColor = (TPL === 'moderno' || TPL === 'noir') && /^(color|colour)$/.test(q.get('fotos') || q.get('photos') || '');
    html.classList.toggle('lz-photo-color', photoColor);
    // Glicina: verla sin fotos (?fotos=no o el botón de la barra).
    var noPhotos = TPL === 'glicina' && /^(no|sin|none)$/.test(q.get('fotos') || q.get('photos') || '');
    html.classList.toggle('lz-no-photos', noPhotos);
    // Cápsula propia, encima de la barra de la demo (dentro de la barra la apretaba contra el botón de música).
    var css0 = document.createElement('style');
    css0.textContent = '.lz-colors{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:calc(max(16px,env(safe-area-inset-bottom)) + 56px);z-index:80;display:flex;align-items:center;gap:8px;padding:6px 10px 6px 14px;border-radius:100px;background:var(--p-ink);color:var(--p-bg);box-shadow:0 12px 30px -14px rgba(0,0,0,.5);font:400 10px var(--p-sans,sans-serif);letter-spacing:.12em;text-transform:uppercase}' +
      '.lz-colors[hidden],body.panel-open .lz-colors,body.viewer-open .lz-colors,body.sheet-open .lz-colors{display:none !important}' +
      '.lz-colors span{opacity:.8;margin-right:2px}' +
      '.lz-colors button{width:26px;height:26px;padding:0;border-radius:50%;border:2px solid rgba(255,255,255,.6);cursor:pointer}' +
      '.lz-colors button[aria-pressed="true"]{outline:2px solid currentColor;outline-offset:2px}' +
      '.lz-colors button.lz-photo{width:auto;height:28px;margin-left:4px;padding:0 12px;border-radius:100px;border:1px solid rgba(255,255,255,.45);background:transparent;color:inherit;font:inherit;letter-spacing:.1em;outline:0}' +
      '.lz-colors button.lz-photo[aria-pressed="true"]{background:var(--p-bg);color:var(--p-ink)}';
    document.head.appendChild(css0);
    document.addEventListener('DOMContentLoaded', function () {
      var bar = document.querySelector('.demo-bar'); if (!bar) return;
      var g = document.createElement('div'); g.className = 'lz-colors'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', LANG === 'en' ? 'Design colors' : 'Colores del diseño');
      if (themes.length > 1) g.innerHTML = '<span aria-hidden="true">' + (LANG === 'en' ? 'Color' : 'Color') + '</span>';
      var cur = themes.some(function (x) { return x.id === start; }) ? start : themes[0].id;
      if (themes.length > 1) themes.forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.style.background = t.sw; b.title = t[LANG];
        b.setAttribute('aria-label', t[LANG]); b.setAttribute('aria-pressed', String(t.id === cur));
        b.addEventListener('click', function () { applyTheme(t.id); g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
        g.appendChild(b);
      });
      if (TPL === 'moderno' || TPL === 'noir') {
        // Moderno y Noir: fotos en blanco y negro o con sus colores originales.
        var pb = document.createElement('button'); pb.type = 'button'; pb.className = 'lz-photo';
        pb.textContent = LANG === 'en' ? 'Color photos' : 'Fotos a color'; pb.setAttribute('aria-pressed', String(photoColor));
        pb.addEventListener('click', function () { photoColor = !photoColor; html.classList.toggle('lz-photo-color', photoColor); pb.setAttribute('aria-pressed', String(photoColor)); });
        g.appendChild(pb);
      }
      if (TPL === 'glicina') {
        var nb = document.createElement('button'); nb.type = 'button'; nb.className = 'lz-photo'; if (themes.length < 2) nb.style.marginLeft = '0';
        nb.textContent = LANG === 'en' ? 'No photos' : 'Sin fotos'; nb.setAttribute('aria-pressed', String(noPhotos));
        nb.addEventListener('click', function () { noPhotos = !noPhotos; html.classList.toggle('lz-no-photos', noPhotos); nb.setAttribute('aria-pressed', String(noPhotos)); });
        g.appendChild(nb);
      }
      // Se ve y se oculta junto con la barra de la demo (que aparece al abrir la invitación).
      var sync = function () { g.hidden = bar.hidden || getComputedStyle(bar).display === 'none'; };
      new MutationObserver(sync).observe(bar, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
      document.body.appendChild(g); sync();
    });
    return;
  }
  html.classList.add('lz-content', 'lz-' + MODE);

  var css = document.createElement('style');
  css.textContent =
    '.demo-bar{display:none !important}.lz-off{display:none !important}.lz-editor .lz-ph{opacity:.42}' +
    '.lz-seal{display:inline-flex !important;align-items:center;justify-content:center;font-family:Georgia,"Times New Roman",serif !important;font-style:normal !important;line-height:1 !important;letter-spacing:0 !important;white-space:nowrap;color:inherit}' +
    '.lz-seal *{font:inherit !important;color:inherit !important}' +
    '.lz-seal i{font-style:italic !important;font-size:.7em !important;margin:0 .04em}' +
    '.lz-seal-stack{flex-direction:column}.lz-seal-stack hr{width:1.1em;height:1px;border:0;background:currentColor;margin:.1em 0}' +
    '.lz-seal-ring{width:2.3em;height:2.3em;border-radius:50%;border:1px solid currentColor;font-style:italic !important}' +
    '.lz-seal img{width:100%;height:100%;object-fit:contain}' +
    '.mo-seal>.lz-seal{font-size:20px}' +
    '.mo-seal .lz-seal,.lz-seal-over .lz-seal{font-family:"Instrument Serif",Georgia,serif !important}' +
    '.lz-seal-over{display:flex;align-items:center;justify-content:center;position:absolute;left:24%;top:24%;width:52%;height:52%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#D8AE76,#A8743E 70%);color:#FFF4DF;box-shadow:inset 0 0 0 2px #8C5E2C55;font-size:calc(var(--ss,160px) * .2) !important;pointer-events:none}' +
    '.lz-seal-over.is-img{background:none;box-shadow:none}' +
    '.venue-card [data-lz-f="time"]:not(:empty)::before{content:" · "}';
  document.head.appendChild(css);

  function read() {
    try { var v = KEY && localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  var C = read() || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var has = function (v) { return v != null && String(v).trim() !== ''; };
  var init = function (s) { return (String(s || '').trim().charAt(0) || '').toUpperCase(); };
  function dateObj(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmtDate(v, pat) {
    var d = dateObj(v); if (!d) return null;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var M = d.toLocaleDateString(LANG, { month: 'long' }), W = d.toLocaleDateString(LANG, { weekday: 'long' });
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    return pat.replace(/\{(\w+)\}/g, function (_, t) {
      return { d: d.getDate(), dd: pad(d.getDate()), mm: pad(d.getMonth() + 1), M: M, Mc: cap(M), MU: M.toUpperCase(), w: W, W: cap(W), Y: d.getFullYear(), YY: String(d.getFullYear()).slice(2) }[t];
    });
  }
  function fmtTime(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); if (!m) return t || '';
    var d = new Date(2000, 0, 1, +m[1], +m[2]);
    try { return d.toLocaleTimeString(LANG === 'en' ? 'en-US' : 'es', { hour: 'numeric', minute: '2-digit' }); } catch (e) { return t; }
  }
  function splitPlace(p) {
    p = String(p || '');
    var i = p.search(/\s[·\-–—]\s|,|\n/);
    return i < 0 ? [p.trim(), ''] : [p.slice(0, i).trim(), p.slice(i).replace(/^[\s·\-–—,]+/, '').trim()];
  }
  // Solo enlaces de Google Maps (los que da el botón Compartir); cualquier otro se ignora.
  function isMapsUrl(u) {
    try { var x = new URL(u); return x.protocol === 'https:' && (/(^|\.)goo\.gl$/.test(x.hostname) || x.hostname === 'g.co' || (/(^|\.)google\.[a-z.]+$/.test(x.hostname) && (/^\/maps/.test(x.pathname) || /^maps\./.test(x.hostname)))); } catch (e) { return false; }
  }
  function sealHTML(c) {
    var i1 = esc(init(c.n1)), i2 = esc(init(c.n2));
    if (c.sealMode === 'text') return has(c.sealText) ? '<span class="lz-seal" style="font-size:' + (c.sealText.length > 6 ? '.55em' : c.sealText.length > 4 ? '.7em' : '1em') + '">' + esc(c.sealText) + '</span>' : null;
    if (c.mono === 'custom' && c.monoImg) return '<span class="lz-seal" style="width:80%;height:80%"><img src="' + esc(c.monoImg) + '" alt=""></span>';
    if (!i1 && !i2) return null;
    if (c.mono === 'stack') return '<span class="lz-seal lz-seal-stack" style="font-size:.8em"><span>' + i1 + '</span><hr><span>' + i2 + '</span></span>';
    if (c.mono === 'ring') return '<span class="lz-seal lz-seal-ring" style="font-size:.8em">' + i1 + i2 + '</span>';
    return '<span class="lz-seal">' + i1 + '<i>&amp;</i>' + i2 + '</span>';
  }
  /* Música: canción de la biblioteca (ruta) o MP3 subido, que el editor guarda en IndexedDB ('lazo-media'). */
  function readFile(key) {
    return new Promise(function (ok) {
      try {
        var r = indexedDB.open('lazo-media', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('files'); };
        r.onsuccess = function () { try { var g = r.result.transaction('files').objectStore('files').get(key); g.onsuccess = function () { ok(g.result || null); }; g.onerror = function () { ok(null); }; } catch (e) { ok(null); } };
        r.onerror = function () { ok(null); };
      } catch (e) { ok(null); }
    });
  }
  var musicKey = '', musicUrl = '';
  function applyMusic(c) {
    var M = window.LazoMusic; if (!M || !M.setSrc) return;
    var k = [c.musicOn, c.musicSource, c.musicTrackSrc, c.musicFileName, c.musicFileSize].join('|');
    if (k === musicKey) return; musicKey = k;
    if (c.musicOn === false) return;
    if (c.musicSource === 'upload' && c.musicFileName) {
      readFile(KEY + ':music').then(function (blob) { if (!blob) return; if (musicUrl) URL.revokeObjectURL(musicUrl); musicUrl = URL.createObjectURL(blob); M.setSrc(musicUrl); });
    } else if (c.musicTrackSrc) M.setSrc(c.musicTrackSrc);
  }

  function photos(c) { var l = []; if (has(c.cover)) l.push(c.cover); (c.gallery || []).forEach(function (g) { if (has(g)) l.push(g); }); return l; }
  function setText(el, v) {
    if (el._lz === undefined) el._lz = el.innerHTML;
    if (has(v)) { el.textContent = v; el.style.whiteSpace = /\n/.test(v) ? 'pre-line' : ''; el.classList.remove('lz-ph', 'lz-off'); }
    else if (el.hasAttribute('data-lz-keep')) { el.innerHTML = el._lz; el.style.whiteSpace = ''; el.classList.remove('lz-ph', 'lz-off'); } // vacío: el texto del diseño
    else { el.innerHTML = el._lz; el.style.whiteSpace = ''; el.classList.toggle('lz-off', MODE === 'vista'); el.classList.toggle('lz-ph', MODE !== 'vista'); }
  }
  function fill(item, data) {
    var els = [].slice.call(item.querySelectorAll('[data-lz-f]'));
    if (item.hasAttribute('data-lz-f')) els.unshift(item);
    els.forEach(function (el) {
      var f = el.getAttribute('data-lz-f'), v = data[f];
      if (f === 'map') { if (has(data.mapUrl) || has(data.mapQuery)) { el.href = data.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(data.mapQuery); el.target = '_blank'; el.rel = 'noopener'; el.classList.remove('lz-off'); } else el.classList.add('lz-off'); return; }
      if (f === 'img') { if (has(v)) { el.src = v; el.removeAttribute('srcset'); if(el.hasAttribute('data-full-src'))el.setAttribute('data-full-src',v); } return; }
      if (f === 'hide') { el.classList.add('lz-off'); return; }
      if (el._lz === undefined) el._lz = el.innerHTML;
      if (has(v)) { el.textContent = v; el.classList.remove('lz-off'); }
      else if (data._keepEmpty) el.innerHTML = el._lz;
      else { el.textContent = ''; el.classList.add('lz-off'); }
    });
  }
  function renderList(box, rows) {
    if (!box._lzTpl) {
      var items = [].slice.call(box.querySelectorAll(':scope > [data-lz-item]'));
      if (!items.length) return;
      box._lzTpl = items[0].cloneNode(true);
      box._lzMark = document.createComment('lz');
      box.insertBefore(box._lzMark, items[0]);
      items.forEach(function (n) { n.remove(); });
    }
    box.querySelectorAll(':scope > [data-lz-item]').forEach(function (n) { n.remove(); });
    rows.forEach(function (r) { var n = box._lzTpl.cloneNode(true); fill(n, r); box.insertBefore(n, box._lzMark); });
    var sec = box.closest('[data-lz-hide-empty]');
    if (sec) sec.classList.toggle('lz-off', !rows.length);
    box.dispatchEvent(new CustomEvent('lz-render', { bubbles: true }));
  }

  function apply(c) {
    C = c || C || {};
    var c0 = C, ph = photos(c0), evs = c0.events || [];
    window.LZ_GALLERY = Array.isArray(c0.gallery) ? c0.gallery.filter(has).slice(0,12) : null;
    // Evento elegido en el editor para la cuenta regresiva (si no hay, el primero).
    var cdEv = evs.filter(function (e) { return e.id === c0.countdownId; })[0] || evs[0];
    var v = {
      n1: c0.n1, n2: c0.n2, i1: init(c0.n1), i2: init(c0.n2), city: c0.city, msg: c0.msg, envIntro: c0.envIntro, envClosing: c0.envClosing, countdownNote: c0.countdownNote,
      storyTitle: c0.storyTitle, story: c0.story, quote: c0.quote, quoteAuthor: c0.quoteAuthor,
      dressCode: c0.dressCode, dressNotes: c0.dressNotes, dressColors: c0.dressColors,
      travelIntro: c0.travelIntro, hotel: c0.hotel, hotelAddress: c0.hotelAddress, hotelCode: c0.hotelCode, hotelNotes: c0.hotelNotes || c0.travelNotes,
      airport: c0.airport, transport: c0.transport, guideFood: c0.guideFood, guideCulture: c0.guideCulture, guidePlans: c0.guidePlans,
      mainTime: evs[0] ? fmtTime(evs[0].time) : '', mainName: evs[0] ? evs[0].name : '',
      rsvpMsg: c0.rsvpMsg, time0: cdEv ? fmtTime(cdEv.time) : '', cdName: cdEv ? cdEv.name : ''
    };
    var filled = function (keys) { return keys.split(/\s+/).some(function (k) { return has(k in v ? v[k] : c0[k]); }); };
    document.querySelectorAll('[data-lz-if]').forEach(function (el) { el.hidden = !filled(el.getAttribute('data-lz-if')); });
    document.querySelectorAll('[data-lz-group]').forEach(function (el) { el.classList.toggle('lz-off', MODE === 'vista' && !filled(el.getAttribute('data-lz-group'))); });
    document.querySelectorAll('[data-lz]').forEach(function (el) { setText(el, v[el.getAttribute('data-lz')]); });
    document.querySelectorAll('[data-lz-mono]').forEach(function (el) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, t = [];
      while ((n = w.nextNode())) if (n.nodeValue.trim() && !/^[\s&—–·-]+$/.test(n.nodeValue)) t.push(n);
      t.forEach(function (x) { if (x._lz === undefined) x._lz = x.nodeValue; x.nodeValue = x._lz; });
      if (!v.i1 && !v.i2) return;
      if (t.length >= 2) { t[0].nodeValue = t[0]._lz.replace(/\S+/, v.i1); t[t.length - 1].nodeValue = t[t.length - 1]._lz.replace(/\S+(?=\s*$)/, v.i2); }
      else if (t.length === 1) t[0].nodeValue = t[0]._lz.replace(/^(\s*)\S+(.*?)\S+(\s*)$/, '$1' + v.i1 + '$2' + v.i2 + '$3');
    });
    document.querySelectorAll('[data-lz-date]').forEach(function (el) {
      if (el._lz === undefined) el._lz = el.innerHTML;
      var t = fmtDate(c0[el.getAttribute('data-lz-from') || 'date'], el.getAttribute('data-lz-date'));
      if (t) el.textContent = t; else el.innerHTML = el._lz;
    });
    document.querySelectorAll('[data-lz-src]').forEach(function (el) {
      if (el._lz === undefined) el._lz = el.getAttribute('src');
      var n = +(el.getAttribute('data-lz-src').split(':')[1] || 0);
      el.removeAttribute('srcset');
      if (el.hasAttribute('data-full-src')) { if(el._lzFull === undefined)el._lzFull=el.getAttribute('data-full-src');el.setAttribute('data-full-src',ph.length?ph[n % ph.length]:el._lzFull); }
      el.src = ph.length ? ph[n % ph.length] : el._lz;
    });
    document.querySelectorAll('[data-lz-href]').forEach(function (el) {
      var u = c0[el.getAttribute('data-lz-href')];
      if (/^https?:\/\//.test(u || '')) { el.href = u; el.target = '_blank'; el.rel = 'noopener'; }
    });
    document.querySelectorAll('[data-lz-show]').forEach(function (el) {
      var k = el.getAttribute('data-lz-show');
      el.classList.toggle('lz-off', c0[k] === false);
    });
    document.querySelectorAll('[data-lz-seal]').forEach(function (el) {
      if (el._lz === undefined) el._lz = el.innerHTML;
      var s = sealHTML(c0);
      el.innerHTML = s || el._lz;
      if (el.classList.contains('lz-seal-over')) { el.classList.toggle('lz-off', !s); el.classList.toggle('is-img', c0.sealMode !== 'text' && c0.mono === 'custom' && !!c0.monoImg); }
    });
    document.querySelectorAll('[data-lz-list]').forEach(function (box) {
      var k = box.getAttribute('data-lz-list'), rows;
      if (k === 'gallery') rows = (c0.gallery || []).filter(has).map(function (g) { return { img: g, _keepEmpty: true }; });
      else if (k === 'events') rows = evs.map(function (e) {
        // Lugar y dirección van en campos separados; las invitaciones antiguas los tenían juntos ("Lugar · dirección").
        var p = e.address === undefined ? splitPlace(e.place) : [e.place || '', e.address || ''];
        return { icon: e.icon || 'auto', name: e.name, time: fmtTime(e.time), place: p[0], address: p[1], mapUrl: isMapsUrl(e.mapUrl) ? e.mapUrl : '', mapQuery: p.filter(has).length ? p.concat(c0.city || '').filter(has).join(', ') : '',
          mapText: p[1] || (has(p[0]) ? (LANG === 'en' ? 'Directions' : 'Cómo llegar') : '') };
      });
      else if (k === 'faqs') rows = (c0.faqs || []).map(function (f) { return { q: f.q, a: f.a }; });
      else return;
      if (k === 'gallery' && !rows.length) return;
      renderList(box, rows);
    });
    applyTheme(c0.pal, c0.palCustom);
    html.classList.toggle('lz-photo-color', (TPL === 'moderno' || TPL === 'noir' || TPL === 'corazones') && c0.photoBW === false);
    html.classList.toggle('lz-no-photos', TPL === 'glicina' && c0.photosOn === false);
    document.dispatchEvent(new CustomEvent('lz-gallery-change'));
    // Cuenta regresiva: las plantillas leen window.LZ_T en cada segundo.
    var d = dateObj(c0.date);
    if (d) {
      var zone = c0.timeZone || (TPL === 'corazones' ? 'America/Mexico_City' : '');
      if (zone) window.LZ_T = window.LazoTime.target(c0.date, cdEv && cdEv.time || '00:00', zone);
      else { var m = /^(\d{1,2}):(\d{2})$/.exec(cdEv && cdEv.time || ''); if (m) d.setHours(+m[1], +m[2]); window.LZ_T = d.getTime(); }
    }
    if (!d && TPL === 'corazones') window.LZ_T = NaN;
    if (window.LazoMusic && c0.musicOn === false) { window.LazoMusic.play = function () {}; var mb = document.querySelector('.lz-music'); if (mb) mb.classList.add('lz-off'); }
    applyMusic(c0);
    document.dispatchEvent(new CustomEvent('lz-content-applied', { detail: c0 }));
  }

  /* Navegación desde el editor: cada plantilla define window.LzTemplate = { open(), envelope(), scroll(el) }. */
  function goto(sec, now) {
    var T = window.LzTemplate; if (!T) return;
    if (sec === 'apertura') { T.envelope(); return; }
    T.open();
    var el = document.querySelector('[data-lz-anchor~="' + sec + '"]') || document.querySelector('[data-lz-anchor~="portada"]');
    if (el) {
      setTimeout(function () { T.scroll(el, now); }, 60);
      // Las fotos cargan después y mueven la página: se corrige la posición cuando ya están.
      setTimeout(function () { T.scroll(el, true); }, 900);
    }
  }

  window.LazoContent = { apply: apply, goto: goto, current: function () { return C; } };
  apply(C);
  // Lo que todavía no estaba en el DOM (p. ej. el botón de música) se ajusta al terminar de cargar.
  document.addEventListener('DOMContentLoaded', function () {
    apply(C);
    if (MODE === 'editor') { var s = q.get('sec'); if (s) goto(s, true); }
  });
  // Algunas plantillas reajustan el scroll al terminar de cargar fotos y fuentes: se repite al final.
  var asked = false; // si el editor ya pidió una sección, no se vuelve a la de la URL inicial
  window.addEventListener('load', function () { if (MODE === 'editor' && !asked) { var s = q.get('sec'); if (s) setTimeout(function () { if (!asked) goto(s, true); }, 50); } });
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || typeof e.data !== 'object') return;
    if (e.data.lz === 'content') apply(e.data.content);
    else if (e.data.lz === 'goto') { asked = true; goto(e.data.sec); }
  });
})();
