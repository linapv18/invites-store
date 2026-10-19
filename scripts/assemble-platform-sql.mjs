import { readFile, writeFile } from 'node:fs/promises';
const files = ['202610180002_platform_tables.sql','202610180003_platform_functions.sql','202610180004_storage_payments.sql','202610190001_publish_dress_timeline.sql'];
let sql = '-- Invitesse: execute once in Supabase SQL Editor, AFTER migration 001.\n-- This transaction creates the remaining platform tables/functions/private bucket.\n-- Do not run both this file and individual migrations 002/003/004.\nbegin;\n';
for (const file of files) {
  const source = await readFile(new URL('../supabase/migrations/'+file, import.meta.url), 'utf8');
  sql += '\n-- '+file+'\n'+source.replace(/^begin;\s*$/gm,'').replace(/^commit;\s*$/gm,'')+'\n';
}
sql += '\ncommit;\n';
await writeFile(new URL('../supabase/ACTIVAR-PLATAFORMA.sql', import.meta.url), sql);
console.log('Prepared supabase/ACTIVAR-PLATAFORMA.sql');
