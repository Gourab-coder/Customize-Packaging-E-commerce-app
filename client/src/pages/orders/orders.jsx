import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './orders.css'

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default function Orders() {
  const { token, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    const loadOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.getMyOrders(token)
        setOrders(Array.isArray(response) ? response : [])
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, token])

  if (!isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  return (
    <section className="orders-page">
      <h1>My Orders</h1>
      <p className="orders-subtitle">Track your recent packaging orders.</p>

      {loading && <p className="orders-note">Loading your orders...</p>}
      {error && <p className="orders-note orders-note-error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="orders-note">No orders yet. Add products and place your first order.</p>
      )}

      {!loading &&
        !error &&
        orders.map((order) => (
          <article className="order-item-card" key={order.id}>
            <div className="order-item-head">
              <h2>Order #{order.id}</h2>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>
            <p className="order-item-meta">Placed: {formatDate(order.created_at)}</p>
            <p className="order-item-total">Total: INR {Number(order.total).toFixed(2)}</p>

            <div className="order-lines">
              {order.items.map((item) => (
                <div className="order-line" key={item.id}>
                  <span>{item.product_name}</span>
                  <span>
                    Qty {item.quantity} x INR {Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
    </section>
  )
}
