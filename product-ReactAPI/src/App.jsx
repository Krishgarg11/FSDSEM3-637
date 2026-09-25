import { useEffect, useMemo, useState } from 'react'
import ProductForm from './components/ProductForm.jsx'
import ProductList from './components/ProductList.jsx'
import {
  API_BASE,
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from './api/products.js'
import './App.css'

const ALL_CATEGORIES = 'All'
const LOW_STOCK_LIMIT = 5

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

function App() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [editingProduct, setEditingProduct] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const data = await getProducts()

        if (cancelled) return
        setProducts(Array.isArray(data) ? data : [])
        setError('')
      } catch (loadError) {
        if (!cancelled) setError(loadError.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const categories = useMemo(
    () => [...new Set(products.map(product => product.category))].sort(),
    [products],
  )

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter(product => {
      const matchesCategory =
        categoryFilter === ALL_CATEGORIES || product.category === categoryFilter
      const matchesSearch =
        term === '' ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)

      return matchesCategory && matchesSearch
    })
  }, [products, search, categoryFilter])

  const stats = useMemo(
    () => ({
      total: products.length,
      inventoryValue: products.reduce(
        (sum, product) => sum + product.price * product.stock,
        0,
      ),
      lowStock: products.filter(product => product.stock <= LOW_STOCK_LIMIT).length,
    }),
    [products],
  )

  function refresh() {
    setReloadKey(key => key + 1)
  }

  async function handleAdd(values) {
    setIsSaving(true)

    try {
      const result = await createProduct(values)
      setNotice(result?.message || `Added "${values.name}"`)
      setError('')
      refresh()
      return true
    } catch (mutationError) {
      setError(mutationError.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(id, values) {
    setIsSaving(true)

    try {
      const result = await updateProduct(id, values)
      setNotice(result?.message || `Updated "${values.name}"`)
      setError('')
      setEditingProduct(null)
      refresh()
      return true
    } catch (mutationError) {
      setError(mutationError.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) {
      return false
    }

    setIsSaving(true)

    try {
      const result = await deleteProduct(product.id)
      setNotice(result?.message || `Deleted "${product.name}"`)
      setError('')
      setEditingProduct(current => (current?.id === product.id ? null : current))
      refresh()
      return true
    } catch (mutationError) {
      setError(mutationError.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const emptyMessage =
    products.length === 0
      ? 'No products yet. Add your first product with the form.'
      : 'No products match your search or filter.'

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Product Manager</h1>
          <p>
            React front end for the Express product API with full CRUD, search and
            stock insights.
          </p>
        </div>

        <div className="api-actions">
          <span className="api-hint">API: {API_BASE}</span>
          <a className="api-link" href={`${API_BASE}/products`} target="_blank" rel="noreferrer">
            Open product server
          </a>
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Products</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Inventory value</span>
          <strong>{currency.format(stats.inventoryValue)}</strong>
        </div>
        <div className="stat-card">
          <span>Low stock ({LOW_STOCK_LIMIT} or less)</span>
          <strong>{stats.lowStock}</strong>
        </div>
      </section>

      {error !== '' && (
        <div className="banner error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            x
          </button>
        </div>
      )}

      {notice !== '' && (
        <div className="banner notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">
            x
          </button>
        </div>
      )}

      <div className="layout">
        <section className="panel">
          <ProductForm
            key={editingProduct ? editingProduct.id : 'new'}
            product={editingProduct}
            isSaving={isSaving}
            onSubmit={values =>
              editingProduct ? handleUpdate(editingProduct.id, values) : handleAdd(values)
            }
            onCancel={() => setEditingProduct(null)}
          />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Products</h2>
              <p className="count">
                Showing {visibleProducts.length} of {products.length}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-small"
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="toolbar">
            <div className="field">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by name or category"
              />
            </div>
            <div className="field">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={event => setCategoryFilter(event.target.value)}
              >
                <option value={ALL_CATEGORIES}>{ALL_CATEGORIES}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="empty">Loading products...</p>
          ) : (
            <ProductList
              products={visibleProducts}
              editingId={editingProduct?.id}
              isSaving={isSaving}
              currency={currency}
              emptyMessage={emptyMessage}
              onEdit={setEditingProduct}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default App
