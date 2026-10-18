# Verificación de la revisión de la tienda

Pruebas funcionales sobre la copia local del repositorio, sin enviar formularios, mensajes ni pagos reales. Fecha: 18 de octubre de 2026.

## Recorridos comprobados

- Landing y catálogo ES/EN a 1440 × 1000, 768 × 1024, 390 × 844 y 320 × 740: 16 combinaciones sin desbordamiento horizontal ni errores JavaScript/recursos HTTP fallidos.
- Hero con CTA anterior al recurso visual en móvil; seis diseños; enlaces nativos sin iframe, modal ni apertura simulada en la landing.
- Menú móvil, Escape, búsqueda con acentos, resultados vacíos, limpieza, filtros por estilo/apertura y estado en URL.
- Hoja de filtros con fondo inerte, Tab contenido, Escape y devolución del foco. Las opciones de apertura usan botones de filtro, no pestañas sin panel asociado.
- Regreso desde una demo al catálogo: conserva filtro y posición de scroll.
- 22 demos en escritorio y móvil; Encaje, Costa, Nácar y Moderno en tablet; Encaje, Ónix y Costa en inglés móvil: 51 casos finales. Apertura, destino «Elegir», menú de exploración, Escape y panel. Las herramientas comerciales y la música se ocultan mientras se abre el panel.
- Encaje: formulario vacío, foco en el primer invitado pendiente, respuesta de cuatro personas, resumen del panel de 13 a 17 asistentes, edición de respuesta.
- Calendario de Encaje en Bogotá y Tokio: misma fecha/hora UTC (`20270314T190000Z`).
- Recorrido del prototipo local: registro ficticio → compra simulada → editor de Encaje → zona `America/Bogota` y fecha `2028-02-20` → vista del invitado → calendario (`20280220T180000Z`). El guardado se comprobó después de finalizar su espera de 450 ms.
- La apertura de Arco con teclado finaliza también cuando se limita el presupuesto de CPU; la revelación concluye aunque se omitan fotogramas.
- Anclas estáticas, identificadores únicos, sintaxis JavaScript y `git diff --check`.

- Hero Romántico en ES/EN: imagen estática del sobre real, acceso directo a `/demo/rosa/` y comprobación a cuatro tamaños de pantalla.

## Accesibilidad

axe-core 4.10.3 con reglas WCAG 2 A/AA y 2.1 AA sobre landing ES/EN, catálogo ES/EN, filtros abiertos, cuenta y Encaje abierta. Se corrigieron los contrastes señalados y se retiraron los tres recorridos horizontales problemáticos de la landing. No se usa el resultado automático como certificación integral.

## Límites

- Chromium con emulación táctil; sin Safari/iOS físico ni lector de pantalla.
- Sin pagos, publicación o cuentas reales: esas integraciones siguen pendientes.
- No se midieron Core Web Vitals de campo ni se importaron calendarios en aplicaciones externas.
- La matriz de demos comprueba apertura y herramientas compartidas; la validación completa del RSVP se comprobó en Encaje.
