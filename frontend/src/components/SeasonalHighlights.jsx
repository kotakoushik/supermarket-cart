import React from 'react';
import { Sparkles, ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/useCart';

const SeasonalHighlights = ({ products, onSelectAlternative }) => {
  const { addToCart, loading } = useCart();
  const [justAddedId, setJustAddedId] = React.useState(null);

  // Pick seasonal highlights from real products (prefer Fruits and Vegetables, Dairy, Bakery)
  const featured = products
    .filter((p) => p.category === 'Fruits and Vegetables' || p.category === 'Dairy' || p.category === 'Bakery')
    .slice(0, 4);

  if (featured.length === 0) return null;

  const handleQuickAdd = async (product) => {
    if (loading) return;
    const success = await addToCart(product.id, 1);
    if (success) {
      setJustAddedId(product.id);
      setTimeout(() => setJustAddedId(null), 1200);
    }
  };

  return (
    <section className="seasonal-highlights-section" aria-label="Today's Harvest Selection">
      <div className="section-header-editorial-row">
        <div>
          <span className="eyebrow-tag">HANDPICKED THIS MORNING</span>
          <h2 className="editorial-section-title">Today's Field Harvest</h2>
          <p className="editorial-section-desc">
            Direct from our partner orchards and organic dairies. Packed with morning dew and wholesome nutrition.
          </p>
        </div>
        <a href="#catalog-section" className="editorial-link-action">
          <span>View All Fresh Items</span>
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="seasonal-highlights-grid">
        {featured.map((item) => (
          <div key={item.id} className="seasonal-highlight-card">
            <div className="seasonal-img-container">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="seasonal-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <span className="seasonal-badge-pill">{item.category}</span>
            </div>
            <div className="seasonal-info">
              <h3 className="seasonal-title">{item.name}</h3>
              <p className="seasonal-desc">{item.description}</p>
              <div className="seasonal-footer">
                <span className="seasonal-price">₹{Number(item.price).toFixed(2)}</span>
                <div className="seasonal-actions">
                  <button
                    type="button"
                    className={`btn-seasonal-add ${justAddedId === item.id ? 'added' : ''}`}
                    onClick={() => handleQuickAdd(item)}
                    disabled={item.stockQuantity <= 0 || loading}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    {justAddedId === item.id ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} /> Quick Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeasonalHighlights;
