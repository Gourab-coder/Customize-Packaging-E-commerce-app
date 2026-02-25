import './product_card.css'
import productImage from '../../assets/70-Packaging-Intro.jpg'

const ProductCard = () => {
  return (
    <article className="product-card">
      <div className="product-card-media">
        <img src={productImage} alt="Eco kraft packaging set" />
      </div>

      <div className="product-card-body">
        <h3>Eco Kraft Box Set</h3>
        <p>Food-safe, sturdy, and fully brandable packaging for cafes and ecommerce orders.</p>
      </div>

      <button type="button" className="product-card-btn">
        Details
      </button>
    </article>
  )
}

export default ProductCard
