# Invitesse — tienda de invitaciones web

Sitio estático (HTML + CSS + un poco de JS), sin paso de build.

- `/` — español (`index.html`)
- `/en/` — inglés (`en/index.html`)
- `/disenos/` y `/en/disenos/` — colección con estilos como filtro principal, aperturas desplegables, filtros de lugar y colores, búsqueda y tarjeta a medida. Lógica compartida en `disenos/galeria.js`; los filtros quedan en la URL (`?apertura=sobre&estilo=…`). La hoja móvil tiene foco contenido, fondo inerte y cierre con Escape.
- `disenos/catalogo.js` — datos y tarjetas de los diseños. La propiedad opcional `thumb` usa miniaturas WebP de 280 y 554 px; sin ella se usa `img[0]`. Las seis tarjetas seleccionadas de la landing se mantienen en sus HTML estáticos ES/EN.
- `assets/brand/` — marca Invitesse: `brand.css` (colores, Bodoni Moda + Geist, el logo `.iv-wm` y el sello `.iv-mark`) y `favicon.svg`. El inicio, el catálogo, el editor, la cuenta y el panel usan estos mismos colores; los nombres internos (`LazoAuth`, `lazo.*` en localStorage, `lz-*`) se conservan para no perder datos guardados.
- Inicio (`/` y `/en/`): estilos en `assets/brand/home.css`, tarjetas compartidas en `cards.css` y menú en `home.js`. Hero estático de Romántico con enlace nativo a la demo; no hay iframe, modal ni apertura simulada en la landing. Seis diseños, prueba de confirmación/panel de la misma pareja, tres pasos del editor, opciones, complementos compactos y FAQ. El catálogo usa `catalog.css`. Las aperturas ocurren únicamente dentro de las demos y el navegador conserva el regreso a la colección.
- Editor: la primera vez muestra una bienvenida con la guía de cinco pasos y un recorrido que ilumina cada parte (`?guia=0` la omite). El botón «Guía» muestra el avance y «Cambiar diseño»/«Diseños» abre los diseños sin salir; un diseño nuevo trae el contenido del último que editaron.
- `assets/` — capturas de los diseños
- `/en/demo/<diseño>/` — versión en inglés de cada demo (generada a partir de la española)
- `/demo/clasico/` — demo del diseño clásico (sobre con carta)
- `/demo/moderno/` — demo del diseño moderno, blanco y negro (puertas y capítulos)
- `/demo/rosa/` — demo del diseño romántico (sobre lacrado)
- `/demo/jardin/` — demo del diseño jardín (sobre de semillas; flores en acuarela que crecen al bajar). Paletas: hoja, lavanda y eucalipto. «Ver invitación directamente» salta la apertura; la confirmación de la demo vive solo en memoria (no se envía y se reinicia al recargar; la plantilla borra las claves `lazo-demo-rsvp:` que dejaban versiones anteriores); «Explorar demo» agrupa color, panel y tienda. Los controles del RSVP tienen variantes para el editor (`data-lz-rsvp` o, en pruebas internas, `?rsvp=texto|sino|voy|elegante|iconos`); la demo usa «Asistirá / No asistirá». Laboratorio interno, fuera de la demo de la tienda: ramas en acuarela WebP solo con `?acuarela=webp`: capas de pigmento en `assets/jardin/jardin-rama-*.webp` que se tiñen con la paleta
- `/demo/costa/` — demo del diseño costa, para bodas destino (pase de abordar, el mar en movimiento y tablero de salidas). Paletas: cobalto, verde agua y barro. El pase se vuelve horizontal desde 640 px y la apertura se desplaza por dentro en pantallas bajas. «Abordar» es la única entrada: cuerpo y talón son dos piezas con máscaras complementarias (perforación y línea de rotura) y el talón se desprende antes de entrar. El mar usa sus propios tonos marinos en las tres paletas. El check-in de la demo vive solo en memoria (se reinicia al recargar) y muestra «Voy / No voy»; las otras variantes quedan para el editor (`data-lz-rsvp`). Encuadre de la foto de portada con `--hero-x` / `--hero-y`
- `/demo/gala/` — demo del diseño gala, art déco de noche (medallón dorado que estalla en confeti). Paletas: negro y oro, esmeralda, burdeos y oro rosa
- `/demo/aurelia/` — demo del diseño Aurelia, editorial en blanco y oro (carpeta con faja dorada que se abre como un libro). Paletas: oro, plata y oro rosa
- `/demo/noir/` — demo del diseño noir, etiqueta negra (tarjeta de puerta doble con faja de plata, fotos en blanco y negro). Paletas: negro, verde bosque y medianoche
- `/demo/lino/` — demo del diseño lino, natural y artesanal (juego de tres tarjetas con faja de papel vegetal que se abre en abanico). Paletas: salvia, arena y piedra
- `/demo/marfil/` — demo del diseño marfil, clásico y elegante (papel vegetal con lazo de seda, escudo de laurel). Paletas: burdeos, azul noche y verde inglés
- `/demo/fiesta/` — demo del diseño fiesta, alegre y mexicano (papel picado, carta de lotería y confeti). Paletas: fiesta, pastel y rosa mexicano
- `/demo/celeste/` — demo del diseño celeste, noche estrellada (la luna une las estrellas en un corazón). Paletas: medianoche, aurora y lavanda
- `/demo/cisne/` — demo del diseño cisne, papelería fina en burdeos y oliva (sobre con forro pintado y sello de lacre; tarjetas troqueladas, polaroids, bandeja de plata con encaje, llave con borla). Una sola paleta: el ramo, la bandeja y el óvalo del RSVP son imágenes de `assets/cisne/`
- `/demo/tinta/` — demo del diseño tinta, editorial en blanco y negro con tinta roja (un círculo rojo marca la fecha en el calendario; carta en sobre rojo, preguntas en globos a mano). Paletas: rojo, azul tinta y verde botella
- `/demo/estreno/` — demo del diseño estreno, la boda como noche de estreno (funda de terciopelo con un corazón troquelado por el que asoma la fecha; marquesina de bombillas, fotos en B/N que se revelan, tira de película, cartelera con la cuenta regresiva, la sala con su letrero y una butaca por invitado). Todo en CSS/SVG, sin imágenes propias. Paletas: granate, noche y champán
- `/demo/nacar/` — demo del diseño nácar, lujo silencioso en marfil y topo (estuche de ante cerrado con un hilo de perlas: se suelta el broche, se levanta la tapa y sube la tarjeta; carta en papel vegetal con alfiler de perla, fotos colgadas de un collar, programa con hilo de perlas, etiqueta de equipaje). Todo en CSS/SVG, sin imágenes propias. Paletas: nácar, bruma y oliva
- `/demo/arco/` — demo del diseño arco, editorial de ciudad en verde bosque y papel (ventana en arco empañada: el cristal se limpia desde donde se toca y aparece la pareja; fotos a color en arcos y olas, arcada de fotos, cuenta regresiva en fichas de cristal, «Te esperamos en» con el primer evento). Todo en CSS/SVG, sin imágenes propias. Paletas: bosque, noche y vino
- `/demo/corazones/` — demo del diseño corazones, la boda como la mejor mano (baraja sobre fieltro borgoña que se abre en abanico; el rey y la reina de corazones con la foto de la pareja; naipes con los datos, galería en cartas, fichas de juego para la cuenta regresiva). Todo en CSS/SVG, sin imágenes propias. Paletas: burdeos, tapete y medianoche
- `/demo/encaje/` — demo del diseño encaje, una ventana con visillo y la luz de la tarde (se tira de la borla y el estor de encaje sube en pliegues; la foto en un óvalo calado; bordes de encaje entre secciones cacao y marfil, la semana de la boda con el día en un corazón, fotos con marco de papel y cuenta regresiva en óvalos). Todo en CSS/SVG, sin imágenes propias. Paletas: cacao, salvia y rosa
- `/demo/onix/` — demo del diseño ónix, blanco y negro editorial (sobre negro con lacre marfil que, al abrirse, está forrado con la foto de la pareja y esa foto se vuelve la portada; fotos en blanco y negro, cuenta regresiva en banda negra, relicario de corazón junto al lugar, bandeja de plata sobre las preguntas). Todo en CSS/SVG, sin imágenes propias. Paletas: ónix, pizarra y bosque
- `/demo/senal/` — demo del diseño señal, una tele antigua que reserva la fecha (la tele dorada se enciende sola y pasa cuatro canales con las fotos y «Reserva», «la», «fecha» y la fecha; se apaga en una línea de luz y queda la estática; al abrir, la vista entra por la pantalla). Adentro, una transmisión: en vivo desde el lugar, guía de programación, repeticiones y fin de la transmisión. Todo en CSS/SVG. Paletas: noche, vino y medianoche
- `/demo/glicina/` — demo del diseño glicina, jardín con encaje (una cortina de glicinas que se abre; óvalo de encaje, hortensias, programa con íconos, cita en un corazón). Se puede usar sin fotos (interruptor «Usar fotos» del editor, botón «Sin fotos» de la demo o `?fotos=no`): los nombres van en el óvalo de la portada y la historia lleva una ventana del jardín. Los racimos, la rama, las hortensias y el encaje son imágenes de `assets/glicina/` (los racimos se mecen con CSS). Una sola paleta: lavanda y oliva
- `demo/shared/marcos.js` — marcos dibujados a la medida del contenido para Cisne, Tinta y Glicina (tarjeta troquelada, globos a mano y corazón de encaje); se redibujan si el texto del editor los hace crecer
- `design/` — propuestas de diseño; Jardín, Costa y Gala salen de `design/plantillas-nuevas-v2.html` Aurelia, Noir y Lino de `design/plantillas-nuevas-4.html` Marfil, Fiesta y Celeste de `design/plantillas-nuevas-3.html` y Cisne, Tinta y Glicina de `design/plantillas-nuevas-5.html`. Estas plantillas arman el HTML con JavaScript (las ilustraciones son SVG generados) antes de cargar `content.js`, y la versión en inglés es el mismo archivo con `<html lang="en">`
- Las demos tienen un selector de color en su barra (Clásico: salvia, rosa antiguo, azul noche, terracota; Romántico: champaña, por defecto, y rosado; Moderno: blanco y negro, arena, oliva, azul marino y vino; Jardín: hoja, lavanda y eucalipto; Costa: cobalto, verde agua y barro; Gala: negro y oro, esmeralda, burdeos; Aurelia: oro, plata, oro rosa; Noir: negro, verde bosque, medianoche; Lino: salvia, arena, piedra; Marfil: burdeos, azul noche, verde inglés; Fiesta: fiesta, pastel, rosa mexicano; Celeste: medianoche, aurora, lavanda; Tinta: rojo, azul tinta, verde botella). También por enlace: `/demo/rosa/?color=rosado`. Las paletas viven en `THEMES` de `demo/shared/content.js`
- `/cuenta/` y `/en/cuenta/` — ingresar o crear cuenta y "Mis invitaciones" (los diseños comprados)
- `/comprar/?diseno=<diseño>` y `/en/comprar/…` — compra de un diseño (cuenta + pago; hay un botón de compra de prueba)
- `/editor/?diseno=<diseño>` y `/en/editor/…` — editor del diseño comprado, con la plantilla real en la vista previa y complementos con carrito. Pide sesión y que el diseño esté comprado. Atajos: `#<sección o complemento>` (p. ej. `#musica`) y `#complementos`
- Sección 09 del editor, Invitados: subir la lista en CSV o crearla a mano. Ejemplos para descargar: `/editor/invitados-ejemplo.csv` y `/editor/guests-example.csv` (una fila por persona: Invitación, Persona, Teléfono, Correo; acepta `,` o `;`)
- `/editor/pago/` y `/en/editor/pago/` — pago de los complementos (tarjeta o PayPal; el cobro aún no está conectado)

