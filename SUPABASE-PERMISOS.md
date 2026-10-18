# Estructura y permisos de Invitesse

## Activación en el proyecto real

La primera migración de borradores ya se ejecutó. Para añadir esta fase:

1. Abrir **Supabase → SQL Editor → New query**.
2. Copiar y ejecutar **todo** `supabase/ACTIVAR-PLATAFORMA.sql` una sola vez. No contiene precios ni activa compras. Incluye las migraciones 002, 003 y 004 en una sola transacción: si hay un error, se revierte esta fase completa.
3. No ejecutar también las migraciones individuales: son la misma estructura, separada para mantenimiento.
4. Mantener las claves secretas fuera del navegador y del repositorio.

El archivo crea las tablas, permisos y funciones en el servidor de Supabase; añadir los archivos al repositorio no ejecuta SQL en el proyecto remoto. La clave publicable no permite administrar esas tablas.

## Qué significa cada control

- **Restricciones:** PostgreSQL rechaza valores inválidos, referencias a registros inexistentes, duplicados y estados imposibles. Una versión publicada debe pertenecer a la misma invitación; un pedido debe pertenecer al propietario de esa invitación.
- **RLS —permisos por fila—:** la identidad viene de la sesión firmada por Supabase. Cada consulta de un cliente solo puede leer sus filas. Cambiar un identificador o la lógica de JavaScript no cambia esos permisos.
- **Funciones del servidor:** operaciones que deben validarse juntas se ejecutan en una transacción. Si una comprobación falla, no se guarda una mitad de la operación. Las funciones privilegiadas usan un `search_path` fijo, objetos con esquema explícito y permisos de ejecución limitados.

| Identidad | Puede hacer | No puede hacer |
|---|---|---|
| Visitante sin sesión | Ver el catálogo de diseños disponibles; abrir una publicación marcada expresamente como pública | Leer borradores, contactos, pedidos o tablas de invitados |
| Familia con enlace privado válido | Ver su invitación y sus integrantes; responder por esas personas | Ver otras familias o confirmar sus integrantes |
| Pareja autenticada | Leer sus datos; guardar su borrador; gestionar sus familias; publicar si tiene permiso vigente | Leer o editar a otra pareja; acreditar pagos; concederse complementos |
| Servidor de confianza | Crear pedidos con precios del catálogo; registrar un pago verificado; revocar accesos por reembolso | Aceptar una notificación de pago sin verificar antes su origen con el proveedor |

## Tablas

| Área | Tablas |
|---|---|
| Cuenta y diseños | `profiles`, `designs`; las credenciales siguen en `auth.users` de Supabase |
| Edición y publicación | `invitation_drafts` existente, `invitations`, `invitation_versions` |
| Archivos | `invitation_assets`, `publication_assets`, bucket privado `invitation-assets` |
| Familias y personas | `households`, `guests`, `guest_access_links` |
| Confirmaciones | `household_responses`, `guest_responses` |
| Precios y pedidos | `products`, `orders`, `order_items` |
| Confirmación de pagos | `payments`, `payment_events` |
| Derechos y complementos | `invitation_entitlements`, `addon_entitlements`, `addon_settings` |

Los borradores existentes obtienen su fila de `invitations` conservando el identificador. Los borradores nuevos la crean automáticamente mediante un trigger. No se copian los invitados del JSON antiguo a las nuevas tablas sin un paso explícito de importación y revisión.

## Cómo funcionan los recorridos del servidor

### Publicar

`publish_invitation` exige sesión, correo confirmado, propiedad, revisión actual del borrador y permiso de publicación vigente. Valida nombres, fecha, zona horaria cuando existe y que los archivos referenciados pertenezcan a esa invitación.

Crea una versión independiente con una lista explícita de campos. Excluye la lista privada `invitations`, contactos y campos desconocidos; también filtra las claves de eventos, preguntas y encuestas. Editar el borrador después no cambia esa versión. `pause_invitation` suspende la disponibilidad pública.

Por defecto usa acceso **por familia**. Solo al elegir expresamente `public` se permite consultar el contenido de la invitación sin un enlace de familia. Ningún modo publica la lista completa de invitados o sus contactos. La dirección se mantiene después de la primera publicación para no romper enlaces existentes.

La estructura no habilita una publicación gratuita: el cliente no puede insertar ni modificar sus permisos. Para pruebas controladas, un administrador puede crear un permiso manual con motivo; eso no registra un pago. No se han concedido permisos manuales en el proyecto real.

