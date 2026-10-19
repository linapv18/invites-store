import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { transform } from 'esbuild';

export async function bundleMarketingStyles(output) {
  const bundles = join(output, 'assets/brand/bundles');
  await mkdir(bundles, { recursive: true });
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (file.endsWith('.html')) {
        let html = await readFile(file, 'utf8');
        if (!html.includes('data-marketing-page="true"') && !/\/demo\/[^/]+\/index\.html$/.test(file)) continue;
        const links = (html.match(/<link\b[^>]*>/g) || []).filter(tag => /rel="stylesheet"/.test(tag) && /href="\/assets\//.test(tag));
        if (!links.length) continue;
        let css = '';
        for (const link of links) {
          const url = link.match(/href="([^"]+)"/)[1].split('?')[0];
          css += '\n' + await readFile(join(output, url.slice(1)), 'utf8');
        }
        css = (await transform(css, { loader: 'css', minify: true, legalComments: 'inline' })).code;
        const name = createHash('sha256').update(css).digest('hex').slice(0, 16) + '.css';
        await writeFile(join(bundles, name), css);
        html = html.replace(links[0], `<link rel="stylesheet" href="/assets/brand/bundles/${name}">`);
        for (const link of links.slice(1)) html = html.replace(link, '');
        await writeFile(file, html);
      }
    }
  }
  await visit(output);
}

export async function bundlePageScripts(output) {
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (file.endsWith('.html')) {
        let html = await readFile(file, 'utf8');
        const demo = /\/demo\/[^/]+\/index\.html$/.test(file);
        const catalog = /\/(?:en\/)?disenos\/index\.html$/.test(file);
        if (!demo && !catalog) continue;
        const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/\b(?:defer|async|type)\b/.test(m[1]) && !m[1].includes('/demo/shared/language.js'));
        if (!scripts.length) continue;
        let code = '';
        for (const script of scripts) {
          const src = script[1].match(/src="([^"]+)"/)?.[1];
          if (src && !src.startsWith('/')) throw new Error('Unexpected external classic script: ' + src);
          code += '\n;\n' + (src ? await readFile(join(output, src.split('?')[0].slice(1)), 'utf8') : script[2]);
        }
        // No IIFE: preserve existing global functions used by template markup.
        code = (await transform(code, { loader: 'js', minify: true, target: 'es2020', legalComments: 'eof' })).code;
        const name = 'page-' + createHash('sha256').update(code).digest('hex').slice(0, 16) + '.js';
        await writeFile(join(output, 'assets/brand', name), code);
        html = html.replace(scripts[0][0], `<script defer src="/assets/brand/${name}"></script>`);
        for (const script of scripts.slice(1)) html = html.replace(script[0], '');
        await writeFile(file, html);
      }
    }
  }
  await visit(output);
}

// Hash the final bytes after rewriting dependencies. Backend configuration and
// private signed assets are deliberately excluded from this immutable namespace.
export async function fingerprintAssets(output) {
  const dest = join(output, 'assets/immutable');
  await mkdir(dest, { recursive: true });
  const cache = new Map(), pending = new Set();
  const reference = /\/assets\/[a-zA-Z0-9_./-]+(?:\?[^\s"'<>`)]+)?/g;
  const eligible = path => {
    if (path.startsWith('/assets/backend/') || path.startsWith('/assets/immutable/')) return false;
    // Demo layouts also construct photo/decoration paths at runtime. Keep those
    // URLs stable so a preload and a gallery do not download duplicate copies.
    if (/\.(webp|jpg|jpeg|png|svg)$/.test(path)) return path.startsWith('/assets/brand/') || path.startsWith('/assets/romantico-') || path === '/assets/arco/lluvia-cristal.webp';
    return /\.(css|js|woff2|woff|ttf)$/.test(path);
  };
  async function rewrite(text) {
    const refs = [...new Set(text.match(reference) || [])];
    for (const ref of refs) {
      const path = ref.split('?')[0];
      if (!eligible(path)) continue;
      const hashed = await fingerprint(path);
      if (hashed) text = text.split(ref).join(hashed);
    }
    return text;
  }
  async function fingerprint(path) {
    if (cache.has(path)) return cache.get(path);
    if (pending.has(path)) throw new Error('Cyclic asset dependency: ' + path);
    const source = join(output, path.slice(1));
    try { if (!(await stat(source)).isFile()) return null; } catch { return null; }
    pending.add(path);
    const ext = extname(path);
    let bytes = await readFile(source);
    if (ext === '.css' || ext === '.js') bytes = Buffer.from(await rewrite(bytes.toString()));
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const name = `${basename(path, ext)}.${hash}${ext}`;
    await writeFile(join(dest, name), bytes);
    const url = '/assets/immutable/' + name;
    cache.set(path, url); pending.delete(path); return url;
  }
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) { if (file !== dest) await visit(file); }
      else if (/\.(html|css|js)$/.test(file) && !file.includes('/assets/backend/')) {
        const before = await readFile(file, 'utf8');
        const after = await rewrite(before);
        if (after !== before) await writeFile(file, after);
      }
    }
  }
  await visit(output);
  return Object.fromEntries(cache);
}
