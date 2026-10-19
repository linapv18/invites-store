# Auditoría SEO integral — Invitesse

> Diagnóstico previo a los cambios. La implementación posterior y sus validaciones están documentadas en [SEO_IMPLEMENTATION.md](SEO_IMPLEMENTATION.md).

**Fecha:** 19 de octubre de 2026 (America/Bogota).  
**Sitio:** https://www.invitesse.com/  
**Repositorio auditado:** `invites-store`, commit `410891a8590e163d53fccff1435e358832418e47`.  
**Alcance autorizado:** diagnóstico y plan. No se ha modificado la aplicación, configuración, base de datos ni despliegue. Los ejemplos de este documento son propuestas pendientes de aprobación.

## 1. Resumen ejecutivo

Invitesse tiene una base favorable: HTML estático en las portadas, contenido editorial bilingüe, identidad visual diferenciada, una colección real de 22 diseños, enlaces HTML desde la portada, imágenes con textos alternativos y páginas operativas con `noindex`. HTTPS y la redirección del dominio sin www funcionan. Una URL inexistente devuelve un 404 real. **No se ha encontrado un P0 comprobado que impida indexar todo el sitio.** Tampoco se puede afirmar que Google ya lo haya indexado.

La principal limitación es que la colección, el activo comercial más importante después de la portada, no existe en el HTML inicial del catálogo: el H1 está vacío y no hay tarjetas ni enlaces a diseños hasta ejecutar JavaScript. Además, los resultados orgánicos potenciales de los diseños llevan a demos de bodas ficticias, con los nombres de las parejas en sus títulos, en vez de a fichas comerciales del producto. Esto dificulta explicar por qué elegir y contratar cada diseño.

Hay problemas comprobados de consolidación: portada y catálogo sin canonical, variantes `/index.html`, `/disenos`, `/disenos/` y `/disenos/index.html` que responden 200, y filtros sin política de indexación. `robots.txt` y `sitemap.xml` devuelven 404. **La ausencia de estos dos archivos no bloquea por sí misma la indexación**; el sitemap ayudaría a declarar el conjunto comercial y los idiomas, especialmente al ampliar el catálogo.

La internacionalización ya tiene una estructura válida y conservable: español en `/`, inglés en `/en/`. No hace falta migrar a Next.js ni mover español a `/es/`. Sí hace falta corregir los alternates relativos de portada/catálogo y completar las referencias a sí mismas en las parejas de cotización y páginas legales. Los cambios deben coordinarse en ambos idiomas.

El sitio comunica una fase de prelanzamiento. La compra y publicación todavía no están disponibles según el contenido visible y el código revisado. Sin embargo, las tarjetas muestran «Desde US$ XX» y «Comprar». Antes de impulsar adquisición comercial hay que alinear esos mensajes con la disponibilidad real. El formulario de cotización puede ser un destino de conversión útil; su envío real no se probó para evitar enviar correos.

**Orden recomendado:** consolidación de URLs y política de indexación → catálogo estático y mensajes comerciales coherentes → fichas seleccionadas con contenido propio → categorías útiles y una página de RSVP → crecimiento bilingüe y mejoras de rendimiento guiadas por medición. Mantener las aperturas y el diseño premium; reducir sus costes de carga sin eliminarlas.

## 2. Método, evidencia y límites

### 2.1 Qué se comprobó

- Se inventariaron los **64 archivos HTML** del proyecto, todos los directorios principales, build, rutas de API, scripts compartidos, catálogo, configuración de Vercel y mecanismos de publicación en Supabase.
- Se hicieron solicitudes GET a las **64 rutas derivadas del HTML**, incluyendo las 44 demos ES/EN. Todas terminaron en HTTP 200; `/en/cuenta/` redirige antes a `/en/account/`. Son **63 destinos finales diferentes**, no 64 páginas comerciales.
- Se consultaron además robots, sitemap, llms, URL inexistente, filtros, variantes de índice y dominio, recursos y dos APIs mediante GET. Se inspeccionaron cuerpos, metadatos y cabeceras. No se enviaron formularios ni se usaron cuentas o invitaciones reales.
- Se verificaron con HEAD las cadenas de redirección indicadas en §4.
- Chromium + Playwright local: 11 rutas × 2 viewports (**390×900 y 1440×900**), con JavaScript activo: `/`, `/en/`, ambos catálogos, Nácar ES/EN, Rosa, Arco, Señal, Glicina y cotización ES. Se comparó HTML inicial con DOM renderizado, enlaces, imágenes y desbordamiento horizontal.
- El navegador local sirvió el código fuente; se bloquearon solicitudes externas, incluidas fuentes y analítica. El config/SDK del backend se genera en build y no está en ese servidor fuente. Por tanto, esta comprobación **no valida autenticación, build de producción, tipografía final, envíos, CWV ni todo el comportamiento publicado**.
- Comparación competitiva con HTML público de Paperless Post, Greenvelope, Joy y Bodas.net, además de una ficha de un proveedor español de invitaciones digitales descubierto en su directorio.

### 2.2 Diferencias entre repositorio y producción

La portada y el catálogo revisados coinciden con la estructura SEO de producción. Sin embargo, los HTML de las demos publicadas incluyen `/demo/shared/language.js?v=1`, ausente en este checkout, y versiones distintas de `panel.css`, `content.js` y `panel.js`. Cuenta y editor también apuntan a versiones diferentes de scripts.

Se consultó el script de idioma publicado: solo actúa con `lz=editor` o `lz=vista` y una clave `k`, lee el idioma guardado en localStorage y cambia la ruta ES/EN de la vista previa. **No se observó en él una redirección de las demos ordinarias basada en IP o idioma del navegador.** No hay motivo para reportarla como problema de indexación. Sí hay que sincronizar la revisión de código antes de implementar y repetir las pruebas sobre el despliegue que se vaya a modificar.

### 2.3 Qué no se sabe todavía

No se dispone de Search Console, Bing Webmaster Tools, GA4, CrUX, logs de bots, conversiones, backlinks ni herramientas de volúmenes/dificultad. No se ejecutaron Lighthouse ni PageSpeed Insights; no hay puntuaciones ni mediciones válidas de LCP, INP, CLS, FCP o TTFB en este informe. La búsqueda pública de Google consultada devolvió una pantalla que requería JavaScript, no una SERP utilizable: no se deducen posiciones ni competidores líderes a partir de ella.

Etiquetas usadas en los hallazgos:

- **V:** verificado en código y/o respuesta HTTP; se indica el método.
- **R:** riesgo condicionado que necesita validación adicional.
- **O:** oportunidad estratégica, no defecto técnico.

Una respuesta 200 sin `noindex` solo indica ausencia de esas barreras observadas. No demuestra indexación, elección de canonical por Google ni ranking. Los conteos del HTML fuente no incluyen contenido creado por JavaScript.

## 3. Arquitectura real y superficie pública

### 3.1 Stack y rendering

No es Next.js. `package.json` no incluye Next, React ni router de aplicación. `vercel.json` declara `framework: null`, salida `dist` y `npm run build`. `scripts/build.mjs` copia una lista explícita de directorios y genera un cliente Supabase mediante esbuild. Las variables con prefijo `NEXT_PUBLIC_` son alternativas de configuración; no prueban el uso de Next.js.

| Zona | Archivos / arquitectura | Rendering y función |
|---|---|---|
| Portada ES/EN | `index.html`, `en/index.html`; `assets/brand/` | HTML estático con contenido, FAQ y 6 diseños destacados; JS progresivo para navegación, privacidad y cuenta |
| Catálogo ES/EN | `disenos/index.html`, `en/disenos/index.html`; `catalogo.js`, `galeria.js` | Shell estático; H1, 22 tarjetas, filtros, pie y enlaces comerciales generados con JS |
| Demos | `demo/<id>/`, `en/demo/<id>/`, `demo/shared/` | 22 diseños por idioma. Clásico, Moderno y Rosa contienen contenido principal estático; otros 19 por idioma lo crean con JS externo o inline |
| Cuenta/compra/editor/pago | `cuenta/`, `comprar/`, `editor/` y equivalentes EN | Aplicación cliente con Supabase; `noindex`; no son landings orgánicas |
| Cotización | `cotizar/`, `en/quote/`, `assets/brand/quote.js` | Contenido/formulario en HTML; envío por API a Resend; no se probó el envío real |
| Legales | `privacidad/`, `condiciones/`, `en/privacy/`, `en/terms/` | HTML estático, canonical absoluto y traducción real |
| Funciones | `api/cotizacion.js`, `api/invitation-asset.js` | POST; GET público observado devuelve 405 y `Cache-Control: no-store` |
| Datos y publicación | `lib/supabase/`, `supabase/migrations/` | Borradores, permisos, publicación, acceso por familia o público, activos firmados; no equivalen a rutas HTML publicadas |
| Build y pruebas | `scripts/`, `tests/`, documentación raíz | No forman parte de la allowlist de publicación |

Los componentes visuales son CSS, SVG, HTML y funciones de JavaScript compartidas; no componentes React. No hay hidratación React que auditar. Puede haber cambios de layout por inserción de DOM o fuentes, pero no se midieron como CLS. La arquitectura estática es perfectamente compatible con SEO; el catálogo puede prerenderizarse en build sin cambiar de framework.

### 3.2 Inventario de rutas y política recomendada

**Host de todas las rutas:** `https://www.invitesse.com`. Cada ruta del inventario completo de §14 tiene title y descripción, salvo la página 404 y el archivo fuente de redirección `/en/cuenta/`. No se encontraron títulos duplicados entre los 64 archivos fuente.

