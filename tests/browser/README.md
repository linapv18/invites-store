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
