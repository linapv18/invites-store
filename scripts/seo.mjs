import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import vm from 'node:vm';
import { origin, styles, pages, demoIndexing } from './seo-policy.mjs';

export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const base = lang => lang === 'en' ? '/en' : '';
const index = lang => lang === 'en' ? 1 : 0;
export async function loadCatalog(source = '.') {
  const context = { window: {} };
  vm.runInNewContext(await readFile(join(source, 'disenos/catalogo.js'), 'utf8'), context, { timeout: 1000 });
  return context.window.LazoCatalog;
}
async function files(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await files(path)); else found.push(path);
  }
  return found;
}
const text = (lang, es, en) => lang === 'es' ? es : en;
const link = (url, label) => `<a href="${escape(url)}">${escape(label)}</a>`;
const section = (title, body) => `<section><h2>${escape(title)}</h2><p>${escape(body)}</p></section>`;

function navigation(lang) {
  const b = base(lang);
  return [
    [b + '/disenos/', text(lang, 'Diseños', 'Designs')],
    [lang === 'es' ? '/invitaciones-con-rsvp/' : '/en/wedding-rsvp/', 'RSVP'],
    [lang === 'es' ? '/cotizar/' : '/en/quote/', text(lang, 'A la medida', 'Custom design')],
    [lang === 'es' ? '/sobre-invitesse/' : '/en/about/', 'Invitesse'],
    [lang === 'es' ? '/recursos/que-incluir-invitacion-digital-boda/' : '/en/resources/what-to-include-digital-wedding-invitation/', text(lang, 'Guía', 'Guide')]
  ];
}

