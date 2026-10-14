# Lazo — tienda de invitaciones web

Sitio estático (HTML + CSS + un poco de JS), sin paso de build.

- `/` — español (`index.html`)
- `/en/` — inglés (`en/index.html`)
- `assets/` — capturas de los diseños
- `/en/demo/<diseño>/` — versión en inglés de cada demo (generada a partir de la española)
- `/demo/clasico/` — demo del diseño clásico (sobre con carta)
- `/demo/moderno/` — demo del diseño moderno, blanco y negro (puertas y capítulos)
- `/demo/rosa/` — demo del diseño romántico (sobre lacrado)
- Las demos tienen un selector de color en su barra (Clásico: salvia, rosa antiguo, azul noche, terracota; Romántico: champaña, por defecto, y rosado; Moderno: blanco y negro, arena, oliva, azul marino y vino). También por enlace: `/demo/rosa/?color=rosado`. Las paletas viven en `THEMES` de `demo/shared/content.js`
- `/cuenta/` y `/en/cuenta/` — ingresar o crear cuenta y "Mis invitaciones" (los diseños comprados)
- `/comprar/?diseno=<diseño>` y `/en/comprar/…` — compra de un diseño (cuenta + pago; hay un botón de compra de prueba)
- `/editor/?diseno=<diseño>` y `/en/editor/…` — editor del diseño comprado, con la plantilla real en la vista previa y complementos con carrito. Pide sesión y que el diseño esté comprado. Atajos: `#<sección o complemento>` (p. ej. `#musica`) y `#complementos`
- `/editor/pago/` y `/en/editor/pago/` — pago de los complementos (tarjeta o PayPal; el cobro aún no está conectado)

Para verlo en local:

```bash
python3 -m http.server 4173
```

Pendiente: precios (`[Precio]`, `[$]`, `[Total]`), enlaces de pago (compra del diseño en `/comprar/` y "Pagar y activar" de `/editor/pago/`), cuentas reales, publicar desde el editor y WhatsApp. No hay backend: cuentas, invitaciones y carrito se guardan en `localStorage` del navegador.

Editor y cuentas (el idioma sale de `<html lang>`):

- `editor/auth.js` — cuentas **simuladas**: se guardan en `localStorage` de cada navegador (sirven para probar el flujo, no son seguras ni se comparten entre dispositivos). Pendiente: cuentas reales (p. ej. Supabase o Firebase) y activar la compra desde el servidor al confirmarse el pago
- `editor/cuenta.js` — páginas de cuenta y compra; `editor/editor.js` + `editor.css` — editor y pago de complementos
- `demo/shared/content.js` — lleva el contenido del editor a la plantilla real. Los tres diseños reciben y muestran los mismos campos (pareja, fecha, ciudad, mensaje, frase de la cuenta regresiva, historia, cita, galería, eventos con lugar y dirección, código de vestimenta, preguntas, viaje con hotel, cómo llegar y guía de la ciudad, RSVP); lo que queda vacío no aparece al ver como invitado. Solo actúa con `?lz=editor` (vista previa) o `?lz=vista` (ver como invitado); sin esos parámetros las demos se ven igual. Las plantillas marcan con `data-lz…` dónde va cada dato

Compartido por las demos:

- `demo/shared/panel.js` + `panel.css` — panel de los novios (vista previa), música de fondo y barra de demo
- `assets/fotos/` — fotos de stock (Pexels) usadas en las demos
- `assets/musica/demo.mp3` — música libre de derechos (Pixabay, paulyudin)
- Biblioteca de música del editor: lista `MUSIC_LIBRARY` en `editor/editor.js`. Para sumar canciones libres de derechos, subir el MP3 a `assets/musica/` y agregar una línea. Los MP3 que suben los novios se guardan por ahora en IndexedDB del navegador (`lazo-media`)
