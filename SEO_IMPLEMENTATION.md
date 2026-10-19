# Implementación SEO de Invitesse

Fecha: 19 de octubre de 2026. Base de código actualizada mediante fast-forward a `b9d9602` de `origin/main`, conservando los cambios recientes de idiomas, regalos y envío. Este documento complementa la auditoría histórica `SEO_AUDIT.md`.

## Resultado y alcance

El build genera **66 URLs comerciales canónicas**: 10 existentes (incluidas las legales), 44 fichas de los 22 diseños en ES/EN, 6 categorías de estilo y 6 páginas de RSVP, información de marca y guía práctica. Las nuevas páginas se generan desde `scripts/seo.mjs` y `scripts/seo-policy.mjs`; no requieren React, Next.js, una base de datos ni peticiones externas durante el build.

Se conservan la tienda ES en `/`, EN en `/en/`, las 44 demos, el editor y sus formatos de borradores. No se han modificado SQL, políticas RLS, pagos o la publicación de invitaciones. No se han enviado correos reales ni creado cuentas, invitaciones o respuestas reales durante las pruebas. La publicación en producción fue autorizada el 19 de octubre de 2026. El despliegue se realiza mediante la integración Git existente de Vercel, conservando su configuración real de producción.

La propietaria confirmó atención en español e inglés en `hola@invitesse.com`, la compra todavía no disponible y su intención de abrirla en aproximadamente una semana o menos. No se publica una fecha garantizada: precios, vigencia, soporte y condiciones siguen sin confirmar. La estrategia usa español general para Latinoamérica y contenido en inglés para Estados Unidos, sin duplicar páginas por país.

## Cambios implementados

### Generación, contenido e idiomas

- Catálogo con H1, 22 tarjetas y enlaces a fichas en el HTML inicial, utilizable sin JavaScript. Los filtros mejoran las tarjetas existentes; no duplican el catálogo. Los controles que dependen de JS se ocultan en la alternativa sin JS.
- Fichas de cada diseño con descripción propia del catálogo, apertura, paletas, imágenes interior/exterior, compatibilidad sin fotos cuando corresponde, demo, alternativas y estado comercial real. Las demos mantienen su experiencia interactiva.
- Selecciones elegantes, románticas y botánicas con introducciones editoriales y surtido real. No se generan combinaciones por color, ciudad o país.
- Página de RSVP que distingue demostraciones y servicio futuro; información de marca con el responsable ya publicado en los textos legales; una guía sobre información, familias y revisión antes de compartir.
- Canonicals absolutos, hreflang ES/EN autorreferente y recíproco, x-default en las portadas y sitemap multilingüe generado desde la misma allowlist comercial.
- Titles del catálogo específicos; Open Graph y Twitter Cards en páginas comerciales, con imágenes sociales 1200×630 creadas con las fotografías y fuentes de la marca.
- JSON-LD de Organization, ContactPoint, WebSite, WebPage y BreadcrumbList coherente con contenido visible. No se añaden precios, reseñas, ratings ni ofertas ficticias. Product, FAQ rich results y SoftwareApplication no se fuerzan para aparentar prestaciones comerciales todavía no lanzadas.
- `robots.txt`, `sitemap.xml` y `llms.txt` incorporados al build. `llms.txt` solo enlaza información pública: es un experimento informativo, sin garantía de posicionamiento o citas.
- Navegación comercial hacia fichas, categorías, RSVP, marca y guía. Los títulos de tarjetas llevan a las fichas; las imágenes conservan el acceso directo a la demo.
- Eliminados los precios «US$ XX» de la tienda pública; CTA «Preparar» distingue un borrador de una compra disponible.

### Rutas y privacidad

