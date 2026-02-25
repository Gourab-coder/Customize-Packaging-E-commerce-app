import './custom_card.css'
import { PiPackageLight } from 'react-icons/pi'
import packagingImage from '../../assets/70-Packaging-Intro.jpg'

const CustomCard = () => {
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
        <p className="custom-card-copy">
          Get expert design help, low minimum quantity, and fast production so you can launch your branded packaging
          without delay.
        </p>

        <button type="button" className="custom-card-btn">
          Start Customizing
        </button>
      </div>
    </section>
  )
}

export default CustomCard