Para verlo en local:

```bash
python3 -m http.server 4173
```

Pendiente: precios (`[Precio]`, `[$]`, `[Total]`), enlaces de pago (compra del diseño en `/comprar/` y "Pagar y activar" de `/editor/pago/`), publicar desde el editor y WhatsApp. Cuentas y borradores usan Supabase; el carrito sigue siendo local y los archivos grandes requieren una integración de almacenamiento adicional.

Editor y cuentas (el idioma sale de `<html lang>`):

- `editor/auth.js` — cuentas y borradores en Supabase. Registro/confirmación de correo, acceso, recuperación y cierre de sesión. `buy()` prepara un borrador privado, sin acreditar compras. Pendiente: activar la compra desde el servidor al confirmarse el pago.
- `editor/cuenta.js` — páginas de cuenta y compra; `editor/editor.js` + `editor.css` — editor y pago de complementos
- Vista previa al compartir (sección 02 del editor): los novios eligen si el enlace en WhatsApp/Instagram muestra la invitación cerrada o una foto suya (`shareMode`, `sharePhoto`: 0 = portada, n = foto n de la galería). Pendiente: al publicar, el servidor debe generar la imagen `og:image` de 1200 × 630 (captura de `/demo/<diseño>/?lz=vista` con su contenido, o la foto elegida) y poner `og:title`/`og:description` con los nombres, la fecha y el mensaje
- `demo/shared/content.js` — lleva el contenido del editor a la plantilla real. Todos los diseños reciben y muestran los mismos campos (pareja, fecha, ciudad, mensaje, frase de la cuenta regresiva, historia, cita, galería, eventos con lugar y dirección, código de vestimenta, preguntas, viaje con hotel, cómo llegar y guía de la ciudad, RSVP); lo que queda vacío no aparece al ver como invitado. Solo actúa con `?lz=editor` (vista previa) o `?lz=vista` (ver como invitado); sin esos parámetros las demos se ven igual. Las plantillas marcan con `data-lz…` dónde va cada dato

