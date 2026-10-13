import React from 'react';
import { Bot, ArrowRight, Sparkles, Scale, TrendingDown, Check } from 'lucide-react';
import { useCart } from '../context/useCart';

const AnalystBanner = () => {
  const { openAnalyst, budget, cart } = useCart();

  return (
    <section className="analyst-editorial-banner" aria-label="Smart Grocery Assistant">
      <div className="analyst-banner-inner">
        <div className="analyst-banner-content">
          <div className="analyst-pill-tag">
            <Bot size={15} />
            <span>RULE-BASED CART AUDIT</span>
          </div>
          <h2 className="analyst-banner-title">
            Smart Grocery Planning, Zero Gimmicks
          </h2>
          <p className="analyst-banner-text">
            Our transparent cart audit engine analyzes your grocery basket in real-time. It separates nutritional essentials from discretionary items, audits unit prices, and suggests economical brand alternatives to keep you within your ₹{budget || 1000} target budget.
          </p>

          <div className="analyst-banner-features">
            <div className="analyst-feat-item">
              <Scale size={16} />
              <span>Essential vs. Optional Classification</span>
            </div>
            <div className="analyst-feat-item">
              <TrendingDown size={16} />
              <span>Verified Brand Substitution Savings</span>
            </div>
            <div className="analyst-feat-item">
              <Check size={16} />
              <span>Full Review Before Any Change</span>
            </div>
          </div>

          <div className="analyst-banner-actions">
            <button
              type="button"
              onClick={openAnalyst}
              className="btn-analyst-launch"
              aria-label="Audit Current Cart"
            >
              <Sparkles size={16} />
              <span>Analyze Current Cart ({cart.totalItems || 0} Items)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="analyst-banner-preview">
          <div className="analyst-preview-card">
            <div className="analyst-preview-header">
              <span className="analyst-chip-budget">Live Budget Track</span>
              <span className="analyst-preview-val">₹{Number(cart.totalAmount || 0).toFixed(0)} / ₹{budget || 1000}</span>
            </div>
            <div className="analyst-preview-bar-track">
              <div
                className="analyst-preview-bar-fill"
                style={{
                  width: `${Math.min(100, Math.round(((cart.totalAmount || 0) / (budget || 1000)) * 100))}%`,
                  background: (cart.totalAmount || 0) > (budget || 1000) ? 'var(--accent-terracotta)' : 'var(--brand-forest)'
                }}
              />
            </div>
            <div className="analyst-preview-insight">
              <p>
                <strong>Cart Intelligence:</strong>{' '}
                {(cart.totalAmount || 0) > (budget || 1000)
                  ? `Over budget by ₹${((cart.totalAmount || 0) - (budget || 1000)).toFixed(2)}. Open Analyst for alternatives.`
                  : `₹${((budget || 1000) - (cart.totalAmount || 0)).toFixed(2)} remaining budget available.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalystBanner;
