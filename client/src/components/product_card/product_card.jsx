import './product_card.css'
import productImage from '../../assets/70-Packaging-Intro.jpg'

const ProductCard = ({ product, onAddToOrder }) => {
  const imageUrl = product?.images?.[0] || productImage
  const name = product?.name || 'Eco Kraft Box Set'
  const description =
    product?.description ||
    'Food-safe, sturdy, and fully brandable packaging for cafes and ecommerce orders.'
  const price = product?.price ? Number(product.price).toFixed(2) : null

  return (
    <article className="product-card">
      <div className="product-card-media">
        <img src={imageUrl} alt={name} />
      </div>

      <div className="product-card-body">
        <h3>{name}</h3>
        <p>{description}</p>
        {price && <p className="product-card-price">INR {price}</p>}
      </div>

      {onAddToOrder ? (
        <button type="button" className="product-card-btn" onClick={() => onAddToOrder(product.id)}>
          Add To Order
        </button>
      ) : (
        <button type="button" className="product-card-btn">
          Details
        </button>
      )}
    </article>
  )
}

export default ProductCard
