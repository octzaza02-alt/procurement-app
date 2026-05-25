-- ================================================
-- PROCUREMENT APP — Database Schema
-- วิธีใช้: คัดลอกทั้งหมด วางใน Supabase → SQL Editor → Run
-- ================================================

-- ---- TABLES ----

create table public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  pin_hash   text not null,
  role       text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

create table public.catalog (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  unit        text not null default 'ชิ้น',
  order_count int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  product_name      text not null,
  quantity          int  not null check (quantity > 0),
  unit              text not null default 'ชิ้น',
  note              text,
  status            text not null default 'pending' check (status in ('pending','delivered')),
  requester_id      uuid not null references public.users(id) on delete cascade,
  requester_name    text not null,
  delivered_at      timestamptz,
  delivered_by_name text,
  created_at        timestamptz not null default now()
);

-- ---- INDEXES ----

create index on public.orders(status);
create index on public.orders(requester_id);
create index on public.orders(created_at desc);

-- ---- FUNCTION: upsert catalog on order ----

create or replace function upsert_catalog(p_name text, p_unit text)
returns void language plpgsql as $$
begin
  insert into public.catalog(name, unit, order_count)
  values (p_name, p_unit, 1)
  on conflict (name) do update
    set unit        = excluded.unit,
        order_count = catalog.order_count + 1;
end;
$$;

-- ---- SEED: ผู้ใช้เริ่มต้น ----
-- PIN ที่ใช้ด้านล่างนี้คือ bcrypt hash ของ 0000, 1111, 2222
-- (สร้างโดย bcryptjs rounds=10)

insert into public.users (name, pin_hash, role) values
  ('แอดมิน',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'admin'),
  ('พนักงาน A',
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'user'),
  ('พนักงาน B',
   '$2b$10$X4kv7j5ZcG39WgOSW3GkrujBBQFDEtMCa2lq8.VGTBJSvQMOHiRKi',
   'user');

-- ---- SEED: สินค้าตัวอย่าง ----

insert into public.catalog (name, unit) values
  ('กระดาษ A4',        'ริม'),
  ('ปากกาลูกลื่น',      'กล่อง'),
  ('แฟ้มเอกสาร',        'อัน'),
  ('คลิปหนีบกระดาษ',   'กล่อง'),
  ('กาว UHU',          'หลอด');
