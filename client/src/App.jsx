import Home from './pages/home/home'
import Products from './pages/products/products'
import Layout from './components/layout/Layout'
import './App.css'
import { useState } from 'react'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'products' ? <Products /> : <Home />}
    </Layout>
  )
}

export default App
