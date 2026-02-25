import './products.css'
import ProductCard from '../../components/product_card/product_card'

const Products = () => {
    
  return (
    <section className="products-page">
        <section className="print-section">
            <h1>Custom Printing</h1>
            <div className="print-note-wrap">
                <div className="print-note-card">
                    <h2>Customize Printing on Items Is Also Available</h2>
                    <p>
                      Add your logo, brand colors, and product message on every pack to create a strong first impression.
                    </p>
                </div>
            </div>
        </section>
        <section className="products-section">
            <h1>Small Paper Boxes</h1>
            <div className="products-row">
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            </div>
        </section>
        <section className="products-section">
            <h1>Carrugated Boxes</h1>
            <div className="products-row">
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            </div>
        </section>
        <section className="products-section">
            <h1>Paper Cups</h1>
            <div className="products-row">
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            </div>
        </section>
        <section className="products-section">
            <h1>Paper Bags</h1>
            <div className="products-row">
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            </div>
        </section>

      
    </section>
  )
}

export default Products