function shell({ lang, path, alternate, title, description, body }) {
  const b = base(lang);
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)} — Invitesse</title><meta name="description" content="${escape(description)}">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/brand/fonts.css"><link rel="stylesheet" href="/assets/brand/brand.css"><link rel="stylesheet" href="/assets/brand/legal.css"><link rel="stylesheet" href="/assets/brand/seo.css"><link rel="stylesheet" href="/assets/brand/cards.css"><link rel="stylesheet" href="/assets/brand/privacy.css">
<script defer src="/assets/brand/privacy.js?v=seo-1"></script></head>
<body class="iv-editorial" data-marketing-page="true"><a class="skip" href="#main">${text(lang, 'Saltar al contenido', 'Skip to content')}</a>
<header><div class="wrap legal-nav"><a class="logo iv-wm" href="${b}/" aria-label="Invitesse">invite<b>ss</b>e</a><nav aria-label="${text(lang, 'Principal', 'Main')}">${link(b + '/disenos/', text(lang, 'Diseños', 'Designs'))}${link(alternate, lang === 'es' ? 'EN' : 'ES')}</nav></div></header>
<main id="main" tabindex="-1" class="wrap">
<p class="eyebrow">Invitesse · ${text(lang, 'Invitaciones digitales de boda', 'Digital wedding invitations')}</p><h1>${escape(title)}</h1>${body}</main>
<footer class="wrap"><nav aria-label="${text(lang, 'Pie de página', 'Footer')}">${navigation(lang).map(([u, t]) => link(u, t)).join('')}${link(lang === 'es' ? '/privacidad/' : '/en/privacy/', text(lang, 'Privacidad', 'Privacy'))}${link(lang === 'es' ? '/condiciones/' : '/en/terms/', text(lang, 'Condiciones', 'Terms'))}</nav><p>${link('mailto:hola@invitesse.com', 'hola@invitesse.com')}</p></footer></body></html>`;
}

export async function generateSeo(output, source = '.') {
  const catalog = await loadCatalog(source);
  const registry = new Map();
  const addPair = paths => paths.forEach((path, i) => registry.set(path, { lang: i ? 'en' : 'es', paths }));
  [['/', '/en/'], ['/disenos/', '/en/disenos/'], ['/cotizar/', '/en/quote/'], ['/quiz/', '/en/quiz/'], ['/privacidad/', '/en/privacy/'], ['/condiciones/', '/en/terms/']].forEach(addPair);
  const save = async (path, contents) => {
    const dest = join(output, path.slice(1), 'index.html');
    await mkdir(dirname(dest), { recursive: true }); await writeFile(dest, contents);
  };
  const related = (designs, lang, level = 3) => `<div class="seo-grid">${designs.map(d => catalog.card(d, lang, level)).join('')}</div>`;
  const availability = lang => section(text(lang, 'Antes de empezar', 'Before you start'), text(lang,
    'Pago único por gama (Colombia / otros países): Esencial COP $129.000 / USD $49; Signature COP $199.000 / USD $79; Luxury COP $279.000 / USD $109. Elijan la fecha del evento antes de pagar; la publicación vence tres meses calendario después. La compra desbloquea el editor. Publicar después no tiene otro cobro. Soporte: hola@invitesse.com.',
    'One-time payment by range (Colombia / other countries): Esencial COP $129,000 / USD $49; Signature COP $199,000 / USD $79; Luxury COP $279,000 / USD $109. Choose the event date before paying; publication expires three calendar months afterward. Purchase unlocks the editor. Publishing afterward has no additional charge. Support: hola@invitesse.com.'));

  for (const design of catalog.designs) {
    const paths = ['/disenos/' + design.id + '/', '/en/disenos/' + design.id + '/']; addPair(paths);
    for (const lang of ['es', 'en']) {
      const i = index(lang), d = design[lang], b = base(lang);
      const ownStyles = styles.filter(s => design.tags.estilo.includes(s.id));
      const similar = catalog.designs.filter(other => other.id !== design.id && other.tags.estilo.some(s => design.tags.estilo.includes(s))).slice(0, 3);
      const noPhotos = ['glicina', 'encaje', 'jardin', 'celeste', 'corazones'].includes(design.id);
      const title = text(lang, `${d.name}: invitación digital de boda`, `${d.name}: digital wedding invitation`);
      const description = text(lang, `Descubran ${d.name}, sus detalles, paletas y apertura. Prueben la demo y comparen este diseño de invitación digital de boda.`, `Explore ${d.name}, its details, palettes and opening. Try the demo and compare this digital wedding invitation design.`);
      const body = `<div class="seo-hero"><div><p class="seo-lead">${escape(d.desc)}</p><p>${escape(d.opening)}</p><p>${escape(text(lang, 'Colores: ', 'Colours: ') + d.colors)}</p>
      <a class="seo-button" href="${b}/demo/${design.id}/">${escape(text(lang, `Abrir demo de ${d.name}`, `Open the ${d.name} demo`))}</a>
      <p><a class="seo-button" href="${b}/comprar/?diseno=${design.id}">${text(lang, 'Comprar este diseño', 'Buy this design')}</a></p>
      <p class="seo-note">${escape(text(lang, 'La demo muestra una boda ficticia; sus respuestas no se envían.', 'The demo shows a fictional wedding; replies are not sent.'))}</p></div>
      <img src="${escape(design.img[0])}" width="554" height="1200" fetchpriority="high" alt="${escape(d.alt[0])}"></div>
      ${section(text(lang, 'El diseño, abierto', 'Inside the design'), text(lang, 'Comparen la apertura con la portada interior y revisen cómo se presentan los nombres y la información. Abran la demo en su teléfono para recorrer el programa, la historia y la confirmación de asistencia.', 'Compare the opening with the cover inside and see how names and details are presented. Open the demo on your phone to explore the schedule, story and RSVP.'))}
      <figure class="seo-preview"><img src="${escape(design.img[1])}" width="554" height="1200" loading="lazy" decoding="async" alt="${escape(d.alt[1])}"><figcaption>${escape(d.name)}</figcaption></figure>
      ${section(text(lang, 'Cómo hacerlo suyo', 'Make it yours'), text(lang, 'En el editor pueden preparar textos, nombres, fotos y detalles del evento con una vista previa. Las opciones de color dependen del diseño: las paletas indicadas aquí corresponden a la colección. Revisen cada cambio en móvil antes de compartir una invitación real después de publicarla.', 'In the editor you can prepare text, names, photos and event details with a live preview. Colour options depend on the design: the palettes listed here describe the collection. Review changes on mobile before sharing a real invitation after publishing it.'))}
      ${noPhotos ? section(text(lang, 'También sin fotos', 'Also without photos'), text(lang, 'Este diseño admite una versión sin fotos. Es una opción para dar protagonismo a nombres, tipografía y elementos gráficos. Pueden comparar ambas posibilidades en la experiencia de personalización.', 'This design supports a photo-free version, giving names, typography and graphic details more room. Compare both options in the customization experience.')) : ''}
      <section><h2>${text(lang, 'Explorar el estilo', 'Explore the style')}</h2><p>${ownStyles.map(s => link(s.paths[i], s.names[i])).join(' · ') || link(b + '/disenos/', text(lang, 'Toda la colección', 'The full collection'))}</p></section>
      ${availability(lang)}<section><h2>${text(lang, 'Otros diseños para comparar', 'More designs to compare')}</h2>${related(similar, lang)}</section>`;
      await save(paths[i], shell({ lang, path: paths[i], alternate: paths[1 - i], title, description, body }));
    }
  }
  for (const style of styles) {
    addPair(style.paths);
    for (const lang of ['es', 'en']) {
      const i = index(lang), selected = catalog.designs.filter(d => d.tags.estilo.includes(style.id));
      const body = `<p class="seo-lead">${escape(style.intros[i])}</p>${related(selected, lang, 2)}${section(text(lang, 'Cómo elegir entre estos diseños', 'How to choose between these designs'), text(lang, 'Empiecen por la apertura y después comparen la portada interior. Miren cómo se integran las fotos, las paletas y la información práctica. Las fichas explican cada propuesta y las demos permiten recorrerla antes de preparar sus propios detalles.', 'Start with the opening, then compare the cover inside. Look at how photos, palettes and practical information work together. Each design page explains the approach and each demo lets you explore it before preparing your own details.'))}${availability(lang)}`;
      await save(style.paths[i], shell({ lang, path: style.paths[i], alternate: style.paths[1 - i], title: style.titles[i], description: style.intros[i].split('. ')[0] + '.', body }));
    }
  }
  for (const page of pages) {
    addPair(page.paths);
    for (const lang of ['es', 'en']) {
      const i = index(lang);
      const body = `<article>${page.sections[i].map(([h, p]) => section(h, p)).join('')}</article><p>${link(base(lang) + '/disenos/', text(lang, 'Explorar la colección', 'Explore the collection'))}${page.demo ? ' · ' + link(base(lang) + '/demo/' + page.demo + '/', text(lang, 'Probar una demo', 'Try a demo')) : ''}</p>`;
      await save(page.paths[i], shell({ lang, path: page.paths[i], alternate: page.paths[1 - i], title: page.titles[i], description: page.descriptions[i], body }));
    }
  }

  // Prerender the catalogue. The browser progressively enhances these existing cards.
  for (const lang of ['es', 'en']) {
    const b = base(lang), file = join(output, b.slice(1), 'disenos/index.html');
    let html = await readFile(file, 'utf8');
    const featured = ['nacar', 'onix', 'arco', 'encaje', 'marfil', 'jardin'];
    const ordered = [...catalog.designs].sort((a, b) => (featured.includes(a.id) ? featured.indexOf(a.id) : 99) - (featured.includes(b.id) ? featured.indexOf(b.id) : 99));
    html = html.replace('<h1 id="title"></h1>', `<h1 id="title">${text(lang, 'Encuentren el diseño <i>de su boda.</i>', 'Find the design <i>for your wedding.</i>')}</h1>`)
      .replace('<p class="k" id="kicker"></p>', `<p class="k" id="kicker">${text(lang, 'Los diseños', 'The designs')}</p>`)
      .replace('<input type="search" id="q">', `<input type="search" id="q" aria-label="${text(lang, 'Buscar diseño', 'Search designs')}">`)
      .replace('<div class="incl" id="incl"></div>', `<div class="incl" id="incl"><p>${text(lang, 'Invitaciones digitales de boda con aperturas propias. Comparen estilos y visiten cada ficha para conocer sus detalles.', 'Digital wedding invitations with distinctive openings. Compare styles and visit each design page to explore the details.')}</p></div>`)
      .replace('<div class="grid" id="grid"></div>', `<div class="grid" id="grid">${ordered.map((d, i) => { const card = catalog.card(d, lang, 2); return i === 0 ? card.replace('loading="lazy"', 'loading="eager" fetchpriority="high"') : card; }).join('')}</div>`)
      .replace('<footer class="w foot" id="foot"></footer>', `<footer class="w foot" id="foot"><nav aria-label="${text(lang, 'Pie de página', 'Footer')}">${navigation(lang).map(([u, t]) => link(u, t)).join('')}</nav></footer>`);
    html = html.replace('</head>', '<noscript><style>.search,.opening-filters,.style-tabs,.filters,.bar{display:none!important}.layout{grid-template-columns:1fr!important}</style></noscript>\n</head>');
    await writeFile(file, html);
  }

  const commercialNavigation = lang => `<nav class="seo-discovery" aria-label="${text(lang, 'Más sobre las invitaciones', 'More about the invitations')}">${[...navigation(lang), ...styles.map(s => [s.paths[index(lang)], s.names[index(lang)]])].map(([u, t]) => link(u, t)).join('')}</nav>`;
  for (const file of (await files(output)).filter(f => f.endsWith('.html'))) {
    let html = await readFile(file, 'utf8');
    const route = '/' + file.slice(output.length + 1).replace(/index\.html$/, '');
    const lang = route.startsWith('/en/') ? 'en' : 'es';
    const info = registry.get(route);
    const isDemo = /^\/(en\/)?demo\/[^/]+\/$/.test(route);
    const isPrivate = /^\/(en\/)?(editor|comprar|cuenta|account)(\/|$)/.test(route);
    if (isPrivate) continue; // Preserve auth and OAuth metadata and behavior.
    if (!info && !isDemo) continue;
    html = html.replace(/<link\b[^>]*\brel=["'](?:canonical|alternate)["'][^>]*>\s*/g, '')
      .replace(/<meta\b[^>]*(?:property=["']og:[^"']+["']|name=["']twitter:[^"']+["'])[^>]*>\s*/g, '');
    const canonical = origin + route;
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Invitesse';
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
    const paths = info?.paths || [route.replace(/^\/en\//, '/'), route.startsWith('/en/') ? route : '/en' + route];
    const image = '/assets/brand/social/' + lang + '.jpg';
    let metadata = `<link rel="canonical" href="${canonical}">\n` + paths.map((path, i) => `<link rel="alternate" hreflang="${i ? 'en' : 'es'}" href="${origin}${path}">`).join('\n');
    if (route === '/' || route === '/en/') metadata += `\n<link rel="alternate" hreflang="x-default" href="${origin}/">`;
    if (isDemo && demoIndexing === 'noindex') metadata += '\n<meta name="robots" content="noindex,follow">';
    if (info) {
      if (html.includes('class="lz-price"')) html = html.replace('</head>', '<script defer src="/assets/brand/local-prices.js"></script>\n</head>');
      if (!html.includes('href="/assets/brand/seo.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/assets/brand/seo.css">\n</head>');
      metadata += `\n<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="Invitesse"><meta property="og:locale" content="${lang === 'es' ? 'es_CO' : 'en_US'}"><meta property="og:locale:alternate" content="${lang === 'es' ? 'en_US' : 'es_CO'}"><meta property="og:image" content="${origin}${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${text(lang, 'Invitesse: diseños de invitaciones digitales de boda', 'Invitesse: digital wedding invitation designs')}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin}${image}">`;
      const graph = [{ '@type': 'WebPage', '@id': canonical + '#page', url: canonical, name: title, inLanguage: lang, isPartOf: { '@id': origin + '/#website' } }];
      if (route === '/' || route === '/en/') graph.push({ '@type': 'Organization', '@id': origin + '/#organization', name: 'Invitesse', url: origin + '/', email: 'hola@invitesse.com', contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'hola@invitesse.com', availableLanguage: ['Spanish', 'English'] } }, { '@type': 'WebSite', '@id': origin + '/#website', name: 'Invitesse', url: origin + '/', inLanguage: ['es', 'en'], publisher: { '@id': origin + '/#organization' } });
      else {
        graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: text(lang, 'Inicio', 'Home'), item: origin + base(lang) + '/' }, { '@type': 'ListItem', position: 2, name: title, item: canonical }] });
        html = html.replace(/(<main\b[^>]*>)/, `$1<nav class="breadcrumbs" aria-label="${text(lang, 'Ruta de navegación', 'Breadcrumb')}">${link(base(lang) + '/', text(lang, 'Inicio', 'Home'))} / <span aria-current="page">${title}</span></nav>`);
      }
      metadata += `\n<script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
      if (!html.includes('class="iv-editorial"')) html = html.replace('</main>', commercialNavigation(lang) + '</main>');
      if (!html.includes('data-marketing-page=')) html = html.replace(/<body\b/, '<body data-marketing-page="true"');
    }
    await writeFile(file, html.replace('</head>', metadata + '\n</head>'));
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[...registry].map(([path, info]) => `  <url><loc>${origin}${escape(path)}</loc>${info.paths.map((p, i) => `<xhtml:link rel="alternate" hreflang="${i ? 'en' : 'es'}" href="${origin}${escape(p)}"/>`).join('')}</url>`).join('\n')}\n</urlset>\n`;
  await writeFile(join(output, 'sitemap.xml'), sitemap);
  await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  await writeFile(join(output, 'llms.txt'), `# Invitesse\n\n> Digital wedding invitation designs with interactive openings. The storefront is in Spanish and English. A one-time purchase unlocks editing and publication through three calendar months after the event. One-time prices (Colombia / other countries): Esencial COP 129000 / USD 49; Signature COP 199000 / USD 79; Luxury COP 279000 / USD 109. Demos use fictional data.\n\n## Public product information\n${[...registry.keys()].filter(p => !/privacy|privacidad|terms|condiciones/.test(p)).map(p => `- [${p}](${origin}${p})`).join('\n')}\n\nOnly these public marketing pages describe the product. Customer invitations, editor previews and account data are not product documentation.\n`);
  return [...registry.keys()];
}
