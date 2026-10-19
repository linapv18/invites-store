# Stripe: conexión por etapas

La propietaria autorizó pagos únicos reales, COP 200.000 para Colombia y USD 79 para otros países, todos los diseños. No incluye complementos cuyo precio no se ha definido.

## Credenciales (Production, sensibles)

- `STRIPE_SECRET_KEY`: guardada por la propietaria; se comprobó solo su existencia y alcance, no su valor.
- `STRIPE_WEBHOOK_SECRET`: secreto del destino webhook de esta aplicación.
- `SUPABASE_SECRET_KEY`: clave de servidor del mismo proyecto Supabase usado por el sitio (`sb_secret_…`). Nunca usar una variable pública.

## Destino de Stripe (cuenta propia, modo real)

URL exacta: `https://www.invitesse.com/api/stripe-webhook` (sin barra final).

Eventos: `checkout.session.completed` y `checkout.session.async_payment_succeeded`.

El endpoint usa el cuerpo original y la verificación oficial de firma. Hasta disponer de todas las credenciales responde 503; las peticiones con firma inválida responden 400. No registra datos personales ni firmas. Acepta solamente pagos reales marcados con `metadata.integration=invitesse`, `metadata.order_id` y `client_reference_id` iguales al UUID del pedido. El total y moneda se contrastan con el pedido original mediante `apply_verified_payment`, con deduplicación y activación atómica en la base de datos. No publica automáticamente contenido.

## Pendiente antes de habilitar cobros

1. Añadir ambas credenciales pendientes y volver a desplegar para que se apliquen.
2. Verificar migraciones de plataforma en Supabase y configurar productos por diseño en COP/USD (20.000.000 / 7.900 unidades menores).
3. Implementar creación autenticada de Checkout Session con importes calculados en servidor, idempotencia, prevención de compras duplicadas y recuperación de estado. Colombia usa COP por selección explícita de mercado; no inferir el país por idioma.
4. Sustituir el checkout de complementos con campos simulados; todavía no crea sesiones ni cobra. Verificar entrega/publicación de la invitación antes de activar un CTA de pago.
5. Comprobar webhook, reintentos, monedas, derechos y flujo de publicación. No se han hecho cargos reales. Los reembolsos y disputas requieren un flujo verificado de revocación antes de abrir ventas; este endpoint todavía no los procesa.

No se cambia la cuenta a modo de prueba. Las pruebas automatizadas usan firmas sintéticas locales y ninguna credencial real. Este primer despliegue conecta la recepción de eventos; no habilita ventas.
