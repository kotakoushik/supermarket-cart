import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const CATEGORY_TILES = [
  {
    name: 'Fruits and Vegetables',
    label: 'Fresh Produce',
    tagline: 'Harvested daily',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Dairy',
    label: 'Farm Dairy',
    tagline: 'Pure milk & butter',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Bakery',
    label: 'Artisan Bakery',
    tagline: 'Fresh oven bakes',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Breakfast',
    label: 'Morning Staples',
    tagline: 'Oats, honey & muesli',
    image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Grains and Pulses',
    label: 'Grains & Pulses',
    tagline: 'Unpolished & whole',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Cooking Essentials',
    label: 'Cooking Oils & Salts',
    tagline: 'Cold-pressed & pure',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Snacks',
    label: 'Healthy Snacks',
    tagline: 'Roasted & crunchy',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Beverages',
    label: 'Estate Teas & Coffee',
    tagline: 'Single origin blends',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Household Products',
    label: 'Eco Home Essentials',
    tagline: 'Clean & sustainable',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80',
  },
];

const CategoryDiscovery = ({ selectedCategory, onSelectCategory }) => {
  const handleClick = (categoryName) => {
    onSelectCategory(categoryName);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="category-discovery-section" aria-label="Aisles of Abundance">
      <div className="section-header-editorial">
        <span className="eyebrow-tag">CURATED PANTRY AISLES</span>
        <h2 className="editorial-section-title">Explore by Farm Category</h2>
        <p className="editorial-section-desc">
          Browse seasonal produce, whole grains, and farm essentials selected for purity, freshness, and honest value.
        </p>
      </div>

      <div className="category-tiles-grid">
        {CATEGORY_TILES.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              className={`category-tile-card ${isActive ? 'active' : ''}`}
              onClick={() => handleClick(cat.name)}
              aria-label={`Filter by ${cat.label}`}
            >
              <div className="category-tile-image-wrap">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="category-tile-img"
                  loading="lazy"
                />
                <div className="category-tile-overlay" />
                <span className="category-tile-arrow">
                  <ArrowUpRight size={14} />
                </span>
              </div>
              <div className="category-tile-content">
                <h3 className="category-tile-title">{cat.label}</h3>
                <span className="category-tile-tagline">{cat.tagline}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryDiscovery;
