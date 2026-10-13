import React from 'react';
import { Sprout, Clock, ShieldCheck, Recycle } from 'lucide-react';

const FarmPhilosophy = () => {
  return (
    <section className="philosophy-section" id="story-section" aria-label="Our Farm to Table Philosophy">
      <div className="section-header-editorial">
        <span className="eyebrow-tag">THE FRESHCART PROMISE</span>
        <h2 className="editorial-section-title">Rooted in Nature, Grown for Wellbeing</h2>
        <p className="editorial-section-desc">
          We bypass multi-tiered wholesale markets to connect family farms directly with your pantry.
        </p>
      </div>

      <div className="philosophy-grid">
        <div className="philosophy-card">
          <div className="philosophy-icon">
            <Sprout size={24} />
          </div>
          <span className="philosophy-step">01 / DIRECT HARVEST</span>
          <h3 className="philosophy-card-title">Direct Grower Alliances</h3>
          <p className="philosophy-card-desc">
            We partner with 40+ certified regional growers, paying fair farmgate prices while keeping retail prices transparent and affordable.
          </p>
        </div>

        <div className="philosophy-card">
          <div className="philosophy-icon">
            <Clock size={24} />
          </div>
          <span className="philosophy-step">02 / DAWN FRESHNESS</span>
          <h3 className="philosophy-card-title">Harvested Before Sunrise</h3>
          <p className="philosophy-card-desc">
            Tender greens and vegetables are harvested between 4:00 AM and 6:00 AM to preserve essential nutrients, crisp texture, and natural flavor.
          </p>
        </div>

        <div className="philosophy-card">
          <div className="philosophy-icon">
            <ShieldCheck size={24} />
          </div>
          <span className="philosophy-step">03 / BUDGET CLARITY</span>
          <h3 className="philosophy-card-title">Intelligent Cart Budgeting</h3>
          <p className="philosophy-card-desc">
            Real-time budget tracking and honest alternative recommendations ensure you get superior nutrition without surprise checkout totals.
          </p>
        </div>

        <div className="philosophy-card">
          <div className="philosophy-icon">
            <Recycle size={24} />
          </div>
          <span className="philosophy-step">04 / ECO CONSCIOUS</span>
          <h3 className="philosophy-card-title">100% Compostable Packaging</h3>
          <p className="philosophy-card-desc">
            Shipped in unbleached corrugated boxes and reusable kraft paper bags. Zero single-use plastics from packing to your front porch.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FarmPhilosophy;
