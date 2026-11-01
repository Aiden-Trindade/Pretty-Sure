import { Routes, Route } from 'react-router-dom'
import { useState } from "react";
import Navbar from "./components/Navbar";
import StyleGuide from './pages/StyleGuide.jsx'
import Home from './pages/Home.jsx'
import Call from './pages/Call.jsx'
import NewCall from './pages/NewCall.jsx'
import Stats from './pages/Stats.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {

  const [calls, setCalls] = useState([]);

  function addCall(call) {
    setCalls((prev) => [...prev, call]);
  }

  return (
  <>
    <Navbar />

    <main className="container">
      <Routes>
        <Route path="/new" element={<NewCall onAdd={addCall} />} />
        <Route path="/style" element={<StyleGuide />} />
        <Route path="/" element={<Home />} />
        <Route path="/p/:id" element={<Call />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  </>
  )
}

