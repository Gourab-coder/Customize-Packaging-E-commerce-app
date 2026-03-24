import './home.css'
import CustomCard from '../../components/custom_card/custom_card'
import ProductCard from '../../components/product_card/product_card'
import { FiArrowRight, FiLayers, FiPenTool, FiTruck } from 'react-icons/fi'
import packImage from '../../assets/pack1.png'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <section className="home">
      <CustomCard />

      <section className="home-highlights">
        <article>
          <p className="home-highlight-value">48 hrs</p>
          <p className="home-highlight-label">Quotation turnaround for standard requests</p>
        </article>
        <article>
          <p className="home-highlight-value">4 step</p>
          <p className="home-highlight-label">Flow from design briefing to tracked order delivery</p>
        </article>
        <article>
          <p className="home-highlight-value">Eco-first</p>
          <p className="home-highlight-label">Recycled, kraft, and print-ready materials built in</p>
        </article>
      </section>

      <section className="product-section">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">Featured Packaging</p>
            <h1>Ready-made formats you can brand fast</h1>
          </div>
          <button className="more-btn" onClick={() => navigate('/products')}>
            View all products
            <FiArrowRight className="more-icon" />
          </button>
        </div>
        <div className="product-row">
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
      </section>

      <section className="home-process">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">How It Works</p>
            <h2>A cleaner client journey from idea to order</h2>
          </div>
        </div>
        <div className="home-process-grid">
          <article className="home-process-card">
            <FiLayers />
            <h3>Choose a packaging format</h3>
            <p>Browse box, cup, and bag categories, compare price points, and build your selection in one place.</p>
          </article>
          <article className="home-process-card">
            <FiPenTool />
            <h3>Customize materials and print</h3>
            <p>Use the estimator to decide size, board, finish, quantity, and whether you need branded printing.</p>
          </article>
          <article className="home-process-card">
            <FiTruck />
            <h3>Place and track your order</h3>
            <p>Review quantities before checkout, submit your order, then track status updates inside My Orders.</p>
          </article>
        </div>
      </section>

      <section className="sustain-section">
        <div className="sustain-text">
          <p className="home-eyebrow">Why Brands Choose Us</p>
          <h1>Smart. Sustainable. Cost-efficient.</h1>
          <p>
            We design branded packaging that reduces environmental impact without increasing your costs. Through
            innovative structural engineering and responsibly sourced materials, we deliver high-performance packaging
            that protects your product, strengthens your brand, and supports a greener future.
          </p>
          <p>Sustainability isn&apos;t an upgrade. It&apos;s our standard.</p>
          <button type="button" className="home-secondary-btn" onClick={() => navigate('/about')}>
            Learn more about our process
          </button>
        </div>
        <div className="sustain-image-wrap">
          <img className="sustain-image" src={packImage} alt="Custom packaging boxes" />
        </div>
      </section>
    </section>
  )
}

export default Home
