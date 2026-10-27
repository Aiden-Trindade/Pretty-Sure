import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">Pretty Sure</Link>
      <div className="nav-links">
        <Link to="/new">New call</Link>
        <Link to="/stats">Stats</Link>
      </div>
    </nav>
  )
}
