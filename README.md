# Lazo — tienda de invitaciones web

Sitio estático (HTML + CSS + un poco de JS), sin paso de build.

- `/` — español (`index.html`)
- `/en/` — inglés (`en/index.html`)
- `/disenos/` y `/en/disenos/` — galería con todos los diseños y filtros (búsqueda, estilo, lugar de la boda, apertura y colores; quedan en la URL). La landing muestra solo 3 destacados y un botón a la galería
- `disenos/catalogo.js` — catálogo de diseños: textos, capturas, etiquetas de los filtros y cuáles son destacados (`featured`). Al sumar un diseño se agrega aquí y sale en la galería; para cambiar los destacados de la landing basta con mover `featured`
- `assets/` — capturas de los diseños
- `/en/demo/<diseño>/` — versión en inglés de cada demo (generada a partir de la española)
- `/demo/clasico/` — demo del diseño clásico (sobre con carta)
- `/demo/moderno/` — demo del diseño moderno, blanco y negro (puertas y capítulos)
- `/demo/rosa/` — demo del diseño romántico (sobre lacrado)
- `/demo/jardin/` — demo del diseño jardín (sobre de semillas; flores en acuarela que crecen al bajar). Paletas: hoja, lavanda y eucalipto
- `/demo/costa/` — demo del diseño costa, para bodas destino (pase de abordar, el mar en movimiento y tablero de salidas). Paletas: cobalto, verde agua y barro
- `/demo/gala/` — demo del diseño gala, art déco de noche (medallón dorado que estalla en confeti). Paletas: negro y oro, esmeralda, burdeos y oro rosa
- `/demo/aurelia/` — demo del diseño Aurelia, editorial en blanco y oro (carpeta con faja dorada que se abre como un libro). Paletas: oro, plata y oro rosa
- `design/` — propuestas de diseño; Jardín, Costa y Gala salen de `design/plantillas-nuevas-v2.html` y Aurelia de `design/plantillas-nuevas-4.html`. Estas plantillas arman el HTML con JavaScript (las ilustraciones son SVG generados) antes de cargar `content.js`, y la versión en inglés es el mismo archivo con `<html lang="en">`
- Las demos tienen un selector de color en su barra (Clásico: salvia, rosa antiguo, azul noche, terracota; Romántico: champaña, por defecto, y rosado; Moderno: blanco y negro, arena, oliva, azul marino y vino; Jardín: hoja, lavanda y eucalipto; Costa: cobalto, verde agua y barro; Gala: negro y oro, esmeralda, burdeos; Aurelia: oro, plata, oro rosa). También por enlace: `/demo/rosa/?color=rosado`. Las paletas viven en `THEMES` de `demo/shared/content.js`
- `/cuenta/` y `/en/cuenta/` — ingresar o crear cuenta y "Mis invitaciones" (los diseños comprados)
- `/comprar/?diseno=<diseño>` y `/en/comprar/…` — compra de un diseño (cuenta + pago; hay un botón de compra de prueba)
- `/editor/?diseno=<diseño>` y `/en/editor/…` — editor del diseño comprado, con la plantilla real en la vista previa y complementos con carrito. Pide sesión y que el diseño esté comprado. Atajos: `#<sección o complemento>` (p. ej. `#musica`) y `#complementos`
- Sección 09 del editor, Invitados: subir la lista en CSV o crearla a mano. Ejemplos para descargar: `/editor/invitados-ejemplo.csv` y `/editor/guests-example.csv` (una fila por persona: Invitación, Persona, Teléfono, Correo; acepta `,` o `;`)
- `/editor/pago/` y `/en/editor/pago/` — pago de los complementos (tarjeta o PayPal; el cobro aún no está conectado)

Para verlo en local:

```bash
python3 -m http.server 4173
```

Pendiente: precios (`[Precio]`, `[$]`, `[Total]`), enlaces de pago (compra del diseño en `/comprar/` y "Pagar y activar" de `/editor/pago/`), cuentas reales, publicar desde el editor y WhatsApp. No hay backend: cuentas, invitaciones y carrito se guardan en `localStorage` del navegador.

Editor y cuentas (el idioma sale de `<html lang>`):

- `editor/auth.js` — cuentas **simuladas**: se guardan en `localStorage` de cada navegador (sirven para probar el flujo, no son seguras ni se comparten entre dispositivos). Pendiente: cuentas reales (p. ej. Supabase o Firebase) y activar la compra desde el servidor al confirmarse el pago
- `editor/cuenta.js` — páginas de cuenta y compra; `editor/editor.js` + `editor.css` — editor y pago de complementos
- Vista previa al compartir (sección 02 del editor): los novios eligen si el enlace en WhatsApp/Instagram muestra la invitación cerrada o una foto suya (`shareMode`, `sharePhoto`: 0 = portada, n = foto n de la galería). Pendiente: al publicar, el servidor debe generar la imagen `og:image` de 1200 × 630 (captura de `/demo/<diseño>/?lz=vista` con su contenido, o la foto elegida) y poner `og:title`/`og:description` con los nombres, la fecha y el mensaje
- `demo/shared/content.js` — lleva el contenido del editor a la plantilla real. Todos los diseños reciben y muestran los mismos campos (pareja, fecha, ciudad, mensaje, frase de la cuenta regresiva, historia, cita, galería, eventos con lugar y dirección, código de vestimenta, preguntas, viaje con hotel, cómo llegar y guía de la ciudad, RSVP); lo que queda vacío no aparece al ver como invitado. Solo actúa con `?lz=editor` (vista previa) o `?lz=vista` (ver como invitado); sin esos parámetros las demos se ven igual. Las plantillas marcan con `data-lz…` dónde va cada dato

Compartido por las demos:

- `demo/shared/panel.js` + `panel.css` — panel de los novios (vista previa), música de fondo y barra de demo
- `assets/fotos/` — fotos de stock (Pexels) usadas en las demos
- `assets/musica/demo.mp3` — música libre de derechos (Pixabay, paulyudin)
- Biblioteca de música del editor: lista `MUSIC_LIBRARY` en `editor/editor.js`. Para sumar canciones libres de derechos, subir el MP3 a `assets/musica/` y agregar una línea. Los MP3 que suben los novios se guardan por ahora en IndexedDB del navegador (`lazo-media`)
