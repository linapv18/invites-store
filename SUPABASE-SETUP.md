# Supabase para Invitesse

## Implementado

- SDK oficial `@supabase/supabase-js`, empaquetado localmente, sin CDN ni migración a Next.js.
- Registro con confirmación de correo, inicio/cierre de sesión y recuperación/cambio de contraseña en ES/EN.
- Sesión persistente y renovación automática mediante el SDK. No se guardan contraseñas ni hashes propios.
- Borradores privados por usuario y diseño. Se cargan desde Supabase antes de abrir el editor.
- Guardado con revisión: otra pestaña o dispositivo no puede sobrescribir silenciosamente una versión posterior.
- Indicadores de espera, guardado y error; reintento visible también en móvil y aviso antes de salir con cambios sin guardar.
- Preparar un borrador no concede derechos de compra ni publica la invitación.

## Configuración del dashboard

La migración `supabase/migrations/202610180001_drafts.sql` ya fue ejecutada por la propietaria. No volver a ejecutarla: crea las tablas y funciones una sola vez.

En **Authentication → URL Configuration**:

- Site URL: `https://www.invitesse.com`
- Redirect URLs autorizadas: `https://www.invitesse.com/cuenta/` y `https://www.invitesse.com/en/cuenta/`.
- La ruta principal en inglés es `/en/account/`. Los correos usan el callback compatible `/en/cuenta/`, que redirige conservando código, consulta y fragmento. Se puede añadir también `https://www.invitesse.com/en/account/` en Supabase, pero la configuración actual no depende de ese cambio.

Para desarrollo, añadir solo las redirecciones locales concretas que se vayan a usar. No usar comodines amplios para producción. Configurar SMTP propio antes de abrir registros al público; el envío predeterminado tiene restricciones.

## Desarrollo y Vercel

```sh
npm ci
npm test
npm run build
python -m http.server 4174 --directory dist
```

Variables del entorno correspondiente en Vercel:

- `SUPABASE_URL`: URL del proyecto.
- `SUPABASE_PUBLISHABLE_KEY`: clave publicable.

También se aceptan los nombres `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` del dashboard. No se usa `@supabase/ssr`: la aplicación actual es estática.

`.env.local` está ignorado por Git. El build valida que no se use una clave secreta y publica solo los directorios públicos en `dist/`, excluyendo SQL, documentos, dependencias y archivos de entorno. La URL y la clave publicable sí forman parte del cliente, como requiere Supabase; la protección de datos depende de RLS.

## Datos y compatibilidad

`editor/auth.js` conserva el nombre `LazoAuth` para evitar rehacer todos los consumidores, pero ahora usa Supabase. Los métodos de compra locales ya no se ejecutan: `buy()` crea un borrador y no acredita pagos.

Los borradores del navegador anterior no se importan automáticamente. Una cuenta local antigua no acredita identidad ni propiedad: hay que registrarse y confirmar el correo. Una futura importación requiere consentimiento y autenticación.

El editor conserva una caché local para sus iframes de vista previa; esta no determina permisos ni acredita que un cambio esté guardado en la nube. El carrito de complementos continúa como prototipo.

## Límites que siguen pendientes

- Fotos: actualmente forman parte del JSON del borrador. Este tiene un límite de 1 MiB. Si el conjunto excede el límite, el servidor rechaza el guardado y la UI muestra error; mantener la pestaña abierta hasta resolverlo. Hace falta almacenamiento de archivos independiente para fotos grandes.
- MP3 propios: el editor sigue advirtiendo que el archivo permanece en el navegador. No se sincroniza entre dispositivos. La biblioteca incluida sí funciona desde cualquier dispositivo.
- Publicación: no está habilitada. Requiere versiones publicadas separadas del borrador, rutas públicas, metadatos y permisos de compra controlados por servidor.
- Pagos, sincronización del RSVP de invitaciones publicadas y permisos por familia siguen pendientes.

## Verificación y límites

Consulta real de solo lectura a `/auth/v1/settings`: HTTP 200, Email habilitado y confirmación exigida. Lectura anónima de `invitation_drafts`: HTTP 401 / PostgreSQL `42501`, acceso rechazado.

Los recorridos de registro, acceso, creación/guardado de borradores, recuperación en otro contexto de navegador, fallos de servidor, reintentos, conflictos y cierre de sesión se prueban con respuestas del proveedor interceptadas. No se registran usuarios ni se envían correos reales. Estas pruebas no sustituyen una comprobación de aislamiento con dos usuarios en el proyecto remoto ni la entrega real de correos.
