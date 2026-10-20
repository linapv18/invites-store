# Stripe y publicación — 20 de octubre de 2026

## Reglas confirmadas

- Vendedor: Coldevs Inc; cuenta Stripe de EE. UU. `acct_1PCrn7P9O3dSAvF3`.
- Precios por gama (Colombia / internacional): Esencial COP 129.000 / USD 49; Signature COP 199.000 / USD 79; Luxury COP 279.000 / USD 109. Los pedidos pendientes conservan el total acordado; las compras nuevas usan la gama publicada. Detección automática del país mediante la cabecera de Vercel `x-vercel-ip-country`: CO usa COP y otros países o detección desconocida usan USD. No se deduce del idioma ni de la zona horaria; no se solicita GPS. El servidor decide la moneda, no el navegador.
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

Compatibilidad Stripe actual: se usa `allowed_payment_method_types: ["card"]` como filtro de los métodos dinámicos habilitados en Dashboard. No se envía el campo retirado `payment_method_types`. Los parámetros de pedidos pendientes antiguos se normalizan antes de reintentar y conservan el pedido. Si Stripe rechaza la clave original por parámetros distintos, se buscan primero todas las sesiones desde la creación del pedido (hasta 20 páginas; si no puede completarse la búsqueda, se bloquea el nuevo intento). Una sesión existente se recupera; solo si no existe se usa la clave estable `invitesse-checkout-dynamic-v1-<order>`. No hace falta ejecutar SQL otra vez.

Cambio a gamas: aplicar `supabase/migrations/202610200002_tier_prices.sql` en Supabase y desplegar esta versión. La comprobación de disponibilidad exige versión 2 para no anunciar precios distintos de los configurados en la base de datos. El archivo completo `ACTIVAR-STRIPE.sql` también incorpora la migración. Las órdenes y líneas ya creadas mantienen su importe; el cliente confirma moneda e importe mostrados, y el servidor vuelve a compararlos con el precio autorizado antes de crear Stripe Checkout.

Descuento del 100 %: ejecutar `supabase/migrations/202610200004_full_discount.sql` en el proyecto que ya tiene el administrador. El descuento completo es válido en COP y USD; conserva validación de gama, fechas y usos. El checkout usa `payment_method_collection: if_required` para no exigir tarjeta con total cero. Solo una sesión Stripe real, completada y verificada, con `no_payment_required`, total cero y sin PaymentIntent, habilita la orden; se registra su ID `cs_` como referencia y la base verifica el descuento completo guardado. No se activa por el retorno del navegador. Las pruebas usan firmas y datos locales, sin cargos ni códigos reales.

Actualización de sesiones antiguas: al volver al checkout, una orden pendiente sin descuento con la tarifa uniforme anterior (COP 200.000 o USD 79) se renueva si su gama ahora tiene otro precio. Primero se verifica Stripe y se expira la sesión abierta sin pagar; después se cancela la orden antigua. Si falta el ID de sesión, solo se recupera/cancela tras una búsqueda completa y cinco minutos sin creación reciente. Los pagos completados, en procesamiento y los descuentos conservan su orden. Un total antiguo enviado por el navegador se rechaza para que la pareja revise el precio vigente. No requiere SQL nuevo.
