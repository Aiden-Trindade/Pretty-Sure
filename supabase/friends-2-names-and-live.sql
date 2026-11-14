-- Friends mode, part 2: show names at a table, and live updates.
-- Run once in Supabase → SQL Editor → New query.

-- 1. Members need a name to show. auth.users can't be read from the app,
--    so each member's Google name is copied in when they make or join a table.
alter table public.table_members add column name text not null default 'Player';

create or replace function public.my_display_name()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'user_metadata' ->> 'full_name', ''),
    split_part(auth.jwt() ->> 'email', '@', 1),
    'Player'
  );
$$;

create or replace function public.create_table(table_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;

  insert into tables (name) values (table_name) returning id into new_id;
  insert into table_members (table_id, user_id, role, name)
  values (new_id, auth.uid(), 'owner', my_display_name());
  return new_id;
end;
$$;

create or replace function public.join_table(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare t uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;

  select id into t from tables where invite_code = code;
  if t is null then
    raise exception 'That invite doesn''t exist';
  end if;

  insert into table_members (table_id, user_id, name)
  values (t, auth.uid(), my_display_name())
  on conflict do nothing;

  return t;
end;
$$;

-- 2. The payouts view also says which table and whether the call is still open,
--    so the bank can hold back chips sitting on open bets.
create or replace view public.table_payouts
with (security_invoker = true) as
select
  b.call_id,
  b.user_id,
  b.side,
  b.stake,
  case
    when c.outcome is null then 0
    when pool.losing = 0 then 0
    when b.side = c.outcome
      then floor(b.stake::numeric / pool.winning * pool.losing)
    else -b.stake
  end as change,
  c.table_id,
  c.outcome
from public.table_bets b
join public.table_calls c on c.id = b.call_id
cross join lateral (
  select
    coalesce(sum(stake) filter (where side = c.outcome), 0)  as winning,
    coalesce(sum(stake) filter (where side <> c.outcome), 0) as losing
  from public.table_bets where call_id = c.id
) pool;

-- 3. Live updates: tell Supabase Realtime to broadcast changes to these tables.
--    RLS still applies, so you only hear about tables you sit at.
alter publication supabase_realtime add table public.table_calls, public.table_bets, public.table_members;
