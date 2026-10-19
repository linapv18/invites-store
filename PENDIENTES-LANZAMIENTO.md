# Pendientes para lanzar Invitesse

La revisión visual y funcional de la tienda está implementada en español e inglés. La landing y el catálogo se presentan como vista previa mientras se completa la contratación. No se configuraron contactos ni proveedores de pago, y su conexión sigue pendiente.

## Lo que necesito de tu parte

### 1. Precios y condiciones de cada opción

- Precio por diseño o regla de precios de la colección, moneda y tratamiento de impuestos.
- Precio y alcance de cada complemento; si habrá paquetes, qué incluyen.
- Precio inicial o forma de cotizar un diseño a medida.
- Qué cubre un diseño a medida: entregables, revisiones, carga de contenido y exclusividad.
- Plazos de la colección y del servicio a medida. No se conserva la promesa «Lista el mismo día» mientras no pueda respaldarse.
- Duración de publicación, renovación, conservación de respuestas/fotos y condiciones de cambios posteriores.
- Política de cancelación/reembolso y límites de invitados, almacenamiento y fotografías cuando correspondan.

### 2. Idiomas y complementos

- Resolver si el producto base es en un idioma elegido o incluye español e inglés en una misma invitación.
- Precisar quién traduce el contenido y qué incluye el complemento bilingüe.
- Confirmar qué complementos estarán disponibles al lanzamiento: playlist, libro QR, cápsula, encuestas, galería, bilingüismo y dominio.
- Definir el funcionamiento de cada uno. Ejemplos: aprobación de canciones e integración real con Spotify; capacidad y moderación de fotos; fecha y forma de apertura de cápsulas; titularidad y renovación del dominio.

Los complementos se muestran como opciones en preparación. No se afirma que ya exista una integración operativa con Spotify ni apertura automática en el aniversario.

### 3. Contactos y soporte

- Número de WhatsApp con código de país.
- Consultas a medida: formulario en `/cotizar/` y `/en/quote/` que llega a hola@invitesse.com. Resend configurado: dominio `mail.invitesse.com` verificado (región us-east-1, DNS en Cloudflare), clave en Vercel mediante la integración de Resend y remitente por defecto `cotizaciones@mail.invitesse.com`. Supabase Auth también envía por Resend (SMTP, remitente `cuentas@mail.invitesse.com`); revisar el límite de correos por hora en Supabase.
- Correo oficial e Instagram: hola@invitesse.com e @invitesse, ya visibles en el pie de la landing, el catálogo y las páginas legales (ES/EN).
- Canal, idioma, horario y alcance del soporte; tiempo de respuesta que realmente puedas ofrecer.

Se retiraron los enlaces vacíos del storefront. Cuando estén disponibles, conectar el CTA a medida directamente al canal correcto, sin pasar por un cierre genérico.

### 4. Proveedores y cuentas

- Elegir/activar el proveedor de pagos y las cuentas comerciales que se utilizarán.
- Confirmar países, monedas y métodos de pago admitidos.
- Proporcionar acceso al proyecto y configurar credenciales por el mecanismo seguro del proveedor o variables del entorno, sin incluirlas en el repositorio.
- Elegir/confirmar el servicio de cuentas, base de datos y almacenamiento para invitaciones, respuestas y archivos.

### 5. Documentos y datos del negocio

- Datos del responsable del servicio y textos definitivos de términos, privacidad y condiciones comerciales.
- Decidir conservación, descarga y eliminación de datos de parejas e invitados.
- Confirmar las condiciones de uso de música y archivos que suban los clientes.

## Implementación que sigue pendiente para la siguiente fase

Estas tareas requieren desarrollo e integración; no basta con completar los textos:

- Cuentas y borradores ya conectados a Supabase. Completar SMTP propio y validación de entrega de correos y aislamiento con dos cuentas reales de prueba.
- Checkout del proveedor, validación del importe en servidor y confirmación del pago mediante webhook. Retirar la activación de compra de prueba del recorrido real.
- Publicación de invitaciones, persistencia de archivos y contenido, enlaces personalizados y confirmaciones reales sincronizadas con el panel.
- Control de acceso y permisos para que cada pareja y cada familia vean y editen solo lo que les corresponde.
- Operación real de los complementos que se decida lanzar.
- Metadatos e imagen para compartir cada invitación publicada; correo de confirmación/recibo cuando corresponda.
- Conectar los contactos y documentos acordados en ES/EN, añadir los precios definitivos y retirar los avisos de vista previa solo cuando el flujo esté listo.
- Validar pago de prueba → activación → edición → publicación → enlace por familia → RSVP → panel. Después, revisar en Safari/iOS y Android físicos y desplegar.

## Dónde completar cada parte

| Parte | Archivos principales |
|---|---|
| Oferta, avisos y preguntas | `index.html`, `en/index.html` |
| Catálogo y texto de disponibilidad | `disenos/catalogo.js`, `disenos/galeria.js` |
| Cuenta y compra de diseño | `editor/auth.js`, `editor/cuenta.js` |
| Editor y publicación | `editor/editor.js`, `demo/shared/content.js` |
| Pago de complementos | `editor/editor.js` y las rutas `editor/pago/`, `en/editor/pago/` |
| Herramientas de demo y aviso de contratación | `demo/shared/panel.js` |

El flujo de cuenta y borradores usa Supabase; el checkout de complementos conserva sus placeholders. Deben revisarse junto con la integración de pagos; la limpieza comercial de esta revisión se aplicó a la landing y al catálogo.

- Regalos: ejecutar `supabase/migrations/202610190002_publish_gifts.sql` en el SQL Editor de Supabase para incluir los cuatro campos opcionales de regalos en la publicación pública. No vuelve a crear tablas ni cambia RLS; conserva la exclusión de invitados privados. El editor ya guarda los campos en el borrador JSON.

- Compartir invitaciones: al conectar la publicación y los enlaces definitivos por familia, sustituir el bloqueo `pendingShare()` del editor por las acciones con URL verificada del servidor. El demo ya comparte WhatsApp/SMS y copia el mensaje completo con su URL pública; nunca usa claves de previews ni nombres de invitados en el enlace.
