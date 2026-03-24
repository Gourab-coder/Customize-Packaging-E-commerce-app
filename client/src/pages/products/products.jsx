import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/product_card/product_card'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './products.css'

const Products = () => {
  const { token, isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedItems, setSelectedItems] = useState({})
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const [lastOrderId, setLastOrderId] = useState(null)
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
        id: category.id,
        name: category.name,
        products: [],
      }
    })

    products.forEach((product) => {
      const categoryKey = product.category_id || 'uncategorized'
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = {
          id: categoryKey,
          name: product.category_name || 'Other Packaging',
          products: [],
        }
      }

      grouped[categoryKey].products.push(product)
    })

    return Object.values(grouped).filter((group) => group.products.length > 0)
  }, [categories, products])

  const visibleGroups = useMemo(() => {
    if (activeCategory === 'all') {
      return productsByCategory
    }

    return productsByCategory.filter((group) => String(group.id || group.name) === activeCategory)
  }, [activeCategory, productsByCategory])

  const cartItems = useMemo(
    () =>
      Object.entries(selectedItems)
        .map(([productId, quantity]) => {
          const product = products.find((item) => item.id === Number(productId))
          if (!product || quantity <= 0) return null

          const price = Number(product.price || 0)
          return {
            id: product.id,
            name: product.name,
            price,
            quantity,
            subtotal: price * quantity,
            stock: Number(product.stock || 0),
          }
        })
        .filter(Boolean),
    [products, selectedItems],
  )

  const cartSummary = useMemo(() => {
    const units = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
    return {
      units,
      total,
      lines: cartItems.length,
    }
  }, [cartItems])

  const handleAddToOrder = (productId) => {
    setOrderMessage('')
    setLastOrderId(null)
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 0) + 1, Number(products.find((item) => item.id === productId)?.stock || 0)),
    }))
  }

  const updateQuantity = (productId, nextQuantity) => {
    setOrderMessage('')
    setLastOrderId(null)
    setSelectedItems((prev) => {
      if (nextQuantity <= 0) {
        const updated = { ...prev }
        delete updated[productId]
        return updated
      }

      return {
        ...prev,
        [productId]: nextQuantity,
      }
    })
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
      setOrderMessage('Order placed successfully. You can now track it in My Orders.')
      setLastOrderId(response.order_id)
      setSelectedItems({})
      setProducts((prev) =>
        prev.map((product) => {
          const orderedItem = items.find((item) => item.product_id === product.id)
          if (!orderedItem) return product
          return {
            ...product,
            stock: Math.max(0, Number(product.stock || 0) - orderedItem.quantity),
          }
        }),
      )
    } catch (apiError) {
      setOrderMessage(apiError.message)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <section className="products-page">
      <section className="products-hero">
        <div>
          <p className="products-eyebrow">Order Packaging</p>
          <h1>Build your packaging order with a proper review flow</h1>
          <p className="products-hero-copy">
            Choose ready-to-order packaging, adjust quantities, review your cart, and submit everything in one clear
            path. Printed customization can be added later from the customization page if needed.
          </p>
        </div>
        <div className="print-note-card">
          <h2>Printing and brand customization are available too</h2>
          <p>Add your logo, brand colors, and product messaging for a stronger unboxing experience.</p>
          <Link to="/customize" className="print-note-link">
            Open customization estimator
          </Link>
        </div>
      </section>

      {loading && <p className="products-meta-message">Loading products...</p>}
      {error && <p className="products-meta-message products-meta-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="products-filter-row">
            <button
              type="button"
              className={`products-filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All products
            </button>
            {productsByCategory.map((group) => (
              <button
                type="button"
                key={group.name}
                className={`products-filter-chip ${activeCategory === String(group.id || group.name) ? 'active' : ''}`}
                onClick={() => setActiveCategory(String(group.id || group.name))}
              >
                {group.name}
              </button>
            ))}
          </div>

          <div className="products-layout">
            <div className="products-catalog">
              {visibleGroups.map((group) => (
                <section className="products-section" key={group.name}>
                  <div className="products-section-head">
                    <h2>{group.name}</h2>
                    <p>{group.products.length} packaging options</p>
                  </div>
                  <div className="products-row">
                    {group.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToOrder={handleAddToOrder}
                        quantityInCart={selectedItems[product.id] || 0}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="order-box">
              <div className="order-box-head">
                <div>
                  <p className="products-eyebrow">Review selection</p>
                  <h2>Your order</h2>
                </div>
                <span>{cartSummary.units} units</span>
              </div>

              <div className="order-box-stats">
                <article>
                  <strong>{cartSummary.lines}</strong>
                  <span>Products</span>
                </article>
                <article>
                  <strong>{cartSummary.units}</strong>
                  <span>Total units</span>
                </article>
                <article>
                  <strong>INR {cartSummary.total.toFixed(2)}</strong>
                  <span>Estimated total</span>
                </article>
              </div>

              {cartItems.length === 0 ? (
                <p className="order-box-empty">Select products to build your order. Your chosen items will appear here.</p>
              ) : (
                <div className="order-box-items">
                  {cartItems.map((item) => (
                    <article className="order-box-item" key={item.id}>
                      <div>
                        <h3>{item.name}</h3>
                        <p>INR {item.price.toFixed(2)} each</p>
                      </div>
                      <div className="order-box-controls">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.stock))}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!isAuthenticated && (
                <p className="order-box-note">Login before checkout so we can attach the order to your account and show tracking updates.</p>
              )}

              <button
                type="button"
                className="order-box-btn"
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? 'Placing Order...' : 'Place Order'}
              </button>

              {orderMessage && (
                <div className={`order-box-message ${lastOrderId ? 'success' : ''}`}>
                  <p>{orderMessage}</p>
                  {lastOrderId && (
                    <Link to="/orders" className="order-box-link">
                      Track order #{lastOrderId}
                    </Link>
                  )}
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </section>
  )
}

export default Products
