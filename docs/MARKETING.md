# Marketing privado

El módulo se publica dentro del admin. La migración SQL se aplica por separado en Supabase. No se han enviado correos ni activado campañas. No añade dependencias ni servicios de pago.

## Preparación cuando se autorice publicar

1. Aplicar `supabase/migrations/202610210004_marketing.sql` en el proyecto correcto, después de las migraciones existentes. Es repetible y no modifica pedidos ni invitaciones. Probar primero en un entorno separado.
2. Desplegar la aplicación por el procedimiento habitual. Marketing aparece en el admin existente y utiliza su sesión verificada y `ADMIN_EMAILS`. Las tablas no son accesibles desde el navegador: RLS y RPC limitadas a service_role. No usar claves de servicio en variables públicas.
3. Entrar a Marketing → Ajustes. Guardar el destinatario (por defecto el correo verificado del administrador). Elegir fecha inicial y cargar el plan de 30 días. La segunda carga no duplica ni sobrescribe las piezas, incluso si se han eliminado. Las fechas están en America/Bogota; los horarios sugeridos no son horas de rendimiento comprobado.

## Recordatorios: apagados por defecto

Las notificaciones internas se generan al consultar el módulo y al ejecutar el trabajador. Los correos requieren las dos autorizaciones de configuración y el consentimiento del administrador en Ajustes:

- Reutilizar `RESEND_API_KEY` y remitente verificado existente `QUOTE_FROM`, u opcional `MARKETING_FROM`.
- Crear `CRON_SECRET` aleatorio de al menos 32 caracteres, únicamente de servidor.
- Configurar una llamada cada cinco minutos a `/api/marketing-reminders` con `Authorization: Bearer <CRON_SECRET>` usando un programador ya disponible. No se ha añadido ningún cron a vercel.json. Confirmar antes límites y coste del plan: si no existe programación suficiente sin coste nuevo, mantener el correo apagado. En Vercel, una frecuencia de cinco minutos puede requerir otro plan; no contratarlo automáticamente.
- Solo después establecer `MARKETING_SCHEDULER_ENABLED=true` y `MARKETING_REMINDERS_ENABLED=true`. Finalmente habilitar el correo en Ajustes. Sin estos requisitos el admin muestra las razones y no simula entregas.

Anticipación predeterminada: 60 minutos; aviso adicional de 24 horas opcional. Una pieza creada dentro de la ventana obtiene aviso inmediato. La ejecución añade hasta cinco minutos de latencia. Las ideas no generan correos. Publicar, omitir, eliminar o reprogramar cancela los avisos pendientes anteriores. No publica en redes ni envía WhatsApp.

Cada entrega tiene clave estable de idempotencia Resend, bloqueo de cinco minutos, carga congelada y hasta cinco intentos con espera exponencial. Una entrega incierta de más de 23 horas se detiene para revisión, sin reenvío automático fuera de la ventana del proveedor. No es posible garantizar exactamente una entrega ante una caída de red; la idempotencia del proveedor mitiga ese caso. Consultar los estados y errores en Notificaciones. Cambiar la anticipación afecta los avisos pendientes sin entregar, no repite los ya enviados. El administrador debe seguir autorizado en ADMIN_EMAILS al enviar.

## Datos y límites de medición

Ingresos: pedidos pagados con pago Stripe confirmado positivo y referencia PaymentIntent; excluye pedidos gratuitos y pruebas identificadas. Registrar usuarios de prueba/colaboradores con el UUID de su cuenta para excluir sus compras, o excluir un pedido individual. Los invitados de boda no se consultan ni se exportan. La atribución de canal y campaña es manual por pedido; no existe atribución histórica automática.

Las visitas, demos y conversión de visitas muestran **Sin medición** hasta integrar una fuente real. Los inicios de checkout proceden de órdenes con sesión Stripe, no equivalen a sesiones web. Un comprador nuevo se cuenta una sola vez, por su primera compra elegible. No se usa el gasto de Meta dividido por compradores de todos los canales: el filtro de canal afecta gasto y compradores. CAC exige atribución completa de las compras del periodo; CAC total además exige declarar que todos los costes fueron registrados.

Gastos: entrada manual, se conservan importe original en unidades menores y moneda. COP y USD no se suman sin tasa manual COP por USD y nota de fecha/fuente. Es una estimación de gestión, no contabilidad fiscal. Resultados por publicación son manuales y se identifican como tales. Los importes cero con registros vacíos significan ausencia de registros, no prueba de ausencia de gasto externo.

La revisión semanal exporta JSON con fuentes, faltantes, cambios y prompt para copiar a la IA elegida. No conecta APIs de IA ni comparte automáticamente datos. Revisar texto libre antes de compartirlo: se omiten identificadores de cuentas, alias y correos/teléfonos detectables, pero el texto libre puede contener datos sensibles. Las muestras pequeñas no justifican conclusiones causales.

La consulta limita piezas/gastos/contactos a 2000 y registros de actividad a 1000. El admin avisa si el límite de piezas se alcanza; ampliar paginación antes de superar este volumen. Los borrados son lógicos para conservar auditoría e idempotencia.

## Validación sin correos reales

- `npm test`
- `node tests/database/marketing.mjs` (PGlite local, migración repetida, seguridad y cola).
- `SUPABASE_URL=https://fixture.supabase.co SUPABASE_PUBLISHABLE_KEY=sb_publishable_fixture npm run build` (artefacto de validación; no publicar este artefacto).
- Pruebas de trabajador con proveedor inyectado, sin tráfico a Resend.
- `python tests/browser/marketing.py`: formularios, duplicación, reprogramación, carga, exportación y ausencia de desbordamiento a 1440/390/320 px con API simulada. No reemplaza la comprobación de la instalación remota una vez autorizada.

Verificado localmente el 21 de octubre de 2026: compilación y suite existentes correctas; PGlite comprueba también reintentos con carga estable, cancelación de un trabajador activo, exclusión de compras gratuitas/pendientes y cuentas de prueba. Tests de API comprueban el allowlist, rechazo de escrituras GET y actor derivado de sesión, no del cuerpo de la petición. Los tests de email inyectan un proveedor simulado.

## Suscripción del landing (10% de bienvenida)

La sección «Su celebración empieza aquí» (`index.html#suscripcion`, `assets/brand/subscribe.js`) envía a `api/suscripcion.js`. El endpoint guarda el consentimiento en `newsletter_subscribers`, crea un código propio en `discount_codes` (10%, un uso, una vez por cliente, solo primera compra) y lo envía con Resend. El landing solo muestra el éxito cuando Resend acepta el correo; si falla, el suscriptor queda `pending` y un nuevo intento reenvía el mismo código. La lista de marketing son las filas `status='subscribed'`. Cada correo incluye enlace de baja y cabeceras `List-Unsubscribe` (un clic).

Para activarlo:

1. Aplicar `supabase/migrations/202610220001_newsletter.sql` (también incluida en `ACTIVAR-STRIPE.sql`). Reemplaza `discount_quote` con la regla de primera compra; los códigos existentes no cambian.
2. En Vercel: `SUPABASE_URL` y `SUPABASE_SECRET_KEY` (ya usadas por el checkout), `RESEND_API_KEY` y un remitente de dominio verificado en `NEWSLETTER_FROM` (si falta, se usa `MARKETING_FROM` o `QUOTE_FROM`).
3. Sin esa configuración el formulario responde «La suscripción todavía no está disponible» y no guarda nada.

Validación: `node --test tests/newsletter.test.mjs` (proveedor simulado) y `node tests/database/newsletter.mjs` (PGlite).
