import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
process.on('uncaughtException',e=>{console.error('FAILED',e.message,e.where||'',(e.query||'').slice(0,120));process.exit(1);});
const db=new PGlite();
await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema storage;
grant usage on schema public,auth,storage to anon,authenticated,service_role;
create table auth.users(id uuid primary key,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant execute on function auth.uid() to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,metadata jsonb,unique(bucket_id,name));
alter table storage.objects enable row level security; grant select,insert,update,delete on storage.objects to authenticated; grant all on storage.objects to service_role;
`);
for (const name of ['202610180001_drafts.sql','../ACTIVAR-PLATAFORMA.sql']) {
 try { await db.exec(await readFile(new URL('../../supabase/migrations/'+name,import.meta.url),'utf8')); console.log('MIGRATION OK',name);
  if(name==='202610180001_drafts.sql'){await db.exec("insert into auth.users(id,email_confirmed_at) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',now()); insert into public.invitation_drafts(id,owner_id,design_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','encaje');");} }
 catch(e){ console.error('MIGRATION FAILED',name,e.message);throw e; }
}
assert.equal((await db.query("select id from public.invitations where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'")).rows.length,1);
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
let D,E;
await db.query('insert into auth.users values ($1,now()),($2,now())',[A,B]);
async function as(role,id,fn){await db.exec('set role '+role);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);try{return await fn();}finally{await db.exec('reset role');await db.exec("reset request.jwt.claim.sub");}}
async function denied(fn,pattern){await assert.rejects(fn,pattern);}
const content={n1:'Ana',n2:'León',date:'2027-03-14',timeZone:'America/Bogota',cover:'/assets/fotos/paseo.jpg',invitations:[{name:'Secret family',email:'private@example.invalid'}],private_note:'SECRET',events:[{id:1,name:'Ceremonia',place:'Jardín',private_email:'LEAK'}],dressSuggest:['#7b8f6a'],dressAvoid:['#ffffff'],storyMode:'timeline',timeline:[{id:1,when:'2019',title:'Nos conocimos',text:'En una boda',secret:'LEAK'}]};
await as('authenticated',A,async()=>{
 D=(await db.query('insert into public.invitation_drafts(owner_id,design_id,content) values($1,$2,$3) returning id',[A,'rosa',JSON.stringify(content)])).rows[0].id;
 assert.equal((await db.query('select id from public.invitations')).rows.length,1);
 await denied(()=>db.query('insert into public.invitation_drafts(owner_id,design_id) values($1,$2)',[B,'rosa']),/row-level security/);
 await denied(()=>db.query('update public.invitations set state=$1 where id=$2',['published',D]),/permission denied/);
 await denied(()=>db.query("insert into public.invitation_entitlements(invitation_id,source,reason) values($1,'manual','fake purchase')",[D]),/permission denied/);
 await denied(()=>db.query("select public.publish_invitation($1,0,'ana-leon')",[D]),/PUBLICATION_NOT_ENABLED/);
 await denied(()=>db.query("select public.apply_verified_payment('fake','event',$1,'pay',0,'USD')",[D]),/permission denied/);
});
await as('authenticated',B,async()=>{
 assert.equal((await db.query('select * from public.invitation_drafts')).rows.length,0);
 assert.equal((await db.query('select * from public.invitations')).rows.length,0);
 await denied(()=>db.query('select public.save_invitation_draft($1,$2,0)',[D,JSON.stringify({n1:'hacked'})]),/DRAFT_CONFLICT_OR_NOT_FOUND/);
 await denied(()=>db.query("select public.publish_invitation($1,0,'stolen')",[D]),/INVITATION_NOT_FOUND/);
 E=(await db.query('insert into public.invitation_drafts(owner_id,design_id,content) values($1,$2,$3) returning id',[B,'rosa',JSON.stringify(content)])).rows[0].id;
});
console.log('PASS cross-account isolation and purchase forgery denied');
await db.query("insert into public.invitation_entitlements(invitation_id,source,reason) values($1,'manual','Isolated automated test'),($2,'manual','Isolated automated test')",[D,E]);
let family,other,token,person;
await as('authenticated',A,async()=>{
 const r=await db.query("select public.publish_invitation($1,0,'ana-leon') result",[D]);assert.equal(r.rows[0].result.access_mode,'family');
 const v=(await db.query('select content from public.invitation_versions')).rows[0].content;
 assert.equal(v.private_note,undefined);assert.equal(v.invitations,undefined);assert.equal(v.events[0].private_email,undefined);
 assert.deepEqual(v.dressSuggest,['#7b8f6a']);assert.deepEqual(v.dressAvoid,['#ffffff']);assert.equal(v.storyMode,'timeline');assert.deepEqual(v.timeline,[{id:1,when:'2019',title:'Nos conocimos',text:'En una boda'}]);
 family=(await db.query("select public.create_household($1,'Familia Uno',array['Carlos','Lucía'],'private@example.invalid','123') result",[D])).rows[0].result;
 token=family.token;
 other=(await db.query("select public.create_household($1,'Familia Dos',array['Sofía']) result",[D])).rows[0].result;
});
await as('anon',null,async()=>{
 await denied(()=>db.query('select * from public.invitations'),/permission denied/);
 await denied(()=>db.query('select * from public.households'),/permission denied/);
 assert.equal((await db.query("select public.get_published_invitation('ana-leon') result")).rows[0].result,null);
 const r=(await db.query('select public.get_guest_invitation($1) result',[token])).rows[0].result;
 assert.equal(r.guests.length,2);assert.equal(r.household.name,'Familia Uno');assert.equal(r.household.email,undefined);person=r.guests;
 assert.equal((await db.query('select public.get_guest_invitation($1) result',['0'.repeat(64)])).rows[0].result,null);
 const foreign=(await db.query('select public.get_guest_invitation($1) result',[other.token])).rows[0].result.guests[0];
 await denied(()=>db.query('select public.submit_guest_response($1,$2,$3,0,$4)',[token,JSON.stringify([{id:person[0].id,attendance:'attending'},{id:foreign.id,attendance:'attending'}]),'',crypto.randomUUID()]),/INVALID_RESPONSE/);
 const request=crypto.randomUUID(),answers=person.map(g=>({id:g.id,attendance:'attending'}));
 let rsvp=await db.query('select public.submit_guest_response($1,$2,$3,0,$4) result',[token,JSON.stringify(answers),'¡Gracias!',request]);assert.equal(rsvp.rows[0].result.revision,1);
 rsvp=await db.query('select public.submit_guest_response($1,$2,$3,0,$4) result',[token,JSON.stringify(answers),'¡Gracias!',request]);assert.equal(rsvp.rows[0].result.revision,1);
 await denied(()=>db.query('select public.submit_guest_response($1,$2,$3,0,$4)',[token,JSON.stringify(answers),'',crypto.randomUUID()]),/RESPONSE_CONFLICT/);
});
console.log('PASS private publication, sanitized snapshots, family isolation, atomic/idempotent RSVP');
await as('authenticated',A,async()=>{
 await db.query('select public.save_invitation_draft($1,$2,0)',[D,JSON.stringify({...content,n1:'Borrador nuevo'})]);
 const before=(await db.query('select content from public.invitation_versions')).rows[0].content;assert.equal(before.n1,'Ana');
 await db.query("select public.publish_invitation($1,1,'ana-leon','public')",[D]);
 const rotated=(await db.query('select public.rotate_guest_link($1) token',[family.household_id])).rows[0].token;assert.notEqual(rotated,token);
});
await as('anon',null,async()=>{
 assert.equal((await db.query('select public.get_guest_invitation($1) result',[token])).rows[0].result,null);
 assert.equal((await db.query("select public.get_published_invitation('ana-leon') result")).rows[0].result.content.n1,'Borrador nuevo');
});
await as('authenticated',A,async()=>{await db.query('select public.pause_invitation($1)',[D]);});
await as('anon',null,async()=>{assert.equal((await db.query("select public.get_published_invitation('ana-leon') result")).rows[0].result,null);});
console.log('PASS draft/publication separation, explicit public mode, link rotation and pause');

await as('authenticated',B,async()=>{
 await denied(()=>db.query("select public.edit_household($1,'Fake',$2,1)",[family.household_id,JSON.stringify([{id:person[0].id,name:'Fake'}])]),/HOUSEHOLD_NOT_FOUND/);
});
await as('authenticated',A,async()=>{
 await denied(()=>db.query("select public.edit_household($1,'Familia Uno',$2,0)",[family.household_id,JSON.stringify([{id:person[0].id,name:'Carlos'}])]),/RESPONSE_CONFLICT/);
 const changed=(await db.query("select public.edit_household($1,'Familia Uno',$2,1) result",[family.household_id,JSON.stringify([{id:person[0].id,name:'Carlos actualizado'},{name:'Invitado nuevo'}])])).rows[0].result;assert.equal(changed.revision,2);
 assert.equal((await db.query('select * from public.guest_responses where guest_id=$1',[person[0].id])).rows.length,1);
 assert.equal((await db.query('select * from public.guest_responses where guest_id=$1',[person[1].id])).rows.length,0);
});
console.log('PASS existing-draft migration and household edits preserve IDs/responses with conflict checks');

// Storage is private, paths are owned and published references cannot be replaced/deleted.
let assetId;const path=A+'/'+D+'/55555555-5555-4555-8555-555555555555.webp';
await as('authenticated',A,async()=>{
 await db.query("insert into storage.objects(bucket_id,name,metadata) values('invitation-assets',$1,$2)",[path,JSON.stringify({size:1200,mimetype:'image/webp'})]);
 assetId=(await db.query("select (public.register_invitation_asset($1,$2,'image')).id id",[D,path])).rows[0].id;
 await db.query('select public.save_invitation_draft($1,$2,1)',[D,JSON.stringify({...content,cover:'asset:'+assetId})]);
 await db.query("select public.publish_invitation($1,2,'ana-leon','public')",[D]);
 const deleted=await db.query("delete from storage.objects where name=$1 returning name",[path]);assert.equal(deleted.rows.length,0);
 const updated=await db.query("update storage.objects set metadata='{}' where name=$1 returning name",[path]);assert.equal(updated.rows.length,0);
});
await as('authenticated',B,async()=>{
 assert.equal((await db.query('select * from public.invitation_assets where id=$1',[assetId])).rows.length,0);
 assert.equal((await db.query('select * from storage.objects where name=$1',[path])).rows.length,0);
 await denied(()=>db.query("insert into storage.objects(bucket_id,name) values('invitation-assets',$1)",[A+'/'+D+'/66666666-6666-4666-8666-666666666666.webp']),/row-level security/);
 await denied(()=>db.query("select public.register_invitation_asset($1,$2,'image')",[D,path]),/ASSET_NOT_OWNED/);
});
await as('anon',null,async()=>{
 await denied(()=>db.query('select * from storage.objects'),/permission denied/);
 const result=(await db.query("select public.get_published_invitation('ana-leon') result")).rows[0].result;assert.deepEqual(result.assets,[{id:assetId,kind:'image'}]);
});
console.log('PASS private files, cross-account upload/read denied, published assets immutable');

// Prices below are isolated fixtures, not business prices or active production products.
const product=crypto.randomUUID(),order=crypto.randomUUID(),line=crypto.randomUUID();
await db.query("insert into public.products(id,sku,design_id) values($1,'test-only-rosa','rosa')",[product]);
await db.query("insert into public.orders(id,owner_id,invitation_id,total_minor,currency) values($1,$2,$3,123,'USD')",[order,B,E]);
await db.query('insert into public.order_items(id,order_id,product_id,design_id,unit_price_minor) values($1,$2,$3,$4,123)',[line,order,product,'rosa']);
await denied(()=>db.query("insert into public.orders(owner_id,invitation_id,total_minor,currency) values($1,$2,123,'USD')",[A,E]),/foreign key/);
await as('authenticated',B,async()=>{
 await denied(()=>db.query("update public.orders set status='paid' where id=$1",[order]),/permission denied/);
 assert.equal((await db.query('select * from public.orders')).rows.length,1);
 await denied(()=>db.query("select public.apply_verified_payment('test-provider','ev-1',$1,'pay-1',123,'USD')",[order]),/permission denied/);
});
await as('authenticated',A,async()=>{assert.equal((await db.query('select * from public.orders')).rows.length,0);});
await as('service_role',null,async()=>{
 await denied(()=>db.query("select public.apply_verified_payment('test-provider','ev-1',$1,'pay-1',1,'USD')",[order]),/PAYMENT_AMOUNT_MISMATCH/);
 let result=(await db.query("select public.apply_verified_payment('test-provider','ev-1',$1,'pay-1',123,'USD') result",[order])).rows[0].result;assert.equal(result.status,'paid');
 result=(await db.query("select public.apply_verified_payment('test-provider','ev-1',$1,'pay-1',123,'USD') result",[order])).rows[0].result;assert.equal(result.duplicate,true);
 assert.equal((await db.query('select * from public.payments where order_id=$1',[order])).rows.length,1);
 await db.query('select public.revoke_order_access($1)',[order]);
 // Another event for the same payment cannot re-grant refunded access.
 await denied(()=>db.query("select public.apply_verified_payment('test-provider','ev-2',$1,'pay-1',123,'USD')",[order]),/ORDER_NOT_PAYABLE/);
 assert.notEqual((await db.query('select revoked_at from public.invitation_entitlements where invitation_id=$1',[E])).rows[0].revoked_at,null);
});
console.log('PASS payment amount validation, webhook idempotency, refund revocation and no browser payment writes');

const checkoutProduct=crypto.randomUUID(),checkoutKey=crypto.randomUUID();
await db.query("insert into public.products(id,sku,design_id,price_minor,currency,active) values($1,'checkout-fixture','rosa',987,'USD',true)",[checkoutProduct]);
await as('authenticated',A,async()=>{
 await denied(()=>db.query('select public.create_checkout_order($1,$2,$3,$4)',[A,D,[checkoutProduct],checkoutKey]),/permission denied/);
});
await as('service_role',null,async()=>{
 const created=(await db.query('select public.create_checkout_order($1,$2,$3,$4) result',[A,D,[checkoutProduct],checkoutKey])).rows[0].result;assert.equal(created.amount_minor,987);
 const repeated=(await db.query('select public.create_checkout_order($1,$2,$3,$4) result',[A,D,[checkoutProduct],checkoutKey])).rows[0].result;assert.equal(repeated.id,created.id);
 await denied(()=>db.query('select public.create_checkout_order($1,$2,$3,$4)',[B,D,[checkoutProduct],crypto.randomUUID()]),/INVITATION_NOT_FOUND/);
 await denied(()=>db.query('select public.create_checkout_order($1,$2,$3,$4)',[A,D,[product],crypto.randomUUID()]),/PRODUCT_UNAVAILABLE/);
});
console.log('PASS server-derived checkout prices and duplicate-checkout protection');
await db.close();
