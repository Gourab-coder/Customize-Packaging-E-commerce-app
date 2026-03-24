import './custom_card.css'
import { PiPackageLight } from 'react-icons/pi'
import packagingImage from '../../assets/70-Packaging-Intro.jpg'
import { useNavigate } from 'react-router-dom'

const CustomCard = () => {
  const navigate = useNavigate()

  return (
    <section className="custom-card" style={{ '--card-bg': `url(${packagingImage})` }}>
      <div className="custom-card-overlay">
        <div className="custom-card-head">
          <PiPackageLight size={30} />
          <p className="custom-card-badge">Premium Custom Packaging</p>
        </div>

        <h2>Turn Every Delivery Into a Brand Experience</h2>
        <p className="custom-card-copy">
          Make your packaging impossible to ignore with premium custom boxes, cups, and wraps that increase repeat
          orders and customer trust.
        </p>
        <div className="custom-card-points">
          <span>Low MOQ</span>
          <span>Fast quotations</span>
          <span>Eco-focused materials</span>
        </div>

        <div className="custom-card-actions">
          <button type="button" className="custom-card-btn" onClick={() => navigate('/customize')}>
            Start Customizing
          </button>
          <button type="button" className="custom-card-btn custom-card-btn-secondary" onClick={() => navigate('/products')}>
            Explore Products
          </button>
        </div>
      </div>
    </section>
  )
}

export default CustomCard
