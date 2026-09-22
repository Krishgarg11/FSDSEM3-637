const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`)
  }

  return data
}

export function getProducts() {
  return request('/products')
}

export function createProduct(product) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export function updateProduct(id, product) {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' })
}

export { API_BASE }