| Grupo | Rutas | Estado comprobado | Política propuesta |
|---|---|---|---|
| Portadas | `/`, `/en/` | 200; HTML comercial; sin canonical; OG parcial | Indexar; canonical propio y alternates completos |
| Catálogos | `/disenos/`, `/en/disenos/` | 200; H1 vacío y grid vacío sin JS; sin canonical | Indexar; prerenderizar contenido y tarjetas |
| Cotización | `/cotizar/`, `/en/quote/` | 200; contenido estático, canonical propio | Indexar si oferta y atención están operativas; ampliar explicación comercial sin alargar formulario |
| Legales | `/privacidad/`, `/condiciones/`, `/en/privacy/`, `/en/terms/` | 200; canonical propio | Pueden seguir indexables; no convertirlas en objetivos de adquisición |
| Operativas ES | `/comprar/`, `/cuenta/`, `/editor/`, `/editor/pago/` | 200, `noindex` | Mantener noindex y fuera del sitemap; seguridad real mediante autorización |
| Operativas EN | `/en/comprar/`, `/en/account/`, `/en/editor/`, `/en/editor/pago/` | 200, `noindex` | Igual que ES |
| Alias cuenta | `/en/cuenta/` | 308 → `/en/account/`; archivo fuente tiene noindex y canonical destino | Mantener redirect y actualizar cualquier enlace antiguo |
| Demos | 22 × ES/EN, enumeradas en §14 | 200; sin canonical, sin noindex, sin hreflang | Separarlas de fichas comerciales. Decisión propuesta: demos noindex cuando existan fichas útiles, previa revisión de tráfico/indexación |
| 404 | `/404.html` | Acceso directo 200, `noindex,follow`; URL inexistente devuelve 404 real | Aceptable con exclusión de sitemap; conservar respuesta 404 para rutas inexistentes |
| Filtros | `?estilo=`, `?lugar=`, `?apertura=`, `?tono=`, `?q=` | `?estilo=elegante` devuelve 200 y el mismo HTML del catálogo base | Estados de navegación, no catálogo infinito de landings; canonical al catálogo base para variantes equivalentes |
| Preview | `/demo/<id>/?lz=editor&k=…`, `?lz=vista&k=…` y EN | Mecanismo comprobado en `demo/shared/content.js:24`; no se consultaron datos privados | Siempre noindex, fuera de sitemap, sin publicación accidental de contenido personal |
| APIs | `/api/cotizacion`, `/api/invitation-asset` | GET 405; POST declarado en código; no-store | No son páginas indexables ni deben estar en sitemap |
| Invitaciones reales | No se identificó un router público de invitaciones en este checkout | Backend tiene slug y modo de acceso; el frontend anuncia publicación futura | Definir política antes del lanzamiento; no inventar rutas existentes ni afirmar exposición comprobada |

No hay paginación actual: son 22 tarjetas y filtros en cliente. Tampoco se identificaron rutas comerciales dinámicas de fichas, categorías, precios, blog ni funcionalidades. Los querystrings del catálogo no son páginas localizadas independientes.

### 3.3 Enlaces rotos y páginas huérfanas

El análisis de referencias literales de los 64 HTML no encontró destinos internos de navegación o assets inexistentes, salvo `/assets/backend/config.js` y `client.js`, que **son salidas generadas por el build**, no enlaces rotos demostrados. `config.js` devuelve 200 en producción. El análisis estático no cubre cada enlace construido en JS ni enlaces externos de todos los diseños.

Las portadas enlazan 6 demos en cada idioma mediante `<a href>`. Los catálogos renderizados contienen las 22 tarjetas por idioma; las otras 16 demos de cada idioma dependen de ese render para el principal descubrimiento comercial. No son páginas huérfanas absolutas, pero su descubrimiento inicial sin JS es débil. No se identificó una necesidad de paginación por volumen actual. Al crecer, usar páginas numeradas con enlaces reales y canonicals propios si se añade paginación, sin depender exclusivamente de infinite scroll.

## 4. Hallazgos priorizados con evidencia

P0 = impide indexación o funcionamiento esencial; P1 = impacto potencial alto; P2 = optimización recomendable; P3 = opcional/experimental. El impacto describe el alcance esperado, no una pérdida de tráfico medida. Esfuerzo estimado: bajo ≈ horas/1 día, medio ≈ 2–5 días, alto ≈ más de una semana, según revisión y dependencias; no son compromisos de entrega.

| ID / estado | Problema | Ubicación | Evidencia | Impacto | Área | Solución específica | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|---|
| F01 · V | Catálogo sin contenido comercial inicial | `disenos/index.html:36,48`; `en/disenos/index.html`; `galeria.js` | HTTP 200 con `<h1 id="title"></h1>` y grid vacío; Chromium crea H1 y 22 tarjetas | Alto | Rendering / enlaces | Generar H1, introducción, tarjetas y enlaces durante build; JS solo filtra/mejora | Medio | P1 |
| F02 · V | Variantes duplicadas sin consolidación en páginas principales | Portadas, ambos catálogos; Vercel | `/index.html` y `/` 200 con el mismo cuerpo; `/disenos`, `/disenos/`, `/disenos/index.html` 200; sin canonical | Alto | Canonicalización | Canonical propio absoluto; redirecciones 301/308 de variantes elegidas tras probar rutas y parámetros | Medio | P1 |
| F03 · V/R | Filtros sin política de indexación | `galeria.js`, home → `/disenos/?estilo=…` | Variante elegante 200 con mismo HTML y metadata que catálogo; no canonical | Medio | Crawl / duplicación | Canonical base para filtros equivalentes; limitar combinaciones enlazadas; búsqueda vacía/sin resultados noindex si se ofrece como documento independiente | Bajo/medio | P1 |
| F04 · V | Alternates relativos en portada/catálogo | `index.html:12–13`, `disenos/index.html:9–10` y EN | `href="/"`, `/en/`, `/disenos/`; Google solicita URLs completas para hreflang | Alto potencial | Internacional | URLs absolutas, par ES/EN autorreferente, equivalencia comprobada; x-default opcional | Bajo | P1 |
| F05 · V | Falta autorreferencia en alternates de cotización y legales | `cotizar`, `en/quote`, privacidad/condiciones y traducciones | Cada página enlaza el otro idioma, pero no se incluye a sí misma | Medio | Internacional | Completar ES y EN en las dos páginas de cada pareja; mantener canonical de cada idioma | Bajo | P2 |
| F06 · V/O | Demos ocupan el lugar de fichas comerciales | 44 rutas demo; `catalogo.js` | Títulos de parejas ficticias; contenido de boda, no información de compra; no noindex | Alto potencial | Arquitectura / intención | Crear fichas seleccionadas con valor propio; conservar demo; política noindex de demos tras revisar GSC y habilitar fichas | Alto | P1 |
| F07 · V/R | Preview sin directiva SEO específica | `demo/shared/content.js:24`; demos | `lz`/`k` activan lectura local; HTML base de demos no tiene noindex | Medio | Privacidad / indexación | Noindex desde respuesta para previews; preferir demos completas noindex si se adopta esa política; excluir parámetros de sitemap y analítica | Medio | P1 antes de publicar clientes |
| F08 · R | Política para invitaciones futuras no está definida en la capa HTTP | `services.mjs:66–96`, migración `202610180003…sql` | Existen acceso `family` y `public`, tokens y slugs; no router HTML cliente encontrado | Alto condicionado | Privacidad / lanzamiento | Noindex por defecto incluso para enlaces compartibles; acceso autorizado, no-store en respuestas privadas, expiración y revocación verificadas | Alto | P1 de lanzamiento, no P0 actual |
| F09 · V | Precio ficticio y CTA de compra en prelanzamiento | Portadas y tarjetas de `catalogo.js` | «Desde US$ XX» / «From US$ XX», «Comprar»; FAQ dice todavía no se puede comprar/publicar | Medio/alto | Contenido / conversión | Sustituir placeholder por «Precios disponibles con el lanzamiento»; CTA acorde a demo/editor realmente disponible | Bajo | P1 |
| F10 · V | No hay sitemap servido | `/sitemap.xml`; build `scripts/build.mjs:15` | HTTP 404; no generación/copia declarada | Medio | Descubrimiento | Generar sitemap con allowlist comercial, URLs canónicas 200 y pares de idioma; copiar al dist | Bajo/medio | P2 |
| F11 · V | No hay robots.txt servido | `/robots.txt`; build | HTTP 404; sin archivo publicado | Bajo | Crawling | Servir robots explícito y sitemap; no bloquear páginas que deban procesar noindex | Bajo | P2 |
| F12 · V | OG incompleto y Twitter Cards ausentes | Portadas y resto de HTML | Solo portada ES/EN tiene `og:title`/`description`; no og:image/url/type ni Twitter | Medio | Compartir / CTR social | Imagen editorial comercial, URL absoluta, locale, type y cards; metadata distinta de la invitación privada | Medio | P2 |
| F13 · V | Sin JSON-LD propio en HTML auditado | 64 archivos y respuestas de páginas | No se encontró `application/ld+json` en HTML | Medio potencial | Entidad / semántica | Organization y WebSite veraces; BreadcrumbList en futuras fichas; WebApplication cuando esté descrita y operativa | Medio | P2 |
| F14 · V/O | Title del catálogo poco explícito | `/disenos/`, `/en/disenos/` | «Los diseños — Invitesse» / «The designs — Invitesse» | Medio | Metadata / intención | «Diseños de invitaciones digitales de boda — Invitesse» y equivalente natural EN | Bajo | P2 |
| F15 · V/O | No hay páginas comerciales específicas de RSVP/estilos | Árbol de rutas y home `#panel` | Funciones explicadas en secciones; estilos solo filtran catálogo | Medio/alto | Contenido | Probar una landing RSVP y 2–3 categorías con selección y criterio editorial reales; evitar múltiples variantes sin valor | Alto | P2 |
| F16 · V/R | Assets grandes en experiencias visuales | `assets/arco/lluvia-cristal.png`, Glicina, Marfil | 1.682.001 B PNG lluvia; 923.916 B velo; 802.566 B lazo; no CWV medido | Medio potencial | Rendimiento | Ensayar WebP/AVIF/variantes con transparencia y calidad comparada; no quitar efectos ni convertir a JPEG imágenes con alfa | Medio | P2 |
| F17 · V/R | Muchos preloads compiten en Nácar | `demo/nacar/index.html:10–14` | Foto interior + tapa/base/perlas/broche precargados; coste en red pendiente | Medio potencial | LCP / carga | Medir waterfall; priorizar apertura visible, diferir foto interior y adornos no visibles si mejora sin retrasar interacción | Medio | P2 |
| F18 · V/R | Fuentes externas bloquean CSS de páginas comerciales | Cabeceras home/catálogo/cotizar | Google Fonts stylesheet normal; `display=swap`, preconnect presentes | Medio potencial | FCP / CLS | Evaluar WOFF2 local, subconjuntos y pesos reales; fallback con métricas ajustadas; no preload de todas las fuentes | Medio | P2 |
| F19 · V/R | Revalidación en assets estables | Imagen hero, `home.js?v=2`, `catalogo.js?v=4` públicos | `Cache-Control: public,max-age=0,must-revalidate` | Medio potencial | Cache | Fingerprints de contenido + cache larga solo para assets inmutables; conservar config backend no-cache y APIs no-store | Medio | P2 |
| F20 · R | Coste de animación y DOM compartido sin perfil de interacción | Arco/Señal/Nácar, `panel.js`, `content.js` | Canvas/rAF, intervalos y scripts compartidos; no INP de campo | Medio potencial | INP / CPU | Perfilar abrir/cerrar/filtros/RSVP; pausar fuera de vista/pestaña; carga diferida selectiva sin romper orden del editor | Medio/alto | P2 |
| F21 · V | Varios H1 en algunas demos | Clásico ES/EN; DOM local Glicina | Clásico: 2 H1 en fuente; Glicina: 2 tras JS | Bajo | Semántica / accesibilidad | Revisar función de encabezados de apertura y portada; un principal y secundarios coherentes | Bajo | P3 |
| F22 · R | CWV, contraste y teclado completo sin evidencia suficiente | Producción móvil/desktop | Smoke checks locales pasan, fuentes externas bloqueadas; sin Lighthouse/axe/CrUX | Medio potencial | Validación | Establecer baseline real y revisión manual; no declarar «WCAG cumplido» ni rendimiento aprobado | Medio | P2 |
| F23 · V/R | Desajuste código / despliegue | Demos y editor; `language.js` publicado | Diff de HTML remoto introduce script no presente en checkout | Medio | Trazabilidad | Identificar versión desplegada y auditar diferencias antes de aplicar cambios; repetir smoke checks | Bajo/medio | P1 antes de implementar |
| F24 · O | Información corporativa dispersa | Legales, footer y home | Responsable y contacto en legales; no página dedicada al producto/equipo | Medio potencial | Confianza / GEO | Explicar autoría, proceso y límites del servicio; página Sobre Invitesse solo con material real | Medio | P2 |
| F25 · O | Falta medición de adquisición y leads de cotización en el plan visible | `privacy.js`, `quote.js` | Hay eventos de catálogo/demo/cuenta con consentimiento; cotización no figura entre las rutas comerciales de `privacy.js` | Medio | Analítica | Definir medición consentida de CTA y éxito confirmado del formulario, sin datos personales; no reportar leads sin confirmar | Medio | P2 |
| F26 · O | llms.txt ausente | `/llms.txt` | HTTP 404 | Bajo/no demostrado | GEO experimental | Opcional solo con resumen y URLs comerciales públicas; medir utilidad, sin prometer citas | Bajo | P3 |

