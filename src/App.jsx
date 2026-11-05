import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import StyleGuide from "./pages/StyleGuide";
import { getBalance } from "./utils/points";

// Page imports
import Home from "./pages/Home";
import NewCall from "./pages/NewCall";
import Call from "./pages/Call";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";

const STORAGE_KEY = "pretty_sure_calls";

function loadCalls() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load calls from localStorage:", error);
    return [];
  }
}

export default function App() {
  // Pass loadCalls as an initializer function so it only runs once at startup
  const [calls, setCalls] = useState(loadCalls);

  // Sync calls to localStorage whenever the calls array updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
    } catch (error) {
      console.error("Failed to save calls to localStorage:", error);
    }
  }, [calls]);

  const balance = getBalance(calls)

  function addCall(call) {
    setCalls((prev) => [...prev, call]);
  }

  function settleCall(id, outcome) {
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, outcome } : c))
    );
  }

  return (
    <>
      <Navbar balance={balance} />

      <main className="container">
        <Routes>
          <Route path="/style" element={<StyleGuide />} />
          <Route path="/" element={<Home calls={calls} />} />
          <Route path="/new" element={<NewCall onAdd={addCall} balance={balance} />} />
          <Route
            path="/p/:id"
            element={<Call calls={calls} onSettle={settleCall} />}
          />
          <Route path="/stats" element={<Stats calls={calls} balance={balance} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}