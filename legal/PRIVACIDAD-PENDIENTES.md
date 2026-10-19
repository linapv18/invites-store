# Privacidad y analítica — decisiones del 19 de octubre de 2026

- Mercados iniciales: Latinoamérica y Estados Unidos.
- Datos previstos en RSVP: nombre, asistencia y restricciones alimentarias opcionales. No solicitar diagnósticos.
- Invitación y respuestas: plazo previsto de 3 meses calendario tras el evento.
- Cápsula: solo contenido de mensajes, nombre de cada autor y acceso necesario, hasta 13 meses calendario tras el evento. No prolonga lista de invitados ni restricciones.
- Los borradores no publicados y la cuenta requieren una política independiente; el evento no autoriza borrar indiscriminadamente cuentas, facturas u obligaciones legales.

## Implementado en esta entrega

Google Analytics G-2YPN2SZT3R y Clarity yzwi7fw4jr solo en /, /en/, /disenos/ y /en/disenos/ tras opt-in. Sin carga de gtag/Clarity ni pings de medición antes de aceptar; publicidad denegada y señales publicitarias desactivadas. Direcciones sin query, hash ni referrer; título genérico. Demos, cuentas, editor e invitaciones privadas excluidos mediante lista explícita de rutas y bloqueo en iframes.

Preferencia local versionada por 180 días, aceptar/rechazar/configurar, revocación, sincronización entre pestañas y respeto a Global Privacy Control. Revocar desactiva GA, detiene Clarity, elimina las cookies _ga, _ga_2YPN2SZT3R, _clck y _clsk en dominios propios y recarga para descargar el script. No elimina datos históricos de Google. Si no se puede guardar la decisión, no habilita analítica. La elección se registra en el dispositivo, no hay un registro probatorio central de consentimientos.

## Pendiente antes de vender o activar funciones

- En Google Analytics: revisar retención de datos de eventos y usuarios (recomendación inicial: 2 meses), desactivar Google Signals y personalización publicitaria en la propiedad, y desactivar medición mejorada automática para mantener el alcance en vistas de página explícitas. No se dispone de acceso a la consola para confirmar estos ajustes.
- Implementar vencimiento y purga server-side por meses calendario, avisos/exportación, y separación de la cápsula del resto de datos; diseñar índices y relación de autores para no conservar el RSVP completo. No se activó una tarea de borrado en esta entrega.
- Definir ciclos de backup/logs, cuentas sin actividad, solicitudes de supresión y tratamiento de obligaciones legales.
- Reducir el editor y el esquema de RSVP para que no soliciten contactos no necesarios. El editor heredado aún admite correo/teléfono opcionales; la política lo declara. Añadir información/autorización para restricciones alimentarias donde proceda al conectar RSVP real.
- Alojar fuentes localmente y revisar mapas/otros embeds. Esta entrega controla Analytics; no convierte Google Fonts en un servicio local ni elimina todas las conexiones externas.
- Validar contratos con proveedores, condiciones internacionales y requisitos estatales/países donde se ofrezca el servicio. Los documentos publicados y este control no certifican cumplimiento integral.

## Clics y mapas de calor

Confirmado por la propietaria: desea clics y heatmaps. Se envían eventos commercial_click de acciones seleccionadas (abrir demo, preparar borrador, ingresar, catálogo, enlaces de sección y filtros), sin texto de elementos ni valores de campos. Clarity se carga tras el mismo permiso opcional de analítica, con ad_Storage denied y analytics_Storage granted, enmascarado de campos/formularios/controles de privacidad, sin identificar usuarios. Para evitar transmitir parámetros arbitrarios, Clarity no inicia si la URL inicial tiene query o un fragmento no reconocido. Mantener Medición mejorada desactivada: los clics son explícitos; no hace falta captura automática de formularios o URLs completas.

La revisión de origin/main encontró dos commits adicionales que habían conectado ambos proveedores sin consentimiento, incluso en demos y compra. Se conserva la integración mediante el controlador de privacidad y se retiran esos loaders incondicionales; analytics.js queda como archivo inerte de compatibilidad.

En Clarity: revisar la opción de requerir consentimiento, el enmascarado y las condiciones de conservación/compartición. No se han modificado ajustes de la consola. Clarity puede incluir reproducciones además de heatmaps, y esto se informa en el control y la política.
