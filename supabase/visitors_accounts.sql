-- DIAMOND HUB: تتبّع الزوار + حسابات المستخدمين
-- نفّذ هذا الملف مرة واحدة في Supabase: SQL Editor ← New query ← الصق ← Run
-- ثم عدّل البريد في آخر الملف ليصبح بريدك (بعد أن تُنشئ حسابًا بنفس البريد من صفحة /account/).

-- 1) سجل الزيارات (إدخال فقط للزوار، لا قراءة عامة)
create table if not exists public.dh_page_views(
  id bigserial primary key,
  created_at timestamptz not null default now(),
  sid text check (char_length(sid) <= 40),
  vid text check (char_length(vid) <= 40),
  path text not null check (char_length(path) <= 300),
  ref text check (char_length(ref) <= 120),
  device text check (device in ('mobile','tablet','desktop')),
  lang text check (char_length(lang) <= 12),
  uid uuid,
  is_new boolean default false,
  country text, city text, region text,
  browser text, os text, utm text
);
alter table public.dh_page_views add column if not exists country text, add column if not exists city text, add column if not exists region text, add column if not exists browser text, add column if not exists os text, add column if not exists utm text;

-- الموقع الجغرافي: من ترويسات الطلب التي يضيفها Supabase (لا نخزّن عنوان IP)
create or replace function public.dh_pv_geo() returns trigger language plpgsql security definer set search_path = public as $$
declare h jsonb;
begin
  begin h := coalesce(nullif(current_setting('request.headers', true),'')::jsonb, '{}'::jsonb); exception when others then h := '{}'::jsonb; end;
  new.country := upper(left(coalesce(h->>'cf-ipcountry', new.country),2));
  new.city := left(coalesce(nullif(h->>'cf-ipcity',''), new.city),80);
  new.region := left(coalesce(nullif(h->>'cf-region',''), new.region),80);
  new.browser := left(new.browser,30); new.os := left(new.os,30); new.utm := left(new.utm,60);
  return new;
end $$;
drop trigger if exists dh_pv_geo_t on public.dh_page_views;
create trigger dh_pv_geo_t before insert on public.dh_page_views for each row execute function public.dh_pv_geo();
create index if not exists dh_pv_created on public.dh_page_views(created_at desc);
create index if not exists dh_pv_path on public.dh_page_views(path);
alter table public.dh_page_views enable row level security;
drop policy if exists "pv insert" on public.dh_page_views;
create policy "pv insert" on public.dh_page_views for insert to anon, authenticated with check (true);

-- 2) المشرفون
create table if not exists public.dh_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.dh_admins enable row level security;
create or replace function public.dh_is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists(select 1 from public.dh_admins where user_id = auth.uid()) $$;

-- 3) ملفات الزوار وبياناتهم
create table if not exists public.dh_profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  name text check (char_length(name) <= 80),
  created_at timestamptz default now());
alter table public.dh_profiles enable row level security;
drop policy if exists "profile own" on public.dh_profiles;
create policy "profile own" on public.dh_profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create table if not exists public.dh_user_data(
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now());
alter table public.dh_user_data enable row level security;
drop policy if exists "data own" on public.dh_user_data;
create policy "data own" on public.dh_user_data for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and pg_column_size(data) < 900000);

-- 4) تقرير الزوار (للمشرف فقط)
create or replace function public.dh_report(p_days int default 30) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d int := least(greatest(coalesce(p_days,30),1),365); since timestamptz := now() - (d || ' days')::interval; r jsonb;
begin
  if not public.dh_is_admin() then raise exception 'not allowed'; end if;
  select jsonb_build_object(
    'days', d,
    'views', (select count(*) from dh_page_views where created_at >= since),
    'sessions', (select count(distinct sid) from dh_page_views where created_at >= since),
    'visitors', (select count(distinct vid) from dh_page_views where created_at >= since),
    'new_visitors', (select count(distinct vid) from dh_page_views where created_at >= since and is_new),
    'online_now', (select count(distinct sid) from dh_page_views where created_at >= now() - interval '5 minutes'),
    'logged_in_views', (select count(*) from dh_page_views where created_at >= since and uid is not null),
    'daily', coalesce((select jsonb_agg(x order by x->>'day') from (
        select jsonb_build_object('day', to_char(date_trunc('day', created_at),'YYYY-MM-DD'), 'views', count(*), 'visitors', count(distinct vid)) x
        from dh_page_views where created_at >= since group by date_trunc('day', created_at)) t), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('path', path, 'views', count(*), 'visitors', count(distinct vid)) x
        from dh_page_views where created_at >= since group by path order by count(*) desc limit 25) t), '[]'::jsonb),
    'referrers', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('ref', coalesce(nullif(ref,''),'مباشر'), 'views', count(*)) x
        from dh_page_views where created_at >= since group by 1 order by count(*) desc limit 15) t), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('device', coalesce(device,'?'), 'views', count(*)) x
        from dh_page_views where created_at >= since group by 1 order by count(*) desc) t), '[]'::jsonb),
    'languages', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('lang', coalesce(lang,'?'), 'views', count(*)) x
        from dh_page_views where created_at >= since group by 1 order by count(*) desc limit 8) t), '[]'::jsonb),
    'hours', coalesce((select jsonb_agg(x order by (x->>'h')::int) from (
        select jsonb_build_object('h', extract(hour from created_at at time zone 'Asia/Riyadh')::int, 'views', count(*)) x
        from dh_page_views where created_at >= since group by 1) t), '[]'::jsonb),
    'users_total', (select count(*) from auth.users),
    'users_recent', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('email', u.email, 'name', p.name, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at, 'confirmed', u.email_confirmed_at is not null) x
        from auth.users u left join dh_profiles p on p.id = u.id order by u.created_at desc limit 30) t), '[]'::jsonb)
  ) into r;
  return r;
end $$;
revoke all on function public.dh_report(int) from public, anon;
grant execute on function public.dh_report(int) to authenticated;

-- 5) اجعل نفسك مشرفًا: غيّر البريد ثم شغّل هذا السطر بعد إنشاء حسابك
insert into public.dh_admins(user_id) select id from auth.users where email = 'moayedsakr@gmail.com' on conflict do nothing;

-- (اختياري) حذف سجلات الزيارات الأقدم من 12 شهرًا
-- delete from public.dh_page_views where created_at < now() - interval '12 months';