### 4.1 Verificaciones positivas y detalles que evitan falsas alarmas

- `http://invitesse.com/` → **308** `https://invitesse.com/` → **308** `https://www.invitesse.com/` → **200**. Sin www HTTPS → www HTTPS en un salto; HTTP www → HTTPS www en un salto. El doble salto del primer caso es una mejora menor opcional, no un problema crítico. HSTS presente.
- `/en/cuenta/` → **308** `/en/account/` → **200**. El canonical del archivo fuente de redirección no se cuenta como canonical servido en la página final.
- `/seo-audit-missing-20261019/` → **404**, con el documento 404 personalizado. No se observó un fallback 200 universal ni soft-404 generalizado.
- No se encontró `X-Robots-Tag` en las respuestas HTML consultadas. No es un problema cuando el meta robots implementa la política deseada. La portada no contiene un noindex accidental.
- **7** archivos fuente tienen canonical: 6 páginas legales/cotización y el alias de cuenta. En las respuestas finales corresponden a **6 páginas distintas** con canonical, porque el alias redirige.
- **10** archivos fuente tienen noindex: 8 operativos, el alias y 404. Los destinos finales únicos con noindex son 9, contando 404. No hay razones SEO para indexar el editor o el checkout.
- Imágenes literales en el HTML: no se encontraron atributos alt ausentes. El DOM de la muestra local tampoco presentó imágenes sin alt. Alt vacío en adornos puede ser correcto.
- El SDK Supabase **no se carga para visitas anónimas a la tienda**, según `account-nav.js`; no recomendar quitar un SDK supuestamente cargado allí sin evidencia. Config sí se solicita.
- La música usa `new Audio()` y `preload='none'` en `demo/shared/panel.js:430`; el MP3 de 2.387.382 B no debe contarse automáticamente como descarga inicial.
- GA4 y Clarity se activan tras consentimiento y excluyen invitaciones/editor/cuenta según `assets/brand/privacy.js`. No se probó ingestión en esos servicios; preservar estas exclusiones.
- El build usa allowlist. Crear robots o sitemap en la raíz **no los publicaría** hasta incorporarlos explícitamente a la salida.

## 5. Metadata, encabezados y contenido

### 5.1 Diagnóstico por tipo de página

| Página | Evaluación actual | Propuesta concreta |
|---|---|---|
| Home ES | Title específico; H1 «Una invitación que da gusto abrir.»; el contexto «Invitaciones digitales de boda» está visible al lado; descripción comunica apertura + RSVP | Mantener H1 editorial y descriptor visible. No hace falta convertir el H1 en una lista de keywords. Añadir canonical/OG y corregir placeholders |
| Home EN | «Invitesse — digital wedding invitations»; «An invitation worth opening.»; texto localizado | Conservar tono, revisar vocabulario de guest/household/place; no prometer bilingüismo comercial antes de lanzarlo |
| Catálogo ES/EN | Titles demasiado genéricos; descriptions útiles; principal ausente sin JS | Prerenderizar título, selección, filtros y enlaces; introducción breve que explique apertura, estilos y personalización |
| Cotización ES/EN | Title y descripción claros; H1 editorial; formulario real en HTML | Añadir alcance, proceso, lo que se necesita para cotizar y tiempos solo si están confirmados. No inventar «desde» ni entrega garantizada |
| Demos, todas | Titles/descriptions únicos, pero centrados en ejemplos de boda y con longitud desigual | No optimizar nombres ficticios como si fueran producto. Ficha comercial separada; demo puede conservar su narrativa |
| Legales | Identidad y contacto verificables en página; canonical correcto | Mantener exactitud, completar alternates; no sustituir por copy SEO |
| Cuenta/editor/compra/pago | noindex correcto; descriptions pueden describir posibilidades futuras | Mantener exclusión. Revisar promesas de métodos de pago con producto; no es una prioridad de ranking |

Ejemplos de metadata propuestos, no implementados:

| Destino | Title sugerido | Descripción sugerida |
|---|---|---|
| `/disenos/` | Diseños de invitaciones digitales de boda — Invitesse | Exploren invitaciones de boda con aperturas interactivas y una estética cuidada. Comparen estilos y prueben cada diseño en su demo. |
| `/en/disenos/` | Digital Wedding Invitation Designs — Invitesse | Explore wedding invitations with distinctive interactive openings. Compare styles and try each design in a live demo. |
| Futura ficha Ónix ES | Ónix: invitación digital de boda en blanco y negro — Invitesse | Un sobre negro con lacre marfil y una apertura con foto. Descubran el diseño Ónix, sus opciones de personalización y su demo. |
| Futura ficha Ónix EN | Ónix: Black and White Digital Wedding Invitation — Invitesse | A black envelope, an ivory wax seal and a photo-lined opening. Explore Ónix, its customization options and live demo. |

Los títulos son propuestas editoriales; Google puede reescribirlos. No hay un límite mágico de caracteres que garantice un snippet. La longitud de las descripciones de demos no debe tratarse como un error crítico por sí sola.

### 5.2 Contenido comercial que falta resolver

La home sí explica edición, panel, respuestas por persona, demo y diferencia entre colección y a medida. La FAQ existe en HTML dentro de `<details>`; no es texto oculto para manipular buscadores. Responde dudas útiles y declara límites de prelanzamiento.

Antes de lanzar contratación faltan respuestas comerciales confirmadas sobre precio final, vigencia del enlace, cambios después de publicar, soporte, alcance del RSVP, idiomas, dominio propio, privacidad, cancelación y qué sucede al terminar el servicio. Algunas se anuncian explícitamente como pendientes. Presentar estas respuestas cuando se confirmen; no completar huecos con suposiciones.

Para la ficha de cada diseño: describir la apertura, contexto visual, fotos o ausencia de fotos, paletas realmente compatibles, idiomas disponibles, navegación, demo y opciones efectivamente incluidas. Evitar copiar el mismo bloque cambiando el nombre del diseño. Los detalles ya disponibles en `catalogo.js` pueden alimentar el texto, pero requieren edición y verificación contra la demo y el editor.

## 6. Arquitectura SEO propuesta

### 6.1 Mantener lo existente y ampliar con criterio

```text
/                                  Home ES: categoría principal y marca
/disenos/                          Colección completa, HTML estático
/disenos/onix/                     Ficha comercial, si aporta contenido propio
/disenos/nacar/                    Ficha comercial, si aporta contenido propio
/disenos/estilos/elegantes/         Selección editorial, no simple filtro duplicado
/disenos/estilos/botanicas/         Solo con selección suficiente y valor diferencial
/invitaciones-con-rsvp/            Explicación comercial verificable de RSVP
/cotizar/                          Servicio de diseño a medida
/precios/                          Solo al confirmar oferta y condiciones
/sobre-invitesse/                  Autoría y proceso reales, si hay material suficiente
/recursos/…                        Recursos puntuales que resuelvan dudas reales
/en/                               Home EN existente
/en/disenos/                       Mantener URL actual; no migrarla solo por el slug
/en/disenos/onix/                   Ficha EN con el mismo identificador estable
/en/design-styles/elegant/          Nueva categoría localizada si se crea
/en/wedding-rsvp/                   Funcionalidad EN
/en/quote/                         Servicio a medida existente
/en/pricing/                       Solo al confirmar la oferta
/demo/<id>/ y /en/demo/<id>/        Experiencia interactiva, separada del producto
```

