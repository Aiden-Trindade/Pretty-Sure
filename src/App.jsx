import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import StyleGuide from "./pages/StyleGuide";
import { getBalance } from "./utils/points";
import { getParlaysChange } from "./utils/parlays";
import { supabase } from "./lib/supabase";
import { syncDeck, saveCalls, saveParlays } from "./utils/sync";
import { myBets, getTablesChange } from "./utils/tables";

// Page imports
import Home from "./pages/Home";
import NewCall from "./pages/NewCall";
import Call from "./pages/Call";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import Parlays from "./pages/Parlays";
import Privacy from "./pages/Privacy";
import Tables from "./pages/Tables";
import Table from "./pages/Table";
import Join from "./pages/Join";

const STORAGE_KEY = "pretty_sure_calls";
const PARLAYS_KEY = "pretty_sure_parlays";

function loadCalls() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load calls from localStorage:", error);
    return [];
  }
}

function loadParlays() {
  try {
    const saved = localStorage.getItem(PARLAYS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load parlays from localStorage:", error);
    return [];
  }
}

export default function App() {
  // Pass loadCalls as an initializer function so it only runs once at startup
  const [calls, setCalls] = useState(loadCalls);
  const [parlays, setParlays] = useState(loadParlays);

  // Who's signed in (null when signed out) and how syncing is going
  const [session, setSession] = useState(null);
  const [syncState, setSyncState] = useState("off"); // off | syncing | synced | error
  const [onlineTick, setOnlineTick] = useState(0);
  const userId = session?.user?.id;

  // Chips won, lost or riding on bets at friends' tables
  const [tablesChange, setTablesChange] = useState(0);
  const refreshBank = useCallback(() => {
    if (!userId) return;
    myBets(userId)
      .then((bets) => setTablesChange(getTablesChange(bets)))
      .catch((error) => console.warn("Couldn't load table bets:", error.message));
  }, [userId]);

  // ...and again whenever you come back to the app, in case a friend settled a call
  useEffect(() => {
    refreshBank();
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshBank();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId, refreshBank]);

  // The sync effect needs the latest deck without re-running on every change
  const deckRef = useRef({ calls, parlays });
  useEffect(() => {
    deckRef.current = { calls, parlays };
  }, [calls, parlays]);

  // Follow sign-in and sign-out, including the return trip from Google
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) =>
      setSession(newSession)
    );
    return () => data.subscription.unsubscribe();
  }, []);

  // Coming back online is a good moment to sync anything changed offline
  useEffect(() => {
    const onOnline = () => setOnlineTick((t) => t + 1);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  // Once signed in: merge this device with the database, both ways
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function sync() {
      setSyncState("syncing");
      try {
        const deck = await syncDeck(deckRef.current.calls, deckRef.current.parlays);
        if (cancelled) return;
        setCalls(deck.calls);
        setParlays(deck.parlays);
        setSyncState("synced");
      } catch (error) {
        if (cancelled) return;
        console.warn("Sync failed, keeping this device's copy:", error.message);
        setSyncState("error");
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [userId, onlineTick]);

  // Save one change to the database; if it fails, the next sync catches it up
  function push(save) {
    if (!userId) return;
    save().catch((error) => {
      console.warn("Couldn't save to the cloud yet:", error.message);
      setSyncState("error");
    });
  }

  function signIn() {
    supabase?.auth.signInWithOAuth({
      provider: "google",
      // Come back to the same page, so an invite link still works after sign-in
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  }

  function signOut() {
    // Your calls stay on this device; they're also safe in your account
    supabase?.auth.signOut();
    setSyncState("off");
  }

  const account = {
    available: Boolean(supabase),
    user: session?.user ?? null,
    syncState,
    onSignIn: signIn,
    onSignOut: signOut,
  };

  // Sync calls to localStorage whenever the calls array updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
    } catch (error) {
      console.error("Failed to save calls to localStorage:", error);
    }
  }, [calls]);

  useEffect(() => {
    try {
      localStorage.setItem(PARLAYS_KEY, JSON.stringify(parlays));
    } catch (error) {
      console.error("Failed to save parlays to localStorage:", error);
    }
  }, [parlays]);

  const balance =
    getBalance(calls) +
    getParlaysChange(parlays, calls) +
    (userId ? tablesChange : 0); // signed out: only this device's calls count

  function addCall(call) {
    setCalls((prev) => [...prev, call]);
    push(() => saveCalls([call]));
  }

  function settleCall(id, outcome) {
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, outcome } : c))
    );
    const call = calls.find((c) => c.id === id);
    if (call) push(() => saveCalls([{ ...call, outcome }]));
  }

  function addParlay(parlay) {
    setParlays((prev) => [...prev, parlay]);
    push(() => saveParlays([parlay]));
  }

  return (
    <>
      <Navbar balance={balance} />

      <main className="container">
        <Routes>
          <Route path="/style" element={<StyleGuide />} />
          <Route path="/" element={<Home calls={calls} account={account} />} />
          <Route path="/new" element={<NewCall onAdd={addCall} balance={balance} calls={calls} />} />
          <Route
            path="/p/:id"
            element={<Call calls={calls} onSettle={settleCall} balance={balance} />}
          />

          <Route
            path="/parlays"
            element={
              <Parlays
                calls={calls}
                parlays={parlays}
                balance={balance}
                onAdd={addParlay}
              />
            }
          />
          
          <Route path="/stats" element={<Stats calls={calls} balance={balance} />} />
          <Route path="/tables" element={<Tables account={account} />} />
          <Route
            path="/t/:id"
            element={<Table account={account} balance={balance} onBank={refreshBank} />}
          />
          <Route path="/join/:code" element={<Join account={account} />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}