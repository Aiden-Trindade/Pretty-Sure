import { supabase } from "../lib/supabase";

// Database errors are written for developers ("duplicate key value violates
// unique constraint..."). This turns them into something a person can act on.
export function friendlyError(error) {
  const message = error?.message ?? "";

  if (!navigator.onLine || /failed to fetch|network/i.test(message)) {
    return "You're offline. Try again when you have signal.";
  }
  switch (error?.code) {
    case "23505": // unique: the primary key (call, you) already exists
      return "You've already got a bet on this one.";
    case "23514": // a check failed: empty or too long
      return "That's empty or too long. Keep it short.";
    case "P0001": // raised by our own functions, already written for people
      return message;
    case "PGRST301":
    case "42501":
      return "Your sign-in ran out. Sign out and back in.";
  }
  return "Something went wrong on our side. Try again in a moment.";
}

// Every Supabase call returns { data, error }: hand back the data, or throw a
// readable error (the original stays on .cause for the console)
function unwrap({ data, error }) {
  if (error) {
    console.warn("Supabase:", error);
    throw new Error(friendlyError(error), { cause: error });
  }
  return data;
}

// ---- Tables: the groups of friends ----

// RLS already filters this to tables you sit at, so there's no "where"
export async function myTables() {
  return unwrap(
    await supabase.from("tables").select("*").order("created_at")
  );
}

// Parameter names must match the SQL function's: table_name, code, and so on
export async function createTable(name) {
  return unwrap(await supabase.rpc("create_table", { table_name: name }));
}

export async function joinTable(code) {
  return unwrap(await supabase.rpc("join_table", { code }));
}

export function inviteLink(table) {
  return `${window.location.origin}/join/${table.invite_code}`;
}

// Everything one table's page needs, in one go
export async function tableDetails(id) {
  const [table, members, calls, bets] = await Promise.all([
    supabase.from("tables").select("*").eq("id", id).maybeSingle(),
    supabase.from("table_members").select("*").eq("table_id", id).order("joined_at"),
    supabase
      .from("table_calls")
      .select("*")
      .eq("table_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("table_payouts").select("*").eq("table_id", id),
  ]);

  return {
    table: unwrap(table), // null if it doesn't exist or you're not at it
    members: unwrap(members),
    calls: unwrap(calls),
    bets: unwrap(bets),
  };
}

// ---- Shared calls and bets ----

export async function createTableCall(tableId, text, aboutUser, dueDate) {
  return unwrap(
    await supabase.rpc("create_table_call", {
      t: tableId,
      call_text: text,
      about_user: aboutUser,
      due: dueDate || null,
    })
  );
}

export async function placeBet(callId, side, amount) {
  return unwrap(
    await supabase.rpc("place_bet", { c: callId, bet_side: side, amount })
  );
}

export async function settleTableCall(callId, result) {
  return unwrap(
    await supabase.rpc("settle_table_call", { c: callId, result })
  );
}

// ---- Pools and the bank ----

// The two sides of one call's pot
export function getPools(bets) {
  let forPool = 0;
  let againstPool = 0;
  for (const bet of bets) {
    if (bet.side) forPool += bet.stake;
    else againstPool += bet.stake;
  }
  return { forPool, againstPool };
}

// How your bank changes from tables: won or lost on settled calls,
// minus chips sitting on calls that haven't settled yet
export function getTablesChange(myBets) {
  let change = 0;
  for (const bet of myBets) {
    change += bet.outcome === null ? -bet.stake : bet.change;
  }
  return change;
}

export async function myBets(userId) {
  return unwrap(
    await supabase.from("table_payouts").select("*").eq("user_id", userId)
  );
}

// Live updates: run onChange whenever a call, bet or member changes.
// Returns a function that stops listening (for useEffect's cleanup).
export function listenToTables(name, onChange) {
  const channel = supabase
    .channel(name)
    .on("postgres_changes", { event: "*", schema: "public", table: "table_calls" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "table_bets" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "table_members" }, onChange)
    .subscribe();

  return () => supabase.removeChannel(channel);
}