Son rutas **propuestas**, excepto las ya inventariadas. No hay que construir todas para lanzar el primer lote. No recomiendo otra landing genérica de «invitaciones digitales de boda» que compita con la home: la home puede cubrir esa intención. «Invitaciones digitales» es una categoría más amplia que bodas; trabajar primero bodas, que es lo que demuestra la colección. Cumpleaños, quince años o eventos corporativos solo cuando haya oferta real.

### 6.2 Reglas para indexar fichas y categorías

Una ficha merece indexación si permite comparar y decidir: imágenes propias accesibles, descripción específica de apertura y estilo, compatibilidad de personalización, características confirmadas, acceso a la demo, disponibilidad real y enlaces a alternativas. No existe un mínimo arbitrario de palabras ni se exige una gran extensión para una buena ficha.

Lanzar primero fichas de los seis destacados: Nácar, Ónix, Arco, Encaje, Marfil y Jardín, **si cumplen ese criterio**. Las 22 se pueden incorporar después de revisión; no publicar 44 shells bilingües de golpe. Si un diseño aún no tiene contenido suficiente, mantenerlo accesible en el catálogo sin crear una ficha indexable vacía.

Las categorías deben aportar una selección clara, explicación estética útil y recomendaciones propias. Elegantes, románticas y botánicas son candidatas porque existen etiquetas y diseños reales; validar surtido y demanda. No crear páginas para cada color × lugar × apertura. El filtro debe seguir funcionando, aunque no sea una landing indexable.

### 6.3 Demos, invitaciones y seguridad

1. **Página comercial:** indexable, metadata propia, canonical propio, contenido público de producto.
2. **Demo:** experiencia con datos ficticios identificada como demostración. Propuesta: noindex cuando existan fichas; mantener `<a>` accesibles hacia tienda/ficha. Consultar GSC antes de retirar posibles URLs ya útiles. No redirigir todas las demos a fichas: se perdería la experiencia interactiva.
3. **Preview/editor:** noindex siempre; no usar su contenido local como información comercial. No incluir `k`, tokens, identificadores personales o borradores en sitemap, analítica, metadatos sociales o enlaces de adquisición.
4. **Invitación compartida de cliente:** por defecto noindex aunque sea accesible mediante enlace. «Compartible» no significa «consentimiento para aparecer en Google». La privacidad real requiere controles de acceso además de noindex.
5. **Invitación por familia:** autorización mediante token/capacidad validada, datos mínimos, no-store, revocación/expiración y referrer controlado. No tratar robots.txt como barrera de seguridad ni enumerar slugs privados allí.

El SQL limita `get_published_invitation` al modo `public` y dispone de un resolver de token para familias. `api/invitation-asset.js` usa POST, verifica el manifest de publicación, devuelve URL firmada de 60 segundos y configura `no-store` y `no-referrer`. Son protecciones observables en código; no se validó su despliegue completo ni se accedió a invitaciones reales.

### 6.4 Escalabilidad sin reconstrucción

Usar el catálogo como fuente de identificadores, traducciones, estilos, assets y capacidades. Añadir un registro comercial explícito (`indexable`, idiomas publicados, texto aprobado, fecha de cambio significativa) que genere páginas, navegación, alternates y sitemap en build. No derivar el sitemap de todos los archivos ni de la base de clientes. La inclusión debe ser por allowlist positiva.

El JS actual del catálogo asume que crea todas las tarjetas. Para pasar a HTML inicial hay que cambiarlo para mejorar nodos existentes, sin duplicar tarjetas ni listeners. Mantener identificadores `data-id`, filtros y el orden requerido por la vista previa. No cargar `content.js` o el editor completo en las nuevas fichas comerciales.

## 7. Keywords ES/EN y asignación de intención

Las siguientes son **hipótesis de demanda y competencia**, basadas en producto y páginas competidoras observadas. No se tienen volúmenes, KD, posiciones ni datos regionales. «Competencia estimada» es un juicio cualitativo: grandes catálogos gratuitos y plataformas de boda cubren las consultas generales; las combinaciones de estilo y función parecen más específicas, pero no garantizan facilidad de posicionamiento.

| Cluster / idioma | Principal y secundarias | Intención | Relevancia | Página recomendada | Competencia estimada | Prioridad comercial | Posibilidad de posicionamiento / condición |
|---|---|---|---|---|---|---|---|
| Bodas ES | **invitaciones digitales para bodas**; invitaciones de boda online, invitaciones digitales de boda | Comercial | Muy alta, oferta real | Home existente | Alta, por alternativas generalistas | Alta | Objetivo central a medio plazo; validar SERP ES/CO/MX y señales actuales |
| General ES | **invitaciones digitales**; invitaciones online | Mixta; incluye otros eventos y herramientas gratuitas | Parcialmente amplia | Home, como secundaria | Alta estimada | Media | Evitar ampliar promesa más allá de bodas; no crear landing genérica duplicada |
| Colección ES | **diseños de invitaciones digitales de boda**; plantillas de invitaciones de boda, modelos de invitaciones digitales | Comparar diseños | Muy alta | `/disenos/` | Alta estimada | Alta | Catálogo prerenderizado mejora elegibilidad; no garantiza ranking |
| Elegancia ES | **invitaciones digitales de boda elegantes**; invitaciones de boda sofisticadas, invitaciones premium | Comercial estética | Muy alta | Categoría elegantes con selección real | Media/alta, sin KD | Alta | Hipótesis de encaje fuerte por diferenciación visual |
| Apertura ES | **invitaciones interactivas de boda**; invitación con sobre digital, invitaciones con animación | Comercial / demostración | Muy alta | Categoría/explicación dentro del catálogo; ficha por apertura | No validada; potencialmente más específica | Alta | Apoyar con captura y demo; comprobar cómo se busca realmente |
| RSVP ES | **invitaciones con confirmación de asistencia**; confirmación por familia, invitaciones digitales con RSVP | Comercial funcional | Muy alta, con disponibilidad delimitada | `/invitaciones-con-rsvp/` | Media/alta estimada | Alta al lanzar | Puede captar mejor intención que un texto solo estético; demostrar flujo real |
| A medida ES | **invitaciones digitales personalizadas para boda**; invitaciones de boda a medida, diseño exclusivo de invitaciones | Contratar servicio | Muy alta | `/cotizar/` | No validada; mayor especificidad | Alta si se atienden leads | Buena hipótesis inicial por ticket/servicio, sin previsión cuantitativa |
| Web de boda ES | **páginas web para bodas**; web de boda con RSVP, web privada para boda | Comparar plataformas | Alta pero distinta de tarjeta digital | Home como secundaria o recurso comparativo útil | Alta: Bodas.net/Joy y similares | Media | Explicar alcance y límites; no prometer suite completa de planificación |
| Estilos ES | **invitaciones digitales de boda botánicas**; románticas, blanco y negro, art déco | Comercial específica | Alta según colección | Categorías curadas / fichas | No validada; mayor especificidad | Media/alta | Probar 2–3 selecciones, no generar todas las combinaciones |
| Sin fotos ES | **invitaciones digitales de boda sin foto**; invitaciones de boda sin fotos elegantes | Comercial específica | Alta para diseños compatibles | Sección en catálogo y fichas compatibles | No validada | Media | Validar encaje y demanda; `NO_PHOTOS` en content.js identifica 5 compatibles |
| Bodas EN | **digital wedding invitations**; online wedding invitations, wedding e-invitations | Comercial | Muy alta | `/en/` | Alta: Paperless Post/Greenvelope | Alta | Objetivo sostenido; evitar competir inicialmente solo por «free» |
| Designs EN | **digital wedding invitation designs**; wedding invitation templates, online wedding invitation designs | Comparación | Muy alta | `/en/disenos/` | Alta estimada | Alta | Mostrar colección y características en HTML, sin depender del render |
| Premium EN | **elegant digital wedding invitations**; luxury digital invitations, sophisticated online wedding invitations | Comercial estética | Muy alta | Categoría elegant / fichas | Media/alta sin KD | Alta | Demostrar diseño y proceso; «luxury» sin evidencia visual no diferencia |
| Interactive EN | **interactive wedding invitations**; animated wedding invitations, digital envelope wedding invitations | Comercial | Muy alta | Catálogo/fichas con aperturas reales | No validada | Alta | Diferenciación clara; verificar SERP y vocabulario del comprador |
| RSVP EN | **wedding invitations with online RSVP**; wedding RSVP websites, household RSVP wedding | Funcional / comercial | Alta | `/en/wedding-rsvp/` | Alta, Joy y Greenvelope | Alta al lanzar | Explicar per-guest y households; no presentarlo como gestor sin límites |
| Bespoke EN | **custom digital wedding invitations**; bespoke wedding invitations online, custom wedding invitation website | Contratar servicio | Muy alta | `/en/quote/` | No validada; segmento específico | Alta | Validar mercados, presupuesto y atención en inglés |
| Website EN | **wedding invitation websites**; wedding website with RSVP, personalized wedding website | Comparar producto | Alta | Home; recurso explicativo si ayuda | Alta por grandes plataformas | Media | Diferenciar invitación experiencial de suite gratuita de bodas |
| Style EN | **black and white digital wedding invitations**; botanical, romantic, art deco wedding invitations online | Comercial específica | Alta según diseño | Fichas y categorías seleccionadas | No validada | Media/alta | Adecuado para probar long-tail sin crear páginas redundantes |
| Educación ES/EN | **cómo confirmar asistencia a una boda por familia** / **how to collect wedding RSVPs by household**; qué incluir / what to include in a digital wedding invitation | Informativa con conexión al producto | Alta | Recurso breve con ejemplo propio y enlace a demo | No validada | Media | Publicar solo si responde mejor que la FAQ y puede mantenerse |
| WhatsApp ES | **invitaciones de boda para enviar por WhatsApp**; enlace de invitación con RSVP | Comercial / cómo compartir | Alta si el enlace funciona como se describe | FAQ/recurso y funcionalidad existente | No validada | Media | Diferenciar de descargar una imagen; validar preview social y privacidad sin prometer integración nativa |

### 7.1 Validación antes de ampliar contenidos

