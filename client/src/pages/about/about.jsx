import './about.css'
const About = () => {
  return (
    <section className="about-page">
      <article className="about-card about-hero">
        <p className="about-tag">About Customize Packaging</p>
        <h1>Built for fast-growing ecommerce brands</h1>
        <p>
          We help brands create packaging that protects products, improves unboxing experience, and keeps costs under
          control. From small paper boxes to premium corrugated packaging, every solution is built to match your
          product and your brand.
        </p>
        <p>
          Our team focuses on practical materials, clear pricing, and production-ready design support so you can move
          from concept to shipment with less friction.
        </p>
      </article>

      <section className="about-grid">
        <article className="about-card">
          <h2>What we optimize for</h2>
          <p>Packaging that looks premium, ships safely, and stays commercially realistic for growing businesses.</p>
        </article>
        <article className="about-card">
          <h2>Where we help most</h2>
          <p>Food brands, ecommerce stores, gifting businesses, and teams launching their first branded packaging run.</p>
        </article>
        <article className="about-card">
          <h2>How we work</h2>
          <p>Estimate, review requirements, confirm specifications, then move into production-ready ordering.</p>
        </article>
      </section>
    </section>
  )
}

export default About
