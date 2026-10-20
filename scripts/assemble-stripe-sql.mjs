import {readFile,writeFile} from 'node:fs/promises';
const read=async n=>(await readFile(new URL('../supabase/migrations/'+n,import.meta.url),'utf8')).replace(/^begin;\s*$/gm,'').replace(/^commit;\s*$/gm,'');
const drafts=await read('202610180001_drafts.sql');
const base=(await Promise.all(['202610180002_platform_tables.sql','202610180003_platform_functions.sql','202610180004_storage_payments.sql'].map(read))).join('\n');
let sql=`-- Invitesse: activar Stripe y publicación. Ejecutar completo en SQL Editor del proyecto existente.\n-- No borra cuentas ni borradores. Crea la plataforma si falta; instala precios y funciones nuevas.\n-- Puede ejecutarse de nuevo; no crea permisos de compra falsos ni procesa cargos.\nbegin;\ndo $install$ begin\n if to_regclass('public.invitation_drafts') is null then execute $drafts$${drafts}$drafts$; end if;\n if to_regclass('public.invitations') is null then execute $platform$${base}$platform$; end if;\nend; $install$;\n`;
for(const n of ['202610190001_publish_dress_timeline.sql','202610190002_publish_gifts.sql','202610190003_invitation_language.sql','202610200001_stripe_checkout.sql','202610200002_tier_prices.sql','202610200003_admin_discounts.sql'])sql+='\n-- '+n+'\n'+await read(n)+'\n';
sql+='commit;\n';
await writeFile(new URL('../supabase/ACTIVAR-STRIPE.sql',import.meta.url),sql);