Consultar Search Console por país, idioma, URL e intención; registrar impresiones/clics y consultas existentes sin interpretarlas como todo el mercado. Complementar con Keyword Planner u otra herramienta y SERPs reales ES/CO/MX y mercado EN prioritario. Comparar top resultados, formato dominante (catálogo, producto, herramienta gratuita, tutorial), autoridad aparente, brechas y propuesta comercial. La prioridad entre CO, MX, España y mercados EN requiere datos o decisión comercial; no se prescribe una expansión regional automática.

Asignar cada intención principal a una URL por idioma. Revisar canibalización antes de crear páginas. Medir visitas cualificadas → catálogo → demo → solicitud de cotización o creación real de borrador; compra solo cuando esté operativa. Revisar el lote inicial a las 8–12 semanas como intervalo operativo propuesto, sin prometer resultados en ese plazo.

## 8. SEO internacional

Conservar ES raíz y EN `/en/`. `lang` está definido en HTML y las páginas comerciales principales tienen textos localizados, no solo un selector de idioma. `/en/disenos/` es menos natural que `/en/designs/`, pero cambiarlo ahora no aporta por sí mismo una mejora demostrada: mantenerlo evita una migración innecesaria.

Implementar para páginas indexables:

- Canonical absoluto a la propia URL en cada idioma. **Nunca canonical EN → ES** por ser traducción; eso entra en conflicto con la intención de indexar inglés.
- Hreflang `es` y `en` completos, autorreferentes y recíprocos, solo entre equivalentes reales y canónicos. No anunciar traducciones todavía no publicadas.
- `x-default` es opcional. Usar `/` como fallback de la pareja de home si esa es la política del sitio; no enviar todos los x-default de fichas a la home indiscriminadamente. Para fichas, elegir el equivalente de fallback de esa ficha o no añadirlo.
- Sitemap con `<xhtml:link>` para ambas versiones, consistente con el HTML. No incluir demos si pasan a noindex, cuentas, filtros, previews, errores o URLs que redirigen.
- No elegir idioma automáticamente mediante redirección de crawlers/IP. Mostrar selector con enlaces reales. En catálogo el selector ya conserva los filtros; conservar comportamiento y limpiar valores inválidos.
- Adaptar explicación de «cupos», familia/household, RSVP, formatos de fecha, moneda, contratación y soporte. No anunciar precios en monedas o disponibilidad que no estén confirmados.
- Usar `es`/`en` genéricos mientras no haya diferencias comerciales por país. Evitar páginas es-CO/es-MX/es-ES idénticas solo para cubrir regiones.

Las demos actualmente no declaran hreflang. Si se adopta noindex para ellas, no hace falta convertirlas en el objetivo del programa hreflang; priorizar fichas comerciales. No confundir el idioma de la tienda con el idioma guardado de una invitación, especialmente por las diferencias publicadas de `language.js`.

## 9. Datos estructurados y visibilidad en IA

### 9.1 Schema.org adecuado

| Tipo | Aplicación a Invitesse | Condición / limitación |
|---|---|---|
| Organization | Identidad de marca, URL, contacto y perfiles oficiales | No afirmar sociedad mercantil: legales identifican una persona natural bajo la marca. Confirmar representación y logo público antes de marcarlo |
| WebSite | Sitio comercial ES/EN, nombre y URL | No añadir SearchAction ficticio ni un buscador que no tenga una ruta funcional correspondiente |
| WebApplication / SoftwareApplication | Producto web para preparar y gestionar invitaciones | Marcar solo funciones verificadas y disponibilidad real; sin inventar ofertas, ratings ni compatibilidades |
| BreadcrumbList | Nuevas fichas y categorías con navegación visible | Coincidir con breadcrumb mostrado y canonicals |
| Product | Eventual diseño/producto efectivamente comercializado | No usar de forma masiva para demos ficticias; precios reales y disponibilidad veraz si hay Offer; no «US$ XX» ni precio 0 inventado |
| FAQPage | FAQ visible y útil, si se decide mantener marcado | La FAQ actual es válida como contenido. Google limita sus rich results de FAQ a sitios sanitarios/gubernamentales reconocidos; no esperar ese beneficio para Invitesse |
| Event / Wedding | No recomendado para las bodas ficticias de demos | No son eventos reales comercializados por Invitesse; marcar ejemplos como eventos reales confundiría entidad y contenido |

Schema.org no garantiza rich results ni citas de IA. Organization/WebSite ayudan a expresar datos, pero también deben estar visibles en el sitio. El JSON-LD debe actualizarse junto con el contenido, no como una fuente paralela de promesas.

### 9.2 GEO/AEO con utilidad comprobable

La ventaja más sólida es que el producto sea comprensible y verificable en páginas accesibles: qué es Invitesse, para quién sirve, qué diferencia una apertura interactiva, cómo responde cada invitado, cómo se contrata, qué está incluido y qué sigue en preparación. Una respuesta breve seguida de una demo o captura propia aporta más que páginas repetitivas para cada formulación de una pregunta.

Acciones recomendadas:

1. Mantener en home una descripción explícita de producto y etapa; llevar explicaciones específicas a las fichas y RSVP, con ejemplos reales del flujo.
2. Consolidar identidad, responsable, contacto, perfiles oficiales y autoría/proceso. Las páginas legales ya aportan datos de identidad; usarlos con consistencia, sin publicar datos personales adicionales innecesarios.
3. Explicar límites de privacidad, disponibilidad, duración y soporte al confirmarse; distinguir «demo», «preview» y «invitación publicada» en textos públicos.
4. Conseguir referencias editoriales reales mediante relaciones con wedding planners, proveedores y publicaciones afines. No se envió ningún mensaje ni se propone compra de enlaces o reseñas.
5. Auditar que buscadores y crawlers de búsqueda de asistentes puedan recibir el HTML comercial; decidir por separado políticas para entrenamiento y búsqueda según documentación vigente de cada proveedor. No bloquear todos los bots indiscriminadamente ni permitirles áreas privadas para buscar visibilidad.
6. Revisar menciones y referencias externas reales; no añadir `sameAs` a perfiles que no pertenezcan a la marca.

`llms.txt` sería un experimento P3 con resumen y enlaces públicos, no un estándar de indexación universal ni un factor de ranking demostrado. Su ausencia 404 no perjudica por sí misma el SEO. No debe contener invitados, tokens ni invitaciones reales. La probabilidad de recomendación de IA no se puede cuantificar con la evidencia disponible.

## 10. Rendimiento y Core Web Vitals

### 10.1 Evidencia disponible

**No hay métricas CWV medidas.** No se asignan puntuaciones ni se declara que el sitio pase o falle los umbrales. Los tamaños siguientes son bytes de archivos o scripts locales observados, sin compresión de transferencia; no equivalen al peso completo de una navegación publicada.

| Evidencia | Medida / observación | Interpretación correcta |
|---|---|---|
| Dos imágenes hero ES | `romantico-sobre.jpg` 114.669 B; `romantico-portada.jpg` 75.594 B | Aproximadamente 190 KB de archivos; evaluar variantes responsivas, no asumir fallo LCP |
| Catálogo JS propio | `catalogo.js` 33.276 B + `galeria.js` 16.669 B | Puede conservarse JS de filtros tras prerenderizar; no necesita React/Next para mejorar |
| Scripts compartidos de demos | `content.js` 54.642 B, `panel.js` 43.541 B, `marcos.js` 10.326 B | Aproximadamente 108,5 KB antes del layout/behavior específico; posible división tras perfilar |
| Editor | `editor/editor.js` 196.966 B | Pertenece a flujo operativo; no atribuir su peso a la home anónima |
| Arco | `lluvia-cristal.png` 1.682.001 B | Candidato a reducir mediante formatos/variantes preservando transparencia y efecto |
| Glicina | `optimized/cortina-velo.webp` 923.916 B; `optimized/jardin-villa.webp` 466.606 B | Incluso WebP puede ser caro; evaluar dimensiones y variantes de pantalla |
| Marfil | `lazo-desatar.webp` 802.566 B; `lazo-desatar.webm` 336.343 B | Comparar calidad/coste y elegir por dispositivo/compatibilidad sin descargar ambas alternativas innecesariamente |
| Música | `demo.mp3` 2.387.382 B, preload none | No es evidencia de 2,4 MB iniciales; mantener carga tras interacción |
| Assets totales del repositorio | 226 archivos, 28.321.196 B | Inventario de disco, **no peso de una página** |
| Home imágenes | width/height, thumbs WebP, srcset y lazy en tarjetas | Buen punto de partida para CLS y responsive; hero no debe lazy-load |
| Cache observado | HTML/assets seleccionados revalidan; config no-cache; APIs no-store | Optimizar assets versionados, conservar restricciones de datos y configuración |

Chromium local no mostró errores JS de página ni desbordamiento horizontal en las 22 cargas de muestra. Mostró contenido generado en catálogo y demos, pero las fuentes externas estaban bloqueadas. Esto no prueba estabilidad con fuentes finales, accesibilidad completa, ausencia de long tasks o rendimiento real de móvil.

### 10.2 Plan de medición y mejoras sin perder la estética

