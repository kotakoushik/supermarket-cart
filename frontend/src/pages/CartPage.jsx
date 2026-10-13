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
  CheckCircle,
  RefreshCw,
  Bot,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
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
    // 1. Remove original
    await removeFromCart(originalProductId);
    // 2. Add alternative
    await addToCart(alternativeProductId, 1);
  };

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '20px' }}>
        Your Shopping Cart
      </h1>

      <BudgetBanner />

      {!hasItems ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '40px',
          }}
        >
          <ShoppingBag size={56} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Your cart is empty</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Explore our wide range of groceries and essentials with smart budget savings!
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#059669',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 700,
            }}
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items Section */}
          <div className="cart-items-card">
            <div className="cart-header">
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Cart Items ({cart.totalItems})
              </span>
              <button
                onClick={clearCart}
                style={{
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={15} /> Clear All
              </button>
            </div>

            <div className="cart-items-list">
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                      alt={item.productName}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <h4>{item.productName}</h4>
                      <p>
                        Category: {item.category} • ₹{Number(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="cart-qty-controls">
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={loading}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-qty-num">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.availableStock}
                      title={item.quantity >= item.availableStock ? 'Max stock reached' : ''}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    ₹{Number(item.subtotal).toFixed(2)}
                  </div>

                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={loading}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Smart Cheaper Alternatives in Cart */}
            {budgetResult && budgetResult.suggestedAlternatives && budgetResult.suggestedAlternatives.length > 0 && (
              <div style={{ marginTop: '28px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={20} color="#059669" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}>
                    AI Money-Saving Swaps for Your Cart
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '14px' }}>
                  Swap high-cost cart items with these verified cheaper alternatives to reduce your bill:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {budgetResult.suggestedAlternatives.map((alt) => (
                    <div
                      key={alt.alternativeProductId}
                      style={{
                        background: 'white',
                        border: '1px solid #dcfce7',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          Swap with: <span style={{ color: '#059669' }}>{alt.alternativeProductName}</span> (₹{Number(alt.alternativePrice).toFixed(2)})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Original: {alt.originalProductName} (₹{Number(alt.originalPrice).toFixed(2)}) • <strong>Save ₹{Number(alt.savingsAmount).toFixed(2)} ({alt.savingsPercentage}%)</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSwapToCheaper(alt.originalProductId, alt.alternativeProductId)}
                        style={{
                          background: '#059669',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <TrendingDown size={14} /> 1-Click Swap
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-summary-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Order Summary
            </h3>

            <div className="summary-row">
              <span>Items Total:</span>
              <span>₹{Number(cart.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
            </div>

            <div className="summary-row">
              <span>GST & Taxes:</span>
              <span>₹0.00</span>
            </div>

            <div className="summary-row total">
              <span>Total Payable:</span>
              <span>₹{Number(cart.totalAmount || 0).toFixed(2)}</span>
            </div>

            <button
              onClick={openAnalyst}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                cursor: 'pointer',
              }}
              title="Open FreshCart AI Shopping Analyst"
            >
              <Bot size={18} /> AI Analyse My Cart
            </button>

            <button
              className="btn-checkout"
              onClick={() => navigate('/checkout')}
              disabled={loading}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/" style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 600 }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Complementary Items */}
      {recommendations.length > 0 && (
        <section style={{ marginTop: '48px', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sparkles size={22} color="#059669" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              AI Complementary Recommendations
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Frequently paired items based on your current cart selection.
          </p>

          <div className="products-grid">
            {recommendations.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <img
                  src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                  alt={prod.name}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {prod.category}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{prod.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{Number(prod.price).toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(prod.id, 1)}
                    style={{
                      background: '#059669',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CartPage;
