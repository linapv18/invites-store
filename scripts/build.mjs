import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { build } from 'esbuild';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !publishableKey) throw new Error('Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building.');
const endpoint = new URL(url);
if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.supabase.co')) throw new Error('Invalid Supabase project URL.');
if (!publishableKey.startsWith('sb_publishable_')) throw new Error('Use a publishable key; never a secret/service_role key.');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
// Explicit allowlist: never publish env files, dependencies, SQL or internal docs.
for (const path of ['assets','comprar','cuenta','demo','disenos','editor','en','index.html']) {
  await cp(path, 'dist/' + path, { recursive: true });
}
await mkdir('dist/assets/backend', { recursive: true });
await writeFile('dist/assets/backend/config.js', 'window.INVITESSE_SUPABASE_CONFIG=' + JSON.stringify({ url: endpoint.origin, publishableKey }).replaceAll('<', '\\u003c') + ';\n');
await build({ entryPoints: ['lib/supabase/client.mjs'], outfile: 'dist/assets/backend/client.js', bundle: true, minify: true, format: 'iife', target: ['es2020'], legalComments: 'eof' });
console.log('Static storefront and Supabase client built in dist/. Accounts and drafts use Supabase; payments and publishing remain unavailable.');