| Métrica / área | Medición pendiente | Cambio a probar y criterio |
|---|---|---|
| LCP | Lighthouse/PSI mobile y desktop, 3 repeticiones por página representativa, waterfall y elemento LCP real | Priorizar recurso visible de apertura/hero; no priorizar toda la escena. Conservar la apertura; comparar captura y percepción |
| INP | CrUX si hay muestra o RUM consentido; laboratorio para long tasks en filtros, apertura, panel y RSVP | Reducir trabajo por interacción y pausar canvas fuera de vista. TBT de Lighthouse no es INP de usuarios |
| CLS | Sesión con fuentes reales, banner de privacidad y apertura/cierre; observer con fuentes de shifts | Reservar dimensiones y ajustar fallback tipográfico; no ocultar contenido comercial hasta finalizar animaciones |
| FCP | Waterfall y CSS crítico por dispositivo | Revisar CSS de fuentes y cantidad de pesos; no eliminar tipografías editoriales sin evaluar alternativas equivalentes |
| TTFB | Medir GET desde varias regiones con cache hit/miss | Distinguir proxy/CDN/origen; los tiempos de esta sesión no representan visitantes reales |
| JS | Coverage/Performance del navegador, scripts después de aceptar y rechazar analítica | Diferir herramientas no iniciales; mantener orden layout → content → panel → behavior que usa el editor |
| Imágenes | srcset, tamaños renderizados y comparación visual | Variantes 1×/2× proporcionadas, WebP/AVIF donde convenga; conservar bordes, alfa y texturas |
| Video/animaciones | Descargas de alternativas y actividad de CPU/GPU | Cargar animación al acercarse/accionar, poster fiel, reduced-motion y pausa al salir de vista |
| Compresión | GET con `Accept-Encoding: br,gzip`, negociación real | Las consultas auditadas no prueban negociación Brotli/gzip; no declarar compresión ausente porque no se solicitó |
| Cache | Repetición con versión vieja/nueva y despliegue | Hash de contenido antes de `immutable`; no aplicar a HTML, configuración ni activos privados firmados |
| Third parties | Comparar carga sin consentimiento, con GA4 y Clarity | Preservar gating y exclusiones; evaluar coste en medición real |

Objetivos de campo orientativos: p75 LCP ≤2,5 s, INP ≤200 ms y CLS ≤0,1; evaluar móvil y escritorio por separado sobre ventanas representativas de datos. Son criterios de validación, no resultados de Invitesse. FCP y TTFB son diagnósticos, no Core Web Vitals. Si CrUX no tiene muestra suficiente, usar medición de laboratorio con condiciones documentadas y RUM apropiado, sin presentar laboratorio como campo.

No hay `next/image`, optimización de fuentes de Next o ISR que configurar en este stack. Usar `<picture>`, `srcset`, WOFF2 y generación estática; una migración a Next solo por SEO no está justificada.

## 11. Accesibilidad relacionada con SEO

Aspectos observados favorables: `lang`, `main`, navegación semántica, skip link en páginas comerciales, botones reales para filtros/menú, `<a href>` para navegación, imágenes con alt, estados `aria-expanded`, `aria-pressed`, `aria-live` y manejo de foco/inert en filtros. El catálogo adquiere el nombre accesible del buscador mediante JS; al prerenderizar, incluirlo ya en HTML.

La muestra a 390 y 1440 px no tuvo overflow horizontal ni botones visibles sin texto/nombre ARIA según la inspección automatizada básica. No se ejecutó axe ni se hizo una navegación exhaustiva con teclado o lector de pantalla. El HTML de Glicina renderizado y Clásico contiene varios H1: revisar su jerarquía y la relación entre diálogo de apertura y contenido principal, sin afirmar penalización de Google por el número de H1.

Pendiente antes de declarar conformidad:

- Abrir menú/filtros/demos con Tab, Enter y Space; comprobar foco visible, Escape, retorno al disparador y ausencia de trampas.
- Verificar apertura por arrastre/rascado de Arco también por teclado. El código contiene una alternativa de click de teclado; falta probarla con fuentes y tiempos reales.
- Probar RSVP con errores, etiquetas, lector de pantalla y zoom 200–400%; confirmar anuncios y ausencia de foco en contenido `inert`.
- Medir contraste real de texto pequeño, placeholders, estados, botones y overlays sobre fotos en paletas predeterminadas y personalizadas. No hay un ratio medido que permita declarar un fallo específico.
- Revisar reduced-motion en todos los diseños; se comprobó su consulta en Arco, Nácar y Señal, no la experiencia completa de las 22 plantillas.
- Confirmar que los alt de imágenes editoriales explican el diseño, mientras los adornos tienen alt vacío y SVG decorativos están excluidos de accesibilidad.

Semántica y enlaces ayudan a interpretar y descubrir contenido; contraste, teclado y foco son requisitos de acceso/usabilidad. No se presenta cada mejora de accesibilidad como un factor directo de ranking.

## 12. Competencia y diferenciación

Revisión de páginas públicas el 19 de octubre de 2026. Se observaron HTML y enlaces, no su tráfico, indexación, rankings ni rendimiento. «Consultas que priorizan» significa temas inferidos de títulos, headings y categorías, no keywords con posiciones comprobadas.

