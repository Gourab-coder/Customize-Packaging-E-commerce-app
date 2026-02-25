import './Nav.css'

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">Customize Packaging</div>
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={`nav-link-btn ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => onNavigate('products')}
          >
            Products
          </button>
          <button type="button" className="nav-link-btn">
            Customize
          </button>
          <button type="button" className="nav-link-btn">
            Contact
          </button>
        </nav>
        <button type="button" className="nav-button">
          Log In
        </button>
      </div>
    </header>
  )
}
