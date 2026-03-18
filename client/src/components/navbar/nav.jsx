import { NavLink } from 'react-router-dom'
import './Nav.css'

export default function Navbar({ onLoginClick, onLogout, user }) {
  const navLinkClass = ({ isActive }) =>
    `nav-link-btn ${isActive ? 'active' : ''}`

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">Customize Packaging</div>
        <nav className="nav-links">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/customize" className={navLinkClass}>
            Customize
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
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
            <p className="nav-user-name">{user.name}</p>
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
