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
  image_urls: '',
}

export default function Admin() {
  const { user, token, isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState(emptyForm)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isAdmin = isAuthenticated && user?.role === 'admin'

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

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

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
      const imageUrls = productForm.image_urls
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      await api.createProduct(token, {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category_id: Number(productForm.category_id),
        image_urls: imageUrls,
      })

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

  return (
    <section className="admin-page">
      <h1>Admin Panel</h1>
      <p className="admin-subtitle">Manage categories and products.</p>

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
              Image URLs (comma-separated)
              <input
                type="text"
                placeholder="https://image1.jpg, https://image2.jpg"
                value={productForm.image_urls}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, image_urls: event.target.value }))
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
    </section>
  )
}
