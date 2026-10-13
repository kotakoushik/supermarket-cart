import React from 'react';
import { ArrowRight, Leaf, HeartHandshake } from 'lucide-react';

const EditorialBanner = () => {
  return (
    <section className="editorial-promo-banner" aria-label="Slow Living and Wholesome Cooking">
      <div className="editorial-promo-bg">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
          alt="Fresh farm produce harvest on rustic wood"
          className="editorial-promo-img"
          loading="lazy"
        />
        <div className="editorial-promo-gradient" />
      </div>

      <div className="editorial-promo-content">
        <span className="editorial-promo-tag">
          <Leaf size={14} />
          <span>SUSTAINABLE HARVEST • ARTISAN PANTRY</span>
        </span>
        <h2 className="editorial-promo-title">
          Slow Living, Honest Cooking
        </h2>
        <p className="editorial-promo-desc">
          When ingredients are grown with patient soil care, food simply tastes deeper. Fill your family table with unadulterated cold-pressed oils, single-origin grains, and garden-fresh greens.
        </p>

        <div className="editorial-promo-cta-row">
          <a href="#catalog-section" className="btn-promo-primary">
            <span>Explore Pantry Essentials</span>
            <ArrowRight size={16} />
          </a>
          <div className="editorial-promo-badge">
            <HeartHandshake size={16} />
            <span>Guaranteed zero chemical after-ripening</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialBanner;
