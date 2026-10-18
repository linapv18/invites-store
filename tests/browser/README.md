# Comprobaciones del navegador

Requieren Python con `playwright` y Chromium en `/usr/bin/chromium`. El SDK y axe se instalan con `npm ci`.

1. `npm run build`.
2. Servir `dist/` en `http://127.0.0.1:4174`.
3. Ejecutar `python tests/browser/cloud_flows.py` y `python tests/browser/cloud_ux.py`.

Los tests interceptan todas las solicitudes a `*.supabase.co`; no crean cuentas, no envían correos ni escriben en el proyecto real. El almacenamiento remoto se simula entre dos contextos independientes del navegador. No prueban las políticas RLS del servidor real.

`INVITESSE_TEST_BASE` permite cambiar la URL del sitio servido; los artefactos se guardan en `/tmp/invitesse-browser-checks` o en `INVITESSE_TEST_ARTIFACTS`.
