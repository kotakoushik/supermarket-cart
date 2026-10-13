import React, { useEffect, useState } from 'react';
import { X, Sparkles, TrendingDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';

const AlternativeModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!product) return;

    const fetchAlternatives = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/products/${product.id}/alternatives`);
        setAlternatives(res.data);
      } catch (err) {
        setError(err.message || 'Could not load alternatives');
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [product]);

  if (!product) return null;

  const handleAddAlternative = async (altId) => {
    const success = await addToCart(altId, 1);
    if (success) {
      setAddedId(altId);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alt-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--brand-forest)" aria-hidden="true" />
            <h2 id="alt-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Verified Economical Alternatives
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Comparing Against:</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>{product.name}</span>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>₹{Number(product.price).toFixed(2)}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }} role="status">
            Analyzing cheaper active alternatives in {product.category}...
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', padding: '16px', textAlign: 'center' }} role="alert">{error}</div>
        ) : alternatives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 16px', background: 'var(--brand-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand-border)', color: 'var(--brand-forest)' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 8px', display: 'block' }} aria-hidden="true" />
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Best Value in Category!</h4>
            <p style={{ fontSize: '0.88rem' }}>
              <strong>{product.name}</strong> is already the most economical verified active option in <strong>{product.category}</strong>.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alternatives.map((alt) => (
              <div
                key={alt.alternativeProductId}
                style={{
                  border: '1px solid var(--brand-border)',
                  background: 'var(--brand-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-forest)' }}>
                      {alt.alternativeProductName}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Category: {alt.category} | In Stock: {alt.stockQuantity}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-forest)' }}>
                      ₹{Number(alt.alternativePrice).toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--brand-forest)',
                        background: '#ffffff',
                        border: '1px solid var(--brand-border)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '3px',
                      }}
                    >
                      <TrendingDown size={11} aria-hidden="true" />
                      Save ₹{Number(alt.savingsAmount).toFixed(2)} ({alt.savingsPercentage}%)
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--brand-forest)', background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--brand-border)' }}>
                  <strong>Rule Explanation:</strong> {alt.reason}
                </p>

                <button
                  type="button"
                  className="btn-add-cart"
                  style={{ alignSelf: 'flex-end', background: 'var(--brand-forest)' }}
                  onClick={() => handleAddAlternative(alt.alternativeProductId)}
                  disabled={addedId === alt.alternativeProductId}
                >
                  {addedId === alt.alternativeProductId ? (
                    <>
                      <CheckCircle2 size={15} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      Add Cheaper Option <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlternativeModal;
