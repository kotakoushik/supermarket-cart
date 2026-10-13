import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, RefreshCw, ShoppingBag, X, ShieldCheck, Truck, Leaf, ArrowRight, Sprout, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import AlternativeModal from '../components/AlternativeModal';
import BudgetBanner from '../components/BudgetBanner';
import CategoryDiscovery from '../components/CategoryDiscovery';
import FarmPhilosophy from '../components/FarmPhilosophy';
import AnalystBanner from '../components/AnalystBanner';
import SeasonalHighlights from '../components/SeasonalHighlights';
import EditorialBanner from '../components/EditorialBanner';

const CATEGORIES = [
  'All',
  'Dairy',
  'Bakery',
  'Breakfast',
  'Grains and Pulses',
  'Fruits and Vegetables',
  'Snacks',
  'Beverages',
  'Cooking Essentials',
  'Household Products',
];

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProductForAlt, setSelectedProductForAlt] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const res = await apiClient.get('/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setSortBy('name');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAisles = () => {
    const el = document.getElementById('aisles-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="storefront-main">
      {/* =========================================================================
          1. Large Editorial Farm Hero (Split Composition)
          ========================================================================= */}
      <section className="editorial-hero" aria-label="Farm to Table Highlights">
        <div className="container editorial-hero-container">
          <div className="editorial-hero-content">
            <div className="editorial-eyebrow">
              <Sprout size={15} />
              <span>DIRECT FROM FARM • SUNRISE HARVEST</span>
            </div>

            <h1 className="editorial-hero-title">
              Freshness, delivered naturally.
            </h1>

            <p className="editorial-hero-lead">
              Handpicked organic vegetables, small-batch dairy, and stone-ground pantry staples.
              Harvested at dawn from local family growers and delivered to your doorstep within hours.
            </p>

            <div className="editorial-hero-cta-group">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="btn-hero-primary"
                aria-label="Shop Fresh Produce"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={scrollToAisles}
                className="btn-hero-secondary"
                aria-label="Explore Pantry Aisles"
              >
                <span>Explore Aisles</span>
              </button>
            </div>

            <div className="editorial-hero-trust-bar">
              <div className="trust-item">
                <Leaf size={15} className="trust-icon" />
                <span>100% Certified Organic</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <Truck size={15} className="trust-icon" />
                <span>30-Min Cold Express</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <ShieldCheck size={15} className="trust-icon" />
                <span>Direct Grower Pricing</span>
              </div>
            </div>
          </div>

          <div className="editorial-hero-media">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85"
                alt="Vibrant organic produce, crisp greens, heirloom tomatoes, and citrus"
                className="hero-main-img"
                loading="eager"
              />
              <div className="hero-img-gradient" />

              {/* Floating Farm Origin Card */}
              <div className="hero-floating-card top-right">
                <span className="floating-card-dot" />
                <div>
                  <strong>Kolar Valley Organic Farm</strong>
                  <span>Harvested Today • 05:30 AM</span>
                </div>
              </div>

              {/* Floating Quality Card */}
              <div className="hero-floating-card bottom-left">
                <CheckCircle2 size={16} color="var(--brand-forest)" />
                <div>
                  <strong>Zero Chemical Ripening</strong>
                  <span>100% Natural Soil Cultivation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. Category Discovery Tiles
          ========================================================================= */}
      <div id="aisles-section" className="container">
        <CategoryDiscovery
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* =========================================================================
          3. Curated Seasonal Produce Highlights
          ========================================================================= */}
      <div className="container">
        <SeasonalHighlights
          products={products}
          onSelectAlternative={(prod) => setSelectedProductForAlt(prod)}
        />
      </div>

      {/* =========================================================================
          4. The Main Product Catalog Section
          ========================================================================= */}
      <section id="catalog-section" className="catalog-section" aria-label="Product Catalog">
        <div className="container">
          {/* Real-time Budget Banner */}
          <BudgetBanner />

          {/* Section Header */}
          <div className="catalog-header-bar">
            <div>
              <span className="eyebrow-tag">PANTRY & COLD STORAGE</span>
              <h2 className="editorial-section-title">The FreshCart Marketplace</h2>
              <p className="editorial-section-desc">
                {products.length} certified everyday staples with real-time stock and transparent unit pricing.
              </p>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="controls-bar" role="search" aria-label="Product Search and Filters">
            <div className="search-and-sort">
              <div className="search-box">
                <Search size={18} aria-hidden="true" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search fresh groceries (e.g. Milk, Rice, Oil, Bread)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search products"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search query"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="sort-group">
                <label htmlFor="sort-select" className="sort-label">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort products by"
                >
                  <option value="name">Product Name (A – Z)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="categories-pills" role="tablist" aria-label="Filter by Category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid / State Handling */}
          {loading ? (
            <div className="catalog-loading-state" role="status">
              <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--brand-forest)' }} />
              <p style={{ fontWeight: 600 }}>Gathering fresh farm items...</p>
            </div>
          ) : error ? (
            <div className="catalog-error-state" role="alert">
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>{error}</p>
              <button
                onClick={fetchProducts}
                className="btn-retry"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="catalog-empty-state">
              <ShoppingBag size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                No matching grocery items found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                We couldn't find products matching "{searchTerm}". Try clearing search keywords or choosing another category aisle.
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-reset-filters"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="products-grid" aria-label="Product Catalog Grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectAlternative={(prod) => setSelectedProductForAlt(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. Farm Philosophy Section
          ========================================================================= */}
      <div className="container">
        <FarmPhilosophy />
      </div>

      {/* =========================================================================
          6. Shopping Analyst Editorial Banner
          ========================================================================= */}
      <div className="container">
        <AnalystBanner />
      </div>

      {/* =========================================================================
          7. Lifestyle / Slow Living Recipe Banner
          ========================================================================= */}
      <div className="container">
        <EditorialBanner />
      </div>

      {/* Cheaper Alternative Modal */}
      {selectedProductForAlt && (
        <AlternativeModal
          product={selectedProductForAlt}
          onClose={() => setSelectedProductForAlt(null)}
        />
      )}
    </main>
  );
};

export default CatalogPage;
