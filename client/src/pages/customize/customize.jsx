import { useMemo, useState } from 'react'
import { api } from '../../lib/api'
import './customize.css'

const Customize = () => {
  const itemTypePrices = {
    small_paper_box: 120,
    corrugated_box: 180,
    paper_cup: 90,
    paper_bag: 100,
  }

  const sizeMultipliers = {
    small: 1,
    medium: 1.25,
    large: 1.55,
  }

  const materialAddons = {
    kraft_paper: 0,
    recycled_paper: 12,
    ivory_paper: 20,
  }

  const boardAddons = {
    single_wall: 0,
    double_wall: 24,
    premium_laminate: 42,
  }

  const printAddons = {
    non_printed: 0,
    printed: 35,
  }

  const [itemType, setItemType] = useState('small_paper_box')
  const [size, setSize] = useState('small')
  const [materialType, setMaterialType] = useState('kraft_paper')
  const [boardType, setBoardType] = useState('single_wall')
  const [printType, setPrintType] = useState('non_printed')
  const [quantity, setQuantity] = useState(100)
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false)
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false)
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false)
  const [consultForm, setConsultForm] = useState({
    name: '',
    contactNumber: '',
    callTime: '',
    productType: '',
    productDetails: '',
  })
  const [quotationForm, setQuotationForm] = useState({
    name: '',
    whatsappNumber: '',
    driveLink: '',
    productType: '',
    productDescription: '',
  })

  const pricing = useMemo(() => {
    const basePrice = itemTypePrices[itemType]
    const sizePrice = basePrice * sizeMultipliers[size]
    const materialPrice = materialAddons[materialType]
    const boardPrice = boardAddons[boardType]
    const printPrice = printAddons[printType]
    const baseUnitPrice = sizePrice + materialPrice + boardPrice + printPrice

    let discountPercent = 0
    if(quantity >= 2000){
        discountPercent = 60
    } else if (quantity >= 1000) {
      discountPercent = 50
    } else if (quantity >= 500) {
      discountPercent = 25
    } else if (quantity >= 100) {
      discountPercent = 10
    }

    const discountMultiplier = 1 - discountPercent / 100
    const unitPrice = Math.round(baseUnitPrice * discountMultiplier)
    const totalPrice = unitPrice * quantity

    return { discountPercent, unitPrice, totalPrice }
  }, [boardType, itemType, materialType, printType, quantity, size])

  const handleConsultFieldChange = (field, value) => {
    setConsultForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleConsultSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setIsSubmittingConsultation(true)

    try {
      await api.createConsultationRequest(consultForm)
      setIsConsultModalOpen(false)
      setSuccessMessage('Consultation request submitted. Our packaging team will contact you shortly.')
      setConsultForm({
        name: '',
        contactNumber: '',
        callTime: '',
        productType: '',
        productDetails: '',
      })
    } catch (apiError) {
      setErrorMessage(apiError.message)
    } finally {
      setIsSubmittingConsultation(false)
    }
  }

  const handleQuotationFieldChange = (field, value) => {
    setQuotationForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleQuotationSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setIsSubmittingQuotation(true)

    try {
      await api.createQuotationRequest(quotationForm)
      setIsQuotationModalOpen(false)
      setSuccessMessage('Quotation request submitted. We will review your design details and get back to you.')
      setQuotationForm({
        name: '',
        whatsappNumber: '',
        driveLink: '',
        productType: '',
        productDescription: '',
      })
    } catch (apiError) {
      setErrorMessage(apiError.message)
    } finally {
      setIsSubmittingQuotation(false)
    }
  }

  return (
    <section className="customize-page">
      <section className="customize-hero">
        <div>
          <p className="customize-eyebrow">Packaging Estimator</p>
          <h1>Plan materials, size, and quantity before you order</h1>
          <p className="customize-hero-copy">
            Use this estimator to shape the right packaging setup for your product. It gives you a fast pricing
            direction and helps you prepare a cleaner brief for production.
          </p>
        </div>
        <div className="customize-hero-points">
          <article>
            <strong>Instant estimate</strong>
            <span>See pricing changes as you update the spec.</span>
          </article>
          <article>
            <strong>Material planning</strong>
            <span>Compare recycled, kraft, and premium options.</span>
          </article>
          <article>
            <strong>Production support</strong>
            <span>Book a call or request a full quotation with artwork links.</span>
          </article>
        </div>
      </section>

      <section className="customize-config-card">
        <h1>Customize Your Packaging</h1>
        <p className="customize-config-subtitle">
          Choose your item configuration and get an estimated final price instantly.
        </p>

        <div className="customize-config-grid">
          <label className="customize-field">
            <span>Choose item type</span>
            <select value={itemType} onChange={(event) => setItemType(event.target.value)}>
              <option value="small_paper_box">Small Paper Box</option>
              <option value="corrugated_box">Corrugated Box</option>
              <option value="paper_cup">Paper Cup</option>
              <option value="paper_bag">Paper Bag</option>
            </select>
          </label>

          <label className="customize-field">
            <span>Choose size</span>
            <select value={size} onChange={(event) => setSize(event.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>

          <label className="customize-field">
            <span>Choose material type</span>
            <select value={materialType} onChange={(event) => setMaterialType(event.target.value)}>
              <option value="kraft_paper">Kraft Paper</option>
              <option value="recycled_paper">Recycled Paper</option>
              <option value="ivory_paper">Ivory Paper</option>
            </select>
          </label>

          <label className="customize-field">
            <span>Choose board type</span>
            <select value={boardType} onChange={(event) => setBoardType(event.target.value)}>
              <option value="single_wall">Single Wall</option>
              <option value="double_wall">Double Wall</option>
              <option value="premium_laminate">Premium Laminate</option>
            </select>
          </label>

          <label className="customize-field">
            <span>Printed or non-printed</span>
            <select value={printType} onChange={(event) => setPrintType(event.target.value)}>
              <option value="non_printed">Non-Printed</option>
              <option value="printed">Printed</option>
            </select>
          </label>

          <label className="customize-field">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>
        </div>

        <div className="customize-price-box">
          <p>Discount: {pricing.discountPercent}%</p>
          <p>Unit Price: INR {pricing.unitPrice}</p>
          <h2>Total Price: INR {pricing.totalPrice}</h2>
          <span className="customize-price-note">
            This is an estimate for planning purposes. Final pricing depends on artwork, dimensions, and production
            review.
          </span>
        </div>
      </section>

      {successMessage && <p className="customize-success-banner">{successMessage}</p>}
      {errorMessage && <p className="customize-error-banner">{errorMessage}</p>}

      <section className="customize-support-grid">
        <article className="customize-support-card">
          <h3>Get a Free Packaging Consultant Call</h3>
          <p>
            Discuss your packaging goals with our expert team and get recommendations on materials, sizes, and budget.
          </p>
          <button type="button" onClick={() => setIsConsultModalOpen(true)}>
            Book Free Call
          </button>
        </article>

        <article className="customize-support-card">
          <h3>Upload Your Packaging Design Details and Get Quotation</h3>
          <p>
            Share your artwork, dimensions, and quantity requirements to receive a custom quotation for production.
          </p>
          <button type="button" onClick={() => setIsQuotationModalOpen(true)}>
            Upload & Get Quotation
          </button>
        </article>
      </section>

      {isConsultModalOpen && (
        <div className="customize-modal-backdrop" role="presentation" onClick={() => setIsConsultModalOpen(false)}>
          <section className="customize-modal" role="dialog" aria-modal="true" aria-label="Book free call form" onClick={(event) => event.stopPropagation()}>
            <div className="customize-modal-header">
              <h3>Book Free Packaging Consultant Call</h3>
              <button type="button" className="customize-modal-close" onClick={() => setIsConsultModalOpen(false)}>
                x
              </button>
            </div>

            <form className="customize-modal-form" onSubmit={handleConsultSubmit}>
              <label className="customize-field">
                <span>Name</span>
                <input
                  type="text"
                  value={consultForm.name}
                  onChange={(event) => handleConsultFieldChange('name', event.target.value)}
                  required
                />
              </label>

              <label className="customize-field">
                <span>Contact Number</span>
                <input
                  type="tel"
                  value={consultForm.contactNumber}
                  onChange={(event) => handleConsultFieldChange('contactNumber', event.target.value)}
                  required
                />
              </label>

              <label className="customize-field">
                <span>Preferred Time to Call (9:00 AM - 6:00 PM)</span>
                <input
                  type="time"
                  min="09:00"
                  max="18:00"
                  value={consultForm.callTime}
                  onChange={(event) => handleConsultFieldChange('callTime', event.target.value)}
                  required
                />
              </label>

              <label className="customize-field">
                <span>Product Type</span>
                <select
                  value={consultForm.productType}
                  onChange={(event) => handleConsultFieldChange('productType', event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select product type
                  </option>
                  <option value="liquid">Liquid</option>
                  <option value="solid">Solid</option>
                  <option value="powder">Powder</option>
                  <option value="gas">Gas</option>
                </select>
              </label>

              <label className="customize-field">
                <span>Product Details</span>
                <textarea
                  rows="4"
                  value={consultForm.productDetails}
                  onChange={(event) => handleConsultFieldChange('productDetails', event.target.value)}
                  required
                />
              </label>

              <button type="submit" className="customize-modal-submit" disabled={isSubmittingConsultation}>
                {isSubmittingConsultation ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </section>
        </div>
      )}

      {isQuotationModalOpen && (
        <div className="customize-modal-backdrop" role="presentation" onClick={() => setIsQuotationModalOpen(false)}>
          <section
            className="customize-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Upload design and get quotation form"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customize-modal-header">
              <h3>Upload Design and Get Quotation</h3>
              <button type="button" className="customize-modal-close" onClick={() => setIsQuotationModalOpen(false)}>
                x
              </button>
            </div>

            <form className="customize-modal-form" onSubmit={handleQuotationSubmit}>
              <label className="customize-field">
                <span>Name</span>
                <input
                  type="text"
                  value={quotationForm.name}
                  onChange={(event) => handleQuotationFieldChange('name', event.target.value)}
                  required
                />
              </label>

              <label className="customize-field">
                <span>WhatsApp Number</span>
                <input
                  type="tel"
                  value={quotationForm.whatsappNumber}
                  onChange={(event) => handleQuotationFieldChange('whatsappNumber', event.target.value)}
                  required
                />
              </label>

              <div className="customize-field customize-drive-field">
                <span>Upload Design via Google Drive</span>
                <p className="customize-drive-hint">Upload your files in Google Drive and paste the share link below.</p>
                <button
                  type="button"
                  className="customize-drive-btn"
                  onClick={() => window.open('https://drive.google.com', '_blank', 'noopener,noreferrer')}
                >
                  Open Google Drive
                </button>
                <input
                  type="url"
                  placeholder="Paste Google Drive share link"
                  value={quotationForm.driveLink}
                  onChange={(event) => handleQuotationFieldChange('driveLink', event.target.value)}
                  required
                />
              </div>

              <label className="customize-field">
                <span>Product Type</span>
                <select
                  value={quotationForm.productType}
                  onChange={(event) => handleQuotationFieldChange('productType', event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select product type
                  </option>
                  <option value="liquid">Liquid</option>
                  <option value="solid">Solid</option>
                  <option value="powder">Powder</option>
                  <option value="gas">Gas</option>
                </select>
              </label>

              <label className="customize-field">
                <span>Product Description</span>
                <textarea
                  rows="4"
                  value={quotationForm.productDescription}
                  onChange={(event) => handleQuotationFieldChange('productDescription', event.target.value)}
                  required
                />
              </label>

              <button type="submit" className="customize-modal-submit" disabled={isSubmittingQuotation}>
                {isSubmittingQuotation ? 'Submitting...' : 'Submit Quotation Request'}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default Customize;
