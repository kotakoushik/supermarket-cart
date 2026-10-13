import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, RefreshCw, ShoppingBag, X, ShieldCheck, Truck, Leaf } from 'lucide-react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import AlternativeModal from '../components/AlternativeModal';
import BudgetBanner from '../components/BudgetBanner';

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

  return (
    <main>
      {/* Supermarket Welcome Banner */}
      <section className="hero-section" aria-label="Store Highlights">
        <div className="container hero-content">
          <div className="hero-tag">
            <Sparkles size={14} aria-hidden="true" />
            <span>FreshCart Direct Mandi</span>
          </div>
          <h1 className="hero-title">
            Fresh Everyday Groceries, Smarter Cart Savings
          </h1>
          <p className="hero-desc">
            Directly sourced staples, dairy & pantry essentials with live budget tracking and instant verified savings.
          </p>

          <div className="hero-badges-row">
            <div className="hero-badge-item">
              <Leaf size={15} aria-hidden="true" />
              <span>100% Quality Assured</span>
            </div>
            <div className="hero-badge-item">
              <Truck size={15} aria-hidden="true" />
              <span>30-Min Fast Delivery</span>
            </div>
            <div className="hero-badge-item">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Staples Price Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Budget Tracker Banner */}
        <BudgetBanner />

        {/* Search, Filter & Sort Bar */}
        <div className="controls-bar" role="search" aria-label="Product Search and Filters">
          <div className="search-and-sort">
            <div className="search-box">
              <Search size={17} aria-hidden="true" />
              <input
                type="text"
                className="search-input"
                placeholder="Search fresh groceries (e.g. Milk, Rice, Oil, Tea)..."
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="sort-select" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Sort:
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products by"
              >
                <option value="name">Name (A – Z)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

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
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }} role="status">
            <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--brand-forest)' }} />
            <p style={{ fontWeight: 600 }}>Loading inventory items...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px',
              background: 'var(--danger-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              marginBottom: '32px',
            }}
            role="alert"
          >
            <p style={{ fontWeight: 700, marginBottom: '8px' }}>{error}</p>
            <button
              onClick={fetchProducts}
              style={{
                marginTop: '10px',
                background: 'var(--danger)',
                color: 'white',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              marginBottom: '40px',
            }}
          >
            <ShoppingBag size={44} color="var(--text-subtle)" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              No matching grocery items found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 18px' }}>
              We couldn't find items matching your current filters. Try searching with a different term or resetting category filters.
            </p>
            <button
              onClick={handleClearFilters}
              style={{
                background: 'var(--brand-forest)',
                color: 'white',
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}
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
