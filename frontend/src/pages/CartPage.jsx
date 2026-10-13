import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Bot,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '../context/useCart';
import apiClient from '../api/client';
import BudgetBanner from '../components/BudgetBanner';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading, budgetResult, addToCart, openAnalyst } = useCart();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fetch complementary product recommendations based on cart
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoadingRecs(true);
        const res = await apiClient.get('/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecs();
  }, [cart.totalItems]);

  const handleSwapToCheaper = async (originalProductId, alternativeProductId) => {
    await removeFromCart(originalProductId);
    await addToCart(alternativeProductId, 1);
  };

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <main className="container" style={{ paddingTop: '28px', marginBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Your Supermarket Cart
        </h1>
        {hasItems && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in basket
          </span>
        )}
      </div>

      <BudgetBanner />

      {!hasItems ? (
        <section
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: '40px',
          }}
          aria-label="Empty Cart"
        >
          <ShoppingBag size={56} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
            Your cart is empty
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
            Explore fresh vegetables, dairy, pantry staples, and household products with instant budget tracking.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--brand-forest)',
              color: 'white',
              padding: '11px 24px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.92rem',
            }}
          >
            Start Shopping <ArrowRight size={17} />
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          {/* Items Section */}
          <section className="cart-items-card" aria-label="Cart Items">
            <div className="cart-header">
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Cart Items ({cart.totalItems})
              </span>
              <button
                type="button"
                onClick={clearCart}
                style={{
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-label="Clear all items from cart"
              >
                <Trash2 size={15} /> Clear All
              </button>
            </div>

            <div className="cart-items-list" role="list">
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item-row" role="listitem">
                  <div className="cart-item-info">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                      alt={item.productName}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <h4>{item.productName}</h4>
                      <p>
                        {item.category} • ₹{Number(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="cart-qty-controls" aria-label={`Quantity for ${item.productName}`}>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={loading}
                      aria-label={`Decrease quantity of ${item.productName}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-qty-num" aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.availableStock}
                      title={item.quantity >= item.availableStock ? 'Max stock reached' : ''}
                      aria-label={`Increase quantity of ${item.productName}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    ₹{Number(item.subtotal).toFixed(2)}
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={loading}
                    title="Remove item"
                    aria-label={`Remove ${item.productName} from cart`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            {/* Smart Cheaper Alternatives in Cart */}
            {budgetResult && budgetResult.suggestedAlternatives && budgetResult.suggestedAlternatives.length > 0 && (
              <div
                style={{
                  marginTop: '28px',
                  background: 'var(--brand-surface)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={18} color="var(--brand-forest)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-forest)' }}>
                    Smart Money-Saving Substitutes
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Swap high-cost items with verified economical substitutes in the same category:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {budgetResult.suggestedAlternatives.map((alt) => (
                    <div
                      key={alt.alternativeProductId}
                      style={{
                        background: 'white',
                        border: '1px solid var(--brand-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          Swap with: <strong style={{ color: 'var(--brand-forest)' }}>{alt.alternativeProductName}</strong> (₹{Number(alt.alternativePrice).toFixed(2)})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Original: {alt.originalProductName} (₹{Number(alt.originalPrice).toFixed(2)}) • <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>Save ₹{Number(alt.savingsAmount).toFixed(2)} ({alt.savingsPercentage}%)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSwapToCheaper(alt.originalProductId, alt.alternativeProductId)}
                        style={{
                          background: 'var(--brand-forest)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <TrendingDown size={14} /> Swap & Save
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Order Summary Sidebar */}
          <aside className="order-summary-card" aria-label="Order Summary">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Order Summary
            </h2>

            <div className="summary-row">
              <span>Items Subtotal:</span>
              <span>₹{Number(cart.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Express Delivery:</span>
              <span style={{ color: 'var(--brand-forest)', fontWeight: 700 }}>FREE</span>
            </div>

            <div className="summary-row">
              <span>GST & Packaging:</span>
              <span>₹0.00</span>
            </div>

            <div className="summary-row total">
              <span>Total Payable:</span>
              <span>₹{Number(cart.totalAmount || 0).toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={openAnalyst}
              style={{
                width: '100%',
                background: 'var(--accent-amber-light)',
                border: '1px solid var(--accent-amber-border)',
                color: 'var(--accent-amber)',
                padding: '11px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                cursor: 'pointer',
              }}
              title="Open FreshCart AI Shopping Analyst"
            >
              <Bot size={17} /> Run AI Cart Optimization
            </button>

            <button
              type="button"
              className="btn-checkout"
              onClick={() => navigate('/checkout')}
              disabled={loading}
              aria-label="Proceed to Checkout"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={17} />
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/" style={{ fontSize: '0.88rem', color: 'var(--brand-forest)', fontWeight: 600 }}>
                ← Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Recommended Complementary Items */}
      {recommendations.length > 0 && (
        <section style={{ marginTop: '40px', marginBottom: '40px' }} aria-label="Recommended Groceries">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={20} color="var(--brand-forest)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recommended Add-ons
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Frequently paired items based on your current cart selection:
          </p>

          <div className="products-grid">
            {recommendations.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <img
                  src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                  alt={prod.name}
                  style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  loading="lazy"
                />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {prod.category}
                </span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>{prod.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>₹{Number(prod.price).toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => addToCart(prod.id, 1)}
                    style={{
                      background: 'var(--brand-forest)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default CartPage;
