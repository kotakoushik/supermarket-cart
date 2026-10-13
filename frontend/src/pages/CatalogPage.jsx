import React, { useEffect, useState, useMemo } from 'react';
import { Search, Sparkles, Filter, RefreshCw, ShoppingBag } from 'lucide-react';
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
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm, sortBy]);

  return (
    <div>
      {/* Hero Header */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-tag">
            <Sparkles size={16} /> AI-Powered Grocery Shopping
          </div>
          <h1 className="hero-title">
            Smart Savings on Everyday Groceries
          </h1>
          <p className="hero-desc">
            Shop farm-fresh dairy, pantry staples, and household essentials with real-time budget tracking and instant AI cheaper alternatives.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Budget Bar */}
        <BudgetBanner />

        {/* Filter & Search Bar */}
        <div className="controls-bar">
          <div className="search-and-sort">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search 20+ fresh items (e.g. Milk, Rice, Oil, Tea)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="sort-select" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>
                Sort:
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A - Z)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="categories-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>Loading fresh products from supermarket inventory...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fee2e2', borderRadius: '12px', color: '#991b1b', marginBottom: '32px' }}>
            <p style={{ fontWeight: 700 }}>{error}</p>
            <button
              onClick={fetchProducts}
              style={{ marginTop: '12px', background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No products found</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              No items match your selected filters. Try searching for something else or clear the category filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              style={{ marginTop: '16px', background: '#059669', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectAlternative={(p) => setSelectedProductForAlt(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alternative Modal */}
      {selectedProductForAlt && (
        <AlternativeModal
          product={selectedProductForAlt}
          onClose={() => setSelectedProductForAlt(null)}
        />
      )}
    </div>
  );
};

export default CatalogPage;
