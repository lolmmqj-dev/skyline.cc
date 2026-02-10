-- Enable UID changes safely (run once)

-- Update FK constraints to allow UID updates
alter table public.keys
  drop constraint if exists keys_used_by_fkey;
alter table public.keys
  add constraint keys_used_by_fkey
  foreign key (used_by) references public.users(uid)
  on delete set null on update cascade;

alter table public.sessions
  drop constraint if exists sessions_user_uid_fkey;
alter table public.sessions
  add constraint sessions_user_uid_fkey
  foreign key (user_uid) references public.users(uid)
  on delete cascade on update cascade;

alter table public.orders
  drop constraint if exists orders_user_uid_fkey;
alter table public.orders
  add constraint orders_user_uid_fkey
  foreign key (user_uid) references public.users(uid)
  on delete set null on update cascade;

-- Ensure public_users stays in sync if UID changes
create or replace function public.sync_public_users()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.public_users (uid, username, created_at)
    values (new.uid, new.username, new.created_at);
    return new;
  elsif (tg_op = 'UPDATE') then
    if (old.uid <> new.uid) then
      update public.public_users
      set uid = new.uid, username = new.username
      where uid = old.uid;
    else
      update public.public_users
      set username = new.username
      where uid = new.uid;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    delete from public.public_users where uid = old.uid;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

-- Admin function to change UID
create or replace function public.admin_change_uid(old_uid bigint, new_uid bigint)
returns void as $$
begin
  if old_uid = new_uid then
    return;
  end if;
  if not exists (select 1 from public.users where uid = old_uid) then
    raise exception 'Old UID not found';
  end if;
  if exists (select 1 from public.users where uid = new_uid) then
    raise exception 'New UID already exists';
  end if;

  update public.users set uid = new_uid where uid = old_uid;

  perform setval('public.users_uid_seq', (select max(uid) from public.users), true);
end;
$$ language plpgsql;
