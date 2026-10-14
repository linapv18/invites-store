# Lazo — tienda de invitaciones web

Sitio estático (HTML + CSS + un poco de JS), sin paso de build.

- `/` — español (`index.html`)
- `/en/` — inglés (`en/index.html`)
- `assets/` — capturas de los diseños
- `/en/demo/<diseño>/` — versión en inglés de cada demo (generada a partir de la española)
- `/demo/clasico/` — demo del diseño clásico (sobre con carta)
- `/demo/moderno/` — demo del diseño moderno, blanco y negro (puertas y capítulos)
- `/demo/rosa/` — demo del diseño romántico (sobre lacrado)

Para verlo en local:

```bash
python3 -m http.server 4173
```

Pendiente: precios (`[Precio]`, `[$]`), enlaces de pago, "Ingresar" y WhatsApp.

Compartido por las demos:

- `demo/shared/panel.js` + `panel.css` — panel de los novios (vista previa), música de fondo y barra de demo
- `assets/fotos/` — fotos de stock (Pexels) usadas en las demos
- `assets/musica/demo.mp3` — música libre de derechos (Pixabay, paulyudin)