Compartido por las demos:

- `demo/shared/panel.js` + `panel.css` — panel de los novios (vista previa), música de fondo y barra de demo
- `demo/shared/explore.css` + el componente de `panel.js` — «Explorar demo» y «Elegir [diseño]» compartidos ES/EN, con retorno al catálogo. Las herramientas se ocultan mientras se abre el panel o la galería y el hero móvil reserva espacio para evitar superposiciones. No aparecen en las vistas del editor/invitado (`lz-content`).
- `assets/fotos/` — fotos de stock (Pexels) usadas en las demos
- `assets/musica/demo.mp3` — música libre de derechos (Pixabay, paulyudin)
- Biblioteca de música del editor: lista `MUSIC_LIBRARY` en `editor/editor.js`. Para sumar canciones libres de derechos, subir el MP3 a `assets/musica/` y agregar una línea. Los MP3 que suben los novios se guardan por ahora en IndexedDB del navegador (`lazo-media`)

## Revisión de la tienda (octubre 2026)

La landing y el catálogo se presentan como vista previa hasta completar la contratación. Los precios, contactos y condiciones pendientes están detallados en [PENDIENTES-LANZAMIENTO.md](PENDIENTES-LANZAMIENTO.md). No se conectaron pagos ni cuentas reales.

Las capturas `encaje-response-{es,en}.webp` y `encaje-panel-{es,en}.webp` proceden de una misma sesión real de la demo: Familia Rodríguez confirma 4 de 4 personas y el resumen pasa de 13 a 17 asistentes de 32. `romantico-hero.webp` es una captura estática del sobre cerrado real de Romántico; la tarjeta y el CTA abren directamente `/demo/rosa/` (o su ruta en inglés), sin preview intermedio. Las miniaturas están en `assets/brand/thumbs/`.

El calendario descargable de Encaje usa UTC explícito y la zona del evento (por defecto, la de Oaxaca en las demos). En el editor de Encaje se puede elegir la zona horaria; el archivo usa la fecha y la hora del primer evento, independientemente del evento seleccionado para la cuenta regresiva. Las líneas del `.ics` se pliegan a 75 octetos UTF-8.

## Preparación de Supabase

Ver [SUPABASE-SETUP.md](SUPABASE-SETUP.md) para las variables de entorno, el build y la migración de borradores privados. Las cuentas y los borradores del editor usan Supabase. La publicación y los pagos siguen pendientes; ver también los límites de archivos en esa guía.

La siguiente fase de base de datos está documentada en [SUPABASE-PERMISOS.md](SUPABASE-PERMISOS.md), con activación SQL y pruebas de aislamiento mediante `npm run test:database`.
