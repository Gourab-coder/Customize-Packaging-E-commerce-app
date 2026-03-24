import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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

  const summary = useMemo(() => {
    const totalOrders = orders.length
    const totalUnits = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
      0,
    )
    const totalValue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)

    return {
      totalOrders,
      totalUnits,
      totalValue,
    }
  }, [orders])

  if (!isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  return (
    <section className="orders-page">
      <section className="orders-hero">
        <div>
          <p className="orders-eyebrow">Order Tracking</p>
          <h1>My Orders</h1>
          <p className="orders-subtitle">Track recent packaging orders, review totals, and check the latest status for each request.</p>
        </div>
        <div className="orders-summary-grid">
          <article>
            <strong>{summary.totalOrders}</strong>
            <span>Total orders</span>
          </article>
          <article>
            <strong>{summary.totalUnits}</strong>
            <span>Units ordered</span>
          </article>
          <article>
            <strong>INR {summary.totalValue.toFixed(2)}</strong>
            <span>Total value</span>
          </article>
        </div>
      </section>

      {loading && <p className="orders-note">Loading your orders...</p>}
      {error && <p className="orders-note orders-note-error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <p>No orders yet. Add products and place your first order.</p>
          <Link to="/products" className="orders-link-btn">
            Browse products
          </Link>
        </div>
      )}

      {!loading &&
        !error &&
        orders.map((order) => (
          <article className="order-item-card" key={order.id}>
            <div className="order-item-head">
              <h2>Order #{order.id}</h2>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>
            <div className="order-item-meta-row">
              <p className="order-item-meta">Placed: {formatDate(order.created_at)}</p>
              <p className="order-item-total">Total: INR {Number(order.total).toFixed(2)}</p>
            </div>

            <div className="order-lines">
              {order.items.map((item) => (
                <div className="order-line" key={item.id}>
                  <div>
                    <strong>{item.product_name}</strong>
                    <p>Qty {item.quantity}</p>
                  </div>
                  <span>INR {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
    </section>
  )
}
