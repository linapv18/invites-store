import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, rm, access, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { generateSeo, loadCatalog } from '../scripts/seo.mjs';
import { bundleMarketingStyles, bundlePageScripts, fingerprintAssets } from '../scripts/asset-cache.mjs';
import { origin } from '../scripts/seo-policy.mjs';
import routing from '@vercel/routing-utils';

test('public SEO build contains real content, reciprocal locales and no private URLs', async () => {
  const output = await mkdtemp(join(tmpdir(), 'invitesse-seo-'));
  try {
    for (const path of ['assets', 'comprar', 'cotizar', 'cuenta', 'demo', 'disenos', 'editor', 'en', 'privacidad', 'condiciones', 'quiz', 'index.html', '404.html']) await cp(path, join(output, path), { recursive: true });
    const routes = await generateSeo(output);
    assert.equal(new Set(routes).size, 68); // 12 existing + 44 designs + 6 styles + 6 editorial.
    const catalog = await loadCatalog();
    const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
    assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length);
    for (const route of routes) assert.doesNotMatch(route, /\/demo\/|\/editor\/|\/cuenta\/|\/account\/|\/comprar\/|\?|404|localhost/);
    const graph = new Map();
    for (const route of routes) {
      const html = await readFile(join(output, route.slice(1), 'index.html'), 'utf8');
      assert.match(html, new RegExp(`<link rel="canonical" href="${origin}${route}">`));
      assert.doesNotMatch(html, /name="robots" content="noindex/);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
      assert.doesNotMatch(html, /<h1[^>]*>\s*<\/h1>/);
      let previousLevel = 0;
      for (const heading of html.matchAll(/<h([1-6])\b/g)) {
        const level = Number(heading[1]);
        assert.ok(level <= previousLevel + 1, `${route}: skipped heading level ${previousLevel} → ${level}`);
        previousLevel = level;
      }
      assert.match(html, /name="twitter:card"/);
      const alternates = [...html.matchAll(/<link rel="alternate" hreflang="(es|en)" href="([^"]+)"/g)].map(m => m[2]);
      assert.equal(alternates.length, 2, route);
      assert.ok(alternates.includes(origin + route), route);
      graph.set(origin + route, alternates);
      for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const schema = JSON.parse(block[1]);
        assert.doesNotMatch(JSON.stringify(schema), /aggregateRating|reviewCount|priceCurrency|"offers"/);
      }
      assert.ok(sitemap.includes(`<loc>${origin}${route}</loc>`));
    }
    for (const [url, alternates] of graph) for (const alternate of alternates) assert.ok(graph.get(alternate)?.includes(url), `${url} <> ${alternate}`);
    for (const prefix of ['', 'en/']) {
      const html = await readFile(join(output, prefix, 'disenos/index.html'), 'utf8');
      assert.equal((html.match(/class="lz-card"/g) || []).length, catalog.designs.length);
      for (const design of catalog.designs) assert.ok(html.includes(`href="/${prefix}disenos/${design.id}/"`));
      assert.doesNotMatch(html, /US\$ XX/);
    }
    for (const route of ['/cuenta/', '/editor/', '/editor/pago/', '/comprar/', '/en/account/', '/en/editor/', '/en/editor/pago/', '/en/comprar/']) {
      const html = await readFile(join(output, route.slice(1), 'index.html'), 'utf8');
      assert.match(html, /name="robots" content="noindex/);
      assert.doesNotMatch(html, /data-marketing-page/);
    }
    await bundleMarketingStyles(output);
    await bundlePageScripts(output);
    const manifest = await fingerprintAssets(output);
    assert.ok(!manifest['/assets/backend/config.js']);
    for (const [source, url] of Object.entries(manifest)) {
      const bytes = await readFile(join(output, url.slice(1)));
      assert.ok(url.includes(createHash('sha256').update(bytes).digest('hex').slice(0, 16)), source);
    }
    // Check the deployable output, including generated links and fingerprinted assets.
    async function check(dir) {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) await check(file);
        else if (file.endsWith('.html')) {
          const html = await readFile(file, 'utf8');
          for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)[^\"]*"/g)) {
            if (m[1].startsWith('/assets/backend/')) continue; // Built separately with deployment config.
            const target = join(output, m[1].slice(1), m[1].endsWith('/') ? 'index.html' : '');
            await assert.doesNotReject(access(target), `${file}: ${m[1]}`);
          }
        }
      }
    }
    await check(output);
  } finally { await rm(output, { recursive: true, force: true }); }
});

test('preview response rules exclude both locales without deindexing ordinary demos', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  assert.equal(config.trailingSlash, true);
  const compiled = routing.getTransformedRoutes(config);
  assert.equal(compiled.error, null);
  function headers(url) {
    const parsed = new URL(url, origin), result = {};
    for (const route of compiled.routes) {
      if (!route.continue || !new RegExp(route.src).test(parsed.pathname)) continue;
      if (route.has && !route.has.every(condition => condition.type === 'query' && new RegExp('^(?:' + condition.value + ')$').test(parsed.searchParams.get(condition.key) || ''))) continue;
      Object.assign(result, route.headers);
    }
    return result;
  }
  for (const prefix of ['/demo', '/en/demo']) {
    for (const mode of ['editor', 'vista']) {
      const h = headers(prefix + '/nacar/?lz=' + mode + '&k=private');
      assert.match(h['X-Robots-Tag'], /noindex/);
      assert.match(h['Cache-Control'], /no-store/);
      assert.equal(h['Referrer-Policy'], 'no-referrer');
    }
    assert.equal(headers(prefix + '/nacar/')['X-Robots-Tag'], undefined);
  }
  for (const route of ['/editor/', '/editor/pago/', '/cuenta/', '/en/account/', '/en/editor/']) assert.match(headers(route)['X-Robots-Tag'], /noindex/, route);
  assert.match(headers('/assets/immutable/test.1234.css')['Cache-Control'], /immutable/);
  assert.equal(headers('/assets/backend/config.js')['Cache-Control'], 'no-cache');
  for (const [path, expected] of [['/index.html', '/'], ['/disenos/index.html', '/disenos/'], ['/en/disenos/index.html', '/en/disenos/'], ['/disenos', '/disenos/'], ['/en/cuenta/', '/en/account/']]) {
    const rule = compiled.routes.find(route => route.status === 308 && new RegExp(route.src).test(path));
    assert.ok(rule, path);
    assert.equal(path.replace(new RegExp(rule.src), rule.headers.Location), expected);
  }
});
