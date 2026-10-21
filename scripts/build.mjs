import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { build } from 'esbuild';
import { supabaseOrigin } from '../lib/supabase/config.mjs';
import { generateSeo } from './seo.mjs';
import { bundleMarketingStyles, bundlePageScripts, fingerprintAssets } from './asset-cache.mjs';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !publishableKey) throw new Error('Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building.');
const endpoint = supabaseOrigin(url);
if (!publishableKey.startsWith('sb_publishable_')) throw new Error('Use a publishable key; never a secret/service_role key.');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
// Explicit allowlist: never publish env files, dependencies, SQL or internal docs.
for (const path of ['panel','admin','assets','comprar','cotizar','cuenta','demo','disenos','editor','en','privacidad','condiciones','quiz','index.html','404.html','invitacion']) {
  await cp(path, 'dist/' + path, { recursive: true });
}
await mkdir('dist/assets/backend', { recursive: true });
// The preconnect opens the TLS connection to Supabase while client.js is still downloading.
const preconnect = '(function(){var l=document.createElement("link");l.rel="preconnect";l.href=' + JSON.stringify(endpoint).replaceAll('<', '\\u003c') + ';l.crossOrigin="anonymous";document.head.appendChild(l);})();\n';
await writeFile('dist/assets/backend/config.js', 'window.INVITESSE_SUPABASE_CONFIG=' + JSON.stringify({ url: endpoint, publishableKey }).replaceAll('<', '\\u003c') + ';\n' + preconnect);
await build({ entryPoints: ['lib/supabase/client.mjs'], outfile: 'dist/assets/backend/client.js', bundle: true, minify: true, format: 'iife', target: ['es2020'], legalComments: 'eof' });
await build({ entryPoints: ['lib/vitals.mjs'], outfile: 'dist/assets/brand/vitals.js', bundle: true, minify: true, format: 'iife', target: ['es2020'], legalComments: 'eof' });
await generateSeo('dist');
await bundleMarketingStyles('dist');
await bundlePageScripts('dist');
await fingerprintAssets('dist');
console.log('Static storefront and Supabase client built in dist/. Accounts, invitations and verified Stripe payments use Supabase; checkout requires the Stripe migration and server credentials.');
