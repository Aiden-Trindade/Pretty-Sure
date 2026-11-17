-- The player counter also keeps the browser's user-agent text, so a new row
-- can be told apart: a phone's browser, or a robot like Vercel's preview.

alter table public.players add column if not exists user_agent text;

-- Same function as before, with one optional extra. Old versions of the app
-- still call it with just device_id, and the default covers them.
drop function if exists public.join_players(uuid);

-- Robots are not players: a user-agent that looks like one is not stored, and
-- gets no player number back. Keep this pattern in step with isRobot() in
-- src/components/Navbar.jsx. Re-runnable.
create or replace function public.join_players(device_id uuid, agent text default null)
returns table (player_number bigint, total bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if agent ~* 'bot|crawl|spider|headless|vercel|lighthouse|preview' then
    return query select null::bigint, (select count(*) from players);
    return;
  end if;

  insert into players (id, user_agent)
  values (device_id, left(agent, 300))
  on conflict (id) do nothing;

  return query
    select
      (select count(*) from players p where p.joined_at <= me.joined_at),
      (select count(*) from players)
    from players me
    where me.id = device_id;
end;
$$;

grant execute on function public.join_players(uuid, text) to anon, authenticated;