- Normalización a barra final y redirects de `/index.html` y `/:path*/index.html` hacia la ruta correspondiente. Se conserva el alias de cuenta EN.
- Cabeceras `noindex`, `private, no-store` y `no-referrer` para cuenta, compra y editor.
- Previews ES/EN con `lz=editor` o `lz=vista`: `X-Robots-Tag: noindex, nofollow`, no-store y no-referrer desde reglas de respuesta; el script temprano de idioma también aplica meta noindex como defensa adicional.
- **Las demos ordinarias siguen indexables por ahora**, con canonical propio y alternates absolutos. No se proporcionaron datos de Search Console que permitan revisar tráfico/indexación antes de retirarlas. La decisión está centralizada en `demoIndexing` de `scripts/seo-policy.mjs`; las demos permanecen fuera del sitemap comercial.
- Noindex no equivale a privacidad ni sustituye autorización. La futura capa de publicación de invitaciones de clientes debe aplicar la política explicada más abajo antes de habilitarse.
- Analítica solo con el consentimiento existente, exclusión de cuentas, editor, demos, iframes y páginas legales. Las páginas comerciales nuevas participan; las cotizaciones **no cargan Clarity** y el resumen del formulario está enmascarado como protección adicional.
- GA4 recibe un lead solo tras respuesta de API con `ok: true`; sin nombre, correo, texto, parámetros ni fragmentos en el evento. El envío real de Resend está pendiente de validación autorizada en el despliegue.
- Medición LCP/INP/CLS con `web-vitals`, cargada después de aceptar analítica. Revalida consentimiento, expiración, Global Privacy Control y exclusiones antes de cada evento. No envía selectores, entradas DOM, formularios o URLs con parámetros.
- Textos de privacidad ES/EN actualizados para reflejar páginas cubiertas, métricas y exclusión de cotización de las grabaciones.

### Rendimiento y accesibilidad

- Bodoni Moda y Geist comerciales locales, manteniendo las familias de marca. También se alojan localmente las fuentes de demos/editor: 41 familias, licencias y los subconjuntos de idiomas originales. La carga dinámica de fuentes del panel también pasa a local.
- CSS combinado y minificado por página comercial y demo; scripts clásicos de catálogo/demos agrupados y diferidos conservando el orden. El script temprano de idioma permanece antes del layout. No se cambia el orden funcional del contenido, panel y comportamiento dentro del bundle.
- Fingerprints calculados sobre los bytes finales, después de resolver dependencias. Solo `/assets/immutable/` recibe caché anual inmutable. Configuración Supabase conserva no-cache; datos operativos conservan no-store. Fotos y adornos construidos por concatenación conservan URLs coherentes para no descargar copias equivalentes con nombres distintos.
- Textura de Arco: **1.682.001 → 707.030 bytes**, WebP lossless; comparación RGBA exacta y dimensiones originales 1049×1499.
- Hero de portada con WebP 280/400/554, srcset, sizes y preload coincidente. Se conservan originales y proporciones.
- Fotos predeterminadas de demostración en WebP de alta calidad y resolución original; los JPEG originales siguen disponibles para borradores o enlaces existentes. No se transforman fotografías subidas por clientes.
- Las perlas SVG de Nácar se insertan en un fragmento y se montan juntas, evitando invalidar el layout entre cada consulta de geometría y cada círculo. Se conserva el cálculo de posición, tamaño y sombreado.
- Primera tarjeta del catálogo eager/high, demás tarjetas lazy. En Nácar se elimina el preload de una foto interior que competía con la apertura y las fotos interiores de la demo ordinaria se cargan cuando empieza la apertura, con el tiempo de la animación para prepararlas. Las vistas previas con parámetros conservan la carga y URLs de contenido personalizado; una prueba comprueba que abrirlas no sobrescribe su foto.
- Clásico y Glicina conservan un H1 principal; los nombres de apertura mantienen su apariencia con clases específicas. El catálogo usa H2 para las tarjetas. Se corrige el nombre accesible de la tapa de Nácar y se incluye el enlace de cotización en el ciclo de foco del panel de filtros.
- Al diferir scripts se detectó un conflicto de dos controladores sobre el botón de galería de Clásico y Moderno. Ahora su visibilidad depende consistentemente del total y los cupos visibles, no del orden de listeners.

## Mapa de los hallazgos originales

| Hallazgos | Estado |
|---|---|
| F01–F05 | Código implementado: catálogo inicial, consolidación, filtros y alternates. Cabeceras/redirects pendientes de comprobar en CDN después de publicar. |
| F06 | 44 fichas comerciales implementadas. Retirada de demos de indexación pendiente de revisión de Search Console; no se ha aplicado a ciegas. |
| F07 | Previews excluidas por reglas HTTP y script temprano; falta prueba final de cabeceras del despliegue. |
| F08 | Política documentada; su aplicación al futuro renderer de invitaciones reales es una puerta de lanzamiento. No se inventó un router ni se cambiaron permisos de clientes. |
| F09–F15 | Placeholders comerciales, archivos SEO, metadata social, schema, titles y páginas de funcionalidades/estilo implementados. Precios y contratación pendientes de datos reales. |
| F16–F20 | Optimizaciones de recursos, fuentes, cache, preloads y scripts implementadas. Medición de campo preparada; no hay muestra de usuarios ni garantías de CWV aprobados en producción. Glicina/Marfil pueden requerir más optimización tras medir sus recursos visuales en producción. |
| F21 | Encabezados de Clásico/Glicina corregidos sin quitar elementos visuales. |
| F22 | Validación automatizada de accesibilidad y laboratorio ejecutada; no equivale a auditoría WCAG completa o prueba con todos los lectores de pantalla. |
| F23 | Base sincronizada con remoto antes de editar. |
| F24–F26 | Marca/autoría, medición de cotización y CWV, y llms.txt implementados. Referencias editoriales externas y presencia en IA requieren trabajo y evidencia externos. |

