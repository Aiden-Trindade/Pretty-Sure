import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase";

const CARDS = [
  { to: "/", label: "Calls", suit: "♥", color: "red" },
  { to: "/new", label: "New", suit: "♠", color: "black" },
  { to: "/parlays", label: "Parlays", suit: "♦", color: "red" },
  { to: "/stats", label: "Stats", suit: "♣", color: "black" },
];

const DEVICE_KEY = "pretty_sure_device";

// One random ID per device, kept so the same device is never counted twice
function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked: skip the counter rather than break the header
  }
}

export default function Navbar({ balance = 0 }) {
  const [player, setPlayer] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Easter egg: join the player count once, and learn this device's number
  useEffect(() => {
    const deviceId = getDeviceId();
    if (!supabase || !deviceId) return;

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.rpc("join_players", {
        device_id: deviceId,
      });
      if (cancelled) return;
      if (error) {
        console.warn("Player count unavailable:", error.message);
        return;
      }
      if (data?.[0]) setPlayer(data[0]);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav className="navbar">
      {/* 1. Logo card (tap it for the easter egg) and the name, which goes home */}
      <div className="brand">
        <button
          type="button"
          className={`logo-card${revealed ? " flipped" : ""}`}
          aria-pressed={revealed}
          aria-label={
            revealed && player
              ? `Player ${player.player_number} of ${player.total}`
              : "Pretty Sure"
          }
          onClick={() => setRevealed((r) => !r)}
        >
          <span className="logo-inner">
            <span className="logo-face logo-front" aria-hidden="true">
              <span>PS</span>
              <span>♠</span>
            </span>

            {/* The back: your player number, or a plain card back until it loads */}
            <span className="logo-face logo-back" aria-hidden="true">
              {player ? (
                <>
                  <span className="player-no">
                    <small>No.</small>
                    {player.player_number}
                  </span>
                  <span className="player-of">of {player.total}</span>
                </>
              ) : (
                <span className="back-pip">♠</span>
              )}
            </span>
          </span>
        </button>

        <Link to="/" className="title">
          Pretty Sure
        </Link>
      </div>

      {/* 2. Hand of Cards Nav */}
      <div className="hand">
        {CARDS.map((card) => (
          <NavLink
            key={card.to}
            to={card.to}
            end={card.to === "/"}
            className={({ isActive }) =>
              `nav-card${isActive ? " active" : ""}`
            }
          >
            <span className={card.color}>{card.suit}</span>
            <span className="nav-name">{card.label}</span>
          </NavLink>
        ))}
      </div>

      {/* 3. Balance Display */}
      <span className="bank">
        <span className="chip" />
        <span className="balance">{balance}</span>
      </span>
    </nav>
  );
}
