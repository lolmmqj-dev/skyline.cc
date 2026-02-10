-- Skyline Supabase schema

create table if not exists public.users (
  uid bigserial primary key,
  email text not null unique,
  username text not null,
  password_hash text not null,
  avatar_url text,
  hwid text,
  subscription_status text not null default 'inactive',
  subscription_expires timestamptz,
  is_banned boolean not null default false,
  ban_reason text,
  created_at timestamptz not null default now(),
  last_ip text
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_created_idx on public.users (created_at desc);

create table if not exists public.ip_bans (
  id bigserial primary key,
  ip text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.keys (
  id bigserial primary key,
  code text not null unique,
  duration_days integer not null,
  created_at timestamptz not null default now(),
  used_by bigint references public.users(uid) on delete set null,
  used_at timestamptz
);

create table if not exists public.sessions (
  id bigserial primary key,
  user_uid bigint not null references public.users(uid) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.orders (
  id bigserial primary key,
  order_id text not null,
  user_uid bigint references public.users(uid) on delete set null,
  plan_id text not null,
  status text not null,
  amount text,
  created_at timestamptz not null default now()
);

create table if not exists public.public_users (
  uid bigint primary key,
  username text not null,
  created_at timestamptz not null default now()
);

create or replace function public.sync_public_users()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.public_users (uid, username, created_at)
    values (new.uid, new.username, new.created_at);
    return new;
  elsif (tg_op = 'UPDATE') then
    update public.public_users
    set username = new.username
    where uid = new.uid;
    return new;
  elsif (tg_op = 'DELETE') then
    delete from public.public_users where uid = old.uid;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists users_public_sync on public.users;
create trigger users_public_sync
after insert or update or delete on public.users
for each row execute function public.sync_public_users();

alter table public.public_users enable row level security;
create policy "Public read" on public.public_users
for select using (true);
