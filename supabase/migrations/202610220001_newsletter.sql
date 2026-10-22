-- Suscripción a correos de marketing desde el landing, con un 10% de bienvenida.
-- Se puede ejecutar de nuevo sin efectos. Requiere 202610200004_full_discount.sql (discount_codes y discount_quote).
-- Cada suscriptor recibe un código propio de discount_codes: 10%, un solo uso, una vez por cliente y solo en su primera compra.
-- El checkout ya admite un único código por pedido, así que no se acumula con otras promociones.
-- Un suscriptor queda 'pending' hasta que api/suscripcion.js confirma el envío del correo con su código; solo los 'subscribed'
-- cuentan como lista de marketing. Las tablas y funciones solo son accesibles desde el servidor (service_role).
begin;

alter table public.discount_codes add column if not exists first_purchase_only boolean not null default false;

create table if not exists public.newsletter_subscribers (
 id uuid primary key default gen_random_uuid(),
 email text not null unique check (email = lower(email) and length(email) between 6 and 254),
 status text not null default 'pending' check (status in ('pending','subscribed','unsubscribed')),
 lang text not null default 'es' check (lang in ('es','en')),
 source text not null default 'landing' check (length(source) <= 40),
 consent_text text not null check (length(consent_text) between 20 and 600),
 consented_at timestamptz not null default now(),
 unsubscribe_token uuid not null unique default gen_random_uuid(),
 discount_code_id uuid references public.discount_codes(id),
 welcome_sent_at timestamptz,
 unsubscribed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from public,anon,authenticated;
grant all on public.newsletter_subscribers to service_role;

-- Registra (o reactiva) la suscripción y devuelve lo necesario para enviar el código.
-- state 'already': ya está suscrito y recibió su código; no se reenvía.
create or replace function public.newsletter_subscribe(requested_email text, requested_lang text, requested_source text, requested_consent text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare normalized text; s public.newsletter_subscribers; new_code text; code_id uuid; attempts integer:=0;
begin
 normalized:=lower(btrim(coalesce(requested_email,'')));
 if length(normalized)>254 or normalized !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'INVALID_EMAIL'; end if;
 insert into public.newsletter_subscribers(email,lang,source,consent_text)
  values(normalized,case when requested_lang='en' then 'en' else 'es' end,left(coalesce(nullif(requested_source,''),'landing'),40),requested_consent)
  on conflict(email) do nothing;
 select * into s from public.newsletter_subscribers where email=normalized for update;
 if s.status='subscribed' and s.welcome_sent_at is not null then return jsonb_build_object('state','already'); end if;
 if s.discount_code_id is null then
  loop
   attempts:=attempts+1;
   new_code:='BIENVENIDA'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
   begin
    insert into public.discount_codes(code,kind,percent_off,max_uses,once_per_customer,first_purchase_only,note)
     values(new_code,'percent',10,1,true,true,'Bienvenida por suscripción a correos de marketing') returning id into code_id;
    exit;
   exception when unique_violation then
    if attempts>=5 then raise; end if;
   end;
  end loop;
 else
  code_id:=s.discount_code_id;
 end if;
 update public.newsletter_subscribers set status='pending',discount_code_id=code_id,consent_text=requested_consent,consented_at=now(),
  lang=case when requested_lang='en' then 'en' else 'es' end,unsubscribed_at=null,updated_at=now()
  where id=s.id returning * into s;
 return jsonb_build_object('state','send','email',s.email,'lang',s.lang,'token',s.unsubscribe_token,
  'code',(select dc.code from public.discount_codes dc where dc.id=code_id));
end; $$;
revoke all on function public.newsletter_subscribe(text,text,text,text) from public,anon,authenticated;
grant execute on function public.newsletter_subscribe(text,text,text,text) to service_role;

-- Solo después de que el proveedor acepta el correo con el código.
create or replace function public.newsletter_confirm_sent(requested_email text)
returns boolean language sql security definer set search_path='' as $$
 with u as (update public.newsletter_subscribers set status='subscribed',welcome_sent_at=now(),updated_at=now()
  where email=lower(btrim(requested_email)) and status='pending' returning 1) select exists(select 1 from u);
$$;
revoke all on function public.newsletter_confirm_sent(text) from public,anon,authenticated;
grant execute on function public.newsletter_confirm_sent(text) to service_role;

-- La baja conserva el código ya enviado: la oferta se obtuvo al suscribirse.
create or replace function public.newsletter_unsubscribe(token uuid)
returns boolean language sql security definer set search_path='' as $$
 with u as (update public.newsletter_subscribers set status='unsubscribed',unsubscribed_at=coalesce(unsubscribed_at,now()),updated_at=now()
  where unsubscribe_token=token returning 1) select exists(select 1 from u);
$$;
revoke all on function public.newsletter_unsubscribe(uuid) from public,anon,authenticated;
grant execute on function public.newsletter_unsubscribe(uuid) to service_role;

-- discount_quote de 202610200004_full_discount.sql, con la regla de primera compra.
create or replace function public.discount_quote(verified_owner uuid, requested_design text, requested_currency text, requested_code text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare dc public.discount_codes; p public.products; tier text; normalized text; used integer; unit bigint; off bigint; minimum bigint;
begin
 normalized:=upper(btrim(coalesce(requested_code,'')));
 if normalized !~ '^[A-Z0-9]{3,32}$' then raise exception 'DISCOUNT_NOT_FOUND'; end if;
 if requested_currency not in ('COP','USD') or requested_currency is null then raise exception 'INVALID_CURRENCY'; end if;
 select * into dc from public.discount_codes where code=normalized;
 if not found or not dc.active then raise exception 'DISCOUNT_NOT_FOUND'; end if;
 if dc.starts_at is not null and now()<dc.starts_at then raise exception 'DISCOUNT_NOT_STARTED'; end if;
 if dc.ends_at is not null and now()>=dc.ends_at then raise exception 'DISCOUNT_EXPIRED'; end if;
 select t.tier into tier from public.design_price_tiers t where t.design_id=requested_design;
 if tier is null or not (tier = any(dc.tiers)) then raise exception 'DISCOUNT_NOT_APPLICABLE'; end if;
 if dc.max_uses is not null then
  select count(*) into used from public.orders o where o.discount_code_id=dc.id and o.status in ('paid','pending');
  if used>=dc.max_uses then raise exception 'DISCOUNT_EXHAUSTED'; end if;
 end if;
 if dc.once_per_customer and exists(select 1 from public.orders o where o.discount_code_id=dc.id and o.owner_id=verified_owner and o.status in ('paid','pending')) then raise exception 'DISCOUNT_ALREADY_USED'; end if;
 if dc.first_purchase_only and exists(select 1 from public.orders o where o.owner_id=verified_owner and o.status='paid') then raise exception 'DISCOUNT_FIRST_PURCHASE_ONLY'; end if;
 select * into p from public.products where sku='invitation-'||requested_design||'-'||lower(requested_currency) and active;
 if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 unit:=case when requested_currency='COP' then 100 else 1 end;
 minimum:=case when requested_currency='COP' then 500000 else 100 end;
 off:=case when dc.kind='percent' then (p.price_minor*dc.percent_off/100/unit)*unit
  else case when requested_currency='COP' then dc.amount_off_cop else dc.amount_off_usd end end;
 off:=(off/unit)*unit;
 if off<=0 then raise exception 'DISCOUNT_NOT_APPLICABLE'; end if;
 if dc.kind='percent' and dc.percent_off=100 then off:=p.price_minor; end if;
 if p.price_minor-off<minimum and not (dc.kind='percent' and dc.percent_off=100) then raise exception 'DISCOUNT_TOO_LARGE'; end if;
 return jsonb_build_object('code',dc.code,'discount_code_id',dc.id,'kind',dc.kind,'percent_off',dc.percent_off,'currency',requested_currency,'base_minor',p.price_minor,'discount_minor',off,'total_minor',p.price_minor-off);
end; $$;
revoke all on function public.discount_quote(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.discount_quote(uuid,text,text,text) to service_role;
commit;
