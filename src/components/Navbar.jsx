import { Link, NavLink } from "react-router-dom";

export default function Navbar({ balance }) {
  return (
    <nav className="navbar">
      <Link to="/" className="title">
        Pretty Sure
      </Link>

      <span className = "balance">{balance}</span>

      <div className="nav-links">
        <NavLink to="/new" className="label">
          New call
        </NavLink>
        <NavLink to="/stats" className="label">
          Stats
        </NavLink>
      </div>
    </nav>
  );
}