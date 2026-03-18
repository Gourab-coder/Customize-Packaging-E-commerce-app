import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../../components/product_card/product_card'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './products.css'

const Products = () => {
  const { token, isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedItems, setSelectedItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ])
        setProducts(Array.isArray(productsRes) ? productsRes : [])
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : [])
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const productsByCategory = useMemo(() => {
    const grouped = {}

    categories.forEach((category) => {
      grouped[category.id] = {
        name: category.name,
        products: [],
      }
    })

    products.forEach((product) => {
      const categoryKey = product.category_id || 'uncategorized'
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = {
          name: product.category_name || 'Other Packaging',
          products: [],
        }
      }

      grouped[categoryKey].products.push(product)
    })

    return Object.values(grouped).filter((group) => group.products.length > 0)
  }, [categories, products])

  const handleAddToOrder = (productId) => {
    setOrderMessage('')
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setOrderMessage('Please login first to place your order.')
      return
    }

    const items = Object.entries(selectedItems)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        product_id: Number(productId),
        quantity,
      }))

    if (items.length === 0) {
      setOrderMessage('Add at least one product before placing order.')
      return
    }

    setIsSubmittingOrder(true)
    setOrderMessage('')
    try {
      const response = await api.createOrder(token, items)
      setOrderMessage(`Order placed. Order ID: ${response.order_id}`)
      setSelectedItems({})
    } catch (apiError) {
      setOrderMessage(apiError.message)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <section className="products-page">
      <section className="print-section">
        <h1>Custom Printing</h1>
        <div className="print-note-wrap">
          <div className="print-note-card">
            <h2>Customize Printing on Items Is Also Available</h2>
            <p>
              Add your logo, brand colors, and product message on every pack to
              create a strong first impression.
            </p>
          </div>
        </div>
      </section>

      {loading && <p className="products-meta-message">Loading products...</p>}
      {error && <p className="products-meta-message products-meta-error">{error}</p>}

      {!loading &&
        !error &&
        productsByCategory.map((group) => (
          <section className="products-section" key={group.name}>
            <h1>{group.name}</h1>
            <div className="products-row">
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToOrder={handleAddToOrder} />
              ))}
            </div>
          </section>
        ))}

      <section className="order-box">
        <h2>Quick Order Summary</h2>
        <p className="order-box-subtitle">
          Added items: {Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0)}
        </p>
        <button
          type="button"
          className="order-box-btn"
          onClick={handlePlaceOrder}
          disabled={isSubmittingOrder}
        >
          {isSubmittingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
        {orderMessage && <p className="order-box-message">{orderMessage}</p>}
      </section>
    </section>
  )
}

export default Products
