import './product_card.css'
import productImage from '../../assets/70-Packaging-Intro.jpg'

const ProductCard = ({ product, onAddToOrder, quantityInCart = 0 }) => {
  const imageUrl = product?.images?.[0] || productImage
  const name = product?.name || 'Eco Kraft Box Set'
  const description =
    product?.description ||
    'Food-safe, sturdy, and fully brandable packaging for cafes and ecommerce orders.'
  const price = product?.price ? Number(product.price).toFixed(2) : null
  const stock = Number(product?.stock || 0)

  return (
    <article className="product-card">
      <div className="product-card-media">
        <img src={imageUrl} alt={name} />
        <span className={`product-card-stock ${stock === 0 ? 'out' : ''}`}>
          {stock === 0 ? 'Out of stock' : `${stock} in stock`}
        </span>
      </div>

      <div className="product-card-body">
        <h3>{name}</h3>
        <p>{description}</p>
        {price && <p className="product-card-price">INR {price}</p>}
      </div>

      <div className="product-card-footer">
        {quantityInCart > 0 && <p className="product-card-qty">Added: {quantityInCart}</p>}
        {onAddToOrder ? (
          <button
            type="button"
            className="product-card-btn"
            onClick={() => onAddToOrder(product.id)}
            disabled={stock === 0}
          >
            {stock === 0 ? 'Unavailable' : 'Add To Order'}
          </button>
        ) : (
          <button type="button" className="product-card-btn">
            Details
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard
