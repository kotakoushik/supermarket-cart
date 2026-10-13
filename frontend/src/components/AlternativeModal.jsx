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
      }, 1200);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#059669" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Smart AI Cheaper Alternative</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Comparing Against:</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{product.name}</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>₹{Number(product.price).toFixed(2)}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
            Analyzing cheaper alternatives in {product.category}...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center' }}>{error}</div>
        ) : alternatives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 16px', background: '#f0fdf4', borderRadius: '12px', color: '#166534' }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 10px', display: 'block' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Best Value Product!</h4>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>{product.name}</strong> is already the most economical verified active option in the <strong>{product.category}</strong> category!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {alternatives.map((alt) => (
              <div
                key={alt.alternativeProductId}
                style={{
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#14532d' }}>
                      {alt.alternativeProductName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                      Category: {alt.category} | In Stock: {alt.stockQuantity}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#14532d' }}>
                      ₹{Number(alt.alternativePrice).toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#047857',
                        background: '#dcfce7',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                      }}
                    >
                      <TrendingDown size={12} />
                      Save ₹{Number(alt.savingsAmount).toFixed(2)} ({alt.savingsPercentage}%)
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#166534', background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '8px' }}>
                  💡 <strong>Rule Explanation:</strong> {alt.reason}
                </p>

                <button
                  className="btn-add-cart"
                  style={{ alignSelf: 'flex-end', background: '#059669' }}
                  onClick={() => handleAddAlternative(alt.alternativeProductId)}
                  disabled={addedId === alt.alternativeProductId}
                >
                  {addedId === alt.alternativeProductId ? (
                    <>
                      <CheckCircle2 size={16} /> Added!
                    </>
                  ) : (
                    <>
                      Add Cheaper Option <ArrowRight size={16} />
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