## Archivos principales

| Archivo | Responsabilidad |
|---|---|
| `scripts/seo-policy.mjs` | Rutas, contenido localizado, categorías y decisión de indexación de demos |
| `scripts/seo.mjs` | Catálogo y páginas estáticas, metadata, schema, enlaces y sitemap |
| `scripts/asset-cache.mjs` | CSS/scripts por página y fingerprints finales |
| `scripts/build.mjs` | Integración con el build existente y bundles del backend/CWV |
| `vercel.json` | Redirects, slash final, noindex, cache y previews por query |
| `disenos/catalogo.js`, `galeria.js` | Tarjetas compartidas y mejora progresiva de filtros |
| `assets/brand/fonts/`, `fonts.css` | Tipografías locales, licencias y fuentes originales |
| `scripts/vendor-fonts.py` | Actualización explícita de fuentes; requiere red, no se ejecuta durante build |
| `assets/brand/social/`, `seo.css` | Imágenes sociales y presentación de fichas/páginas editoriales |
| `assets/brand/privacy.js`, `quote.js`, `lib/vitals.mjs` | Consentimiento, eventos confirmados y medición sin PII |
| `tests/seo.test.mjs`, `vitals.test.mjs`, `tests/browser/seo.py` | Políticas de salida, rutas compiladas, privacidad y recorridos reales del navegador |

## Verificación y reproducción

Se instalaron las dependencias del lockfile. El build local se hizo con URL/clave Supabase **ficticias**, usadas solo para generar y probar la salida; no son credenciales de producción y no se han guardado en archivos de entorno. Para el despliegue, conservar la configuración real existente de Vercel. No desplegar los valores de prueba.

```bash
npm ci
# Con las variables Supabase reales del entorno de desarrollo configuradas:
npm run build
npm test
python -m http.server 4174 --bind 127.0.0.1 --directory dist
# En otra terminal, con Playwright y Chromium instalados:
python tests/browser/seo.py
python tests/browser/privacy_consent.py
python tests/browser/account_navigation.py
python tests/browser/invitation_language.py
python tests/browser/gallery_limits.py
```

La prueba SEO verifica las 66 entradas del sitemap, canonicals, alternates recíprocos, H1, metadata, enlaces internos/recursos generados, JSON-LD sin ofertas inventadas y hashes correspondientes a los bytes finales. Compila `vercel.json` con `@vercel/routing-utils` y comprueba redirects, exclusión de previews en los dos idiomas y políticas de cache sobre URLs con barra final. También se validó la configuración contra el esquema público de Vercel. El servidor estático de pruebas no implementa por sí mismo las cabeceras de Vercel: no se presentan como observadas en un nuevo despliegue.

Las pruebas de navegador interceptan la API de cotización, Supabase cuando corresponde y proveedores externos para no crear datos o enviar correos reales. Se verifican catálogo → ficha sin JS, filtros, foco, versiones móviles/escritorio, rechazo de falso éxito del formulario y ausencia de datos personales en los eventos.

Lighthouse se ejecutó sobre `http://127.0.0.1:4174` con Chromium, perfil móvil simulado y preset desktop, sin aceptar analítica. Los resultados resumidos están en `docs/seo-lab.json`; son mediciones de laboratorio, no CrUX, INP de campo ni prueba de indexación. El servidor Python no aplica compresión ni cabeceras de cache del CDN. El TTFB local no representa usuarios en Latinoamérica o Estados Unidos. Un score SEO 100 no demuestra indexación ni posicionamiento.


### Muestras de laboratorio

