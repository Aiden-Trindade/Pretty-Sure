import { supabase } from "../lib/supabase";

// ---- Shape changes: the app uses camelCase, Postgres uses snake_case ----

export function callToRow(call) {
  return {
    id: call.id,
    text: call.text,
    confidence: Number(call.confidence),
    due_date: call.dueDate || null, // an empty date is "no date" in the database
    created_at: call.createdAt || new Date().toISOString(),
    outcome: call.outcome ?? null,
    kind: call.kind || "task",
    stake: Number(call.stake) || 0,
    parent_id: call.parentId || null,
  };
}

export function rowToCall(row) {
  return {
    id: row.id,
    text: row.text,
    confidence: Number(row.confidence),
    dueDate: row.due_date || "",
    createdAt: row.created_at,
    outcome: row.outcome,
    kind: row.kind,
    stake: Number(row.stake),
    parentId: row.parent_id,
  };
}

export function parlayToRow(parlay) {
  return {
    id: parlay.id,
    leg_ids: parlay.legIds,
    stake: Number(parlay.stake) || 0,
    created_at: parlay.createdAt || new Date().toISOString(),
  };
}

export function rowToParlay(row) {
  return {
    id: row.id,
    legIds: row.leg_ids,
    stake: Number(row.stake),
    createdAt: row.created_at,
  };
}

// ---- Merging this device's copy with the database ----
// Everything from both sides is kept, matched by id. When both have the same item,
// a settled call beats an open one (you may have settled it offline); otherwise the
// database copy wins. Returns the merged list and the local items the database lacks.

export function mergeById(local = [], remote = []) {
  const byId = new Map(remote.map((item) => [item.id, item]));
  const toUpload = [];

  for (const item of local) {
    const theirs = byId.get(item.id);
    const settledHereOnly =
      theirs && "outcome" in item && item.outcome !== null && theirs.outcome === null;

    if (!theirs || settledHereOnly) {
      byId.set(item.id, item);
      toUpload.push(item);
    }
  }

  const merged = [...byId.values()].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt))
  );
  return { merged, toUpload };
}

// ---- Talking to Supabase ----
// Row Level Security means these only ever see or touch the signed-in user's rows.

export async function fetchDeck() {
  const [calls, parlays] = await Promise.all([
    supabase.from("calls").select("*"),
    supabase.from("parlays").select("*"),
  ]);
  if (calls.error) throw calls.error;
  if (parlays.error) throw parlays.error;
  return {
    calls: calls.data.map(rowToCall),
    parlays: parlays.data.map(rowToParlay),
  };
}

export async function saveCalls(calls) {
  if (!supabase || calls.length === 0) return;
  const { error } = await supabase.from("calls").upsert(calls.map(callToRow));
  if (error) throw error;
}

export async function saveParlays(parlays) {
  if (!supabase || parlays.length === 0) return;
  const { error } = await supabase.from("parlays").upsert(parlays.map(parlayToRow));
  if (error) throw error;
}

// Pull the database, merge with this device, push back anything only this device had
export async function syncDeck(localCalls, localParlays) {
  const remote = await fetchDeck();
  const calls = mergeById(localCalls, remote.calls);
  const parlays = mergeById(localParlays, remote.parlays);

  // Calls first: a parlay's legs should exist before the parlay does
  await saveCalls(calls.toUpload);
  await saveParlays(parlays.toUpload);

  return { calls: calls.merged, parlays: parlays.merged };
}
