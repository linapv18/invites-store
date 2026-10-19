# Comprobaciones del navegador

Requieren Python con `playwright` y Chromium en `/usr/bin/chromium`. El SDK y axe se instalan con `npm ci`.

1. `npm run build`.
2. Servir `dist/` en `http://127.0.0.1:4174`.
3. Ejecutar `python tests/browser/cloud_flows.py` y `python tests/browser/cloud_ux.py`.

Los tests interceptan todas las solicitudes a `*.supabase.co`; no crean cuentas, no envían correos ni escriben en el proyecto real. El almacenamiento remoto se simula entre dos contextos independientes del navegador. No prueban las políticas RLS del servidor real.

`INVITESSE_TEST_BASE` permite cambiar la URL del sitio servido; los artefactos se guardan en `/tmp/invitesse-browser-checks` o en `INVITESSE_TEST_ARTIFACTS`.

`python tests/browser/google_oauth.py` prueba el acceso Google/PKCE y el regreso al diseño con el proveedor interceptado.

`python tests/browser/empty_editor.py` comprueba borradores vacíos y vista previa neutra, guardado y recuperación, cancelación/confirmación del vaciado y conservación del demo público en escritorio ES y móvil EN.

`python tests/browser/privacy_consent.py` verifica la carga de Analytics y Clarity solo tras aceptar, rechazo/revocación, vencimiento, Global Privacy Control, exclusiones y accesibilidad ES/EN. Intercepta Google y Clarity para no enviar visitas de prueba a los proyectos reales.

`python tests/browser/account_navigation.py` comprueba la navegación con y sin sesión en inicio/catálogo ES/EN, nombres y alternativa genérica, tamaños móvil/escritorio y cierre de sesión entre pestañas. Supabase se simula; los visitantes anónimos no cargan el SDK ni se consultan borradores desde la tienda.

`python tests/browser/editor_preview_guide.py` comprueba el marco opaco y recortado del preview, navegación dentro del iframe, bienvenida vista/omitida, repetición manual, cambio de diseño/idioma/dispositivo y migración de preferencias antiguas. Las preferencias de cuenta se simulan mediante la API de Auth; no se modifican usuarios reales.

`python tests/browser/not_found.py` inicia un servidor temporal que emula el fallback nativo de Vercel a `404.html` y comprueba HTTP404, recuperación ES/EN, rutas profundas, teclado, contraste y tamaños de 320 a 1440 px. Con `INVITESSE_TEST_BASE` comprueba el servidor publicado en lugar de la emulación local.

`python tests/browser/gallery_limits.py` verifica los 22 diseños en escritorio y móvil: cupo original, actualizaciones con 0/2/más fotos, acceso al álbum completo, flechas y cierre con Escape. No escribe en Supabase.

`python tests/browser/photo_colors.py` verifica la opción de color en los siete demos compatibles, su independencia de la paleta y el guardado/restauración del editor con Supabase simulado. Comprueba que Señal no tenga el selector.

`python tests/browser/custom_colors.py` comprueba los ocho selectores de color personalizado en demos móviles y guardado/restauración en el editor, con Supabase simulado.

`python tests/browser/gifts.py` verifica regalos opcionales en los 22 diseños, enlaces seguros, mensaje escapado, capítulo de Moderno y controles/validación/guardado/restauración del editor con Supabase simulado.

`python tests/browser/invitation_sharing.py` inspecciona WhatsApp/SMS y copia del mensaje completo con el enlace público en los 22 demos; comprueba mensaje promocional, ausencia de claves de previews, variantes EN/iOS y bloqueo de borradores. No abre apps ni envía mensajes.

`python tests/browser/invitation_language.py` comprueba idioma guardado frente a rutas ES/EN en los 22 diseños, demos públicas, elección obligatoria, guardado/restauración y cambio independiente del idioma del editor.

`python tests/browser/seo.py` verifica la salida SEO del build en 320, 390 y 1440 px: rutas comerciales, H1, filtros, navegación catálogo → ficha sin JavaScript, overflow y axe. Intercepta la API de cotización y los proveedores de analítica: comprueba errores/éxito y eventos sin enviar correos ni visitas reales. Requiere servir `dist/` en 4174 o configurar `INVITESSE_TEST_BASE`.

Las fuentes están alojadas localmente. El build agrupa los scripts de demos conservando su orden y el script temprano de idioma. Al editar scripts compartidos o el pipeline de assets, ejecutar también `gallery_limits.py` e `invitation_language.py`; ambas pruebas usan datos simulados.