### Familias y RSVP

`create_household` crea las personas y devuelve un token privado una sola vez. La base de datos conserva su hash, no el token original. El frontend debe ofrecer copiar el enlace y, si se pierde, rotarlo explícitamente. La rotación invalida el anterior.

`get_guest_invitation` devuelve solo esa familia. El correo y teléfono de contacto no se devuelven al invitado. `submit_guest_response` comprueba todos los identificadores contra esa familia, guarda las respuestas juntas, rechaza versiones antiguas y admite una clave de petición para no duplicar el guardado al reintentar.

`edit_household` mantiene los identificadores y respuestas de las personas conservadas; las eliminaciones son explícitas. Si llegó un RSVP mientras el propietario editaba, devuelve conflicto para evitar sobrescribir cambios silenciosamente. `delete_household` también exige la revisión actual.

### Archivos

El bucket es privado, con un límite técnico de 15 MiB por archivo y formatos JPEG, PNG, WebP, AVIF y MP3. No se admite SVG subido por clientes en esta fase. La ruta incluye usuario e invitación; no se puede subir o leer en la carpeta de otro cliente ni sobrescribir un archivo existente. Las referencias de una versión publicada bloquean su borrado por el cliente.

El SDK permite subir/registrar archivos y generar vistas previas temporales. `api/invitation-asset.js` valida primero la publicación o el enlace de familia y que el recurso pertenezca a esa versión. Después genera una URL válida durante 60 segundos. Nunca firma una ruta proporcionada por el navegador.

Para ese endpoint, añadir **solo en Vercel** `SUPABASE_SECRET_KEY` con una clave `sb_secret_…` de Supabase. No enviarla por chat. No se usa en el build del frontend. Sin esa clave, la firma de archivos falla de forma cerrada. Una URL temporal ya emitida puede seguir funcionando hasta su vencimiento.

### Pagos

No hay precios activos de ejemplo. `create_checkout_order` solo puede invocarlo el servidor: recibe productos y obtiene sus importes del catálogo, valida moneda, diseño y propietario y evita pedidos repetidos para la misma petición.

`apply_verified_payment` solo acepta llamadas del servidor. Compara moneda e importe con el pedido y sus líneas, registra la notificación de forma idempotente y concede los derechos correspondientes. Un aviso repetido no reactiva derechos revocados. `revoke_order_access` registra un reembolso ya verificado y revoca los derechos derivados de ese pedido; **no inicia un reembolso de dinero**.

Estas funciones no verifican por sí solas la firma de una pasarela: esa parte requiere el proveedor que se elija y su webhook. No se expone un endpoint que permita al navegador afirmar que pagó. La expiración se toma de la configuración explícita del pedido; no se inventó una duración comercial.

## Estado y siguientes conexiones

Esta entrega prepara y prueba la estructura SQL, funciones, SDK y endpoint de archivos. Hasta ejecutar el SQL, esas tablas/funciones no existen en el proyecto real.

La UI de cuentas y borradores existente sigue funcionando. Todavía hay que conectar sus controles de publicación, el render público de las plantillas, los enlaces por familia, las cargas de archivos del editor y el panel de RSVP a estas nuevas APIs. Los complementos tienen derechos y configuración, pero sus funciones específicas requieren implementación. No se anuncia que esas pantallas ya funcionen por crear las tablas.

Antes de abrir esos recorridos al público: completar SMTP, pasarela, condiciones, cuotas totales y conservación de archivos/datos; probar con cuentas de prueba del proyecto y dispositivos reales. El límite de 50 personas por familia es una protección técnica de la función, no una condición comercial anunciada.

## Verificación

`npm run test:database` ejecuta el archivo de activación sobre PostgreSQL aislado mediante PGlite, con roles y esquemas de Auth/Storage simulados. Comprueba aislamiento entre dos usuarios, falsificación de compras, versiones y datos privados, enlaces por familia, RSVP idempotente y conflictos, cambios de personas, archivos privados, precios calculados por servidor, pagos duplicados y revocación.

`npm test` comprueba helpers y que el endpoint no firma archivos no autorizados. No se crearon usuarios, enviaron correos, cargaron archivos ni procesaron pagos en Supabase real. Las pruebas de Storage comprueban permisos de metadatos; la transferencia real y el webhook del proveedor requieren verificación posterior en el proyecto conectado.
