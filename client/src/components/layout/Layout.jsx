import Navbar from '../navbar/nav'
import Footer from '../footer/Footer'
import './Layout.css'

function Layout({ children, currentPage, onNavigate }) {
  return (
    <div className="app-shell">
      <div className="app-bg-glow app-bg-glow-left" />
      <div className="app-bg-glow app-bg-glow-right" />
      <Navbar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
