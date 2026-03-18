import Home from './pages/home/home'
import Products from './pages/products/products'
import Customize from './pages/customize/customize'
import About from './pages/about/about'
import Orders from './pages/orders/orders'
import Admin from './pages/admin/admin'
import Layout from './components/layout/Layout'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="customize" element={<Customize />} />
        <Route path="about" element={<About />} />
        <Route path="orders" element={<Orders />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
