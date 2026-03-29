import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './admin.css'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  images: [],
}

export default function Admin() {
  const { user, token, isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [consultationRequests, setConsultationRequests] = useState([])
  const [quotationRequests, setQuotationRequests] = useState([])
  const [productForm, setProductForm] = useState(emptyForm)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [statusDrafts, setStatusDrafts] = useState({})

  const isAdmin = isAuthenticated && user?.role === 'admin'

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [productsRes, categoriesRes, ordersRes, consultationsRes, quotationsRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getAllOrders(token),
        api.getConsultationRequests(token),
        api.getQuotationRequests(token),
      ])
      setProducts(Array.isArray(productsRes) ? productsRes : [])
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : [])
      setOrders(Array.isArray(ordersRes) ? ordersRes : [])
      setConsultationRequests(Array.isArray(consultationsRes) ? consultationsRes : [])
      setQuotationRequests(Array.isArray(quotationsRes) ? quotationsRes : [])
      setStatusDrafts(
        Object.fromEntries(
          (Array.isArray(ordersRes) ? ordersRes : []).map((order) => [order.id, order.status]),
        ),
      )
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin, token])

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    [categories],
  )

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <article className="admin-card">
          <h1>Admin Access Required</h1>
          <p>Only admin accounts can open this panel.</p>
        </article>
      </section>
    )
  }

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await api.createCategory(token, {
        name: categoryName,
        description: categoryDescription,
      })
      setCategoryName('')
      setCategoryDescription('')
      setMessage('Category created successfully.')
      await loadData()
    } catch (apiError) {
      setError(apiError.message)
    }
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('name', productForm.name)
      formData.append('description', productForm.description)
      formData.append('price', String(Number(productForm.price)))
      formData.append('stock', String(Number(productForm.stock)))
      formData.append('category_id', String(Number(productForm.category_id)))

      Array.from(productForm.images).forEach((file) => {
        formData.append('images', file)
      })

      await api.createProduct(token, formData)

      setProductForm(emptyForm)
      setMessage('Product created successfully.')
      await loadData()
    } catch (apiError) {
      setError(apiError.message)
    }
  }

  const handleDeleteProduct = async (productId) => {
    setError('')
    setMessage('')
    try {
      await api.deleteProduct(token, productId)
      setMessage('Product deleted successfully.')
      await loadData()
    } catch (apiError) {
      setError(apiError.message)
    }
  }

  const handleOrderStatusChange = (orderId, value) => {
    setStatusDrafts((prev) => ({
      ...prev,
      [orderId]: value,
    }))
  }

  const handleUpdateOrderStatus = async (orderId) => {
    setError('')
    setMessage('')
    try {
      await api.updateOrderStatus(token, orderId, statusDrafts[orderId] || 'pending')
      setMessage('Order status updated successfully.')
      await loadData()
    } catch (apiError) {
      setError(apiError.message)
    }
  }

  return (
    <section className="admin-page">
      <h1>Admin Panel</h1>
      <p className="admin-subtitle">Manage products and review consultation or quotation requests.</p>

      {loading && <p className="admin-note">Loading admin data...</p>}
      {message && <p className="admin-note admin-note-success">{message}</p>}
      {error && <p className="admin-note admin-note-error">{error}</p>}

      <div className="admin-grid">
        <article className="admin-card">
          <h2>Create Category</h2>
          <form className="admin-form" onSubmit={handleCreateCategory}>
            <label>
              Category Name
              <input
                type="text"
                required
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
              />
            </label>
            <button type="submit">Create Category</button>
          </form>
        </article>

        <article className="admin-card">
          <h2>Add Product</h2>
          <form className="admin-form" onSubmit={handleCreateProduct}>
            <label>
              Product Name
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <div className="admin-two-col">
              <label>
                Price
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  required
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, stock: event.target.value }))
                  }
                />
              </label>
            </div>
            <label>
              Category
              <select
                required
                value={productForm.category_id}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, category_id: event.target.value }))
                }
              >
                <option value="" disabled>
                  Select category
                </option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, images: event.target.files || [] }))
                }
              />
            </label>
            <button type="submit">Create Product</button>
          </form>
        </article>
      </div>

      <article className="admin-card admin-products-list">
        <h2>Existing Products</h2>
        {products.length === 0 ? (
          <p className="admin-empty">No products available.</p>
        ) : (
          <div className="admin-product-table">
            <div className="admin-product-header">
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Action</span>
            </div>
            {products.map((product) => (
              <div className="admin-product-row" key={product.id}>
                <span>{product.name}</span>
                <span>{product.category_name || 'N/A'}</span>
                <span>INR {Number(product.price).toFixed(2)}</span>
                <span>{product.stock}</span>
                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="admin-card admin-orders-list">
        <h2>All Orders</h2>
        {orders.length === 0 ? (
          <p className="admin-empty">No orders available.</p>
        ) : (
          <div className="admin-orders-stack">
            {orders.map((order) => (
              <div className="admin-order-card" key={order.id}>
                <div className="admin-order-top">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <p>
                      {order.customer_name} ({order.customer_email})
                    </p>
                  </div>
                  <div className="admin-order-meta">
                    <span>Total: INR {Number(order.total).toFixed(2)}</span>
                    <span>Status: {order.status}</span>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="admin-order-items">
                  {order.items.map((item) => (
                    <div className="admin-order-item" key={item.id}>
                      <span>{item.product_name || `Product #${item.product_id}`}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Price: INR {Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="admin-order-actions">
                  <select
                    value={statusDrafts[order.id] || order.status}
                    onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="shipped">Shipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button type="button" onClick={() => handleUpdateOrderStatus(order.id)}>
                    Mark Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="admin-card admin-request-list">
        <h2>Consultation Calls</h2>
        {consultationRequests.length === 0 ? (
          <p className="admin-empty">No consultation requests yet.</p>
        ) : (
          <div className="admin-request-table">
            <div className="admin-request-header admin-request-consultation">
              <span>Name</span>
              <span>Contact</span>
              <span>Call Time</span>
              <span>Product Type</span>
              <span>Details</span>
              <span>Created</span>
            </div>
            {consultationRequests.map((request) => (
              <div className="admin-request-row admin-request-consultation" key={request.id}>
                <span>{request.name}</span>
                <span>{request.contact_number}</span>
                <span>{request.preferred_call_time}</span>
                <span>{request.product_type}</span>
                <span>{request.product_details}</span>
                <span>{new Date(request.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="admin-card admin-request-list">
        <h2>Quotation Requests</h2>
        {quotationRequests.length === 0 ? (
          <p className="admin-empty">No quotation requests yet.</p>
        ) : (
          <div className="admin-request-table">
            <div className="admin-request-header admin-request-quotation">
              <span>Name</span>
              <span>WhatsApp</span>
              <span>Drive Link</span>
              <span>Product Type</span>
              <span>Description</span>
              <span>Created</span>
            </div>
            {quotationRequests.map((request) => (
              <div className="admin-request-row admin-request-quotation" key={request.id}>
                <span>{request.name}</span>
                <span>{request.whatsapp_number}</span>
                <span>
                  <a href={request.drive_link} target="_blank" rel="noreferrer">
                    Open Link
                  </a>
                </span>
                <span>{request.product_type}</span>
                <span>{request.product_description}</span>
                <span>{new Date(request.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
