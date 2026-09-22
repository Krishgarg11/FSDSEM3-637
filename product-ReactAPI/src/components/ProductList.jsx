function stockClass(stock) {
  if (stock === 0) return 'stock out'
  if (stock <= 5) return 'stock low'
  return 'stock'
}

function ProductList({ products, editingId, isSaving, currency, emptyMessage, onEdit, onDelete }) {
  if (products.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className={product.id === editingId ? 'editing' : undefined}>
              <td>
                <span className="product-name">{product.name}</span>
                <span className="product-id">#{product.id}</span>
              </td>
              <td>
                <span className="badge">{product.category}</span>
              </td>
              <td>{currency.format(product.price)}</td>
              <td>
                <span className={stockClass(product.stock)}>{product.stock}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => onEdit(product)}
                    disabled={isSaving}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => onDelete(product)}
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductList