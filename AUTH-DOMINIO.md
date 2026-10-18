# Marca y dominio del acceso con Google

## Recomendación: verificar primero la marca de Google

La documentación de Supabase describe la verificación de nombre/logo como una opción para sustituir el identificador del proyecto en la pantalla de consentimiento. No requiere contratar el complemento de dominio personalizado. No equivale a cambiar el hostname técnico ni garantiza que todas las pantallas de Google oculten las direcciones.

En Google Auth Platform → Branding / Información de la marca, completar nombre `Invitesse`, logo, asistencia `hola@invitesse.com`, página `https://www.invitesse.com` y los datos/dominios/documentos reales solicitados. Revisar el estado de verificación y publicación de la marca. Guardar un borrador no siempre publica la nueva marca: Google puede requerir «Verify Branding» y, tras aprobarla, «Publish branding».

No inventar una URL de privacidad ni sustituirla por el inicio si Google solicita una política real. La verificación puede requerir acreditar el dominio y revisar la marca; no se afirma haber enviado o completado esa revisión desde aquí.

Fuente: https://supabase.com/docs/guides/auth/social-login/auth-google
Fuente: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification

## Dominio opcional: auth.invitesse.com

Consultado en la documentación oficial: requiere un plan de pago de Supabase y un complemento de **US$10/mes por proyecto**, además del coste del plan. Confirmar el importe final del dashboard antes de contratar. No se ha activado el complemento ni autorizado ningún cobro desde este trabajo.

Los servidores DNS públicos de `invitesse.com` son de Cloudflare. En la consulta realizada, `auth.invitesse.com` no tenía registro CNAME y devolvía NXDOMAIN. No se han modificado registros DNS.

La web ya acepta como endpoint `https://auth.invitesse.com`, además del proyecto original. Esta preparación no verifica ni crea DNS, certificados o el dominio en Supabase. La variable de producción sigue sin cambiarse.

## Orden de migración, si se contrata el complemento

1. En Google Cloud → cliente OAuth existente, añadir como URI autorizada adicional:
   `https://auth.invitesse.com/auth/v1/callback`
   Mantener también `https://fqtfdzqrialgjkdirdfr.supabase.co/auth/v1/callback`.
2. En Supabase → Settings → General → Custom Domains, iniciar la configuración del subdominio `auth.invitesse.com`. Revisar coste/plan antes de aceptar.
3. En Cloudflare → DNS, crear el CNAME `auth` hacia `fqtfdzqrialgjkdirdfr.supabase.co`, con modo **DNS only**. Añadir los TXT de verificación que genere Supabase, copiando sus valores exactos. No tocar MX/SPF/DKIM/DMARC del correo ni registros del sitio.
4. Verificar el dominio y certificado en Supabase. Activar solo después de registrar el callback nuevo en Google: Supabase Auth anuncia el dominio personalizado inmediatamente al activarlo, incluso si la aplicación aún usa el endpoint anterior.
5. Comprobar que `https://auth.invitesse.com/auth/v1/settings` responde correctamente.
6. Cambiar `SUPABASE_URL` en Vercel a `https://auth.invitesse.com` para los entornos que correspondan y redesplegar. Si existe también `NEXT_PUBLIC_SUPABASE_URL`, mantener ambas alineadas o retirar la duplicada. La clave publicable no cambia.
7. Conservar Site URL como `https://www.invitesse.com` y las Redirect URLs del frontend como están. Son distintas del callback de Google.
8. Comprobar ingreso nuevo por correo/Google, retorno al diseño, recuperación y acceso a borradores. No eliminar el callback original durante esta comprobación. La documentación indica que el dominio original continúa activo.

Fuentes:
- https://supabase.com/docs/guides/platform/custom-domains
- https://supabase.com/pricing

## Verificación del código

`npm test` comprueba que el build acepta solo el endpoint estándar de Supabase o `auth.invitesse.com` con HTTPS, sin credenciales embebidas, puertos alternativos, rutas, consultas ni dominios engañosos. `npm run build` conserva el endpoint actual mientras no se cambie la variable.

No se han cambiado las URLs activas, los callbacks administrativos de Google, DNS ni facturación.