| Página | Perfil | Rendimiento | Accesibilidad | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Home | mobile | 94 | 100 | 100 | 2.78 s | 0.007 | 0 ms |
| Home | desktop | 100 | 100 | 100 | 0.64 s | 0.004 | 0 ms |
| Catálogo | mobile | 91 | 100 | 100 | 3.19 s | 0.067 | 55 ms |
| Catálogo | desktop | 100 | 100 | 100 | 0.72 s | 0.021 | 0 ms |
| Nácar | mobile | 83 | 100 | 100 | 4.28 s | 0.011 | 100 ms |
| Nácar | desktop | 99 | 100 | 100 | 0.84 s | 0.000 | 12 ms |

Estas muestras no equivalen a una prueba de campo ni demuestran cumplimiento de CWV en producción. El LCP móvil del catálogo y de la demo merece seguimiento después de desplegar; la instrumentación está preparada para decidir con datos reales. Las muestras se tomaron durante la implementación, con versiones y fechas de Lighthouse en el JSON. No se atribuyen cambios de score exclusivamente a una sola modificación.

## Lo que falta y requiere datos o acceso externo

1. **Search Console/Bing:** comprobar propiedad, enviar `/sitemap.xml`, revisar cobertura y canonical elegida, comparar tráfico e impresiones de demos antes de cambiar `demoIndexing` a `noindex`. Mantener las demos funcionales incluso al excluirlas de resultados. No usar bloqueos robots para sustituir noindex.
2. **Precios y condiciones:** confirmar moneda, impuestos si corresponden, vigencia, soporte, cambios y cancelación. Después actualizar home, tarjetas y páginas informativas; crear precios solo con una oferta útil confirmada. No se generó una landing de precios vacía o con importes falsos.
3. **Compra/publicación:** habilitar y verificar el producto fuera de este cambio SEO; no se ha construido una pasarela de pago ni un renderer de invitaciones de clientes como parte de optimizar adquisición. Antes de abrirlo, validar permisos, enlaces de familia, tokens inválidos/revocados/expirados, acceso público voluntario, noindex por defecto, no-store, referrer y exclusión de datos personales de sitemap/OG/analítica. «Compartir enlace» no implica permiso para Google.
4. **Despliegue:** publicar los cambios con la configuración real y comprobar estados, headers y rutas en el dominio público. Se debe probar POST de cotización y auth al activar la normalización de slash, incluidas las redirecciones que conservan método/cuerpo. La compra sigue declarada en preparación hasta estar operativa.
5. **Correo de cotización:** revisar Resend/remitente y recepción real con un envío expresamente autorizado. No se ha enviado un mensaje de prueba al buzón real.
6. **GA4:** revisar la recepción de `web_vital` y `generate_lead`. Registrar dimensiones de evento `metric_name`, `metric_rating`, `navigation_type` y métricas numéricas `metric_value`, `metric_delta` con el alcance/unidades adecuados. Separar CLS (sin unidad) de LCP/INP (ms) por `metric_name`. Calcular p75 por tipo de dispositivo/ruta y ventana representativa; no promediar puntuaciones de Lighthouse ni mezclar unidades. La medición por consentimiento describe esa muestra, no todos los visitantes.
7. **Rendimiento y accesibilidad de campo:** PSI/CrUX si hay muestra, caché y compresión en Vercel, móviles reales, zoom, teclado y lectores de pantalla. No se promete que todos los diseños cumplan LCP ≤2,5 s antes de esa validación. INP solo tendrá datos tras interacciones reales y consentimiento.
8. **Mercados y contenidos:** validar demanda y SERPs de Colombia, México, Argentina, Perú, Ecuador, Panamá y EE. UU.; no se inventaron volúmenes ni se generaron páginas geográficas repetidas. Revisar consultas y conversiones para decidir nuevas categorías/recursos.
9. **Referencias externas/GEO:** trabajar relaciones editoriales y perfiles oficiales reales. No se enviaron propuestas a terceros ni se prometen menciones de IA. El marcado, contenido legible y llms.txt solo facilitan comprensión/acceso.

## Al abrir contratación

Revisar `scripts/seo-policy.mjs` (textos de disponibilidad), `scripts/seo.mjs` (bloque de disponibilidad), las dos home, `disenos/catalogo.js`, flujo de compra/editor y las condiciones ES/EN. Publicar primero una oferta real y después actualizar sus mensajes de SEO. No activar precios mediante fecha automática. Conservar canonicals y slugs al cambiar de prelanzamiento a servicio disponible.

Antes de promover, ejecutar build, pruebas y comprobaciones HTTP en el despliegue. Para revertir, revertir este lote de código y reconstruir con la configuración existente; no hay migraciones SEO de base de datos que revertir. No aplicar cache inmutable a archivos no versionados ni a datos privados.
