import { Link, NavLink } from "react-router-dom";

const CARDS = [
  { to: "/", label: "Calls", suit: "♥", color: "red" },
  { to: "/new", label: "New", suit: "♠", color: "black" },
  { to: "/parlays", label: "Parlays", suit: "♦", color: "red" },
  { to: "/stats", label: "Stats", suit: "♣", color: "black" },
];

export default function Navbar({ balance = 0 }) {
  return (
    <nav className="navbar">
      {/* 1. Title / Logo */}
      <Link to="/" className="title">
        <span className="logo-card">
          <span>PS</span>
          <span>♠</span>
        </span>
        Pretty Sure
      </Link>

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