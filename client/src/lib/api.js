const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const buildHeaders = (token, extraHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

const request = async ({ path, method = 'GET', body, token }) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

export const api = {
  register: (payload) =>
    request({ path: '/api/auth/register', method: 'POST', body: payload }),
  login: (payload) =>
    request({ path: '/api/auth/login', method: 'POST', body: payload }),
  me: (token) => request({ path: '/api/auth/me', token }),
  getProducts: () => request({ path: '/api/products' }),
  getCategories: () => request({ path: '/api/categories' }),
  createCategory: (token, payload) =>
    request({ path: '/api/categories', method: 'POST', token, body: payload }),
  createProduct: (token, payload) =>
    request({ path: '/api/products', method: 'POST', token, body: payload }),
  deleteProduct: (token, productId) =>
    request({ path: `/api/products/${productId}`, method: 'DELETE', token }),
  createOrder: (token, items) =>
    request({ path: '/api/orders', method: 'POST', token, body: { items } }),
  getMyOrders: (token) => request({ path: '/api/orders/my', token }),
}
