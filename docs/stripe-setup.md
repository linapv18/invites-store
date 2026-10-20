# Stripe y publicación — 20 de octubre de 2026

## Reglas confirmadas

- Vendedor: Coldevs Inc; cuenta Stripe de EE. UU. `acct_1PCrn7P9O3dSAvF3`.
- Todos los diseños: un pago de COP 200.000 para Colombia o USD 79 para otros mercados. Detección automática del país mediante la cabecera de Vercel `x-vercel-ip-country`: CO usa COP y otros países o detección desconocida usan USD. No se deduce del idioma ni de la zona horaria; no se solicita GPS. El servidor decide la moneda, no el navegador.
- Comprar al seleccionar diseño, antes de editar. El pago desbloquea el editor; publicar no cobra de nuevo.
- Fecha obligatoria antes del pago; zona horaria tomada automáticamente del dispositivo, sin selector técnico. Vigencia hasta terminar el día tres meses calendario después del evento, en su zona. Meses sin el día correspondiente se ajustan al último día. La fecha exacta se muestra automáticamente al elegir el evento y queda fija con el pedido. El checkout recupera el formulario y la tarjeta de resumen, con un solo botón para continuar. Cambios posteriores por soporte.
- Complementos de pago sin precio definido: no se cobran.

## Despliegue

Credenciales sensibles solo en Production: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SECRET_KEY`, más URL y clave pública del proyecto Supabase ya enlazado. No se leen ni publican secretos.

Ejecutar `supabase/ACTIVAR-STRIPE.sql` completo en SQL Editor. Es idempotente: conserva cuentas/borradores; crea la plataforma si falta y actualiza funciones/precios. Regenerar con `node scripts/assemble-stripe-sql.mjs` tras editar migraciones. La propietaria confirmó haber aplicado la migración; verificar que corresponde a su versión final antes de abrir ventas.

Webhook real: `https://www.invitesse.com/api/stripe-webhook/`, Snapshot (la cuenta utiliza 2024-04-10). Eventos:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `charge.refunded`
- `charge.dispute.created`

La propietaria confirmó los cuatro eventos. Reembolsos completos y disputas revocan acceso; no emiten reembolsos y no se restauran automáticamente al ganar una disputa. Revisión por soporte. Los eventos fuera de orden no deben reactivar un pedido revocado.

## Flujo

`/comprar/?diseno=…` → cuenta → fecha → vigencia automática y precio local → precio/vencimiento/condiciones → Stripe Checkout alojado (tarjetas; sin promociones, cantidades ajustables, impuestos añadidos ni Adaptive Pricing) → retorno y conciliación verificada → editor.

`GET /api/checkout/` comprueba configuración de precios y que Stripe permita cobrar en la cuenta prevista; no crea pedidos ni cargos. POST exige JWT validado en Supabase y correo confirmado. El servidor usa precios de la DB; ignora importes, propietarios y vencimientos del navegador. Preparar el pedido bloquea la invitación para reutilizar pedidos pendientes; los parámetros de Stripe se congelan y la clave de idempotencia depende del pedido. Las sesiones abiertas se reutilizan; para cambiar la fecha se debe cancelar la sesión pendiente. Los checkouts existentes conservan su moneda si cambia la ubicación. Los pedidos pagados/revocados no se cobran otra vez.

Solo el webhook firmado o la consulta autenticada del servidor a Stripe pueden registrar pagos. Supabase contrasta el total, moneda, propietario y productos y concede derechos de manera atómica e idempotente. La URL de éxito por sí misma no concede acceso.

Publicar guarda una instantánea filtrada, sincroniza familias y preserva IDs/respuestas. Los enlaces de familia llevan tokens en el fragmento, no en las peticiones del navegador; se resuelven por POST al RPC. Generar un enlace nuevo revoca el anterior de esa familia. El enlace general requiere opt-in. Todas las invitaciones llevan noindex, no-store y no-referrer, sin GA4/Clarity.

`/invitacion/` muestra la plantilla en un iframe sin `allow-same-origin`: no puede leer sesión/almacenamiento del propietario. El padre conserva el token y guarda el RSVP real. Los datos privados del editor/listas de otras familias no se entregan al invitado. La expiración y revocación se comprueban en cada lectura/respuesta por RPC. Una página ya abierta no puede borrar lo ya visto; el siguiente acceso o envío vuelve a comprobar vigencia.

Audio local subido todavía requiere selección de biblioteca antes de publicar; la interfaz lo indica. Las fotos actuales guardadas como data URLs están limitadas por el tamaño máximo del borrador. No se promete disponibilidad de complementos pendientes.

## Validación

- `npm run test:payments`: firmas y rechazo, precios, suplantación, doble checkout, conciliación y SQL real en PGlite.
- `npm test`: regresión de APIs, SEO y privacidad.
- `python3 tests/browser/checkout_publication.py`: checkout ES/EN a 390/1440px, COP/USD automáticos, vencimiento, retorno pagado; 22 diseños × 2 idiomas, aislamiento de iframe y RSVP guardado. Stripe, cuentas y escrituras se interceptan.
- Builds locales usan exclusivamente valores públicos ficticios. Producción se construye en Vercel con su configuración existente.
- No se ha hecho un cargo real ni creado una compra de cliente para probar. Una prueba automatizada no demuestra un cobro bancario real.

Los fallos del checkout devuelven una referencia de etapa y un código seguro; los logs excluyen datos del cliente y claves. El acceso a runtime logs de Vercel está denegado a la conexión actual (403), por lo que un fallo real puede necesitar el mensaje de Stripe Workbench o la referencia mostrada al reintentar. No se afirma haber resuelto un fallo bancario real por aprobar pruebas simuladas.
