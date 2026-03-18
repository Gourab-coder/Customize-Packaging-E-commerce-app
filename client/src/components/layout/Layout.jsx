import Navbar from '../navbar/nav'
import Footer from '../footer/Footer'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import SignCard from '../sign/SignCard'
import { useAuth } from '../../context/AuthContext'
import './Layout.css'

function Layout() {
  const [isSignOpen, setIsSignOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <div className="app-bg-glow app-bg-glow-left" />
      <div className="app-bg-glow app-bg-glow-right" />
      <Navbar onLoginClick={() => setIsSignOpen(true)} onLogout={logout} user={user} />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <SignCard isOpen={isSignOpen} onClose={() => setIsSignOpen(false)} />
    </div>
  )
}

export default Layout
