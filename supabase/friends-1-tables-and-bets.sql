-- Friends mode, part 1: tables of friends, shared calls and pool bets.
-- Already run in Supabase. Kept here as a record of the database.

create table public.tables (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 40),
  created_by  uuid not null default auth.uid() references auth.users on delete cascade,
  invite_code text not null unique default encode(extensions.gen_random_bytes(6), 'hex'),
  created_at  timestamptz not null default now()
);

create table public.table_members (
  table_id   uuid not null references public.tables on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  role       text not null default 'player' check (role in ('owner', 'player')),
  joined_at  timestamptz not null default now(),
  primary key (table_id, user_id)
);

alter table public.tables enable row level security;
alter table public.table_members enable row level security;

-- Runs without RLS, so a rule on table_members can use it without looping forever
create function public.is_member(t uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.table_members
    where table_id = t and user_id = auth.uid()
  );
$$;

create policy "members see their tables" on public.tables
for select using (public.is_member(id));

create policy "members see each other" on public.table_members
for select using (public.is_member(table_id));

create function public.create_table(table_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid;
begin
  insert into tables (name) values (table_name) returning id into new_id;
  insert into table_members (table_id, user_id, role)
  values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

create function public.join_table(code text)
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

  insert into table_members (table_id, user_id)
  values (t, auth.uid())
  on conflict do nothing;

  return t;
end;
$$;

create table public.table_calls (
  id          uuid primary key default gen_random_uuid(),
  table_id    uuid not null references public.tables on delete cascade,
  text        text not null check (char_length(text) between 1 and 200),
  about       uuid not null references auth.users on delete cascade,
  created_by  uuid not null default auth.uid() references auth.users on delete cascade,
  due_date    date,
  outcome     boolean,
  created_at  timestamptz not null default now()
);

create table public.table_bets (
  call_id    uuid not null references public.table_calls on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  side       boolean not null,
  stake      integer not null check (stake > 0),
  placed_at  timestamptz not null default now(),
  primary key (call_id, user_id)
);

alter table public.table_calls enable row level security;
alter table public.table_bets enable row level security;

create policy "members see table calls" on public.table_calls
for select using (public.is_member(table_id));

create policy "members see table bets" on public.table_bets
for select using (
  exists (select 1 from public.table_calls c
          where c.id = call_id and public.is_member(c.table_id))
);

create function public.create_table_call(t uuid, call_text text, about_user uuid, due date)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare new_id uuid;
begin
  if not is_member(t) then raise exception 'You''re not at this table'; end if;
  if not exists (select 1 from table_members where table_id = t and user_id = about_user) then
    raise exception 'They''re not at this table';
  end if;

  insert into table_calls (table_id, text, about, due_date)
  values (t, call_text, about_user, due)
  returning id into new_id;
  return new_id;
end;
$$;

create function public.place_bet(c uuid, bet_side boolean, amount integer)
returns void
language plpgsql security definer set search_path = public
as $$
declare call_row table_calls;
begin
  select * into call_row from table_calls where id = c;
  if call_row is null then raise exception 'No such call'; end if;
  if not is_member(call_row.table_id) then raise exception 'You''re not at this table'; end if;
  if call_row.outcome is not null then raise exception 'Betting is closed'; end if;
  if call_row.about = auth.uid() and bet_side = false then
    raise exception 'You can''t bet against yourself';
  end if;

  insert into table_bets (call_id, side, stake) values (c, bet_side, amount);
end;
$$;

create function public.settle_table_call(c uuid, result boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update table_calls set outcome = result
  where id = c and created_by = auth.uid() and outcome is null;
  if not found then raise exception 'Only the caller can settle an open call'; end if;
end;
$$;

create view public.table_payouts
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
  end as change
from public.table_bets b
join public.table_calls c on c.id = b.call_id
cross join lateral (
  select
    coalesce(sum(stake) filter (where side = c.outcome), 0)  as winning,
    coalesce(sum(stake) filter (where side <> c.outcome), 0) as losing
  from public.table_bets where call_id = c.id
) pool;
