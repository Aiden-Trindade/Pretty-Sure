-- Friends mode, part 3: betting closes on the settle date.
-- Without this, someone could wait until they know how the run went, then bet.

create or replace function public.place_bet(c uuid, bet_side boolean, amount integer)
returns void
language plpgsql security definer set search_path = public
as $$
declare call_row table_calls;
begin
  select * into call_row from table_calls where id = c;
  if call_row is null then raise exception 'No such call'; end if;
  if not is_member(call_row.table_id) then raise exception 'You''re not at this table'; end if;
  if call_row.outcome is not null then raise exception 'Betting is closed'; end if;
  if call_row.due_date is not null and call_row.due_date <= current_date then
    raise exception 'Betting closed on the settle date';
  end if;
  if call_row.about = auth.uid() and bet_side = false then
    raise exception 'You can''t bet against yourself';
  end if;

  insert into table_bets (call_id, side, stake) values (c, bet_side, amount);
end;
$$;
