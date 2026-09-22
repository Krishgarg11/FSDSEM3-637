import { useState } from 'react'

const EMPTY_VALUES = { name: '', category: '', price: '', stock: '' }

function toFormValues(product) {
  if (!product) {
    return EMPTY_VALUES
  }

  return {
    name: product.name ?? '',
    category: product.category ?? '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? ''),
  }
}

function ProductForm({ product = null, isSaving, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(product))
  const [formError, setFormError] = useState('')
  const isEditing = Boolean(product)

  function handleChange(event) {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const name = values.name.trim()
    const category = values.category.trim()
    const price = Number(values.price)
    const stock = Number(values.stock)

    if (name === '' || category === '') {
      setFormError('Name and category are required.')
      return
    }

    if (values.price === '' || !Number.isFinite(price) || price < 0) {
      setFormError('Price must be a number greater than or equal to 0.')
      return
    }

    if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
      setFormError('Stock must be a whole number greater than or equal to 0.')
      return
    }

    setFormError('')
    const saved = await onSubmit({ name, category, price, stock })

    if (saved && !isEditing) {
      setValues(EMPTY_VALUES)
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEditing ? `Edit product #${product.id}` : 'Add a product'}</h2>
      <p className="panel-subtitle">
        {isEditing
          ? 'Update the details and save your changes.'
          : 'Fill the form to send a POST request to the API.'}
      </p>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Wireless Keyboard"
        />
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          value={values.category}
          onChange={handleChange}
          placeholder="Electronics"
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="price">Price (₹)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={handleChange}
            placeholder="1499"
          />
        </div>
        <div className="field">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={handleChange}
            placeholder="25"
          />
        </div>
      </div>

      {formError !== '' && (
        <p className="field-error" role="alert">
          {formError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
        </button>
        {isEditing && (
          <button type="button" className="btn" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default ProductForm