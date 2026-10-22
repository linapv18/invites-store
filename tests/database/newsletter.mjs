import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
create schema auth;create schema storage;grant usage on schema public,auth,storage to anon,authenticated,service_role;
create table auth.users(id uuid primary key,email_confirmed_at timestamptz,email text,created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,metadata jsonb,unique(bucket_id,name));
alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to authenticated;grant all on storage.objects to service_role;`);
await db.exec(await readFile(new URL('../../supabase/ACTIVAR-STRIPE.sql',import.meta.url),'utf8'));
const migration=await readFile(new URL('../../supabase/migrations/202610220001_newsletter.sql',import.meta.url),'utf8');
await db.exec(migration);await db.exec(migration);
const r=async(q,a=[])=>(await db.query(q,a)).rows[0]?.r;
const consent='Acepto recibir correos de marketing de Invitesse con inspiración, novedades y promociones.';
const subscribe=(email,lang='es')=>r('select public.newsletter_subscribe($1,$2,$3,$4) r',[email,lang,'landing',consent]);

// A new address is pending with its own single-use 10% code until the email is confirmed.
const first=await subscribe('  Ana@Example.test ');
assert.equal(first.state,'send');assert.equal(first.email,'ana@example.test');assert.match(first.code,/^BIENVENIDA[0-9A-F]{6}$/);
const code=(await db.query('select * from public.discount_codes where code=$1',[first.code])).rows[0];
assert.equal(code.percent_off,10);assert.equal(code.max_uses,1);assert.equal(code.once_per_customer,true);assert.equal(code.first_purchase_only,true);
assert.equal((await db.query("select status from public.newsletter_subscribers where email='ana@example.test'")).rows[0].status,'pending');
// A failed send can be retried: same code, no duplicate row or code.
const retry=await subscribe('ana@example.test');assert.equal(retry.state,'send');assert.equal(retry.code,first.code);
assert.equal((await db.query('select count(*)::int n from public.discount_codes')).rows[0].n,1);
assert.equal(await r('select public.newsletter_confirm_sent($1) r',['ana@example.test']),true);
assert.equal((await subscribe('ana@example.test')).state,'already');
await assert.rejects(()=>subscribe('ana@correo'),/INVALID_EMAIL/);
// Unsubscribing keeps the code; subscribing again resends it.
assert.equal(await r('select public.newsletter_unsubscribe($1) r',[first.token]),true);
assert.equal((await db.query("select status from public.newsletter_subscribers where email='ana@example.test'")).rows[0].status,'unsubscribed');
const back=await subscribe('ana@example.test','en');assert.equal(back.state,'send');assert.equal(back.code,first.code);assert.equal(back.lang,'en');
assert.equal(await r('select public.newsletter_unsubscribe($1) r',['00000000-0000-4000-8000-000000000000']),false);
// Browser roles cannot read the list or call the functions.
for(const role of ['anon','authenticated']){
 await db.exec('set role '+role);
 await assert.rejects(()=>db.query('select * from public.newsletter_subscribers'));
 await assert.rejects(()=>subscribe('x@example.test'));
 await db.exec('reset role');
}
console.log('PASS subscriptions, retries and unsubscriptions');

// The welcome code applies on a first purchase only.
const A='11111111-1111-4111-8111-111111111111';
await db.query('insert into auth.users values($1,now())',[A]);
const quote=await r("select public.discount_quote($1,'nacar','COP',$2) r",[A,first.code]);
assert.equal(quote.discount_minor,quote.base_minor/10);
await db.query("select public.configure_stripe_purchase($1,'clasico','2028-08-31','America/Bogota')",[A]);
const q=await r("select public.quote_stripe_checkout($1,'clasico') r",[A]);
const order=await r("select public.prepare_stripe_checkout($1,'clasico','COP',$2) r",[A,q.revision]);
await db.query("select public.apply_verified_payment('stripe','evt_first',$1,'pi_first',$2,'COP')",[order.order_id,order.amount]);
await assert.rejects(()=>r("select public.discount_quote($1,'nacar','COP',$2) r",[A,first.code]),/DISCOUNT_FIRST_PURCHASE_ONLY/);
// Existing codes are unaffected by the new rule.
await db.query("insert into public.discount_codes(code,kind,percent_off) values('AMIGOS10','percent',10)");
assert.equal((await r("select public.discount_quote($1,'nacar','COP','AMIGOS10') r",[A])).percent_off,10);
console.log('PASS first-purchase rule');
