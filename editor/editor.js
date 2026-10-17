/* Editor de invitaciones y pago de complementos (Lazo).
   El idioma sale de <html lang="…"> ('es' o 'en') y la vista de <div id="lazo-editor" data-view="editor|checkout">.
   No hay backend: el contenido y el carrito se guardan en localStorage (si el navegador lo permite).
   Precios: se dejan los marcadores [Precio], [$] y [Total] igual que en el resto de la tienda.
   Rutas: /editor/ y /en/editor/ (editor), /editor/pago/ y /en/editor/pago/ (pago).
   Atajos: /editor/#musica abre una sección o un complemento, /editor/#complementos abre el panel,
   /editor/?diseno=moderno (o ?design=) elige el diseño. */
(function () {
  'use strict';
  var root = document.getElementById('lazo-editor');
  if (!root) return;
  var LANG = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var BASE = LANG === 'en' ? '/en' : '';
  var VIEW = root.getAttribute('data-view') || 'editor';
  // Las claves dependen de la cuenta y del diseño: las fija gate() (ver editor/auth.js).
  var KEY = '', CART_KEY = '', AUTH = window.LazoAuth;

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  function load(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  /* ---------- Textos ---------- */
  var STR = {
    es: {
      weddingOf: 'Boda de', designLbl: 'Diseño', myInv: 'Mis invitaciones',
      gateT: function (d) { return 'Aún no tienes el diseño ' + d; }, gateP: 'Para editarlo, primero cómpralo. Las invitaciones que ya compraste están en tu cuenta.', gateBuy: 'Comprar este diseño',
      palFixed: function (d) { return 'Los colores vienen con el diseño ' + d + '.'; },
      saved: 'Cambios guardados', saving: 'Guardando…', saveFail: 'No se pudo guardar',
      saveFailLong: 'No pudimos guardar en este navegador. Si subiste muchas fotos, prueba con menos o más ligeras.',
      savedShort: 'guardado', savingShort: 'guardando…',
      addons: 'Complementos', guest: 'Ver como invitado', publish: 'Publicar', menu: 'Secciones', closeMenu: 'Cerrar secciones',
      yourInv: 'Tu invitación', ready: function (n, t) { return n + ' de ' + t + ' secciones listas'; },
      hidden: 'Oculta', done: 'Lista', seeAll: 'Ver todos', packsFrom: 'Paquetes · desde [Precio]', packsTitle: 'Ahorra combinando complementos', seePacks: 'Ver paquetes',
      section: 'Sección', optional: 'Opcional', inCart: 'En carrito', inCartRemove: 'En el carrito · Quitar', add: 'Añadir', remove: 'Quitar',
      addPrice: 'Añadir · [$]', addToInv: 'Añadir a mi invitación', seeAddon: 'Ver complemento', seePack: 'Ver paquete',
      edit: 'Editar', preview: 'Vista previa', mobile: 'Móvil', desktop: 'Escritorio', device: 'Dispositivo', modeLbl: 'Modo',
      viewingAs: 'Viendo como: Familia Rodríguez · 4 lugares', prev: 'Sección anterior', next: 'Siguiente', stepsLbl: 'Navegación entre secciones',
      sec: {
        portada: ['Portada', 'Lo primero que verán tus invitados al abrir el sobre. Los cambios aparecen al instante en la vista previa.'],
        apertura: ['Apertura y sello', 'Lo que tus invitados tocan para abrir la invitación.'],
        historia: ['Nuestra historia', 'Cuenta cómo se conocieron y sube las fotos que quieras mostrar.'],
        itinerario: ['Itinerario', 'Añade los eventos de tu boda en el orden en que suceden. Cada uno lleva su hora, lugar y mapa.'],
        faq: ['Preguntas frecuentes', 'Código de vestimenta, niños, regalos… Lo que más te van a preguntar.'],
        musica: ['Música de fondo', 'Su canción suena cuando se abre la invitación.'],
        viaje: ['Viaje y hospedaje', 'Hoteles y planes para quienes vienen de fuera. Si todos tus invitados son locales, puedes ocultarla.'],
        rsvp: ['RSVP', 'Sí o no por invitado, más una nota para los novios.'],
        invitados: ['Invitados', 'Tu lista de invitaciones: cada una tendrá su enlace único y sus personas. Súbela desde un archivo o créala aquí.']
      },
      n1: 'Primer nombre', n2: 'Segundo nombre', date: 'Fecha de la boda', city: 'Ciudad', cityPh: 'Ciudad o lugar',
      cover: 'Foto de portada', coverAlt: 'Foto de portada actual', drop: 'Arrastra una foto o elige un archivo', dropHint: 'JPG o PNG, vertical se ve mejor en el móvil',
      msg: 'Mensaje de bienvenida', msgPh: 'Unas palabras para recibir a tus invitados', palette: 'Paleta',
      domainK: 'Complemento · Dominio propio', domainT: function (d) { return 'Comparte ' + d + ' en vez de un enlace de Lazo'; },
      effectNote: function (d) { return 'El efecto viene con el diseño ' + d + '. Para otro efecto, cambia de diseño.'; },
      sealQ: '¿Qué lleva el sello?', sealGroup: 'Contenido del sello', text: 'Texto', mono: 'Monograma', sealText: 'Texto del sello', upTo8: 'Hasta 8 caracteres.',
      withInitials: 'Crear con sus iniciales', monoGroup: 'Estilo del monograma', amp: 'Con &', stack: 'Apiladas', ring: 'En marco',
      upMono: 'O sube tu propio monograma', upMonoHint: 'SVG o PNG con fondo transparente', yourMono: 'Tu monograma', useIt: 'Usar este', inUse: 'En uso', delMono: 'Quitar monograma',
      greeting: 'Saludo en la carta', greetingHint: '{apellido} se reemplaza con el nombre de cada familia.', token: '{apellido}',
      storyTitle: 'Título', story: 'Su historia', storyPh: 'Escribe aquí cómo se conocieron, su primera cita o la propuesta.',
      gallery: 'Galería', galCount: function (n, touch) { return n + ' de 12 fotos · ' + (touch ? 'ordénalas con las flechas' : 'arrastra para ordenar'); }, upPhotos: 'Subir fotos',
      photoN: function (i) { return 'Foto ' + i; }, movePrev: 'Mover antes', moveNext: 'Mover después', delPhoto: 'Quitar foto', galFull: 'Llegaste a 12 fotos.',
      galK: 'Complemento · Galería compartida', galT: '¿Y las fotos que tomen tus invitados?', galS: 'Que las suban a este mismo álbum, sin grupos de WhatsApp. [$]',
      event: 'Evento', eventPh: 'Nombre del evento', time: 'Hora', place: 'Lugar', placePh: 'Nombre del lugar', address: 'Dirección', addressPh: 'Calle, número y ciudad',
      cdUse: 'Cuenta regresiva hasta este evento', cdHint: 'Marca el evento que usa la cuenta regresiva: cuenta hasta la fecha de la boda a la hora de ese evento.',
      mapUrl: 'Enlace de Google Maps (opcional)', mapUrlPh: 'https://maps.app.goo.gl/…', mapsHint: 'Para cada lugar puedes pegar su enlace de Google Maps (en Google Maps: Compartir → Copiar enlace). Si no lo pones, el botón "Cómo llegar" busca el lugar, la dirección y la ciudad.',
      mapUrlBad: 'Ese enlace no es de Google Maps: se usará la búsqueda por lugar y dirección.', showMap: 'Ver en el mapa', hideMap: 'Ocultar mapa', searchMaps: 'Buscar en Google Maps', mapOf: function (n) { return 'Mapa: ' + n; },
      needPlace: 'Escribe primero el lugar o la dirección.',
      cityHint: 'También se usa para encontrar los lugares del itinerario en Google Maps.',
      countdownNote: 'Frase de la cuenta regresiva', countdownNotePh: 'Cada vez falta menos para celebrar juntos.',
      quote: 'Una frase o cita (opcional)', quotePh: 'Una frase que los represente', quoteAuthor: 'Autor de la frase', quoteAuthorPh: 'Quién la dijo',
      dressK: 'Código de vestimenta', dressCode: 'Estilo', dressCodePh: 'Formal, cóctel, playa…', dressNotes: 'Recomendaciones', dressNotesPh: 'Lo que conviene saber para vestirse', dressColors: 'Colores reservados', dressColorsPh: 'p. ej. blanco y marfil',
      travelIntro: 'Introducción', travelIntroPh: 'Todo lo que necesitan para llegar y disfrutar esos días.', hotelK: 'Hotel', hotelAddress: 'Dirección del hotel', hotelCode: 'Código de reserva', hotelCodePh: 'p. ej. BODA-AL',
      gettingK: 'Cómo llegar', airport: 'Aeropuerto', airportPh: 'Aeropuerto más cercano y tiempo de viaje', transport: 'Transporte', transportPh: '¿Habrá transporte para los invitados?',
      guideK: 'Guía de la ciudad', guideFood: 'Restaurantes', guideCulture: 'Museos y cultura', guidePlans: 'Actividades', guidePh: 'Sus recomendaciones',
      emptyHidden: 'Lo que dejes vacío no aparece en la invitación.',
      moveUp: 'Mover arriba', moveDown: 'Mover abajo', delEvent: 'Eliminar evento', addEvent: 'Añadir evento', noEvents: 'Aún no hay eventos. Añade el primero con los atajos de abajo.',
      libroK: 'Complemento · Libro de visitas QR', libroT: 'Un QR en las mesas para que te dejen mensajes y fotos durante la fiesta.',
      q: 'Pregunta', qPh: 'Escribe la pregunta', a: 'Respuesta', aPh: 'Escribe la respuesta', delQ: 'Eliminar pregunta', addQ: '+ Añadir pregunta',
      faqCount: function (n) { return n + ' de 7 preguntas'; }, faqFull: 'Llegaste al máximo. Elimina una para añadir otra.', noFaq: 'Aún no hay preguntas.',
      pollK: 'Complemento · Encuestas', pollT: 'Y para las preguntas divertidas: ¿quién llorará más?',
      musicOn: 'Música al abrir la invitación', musicOnHint: 'Suena cuando el invitado toca el sello.', musicOffHint: 'Sin música: la invitación se abre en silencio.',
      musicSrc: '¿Qué música suena?', srcLibrary: 'Biblioteca Lazo', srcUpload: 'Subir mi canción', libraryK: 'Canciones de la biblioteca', libraryMore: 'Pronto habrá más canciones libres de derechos para elegir.',
      musicUpload: 'Sube tu canción', musicReplace: 'Cambiar por otra canción', musicHint: 'MP3, hasta 15 MB', musicLocal: 'Por ahora la canción se guarda en este navegador.', musicDel: 'Quitar la canción',
      badMp3: 'El archivo debe ser un MP3.', mp3Big: 'La canción pesa más de 15 MB. Prueba con una versión más ligera.', mp3Fail: 'No se pudo guardar la canción en este navegador.',
      shareK: 'Vista previa al compartir', shareHint: 'Lo que aparece al mandar el enlace por WhatsApp, Instagram o mensaje.',
      shareSobre: 'Invitación cerrada', shareFoto: 'Una foto de ustedes', sharePick: '¿Cuál foto?', shareCover: 'Portada',
      envK: 'Textos del sobre', envIntro: 'Frase del sobre', envClosing: 'Despedida', envClosingPh: 'p. ej. Con todo nuestro cariño',
      envKeepHint: 'Si lo dejas vacío, se usa el texto del diseño.', envOptHint: 'Opcional: aparece bajo el nombre de cada familia.',
      photoBW: 'Fotos en blanco y negro', photoBWOn: 'Como en el diseño original.', photoBWOff: 'Las fotos se ven con sus colores originales.',
      photosOn: 'Usar fotos', photosOnOn: 'La portada y la historia llevan sus fotos.', photosOnOff: 'Sin fotos: sus nombres van en el óvalo de encaje y la historia lleva una ventana del jardín.',
      cancel: 'Cancelar', gUpload: 'Subir archivo (CSV)', gManual: 'Crear a mano', gHow: '¿Cómo se arma el archivo?',
      gSteps: ['Descarga el archivo de ejemplo y ábrelo en Excel o Google Sheets.', 'Escribe una fila por persona. Las personas con el mismo nombre de invitación quedan juntas (por ejemplo, toda la Familia Rodríguez).', 'Guárdalo como CSV y súbelo aquí. Teléfono y correo son opcionales.'],
      gCols: ['Invitación', 'Persona', 'Teléfono', 'Correo'], gExample: 'Descargar el ejemplo (CSV)', gExampleFile: '/editor/invitados-ejemplo.csv',
      gDrop: 'Sube tu lista de invitados', gDropHint: 'Archivo CSV (Excel o Google Sheets)', gBadFile: 'El archivo debe ser un CSV. En Excel: Archivo → Guardar como → CSV.',
      gImported: function (n, p, sk) { return 'Importamos ' + n + (n === 1 ? ' invitación' : ' invitaciones') + ' con ' + p + (p === 1 ? ' persona' : ' personas') + (sk ? '. ' + sk + (sk === 1 ? ' fila sin nombre se omitió' : ' filas sin nombre se omitieron') : '') + '.'; },
      gNone: 'El archivo no tiene filas con invitación y persona.', gMerge: 'Si vuelves a subir un archivo, las invitaciones con el mismo nombre se combinan.',
      gManualHint: 'Crea cada invitación con el nombre que verán (por ejemplo, Familia Rodríguez) y las personas que incluye.',
      gList: 'Tu lista', gSummary: function (n, p) { return n + (n === 1 ? ' invitación' : ' invitaciones') + ' · ' + p + (p === 1 ? ' persona' : ' personas'); },
      gEmpty: 'Todavía no hay invitaciones.', gNew: '+ Nueva invitación', gName: 'Nombre de la invitación', gNamePh: 'p. ej. Familia Rodríguez', gPhone: 'Teléfono (WhatsApp)', gEmail: 'Correo',
      gPerson: 'Persona', gPersonPh: 'Nombre y apellido', gAddPerson: '+ Agregar persona', gDelPerson: 'Quitar a', gDelInv: 'Eliminar invitación', gClear: 'Borrar toda la lista', gClearAsk: '¿Borrar las {n} invitaciones de la lista?', gCleared: 'Lista borrada',
      gSearch: 'Buscar en la lista', gSearchPh: 'Nombre o familia…', gNoMatch: 'Nada coincide con la búsqueda.', gSeats: function (n) { return n + (n === 1 ? ' cupo' : ' cupos'); },
      palCustom: 'Personalizado', palCustomLbl: 'Elegir un color', palLight: 'Es un color claro: en la invitación lo oscurecemos un poco para que el texto se lea bien.',
      sample: 'Música de ejemplo', sampleHint: 'Así suena la música de fondo en las demos.', play: 'Escuchar', pause: 'Pausar',
      playlistK: 'Complemento · Playlist colaborativa', playlistT: 'Deja que tus invitados armen la playlist de la fiesta.',
      viajeShow: 'Mostrar esta sección en mi invitación', viajeOnHint: 'Visible para todos tus invitados.', viajeOffHint: 'Oculta: no aparecerá en tu invitación.',
      hotel: 'Hotel recomendado', hotelPh: 'Nombre del hotel', hotelLink: 'Enlace de reserva', hotelLinkPh: 'https://…',
      notes: 'Notas del hotel', notesPh: 'Tarifa especial, horarios de entrada y salida, contacto para reservar…',
      destK: 'Paquete · Boda destino', destT: 'Sitio bilingüe y dominio propio para tus invitados de fuera',
      deadline: 'Fecha límite para confirmar', rsvpMsg: 'Nota para los invitados', rsvpMsgPh: 'p. ej. Nuestra celebración es solo para adultos.',
      diet: 'Preguntar por alergias o dieta', dietHint: 'Cada invitado puede indicar lo que no come.',
      note: 'Permitir una nota para los novios', noteHint: 'Un espacio libre al final del formulario.', offHint: 'Desactivado.',
      capsulaK: 'Complemento · Cápsula de mensajes', capsulaT: 'Convierte las notas en una cápsula que se abre en su aniversario.',
      addonK: 'Complemento', inYourCart: 'en tu carrito', available: 'disponible', alsoIn: 'También viene en el paquete', oneTime: 'Pago único · se activa al momento',
      drawerSub: 'Añádelos ahora o cuando quieras, incluso después de publicar.', packsK: 'Paquetes', singlesK: 'Sueltos', saveP: 'Ahorras [$]',
      nAddons: function (n) { return n === 1 ? '1 complemento' : n + ' complementos'; }, pay: 'Pagar complementos', payNote: 'Pago único con tarjeta o PayPal · Precios en USD',
      close: 'Cerrar', closeAddons: 'Cerrar complementos', addedT: function (n) { return n + ': en el carrito'; }, removedT: function (n) { return n + ': fuera del carrito'; },
      invitedTo: 'están invitados a la boda de', forFamily: 'Para la familia García', famName: 'García', greetDefault: 'Querida familia García', tapSeal: 'Toca el sello para abrir', openInv: 'Abrir la invitación',
      days: 'días', hours: 'horas', mins: 'min', secs: 'seg', storyK: 'Nuestra historia', bigDay: 'El gran día', itinerary: 'Itinerario', seeMap: 'Ver mapa',
      faqK: 'Antes de la boda', faqH: 'Preguntas', musicK: 'Suena', travelK: 'Si vienes de fuera', travelH: 'Viaje y hospedaje', book: 'Reservar',
      rsvpK: 'Te esperamos', rsvpH: 'Confirma tu asistencia', rsvpBtn: 'Confirmar asistencia', rsvpBy: function (d) { return 'Antes del ' + d; },
      rsvpDemo: 'En la invitación publicada, aquí cada invitado confirma su asistencia.',
      guestTitle: 'Así la verá la familia Rodríguez', closeGuest: 'Volver al editor', replay: 'Ver la apertura otra vez',
      pubTitle: 'Publicar tu invitación', pubText: 'Todavía no se puede publicar desde aquí: falta conectar la cuenta y el pago de la plantilla. Tus cambios quedan guardados en este navegador.',
      pubPending: 'Secciones por completar:', pubAll: 'Todas las secciones están listas.', ok: 'Entendido',
      badFile: 'Ese archivo no es una imagen compatible.', badMono: 'El monograma debe ser SVG o PNG.',
      demoPlaylist: 'Así la ven tus invitados', songAsk: '¿Qué canción no puede faltar?', songAskPh: 'Tu canción', suggest: 'Sugerir',
      songs: [['La canción del primer baile', 'Sugerida por Familia García'], ['Una para cantar todos', 'Sugerida por Tía Marta'], ['La de cuando se conocieron', 'Sugerida por Daniel']],
      approve: 'Por aprobar',
      qrScan: 'Escanea y déjanos un mensaje', qrMsg: '¡Que vivan los novios! Gracias por la mejor fiesta.', qrBy: 'Tía Marta · 23:14',
      sealedUntil: 'Sellada hasta el', capsuleMsgs: [['Familia García', 'Se abre en su aniversario'], ['Daniel y Sofía', 'Se abre en su aniversario'], ['Tía Marta', 'Se abre en su aniversario']],
      pollMain: '¿Quién llorará más en la ceremonia?', moreIdeas: 'Más ideas',
      setupK: 'Déjalo listo', setupNote: 'Puedes prepararlo ahora: se activa en tu invitación cuando lo compres.',
      pollsTitle: 'Tus preguntas', pollQ: 'Pregunta', pollQPh: 'Escribe una pregunta divertida', pollOpts: 'Respuestas (separadas por comas)',
      pollOptsPh: function (a, b) { return 'Si lo dejas vacío: ' + a + ' o ' + b; }, delPoll: 'Eliminar pregunta', addPoll: '+ Escribir otra pregunta',
      pollIdeasK: 'Ideas para añadir', pollCount: function (n) { return n + ' de 6 preguntas'; }, pollFull: 'Llegaste a 6 preguntas. Elimina una para añadir otra.', noPolls: 'Aún no hay preguntas. Añade una idea o escribe la tuya.',
      reveal: '¿Cuándo ven los resultados?', revealParty: 'En la fiesta', revealVote: 'Al votar',
      revealPartyHint: 'Los resultados quedan en secreto hasta que ustedes los revelen en la fiesta.', revealVoteHint: 'Cada invitado ve cómo van las respuestas justo después de votar.',
      guestsSee: 'Así lo verán tus invitados', vote: 'Votar', secretTill: 'Resultados en la fiesta',
      capDate: 'Fecha de apertura', capDateHint: function (d) { return 'Si la dejas vacía, se abre en su primer aniversario' + (d ? ': ' + d : '') + '.'; },
      capPrompt: 'Lo que les piden a sus invitados', capPromptPh: 'Escríbenos algo para leer en nuestro primer aniversario.',
      capRsvp: 'Pedir el mensaje al confirmar asistencia', capRsvpOn: 'Aparece como un paso más del RSVP.', capRsvpOff: 'Tendrá su propio botón dentro de la invitación.', capWrite: 'Escribir mi mensaje',
      pollIdeas: ['¿Quién llegará tarde a la ceremonia?', '¿Quién será el último en la pista?', '¿Quién dijo «te quiero» primero?', '¿Cuántos minutos durará el discurso del padrino?'],
      galUploaded: 'Subidas por tus invitados', galShot: function (n) { return 'Foto de invitado ' + n; },
      biEs: 'Español', biEn: 'English', biEsT: 'Nos casamos', biEnT: 'We’re getting married', biEsMsg: 'y queremos celebrarlo contigo.', biEnMsg: 'and we want to celebrate with you.',
      // Pago
      back: 'Volver al editor', secure: 'Pago seguro', coH1: 'Suma a tu invitación',
      coLead: 'Se activan apenas pagues, en la misma invitación y con el mismo enlace que ya compartiste. No tienes que volver a enviarla.',
      method: 'Método de pago', card: 'Tarjeta', paypal: 'PayPal', cardName: 'Nombre en la tarjeta', cardNamePh: 'Como aparece en la tarjeta',
      cardNum: 'Número de tarjeta', exp: 'Vencimiento', expPh: 'MM / AA', cvc: 'CVC',
      paypalText: 'Al pagar te llevaremos a PayPal para terminar y volverás aquí con tus complementos activos.',
      order: 'Tu pedido', pack: 'Paquete', upsellTxt: function (n) { return 'Con estos ya tienes ' + n + ' de 7. Pásate a <strong>Todo incluido</strong> y ahorra [$].'; },
      change: 'Cambiar', total: 'Total', payBtn: 'Pagar y activar', payPaypal: 'Continuar con PayPal', payNote2: 'Pago único. Recibirás el recibo en tu correo.',
      notConnected: 'Los pagos todavía no están conectados, así que no se hizo ningún cargo. [Pendiente: enlace de pago]',
      empty: 'Tu carrito está vacío.', emptyCta: 'Elegir complementos', removeLine: 'Quitar del pedido:'
    },
    en: {
      weddingOf: 'Wedding of', designLbl: 'Design', myInv: 'My invitations',
      gateT: function (d) { return 'You don’t have the ' + d + ' design yet'; }, gateP: 'Buy it first to edit it. The invitations you already bought are in your account.', gateBuy: 'Buy this design',
      palFixed: function (d) { return 'The colors come with the ' + d + ' design.'; },
      saved: 'Changes saved', saving: 'Saving…', saveFail: 'Could not save',
      saveFailLong: 'We could not save in this browser. If you uploaded many photos, try fewer or lighter ones.',
      savedShort: 'saved', savingShort: 'saving…',
      addons: 'Add-ons', guest: 'View as guest', publish: 'Publish', menu: 'Sections', closeMenu: 'Close sections',
      yourInv: 'Your invitation', ready: function (n, t) { return n + ' of ' + t + ' sections ready'; },
      hidden: 'Hidden', done: 'Ready', seeAll: 'See all', packsFrom: 'Bundles · from [Precio]', packsTitle: 'Save by combining add-ons', seePacks: 'See bundles',
      section: 'Section', optional: 'Optional', inCart: 'In cart', inCartRemove: 'In cart · Remove', add: 'Add', remove: 'Remove',
      addPrice: 'Add · [$]', addToInv: 'Add to my invitation', seeAddon: 'See add-on', seePack: 'See bundle',
      edit: 'Edit', preview: 'Preview', mobile: 'Mobile', desktop: 'Desktop', device: 'Device', modeLbl: 'Mode',
      viewingAs: 'Viewing as: The Rodríguez Family · 4 seats', prev: 'Previous section', next: 'Next', stepsLbl: 'Section navigation',
      sec: {
        portada: ['Cover', 'The first thing your guests see when they open the envelope. Changes show up instantly in the preview.'],
        apertura: ['Opening and seal', 'What your guests tap to open the invitation.'],
        historia: ['Our story', 'Tell how you met and upload the photos you want to show.'],
        itinerario: ['Schedule', 'Add your wedding events in the order they happen. Each one has its time, place and map.'],
        faq: ['FAQ', 'Dress code, kids, gifts… What everyone will ask you.'],
        musica: ['Background music', 'Your song plays when the invitation opens.'],
        viaje: ['Travel and stay', 'Hotels and plans for out-of-town guests. If all your guests are local, you can hide it.'],
        rsvp: ['RSVP', 'Yes or no per guest, plus a note for the couple.'],
        invitados: ['Guests', 'Your invitation list: each one gets its own unique link and its guests. Upload it from a file or create it here.']
      },
      n1: 'First name', n2: 'Second name', date: 'Wedding date', city: 'City', cityPh: 'City or venue',
      cover: 'Cover photo', coverAlt: 'Current cover photo', drop: 'Drag a photo or choose a file', dropHint: 'JPG or PNG, portrait looks best on phones',
      msg: 'Welcome message', msgPh: 'A few words to welcome your guests', palette: 'Palette',
      domainK: 'Add-on · Custom domain', domainT: function (d) { return 'Share ' + d + ' instead of a Lazo link'; },
      effectNote: function (d) { return 'The effect comes with the ' + d + ' design. For a different effect, change your design.'; },
      sealQ: 'What goes on the seal?', sealGroup: 'Seal content', text: 'Text', mono: 'Monogram', sealText: 'Seal text', upTo8: 'Up to 8 characters.',
      withInitials: 'Make one with your initials', monoGroup: 'Monogram style', amp: 'With &', stack: 'Stacked', ring: 'Framed',
      upMono: 'Or upload your own monogram', upMonoHint: 'SVG or PNG with a transparent background', yourMono: 'Your monogram', useIt: 'Use this one', inUse: 'In use', delMono: 'Remove monogram',
      greeting: 'Greeting on the letter', greetingHint: '{surname} is replaced with each family’s name.', token: '{surname}',
      storyTitle: 'Title', story: 'Your story', storyPh: 'Write how you met, your first date or the proposal.',
      gallery: 'Gallery', galCount: function (n, touch) { return n + ' of 12 photos · ' + (touch ? 'use the arrows to reorder' : 'drag to reorder'); }, upPhotos: 'Upload photos',
      photoN: function (i) { return 'Photo ' + i; }, movePrev: 'Move earlier', moveNext: 'Move later', delPhoto: 'Remove photo', galFull: 'You reached 12 photos.',
      galK: 'Add-on · Shared gallery', galT: 'What about the photos your guests take?', galS: 'Let them upload to this same album, no group chats. [$]',
      event: 'Event', eventPh: 'Event name', time: 'Time', place: 'Venue', placePh: 'Venue name', address: 'Address', addressPh: 'Street, number and city',
      cdUse: 'Countdown to this event', cdHint: 'Check the event the countdown uses: it counts down to the wedding date at that event’s time.',
      mapUrl: 'Google Maps link (optional)', mapUrlPh: 'https://maps.app.goo.gl/…', mapsHint: 'For each venue you can paste its Google Maps link (in Google Maps: Share → Copy link). If you leave it empty, the "Directions" button searches the venue, address and city.',
      mapUrlBad: 'That isn’t a Google Maps link: the venue and address search will be used.', showMap: 'Show on map', hideMap: 'Hide map', searchMaps: 'Search Google Maps', mapOf: function (n) { return 'Map: ' + n; },
      needPlace: 'Type the venue or address first.',
      cityHint: 'Also used to find the schedule venues on Google Maps.',
      countdownNote: 'Countdown line', countdownNotePh: 'The countdown to celebrating together is on.',
      quote: 'A quote (optional)', quotePh: 'A line that represents you', quoteAuthor: 'Quote author', quoteAuthorPh: 'Who said it',
      dressK: 'Dress code', dressCode: 'Style', dressCodePh: 'Formal, cocktail, beach…', dressNotes: 'Recommendations', dressNotesPh: 'What guests should know about what to wear', dressColors: 'Reserved colors', dressColorsPh: 'e.g. white and ivory',
      travelIntro: 'Introduction', travelIntroPh: 'Everything you need to get here and enjoy those days.', hotelK: 'Hotel', hotelAddress: 'Hotel address', hotelCode: 'Booking code', hotelCodePh: 'e.g. WEDDING-AL',
      gettingK: 'Getting there', airport: 'Airport', airportPh: 'Nearest airport and travel time', transport: 'Transportation', transportPh: 'Will there be transportation for guests?',
      guideK: 'City guide', guideFood: 'Restaurants', guideCulture: 'Museums & culture', guidePlans: 'Activities', guidePh: 'Your recommendations',
      emptyHidden: 'Anything you leave empty won’t appear in the invitation.',
      moveUp: 'Move up', moveDown: 'Move down', delEvent: 'Delete event', addEvent: 'Add event', noEvents: 'No events yet. Add the first one with the shortcuts below.',
      libroK: 'Add-on · QR guestbook', libroT: 'A QR code on the tables so guests leave messages and photos during the party.',
      q: 'Question', qPh: 'Write the question', a: 'Answer', aPh: 'Write the answer', delQ: 'Delete question', addQ: '+ Add question',
      faqCount: function (n) { return n + ' of 7 questions'; }, faqFull: 'You reached the limit. Delete one to add another.', noFaq: 'No questions yet.',
      pollK: 'Add-on · Polls', pollT: 'And for the fun questions: who will cry the most?',
      musicOn: 'Music when the invitation opens', musicOnHint: 'Plays when the guest taps the seal.', musicOffHint: 'No music: the invitation opens in silence.',
      musicSrc: 'What music plays?', srcLibrary: 'Lazo library', srcUpload: 'Upload my song', libraryK: 'Library songs', libraryMore: 'More royalty-free songs coming soon.',
      musicUpload: 'Upload your song', musicReplace: 'Replace with another song', musicHint: 'MP3, up to 15 MB', musicLocal: 'For now the song is stored in this browser.', musicDel: 'Remove the song',
      badMp3: 'The file must be an MP3.', mp3Big: 'The song is larger than 15 MB. Try a lighter version.', mp3Fail: 'Could not save the song in this browser.',
      shareK: 'Link preview', shareHint: 'What people see when you send the link on WhatsApp, Instagram or by text.',
      shareSobre: 'Closed invitation', shareFoto: 'A photo of you', sharePick: 'Which photo?', shareCover: 'Cover',
      envK: 'Envelope text', envIntro: 'Envelope line', envClosing: 'Sign-off', envClosingPh: 'e.g. With all our love',
      envKeepHint: 'Leave it empty to use the design’s text.', envOptHint: 'Optional: shown under each family’s name.',
      photoBW: 'Black-and-white photos', photoBWOn: 'As in the original design.', photoBWOff: 'Photos show their original colors.',
      photosOn: 'Use photos', photosOnOn: 'The cover and the story show your photos.', photosOnOff: 'No photos: your names go in the lace oval and the story shows a window onto the garden.',
      cancel: 'Cancel', gUpload: 'Upload file (CSV)', gManual: 'Create by hand', gHow: 'How do I build the file?',
      gSteps: ['Download the example file and open it in Excel or Google Sheets.', 'Write one row per guest. Guests with the same invitation name are grouped together (e.g. the whole Rodríguez family).', 'Save it as CSV and upload it here. Phone and email are optional.'],
      gCols: ['Invitation', 'Guest', 'Phone', 'Email'], gExample: 'Download the example (CSV)', gExampleFile: '/editor/guests-example.csv',
      gDrop: 'Upload your guest list', gDropHint: 'CSV file (Excel or Google Sheets)', gBadFile: 'The file must be a CSV. In Excel: File → Save As → CSV.',
      gImported: function (n, p, sk) { return 'Imported ' + n + (n === 1 ? ' invitation' : ' invitations') + ' with ' + p + (p === 1 ? ' guest' : ' guests') + (sk ? '. ' + sk + (sk === 1 ? ' row without a name was skipped' : ' rows without a name were skipped') : '') + '.'; },
      gNone: 'The file has no rows with an invitation and a guest.', gMerge: 'If you upload a file again, invitations with the same name are merged.',
      gManualHint: 'Create each invitation with the name guests will see (e.g. The Rodríguez Family) and the people it includes.',
      gList: 'Your list', gSummary: function (n, p) { return n + (n === 1 ? ' invitation' : ' invitations') + ' · ' + p + (p === 1 ? ' guest' : ' guests'); },
      gEmpty: 'No invitations yet.', gNew: '+ New invitation', gName: 'Invitation name', gNamePh: 'e.g. The Rodríguez Family', gPhone: 'Phone (WhatsApp)', gEmail: 'Email',
      gPerson: 'Guest', gPersonPh: 'Full name', gAddPerson: '+ Add guest', gDelPerson: 'Remove', gDelInv: 'Delete invitation', gClear: 'Clear the whole list', gClearAsk: 'Delete all {n} invitations from the list?', gCleared: 'List cleared',
      gSearch: 'Search the list', gSearchPh: 'Name or family…', gNoMatch: 'Nothing matches the search.', gSeats: function (n) { return n + (n === 1 ? ' seat' : ' seats'); },
      palCustom: 'Custom', palCustomLbl: 'Pick a color', palLight: 'It’s a light color: in the invitation we darken it a bit so text stays readable.',
      sample: 'Sample music', sampleHint: 'This is how background music sounds in the demos.', play: 'Listen', pause: 'Pause',
      playlistK: 'Add-on · Collaborative playlist', playlistT: 'Let your guests build the party playlist.',
      viajeShow: 'Show this section in my invitation', viajeOnHint: 'Visible to all your guests.', viajeOffHint: 'Hidden: it won’t appear in your invitation.',
      hotel: 'Recommended hotel', hotelPh: 'Hotel name', hotelLink: 'Booking link', hotelLinkPh: 'https://…',
      notes: 'Hotel notes', notesPh: 'Special rate, check-in and check-out times, booking contact…',
      destK: 'Bundle · Destination wedding', destT: 'Bilingual site and custom domain for your out-of-town guests',
      deadline: 'RSVP deadline', rsvpMsg: 'Note for guests', rsvpMsgPh: 'e.g. Our celebration is adults only.',
      diet: 'Ask about allergies or diet', dietHint: 'Each guest can tell you what they don’t eat.',
      note: 'Allow a note for the couple', noteHint: 'A free-text space at the end of the form.', offHint: 'Off.',
      capsulaK: 'Add-on · Message capsule', capsulaT: 'Turn the notes into a capsule that opens on your anniversary.',
      addonK: 'Add-on', inYourCart: 'in your cart', available: 'available', alsoIn: 'Also comes in the bundle', oneTime: 'One-time payment · activates instantly',
      drawerSub: 'Add them now or whenever you like, even after publishing.', packsK: 'Bundles', singlesK: 'Individual', saveP: 'Save [$]',
      nAddons: function (n) { return n === 1 ? '1 add-on' : n + ' add-ons'; }, pay: 'Pay for add-ons', payNote: 'One-time payment by card or PayPal · Prices in USD',
      close: 'Close', closeAddons: 'Close add-ons', addedT: function (n) { return n + ': added to cart'; }, removedT: function (n) { return n + ': removed from cart'; },
      invitedTo: 'you are invited to the wedding of', forFamily: 'For the García family', famName: 'García', greetDefault: 'Dear García family', tapSeal: 'Tap the seal to open', openInv: 'Open the invitation',
      days: 'days', hours: 'hours', mins: 'min', secs: 'sec', storyK: 'Our story', bigDay: 'The big day', itinerary: 'Schedule', seeMap: 'See map',
      faqK: 'Before the wedding', faqH: 'Questions', musicK: 'Now playing', travelK: 'Coming from out of town', travelH: 'Travel and stay', book: 'Book',
      rsvpK: 'We hope to see you', rsvpH: 'Confirm your attendance', rsvpBtn: 'RSVP', rsvpBy: function (d) { return 'By ' + d; },
      rsvpDemo: 'In the published invitation, each guest RSVPs here.',
      guestTitle: 'How the Rodríguez family will see it', closeGuest: 'Back to the editor', replay: 'Watch the opening again',
      pubTitle: 'Publish your invitation', pubText: 'Publishing from here isn’t available yet: the account and template payment still need to be connected. Your changes are saved in this browser.',
      pubPending: 'Sections to finish:', pubAll: 'All sections are ready.', ok: 'Got it',
      badFile: 'That file isn’t a supported image.', badMono: 'The monogram must be SVG or PNG.',
      demoPlaylist: 'What your guests see', songAsk: 'Which song can’t be missing?', songAskPh: 'Your song', suggest: 'Suggest',
      songs: [['Your first dance song', 'Suggested by the García family'], ['One everyone can sing', 'Suggested by Aunt Martha'], ['The one from when you met', 'Suggested by Daniel']],
      approve: 'To approve',
      qrScan: 'Scan and leave us a message', qrMsg: 'Cheers to the newlyweds! Thanks for the best party.', qrBy: 'Aunt Martha · 11:14 pm',
      sealedUntil: 'Sealed until', capsuleMsgs: [['The García family', 'Opens on your anniversary'], ['Daniel and Sofía', 'Opens on your anniversary'], ['Aunt Martha', 'Opens on your anniversary']],
      pollMain: 'Who will cry the most at the ceremony?', moreIdeas: 'More ideas',
      setupK: 'Get it ready', setupNote: 'You can set it up now: it turns on in your invitation once you buy it.',
      pollsTitle: 'Your questions', pollQ: 'Question', pollQPh: 'Write a fun question', pollOpts: 'Answers (separated by commas)',
      pollOptsPh: function (a, b) { return 'Leave empty for: ' + a + ' or ' + b; }, delPoll: 'Delete question', addPoll: '+ Write another question',
      pollIdeasK: 'Ideas to add', pollCount: function (n) { return n + ' of 6 questions'; }, pollFull: 'You reached 6 questions. Delete one to add another.', noPolls: 'No questions yet. Add an idea or write your own.',
      reveal: 'When do they see the results?', revealParty: 'At the party', revealVote: 'After voting',
      revealPartyHint: 'Results stay secret until you reveal them at the party.', revealVoteHint: 'Each guest sees how answers are going right after voting.',
      guestsSee: 'What your guests see', vote: 'Vote', secretTill: 'Results at the party',
      capDate: 'Opening date', capDateHint: function (d) { return 'Leave it empty and it opens on your first anniversary' + (d ? ': ' + d : '') + '.'; },
      capPrompt: 'What you ask your guests', capPromptPh: 'Write us something to read on our first anniversary.',
      capRsvp: 'Ask for the message when they RSVP', capRsvpOn: 'It shows up as one more step of the RSVP.', capRsvpOff: 'It gets its own button inside the invitation.', capWrite: 'Write my message',
      pollIdeas: ['Who will be late to the ceremony?', 'Who will be the last one on the dance floor?', 'Who said “I love you” first?', 'How many minutes will the best man’s speech last?'],
      galUploaded: 'Uploaded by your guests', galShot: function (n) { return 'Guest photo ' + n; },
      biEs: 'Español', biEn: 'English', biEsT: 'Nos casamos', biEnT: 'We’re getting married', biEsMsg: 'y queremos celebrarlo contigo.', biEnMsg: 'and we want to celebrate with you.',
      back: 'Back to the editor', secure: 'Secure payment', coH1: 'Add to your invitation',
      coLead: 'They activate as soon as you pay, in the same invitation and with the same link you already shared. No need to send it again.',
      method: 'Payment method', card: 'Card', paypal: 'PayPal', cardName: 'Name on card', cardNamePh: 'As it appears on the card',
      cardNum: 'Card number', exp: 'Expiry', expPh: 'MM / YY', cvc: 'CVC',
      paypalText: 'When you pay we’ll take you to PayPal to finish, and you’ll come back here with your add-ons active.',
      order: 'Your order', pack: 'Bundle', upsellTxt: function (n) { return 'With these you already have ' + n + ' of 7. Switch to <strong>All inclusive</strong> and save [$].'; },
      change: 'Switch', total: 'Total', payBtn: 'Pay and activate', payPaypal: 'Continue with PayPal', payNote2: 'One-time payment. You’ll get the receipt by email.',
      notConnected: 'Payments aren’t connected yet, so nothing was charged. [Pending: payment link]',
      empty: 'Your cart is empty.', emptyCta: 'Choose add-ons', removeLine: 'Remove from order:'
    }
  };
  var S = STR[LANG];

  var SECS = ['portada', 'apertura', 'historia', 'itinerario', 'faq', 'musica', 'viaje', 'rsvp', 'invitados'];
  var ADDON_IDS = ['playlist', 'libro', 'capsula', 'encuestas', 'galeria', 'bilingue', 'dominio'];
  var ADDON_TXT = {
    es: {
      playlist: ['Playlist colaborativa', 'Conectada a Spotify', 'Tus invitados sugieren canciones al confirmar y todo llega a una playlist de Spotify que ustedes controlan.', ['Sugerencias desde el RSVP', 'Ustedes aprueban cada canción', 'Lista lista para el DJ']],
      libro: ['Libro de visitas QR', 'Mensajes y fotos el día de la boda', 'Un código QR en las mesas abre un libro donde los invitados dejan mensajes y fotos durante la fiesta.', ['QR listo para imprimir', 'Mensajes con foto', 'Descarga en PDF']],
      capsula: ['Cápsula de mensajes', 'Se abre en su aniversario', 'Los invitados escriben mensajes que quedan sellados y se abren solos en su primer aniversario.', ['Mensajes sellados', 'Aviso el día del aniversario', 'Elige la fecha de apertura']],
      encuestas: ['Encuestas divertidas', '¿Quién llorará más? ¿Quién llegará tarde?', 'Preguntas para reírse antes de la boda: tus invitados votan desde su invitación y los resultados se revelan en la fiesta.', ['Ideas listas o escribe las tuyas', 'Votan desde su enlace', 'Revelen los resultados en la fiesta']],
      galeria: ['Galería compartida', 'Los invitados suben sus fotos', 'Todas las fotos de tus invitados en un solo álbum dentro de la invitación, sin grupos de WhatsApp.', ['Subida sin crear cuenta', 'Ustedes moderan', 'Descarga todo en un zip']],
      bilingue: ['Sitio bilingüe', 'Español e inglés', 'Tus invitados eligen el idioma y tú escribes cada texto en ambos, lado a lado en el editor.', ['Selector de idioma', 'Editor lado a lado', 'RSVP en ambos idiomas']],
      dominio: ['Dominio propio', 'p. ej. {d}', 'Tu invitación en tu propia dirección web en lugar de un enlace de Lazo.', ['Dominio incluido un año', 'Configuración automática', 'Enlaces por familia igual']]
    },
    en: {
      playlist: ['Collaborative playlist', 'Connected to Spotify', 'Guests suggest songs when they RSVP and everything lands in a Spotify playlist you control.', ['Suggestions from the RSVP', 'You approve every song', 'A list ready for the DJ']],
      libro: ['QR guestbook', 'Messages and photos on the day', 'A QR code on the tables opens a book where guests leave messages and photos during the party.', ['Print-ready QR', 'Messages with photos', 'PDF download']],
      capsula: ['Message capsule', 'Opens on your anniversary', 'Guests write messages that stay sealed and open by themselves on your first anniversary.', ['Sealed messages', 'Reminder on your anniversary', 'Pick the opening date']],
      encuestas: ['Fun polls', 'Who will cry the most? Who will be late?', 'Questions for a laugh before the wedding: guests vote from their invitation and the results are revealed at the party.', ['Ready-made ideas or write your own', 'They vote from their link', 'Reveal the results at the party']],
      galeria: ['Shared gallery', 'Guests upload their photos', 'All your guests’ photos in one album inside the invitation, no group chats needed.', ['Upload without an account', 'You moderate', 'Download everything as a zip']],
      bilingue: ['Bilingual site', 'English and Spanish', 'Guests choose the language and you write each text in both, side by side in the editor.', ['Language switcher', 'Side-by-side editor', 'RSVP in both languages']],
      dominio: ['Custom domain', 'e.g. {d}', 'Your invitation at your own web address instead of a Lazo link.', ['Domain included for a year', 'Automatic setup', 'Family links still work']]
    }
  }[LANG];
  var PACKS = [
    { id: 'todo', ids: ADDON_IDS.slice(), feat: true },
    { id: 'fiesta', ids: ['playlist', 'encuestas', 'libro'] },
    { id: 'recuerdos', ids: ['galeria', 'capsula'] },
    { id: 'destino', ids: ['bilingue', 'dominio'] }
  ];
  var PACK_TXT = {
    es: { todo: ['Todo incluido', 'Los 7 complementos'], fiesta: ['La fiesta', 'Playlist colaborativa, encuestas divertidas y libro de visitas QR'], recuerdos: ['Recuerdos', 'Galería compartida y cápsula de mensajes'], destino: ['Boda destino', 'Sitio bilingüe y dominio propio'] },
    en: { todo: ['All inclusive', 'All 7 add-ons'], fiesta: ['The party', 'Collaborative playlist, fun polls and QR guestbook'], recuerdos: ['Memories', 'Shared gallery and message capsule'], destino: ['Destination wedding', 'Bilingual site and custom domain'] }
  }[LANG];
  var PRESETS = {
    es: ['Ceremonia civil', 'Ceremonia religiosa', 'Cóctel', 'Recepción', 'Tornaboda', 'Brunch del día siguiente', 'Otro evento'],
    en: ['Civil ceremony', 'Religious ceremony', 'Cocktail hour', 'Reception', 'After-party', 'Next-day brunch', 'Other event']
  }[LANG];
  // Biblioteca de música libre de derechos. Para añadir una canción: subir el MP3 a /assets/musica/ y agregar una línea.
  var MUSIC_LIBRARY = [
    { id: 'demo', src: '/assets/musica/demo.mp3', es: 'Canción de ejemplo', en: 'Sample song', credit: 'paulyudin · Pixabay' }
  ];
  // Textos del sobre de cada diseño: se usan si la persona deja el campo vacío (y como ejemplo en el formulario).
  var ENV_TEXT = {
    clasico: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    moderno: { es: ['Una invitación para un día inolvidable', ''], en: ['An invitation to an unforgettable day', ''] },
    rosa: { es: ['Celebra con nosotros nuestro gran día', ''], en: ['Celebrate our big day with us', ''] },
    jardin: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    costa: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    gala: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    aurelia: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    noir: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    lino: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    marfil: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    fiesta: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    celeste: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    cisne: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    tinta: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    glicina: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    estreno: { es: ['Una noche de estreno', 'Con todo nuestro cariño'], en: ['An opening night', 'With all our love'] },
    nacar: { es: ['Guardada como una joya', 'Con todo nuestro cariño'], en: ['Kept like a jewel', 'With all our love'] },
    arco: { es: ['Una invitación para un día inolvidable', 'Con cariño, te esperamos en nuestra boda'], en: ['An invitation to an unforgettable day', 'With love, we’ll see you at our wedding'] },
    corazones: { es: ['Una invitación para un día inolvidable', 'Con todo nuestro cariño'], en: ['An invitation to an unforgettable day', 'With all our love'] },
    encaje: { es: ['Una invitación para un día inolvidable', 'Con cariño, te esperamos en nuestra boda.'], en: ['An invitation to an unforgettable day', 'With love, we look forward to seeing you at our wedding.'] }
  };
  // Paletas de Romántico (los colores los aplica demo/shared/content.js; aquí solo el nombre y la muestra).
  var ROSA_PALETTES = [
    { id: 'champana', hex: '#E9DCC4', es: 'Champaña', en: 'Champagne' },
    { id: 'rosado', hex: '#EBD3D2', es: 'Rosado', en: 'Blush' }
  ];
  // Paletas de Moderno (los colores los aplica demo/shared/content.js; aquí nombre, muestra y el color del sello).
  var MOD_PALETTES = [
    { id: 'bn', hex: '#141414', ink: '#141414', sand: '#E7E6E1', es: 'Blanco y negro', en: 'Black & white' },
    { id: 'arena', hex: '#2E2A25', ink: '#2E2A25', sand: '#E6DED2', es: 'Arena', en: 'Sand' },
    { id: 'oliva', hex: '#262B22', ink: '#262B22', sand: '#E2E3D7', es: 'Oliva', en: 'Olive' },
    { id: 'marino', hex: '#1B2433', ink: '#1B2433', sand: '#E3E6EB', es: 'Azul marino', en: 'Navy' },
    { id: 'vino', hex: '#3A1E24', ink: '#3A1E24', sand: '#EADFDC', es: 'Vino', en: 'Wine' }
  ];
  // Paletas de Jardín y Costa (los colores los aplica demo/shared/content.js; aquí nombre y muestra; seal: color de la estampilla o el sello).
  var JARDIN_PALETTES = [
    { id: 'hoja', hex: '#2F3B2C', seal: '#B86B4B', es: 'Hoja', en: 'Leaf' },
    { id: 'lavanda', hex: '#5B3A4A', seal: '#A85E6E', es: 'Lavanda', en: 'Lavender' },
    { id: 'eucalipto', hex: '#2E4057', seal: '#C08B4A', es: 'Eucalipto', en: 'Eucalyptus' }
  ];
  var COSTA_PALETTES = [
    { id: 'cobalto', hex: '#1F4E8C', seal: '#C8643B', es: 'Cobalto', en: 'Cobalt' },
    { id: 'verde', hex: '#2F6F62', seal: '#C8643B', es: 'Verde agua', en: 'Sea green' },
    { id: 'barro', hex: '#B5522E', seal: '#3E6B8A', es: 'Barro', en: 'Clay' }
  ];
  // Gala: el medallón (seal = su oro); Aurelia: el monograma en oro sobre blanco.
  var GALA_PALETTES = [
    { id: 'negro', hex: '#0F0F0E', seal: '#C9A45C', es: 'Negro y oro', en: 'Black and gold' },
    { id: 'esmeralda', hex: '#0F2A24', seal: '#C9A45C', es: 'Esmeralda', en: 'Emerald' },
    { id: 'burdeos', hex: '#2A1020', seal: '#D1A88A', es: 'Burdeos y oro rosa', en: 'Burgundy and rose gold' }
  ];
  var AURELIA_PALETTES = [
    { id: 'oro', hex: '#B4955E', seal: '#B4955E', es: 'Oro', en: 'Gold' },
    { id: 'plata', hex: '#A3A7AC', seal: '#9EA3A8', es: 'Plata', en: 'Silver' },
    { id: 'rosa', hex: '#C39488', seal: '#B98374', es: 'Oro rosa', en: 'Rose gold' }
  ];
  // Noir: monograma en relieve sobre negro; Lino: lacre del color de la paleta.
  var NOIR_PALETTES = [
    { id: 'negro', hex: '#121211', seal: '#121211', es: 'Negro', en: 'Black' },
    { id: 'bosque', hex: '#0F1A15', seal: '#0E1813', es: 'Verde bosque', en: 'Forest green' },
    { id: 'medianoche', hex: '#0E1422', seal: '#0D1320', es: 'Medianoche', en: 'Midnight' }
  ];
  var LINO_PALETTES = [
    { id: 'salvia', hex: '#8C9A86', seal: '#8C9A86', es: 'Salvia', en: 'Sage' },
    { id: 'arena', hex: '#B49B7E', seal: '#A88D6E', es: 'Arena', en: 'Sand' },
    { id: 'piedra', hex: '#8A939B', seal: '#7E8891', es: 'Piedra', en: 'Stone' }
  ];
  // Marfil: lacre del color de la paleta; Fiesta: sello rosa; Celeste: la luna.
  var MARFIL_PALETTES = [
    { id: 'burdeos', hex: '#5E1F2B', seal: '#5E1F2B', es: 'Burdeos', en: 'Burgundy' },
    { id: 'azul', hex: '#1F2A44', seal: '#1F2A44', es: 'Azul noche', en: 'Midnight blue' },
    { id: 'verde', hex: '#23392E', seal: '#23392E', es: 'Verde inglés', en: 'British green' }
  ];
  var FIESTA_PALETTES = [
    { id: 'fiesta', hex: 'conic-gradient(#E8457C 0 25%,#F28C28 0 50%,#19A39A 0 75%,#3B5BDB 0)', seal: '#E8457C', es: 'Fiesta', en: 'Fiesta' },
    { id: 'pastel', hex: 'conic-gradient(#F2A7BF 0 25%,#F7C59F 0 50%,#8FD3C8 0 75%,#A9B8F2 0)', seal: '#E07A9E', es: 'Pastel', en: 'Pastel' },
    { id: 'rosa', hex: 'conic-gradient(#C2185B 0 33%,#E91E63 0 66%,#F8BBD0 0)', seal: '#C2185B', es: 'Rosa mexicano', en: 'Mexican pink' }
  ];
  var CELESTE_PALETTES = [
    { id: 'medianoche', hex: '#0B1430', seal: '#0B1430', es: 'Medianoche', en: 'Midnight' },
    { id: 'aurora', hex: '#0A2630', seal: '#081E26', es: 'Aurora', en: 'Aurora' },
    { id: 'lavanda', hex: '#241B42', seal: '#1C1636', es: 'Lavanda', en: 'Lavender' }
  ];
  // Cisne y Glicina: una sola paleta; Tinta: el sello es la tinta.
  var CISNE_PALETTES = [
    { id: 'burdeos', hex: 'conic-gradient(#6E1A27 0 50%,#66682F 0)', seal: '#6E1A27', es: 'Burdeos y oliva', en: 'Burgundy and olive' }
  ];
  var TINTA_PALETTES = [
    { id: 'rojo', hex: '#B42A30', seal: '#B42A30', es: 'Rojo', en: 'Red' },
    { id: 'azul', hex: '#23468C', seal: '#23468C', es: 'Azul tinta', en: 'Ink blue' },
    { id: 'verde', hex: '#2F6A48', seal: '#2F6A48', es: 'Verde botella', en: 'Bottle green' }
  ];
  var GLICINA_PALETTES = [
    { id: 'lavanda', hex: 'conic-gradient(#8E79BD 0 50%,#7C8454 0)', seal: '#7C8454', es: 'Lavanda y oliva', en: 'Lavender and olive' }
  ];
  // Estreno: el terciopelo cambia; el sello es el terciopelo.
  var ESTRENO_PALETTES = [
    { id: 'granate', hex: '#5E0F1A', seal: '#5E0F1A', es: 'Granate', en: 'Garnet' },
    { id: 'noche', hex: '#1F1C24', seal: '#1F1C24', es: 'Noche', en: 'Night' },
    { id: 'champan', hex: '#8A7354', seal: '#8A7354', es: 'Champán', en: 'Champagne' }
  ];
  // Nácar: cambia el ante del estuche; el sello es el ante.
  var NACAR_PALETTES = [
    { id: 'nacar', hex: '#8F8270', seal: '#8F8270', es: 'Nácar', en: 'Nacre' },
    { id: 'bruma', hex: '#7F8A96', seal: '#7F8A96', es: 'Bruma', en: 'Mist' },
    { id: 'oliva', hex: '#7B826A', seal: '#7B826A', es: 'Oliva', en: 'Olive' }
  ];
  // Arco: el verde cambia; las fotos no se tiñen.
  var ARCO_PALETTES = [
    { id: 'bosque', hex: '#1F3A2B', seal: '#1F3A2B', es: 'Bosque', en: 'Forest' },
    { id: 'noche', hex: '#1F2A3D', seal: '#1F2A3D', es: 'Noche', en: 'Night' },
    { id: 'vino', hex: '#4A1E27', seal: '#4A1E27', es: 'Vino', en: 'Wine' }
  ];
  // Corazones: cambia el fieltro; el rojo de los palos no. El sello es el fieltro con oro.
  var CORAZONES_PALETTES = [
    { id: 'burdeos', hex: '#5A0E1E', seal: '#5A0E1E', es: 'Burdeos', en: 'Burgundy' },
    { id: 'tapete', hex: '#0F3D2E', seal: '#0F3D2E', es: 'Tapete', en: 'Card table' },
    { id: 'medianoche', hex: '#141B33', seal: '#141B33', es: 'Medianoche', en: 'Midnight' }
  ];
  // Encaje: cambian el cacao, el marfil y el verde. El sello es el cacao con un filete de encaje.
  var ENCAJE_PALETTES = [
    { id: 'cacao', hex: '#4A3A2E', seal: '#4A3A2E', es: 'Cacao', en: 'Cocoa' },
    { id: 'salvia', hex: '#55614A', seal: '#55614A', es: 'Salvia', en: 'Sage' },
    { id: 'rosa', hex: '#7A5050', seal: '#7A5050', es: 'Rosa', en: 'Rose' }
  ];
  var TPL_PALETTES = { rosa: ROSA_PALETTES, moderno: MOD_PALETTES, jardin: JARDIN_PALETTES, costa: COSTA_PALETTES, gala: GALA_PALETTES, aurelia: AURELIA_PALETTES, noir: NOIR_PALETTES, lino: LINO_PALETTES, marfil: MARFIL_PALETTES, fiesta: FIESTA_PALETTES, celeste: CELESTE_PALETTES, cisne: CISNE_PALETTES, tinta: TINTA_PALETTES, glicina: GLICINA_PALETTES, estreno: ESTRENO_PALETTES, nacar: NACAR_PALETTES, arco: ARCO_PALETTES, corazones: CORAZONES_PALETTES, encaje: ENCAJE_PALETTES };
  var tplPal = function () { var l = TPL_PALETTES[state.design] || []; return l.filter(function (x) { return x.id === state.pal; })[0] || l[0]; };
  var PALETTES = [
    { id: 'salvia', hex: '#5F7360', es: 'Salvia', en: 'Sage' },
    { id: 'rosa', hex: '#9A5F5C', es: 'Rosa antiguo', en: 'Dusty rose' },
    { id: 'azul', hex: '#3E4C63', es: 'Azul noche', en: 'Midnight blue' },
    { id: 'terracota', hex: '#9A5536', es: 'Terracota', en: 'Terracotta' }
  ];
  var DESIGNS = {
    clasico: { kind: 'envelope', es: ['Clásico', 'Sobre y carta'], en: ['Classic', 'Envelope and letter'] },
    moderno: { kind: 'doors', es: ['Moderno', 'Puertas que se abren'], en: ['Modern', 'Opening doors'] },
    rosa: { kind: 'envelope', es: ['Romántico', 'Sobre lacrado'], en: ['Romantic', 'Wax-sealed envelope'] },
    jardin: { kind: 'envelope', es: ['Jardín', 'Sobre de semillas'], en: ['Garden', 'Seed packet'] },
    costa: { kind: 'envelope', es: ['Costa', 'Pase de abordar'], en: ['Coast', 'Boarding pass'] },
    gala: { kind: 'envelope', es: ['Gala', 'Medallón dorado'], en: ['Gala', 'Gold medallion'] },
    aurelia: { kind: 'doors', es: ['Aurelia', 'Carpeta con faja dorada'], en: ['Aurelia', 'Folder with a gold band'] },
    noir: { kind: 'doors', es: ['Noir', 'Puerta doble con faja de plata'], en: ['Noir', 'Double door with a silver band'] },
    lino: { kind: 'envelope', es: ['Lino', 'Juego de tarjetas'], en: ['Lino', 'Card set'] },
    marfil: { kind: 'envelope', es: ['Marfil', 'Papel vegetal y lazo de seda'], en: ['Marfil', 'Vellum and silk bow'] },
    fiesta: { kind: 'envelope', es: ['Fiesta', 'Carta de lotería'], en: ['Fiesta', 'Lotería card'] },
    celeste: { kind: 'envelope', es: ['Celeste', 'Luna y constelación'], en: ['Celeste', 'Moon and constellation'] },
    cisne: { kind: 'envelope', es: ['Cisne', 'Sobre con sello de lacre'], en: ['Cisne', 'Envelope with a wax seal'] },
    tinta: { kind: 'envelope', es: ['Tinta', 'Círculo en el calendario'], en: ['Tinta', 'A circle on the calendar'] },
    glicina: { kind: 'doors', es: ['Glicina', 'Cortina de glicinas'], en: ['Glicina', 'Wisteria curtain'] },
    estreno: { kind: 'envelope', es: ['Estreno', 'Funda de terciopelo'], en: ['Estreno', 'Velvet sleeve'] },
    nacar: { kind: 'envelope', es: ['Nácar', 'Estuche con hilo de perlas'], en: ['Nácar', 'Box with a pearl strand'] },
    arco: { kind: 'doors', es: ['Arco', 'Ventana empañada'], en: ['Arco', 'Misted window'] },
    corazones: { kind: 'envelope', es: ['Corazones', 'Baraja en abanico'], en: ['Corazones', 'Deck that fans out'] },
    encaje: { kind: 'doors', es: ['Encaje', 'Estor de encaje'], en: ['Encaje', 'Lace blind'] }
  };
  // Sección de la vista previa a la que lleva cada complemento.
  var ADDON_SPOT = { playlist: 'musica', libro: 'itinerario', capsula: 'rsvp', encuestas: 'faq', galeria: 'historia', bilingue: 'portada', dominio: 'portada' };

  function defaults() {
    var es = LANG === 'es';
    return {
      v: 1, design: 'clasico', sec: 'portada',
      n1: es ? 'Ana' : 'Anna', n2: es ? 'León' : 'Leo', date: '2027-03-14', city: 'Oaxaca',
      cover: '/assets/fotos/paseo.jpg', msg: es ? 'Nos casamos y queremos celebrarlo contigo.' : 'We’re getting married and want to celebrate with you.', pal: 'salvia',
      sealMode: 'mono', sealText: es ? 'A & L' : 'A & L', mono: 'amp', monoImg: '',
      storyTitle: es ? 'Cómo empezó todo' : 'How it all began', story: '',
      gallery: ['/assets/fotos/beso.jpg', '/assets/fotos/escalera.jpg', '/assets/fotos/muro.jpg'],
      events: es
        ? [{ id: 1, name: 'Ceremonia civil', time: '13:00', place: '', address: '', mapUrl: '' }, { id: 2, name: 'Comida familiar', time: '14:30', place: '', address: '' }, { id: 3, name: 'Fiesta', time: '20:00', place: '', address: '' }]
        : [{ id: 1, name: 'Civil ceremony', time: '13:00', place: '', address: '', mapUrl: '' }, { id: 2, name: 'Family lunch', time: '14:30', place: '', address: '' }, { id: 3, name: 'Party', time: '20:00', place: '', address: '' }],
      faqs: es
        ? [{ id: 1, q: '¿Cuál es el código de vestimenta?', a: 'Formal. Evita el blanco, por favor.' }, { id: 2, q: '¿Pueden ir niños?', a: '' }, { id: 3, q: '¿Hay mesa de regalos?', a: '' }]
        : [{ id: 1, q: 'What is the dress code?', a: 'Formal. Please avoid white.' }, { id: 2, q: 'Are kids welcome?', a: '' }, { id: 3, q: 'Is there a gift registry?', a: '' }],
      musicOn: true, musicSource: 'library', musicTrack: 'demo', musicTrackSrc: '/assets/musica/demo.mp3', musicFileName: '', musicFileSize: 0,
      palCustom: '#8A4F5C',
      // Todos los diseños reciben y muestran estos mismos campos (ver demo/shared/content.js).
      invitations: [], timeZone: '', courtPair: 'KQ', photoBW: true, photosOn: true, envIntro: '', envClosing: '', countdownId: 1, countdownNote: '', quote: '', quoteAuthor: '', dressCode: '', dressNotes: '', dressColors: '',
      viajeOn: true, travelIntro: '', hotel: '', hotelAddress: '', hotelCode: '', hotelLink: '', hotelNotes: '',
      airport: '', transport: '', guideFood: '', guideCulture: '', guidePlans: '',
      rsvpDeadline: '', rsvpMsg: '', rsvpDiet: true, rsvpNote: true,
      polls: [{ id: 4, q: S.pollMain, opts: '' }, { id: 5, q: S.pollIdeas[0], opts: '' }], pollReveal: 'fiesta',
      capsuleDate: '', capsulePrompt: '', capsuleInRsvp: true,
      shareMode: 'sobre', sharePhoto: 0,
      uid: 10
    };
  }
  function loadState() {
    var d = defaults(), s = load(KEY);
    if (!s || typeof s !== 'object') return d;
    Object.keys(d).forEach(function (k) { if (s[k] === undefined || typeof s[k] !== typeof d[k] || Array.isArray(d[k]) !== Array.isArray(s[k])) s[k] = d[k]; });
    if (!DESIGNS[s.design]) s.design = 'clasico';
    // Invitaciones guardadas antes de separar lugar/dirección y de las notas del hotel.
    s.events.forEach(function (e) { if (e.address === undefined) { var m = /^(.*?)\s[·\-–—]\s(.*)$/.exec(e.place || ''); e.place = m ? m[1] : (e.place || ''); e.address = m ? m[2] : ''; } });
    s.events.forEach(function (e) { if (e.mapUrl === undefined) e.mapUrl = ''; });
    if (s.travelNotes && !s.hotelNotes) s.hotelNotes = s.travelNotes;
    delete s.travelNotes; delete s.greeting; delete s.song;
    return s;
  }
  function loadCart() {
    var c = load(CART_KEY), out = {};
    if (c && Array.isArray(c.ids)) c.ids.forEach(function (id) { if (ADDON_IDS.indexOf(id) > -1) out[id] = true; });
    return out;
  }
  var saveCart = function (cart) { return store(CART_KEY, { ids: ADDON_IDS.filter(function (id) { return cart[id]; }) }); };

  /* ---------- Utilidades comunes ---------- */
  function svg(d, s, w, color) { return '<svg width="' + (s || 16) + '" height="' + (s || 16) + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || 'currentColor') + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var P = {
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S9 8 12 8Zm0 0c2-4 6-4 6-1.5S15 8 12 8Z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>', plus: '<path d="M12 5v14M5 12h14"/>', menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', doors: '<path d="M4 21V11a8 8 0 0 1 16 0v10ZM12 3v18"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>', play: '<path d="M7 5v14l11-7Z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'
  };
  var logo = '<span class="ed-logo-mark">&amp;</span><span class="ed-logo-word">lazo</span>';
  var addonName = function (id) { return ADDON_TXT[id][0]; };
  var initial = function (s) { return esc((String(s || '').trim().charAt(0) || ' ').toUpperCase()); };
  var accentOf = function (st) { return (PALETTES.filter(function (p) { return p.id === st.pal; })[0] || PALETTES[0]).hex; };
  function slug(st) {
    var j = LANG === 'en' ? 'and' : 'y';
    var s = (String(st.n1 || '') + j + String(st.n2 || '')).toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
    return (s.length > j.length ? s : (LANG === 'en' ? 'yournames' : 'tunombre')) + '.com';
  }
  var couple = function (st) { return (st.n1 || '—') + ' & ' + (st.n2 || '—'); };
  function dateObj(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmtDate(v) { var d = dateObj(v); return d ? pad(d.getDate()) + ' · ' + pad(d.getMonth() + 1) + ' · ' + d.getFullYear() : ''; }
  function longDate(v, year) { var d = dateObj(v); if (!d) return ''; try { return d.toLocaleDateString(LANG, year ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }); } catch (e) { return fmtDate(v); } }
  function cartLines(cart) {
    var left = ADDON_IDS.filter(function (id) { return cart[id]; }), lines = [];
    PACKS.forEach(function (p) {
      if (p.ids.every(function (id) { return left.indexOf(id) > -1; })) { lines.push({ pack: p }); left = left.filter(function (id) { return p.ids.indexOf(id) < 0; }); }
    });
    left.forEach(function (id) { lines.push({ id: id }); });
    return lines;
  }
  var cartCount = function (cart) { return ADDON_IDS.filter(function (id) { return cart[id]; }).length; };
  var toastTimer;
  function toast(text) {
    var el = document.querySelector('.ed-toast');
    if (!el) { el = document.createElement('div'); el.className = 'ed-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = text; clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.remove(); }, 2400);
  }
  function trap(e, box) {
    if (e.key !== 'Tab' || !box) return;
    var f = Array.prototype.filter.call(box.querySelectorAll('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  function modal(html, opener) {
    var host = document.getElementById('edModal');
    host.innerHTML = '<div class="ed-modal" data-act="modal-scrim"><div class="ed-modal-box" role="dialog" aria-modal="true" aria-labelledby="mdTitle">' + html + '</div></div>';
    document.body.classList.add('ed-locked');
    host._opener = opener || document.activeElement;
    var b = host.querySelector('.ed-modal-actions .ed-btn'); if (b) b.focus();
  }
  function closeModal() {
    var host = document.getElementById('edModal'); if (!host || !host.innerHTML) return false;
    host.innerHTML = ''; if (!document.querySelector('.ed-overlay,.ed-guest')) document.body.classList.remove('ed-locked');
    if (host._opener && host._opener.focus) host._opener.focus();
    return true;
  }

  /* ---------- Sello (vista de los estilos de monograma en el formulario) ---------- */
  function sealInner(st) {
    var i1 = initial(st.n1), i2 = initial(st.n2);
    if (st.sealMode === 'text') {
      var t = String(st.sealText || '');
      return '<span class="seal-txt" style="font-size:' + (t.length > 6 ? 13 : t.length > 4 ? 16 : 20) + 'px">' + (esc(t) || '&nbsp;') + '</span>';
    }
    if (st.mono === 'custom' && st.monoImg) return '<img src="' + esc(st.monoImg) + '" alt="">';
    if (st.mono === 'stack') return '<span class="seal-stack"><span>' + i1 + '</span><hr><span>' + i2 + '</span></span>';
    if (st.mono === 'ring') return '<span class="seal-ring">' + i1 + i2 + '</span>';
    return '<span class="seal-amp">' + i1 + '<i>&amp;</i>' + i2 + '</span>';
  }
  /* ---------- Vista previa al compartir (WhatsApp, Instagram…) ----------
     Solo se guarda la elección. TODO: al publicar de verdad, el servidor debe poner esta imagen en og:image
     (1200 × 630): una captura de la plantilla cerrada (/demo/<diseño>/?lz=vista) o la foto elegida. */
  var sharePhotos = function () { return [state.cover].concat(state.gallery).filter(Boolean); };
  var sharePhotoSrc = function () { var l = [state.cover].concat(state.gallery); return l[state.sharePhoto] || state.cover || state.gallery[0] || ''; };
  function shareHTML() {
    var foto = state.shareMode === 'foto', all = [state.cover].concat(state.gallery);
    var img = foto ? '<img src="' + esc(sharePhotoSrc()) + '" alt="">'
      : '<iframe id="edShareFrame" src="' + BASE + '/demo/' + state.design + '/?lz=vista&k=' + encodeURIComponent(KEY) + '" title="" tabindex="-1" aria-hidden="true" loading="lazy"></iframe>';
    return '<div class="ed-stack ed-group"><h2 class="ed-sub">' + esc(S.shareK) + '</h2><span class="ed-hint" style="margin-top:-6px">' + esc(S.shareHint) + '</span>' +
      '<div class="ed-seg" role="radiogroup" aria-label="' + esc(S.shareK) + '">' +
        '<button type="button" role="radio" aria-checked="' + !foto + '" data-act="shareMode" data-id="sobre" data-fk="sh-sobre">' + esc(S.shareSobre) + '</button>' +
        '<button type="button" role="radio" aria-checked="' + foto + '" data-act="shareMode" data-id="foto" data-fk="sh-foto">' + esc(S.shareFoto) + '</button></div>' +
      (foto && sharePhotos().length ? '<div class="ed-stack"><span class="ed-label" id="lblShareP">' + esc(S.sharePick) + '</span><div class="ed-share-pick" role="radiogroup" aria-labelledby="lblShareP">' +
        all.map(function (src, i) {
          if (!src) return '';
          var on = src === sharePhotoSrc() && (state.sharePhoto === i || !all[state.sharePhoto]);
          return '<button type="button" role="radio" aria-checked="' + on + '" data-act="sharePhoto" data-i="' + i + '" data-fk="shp-' + i + '" aria-label="' + esc(i ? S.photoN(i) : S.shareCover) + '"><img src="' + esc(src) + '" alt=""></button>';
        }).join('') + '</div></div>' : '') +
      '<div class="ed-share" aria-hidden="true"><div class="ed-share-card"><div class="ed-share-img" id="edShareImg">' + img + '</div>' +
        '<div class="ed-share-meta"><b>' + esc(couple(state)) + (state.date ? ' · ' + esc(longDate(state.date, true)) : '') + '</b>' +
        (state.msg ? '<span>' + esc(state.msg) + '</span>' : '') + '<small>' + esc(location.host) + '</small></div></div></div></div>';
  }
  // La plantilla se dibuja a 1200 × 630 (tamaño de la imagen para compartir) y se reduce al ancho de la tarjeta.
  function layoutShare() {
    var box = $('#edShareImg'), f = $('#edShareFrame'); if (!box || !f) return;
    f.style.transform = 'scale(' + (box.clientWidth / 1200) + ')';
  }

  /* ---------- Lista de invitados desde CSV ---------- */
  function parseCSV(text) {
    text = String(text || '').replace(/^\uFEFF/, '');
    var first = text.split(/\r?\n/).slice(0, 5).join('\n'), count = function (c) { return first.split(c).length - 1; };
    var d = [';', '\t', ','].sort(function (a, b) { return count(b) - count(a); })[0];
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === d) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.map(function (r) { return r.map(function (c) { return c.trim(); }); }).filter(function (r) { return r.some(Boolean); });
  }
  // Convierte las filas en invitaciones. Reconoce encabezados en español o inglés; sin encabezado: invitación, persona, teléfono, correo.
  function rowsToInvitations(rows) {
    var norm = function (x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, ''); };
    var KEYS = { name: /^(invitacion|invitation|familia|family|grupo|group|hogar|household)/, person: /^(persona|person|invitado|guest|nombre|name|asistente)/, phone: /^(telefono|phone|whatsapp|celular|movil|mobile|tel)/, email: /^(correo|email|mail|ecorreo)/ };
    var col = { name: 0, person: 1, phone: 2, email: 3 }, start = 0, h = rows[0] || [], found = {};
    h.forEach(function (c, i) { var n = norm(c); Object.keys(KEYS).forEach(function (k) { if (found[k] === undefined && KEYS[k].test(n)) found[k] = i; }); });
    if (found.name !== undefined || found.person !== undefined) { start = 1; Object.keys(found).forEach(function (k) { col[k] = found[k]; }); if (found.phone === undefined) col.phone = -1; if (found.email === undefined) col.email = -1; }
    var map = {}, list = [], skipped = 0;
    rows.slice(start).forEach(function (r) {
      var get = function (k) { return col[k] >= 0 ? (r[col[k]] || '').trim() : ''; };
      var name = get('name'), person = get('person');
      if (!name && !person) { skipped++; return; }
      if (!name) name = person;
      if (!person) person = name; // una fila con solo el nombre de la invitación es una persona
      var key = name.toLowerCase(), inv = map[key];
      if (!inv) { inv = map[key] = { name: name, people: [], phone: '', email: '' }; list.push(inv); }
      if (person && inv.people.indexOf(person) < 0) inv.people.push(person);
      if (!inv.phone) inv.phone = get('phone');
      if (!inv.email) inv.email = get('email');
    });
    return { list: list, skipped: skipped };
  }

  /* ---------- Archivos grandes (el MP3) en IndexedDB: no caben en localStorage ---------- */
  function mediaDB() {
    return new Promise(function (ok, ko) {
      try { var r = indexedDB.open('lazo-media', 1); r.onupgradeneeded = function () { r.result.createObjectStore('files'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { ko(r.error); }; } catch (e) { ko(e); }
    });
  }
  function mediaDo(mode, fn) {
    return mediaDB().then(function (db) { return new Promise(function (ok) { var tx = db.transaction('files', mode), req = fn(tx.objectStore('files')); tx.oncomplete = function () { ok(req && req.result !== undefined ? req.result : true); }; tx.onerror = tx.onabort = function () { ok(null); }; }); }).catch(function () { return null; });
  }
  var mediaPut = function (k, blob) { return mediaDo('readwrite', function (st) { return st.put(blob, k); }); };
  var mediaGet = function (k) { return mediaDo('readonly', function (st) { return st.get(k); }); };
  var mediaDel = function (k) { return mediaDo('readwrite', function (st) { return st.delete(k); }); };
  // Color del sello tal como sale en la plantilla, para mostrar los estilos de monograma en el formulario.
  // Clásico: según la paleta (mismos cálculos que demo/shared/content.js); Moderno y Romántico: su sello fijo; Jardín y Costa: la estampilla o el sello de su paleta.
  var TPL_DARK = { rosa: '#4A2F2E', azul: '#26304A', terracota: '#4A2B1F' };
  function sealLook() {
    var serif = "font-family:'Instrument Serif',Georgia,serif;";
    if (state.design === 'moderno') { var mp = tplPal(); return serif + 'background:radial-gradient(circle at 35% 30%,#FFFFFF,' + mp.sand + ' 70%);color:' + mp.ink + ';box-shadow:inset 0 0 0 1px ' + mp.ink + '33'; }
    if (state.design === 'rosa') return serif + 'background:radial-gradient(circle at 35% 30%,#D8AE76,#A8743E 70%);color:#FFF4DF';
    if (state.design === 'jardin') return serif + 'background:radial-gradient(circle at 32% 26%,#ffffff40,transparent 40%),' + tplPal().seal + ';color:#FBF1E6';
    if (state.design === 'costa') return serif + 'background:#FFFCF5;color:' + tplPal().seal + ';box-shadow:inset 0 0 0 2px ' + tplPal().seal;
    if (state.design === 'gala') return serif + 'background:radial-gradient(circle at 35% 30%,#F7E7B8,' + tplPal().seal + ' 70%);color:#2A1F0C';
    if (state.design === 'aurelia') return serif + 'background:#FFFFFF;color:#1D1B19;box-shadow:inset 0 0 0 1px ' + tplPal().seal;
    if (state.design === 'noir') return serif + 'background:' + tplPal().seal + ';color:#CFCFCA;box-shadow:inset 0 0 0 1px #CFCFCA55';
    if (state.design === 'lino') return serif + 'background:radial-gradient(circle at 35% 30%,#ffffff55,' + tplPal().seal + ' 60%);color:#fff';
    if (state.design === 'marfil') return serif + 'background:radial-gradient(circle at 35% 30%,#ffffff40,' + tplPal().seal + ' 60%);color:#F1DDD0';
    if (state.design === 'fiesta') return serif + 'background:' + tplPal().seal + ';color:#fff;box-shadow:inset 0 0 0 2px #2A1B3D';
    if (state.design === 'celeste') return serif + 'background:' + tplPal().seal + ';color:#F4E9C8;box-shadow:inset 0 0 0 1px #F4E9C866';
    if (state.design === 'cisne') return serif + 'background:radial-gradient(circle at 35% 30%,#ffffff40,' + tplPal().seal + ' 60%);color:#E8D5A8';
    if (state.design === 'tinta') return serif + 'background:#FBF8F3;color:' + tplPal().seal + ';box-shadow:inset 0 0 0 1.5px ' + tplPal().seal;
    if (state.design === 'encaje') return "font-family:'EB Garamond',Georgia,serif;font-style:italic;" + 'background:' + tplPal().seal + ';color:#F6F2EA;box-shadow:inset 0 0 0 3px ' + tplPal().seal + ',inset 0 0 0 4px #D9CFC088';
    if (state.design === 'corazones') return serif + 'background:' + tplPal().seal + ';color:#D2B06A;box-shadow:inset 0 0 0 1px #D2B06A';
    if (state.design === 'arco') return serif + 'background:' + tplPal().seal + ';color:#F7F5EF;box-shadow:inset 0 0 0 1px #F7F5EF55';
    if (state.design === 'nacar') return "font-family:'Marcellus',Georgia,serif;" + 'background:' + tplPal().seal + ';color:#ECE5DA;box-shadow:inset 0 0 0 1px #ffffff26';
    if (state.design === 'estreno') return "font-family:'Bodoni Moda',Georgia,serif;font-style:italic;" + 'background:' + tplPal().seal + ';color:#F6D9A0;box-shadow:inset 0 0 0 1px #F6D9A066';
    if (state.design === 'glicina') return serif + 'background:#FFFDF6;color:' + tplPal().seal + ';box-shadow:inset 0 0 0 1px ' + tplPal().seal + ',inset 0 0 0 4px #FFFDF6,inset 0 0 0 5px #AEB38C';
    var hex = state.pal === 'custom' ? state.palCustom : TPL_DARK[state.pal], m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 'font-family:Georgia,serif;background:radial-gradient(circle at 30% 20%,#64745a,#2b4437);color:#f5f2ea';
    var n = parseInt(m[1], 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
    var mixc = function (t, a) { return c.map(function (x, i) { return Math.round(x + (t[i] - x) * a); }); };
    var hx = function (v) { return '#' + v.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); };
    for (var i = 0; i < 25 && isLight(hx(c)); i++) c = mixc([0, 0, 0], 0.15);
    return 'font-family:Georgia,serif;background:radial-gradient(circle at 30% 20%,' + hx(mixc([255, 255, 255], 0.28)) + ',' + hx(mixc([0, 0, 0], 0.05)) + ');color:#f5f2ea';
  }
  // Un color muy claro no deja leer el texto claro de la plantilla (ver customPalette en demo/shared/content.js).
  function isLight(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return false; var n = parseInt(m[1], 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
    return [0, 1, 2].reduce(function (sum, i) { var x = c[i] / 255; x = x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return sum + x * [0.2126, 0.7152, 0.0722][i]; }, 0) > 0.12;
  }

  /* ---------- Imágenes ---------- */
  // Si una foto no carga (servidor caído, archivo borrado…), se muestra el patrón de relleno en lugar del icono roto.
  var BROKEN = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#E6E1D4"/><path d="M-10 10 10-10M0 40 40 0M30 50 50 30" stroke="#D6D0C1" stroke-width="8"/></svg>');
  root.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.src !== BROKEN) { t.src = BROKEN; t.alt = ''; }
  }, true);
  function readImage(file, max, keepPng, cb) {
    var r = new FileReader();
    r.onload = function () {
      if (file.type === 'image/svg+xml') { cb(r.result); return; }
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try { cb(keepPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(null); }
      };
      img.onerror = function () { cb(null); };
      img.src = r.result;
    };
    r.onerror = function () { cb(null); };
    r.readAsDataURL(file);
  }

  /* ---------- Acceso: hay que ingresar y haber comprado el diseño ---------- */
  function gate() {
    var u = AUTH && AUTH.current();
    if (!u) { location.replace(BASE + '/cuenta/?next=' + encodeURIComponent(location.pathname + location.search + location.hash)); return null; }
    var own = AUTH.owned(), p = new URLSearchParams(location.search), d = p.get('diseno') || p.get('design');
    if (!own.length) { location.replace(BASE + '/comprar/' + (DESIGNS[d] ? '?diseno=' + d : '')); return null; }
    if (!d) d = own.indexOf(u.last) > -1 ? u.last : own[0];
    if (!AUTH.owns(d)) {
      var name = DESIGNS[d] ? DESIGNS[d][LANG][0] : d;
      document.title = S.gateT(name) + ' — Lazo';
      root.innerHTML = '<div class="ed-gate"><a class="ed-logo" href="' + BASE + '/" aria-label="Lazo">' + logo + '</a><h1>' + esc(S.gateT(name)) + '</h1><p>' + esc(S.gateP) + '</p><div>' +
        (DESIGNS[d] ? '<a class="ed-btn ed-btn-dark" href="' + BASE + '/comprar/?diseno=' + d + '">' + esc(S.gateBuy) + '</a>' : '') +
        '<a class="ed-btn" href="' + BASE + '/cuenta/">' + esc(S.myInv) + '</a></div></div>';
      return null;
    }
    AUTH.setLast(d);
    KEY = AUTH.invKey(d); CART_KEY = AUTH.cartKey();
    return d;
  }
  var DESIGN = gate();
  if (!DESIGN) return;
  if (VIEW === 'checkout') return checkout();

  /* =========================================================
     Editor
     ========================================================= */
  var state = loadState(), cart = loadCart();
  state.design = DESIGN;
  var ui = { maps: {}, drawer: false, nav: false, mode: 'edit', device: 'm', dragIdx: null, saving: 'saved', audio: null };
  (function initialRoute() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (SECS.indexOf(h) > -1 || ADDON_IDS.indexOf(h) > -1) state.sec = h;
    else if (h === 'complementos' || h === 'addons') ui.drawer = true;
    if (SECS.indexOf(state.sec) < 0 && ADDON_IDS.indexOf(state.sec) < 0) state.sec = 'portada';
  })();
  var design = function () { return DESIGNS[state.design][LANG]; };
  var cdEvent = function () { return state.events.filter(function (e) { return e.id === state.countdownId; })[0] || state.events[0] || null; };
  var secName = function (id) { return S.sec[id] ? S.sec[id][0] : addonName(id); };
  var isMobile = function () { return window.matchMedia('(max-width: 960px)').matches; };

  function doneOf(id) {
    var s = state, t = function (v) { return !!String(v || '').trim(); };
    switch (id) {
      case 'portada': return t(s.n1) && t(s.n2) && t(s.date) && t(s.city);
      case 'apertura': return s.sealMode === 'text' ? t(s.sealText) : (s.mono !== 'custom' || t(s.monoImg));
      case 'historia': return t(s.story);
      case 'itinerario': return s.events.length > 0 && s.events.every(function (e) { return t(e.name) && t(e.time) && (t(e.place) || t(e.address)); });
      case 'faq': return s.faqs.length > 0 && s.faqs.every(function (f) { return t(f.q) && t(f.a); });
      case 'musica': return !s.musicOn || (s.musicSource === 'upload' ? t(s.musicFileName) : t(s.musicTrackSrc));
      case 'viaje': return !s.viajeOn || t(s.hotel);
      case 'rsvp': return t(s.rsvpDeadline);
      case 'invitados': return s.invitations.length > 0;
    }
    return false;
  }

  /* ---------- Marco ---------- */
  root.innerHTML =
    '<div class="ed" id="ed" data-mode="edit">' +
      '<header class="ed-top">' +
        '<button type="button" class="ed-icon-btn ed-menu" data-act="menu" aria-label="' + esc(S.menu) + '" aria-expanded="false" aria-controls="edNav">' + svg(P.menu, 18) + '</button>' +
        '<a class="ed-logo" href="' + BASE + '/" aria-label="Lazo">' + logo + '</a><div class="ed-sep"></div>' +
        '<div class="ed-title"><strong data-couple></strong><small>' + esc(S.designLbl) + ' <span data-design></span> · <a href="' + BASE + '/cuenta/">' + esc(S.myInv) + '</a></small></div>' +
        '<div class="ed-save" data-save aria-live="polite"></div>' +
        '<div class="ed-mtitle"><strong data-couple-short></strong><small data-msub></small></div>' +
        '<div class="ed-spacer"></div>' +
        '<button type="button" class="ed-btn ed-cartbtn" data-act="drawer">' + svg(P.gift) + esc(S.addons) + '<span class="ed-count" data-count></span></button>' +
        '<button type="button" class="ed-btn ed-guestbtn" data-act="guest">' + esc(S.guest) + '</button>' +
        '<button type="button" class="ed-btn ed-btn-dark" data-act="publish">' + esc(S.publish) + '</button>' +
      '</header>' +
      '<div class="ed-tabs ed-seg" role="tablist" aria-label="' + esc(S.modeLbl) + '">' +
        '<button type="button" role="tab" data-act="mode" data-id="edit" aria-controls="edMain">' + esc(S.edit) + '</button>' +
        '<button type="button" role="tab" data-act="mode" data-id="preview" aria-controls="edPv">' + esc(S.preview) + '</button>' +
      '</div>' +
      '<div class="ed-body">' +
        '<nav class="ed-nav" id="edNav" aria-label="' + esc(S.menu) + '"></nav>' +
        '<main class="ed-main" id="edMain"></main>' +
        '<aside class="ed-pv" id="edPv" aria-label="' + esc(S.preview) + '"><div class="ed-pv-sticky">' +
          '<div class="ed-pv-head"><span class="ed-kicker">' + esc(S.preview) + '</span><div class="ed-device" role="group" aria-label="' + esc(S.device) + '">' +
            '<button type="button" data-act="device" data-id="m">' + esc(S.mobile) + '</button><button type="button" data-act="device" data-id="d">' + esc(S.desktop) + '</button></div></div>' +
          '<div class="ed-phone" id="edPhone"><iframe class="ed-frame" id="edFrame" title="' + esc(S.preview) + '"></iframe></div>' +
          '<span class="ed-pv-cap">' + esc(S.viewingAs) + '</span>' +
        '</div></aside>' +
      '</div>' +
      '<nav class="ed-bottom" aria-label="' + esc(S.stepsLbl) + '">' +
        '<button type="button" class="ed-icon-btn" data-act="step" data-d="-1" aria-label="' + esc(S.prev) + '">' + svg(P.left, 16, 2) + '</button>' +
        '<button type="button" class="ed-btn" data-act="drawer">' + svg(P.gift) + esc(S.addons) + '<span class="ed-count" data-count></span></button>' +
        '<button type="button" class="ed-btn ed-btn-dark" data-act="step" data-d="1">' + esc(S.next) + svg(P.right, 16, 2) + '</button>' +
      '</nav>' +
    '</div><div id="edLayer"></div><div id="edModal"></div>';

  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var nav = $('#edNav'), main = $('#edMain'), frame = $('#edFrame'), layer = $('#edLayer');

  function keepFocus(fn) {
    var a = document.activeElement, fk = a && a.getAttribute && a.getAttribute('data-fk');
    fn();
    if (fk) { var el = root.querySelector('[data-fk="' + fk + '"]'); if (el && el !== document.activeElement && !el.disabled) el.focus({ preventScroll: true }); }
  }

  function renderChrome() {
    var n = cartCount(cart), idx = SECS.indexOf(state.sec);
    $$('[data-couple]').forEach(function (el) { el.textContent = S.weddingOf + ' ' + couple(state); });
    $$('[data-couple-short]').forEach(function (el) { el.textContent = couple(state); });
    $$('[data-design]').forEach(function (el) { el.textContent = design()[0]; });
    $$('[data-count]').forEach(function (el) { el.textContent = n; el.hidden = !n; });
    $$('[data-msub]').forEach(function (el) { el.textContent = (idx > -1 ? pad(idx + 1) + ' · ' : '') + secName(state.sec) + ' · ' + (ui.saving === 'saving' ? S.savingShort : ui.saving === 'fail' ? S.saveFail : S.savedShort); });
    var sv = $('[data-save]');
    sv.className = 'ed-save' + (ui.saving === 'fail' ? ' err' : '');
    sv.innerHTML = ui.saving === 'saving' ? esc(S.saving) : ui.saving === 'fail' ? esc(S.saveFail) : svg(P.check, 14, 2.4, '#4E7A5C') + esc(S.saved);
    $$('[data-act="step"]').forEach(function (b) { var d = +b.getAttribute('data-d'); b.disabled = d < 0 ? idx <= 0 : idx === SECS.length - 1; });
    $$('[data-act="mode"]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-id') === ui.mode)); });
    $$('[data-act="device"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-id') === ui.device)); });
    $('#ed').setAttribute('data-mode', ui.mode);
    $('#edPhone').classList.toggle('desk', ui.device === 'd');
    $('#edPv').style.flexBasis = ui.device === 'd' && !isMobile() ? '600px' : '';
    layoutFrame();
  }

  function renderNav() {
    var done = SECS.filter(doneOf).length;
    var row = function (id, inner) { return '<button type="button" class="ed-row" data-act="sec" data-id="' + id + '" data-fk="nav-' + id + '"' + (state.sec === id ? ' aria-current="page"' : '') + '>' + inner + '</button>'; };
    nav.innerHTML =
      '<div class="ed-nav-top ed-only-m"><span class="ed-logo">' + logo + '</span><button type="button" class="ed-icon-btn" data-act="menu-close" aria-label="' + esc(S.closeMenu) + '">' + svg(P.x, 16, 2) + '</button></div>' +
      '<div class="ed-progress"><span class="ed-kicker">' + esc(S.yourInv) + '</span><div class="ed-bar"><span style="width:' + Math.round(done / SECS.length * 100) + '%"></span></div><small>' + esc(S.ready(done, SECS.length)) + '</small></div>' +
      '<div class="ed-list">' + SECS.map(function (id, i) {
        var hidden = id === 'viaje' && !state.viajeOn;
        return row(id, '<span class="ed-row-n">' + pad(i + 1) + '</span><span class="ed-row-name">' + esc(secName(id)) + '</span>' +
          (hidden ? '<span class="ed-pill">' + esc(S.hidden) + '</span>' : doneOf(id) ? svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', 16, 2.2, '#4E7A5C').replace('aria-hidden="true"', 'role="img" aria-label="' + esc(S.done) + '"') : ''));
      }).join('') + '</div>' +
      '<div class="ed-list"><div class="ed-list-head"><span class="ed-kicker">' + esc(S.addons) + '</span><button type="button" class="ed-link" data-act="drawer">' + esc(S.seeAll) + '</button></div>' +
      ADDON_IDS.map(function (id) {
        return row(id, svg(P.lock, 15, 1.8, '#5D655F') + '<span class="ed-row-name">' + esc(addonName(id)) + '</span>' + (cart[id] ? '<span class="ed-pill ed-pill-dark">' + esc(S.inCart) + '</span>' : '<span class="ed-row-price">[$]</span>'));
      }).join('') + '</div>' +
      '<div class="ed-promo"><span class="ed-kicker">' + esc(S.packsFrom) + '</span><span class="ed-promo-title">' + esc(S.packsTitle) + '</span><div class="ed-chips">' +
      PACKS.map(function (p) { return '<span class="ed-chip">' + esc(PACK_TXT[p.id][0]) + '</span>'; }).join('') + '</div><button type="button" class="ed-btn" data-act="drawer">' + esc(S.seePacks) + '</button></div>' +
      '<div class="ed-only-m" style="flex-direction:column;gap:10px;padding:0 4px"><button type="button" class="ed-btn" data-act="guest">' + esc(S.guest) + '</button><a class="ed-btn" href="' + BASE + '/cuenta/">' + esc(S.myInv) + '</a></div>';
  }

  /* ---------- Piezas del formulario ---------- */
  function head(id) {
    var n = SECS.indexOf(id) + 1;
    return '<div class="ed-head"><span class="ed-kicker">' + esc(S.section) + ' ' + pad(n) + (id === 'viaje' ? ' · ' + esc(S.optional) : '') + '</span><h1 id="edH1" tabindex="-1">' + esc(S.sec[id][0]) + '</h1><p>' + esc(S.sec[id][1]) + '</p></div>';
  }
  function field(label, k, o) {
    o = o || {};
    var v = state[k] == null ? '' : state[k];
    var a = ' data-k="' + k + '" id="f-' + k + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.type ? ' type="' + o.type + '"' : '') + ' autocomplete="off"';
    var ctl = o.rows ? '<textarea rows="' + o.rows + '"' + a + '>' + esc(v) + '</textarea>' : '<input' + a + ' value="' + esc(v) + '">';
    return '<label class="ed-field' + (o.cls ? ' ' + o.cls : '') + '">' + esc(label) + ctl + (o.hint ? '<span class="ed-hint">' + esc(o.hint) + '</span>' : '') + '</label>';
  }
  function listField(list, i, f, label, o) {
    o = o || {};
    var v = state[list][i][f] || '', id = list + '-' + state[list][i].id + '-' + f;
    var a = ' id="' + id + '" data-list="' + list + '" data-i="' + i + '" data-f="' + f + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.type ? ' type="' + o.type + '"' : '') + ' autocomplete="off"';
    var ctl = o.rows ? '<textarea rows="' + o.rows + '"' + a + '>' + esc(v) + '</textarea>' : '<input' + a + ' value="' + esc(v) + '">';
    return '<label class="ed-field' + (o.cls ? ' ' + o.cls : '') + '">' + esc(label) + ctl + '</label>';
  }
  function toggleRow(k, label, on, off) {
    return '<div class="ed-switch-row"><div><b id="sw-' + k + '">' + esc(label) + '</b><span>' + esc(state[k] ? on : off) + '</span></div>' +
      '<button type="button" class="ed-switch" role="switch" aria-checked="' + !!state[k] + '" aria-labelledby="sw-' + k + '" data-act="toggle" data-k="' + k + '" data-fk="sw-' + k + '"></button></div>';
  }
  function dropzone(kind, title, hint, multiple, cls) {
    var accept = kind === 'mono' ? 'image/svg+xml,image/png' : kind === 'music' ? 'audio/mpeg,.mp3' : kind === 'csv' ? '.csv,text/csv' : 'image/jpeg,image/png,image/webp';
    return '<label class="ed-drop' + (cls ? ' ' + cls : '') + '" data-drop="' + kind + '" style="position:relative">' + svg(kind === 'gallery' ? P.plus : kind === 'music' ? P.music : P.upload, 20, 1.6) + '<b>' + esc(title) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : '') +
      '<input type="file" accept="' + accept + '" data-file="' + kind + '"' + (multiple ? ' multiple' : '') + '></label>';
  }
  function upsell(o) {
    return '<div class="ed-upsell' + (o.light ? ' light' : '') + '">' + (o.pics || '') + '<div class="ed-upsell-text"><span class="ed-kicker-gold">' + esc(o.k) + '</span><b>' + o.t + '</b>' + (o.s ? '<span>' + esc(o.s) + '</span>' : '') + '</div>' +
      '<button type="button" class="ed-btn ' + (o.dark ? 'ed-btn-dark' : 'ed-btn-line') + '" data-act="' + o.act + '" data-id="' + (o.id || '') + '" data-fk="up-' + o.act + '-' + (o.id || '') + '">' + esc(o.label) + '</button></div>';
  }
  var cartUpsell = function (id, o) { o.act = 'cart'; o.id = id; o.label = cart[id] ? S.inCartRemove : (o.label || S.addPrice); return upsell(o); };
  var addonUpsell = function (id, o) { o.act = 'sec'; o.id = id; o.label = S.seeAddon; return upsell(o); };
  var delBtn = function (act, i, label, fk) { return '<button type="button" class="ed-del" data-act="' + act + '" data-i="' + i + '" aria-label="' + esc(label) + '" data-fk="' + fk + '">' + svg(P.trash, 18, 1.7) + '</button>'; };

  function coSelect(label, key, options, value, hint) {
    return '<label class="ed-field">' + esc(label) + '<select data-k="' + key + '">' + options.map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===value?' selected':'')+'>'+esc(o[1])+'</option>';}).join('') + '</select>' + (hint?'<span class="ed-hint">'+esc(hint)+'</span>':'') + '</label>';
  }
  function coZone() {
    var zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['America/Mexico_City','America/Bogota','America/New_York','Europe/Madrid'];
    return coSelect(LANG==='es'?'Zona horaria de la boda':'Wedding time zone','timeZone',[['UTC','UTC']].concat(zones.map(function(z){return[z,z.replace(/_/g,' ')];})),state.timeZone||'America/Mexico_City',LANG==='es'?'Elige la zona del lugar de la boda para que todos los invitados vean la misma cuenta regresiva.':'Choose the venue’s time zone so every guest sees the same countdown.');
  }
  function coPair() { return coSelect(LANG==='es'?'Pareja de naipes':'Court-card pair','courtPair',LANG==='es'?[['KQ','Rey y reina · K/Q'],['QQ','Dos reinas · Q/Q'],['KK','Dos reyes · K/K'],['AA','Dos ases · A/A']]:[['KQ','King and queen · K/Q'],['QQ','Two queens · Q/Q'],['KK','Two kings · K/K'],['AA','Two aces · A/A']],state.courtPair||'KQ'); }
  function coEventIcon(e, i) {
    var opts=LANG==='es'?[['auto','Automático según el nombre'],['ceremony','Alianzas · ceremonia'],['drinks','Copas · brindis'],['meal','Plato · comida'],['party','Música · fiesta'],['cake','Pastel'],['transport','Vehículo · traslado'],['arrival','Reloj · otro evento']]:[['auto','Automatic from event name'],['ceremony','Rings · ceremony'],['drinks','Glasses · toast'],['meal','Plate · meal'],['party','Music · party'],['cake','Cake'],['transport','Vehicle · transfer'],['arrival','Clock · other event']];
    return '<label class="ed-field full">'+(LANG==='es'?'Icono del evento':'Event icon')+'<select data-list="events" data-i="'+i+'" data-f="icon">'+opts.map(function(o){return '<option value="'+o[0]+'"'+((e.icon||'auto')===o[0]?' selected':'')+'>'+esc(o[1])+'</option>';}).join('')+'</select></label>';
  }

  var SECTION_HTML = {
    portada: function () {
      return head('portada') +
        '<div class="ed-grid2">' + field(S.n1, 'n1') + field(S.n2, 'n2') + field(S.date, 'date', { type: 'date' }) + field(S.city, 'city', { ph: S.cityPh, hint: S.cityHint }) + '</div>' + (['corazones','clasico','moderno'].includes(state.design) ? coZone() : '') +
        '<div class="ed-stack"><span class="ed-label">' + esc(S.cover) + '</span><div class="ed-photo">' +
          (state.cover ? '<div class="ed-photo-img"><img src="' + esc(state.cover) + '" alt="' + esc(S.coverAlt) + '"></div>' : '<div class="ed-photo-img ph"></div>') +
          dropzone('cover', S.drop, S.dropHint) + '</div></div>' +
        field(S.msg, 'msg', { rows: 3, ph: S.msgPh }) + field(S.countdownNote, 'countdownNote', { ph: S.countdownNotePh }) +
        (TPL_PALETTES[state.design] ? '<div class="ed-stack"><span class="ed-label" id="lblPal">' + esc(S.palette) + '</span><div class="ed-palettes" role="radiogroup" aria-labelledby="lblPal">' +
          TPL_PALETTES[state.design].map(function (p) { var on = p === tplPal(); return '<button type="button" class="ed-pal" role="radio" aria-checked="' + on + '" data-act="pal" data-id="' + p.id + '" data-fk="pal-' + p.id + '"><i style="background:' + p.hex + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)"></i>' + esc(p[LANG]) + '</button>'; }).join('') +
        '</div></div>' :
        '<div class="ed-stack"><span class="ed-label" id="lblPal">' + esc(S.palette) + '</span><div class="ed-palettes" role="radiogroup" aria-labelledby="lblPal">' +
          PALETTES.map(function (p) { return '<button type="button" class="ed-pal" role="radio" aria-checked="' + (p.id === state.pal) + '" data-act="pal" data-id="' + p.id + '" data-fk="pal-' + p.id + '"><i style="background:' + p.hex + '"></i>' + esc(p[LANG]) + '</button>'; }).join('') +
          '<label class="ed-pal ed-pal-custom' + (state.pal === 'custom' ? ' is-on' : '') + '"><input type="color" data-k="palCustom" value="' + esc(state.palCustom) + '" aria-label="' + esc(S.palCustomLbl) + '"><span>' + esc(S.palCustom) + '</span></label>' +
        '</div><span class="ed-hint" id="palNote"' + (state.pal === 'custom' && isLight(state.palCustom) ? '' : ' hidden') + '>' + esc(S.palLight) + '</span></div>') +
        ((state.design === 'moderno' || state.design === 'noir' || state.design === 'corazones') ? toggleRow('photoBW', S.photoBW, S.photoBWOn, S.photoBWOff) : '') +
        (state.design === 'glicina' ? toggleRow('photosOn', S.photosOn, S.photosOnOn, S.photosOnOff) : '') +
        cartUpsell('dominio', { light: true, k: S.domainK, t: esc(S.domainT(slug(state))) });
    },
    apertura: function () {
      var d = design(), mono = state.sealMode === 'mono';
      var opt = function (id, label) {
        var st = clone(state); st.sealMode = 'mono'; st.mono = id;
        return '<button type="button" class="ed-mono" role="radio" aria-checked="' + (mono && state.mono === id) + '" data-act="mono" data-id="' + id + '" data-fk="mono-' + id + '"><span class="iv-seal" style="' + sealLook() + '">' + sealInner(st) + '</span>' + esc(label) + '</button>';
      };
      return head('apertura') + (state.design === 'corazones' ? coPair() : '') +
        '<div class="ed-info">' + svg(DESIGNS[state.design].kind === 'doors' ? P.doors : P.mail, 22, 1.6) + '<div><b>' + esc(d[1]) + '</b><span>' + esc(S.effectNote(d[0])) + '</span></div></div>' +
        '<div class="ed-stack"><span class="ed-label" id="lblSeal">' + esc(S.sealQ) + '</span><div class="ed-seg" role="radiogroup" aria-labelledby="lblSeal">' +
          '<button type="button" role="radio" aria-checked="' + !mono + '" data-act="sealMode" data-id="text" data-fk="sm-text">' + esc(S.text) + '</button>' +
          '<button type="button" role="radio" aria-checked="' + mono + '" data-act="sealMode" data-id="mono" data-fk="sm-mono">' + esc(S.mono) + '</button></div></div>' +
        (mono
          ? '<div class="ed-stack" style="gap:18px"><div class="ed-stack"><span class="ed-label" id="lblMono">' + esc(S.withInitials) + '</span><div class="ed-monos" role="radiogroup" aria-labelledby="lblMono">' +
              opt('amp', S.amp) + opt('stack', S.stack) + opt('ring', S.ring) + '</div></div>' +
              (state.monoImg ? '<div class="ed-mono-custom" style="' + (state.mono === 'custom' ? '' : 'border-width:1px;border-color:var(--line)') + '"><img src="' + esc(state.monoImg) + '" alt="' + esc(S.yourMono) + '" style="' + sealLook() + '"><span>' + esc(S.yourMono) + '</span>' +
                (state.mono === 'custom' ? '<span class="ed-pill ed-pill-dark" style="flex:0 0 auto">' + esc(S.inUse) + '</span>' : '<button type="button" class="ed-btn ed-btn-sm" data-act="mono" data-id="custom" data-fk="mono-custom">' + esc(S.useIt) + '</button>') +
                '<button type="button" class="ed-del" data-act="mono-del" aria-label="' + esc(S.delMono) + '">' + svg(P.trash, 18, 1.7) + '</button></div>' : '') +
              dropzone('mono', S.upMono, S.upMonoHint, false, '') + '</div>'
          : field(S.sealText, 'sealText', { max: 8, hint: S.upTo8 })) +
        '<div class="ed-stack ed-group"><h2 class="ed-sub">' + esc(S.envK) + '</h2>' +
          field(S.envIntro, 'envIntro', { ph: ENV_TEXT[state.design][LANG][0], hint: S.envKeepHint }) +
          field(S.envClosing, 'envClosing', { ph: ENV_TEXT[state.design][LANG][1] || S.envClosingPh, hint: ENV_TEXT[state.design][LANG][1] ? S.envKeepHint : S.envOptHint }) + '</div>' +
        shareHTML();
    },
    historia: function () {
      var g = state.gallery;
      return head('historia') + field(S.storyTitle, 'storyTitle') + field(S.story, 'story', { rows: 5, ph: S.storyPh }) +
        '<div class="ed-grid2">' + field(S.quote, 'quote', { rows: 2, ph: S.quotePh, cls: 'span2' }) + field(S.quoteAuthor, 'quoteAuthor', { ph: S.quoteAuthorPh }) + '</div>' +
        '<div class="ed-stack"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap"><span class="ed-label">' + esc(S.gallery) + '</span><span class="ed-hint">' + esc(S.galCount(g.length, window.matchMedia('(pointer: coarse)').matches)) + '</span></div>' +
        '<div class="ed-gallery">' + g.map(function (src, i) {
          return '<div class="ed-thumb" draggable="true" data-gi="' + i + '"><img src="' + esc(src) + '" alt="' + esc(S.photoN(i + 1)) + '" draggable="false"><div class="ed-thumb-tools">' +
            '<button type="button" data-act="gal-move" data-i="' + i + '" data-d="-1" aria-label="' + esc(S.movePrev + ' · ' + S.photoN(i + 1)) + '"' + (i === 0 ? ' disabled' : '') + '>' + svg(P.left, 14, 2) + '</button>' +
            '<button type="button" data-act="gal-del" data-i="' + i + '" aria-label="' + esc(S.delPhoto + ' · ' + S.photoN(i + 1)) + '">' + svg(P.x, 14, 2) + '</button>' +
            '<button type="button" data-act="gal-move" data-i="' + i + '" data-d="1" aria-label="' + esc(S.moveNext + ' · ' + S.photoN(i + 1)) + '"' + (i === g.length - 1 ? ' disabled' : '') + '>' + svg(P.right, 14, 2) + '</button></div></div>';
        }).join('') + (g.length < 12 ? dropzone('gallery', S.upPhotos, '', true) : '') + '</div>' + (g.length >= 12 ? '<span class="ed-hint">' + esc(S.galFull) + '</span>' : '') + '</div>' +
        cartUpsell('galeria', { k: S.galK, t: esc(S.galT), s: S.galS, dark: !cart.galeria, label: S.add,
          pics: '<div class="ed-upsell-pics"><img src="/assets/fotos/torre.jpg" alt=""><img src="/assets/fotos/paseo.jpg" alt=""></div>' });
    },
    itinerario: function () {
      var ev = state.events;
      return head('itinerario') + (ev.length ? '<p class="ed-hint" style="margin:0">' + esc(S.cdHint) + ' ' + esc(S.mapsHint) + '</p>' : '') +
        (ev.length ? '<ol class="ed-ol">' + ev.map(function (e, i) {
          return '<li class="ed-card"><div class="ed-move">' +
            '<button type="button" data-act="ev-move" data-i="' + i + '" data-d="-1" data-fk="evu-' + e.id + '" aria-label="' + esc(S.moveUp) + '"' + (i === 0 ? ' disabled' : '') + '>' + svg(P.up, 14, 2) + '</button>' +
            '<span aria-hidden="true">' + pad(i + 1) + '</span>' +
            '<button type="button" data-act="ev-move" data-i="' + i + '" data-d="1" data-fk="evd-' + e.id + '" aria-label="' + esc(S.moveDown) + '"' + (i === ev.length - 1 ? ' disabled' : '') + '>' + svg(P.down, 14, 2) + '</button></div>' +
            '<div class="ed-ev-body"><div class="ed-ev-grid">' + listField('events', i, 'name', S.event, { cls: 'wide', ph: S.eventPh }) + listField('events', i, 'time', S.time, { type: 'time' }) + listField('events', i, 'place', S.place, { cls: 'full', ph: S.placePh }) + listField('events', i, 'address', S.address, { cls: 'full', ph: S.addressPh }) +
              listField('events', i, 'mapUrl', S.mapUrl, { cls: 'full', ph: S.mapUrlPh, type: 'url' }) + (state.design === 'corazones' ? coEventIcon(e, i) : '') + '</div>' +
              '<small class="ed-hint ed-maphint" data-maphint="' + e.id + '"' + (e.mapUrl && !isMapsUrl(e.mapUrl) ? '' : ' hidden') + '>' + esc(S.mapUrlBad) + '</small>' +
              '<div class="ed-ev-tools"><label class="ed-check"><input type="radio" name="cdEvent" value="' + e.id + '"' + (cdEvent() === e ? ' checked' : '') + '><span>' + esc(S.cdUse) + '</span></label>' +
                ('<button type="button" class="ed-link" data-act="ev-map" data-id="' + e.id + '" data-fk="evmap-' + e.id + '" aria-expanded="' + !!ui.maps[e.id] + '">' + esc(ui.maps[e.id] ? S.hideMap : S.showMap) + '</button>' +
                '<a class="ed-link" data-mapsearch href="' + esc(mapsSearch(mapQuery(e) || S.place)) + '" target="_blank" rel="noopener">' + esc(S.searchMaps) + ' ↗</a>') + '</div>' +
              (ui.maps[e.id] && mapQuery(e) ? '<iframe class="ed-map" title="' + esc(S.mapOf(e.place || e.name)) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + esc(mapsEmbed(mapQuery(e))) + '"></iframe>' : '') +
            '</div>' +
            delBtn('ev-del', i, S.delEvent + ' ' + (i + 1), 'evx-' + e.id) + '</li>';
        }).join('') + '</ol>' : '<p class="ed-empty">' + esc(S.noEvents) + '</p>') +
        '<div class="ed-stack"><span class="ed-label">' + esc(S.addEvent) + '</span><div class="ed-presets">' + PRESETS.map(function (p, i) {
          return '<button type="button" class="ed-btn ed-btn-dash ed-btn-sm" data-act="ev-add" data-i="' + i + '" data-fk="evadd-' + i + '">+ ' + esc(p) + '</button>';
        }).join('') + '</div></div>' +
        '<div class="ed-stack ed-group"><h2 class="ed-sub">' + esc(S.dressK) + '</h2>' + field(S.dressCode, 'dressCode', { ph: S.dressCodePh }) + field(S.dressNotes, 'dressNotes', { rows: 2, ph: S.dressNotesPh }) + field(S.dressColors, 'dressColors', { ph: S.dressColorsPh }) + '</div>' +
        addonUpsell('libro', { light: true, k: S.libroK, t: esc(S.libroT) });
    },
    faq: function () {
      var fq = state.faqs, full = fq.length >= 7;
      return head('faq') +
        (fq.length ? '<div class="ed-stack" style="gap:12px">' + fq.map(function (f, i) {
          return '<div class="ed-card"><span class="ed-card-n">' + (i + 1) + '</span><div class="ed-card-body">' + listField('faqs', i, 'q', S.q, { ph: S.qPh }) + listField('faqs', i, 'a', S.a, { rows: 2, ph: S.aPh }) + '</div>' + delBtn('faq-del', i, S.delQ + ' ' + (i + 1), 'fqx-' + f.id) + '</div>';
        }).join('') + '</div>' : '<p class="ed-empty">' + esc(S.noFaq) + '</p>') +
        '<div class="ed-limit"><button type="button" class="ed-btn ed-btn-dash" data-act="faq-add" data-fk="faq-add"' + (full ? ' disabled' : '') + '>' + esc(S.addQ) + '</button><small aria-live="polite">' + esc(S.faqCount(fq.length)) + '</small>' +
        (full ? '<small class="warn" role="status">' + esc(S.faqFull) + '</small>' : '') + '</div>' +
        addonUpsell('encuestas', { k: S.pollK, t: esc(S.pollT) });
    },
    musica: function () {
      var h = head('musica') + toggleRow('musicOn', S.musicOn, S.musicOnHint, S.musicOffHint);
      if (state.musicOn) {
        var up = state.musicSource === 'upload';
        var playBtn = function (id) {
          var on = ui.playing === id && ui.audio && !ui.audio.paused;
          return '<button type="button" class="ed-btn ed-btn-sm" data-act="music-play" data-id="' + id + '" data-fk="mp-' + id + '" aria-pressed="' + !!on + '">' + svg(on ? P.pause : P.play, 14, 2) + esc(on ? S.pause : S.play) + '</button>';
        };
        h += '<div class="ed-stack"><span class="ed-label" id="lblSrc">' + esc(S.musicSrc) + '</span><div class="ed-seg" role="radiogroup" aria-labelledby="lblSrc">' +
          [['library', S.srcLibrary], ['upload', S.srcUpload]].map(function (o) { return '<button type="button" role="radio" aria-checked="' + ((o[0] === 'upload') === up) + '" data-act="musicSource" data-id="' + o[0] + '" data-fk="ms-' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>';
        if (!up) {
          h += '<div class="ed-stack" role="radiogroup" aria-label="' + esc(S.libraryK) + '">' + MUSIC_LIBRARY.map(function (t) {
            var on = state.musicTrack === t.id;
            return '<div class="ed-track' + (on ? ' on' : '') + '"><button type="button" class="ed-track-pick" role="radio" aria-checked="' + on + '" data-act="track" data-id="' + t.id + '" data-fk="tr-' + t.id + '">' + svg(P.music, 18, 1.6) + '<span><b>' + esc(t[LANG]) + '</b><small>' + esc(t.credit) + '</small></span></button>' + playBtn('lib:' + t.id) + '</div>';
          }).join('') + '</div><p class="ed-hint" style="margin:0">' + esc(S.libraryMore) + '</p>';
        } else {
          h += (state.musicFileName
            ? '<div class="ed-track on"><div class="ed-track-pick">' + svg(P.music, 18, 1.6) + '<span><b>' + esc(state.musicFileName) + '</b><small>' + (state.musicFileSize / 1048576).toFixed(1) + ' MB</small></span></div>' + playBtn('upload') +
              '<button type="button" class="ed-del" data-act="music-del" aria-label="' + esc(S.musicDel) + '">' + svg(P.trash, 18, 1.7) + '</button></div>' + dropzone('music', S.musicReplace, S.musicHint)
            : dropzone('music', S.musicUpload, S.musicHint)) +
            '<p class="ed-hint" style="margin:0">' + esc(S.musicLocal) + '</p>';
        }
      }
      return h + addonUpsell('playlist', { light: true, k: S.playlistK, t: esc(S.playlistT) });
    },
    viaje: function () {
      return head('viaje') + toggleRow('viajeOn', S.viajeShow, S.viajeOnHint, S.viajeOffHint) +
        (state.viajeOn ? '<div class="ed-stack" style="gap:16px"><p class="ed-hint" style="margin:0">' + esc(S.emptyHidden) + '</p>' + field(S.travelIntro, 'travelIntro', { rows: 2, ph: S.travelIntroPh }) +
          '<div class="ed-stack ed-group"><h2 class="ed-sub">' + esc(S.hotelK) + '</h2>' + field(S.hotel, 'hotel', { ph: S.hotelPh }) + field(S.hotelAddress, 'hotelAddress') +
            '<div class="ed-grid2">' + field(S.hotelCode, 'hotelCode', { ph: S.hotelCodePh }) + field(S.hotelLink, 'hotelLink', { ph: S.hotelLinkPh, type: 'url' }) + '</div>' + field(S.notes, 'hotelNotes', { rows: 3, ph: S.notesPh }) + '</div>' +
          '<div class="ed-stack ed-group"><h2 class="ed-sub">' + esc(S.gettingK) + '</h2>' + field(S.airport, 'airport', { rows: 2, ph: S.airportPh }) + field(S.transport, 'transport', { rows: 2, ph: S.transportPh }) + '</div>' +
          '<div class="ed-stack ed-group"><h2 class="ed-sub">' + esc(S.guideK) + '</h2>' + field(S.guideFood, 'guideFood', { rows: 2, ph: S.guidePh }) + field(S.guideCulture, 'guideCulture', { rows: 2, ph: S.guidePh }) + field(S.guidePlans, 'guidePlans', { rows: 2, ph: S.guidePh }) + '</div>' +
          upsell({ k: S.destK, t: esc(S.destT), act: 'drawer', label: S.seePack }) + '</div>' : '');
    },
    rsvp: function () {
      return head('rsvp') + field(S.deadline, 'rsvpDeadline', { type: 'date' }) + field(S.rsvpMsg, 'rsvpMsg', { rows: 3, ph: S.rsvpMsgPh }) +
        toggleRow('rsvpDiet', S.diet, S.dietHint, S.offHint) + toggleRow('rsvpNote', S.note, S.noteHint, S.offHint) +
        addonUpsell('capsula', { light: true, k: S.capsulaK, t: esc(S.capsulaT) });
    },
    invitados: function () {
      var inv = state.invitations, up = ui.gMode !== 'manual', people = inv.reduce(function (n, x) { return n + x.people.length; }, 0);
      var fq = String(ui.gq || '').trim().toLowerCase();
      var shown = inv.map(function (x, i) { return [x, i]; }).filter(function (p) { return !fq || p[0].name.toLowerCase().indexOf(fq) > -1 || p[0].people.some(function (n) { return n.toLowerCase().indexOf(fq) > -1; }); });
      var h = head('invitados') +
        '<div class="ed-seg" role="radiogroup" aria-label="' + esc(S.sec.invitados[0]) + '">' +
          '<button type="button" role="radio" aria-checked="' + up + '" data-act="gMode" data-id="upload" data-fk="gm-up">' + esc(S.gUpload) + '</button>' +
          '<button type="button" role="radio" aria-checked="' + !up + '" data-act="gMode" data-id="manual" data-fk="gm-man">' + esc(S.gManual) + '</button></div>';
      if (up) {
        h += '<div class="ed-stack ed-howto"><b>' + esc(S.gHow) + '</b><ol>' + S.gSteps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
          '<div class="ed-csv" role="table" aria-label="' + esc(S.gExample) + '"><div role="row">' + S.gCols.map(function (c) { return '<span role="columnheader">' + esc(c) + '</span>'; }).join('') + '</div>' +
            (LANG === 'en' ? [['The Rodríguez Family', 'Carlos Rodríguez', '+1 305 555 0123', 'carlos@example.com'], ['The Rodríguez Family', 'Lucía Pérez', '', ''], ['Aunt Martha', 'Martha Gómez', '+1 305 555 0101', '']]
              : [['Familia Rodríguez', 'Carlos Rodríguez', '+57 300 123 4567', 'carlos@ejemplo.com'], ['Familia Rodríguez', 'Lucía Pérez', '', ''], ['Tía Marta', 'Marta Gómez', '+57 310 555 0101', '']])
              .map(function (r) { return '<div role="row">' + r.map(function (c) { return '<span role="cell">' + esc(c) + '</span>'; }).join('') + '</div>'; }).join('') + '</div>' +
          '<a class="ed-btn ed-btn-sm" href="' + S.gExampleFile + '" download>' + svg('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>', 14, 2) + esc(S.gExample) + '</a></div>' +
          dropzone('csv', S.gDrop, S.gDropHint) + '<p class="ed-hint" style="margin:0">' + esc(S.gMerge) + '</p>';
      } else h += '<p class="ed-hint" style="margin:0">' + esc(S.gManualHint) + '</p>';
      h += '<div class="ed-stack ed-group"><div class="ed-list-top"><h2 class="ed-sub">' + esc(S.gList) + '</h2><span class="ed-hint" aria-live="polite">' + esc(S.gSummary(inv.length, people)) + '</span></div>' +
        (inv.length > 6 ? '<label class="ed-field"><span class="vh">' + esc(S.gSearch) + '</span><input type="search" data-gsearch value="' + esc(ui.gq || '') + '" placeholder="' + esc(S.gSearchPh) + '" aria-label="' + esc(S.gSearch) + '"></label>' : '') +
        (inv.length ? (shown.length ? '<div class="ed-stack ed-invs">' + shown.map(function (p) {
          var x = p[0], i = p[1];
          return '<div class="ed-card ed-inv"><div class="ed-card-body">' +
            '<div class="ed-inv-head"><label class="ed-field">' + esc(S.gName) + '<input data-inv="' + i + '" data-f="name" value="' + esc(x.name) + '" placeholder="' + esc(S.gNamePh) + '" autocomplete="off"></label><span class="ed-pill">' + esc(S.gSeats(x.people.length)) + '</span></div>' +
            '<div class="ed-inv-people">' + x.people.map(function (n, j) {
              return '<div class="ed-inv-person"><input data-inv="' + i + '" data-p="' + j + '" value="' + esc(n) + '" placeholder="' + esc(S.gPersonPh) + '" aria-label="' + esc(S.gPerson + ' ' + (j + 1)) + '" autocomplete="off">' +
                '<button type="button" class="ed-del" data-act="g-delp" data-i="' + i + '" data-d="' + j + '" aria-label="' + esc(S.gDelPerson + ' ' + (n || S.gPerson)) + '">' + svg(P.x, 16, 2) + '</button></div>';
            }).join('') + '<button type="button" class="ed-link" data-act="g-addp" data-i="' + i + '" data-fk="gap-' + i + '">' + esc(S.gAddPerson) + '</button></div>' +
            '<div class="ed-grid2"><label class="ed-field">' + esc(S.gPhone) + '<input type="tel" data-inv="' + i + '" data-f="phone" value="' + esc(x.phone) + '" autocomplete="off"></label><label class="ed-field">' + esc(S.gEmail) + '<input type="email" data-inv="' + i + '" data-f="email" value="' + esc(x.email) + '" autocomplete="off"></label></div>' +
            '</div>' + delBtn('g-del', i, S.gDelInv + ' ' + (x.name || ''), 'gx-' + i) + '</div>';
        }).join('') + '</div>' : '<p class="ed-empty">' + esc(S.gNoMatch) + '</p>') : '<p class="ed-empty">' + esc(S.gEmpty) + '</p>') +
        '<div class="ed-limit"><button type="button" class="ed-btn ed-btn-dash" data-act="g-new" data-fk="g-new">' + esc(S.gNew) + '</button>' +
        (inv.length ? '<button type="button" class="ed-link" data-act="g-clear">' + esc(S.gClear) + '</button>' : '') + '</div></div>';
      return h;
    }
  };

  function qrSVG() {
    var n = 21, seed = 7, cells = '', rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var finder = function (x, y) { return x < 7 && y < 7 || x > n - 8 && y < 7 || x < 7 && y > n - 8; };
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var on;
      if (finder(x, y)) { var fx = x > n - 8 ? x - (n - 7) : x, fy = y > n - 8 ? y - (n - 7) : y; on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5); }
      else on = rnd() > 0.55;
      if (on) cells += 'M' + x + ' ' + y + 'h1v1h-1z';
    }
    return '<svg class="ed-qr" viewBox="0 0 ' + n + ' ' + n + '" role="img" aria-label="QR"><path d="' + cells + '" fill="#2B3A33"/></svg>';
  }
  /* ---------- Google Maps (sin clave de API): enlace pegado o búsqueda por lugar, dirección y ciudad ---------- */
  function isMapsUrl(u) {
    try { var x = new URL(u); return x.protocol === 'https:' && (/(^|\.)goo\.gl$/.test(x.hostname) || x.hostname === 'g.co' || (/(^|\.)google\.[a-z.]+$/.test(x.hostname) && (/^\/maps/.test(x.pathname) || /^maps\./.test(x.hostname)))); } catch (e) { return false; }
  }
  var mapQuery = function (e) { return [e.place, e.address, state.city].map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(', '); };
  var mapsSearch = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); };
  var mapsEmbed = function (q) { return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&output=embed'; };
  var val = function (v, ph) { return v && String(v).trim() ? esc(v) : '<span class="iv-empty">[' + esc(ph) + ']</span>'; };
  // Respuestas de una encuesta: las que escribieron (separadas por comas) o, si no hay, los dos novios.
  function pollOpts(p) {
    var o = String(p.opts || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    return o.length ? o.slice(0, 6) : [state.n1 || S.n1, state.n2 || S.n2];
  }
  // Fecha de apertura de la cápsula: la elegida o el primer aniversario.
  function capsuleOpen() {
    if (dateObj(state.capsuleDate)) return state.capsuleDate;
    var d = dateObj(state.date); if (!d) return '';
    return (d.getFullYear() + 1) + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  var pollIdeasLeft = function () { var used = state.polls.map(function (p) { return p.q; }); return [S.pollMain].concat(S.pollIdeas).filter(function (q) { return used.indexOf(q) < 0; }); };
  function addonSetup(id) {
    var h;
    if (id === 'encuestas') {
      var pl = state.polls, full = pl.length >= 6, ideas = pollIdeasLeft();
      h = '<h2>' + esc(S.pollsTitle) + '</h2>' +
        (pl.length ? '<div class="ed-stack" style="gap:12px">' + pl.map(function (p, i) {
          return '<div class="ed-card"><span class="ed-card-n">' + (i + 1) + '</span><div class="ed-card-body">' + listField('polls', i, 'q', S.pollQ, { ph: S.pollQPh }) + listField('polls', i, 'opts', S.pollOpts, { ph: S.pollOptsPh(state.n1 || S.n1, state.n2 || S.n2) }) + '</div>' + delBtn('poll-del', i, S.delPoll + ' ' + (i + 1), 'plx-' + p.id) + '</div>';
        }).join('') + '</div>' : '<p class="ed-empty">' + esc(S.noPolls) + '</p>') +
        '<div class="ed-limit"><button type="button" class="ed-btn ed-btn-dash" data-act="poll-add" data-i="-1" data-fk="poll-add"' + (full ? ' disabled' : '') + '>' + esc(S.addPoll) + '</button><small aria-live="polite">' + esc(S.pollCount(pl.length)) + '</small>' + (full ? '<small class="warn" role="status">' + esc(S.pollFull) + '</small>' : '') + '</div>' +
        (ideas.length && !full ? '<div class="ed-stack"><span class="ed-label">' + esc(S.pollIdeasK) + '</span><div class="ed-presets">' + ideas.map(function (q, i) { return '<button type="button" class="ed-btn ed-btn-dash ed-btn-sm" data-act="poll-add" data-i="' + i + '">+ ' + esc(q) + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="ed-stack"><span class="ed-label" id="lblRev">' + esc(S.reveal) + '</span><div class="ed-seg" role="radiogroup" aria-labelledby="lblRev">' +
          [['fiesta', S.revealParty], ['voto', S.revealVote]].map(function (r) { return '<button type="button" role="radio" aria-checked="' + (state.pollReveal === r[0]) + '" data-act="pollReveal" data-id="' + r[0] + '" data-fk="rev-' + r[0] + '">' + esc(r[1]) + '</button>'; }).join('') +
        '</div><span class="ed-hint">' + esc(state.pollReveal === 'voto' ? S.revealVoteHint : S.revealPartyHint) + '</span></div>';
    } else if (id === 'capsula') {
      var d = dateObj(state.date), ann = d ? longDate((d.getFullYear() + 1) + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), true) : '';
      h = field(S.capDate, 'capsuleDate', { type: 'date', hint: S.capDateHint(ann) }) + field(S.capPrompt, 'capsulePrompt', { rows: 2, ph: S.capPromptPh }) +
        toggleRow('capsuleInRsvp', S.capRsvp, S.capRsvpOn, S.capRsvpOff);
    } else return '';
    return '<section class="ed-setup" aria-labelledby="setupK"><div class="ed-head"><span class="ed-kicker-gold" id="setupK">' + esc(S.setupK) + '</span><p>' + esc(S.setupNote) + '</p></div>' + h + '</section>';
  }
  function addonDemo(id) {
    var card = function (inner, style) { return '<div class="ed-demo-card"' + (style ? ' style="' + style + '"' : '') + '>' + inner + '</div>'; };
    switch (id) {
      case 'encuestas':
        var pl = state.polls[0];
        if (!pl) return '<div class="ed-demo">' + card('<span class="s">' + esc(S.noPolls) + '</span>') + '</div>';
        var opts = pollOpts(pl), w = opts.length === 2 ? [62, 38] : opts.map(function () { return Math.round(100 / opts.length); });
        return '<div class="ed-demo">' + card('<span class="ed-kicker">' + esc(S.guestsSee) + '</span><span class="t">' + val(pl.q, S.pollQ) + '</span>' +
          opts.map(function (o, i) { return '<div class="ed-vote"><div><span>' + esc(o) + '</span><span>' + (state.pollReveal === 'voto' ? '[' + w[i] + '%]' : '') + '</span></div><div class="bar"><span style="width:' + (state.pollReveal === 'voto' ? w[i] : 0) + '%;' + (i ? 'background:#8A9886' : '') + '"></span></div></div>'; }).join('') +
          (state.pollReveal === 'voto' ? '' : '<small class="ed-hint">' + esc(S.secretTill) + '</small>')) +
          card('<span class="ed-kicker">' + esc(S.pollsTitle) + '</span>' + state.polls.map(function (x, i) { return '<span class="s">' + (i + 1) + '. ' + val(x.q, S.pollQ) + '</span>'; }).join(''), 'gap:10px') + '</div>';
      case 'playlist':
        return '<div class="ed-demo">' + card('<span class="ed-kicker">Spotify · ' + esc(couple(state)) + '</span>' + S.songs.map(function (s, i) {
          return '<div class="ed-song"><i>' + svg(P.music, 16) + '</i><div><span>' + esc(s[0]) + '</span><small>' + esc(s[1]) + (i === 2 ? ' · ' + esc(S.approve) : '') + '</small></div></div>';
        }).join('')) + card('<span class="ed-kicker">' + esc(S.demoPlaylist) + '</span><span class="t">' + esc(S.songAsk) + '</span><span class="ed-field"><input disabled placeholder="' + esc(S.songAskPh) + '" aria-label="' + esc(S.songAskPh) + '"></span><span class="ed-btn ed-btn-dark ed-btn-sm" style="align-self:flex-start">' + esc(S.suggest) + '</span>') + '</div>';
      case 'libro':
        return '<div class="ed-demo">' + card(qrSVG() + '<span class="s">' + esc(S.qrScan) + '</span>', 'align-items:center;text-align:center') +
          card('<img src="/assets/fotos/escalera.jpg" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px"><span class="t" style="font-size:19px;font-style:italic">«' + esc(S.qrMsg) + '»</span><small class="ed-hint">' + esc(S.qrBy) + '</small>') + '</div>';
      case 'capsula':
        var openTxt = longDate(capsuleOpen(), true);
        return '<div class="ed-demo">' + card('<div class="iv-env" style="width:100%;max-width:240px;height:150px;align-self:center"><svg width="100%" height="90" viewBox="0 0 240 96" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0h240L120 92Z" fill="#E6E1D4" stroke="#D6CFBF"/></svg><div class="iv-seal" style="left:calc(50% - 36px);top:52px">' + svg(P.lock, 22, 1.6) + '</div></div><span class="ed-kicker" style="text-align:center">' + esc(S.sealedUntil) + '</span><span class="t" style="text-align:center">' + esc(openTxt || '—') + '</span>', 'background:var(--cream)') +
          card('<span class="ed-kicker">' + esc(S.guestsSee) + '</span><span class="t" style="font-size:19px;font-style:italic">«' + esc(String(state.capsulePrompt || '').trim() || S.capPromptPh) + '»</span><span class="ed-btn ed-btn-dark ed-btn-sm" style="align-self:flex-start">' + esc(S.capWrite) + '</span>' +
            S.capsuleMsgs.slice(0, 2).map(function (m) { return '<div class="ed-song"><i>' + svg(P.lock, 15) + '</i><div><span>' + esc(m[0]) + '</span><small>' + esc(m[1]) + '</small></div></div>'; }).join('')) + '</div>';
      case 'galeria':
        return '<div class="ed-demo">' + card('<span class="ed-kicker">' + esc(S.galUploaded) + '</span><div class="ed-photos3">' + ['torre', 'beso', 'muro', 'paseo', 'escalera', 'torre'].map(function (f, i) { return '<img src="/assets/fotos/' + f + '.jpg" alt="' + esc(S.galShot(i + 1)) + '" loading="lazy"' + (i === 5 ? ' style="transform:scaleX(-1)"' : '') + '>'; }).join('') + '</div>', 'grid-column:1/-1') + '</div>';
      case 'bilingue':
        return '<div class="ed-demo">' + [[S.biEs, S.biEsT, S.biEsMsg], [S.biEn, S.biEnT, S.biEnMsg]].map(function (x) {
          return card('<span class="ed-kicker">' + esc(x[0]) + '</span><span class="t">' + esc(x[1]) + '</span><span class="s">' + esc(x[2]) + '</span><span class="s serif" style="font-size:22px">' + esc(couple(state)) + '</span>');
        }).join('') + '</div>';
      case 'dominio':
        return '<div class="ed-demo"><div class="ed-browser"><div class="ed-browser-bar"><i></i><i></i><i></i><span>https://' + esc(slug(state)) + '</span></div><div class="ed-browser-body" style="background:' + accentOf(state) + '"><b>' + esc(couple(state)) + '</b><span style="font-size:12px;letter-spacing:.16em;text-transform:uppercase">' + esc(fmtDate(state.date)) + '</span></div></div></div>';
    }
    return '';
  }
  function addonPage(id) {
    var t = ADDON_TXT[id], on = !!cart[id];
    var pk = PACKS.filter(function (p) { return !p.feat && p.ids.indexOf(id) > -1; })[0];
    return '<div class="ed-head" style="gap:8px"><span class="ed-badge">' + esc(S.addonK) + ' · ' + esc(on ? S.inYourCart : S.available) + '</span><h1 id="edH1" tabindex="-1">' + esc(t[0]) + '</h1><p class="ed-lead">' + esc(t[2]) + '</p></div>' +
      '<div id="edDemo">' + addonDemo(id) + '</div>' + addonSetup(id) +
      '<ul class="ed-points">' + t[3].map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      (pk ? '<div class="ed-packnote"><span>' + esc(S.alsoIn) + ' <strong>' + esc(PACK_TXT[pk.id][0]) + '</strong> · ' + esc(PACK_TXT[pk.id][1]) + '</span><button type="button" class="ed-link" data-act="drawer">' + esc(S.seePacks) + '</button></div>' : '') +
      '<div class="ed-buy"><div class="ed-buy-price"><b>[$]</b><small>' + esc(S.oneTime) + '</small></div><div class="ed-spacer"></div>' +
      '<button type="button" class="ed-btn ed-btn-lg ' + (on ? 'ed-btn-line' : 'ed-btn-dark') + '" data-act="cart" data-id="' + id + '" data-fk="buy-' + id + '" aria-pressed="' + on + '">' + esc(on ? S.inCartRemove : S.addToInv) + '</button></div>';
  }

  function renderMain() {
    var id = state.sec;
    main.innerHTML = '<div class="ed-sec">' + (SECTION_HTML[id] ? SECTION_HTML[id]() : addonPage(id)) + '</div>';
    var sf = $('#edShareFrame');
    if (sf) { layoutShare(); sf.addEventListener('load', function () { if (sf.contentWindow) sf.contentWindow.postMessage({ lz: 'content', content: state }, location.origin); }); }
  }

  /* ---------- Vista previa: la plantilla real del diseño, dentro de un iframe ----------
     La plantilla lee el contenido de localStorage (KEY) al cargar y luego recibe los cambios por postMessage
     (ver demo/shared/content.js). */
  var pvQueued = false, frameReady = false;
  var frameUrl = function (mode) { return BASE + '/demo/' + state.design + '/?lz=' + mode + '&k=' + encodeURIComponent(KEY) + (mode === 'editor' ? '&sec=' + encodeURIComponent(pvTarget()) : ''); };
  function pvTarget() { return state.sec === 'invitados' ? 'rsvp' : SECS.indexOf(state.sec) > -1 ? state.sec : ADDON_SPOT[state.sec]; }
  function post(msg) {
    if (frameReady && frame.contentWindow) frame.contentWindow.postMessage(msg, location.origin);
    var sf = msg.lz === 'content' && $('#edShareFrame'); if (sf && sf.contentWindow) sf.contentWindow.postMessage(msg, location.origin);
  }
  function renderPreview(scroll) {
    post({ lz: 'content', content: state });
    if (scroll) post({ lz: 'goto', sec: pvTarget() });
  }
  function queuePreview() { if (pvQueued) return; pvQueued = true; requestAnimationFrame(function () { pvQueued = false; renderPreview(false); }); }
  // La plantilla siempre se dibuja a un tamaño fijo y se reduce para caber, así no se deforma:
  // "Móvil" como un iPhone 16 Pro Max (440 × 956) y "Escritorio" a 1280 px de ancho.
  var PHONE_W = 440, PHONE_H = 956;
  function layoutFrame() {
    var ph = $('#edPhone');
    if (ui.device === 'd' && !isMobile()) {
      ph.style.cssText = '';
      var w = ph.clientWidth - 16, k = w / 1280;
      ph.style.height = Math.round(w * 0.68 + 16) + 'px';
      frame.style.cssText = 'width:1280px;height:' + Math.round(w * 0.68 / k) + 'px;transform:scale(' + k + ')';
      return;
    }
    var pad = 10, maxW, maxH;
    if (isMobile()) {
      var st = $('.ed-pv-sticky'), cap = $('.ed-pv-cap');
      if (!st.clientHeight) return; // la pestaña "Vista previa" está oculta
      maxW = Math.min(st.clientWidth, 380);
      maxH = st.clientHeight - (cap ? cap.offsetHeight + 16 : 0);
    } else {
      maxW = 300;
      maxH = Math.max(420, window.innerHeight - 200);
    }
    var iw = Math.min(maxW - 2 * pad, (maxH - 2 * pad) * PHONE_W / PHONE_H), k = iw / PHONE_W;
    ph.style.cssText = 'flex:none;width:' + Math.round(iw + 2 * pad) + 'px;height:' + Math.round(PHONE_H * k + 2 * pad) + 'px;min-height:0;max-height:none';
    frame.style.cssText = 'position:absolute;top:' + pad + 'px;left:' + pad + 'px;width:' + PHONE_W + 'px;height:' + PHONE_H + 'px;transform:scale(' + k + ');transform-origin:0 0;border-radius:' + Math.round(31 / k) + 'px';
  }

  /* ---------- Panel de complementos ---------- */
  function drawerHTML() {
    var n = cartCount(cart), mob = isMobile();
    return '<div class="ed-overlay"><button type="button" class="scrim" data-act="drawer-close" aria-label="' + esc(S.closeAddons) + '" tabindex="-1"></button>' +
      '<section class="ed-drawer" role="dialog" aria-modal="true" aria-labelledby="drTitle"><div class="ed-grab"><span></span></div>' +
      '<div class="ed-drawer-head"><div><h2 id="drTitle">' + esc(S.addons) + '</h2><p>' + esc(S.drawerSub) + '</p></div><button type="button" class="ed-icon-btn" data-act="drawer-close" aria-label="' + esc(S.close) + '">' + svg(P.x, 16, 2) + '</button></div>' +
      '<div class="ed-drawer-body"><span class="ed-kicker">' + esc(S.packsK) + '</span><div class="ed-packs">' + PACKS.map(function (p) {
        var full = p.ids.every(function (id) { return cart[id]; }), t = PACK_TXT[p.id];
        return '<div class="ed-pack' + (p.feat ? ' feat' : '') + (full && !p.feat ? ' full' : '') + '"><div><div class="nm"><b>' + esc(t[0]) + '</b><span class="save">' + esc(S.saveP) + '</span></div><span class="it">' + esc(t[1]) + '</span><span class="pr">[Precio]</span></div>' +
          '<button type="button" class="ed-btn ed-btn-sm ' + (full ? 'ed-btn-line' : 'ed-btn-dark') + '" data-act="pack" data-id="' + p.id + '" data-fk="pack-' + p.id + '" aria-pressed="' + full + '" aria-label="' + esc((full ? S.remove : S.add) + ' · ' + t[0]) + '">' + esc(full ? S.inCart : S.add) + '</button></div>';
      }).join('') + '</div>' +
      '<span class="ed-kicker" style="margin-top:10px">' + esc(S.singlesK) + '</span>' + ADDON_IDS.map(function (id) {
        var on = !!cart[id], t = ADDON_TXT[id];
        return '<div class="ed-item' + (on ? ' on' : '') + '"><div><button type="button" class="ed-item-link" data-act="sec" data-id="' + id + '">' + esc(t[0]) + '</button><span>' + esc(t[1].replace('{d}', slug(state))) + (mob ? ' · [$]' : '') + '</span></div><span class="pr">[$]</span>' +
          '<button type="button" class="ed-btn ed-btn-sm ' + (on ? '' : 'ed-btn-dark') + '" data-act="cart" data-id="' + id + '" data-fk="dcart-' + id + '" aria-label="' + esc((on ? S.remove : S.add) + ' ' + t[0]) + '">' + esc(on ? S.remove : S.add) + '</button></div>';
      }).join('') + '</div>' +
      '<div class="ed-drawer-foot"><div class="ed-total"><span aria-live="polite">' + esc(S.nAddons(n)) + '</span><b>[Total]</b></div>' +
      '<a class="ed-btn ed-btn-dark" href="' + BASE + '/editor/pago/"' + (n ? '' : ' aria-disabled="true" tabindex="-1"') + '>' + esc(S.pay) + '</a><small>' + esc(S.payNote) + '</small></div></section></div>';
  }
  function renderDrawer() { if (ui.drawer) layer.innerHTML = drawerHTML(); }
  function openDrawer(opener) {
    ui.drawer = true; ui.opener = opener || document.activeElement; closeNav();
    layer.innerHTML = drawerHTML(); document.body.classList.add('ed-locked');
    var c = layer.querySelector('.ed-drawer-head .ed-icon-btn'); if (c) c.focus();
  }
  function closeDrawer() {
    if (!ui.drawer) return false;
    ui.drawer = false; layer.innerHTML = ''; document.body.classList.remove('ed-locked');
    if (/^#(complementos|addons)$/.test(location.hash)) { try { history.replaceState(null, '', '#' + state.sec); } catch (e) {} }
    if (ui.opener && document.body.contains(ui.opener)) ui.opener.focus();
    return true;
  }

  /* ---------- Ver como invitado: la plantilla completa, empezando por la apertura ---------- */
  function openGuest(opener) {
    closeNav(); ui.drawer = false; ui.opener = opener || document.activeElement; ui.guest = true;
    stopSample(); clearTimeout(saveTimer); var ok = store(KEY, state); ui.saving = ok ? 'saved' : 'fail'; renderChrome();
    layer.innerHTML = '<div class="ed-guest" role="dialog" aria-modal="true" aria-labelledby="gTitle"><div class="ed-guest-bar"><span id="gTitle">' + esc(S.guestTitle) + '</span>' +
      '<button type="button" class="ed-btn" data-act="guest-close">' + esc(S.closeGuest) + '</button></div>' +
      '<iframe class="ed-guest-frame" title="' + esc(S.guestTitle) + '" src="' + frameUrl('vista') + '"></iframe></div>';
    document.body.classList.add('ed-locked');
    layer.querySelector('[data-act="guest-close"]').focus();
  }
  function closeGuest() {
    if (!ui.guest) return false;
    ui.guest = false; layer.innerHTML = ''; document.body.classList.remove('ed-locked');
    if (ui.opener && document.body.contains(ui.opener)) ui.opener.focus();
    return true;
  }

  /* ---------- Menú móvil ---------- */
  function openNav() {
    ui.nav = true; nav.classList.add('open'); $('.ed-menu').setAttribute('aria-expanded', 'true');
    var s = document.createElement('button'); s.type = 'button'; s.className = 'ed-nav-scrim'; s.setAttribute('data-act', 'menu-close'); s.setAttribute('aria-label', S.closeMenu); s.tabIndex = -1;
    nav.parentNode.insertBefore(s, nav);
    var cur = nav.querySelector('[aria-current]') || nav.querySelector('button'); if (cur) cur.focus();
  }
  function closeNav(refocus) {
    if (!ui.nav) return false;
    ui.nav = false; nav.classList.remove('open'); $('.ed-menu').setAttribute('aria-expanded', 'false');
    var s = root.querySelector('.ed-nav-scrim'); if (s) s.remove();
    if (refocus) $('.ed-menu').focus();
    return true;
  }

  /* ---------- Guardado ---------- */
  var saveTimer, warned = false;
  function saveSoon() {
    ui.saving = 'saving'; clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var ok = store(KEY, state); ui.saving = ok ? 'saved' : 'fail'; renderChrome();
      if (!ok && !warned) { warned = true; toast(S.saveFailLong); }
      if (ok) warned = false;
    }, 450);
  }
  function changed(form) {
    saveSoon();
    keepFocus(function () { renderChrome(); renderNav(); if (form) renderMain(); });
    if (form) renderPreview(false); else queuePreview();
  }
  function go(id, focusHeading) {
    if (!S.sec[id] && ADDON_IDS.indexOf(id) < 0) return;
    state.sec = id; saveSoon(); stopSample();
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    closeDrawerSilently();
    var wasNav = closeNav();
    renderChrome(); renderNav(); renderMain(); renderPreview(true);
    main.scrollTop = 0;
    if (!isMobile()) { var top = root.querySelector('.ed-body').getBoundingClientRect().top + window.pageYOffset - 70; if (window.pageYOffset > top) window.scrollTo(0, Math.max(0, top)); }
    if (focusHeading || wasNav) { var h = $('#edH1'); if (h) h.focus({ preventScroll: true }); }
  }
  function closeDrawerSilently() { if (ui.drawer) { ui.drawer = false; layer.innerHTML = ''; document.body.classList.remove('ed-locked'); } }
  function setCart(next, msg) {
    cart = next; saveCart(cart); if (msg) toast(msg);
    keepFocus(function () { renderChrome(); renderNav(); if (ADDON_IDS.indexOf(state.sec) > -1 || ['portada', 'historia'].indexOf(state.sec) > -1) renderMain(); renderDrawer(); });
  }
  function stopSample() { if (ui.audio) { ui.audio.pause(); ui.audio = null; } ui.playing = null; }

  /* ---------- Archivos ---------- */
  var OK_IMG = /^image\/(jpeg|png|webp)$/;
  function handleFiles(kind, files) {
    files = Array.prototype.slice.call(files || []);
    if (!files.length) return;
    if (kind === 'csv') {
      var cf = files[0];
      if (!/\.(csv|txt)$/i.test(cf.name) && !/csv|text\/plain/.test(cf.type)) { toast(S.gBadFile); return; }
      var rd = new FileReader();
      rd.onload = function () {
        var res = rowsToInvitations(parseCSV(rd.result)), added = 0, ppl = 0;
        if (!res.list.length) { toast(S.gNone); return; }
        res.list.forEach(function (n) {
          var ex = state.invitations.filter(function (x) { return x.name.toLowerCase() === n.name.toLowerCase(); })[0];
          if (ex) { n.people.forEach(function (p) { if (ex.people.indexOf(p) < 0) ex.people.push(p); }); if (!ex.phone) ex.phone = n.phone; if (!ex.email) ex.email = n.email; }
          else { n.id = ++state.uid; state.invitations.push(n); }
          added++; ppl += n.people.length;
        });
        changed(true); toast(S.gImported(added, ppl, res.skipped));
      };
      rd.readAsText(cf, 'utf-8');
      return;
    }
    if (kind === 'music') {
      var mp3 = files[0];
      if (!(mp3.type === 'audio/mpeg' || mp3.type === 'audio/mp3' || /\.mp3$/i.test(mp3.name))) { toast(S.badMp3); return; }
      if (mp3.size > 15 * 1048576) { toast(S.mp3Big); return; }
      stopSample();
      mediaPut(KEY + ':music', mp3).then(function (ok) {
        if (!ok) { toast(S.mp3Fail); return; }
        state.musicFileName = mp3.name; state.musicFileSize = mp3.size; state.musicSource = 'upload';
        changed(true);
      });
      return;
    }
    if (kind === 'mono') {
      var f = files[0];
      if (!/^image\/(svg\+xml|png)$/.test(f.type)) { toast(S.badMono); return; }
      readImage(f, 500, true, function (url) { if (!url) return toast(S.badFile); state.monoImg = url; state.mono = 'custom'; state.sealMode = 'mono'; changed(true); });
      return;
    }
    files = files.filter(function (x) { return OK_IMG.test(x.type); });
    if (!files.length) { toast(S.badFile); return; }
    if (kind === 'cover') { readImage(files[0], 1400, false, function (url) { if (!url) return toast(S.badFile); state.cover = url; changed(true); }); return; }
    files = files.slice(0, 12 - state.gallery.length);
    var left = files.length, got = [];
    files.forEach(function (x, i) { readImage(x, 1000, false, function (url) { got[i] = url; if (--left === 0) { state.gallery = state.gallery.concat(got.filter(Boolean)).slice(0, 12); changed(true); } }); });
  }
  // Mueve una foto de la galería sin perder cuál se eligió para compartir (sharePhoto n = galería n-1).
  function moveGallery(from, to) {
    var idx = state.gallery.map(function (_, k) { return k; });
    moveItem(state.gallery, from, to); moveItem(idx, from, to);
    if (state.sharePhoto > 0) state.sharePhoto = idx.indexOf(state.sharePhoto - 1) + 1;
  }
  function moveItem(list, from, to) { if (to < 0 || to >= list.length) return; var x = list.splice(from, 1)[0]; list.splice(to, 0, x); }

  /* ---------- Eventos ---------- */
  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.type === 'file') return;
    if (t.hasAttribute('data-gsearch')) { ui.gq = t.value; var pos = t.selectionStart; renderMain(); var sb = $('[data-gsearch]'); if (sb) { sb.focus(); try { sb.setSelectionRange(pos, pos); } catch (x) {} } return; }
    if (t.hasAttribute('data-inv')) {
      var gi = state.invitations[+t.getAttribute('data-inv')]; if (!gi) return;
      if (t.hasAttribute('data-p')) gi.people[+t.getAttribute('data-p')] = t.value; else gi[t.getAttribute('data-f')] = t.value;
      changed(false); return;
    }
    if (t.getAttribute('data-k') === 'palCustom') {
      state.palCustom = t.value; state.pal = 'custom'; changed(false);
      $$('.ed-pal[role="radio"]').forEach(function (b) { b.setAttribute('aria-checked', 'false'); });
      t.parentNode.classList.add('is-on'); var pn = $('#palNote'); if (pn) pn.hidden = !isLight(t.value);
      return;
    }
    if (t.hasAttribute('data-k') && /^(INPUT|TEXTAREA)$/.test(t.tagName)) { state[t.getAttribute('data-k')] = t.value; changed(false); }
    else if (t.hasAttribute('data-list')) { var it = state[t.getAttribute('data-list')][+t.getAttribute('data-i')]; if (it) { it[t.getAttribute('data-f')] = t.value; changed(false); } }
    else return;
    if (t.getAttribute('data-f') === 'mapUrl') { var mh = $('[data-maphint="' + state.events[+t.getAttribute('data-i')].id + '"]'); if (mh) mh.hidden = !t.value.trim() || isMapsUrl(t.value.trim()); }
    var demo = $('#edDemo'); if (demo) demo.innerHTML = addonDemo(state.sec);
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type === 'file' && t.hasAttribute('data-file')) { handleFiles(t.getAttribute('data-file'), t.files); t.value = ''; }
    else if (t.tagName === 'SELECT' && t.hasAttribute('data-k')) { state[t.getAttribute('data-k')] = t.value; changed(false); }
    else if (t.tagName === 'SELECT' && t.hasAttribute('data-list')) { var item=state[t.getAttribute('data-list')][+t.getAttribute('data-i')]; if(item){item[t.getAttribute('data-f')]=t.value;changed(false);} }
    else if (t.name === 'cdEvent') { state.countdownId = +t.value; changed(false); }
    else if (t.getAttribute('data-list') === 'events' && /^(place|address)$/.test(t.getAttribute('data-f'))) {
      // Al salir del campo: el mapa y la búsqueda de ese evento apuntan a la nueva dirección.
      var ev = state.events[+t.getAttribute('data-i')], body = t.closest('.ed-ev-body'), q = ev && mapQuery(ev);
      if (!body || !q) return;
      var fr = body.querySelector('.ed-map'), a = body.querySelector('[data-mapsearch]');
      if (fr) fr.src = mapsEmbed(q);
      if (a) a.href = mapsSearch(q);
    }
  });
  root.addEventListener('dragover', function (e) {
    var z = e.target.closest && e.target.closest('[data-drop],.ed-thumb');
    if (!z) return;
    e.preventDefault();
    if (z.hasAttribute('data-drop') && ui.dragIdx == null) z.classList.add('over');
    if (z.classList.contains('ed-thumb') && ui.dragIdx != null) { $$('.ed-thumb.target').forEach(function (x) { x.classList.remove('target'); }); z.classList.add('target'); }
  });
  root.addEventListener('dragleave', function (e) { var z = e.target.closest && e.target.closest('[data-drop]'); if (z) z.classList.remove('over'); });
  root.addEventListener('drop', function (e) {
    var z = e.target.closest && e.target.closest('[data-drop],.ed-thumb');
    if (!z) return;
    e.preventDefault();
    if (ui.dragIdx != null) {
      var to = z.classList.contains('ed-thumb') ? +z.getAttribute('data-gi') : state.gallery.length - 1;
      moveGallery(ui.dragIdx, to); ui.dragIdx = null; changed(true); return;
    }
    z.classList.remove('over');
    if (z.hasAttribute('data-drop')) handleFiles(z.getAttribute('data-drop'), e.dataTransfer.files);
  });
  root.addEventListener('dragstart', function (e) {
    var th = e.target.closest && e.target.closest('.ed-thumb');
    if (!th) return;
    ui.dragIdx = +th.getAttribute('data-gi'); th.classList.add('dragging');
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(ui.dragIdx)); } catch (x) {}
  });
  root.addEventListener('dragend', function () { ui.dragIdx = null; $$('.ed-thumb').forEach(function (x) { x.classList.remove('dragging', 'target'); }); });

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !root.contains(b)) return;
    var act = b.getAttribute('data-act'), id = b.getAttribute('data-id'), i = +b.getAttribute('data-i'), d = +b.getAttribute('data-d');
    if (b.tagName === 'A' && b.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    switch (act) {
      case 'sec': go(id, true); break;
      case 'menu': ui.nav ? closeNav(true) : openNav(); break;
      case 'menu-close': closeNav(true); break;
      case 'drawer': openDrawer(b); break;
      case 'drawer-close': closeDrawer(); break;
      case 'cart':
        var c1 = Object.assign({}, cart); if (c1[id]) delete c1[id]; else c1[id] = true;
        setCart(c1, (c1[id] ? S.addedT : S.removedT)(addonName(id))); break;
      case 'pack':
        var p = PACKS.filter(function (x) { return x.id === id; })[0], c2 = Object.assign({}, cart);
        var full = p.ids.every(function (x) { return c2[x]; });
        p.ids.forEach(function (x) { if (full) delete c2[x]; else c2[x] = true; });
        setCart(c2, (full ? S.removedT : S.addedT)(PACK_TXT[id][0])); break;
      case 'guest': openGuest(b); break;
      case 'guest-close': closeGuest(); break;
      case 'publish':
        var pending = SECS.filter(function (x) { return !doneOf(x); });
        // TODO: publicar de verdad cuando haya cuentas y backend (y el pago de la plantilla esté conectado).
        modal('<h2 id="mdTitle">' + esc(S.pubTitle) + '</h2><p>' + esc(S.pubText) + '</p>' +
          (pending.length ? '<p style="margin-top:4px"><b style="font-weight:500;color:var(--ink)">' + esc(S.pubPending) + '</b></p><ul>' + pending.map(function (x) { return '<li>' + esc(secName(x)) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(S.pubAll) + '</p>') +
          '<div class="ed-modal-actions"><button type="button" class="ed-btn ed-btn-dark" data-act="modal-close">' + esc(S.ok) + '</button></div>', b);
        break;
      case 'modal-close': closeModal(); break;
      case 'modal-scrim': if (e.target === b) closeModal(); break;
      case 'mode': ui.mode = id; stopSample(); renderChrome(); if (id === 'preview') renderPreview(true); break;
      case 'device': ui.device = id; renderChrome(); setTimeout(function () { renderPreview(true); }, 350); break;
      case 'step':
        var idx = SECS.indexOf(state.sec), nx = idx < 0 ? (d > 0 ? 0 : -1) : idx + d;
        if (nx >= 0 && nx < SECS.length) go(SECS[nx]);
        break;
      case 'pal': state.pal = id; changed(true); break;
      case 'sealMode': state.sealMode = id; changed(true); break;
      case 'shareMode': state.shareMode = id; changed(true); break;
      case 'sharePhoto': state.sharePhoto = i; changed(true); break;
      case 'mono': state.mono = id; changed(true); break;
      case 'mono-del': state.monoImg = ''; if (state.mono === 'custom') state.mono = 'amp'; changed(true); var mf = $('[data-fk="mono-amp"]'); if (mf) mf.focus(); break;
      case 'toggle': var k = b.getAttribute('data-k'); state[k] = !state[k]; changed(true); break;
      case 'ev-move': moveItem(state.events, i, i + d); changed(true); var still = $('[data-fk="' + b.getAttribute('data-fk') + '"]'); if (!still || still.disabled) { var other = $('[data-fk="' + (d < 0 ? 'evd-' : 'evu-') + state.events[i + d].id + '"]'); if (other) other.focus(); } break;
      case 'ev-del': state.events.splice(i, 1); changed(true); focusAfterDelete('[data-list="events"][data-f="name"]', i, '[data-fk="evadd-0"]'); break;
      case 'ev-add':
        var name = PRESETS[i], last = i === PRESETS.length - 1;
        state.events.push({ id: ++state.uid, name: last ? '' : name, time: '', place: '', address: '', mapUrl: '' }); changed(true);
        var inputs = $$('[data-list="events"][data-f="' + (last ? 'name' : 'time') + '"]'); if (inputs.length) inputs[inputs.length - 1].focus();
        break;
      case 'faq-add':
        if (state.faqs.length >= 7) return;
        state.faqs.push({ id: ++state.uid, q: '', a: '' }); changed(true);
        var qs = $$('[data-list="faqs"][data-f="q"]'); if (qs.length) qs[qs.length - 1].focus();
        break;
      case 'ev-map':
        var mev = state.events.filter(function (x) { return String(x.id) === id; })[0];
        if (mev && !mapQuery(mev)) { toast(S.needPlace); break; }
        ui.maps[id] = !ui.maps[id]; keepFocus(renderMain); break;
      case 'gMode': ui.gMode = id; keepFocus(renderMain); break;
      case 'g-new':
        state.invitations.push({ id: ++state.uid, name: '', people: [''], phone: '', email: '' }); ui.gq = ''; changed(true);
        var gn = $$('[data-inv][data-f="name"]'); if (gn.length) gn[gn.length - 1].focus();
        break;
      case 'g-del': state.invitations.splice(i, 1); changed(true); focusAfterDelete('[data-inv][data-f="name"]', i, '[data-fk="g-new"]'); break;
      case 'g-addp':
        state.invitations[i].people.push(''); changed(true);
        var gp = $$('[data-inv="' + i + '"][data-p]'); if (gp.length) gp[gp.length - 1].focus();
        break;
      case 'g-delp': state.invitations[i].people.splice(d, 1); changed(true); var gq = $$('[data-inv="' + i + '"][data-p]'); (gq[Math.min(d, gq.length - 1)] || $('[data-fk="gap-' + i + '"]') || main).focus(); break;
      case 'g-clear':
        modal('<h2 id="mdTitle">' + esc(S.gClear) + '</h2><p>' + esc(S.gClearAsk.replace('{n}', state.invitations.length)) + '</p><div class="ed-modal-actions"><button type="button" class="ed-btn" data-act="modal-close">' + esc(S.cancel) + '</button><button type="button" class="ed-btn ed-btn-dark" data-act="g-clear-yes">' + esc(S.gClear) + '</button></div>', b);
        break;
      case 'g-clear-yes': state.invitations = []; closeModal(); changed(true); toast(S.gCleared); break;
      case 'poll-add':
        if (state.polls.length >= 6) return;
        var idea = i >= 0 ? pollIdeasLeft()[i] : '';
        state.polls.push({ id: ++state.uid, q: idea || '', opts: '' }); changed(true);
        var pq = $$('[data-list="polls"][data-f="' + (idea ? 'opts' : 'q') + '"]'); if (pq.length) pq[pq.length - 1].focus();
        break;
      case 'poll-del': state.polls.splice(i, 1); changed(true); focusAfterDelete('[data-list="polls"][data-f="q"]', i, '[data-fk="poll-add"]'); break;
      case 'pollReveal': state.pollReveal = id; changed(true); break;
      case 'faq-del': state.faqs.splice(i, 1); changed(true); focusAfterDelete('[data-list="faqs"][data-f="q"]', i, '[data-fk="faq-add"]'); break;
      case 'gal-move': moveGallery(i, i + d); changed(true); var nb = $('.ed-thumb[data-gi="' + (i + d) + '"] [data-act="gal-move"][data-d="' + d + '"]'); if (nb && !nb.disabled) nb.focus(); else { nb = $('.ed-thumb[data-gi="' + (i + d) + '"] [data-act="gal-del"]'); if (nb) nb.focus(); } break;
      case 'gal-del': if (state.sharePhoto === i + 1) state.sharePhoto = 0; else if (state.sharePhoto > i + 1) state.sharePhoto--; state.gallery.splice(i, 1); changed(true); var g = $$('.ed-thumb [data-act="gal-del"]'); (g[Math.min(i, g.length - 1)] || $('[data-file="gallery"]') || main).focus(); break;
      case 'musicSource': stopSample(); state.musicSource = id; changed(true); break;
      case 'track':
        var tr = MUSIC_LIBRARY.filter(function (x) { return x.id === id; })[0];
        if (tr) { state.musicTrack = tr.id; state.musicTrackSrc = tr.src; state.musicSource = 'library'; changed(true); }
        break;
      case 'music-play':
        var same = ui.playing === id && ui.audio && !ui.audio.paused;
        stopSample();
        if (!same) {
          var start = function (src) { try { ui.audio = new Audio(src); ui.playing = id; ui.audio.addEventListener('ended', function () { stopSample(); keepFocus(renderMain); }); ui.audio.play().catch(function () { stopSample(); keepFocus(renderMain); }); } catch (x) { stopSample(); } keepFocus(renderMain); };
          if (id === 'upload') mediaGet(KEY + ':music').then(function (blob) { if (blob) { if (ui.blobUrl) URL.revokeObjectURL(ui.blobUrl); ui.blobUrl = URL.createObjectURL(blob); start(ui.blobUrl); } });
          else { var lt = MUSIC_LIBRARY.filter(function (x) { return 'lib:' + x.id === id; })[0]; if (lt) start(lt.src); }
        }
        keepFocus(renderMain); break;
      case 'music-del':
        stopSample(); mediaDel(KEY + ':music');
        state.musicFileName = ''; state.musicFileSize = 0; changed(true);
        var dz = $('[data-file="music"]'); if (dz) dz.focus();
        break;
    }
  });
  function focusAfterDelete(sel, i, fallback) { var l = $$(sel); var el = l[Math.min(i, l.length - 1)] || $(fallback); if (el) el.focus(); }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (closeModal() || closeGuest() || closeDrawer() || closeNav(true)) e.preventDefault(); return; }
    var box = document.querySelector('.ed-modal-box') || document.querySelector('.ed-guest') || document.querySelector('.ed-drawer') || (ui.nav ? nav : null);
    trap(e, box);
  });
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) { cart = loadCart(); keepFocus(function () { renderChrome(); renderNav(); renderMain(); renderDrawer(); }); } });
  window.addEventListener('hashchange', function () { var h = decodeURIComponent(location.hash.slice(1)); if (h === 'complementos' || h === 'addons') openDrawer(); else if (h !== state.sec && (S.sec[h] || ADDON_IDS.indexOf(h) > -1)) go(h); });
  var mq = window.matchMedia('(max-width: 960px)'), onMq = function () { closeNav(); renderChrome(); renderDrawer(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);

  // La plantilla carga con el contenido guardado; después recibe cada cambio al momento.
  store(KEY, state);
  frame.addEventListener('load', function () { frameReady = true; renderPreview(true); });
  frame.src = frameUrl('editor');
  window.addEventListener('resize', layoutFrame);
  window.addEventListener('resize', layoutShare);
  $('#edPhone').addEventListener('transitionend', layoutFrame); // el marco anima su ancho al cambiar de dispositivo
  renderChrome(); renderNav(); renderMain();
  if (ui.drawer) openDrawer($('.ed-cartbtn'));

  /* =========================================================
     Pago de complementos
     ========================================================= */
  function checkout() {
    var st = loadState(), cart = loadCart(), method = 'card', notice = false;
    root.innerHTML = '<div class="ed">' +
      '<header class="co-top"><a class="co-back" href="' + BASE + '/editor/">' + svg(P.left, 16, 2) + esc(S.back) + '</a><div class="ed-spacer"></div>' +
      '<a class="ed-logo" href="' + BASE + '/" aria-label="Lazo">' + logo + '</a><div class="ed-spacer"></div>' +
      '<span class="co-secure">' + svg(P.lock, 14) + esc(S.secure) + '</span></header><div class="co-wrap" id="coWrap"></div></div><div id="edModal"></div>';
    var wrap = document.getElementById('coWrap');
    var f = function (label, ph, cls, extra) { return '<label class="ed-field' + (cls ? ' ' + cls : '') + '">' + esc(label) + '<input placeholder="' + esc(ph) + '" autocomplete="off"' + (extra || '') + '></label>'; };
    function render() {
      var lines = cartLines(cart), n = cartCount(cart);
      var lineHTML = lines.map(function (l) {
        var name, sub, price, key;
        if (l.pack) { name = l.pack.feat ? PACK_TXT[l.pack.id][0] : S.pack + ' ' + PACK_TXT[l.pack.id][0]; sub = PACK_TXT[l.pack.id][1]; price = '[Precio]'; key = 'pack:' + l.pack.id; }
        else { name = ADDON_TXT[l.id][0]; sub = l.id === 'dominio' ? slug(st) : ADDON_TXT[l.id][1].replace('{d}', slug(st)); price = '[$]'; key = 'one:' + l.id; }
        return '<div class="co-line"><div><b>' + esc(name) + '</b><span>' + esc(sub) + '</span></div><span class="pr">' + price + '</span>' +
          '<button type="button" class="ed-del" data-act="co-del" data-id="' + key + '" aria-label="' + esc(S.removeLine + ' ' + name) + '">' + svg(P.x, 16, 2) + '</button></div>';
      }).join('');
      wrap.innerHTML =
        '<section class="co-main"><div class="ed-head" style="gap:8px"><span class="ed-kicker">' + esc(S.weddingOf + ' ' + couple(st)) + '</span><h1>' + esc(S.coH1) + '</h1><p>' + esc(S.coLead) + '</p></div>' +
        '<div class="ed-stack"><span class="ed-label" id="lblM">' + esc(S.method) + '</span><div class="co-methods" role="group" aria-labelledby="lblM">' +
          '<button type="button" data-act="method" data-id="card" aria-pressed="' + (method === 'card') + '">' + svg(P.card, 20, 1.7) + esc(S.card) + '</button>' +
          '<button type="button" data-act="method" data-id="paypal" aria-pressed="' + (method === 'paypal') + '">' + esc(S.paypal) + '</button></div></div>' +
        (method === 'card'
          // TODO: sustituir estos campos por los del proveedor de pago (p. ej. campos alojados) al conectar el cobro. No se leen ni se guardan.
          ? '<div class="ed-grid2 co-grid">' + f(S.cardName, S.cardNamePh, 'full') + f(S.cardNum, '0000 0000 0000 0000', 'full', ' inputmode="numeric"') + f(S.exp, S.expPh, '', ' inputmode="numeric"') + f(S.cvc, '123', '', ' inputmode="numeric"') + '</div>'
          : '<p class="co-paypal">' + esc(S.paypalText) + '</p>') +
        '</section>' +
        '<aside class="co-sum" aria-label="' + esc(S.order) + '"><h2>' + esc(S.order) + '</h2>' +
          (n ? '<div>' + lineHTML + '</div>' : '<div class="co-empty"><p style="margin:0">' + esc(S.empty) + '</p><a class="ed-btn" href="' + BASE + '/editor/#complementos">' + esc(S.emptyCta) + '</a></div>') +
          (n >= 4 && n < 7 ? '<div class="co-up"><span>' + S.upsellTxt(n) + '</span><button type="button" class="ed-btn ed-btn-line ed-btn-sm" data-act="co-all">' + esc(S.change) + '</button></div>' : '') +
          '<div class="co-total"><span>' + esc(S.total) + '</span><b>[Total] <small>USD</small></b></div>' +
          '<button type="button" class="ed-btn ed-btn-dark co-pay" data-act="co-pay"' + (n ? '' : ' disabled') + '>' + esc(method === 'card' ? S.payBtn : S.payPaypal) + '</button>' +
          '<div aria-live="polite">' + (notice ? '<p class="co-notice">' + esc(S.notConnected) + '</p>' : '') + '</div>' +
          '<span class="co-note">' + esc(S.payNote2) + '</span></aside>';
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act'), id = b.getAttribute('data-id');
      if (act === 'method') { method = id; notice = false; render(); var m = wrap.querySelector('[data-act="method"][data-id="' + id + '"]'); if (m) m.focus(); }
      else if (act === 'co-del') {
        var parts = id.split(':');
        if (parts[0] === 'pack') PACKS.filter(function (p) { return p.id === parts[1]; })[0].ids.forEach(function (x) { delete cart[x]; });
        else delete cart[parts[1]];
        saveCart(cart); notice = false; render(); var nx = wrap.querySelector('[data-act="co-del"]') || wrap.querySelector('.co-empty a'); if (nx) nx.focus();
      }
      else if (act === 'co-all') { ADDON_IDS.forEach(function (x) { cart[x] = true; }); saveCart(cart); render(); wrap.querySelector('.co-pay').focus(); }
      else if (act === 'co-pay') {
        // TODO: conectar el pago real (tarjeta o PayPal). Igual que los enlaces de pago pendientes del README: hoy no se cobra nada.
        notice = true; render(); wrap.querySelector('.co-pay').focus();
      }
    });
    window.addEventListener('storage', function (e) { if (e.key === CART_KEY) { cart = loadCart(); render(); } });
    render();
  }
})();