| Competidor / evidencia | Arquitectura y contenido observados | Propuesta y consultas aparentes | Oportunidad para Invitesse |
|---|---|---|---|
| [Paperless Post](https://www.paperlesspost.com/cards/group/wedding-invitations), inglés, competidor directo | Ruta consultada `/cards/category/wedding-invitations` redirige a `/cards/group/wedding-invitations`; 200. Title «Wedding Invitations \| Free Digital Invites with RSVP». HTML incluye categorías enlazadas elegant, modern, rustic, estilos, temas, venues, precios y explicación de RSVP | Variedad, personalización, marcas/diseñadores y organización de invitaciones; wedding invitations, elegant/formal, modern y RSVP | No replicar la taxonomía completa. Crear pocas selecciones editoriales con aperturas propias; mostrar claramente que la experiencia continúa después de abrir el sobre |
| [Greenvelope](https://www.greenvelope.com/wedding-invitations), inglés, directo | 200; title «Online Wedding Invitations with RSVP Tracking \| Greenvelope»; H1/contenido menciona animated envelopes, panel, menús, recordatorios y seguimiento; algunos diseños muestran estado de carga en HTML | Invitaciones digitales con entrega y seguimiento; online wedding invitations y RSVP tracking | Premium por dirección visual y flujo por familia demostrable. Explicar funciones concretas, no competir solo con la palabra «elegante» |
| [Joy](https://withjoy.com/wedding-website/), inglés, producto sustitutivo | 200; title de free wedding websites/templates; enlaces `/online-rsvp/`, `/pricing/`, `/faq/`, invitaciones y blog; contenido comercial responde preguntas sobre privacidad, RSVP y viajes | Suite de web de boda, registro y organización; wedding website, online RSVP, privacidad, templates | Competir en experiencia de invitación y diseño, explicando alcance; no prometer funcionalidades de una suite completa que no existen |
| [Bodas.net Web de boda](https://www.bodas.net/web-boda), español, producto sustitutivo | Enlace desde el sitio consultado → `/website/index.php?actionReferrer=8` → `/web-boda?actionReferrer=8`, 200. Title «Web de boda gratis - Bodas.net». Contenido sobre diseños, personalización, RSVP sincronizado, álbum y organización | Gratuidad e integración con organizador; web de boda gratis, web personalizada, confirmación | Justificar elección premium mediante diseño, personalización, apertura y acompañamiento; evitar enfoque gratuito que atraiga intención comercial poco alineada |
| [Bodas.net directorio de invitaciones](https://www.bodas.net/bodas/proveedores/invitaciones-de-boda), español, competidor por descubrimiento / posible canal | 200; directorio de proveedores con filtros, fichas y preguntas sobre invitaciones digitales; enlaza proveedores identificables | Comparación de proveedores y presupuesto; invitaciones de boda, digitales y personalizadas | Evaluar presencia editorial/ficha legítima como canal si encaja con operación; no copiar geolandings de directorio sin valor |
| [Invifive, ficha pública](https://www.bodas.net/invitaciones-de-boda/invifive--e303085), español, directo | Ficha 200 titulada «Invifive - Consulta disponibilidad y precios»; descubierto en directorio que lo describe como proveedor de invitaciones digitales de boda; enlaces de promociones y multimedia | Diseño digital y consulta de disponibilidad/precio; «invitación premium» aparece en una promoción enlazada | Existe competencia comercial en español más allá de herramientas gratuitas. Explicar la diferencia con demos y servicio verificables. No se verificó arquitectura SEO de un sitio propio de Invifive |

La ficha de Invifive permite verificar un competidor directo en español, pero no sustenta atribuirle una estrategia de blog, categorías propias ni rankings. Sería necesario ampliar la investigación de proveedores locales y sus sitios propios al elegir países prioritarios.

Se descartaron URLs exploratorias de Canva y una ruta inicial de Bodas.net que devolvieron 404; no se utilizan como evidencia de su oferta. Un dominio explorado de invitaciones redirigió a una venta de dominios y tampoco se consideró competidor. La lista final se apoya en contenido accesible, no en esos intentos.

**Diferenciación recomendada:** una invitación que se vive como un sitio cuidado, con una apertura propia y una continuidad visual hasta el RSVP y el panel. Demostrarla con experiencias y detalles reales. No usar comparaciones despectivas con Canva ni afirmar superioridad objetiva sin criterios verificables. «Premium» debe expresarse en visuales, servicio y claridad de oferta.

## 13. Roadmap de implementación propuesto

Las fases agrupan trabajo; no obligan a esperar hasta fase 4 para corregir errores internacionales. Las correcciones básicas hreflang entran en fase 1; fase 4 desarrolla expansión y localización más avanzada. No se implementará sin aprobación.

| Fase | Trabajo y archivos | Dependencias | Esfuerzo orientativo | Impacto esperado | Criterios de validación |
|---|---|---|---|---|---|
| **1 — Correcciones críticas / fundamentos** | F02–05, F07–11, F23 según prioridad: confirmar versión publicada; canonical y política de variantes; correcciones hreflang; limpiar precios placeholders; robots y sitemap; proteger previews. `vercel.json`, `scripts/build.mjs`, HTML ES/EN, `catalogo.js`, nuevos archivos SEO | Checkout alineado con producción; decidir canonical con/sin slash y política demo; confirmar disponibilidad comercial; acceso GSC para no retirar URLs útiles a ciegas | Medio; aproximadamente 3–5 días de trabajo, sujeto a validación | Consolidación de señales y mensajes; menor riesgo de indexar variantes o contenido privado | GET/HEAD en producción: variantes → canonical; indexables 200 sin noindex; operativas/previews excluidas; robots/sitemap 200; XML válido sin datos privados; canonicals y hreflang coinciden |
| **2 — Optimizar páginas existentes** | F01, F12–14, F18 y ajustes semánticos: catálogo prerenderizado, metadata/OG, textos y enlaces, Organization/WebSite; explicar servicio a medida. Build, ambos catálogos, `galeria.js`, brand CSS/assets, home y cotizar | Fase 1 estable; texto e imágenes aprobados; generación estática sin duplicar DOM | Medio/alto; aproximadamente 5–8 días | Mejor descubrimiento y comprensión de colección, snippets y experiencia compartida | HTML sin JS contiene H1, 22 tarjetas y enlaces reales; filtros y selector siguen funcionando; schema representa contenido visible; preview social correcta; sin regresiones visuales o del editor |
| **3 — Crecimiento orgánico** | F06, F15, F24–25: piloto de 6 fichas por idioma si hay valor, 2–3 categorías, una landing RSVP cuando esté disponible, oferta de precios confirmada y recursos selectivos | Investigación SERP/país, disponibilidad, contenidos propios y datos de producto; GSC antes de cambiar indexación de demos; soporte bilingüe confirmado | Alto; aproximadamente 2–4 semanas para piloto editorial y técnico | Mayor cobertura de intención comercial y mejores recorridos de conversión; no se cuantifica tráfico | Cada página tiene propósito y contenido propio, canonical, alternate, breadcrumb, enlaces y sitemap; no canibaliza home; demo preservada; eventos consentidos sin PII; leads confirmados, no clics contados como ventas |
| **4 — SEO avanzado** | F16–20, F22, F26: medición RUM/CrUX/PSI, assets/font/cache, localización avanzada, referencias editoriales y experimentos GEO | Baseline real, suficiente muestra para campo; política de consentimiento; propuesta/operación por mercado; fingerprinting antes de cache larga | Medio/alto continuo; primeras pruebas 1–2 semanas, luego ciclos según evidencia | Mejor experiencia y coste de carga, expansión sostenible y claridad para búsqueda/IA | Comparación antes/después con condiciones equivalentes, CWV por dispositivo si hay muestra; apertura y texturas conservadas; no caché pública de datos privados; resultados GEO observados sin promesas |

Los plazos son estimaciones de trabajo, no tiempo para posicionarse. Responsables sugeridos: desarrollo para build/rutas/headers; marca/contenido para oferta y fichas; SEO para mapa de intención, GSC y validación; producto para privacidad, disponibilidad y soporte. No se requiere una migración de framework para completar estas fases.

### 13.1 Validación transversal y puertas de lanzamiento

- Versionar política de rutas: indexables comerciales, operativas, demos, previews y futuras invitaciones. Un test útil debe verificar la política en la salida del build, no solo que exista un tag en una plantilla.
- Rastrear origen y producción con y sin JS. Revisar estados, redirects, canonicals, metas, `X-Robots-Tag`, enlaces, assets, sitemap y reciprocidad de idiomas. Inspección de URL en GSC confirma qué ve Google y qué canonical elige.
- Probar el ciclo del editor y las 22 demos tras cambiar scripts compartidos: diseño, idioma, personalización, apertura, fotos, colores, vista previa y retorno. Usar datos de prueba; no tocar invitaciones de clientes. Las pruebas de navegador existentes documentadas en `tests/browser/README.md` ofrecen puntos de partida, pero no se ejecutaron todas en esta auditoría.
- Antes de habilitar publicación real, probar invitación autorizada, token inválido, revocado y expirado; modo público/familia; datos que recibe un visitante anónimo; ausencia de URLs privadas en sitemap/metadatos/analítica y caché. Nunca reemplazar autorización con noindex.
- Registrar baseline de GSC y conversiones disponibles antes de migrar/desindexar. Revisar cobertura, sitemap y errores después del despliegue; prever rollback de redirects/metadatos si se detectan regresiones.

### 13.2 Ejemplos de implementación futura

**A. Canonical y alternates de home ES**, en `index.html` y pareja equivalente en `en/index.html`:

```html
<link rel="canonical" href="https://www.invitesse.com/">
<link rel="alternate" hreflang="es" href="https://www.invitesse.com/">
<link rel="alternate" hreflang="en" href="https://www.invitesse.com/en/">
<link rel="alternate" hreflang="x-default" href="https://www.invitesse.com/">
```

En inglés el canonical debe ser `https://www.invitesse.com/en/`; el conjunto alternate puede ser el mismo. Para catálogo, sustituir rutas por `/disenos/` y `/en/disenos/`. No copiar x-default home en todas las páginas sin decidir su fallback.

**B. robots.txt mínimo**, después de aprobar política de bots:

```text
User-agent: *
Allow: /
Sitemap: https://www.invitesse.com/sitemap.xml
```

No hace falta añadir `Disallow: /editor/` para conseguir noindex: impedir crawling puede impedir procesar la directiva. Autorización y noindex se aplican por separado. No incluir secretos/slugs privados en robots. Una política por proveedores de IA requiere decidir búsqueda frente a entrenamiento, no copiar una lista sin evaluar.

**C. Ejemplo de entrada de sitemap bilingüe**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.invitesse.com/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://www.invitesse.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://www.invitesse.com/en/" />
  </url>
  <url>
    <loc>https://www.invitesse.com/en/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://www.invitesse.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://www.invitesse.com/en/" />
  </url>
</urlset>
```

Extender solo con las rutas aprobadas de catálogo, cotización, legales si se decide incluirlas, y futuras fichas/categorías publicadas. `lastmod` solo cuando represente una modificación real del contenido; omitirlo es mejor que actualizarlo artificialmente cada build.

**D. Build: copiar explícitamente archivos SEO**, en `scripts/build.mjs` después de generar/copiar páginas:

```js
// Propuesta: primero generar/validar sitemap desde el registro comercial.
await cp('robots.txt', 'dist/robots.txt');
await cp('sitemap.xml', 'dist/sitemap.xml');
```

Este fragmento asume archivos ya creados y validados. No basta con incluirlos en Git. Mejor generar sitemap y páginas desde el mismo registro para evitar diferencias de cobertura.

**E. Identidad mínima verificable**, en home, si se confirma el uso de Organization como representación de marca:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.invitesse.com/#organization",
      "name": "Invitesse",
      "url": "https://www.invitesse.com/",
      "email": "hola@invitesse.com",
      "sameAs": ["https://www.instagram.com/invitesse/"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.invitesse.com/#website",
      "url": "https://www.invitesse.com/",
      "name": "Invitesse",
      "inLanguage": ["es", "en"],
      "publisher": {"@id": "https://www.invitesse.com/#organization"}
    }
  ]
}
</script>
```

El correo y perfil están enlazados en el footer actual. Confirmar titularidad del perfil; no se verificó la cuenta externa. Este ejemplo no declara una sociedad mercantil, dirección adicional, precio, reviews o `aggregateRating`. La representación legal debe mantenerse fiel a los textos publicados.

**F. Política noindex de demos, solo si se aprueba la separación comercial**:

```html
<meta name="robots" content="noindex,follow">
```

Servirla en el HTML inicial de demos/previews, y/o usar `X-Robots-Tag: noindex` desde la respuesta. No inyectarla exclusivamente después de cargar datos privados. Si se elige excluir solo previews por querystring, implementarlo en la capa de respuesta con pruebas de parámetros; un header por pathname excluye también las demos ordinarias. No combinar `noindex` con bloqueo robots esperando una retirada inmediata de Google. El enlace a la ficha debe existir, pero el descubrimiento de fichas debe venir del catálogo y la navegación comercial, no depender de páginas noindex.

## 14. Inventario completo de HTML y metadata

Leyenda: **C** = canonical servido en la ruta final; **NI** = meta noindex. «Potencial» = sin NI observado, no indexación demostrada. H1 es conteo de etiquetas del **HTML fuente local**, no del DOM posterior; los H1 vacíos se señalan. La metadata SEO principal observada en producción coincide con esta clasificación, salvo que el alias de cuenta termina en otra página. Los titles de demos contienen entidades HTML decodificadas aquí.

| Ruta solicitada | HTTP / destino | Política observada | C | H1 inicial | Title actual |
|---|---|---|---|---|---|
| `/404.html` | 200 | NI | No | 1 | Página no encontrada — Invitesse |
| `/comprar/` | 200 | NI | No | 0 | Comprar su invitación — Invitesse |
| `/condiciones/` | 200 | Potencial | Sí | 1 | Condiciones del servicio — Invitesse |
| `/cotizar/` | 200 | Potencial | Sí | 1 | Cotizar una invitación a medida — Invitesse |
| `/cuenta/` | 200 | NI | No | 0 | Mi cuenta — Invitesse |
| `/demo/arco/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Arco — Invitesse |
| `/demo/aurelia/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Aurelia — Invitesse |
| `/demo/celeste/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Celeste — Invitesse |
| `/demo/cisne/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Cisne — Invitesse |
| `/demo/clasico/` | 200 | Potencial | No | 2 | Valentina & Martín · Demo diseño clásico — Invitesse |
| `/demo/corazones/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Corazones — Invitesse |
| `/demo/costa/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Costa — Invitesse |
| `/demo/encaje/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Encaje — Invitesse |
| `/demo/estreno/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Estreno — Invitesse |
| `/demo/fiesta/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Fiesta — Invitesse |
| `/demo/gala/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Gala — Invitesse |
| `/demo/glicina/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Glicina — Invitesse |
| `/demo/jardin/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Jardín — Invitesse |
| `/demo/lino/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Lino — Invitesse |
| `/demo/marfil/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Marfil — Invitesse |
| `/demo/moderno/` | 200 | Potencial | No | 1 | Sofía & Tomás · Demo diseño moderno — Invitesse |
| `/demo/nacar/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Nácar — Invitesse |
| `/demo/noir/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Noir — Invitesse |
| `/demo/onix/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Ónix — Invitesse |
| `/demo/rosa/` | 200 | Potencial | No | 1 | Melissa & Andrés · Demo diseño romántico — Invitesse |
| `/demo/senal/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Señal — Invitesse |
| `/demo/tinta/` | 200 | Potencial | No | 0 | Ana & León · Demo diseño Tinta — Invitesse |
| `/disenos/` | 200 | Potencial | No | 1 (vacío) | Los diseños — Invitesse |
| `/editor/` | 200 | NI | No | 0 | Editor de su invitación — Invitesse |
| `/editor/pago/` | 200 | NI | No | 0 | Pago de complementos — Invitesse |
| `/en/account/` | 200 | NI | No | 0 | My account — Invitesse |
| `/en/comprar/` | 200 | NI | No | 0 | Buy your invitation — Invitesse |
| `/en/cuenta/` | 308 → /en/account/ → 200 | NI | No en destino | 0 | Redirecting — Invitesse |
| `/en/demo/arco/` | 200 | Potencial | No | 0 | Anna & Leo · Arco design demo — Invitesse |
| `/en/demo/aurelia/` | 200 | Potencial | No | 0 | Anna & Leo · Aurelia design demo — Invitesse |
| `/en/demo/celeste/` | 200 | Potencial | No | 0 | Anna & Leo · Celeste design demo — Invitesse |
| `/en/demo/cisne/` | 200 | Potencial | No | 0 | Anna & Leo · Cisne design demo — Invitesse |
| `/en/demo/clasico/` | 200 | Potencial | No | 2 | Valentina & Martín · Classic design demo — Invitesse |
| `/en/demo/corazones/` | 200 | Potencial | No | 0 | Anna & Leo · Corazones design demo — Invitesse |
| `/en/demo/costa/` | 200 | Potencial | No | 0 | Anna & Leo · Coast design demo — Invitesse |
| `/en/demo/encaje/` | 200 | Potencial | No | 0 | Anna & Leo · Encaje design demo — Invitesse |
| `/en/demo/estreno/` | 200 | Potencial | No | 0 | Anna & Leo · Estreno design demo — Invitesse |
| `/en/demo/fiesta/` | 200 | Potencial | No | 0 | Anna & Leo · Fiesta design demo — Invitesse |
| `/en/demo/gala/` | 200 | Potencial | No | 0 | Anna & Leo · Gala design demo — Invitesse |
| `/en/demo/glicina/` | 200 | Potencial | No | 0 | Anna & Leo · Glicina design demo — Invitesse |
| `/en/demo/jardin/` | 200 | Potencial | No | 0 | Anna & Leo · Garden design demo — Invitesse |
| `/en/demo/lino/` | 200 | Potencial | No | 0 | Anna & Leo · Lino design demo — Invitesse |
| `/en/demo/marfil/` | 200 | Potencial | No | 0 | Anna & Leo · Marfil design demo — Invitesse |
| `/en/demo/moderno/` | 200 | Potencial | No | 1 | Sofía & Tomás · Modern design demo — Invitesse |
| `/en/demo/nacar/` | 200 | Potencial | No | 0 | Anna & Leo · Nácar design demo — Invitesse |
| `/en/demo/noir/` | 200 | Potencial | No | 0 | Anna & Leo · Noir design demo — Invitesse |
| `/en/demo/onix/` | 200 | Potencial | No | 0 | Anna & Leo · Ónix design demo — Invitesse |
| `/en/demo/rosa/` | 200 | Potencial | No | 1 | Melissa & Andrés · Romantic design demo — Invitesse |
| `/en/demo/senal/` | 200 | Potencial | No | 0 | Anna & Leo · Señal design demo — Invitesse |
| `/en/demo/tinta/` | 200 | Potencial | No | 0 | Anna & Leo · Tinta design demo — Invitesse |
| `/en/disenos/` | 200 | Potencial | No | 1 (vacío) | The designs — Invitesse |
| `/en/editor/` | 200 | NI | No | 0 | Invitation editor — Invitesse |
| `/en/editor/pago/` | 200 | NI | No | 0 | Add-on checkout — Invitesse |
| `/en/` | 200 | Potencial | No | 1 | Invitesse — digital wedding invitations |
| `/en/privacy/` | 200 | Potencial | Sí | 1 | Privacy policy — Invitesse |
| `/en/quote/` | 200 | Potencial | Sí | 1 | Request a custom invitation quote — Invitesse |
| `/en/terms/` | 200 | Potencial | Sí | 1 | Terms of service — Invitesse |
| `/` | 200 | Potencial | No | 1 | Invitesse — invitaciones digitales de boda |
| `/privacidad/` | 200 | Potencial | Sí | 1 | Política de privacidad — Invitesse |

### 14.1 Demos: intención y contenido específico a trasladar a posibles fichas

Los 22 identificadores existen en ambos idiomas. Las descripciones actuales son únicas y explican la experiencia de cada demo; ninguna incorpora una oferta comercial verificable completa. Esta tabla evalúa el elemento diferencial que puede justificar contenido propio, sin implicar que todas deban indexarse.

| Diseño | Diferencial verificable en catálogo / plantilla | Uso comercial recomendado |
|---|---|---|
| Arco | Cristal empañado y apertura que descubre a la pareja | Ficha sobre apertura interactiva y estética botánica; probar teclado y coste de la textura |
| Aurelia | Carpeta editorial, monograma y faja dorada | Ficha si se explican personalización y dirección visual sin repetir otras elegantes |
| Celeste | Luna, estrellas y apertura de corazón | Selección temática específica; no crear categoría «celestial» sin demanda/surtido |
| Cisne | Burdeos/oliva, sobre, flores y papelería troquelada | Detalles visuales propios y paletas verificadas |
| Clásico | Sobre, carta por familia y contenido tradicional | Referencia para invitación clásica; revisar H1 duplicados |
| Corazones | Baraja y cartas con foto | Ficha para una experiencia lúdica realmente diferenciada |
| Costa | Pase de abordar, mar y detalles de destino | Buena candidata a intención boda destino; no generar páginas por cada playa |
| Encaje | Estor/borla, encaje y óvalo | Piloto de ficha romántica; capacidades con/sin fotos según producto |
| Estreno | Funda de terciopelo y lenguaje de estreno/cine | Ficha temática si hay demanda, sin prometer integración de video no verificada |
| Fiesta | Papel picado y lotería | Explicar inspiración mexicana con naturalidad, sin hacer geolanding genérica |
| Gala | Medallón y art déco | Ficha orientada a estilo art déco y ceremonia formal |
| Glicina | Cortina de flores y jardín | Contenido botánico propio; coste de assets y jerarquía de headings a revisar |
| Jardín | Sobre de semillas y flores | Ficha piloto botánica; no afirmar sostenibilidad certificada por ser digital |
| Lino | Tarjetas, textura natural y flores prensadas | Selección natural/editorial con detalle específico |
| Marfil | Papel vegetal y lazo de seda | Piloto elegante; carga de animación y formato a evaluar |
| Moderno | Puertas, capítulos y blanco/negro | Ejemplo moderno con variantes realmente compatibles |
| Nácar | Estuche con perlas | Piloto premium por apertura claramente distintiva |
| Noir | Puerta doble, monograma y faja | Diferenciar de Ónix en apertura y estilo para evitar texto repetido |
| Ónix | Sobre negro con interior de foto y lacre | Piloto blanco/negro; contenido y capturas específicos |
| Rosa / Romántico | Sobre de damasco y lacre | Conservar ID `rosa` para compatibilidad; nombre comercial Romántico coherente en ficha |
| Señal | Tele antigua, cambio de canales y transmisión | Ficha retro muy diferenciada; revisar CPU y alternativas de apertura |
| Tinta | Papel crema, tinta roja y estética editorial | Explicar estilo y personalización; sin inventar uso para eventos no ofrecidos |

## 15. Fuentes y reproducción

### 15.1 Evidencia del proyecto

- `package.json`, `vercel.json`, `scripts/build.mjs`: framework, salida y allowlist de publicación.
- `index.html`, `en/index.html`, `disenos/index.html`, `en/disenos/index.html`: contenido y metadata comercial.
- `disenos/catalogo.js`, `disenos/galeria.js`: 22 diseños, capacidades/etiquetas, filtros, construcción del H1 y enlaces.
- `demo/nacar/index.html:23`, `demo/nacar/layout.js:83` y equivalentes: shell y construcción de contenido; Jardín/Costa construyen contenido mediante JS inline.
- `demo/shared/content.js:24`, `demo/shared/panel.js:430`: previews locales y música diferida.
- `assets/brand/account-nav.js`, `privacy.js`: carga condicional del SDK y consentimiento de analítica.
- `lib/supabase/services.mjs`, `supabase/migrations/202610180003_platform_functions.sql`, `api/invitation-asset.js`: publicación/acceso/activos, solo revisados, sin escribir datos.
- `tests/browser/README.md`: alcance y simulación de las pruebas existentes; no equivale a validación de RLS real ni ejecución completa en esta auditoría.

### 15.2 Comprobaciones HTTP representativas

```bash
curl -I https://www.invitesse.com/
curl -I https://www.invitesse.com/robots.txt
curl -I https://www.invitesse.com/sitemap.xml
curl -I https://www.invitesse.com/seo-audit-missing-20261019/
curl -I https://www.invitesse.com/index.html
curl -I https://www.invitesse.com/disenos/index.html
curl -I https://www.invitesse.com/en/cuenta/
curl -IL http://invitesse.com/
curl -sS 'https://www.invitesse.com/disenos/?estilo=elegante'
```

El inventario se obtuvo del árbol HTML y se comparó con GETs remotos; los ejemplos HEAD sirven para reproducir estados y redirects, pero el contenido y las metas se verifican con GET. Revisar en una nueva sesión la fecha y el despliegue porque las respuestas pueden cambiar. Herramientas auxiliares y capturas de esta auditoría se generaron en `/tmp`; los resultados necesarios para la decisión están descritos en este documento.

### 15.3 Referencias técnicas para implementación

- [Google: fundamentos de JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- [Google: versiones localizadas y requisitos hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions).
- [Google: consolidación de URLs duplicadas](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
- [Google: bloqueo de indexación con noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
- [Google: datos estructurados FAQ](https://developers.google.com/search/docs/appearance/structured-data/faqpage).
- [Core Web Vitals](https://web.dev/articles/vitals).

Estas referencias se incluyen como documentación de apoyo, no como páginas consultadas en la investigación competitiva ni como métricas de Invitesse. Confirmar requisitos vigentes al implementar.

**Decisión pendiente del propietario:** aprobar un lote concreto del roadmap después de revisar este diagnóstico. Hasta entonces, conservar la aplicación sin cambios. La recomendación inicial es fase 1 y catálogo estático de fase 2; la apertura de fichas, la retirada de demos de indexación y cualquier publicación de invitaciones deben tratarse como decisiones explícitas con sus validaciones correspondientes.
