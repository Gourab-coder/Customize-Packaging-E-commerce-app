import { NavLink } from 'react-router-dom'
import './Nav.css'

export default function Navbar({ onLoginClick, onLogout, user }) {
  const navLinkClass = ({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand-wrap">
          <span className="brand-kicker">Custom Packaging Studio</span>
          <span className="brand">Customize Packaging</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/customize" className={navLinkClass}>
            Customize
          </NavLink>
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin Panel
            </NavLink>
          )}
        </nav>
        {user ? (
          <div className="nav-user-area">
            <div className="nav-user-copy">
              <p className="nav-user-label">Signed in</p>
              <p className="nav-user-name">{user.name}</p>
            </div>
            <button type="button" className="nav-button nav-button-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button type="button" className="nav-button" onClick={onLoginClick}>
            Log In
          </button>
        )}
      </div>
    </header>
  )
}
