import './home.css'
import CustomCard from '../../components/custom_card/custom_card'
import ProductCard from '../../components/product_card/product_card'
import { IoIosArrowDown } from 'react-icons/io'
import packImage from '../../assets/pack1.png'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <section className="home">
      <CustomCard />
      <section className="product-section">
        <h1>Products</h1>
        <div className="product-row">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
        <button className="more-btn" onClick={() => navigate('/products')}>
          more
          <IoIosArrowDown className="more-icon" />
        </button>
      </section>
      <section className="sustain-section">
        <div className="sustain-text">
          <h1>Smart. Sustainable. Cost-Efficient.</h1>
          <p>
            We design branded packaging that reduces environmental impact without increasing your costs. Through
            innovative structural engineering and responsibly sourced materials, we deliver high-performance packaging
            that protects your product, strengthens your brand, and supports a greener future.
          </p>
          <p>Sustainability isn&apos;t an upgrade. It&apos;s our standard.</p>
        </div>
        <div className="sustain-image-wrap">
          <img className="sustain-image" src={packImage} alt="Custom packaging boxes" />
        </div>
      </section>
    </section>
  )
}

export default Home
