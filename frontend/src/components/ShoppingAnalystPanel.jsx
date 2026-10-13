import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Bot,
  X,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Coffee,
  ShoppingBag,
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Check,
  Scale,
} from 'lucide-react';
import { useCart } from '../context/useCart';
import apiClient from '../api/client';

const ShoppingAnalystPanel = () => {
  const {
    cart,
    budget,
    updateBudget,
    isAnalystOpen,
    closeAnalyst,
    refreshCart,
    addToCart,
    showToast,
  } = useCart();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recommendations from backend (GET /api/recommendations/cart)
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [addingRecId, setAddingRecId] = useState(null);

  // Manual category overrides map: { productId: boolean (isEssential) }
  const [customOverrides, setCustomOverrides] = useState({});

  // Set of selected action IDs to apply
  const [selectedActionIds, setSelectedActionIds] = useState(new Set());

  // Applying & confirmation step states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [applying, setApplying] = useState(false);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAnalystOpen) {
        if (showConfirmModal) {
          setShowConfirmModal(false);
        } else {
          closeAnalyst();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalystOpen, showConfirmModal, closeAnalyst]);

  // Fetch backend recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoadingRecs(true);
      // Support both /recommendations/cart and /recommendations
      const res = await apiClient.get('/recommendations/cart').catch(() => apiClient.get('/recommendations'));
      setRecommendations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not load recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  // Fetch analysis report from backend
  const fetchAnalysis = useCallback(async (overrides = customOverrides) => {
    if (!cart.items || cart.items.length === 0) {
      setReport(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post('/analyst/analyze', {
        cartId: cart.cartId,
        budget: budget && budget > 0 ? budget : 1000,
        customOverrides: overrides,
      });

      setReport(res.data);

      // Pre-select top non-conflicting actions only if the user hasn't made selections yet
      if (selectedActionIds.size === 0 && res.data.recommendedActions && res.data.recommendedActions.length > 0) {
        const initialSelected = new Set();
        const seenProducts = new Set();
        res.data.recommendedActions.forEach((a) => {
          if (!seenProducts.has(a.productId)) {
            initialSelected.add(a.id);
            seenProducts.add(a.productId);
          }
        });
        setSelectedActionIds(initialSelected);
      }
    } catch (err) {
      console.error('Failed to analyze cart:', err);
      setError(err.message || 'Analysis failed. Please check network connection and retry.');
    } finally {
      setLoading(false);
    }
  }, [cart.cartId, cart.items, budget, selectedActionIds.size, customOverrides]);

  // Load analysis and recommendations when drawer opens or cart changes
  useEffect(() => {
    if (isAnalystOpen) {
      fetchAnalysis(customOverrides);
      fetchRecommendations();
    }
  }, [isAnalystOpen, cart.totalItems, cart.totalAmount, budget, fetchAnalysis, fetchRecommendations, customOverrides]);

  // Add recommended product to basket
  const handleAddRecommendation = async (product) => {
    if (!product || product.stockQuantity <= 0) {
      showToast(`${product?.name || 'Product'} is currently out of stock`, 'error');
      return;
    }

    try {
      setAddingRecId(product.id);
      const ok = await addToCart(product.id, 1);
      if (ok) {
        showToast(`Added ${product.name} to basket!`, 'success');
        await refreshCart();
        await fetchAnalysis(customOverrides);
        await fetchRecommendations();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add product to basket', 'error');
    } finally {
      setAddingRecId(null);
    }
  };

  // Toggle user override for an item
  const handleToggleEssential = (productId, currentEssential) => {
    const updated = {
      ...customOverrides,
      [productId]: !currentEssential,
    };
    setCustomOverrides(updated);
    fetchAnalysis(updated);
  };

  // Toggle selection of a proposed action (mutually exclusive per product)
  const handleToggleAction = (actionId) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        const targetAction = report?.recommendedActions?.find((a) => a.id === actionId);
        if (targetAction) {
          // Deselect any other action targeting the same product ID to prevent conflicts
          report.recommendedActions.forEach((a) => {
            if (a.productId === targetAction.productId && a.id !== actionId) {
              next.delete(a.id);
            }
          });
        }
        next.add(actionId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!report?.recommendedActions) return;
    const allNonConflicting = new Set();
    const seenProducts = new Set();
    report.recommendedActions.forEach((a) => {
      if (!seenProducts.has(a.productId)) {
        allNonConflicting.add(a.id);
        seenProducts.add(a.productId);
      }
    });
    setSelectedActionIds(allNonConflicting);
  };

  const handleClearAll = () => {
    setSelectedActionIds(new Set());
  };

  // Calculate live projected total & savings based on user's checked actions
  const liveCalculation = useMemo(() => {
    if (!report || !report.recommendedActions) {
      return { savings: 0, projectedTotal: Number(cart.totalAmount || 0), count: 0 };
    }

    let calculatedSavings = 0;
    let count = 0;
    const processedProducts = new Set();

    report.recommendedActions.forEach((action) => {
      if (selectedActionIds.has(action.id) && !processedProducts.has(action.productId)) {
        calculatedSavings += Number(action.estimatedSavings || 0);
        processedProducts.add(action.productId);
        count++;
      }
    });

    const currentTotal = Number(report.currentTotal || cart.totalAmount || 0);
    const projected = Math.max(0, currentTotal - calculatedSavings);

    return {
      savings: calculatedSavings,
      projectedTotal: projected,
      count,
    };
  }, [report, selectedActionIds, cart.totalAmount]);

  // Execute selected changes
  const handleConfirmAndApply = async () => {
    if (!report || selectedActionIds.size === 0) return;

    const chosenActions = report.recommendedActions.filter((a) =>
      selectedActionIds.has(a.id)
    );

    if (chosenActions.length === 0) {
      showToast('No actions selected to apply', 'info');
      setShowConfirmModal(false);
      return;
    }

    try {
      setApplying(true);
      await apiClient.post('/analyst/apply', {
        cartId: cart.cartId,
        selectedActions: chosenActions,
      });

      await refreshCart();
      showToast(
        `Applied ${chosenActions.length} optimization(s)! Estimated savings: ₹${liveCalculation.savings.toFixed(2)}`,
        'success'
      );
      setSelectedActionIds(new Set());
      setShowConfirmModal(false);
      await fetchAnalysis(customOverrides);
      await fetchRecommendations();
    } catch (err) {
      showToast(err.message || 'Failed to apply changes', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (!isAnalystOpen) return null;

  const currentTotal = Number(cart.totalAmount || 0);
  const budgetNum = Number(budget || 1000);
  const isCartEmpty = !cart.items || cart.items.length === 0;

  return (
    <div
      className="analyst-drawer-overlay"
      onClick={closeAnalyst}
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyst-title"
    >
      <div className="analyst-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="analyst-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'var(--brand-forest)',
                color: 'white',
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                boxShadow: '0 4px 12px rgba(29, 61, 43, 0.2)',
              }}
              aria-hidden="true"
            >
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 id="analyst-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                  FreshCart Analyst
                </h2>
                <span
                  style={{
                    background: 'var(--brand-surface)',
                    color: 'var(--brand-forest)',
                    border: '1px solid var(--brand-border)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Rule-Based Audit
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Deterministic budget tracking, staple protection & verified savings
              </p>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={closeAnalyst}
            aria-label="Close AI Shopping Analyst"
            style={{
              background: 'var(--bg-warm)',
              border: '1px solid var(--border-soft)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="analyst-drawer-body">
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }} role="status">
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--brand-forest)' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Analyzing Cart Items & Category Rules...</h4>
              <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Evaluating essentials, optional items, and cheaper verified alternatives.</p>
            </div>
          )}

          {/* Error State with Retry Button */}
          {error && !loading && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '18px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
              }}
              role="alert"
            >
              <AlertTriangle size={24} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontWeight: 700 }}>{error}</p>
              <button
                type="button"
                onClick={() => fetchAnalysis(customOverrides)}
                style={{
                  marginTop: '10px',
                  background: '#b91c1c',
                  color: 'white',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* Empty Cart State + Popular Starter Recommendations */}
          {isCartEmpty && !loading && !error && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 20px',
                  background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-soft)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--brand-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--brand-forest)' }}>
                  <ShoppingBag size={28} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-forest)', marginBottom: '6px' }}>
                  Your Basket is Empty
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  Add fresh groceries from our catalog or choose from the popular essentials below to activate personalized budget balancing and brand substitution audits.
                </p>
                <button
                  type="button"
                  onClick={closeAnalyst}
                  style={{
                    background: 'var(--brand-forest)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Browse Store Aisles
                </button>
              </div>

              {/* Quick-Start Recommendations for Empty Cart */}
              {recommendations.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Sparkles size={16} color="var(--brand-forest)" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-forest)' }}>
                      Pantry Essentials to Kick-Start Your Cart
                    </span>
                  </div>

                  <div className="analyst-rec-grid">
                    {recommendations.slice(0, 4).map((product) => (
                      <div key={product.id} className="analyst-rec-card">
                        <img src={product.imageUrl} alt={product.name} className="analyst-rec-thumb" />
                        <div className="analyst-rec-info">
                          <span className="analyst-rec-cat">{product.category}</span>
                          <h5 className="analyst-rec-name">{product.name}</h5>
                          <div className="analyst-rec-price-row">
                            <span className="analyst-rec-price">₹{Number(product.price).toFixed(2)}</span>
                            <button
                              type="button"
                              className="btn-analyst-add-rec"
                              disabled={addingRecId === product.id || product.stockQuantity <= 0}
                              onClick={() => handleAddRecommendation(product)}
                            >
                              {addingRecId === product.id ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Plus size={12} />
                              )}
                              <span>{product.stockQuantity <= 0 ? 'Out of Stock' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Analysis Content */}
          {!isCartEmpty && !loading && report && (
            <>
              {/* 1. Expenditure Breakdown */}
              <section
                style={{
                  background: 'white',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                }}
                aria-label="Budget Analysis"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Scale size={16} color="var(--brand-forest)" />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--brand-forest)' }}>Expenditure Breakdown</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target Budget:</span>
                    <div style={{ position: 'relative', width: '105px' }}>
                      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>₹</span>
                      <input
                        type="number"
                        min="1"
                        style={{
                          width: '100%',
                          padding: '5px 8px 5px 22px',
                          fontSize: '0.85rem',
                          border: '1px solid var(--border-soft)',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--bg-warm)',
                          fontWeight: 700,
                          color: 'var(--brand-forest)',
                        }}
                        value={budget}
                        onChange={(e) => updateBudget(e.target.value)}
                        aria-label="Shopping budget"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-warm-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '14px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.round((currentTotal / budgetNum) * 100))}%`,
                      backgroundColor: currentTotal > budgetNum ? 'var(--accent-terracotta)' : currentTotal > budgetNum * 0.85 ? 'var(--accent-amber)' : 'var(--brand-forest)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                {/* Stat Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                  <div style={{ background: 'var(--bg-warm)', padding: '9px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Cart Total</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{currentTotal.toFixed(2)}</span>
                  </div>

                  <div style={{ background: 'var(--bg-warm)', padding: '9px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Core Staples</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-forest)' }}>₹{Number(report.essentialSubtotal).toFixed(2)}</span>
                  </div>

                  <div style={{ background: 'var(--bg-warm)', padding: '9px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Treats / Optional</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-amber)' }}>₹{Number(report.optionalSubtotal).toFixed(2)}</span>
                  </div>

                  <div style={{ background: 'var(--bg-warm)', padding: '9px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Budget Delta</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: report.overBudget ? 'var(--accent-terracotta)' : 'var(--brand-forest)' }}>
                      {report.overBudget ? `+₹${Number(report.budgetDifference).toFixed(2)}` : `₹${(budgetNum - currentTotal).toFixed(2)} Left`}
                    </span>
                  </div>
                </div>

                {/* Plain-English Assessment */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: report.overBudget ? '#fef2f2' : 'var(--brand-surface)',
                    border: report.overBudget ? '1px solid #fecaca' : '1px solid var(--brand-border)',
                    color: report.overBudget ? '#b91c1c' : 'var(--brand-forest)',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  {report.overBudget ? <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <div>
                    <strong>Summary: </strong>
                    <span>{report.summaryMessage}</span>
                  </div>
                </div>
              </section>

              {/* 2. Categorization Review with Manual Overrides */}
              <section aria-label="Cart Categorization">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                    Item Essentiality Audit ({cart.totalItems} Items)
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Click toggle to reclassify
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                  {/* Essentials Column */}
                  <div style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-xs)', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--brand-forest)', fontWeight: 700, fontSize: '0.82rem' }}>
                      <ShieldCheck size={14} /> Core Essentials ({report.essentialItemCount})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                      {report.items.filter((i) => i.essential).length === 0 ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>No items marked as essential.</span>
                      ) : (
                        report.items.filter((i) => i.essential).map((item) => (
                          <div key={item.productId} style={{ background: 'white', border: '1px solid var(--brand-border)', padding: '6px 8px', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-forest)' }}>{item.productName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} • ₹{Number(item.subtotal).toFixed(2)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleEssential(item.productId, true)}
                              title="Click to classify as optional"
                              style={{ fontSize: '0.68rem', background: 'var(--brand-surface)', color: 'var(--brand-forest)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid var(--brand-border)', cursor: 'pointer' }}
                            >
                              Staple ⇄
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Optional Column */}
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-xs)', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#b45309', fontWeight: 700, fontSize: '0.82rem' }}>
                      <Coffee size={14} /> Optional Treats ({report.optionalItemCount})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                      {report.items.filter((i) => !i.essential).length === 0 ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>No items marked as optional.</span>
                      ) : (
                        report.items.filter((i) => !i.essential).map((item) => (
                          <div key={item.productId} style={{ background: 'white', border: '1px solid #fef3c7', padding: '6px 8px', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309' }}>{item.productName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} • ₹{Number(item.subtotal).toFixed(2)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleEssential(item.productId, false)}
                              title="Click to protect as essential staple"
                              style={{ fontSize: '0.68rem', background: '#fffbeb', color: '#b45309', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid #fef3c7', cursor: 'pointer' }}
                            >
                              Treat ⇄
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Proposed Optimization Actions */}
              <section aria-label="Optimization Recommendations">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                    Proposed Cart Savings ({report.recommendedActions.length})
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      style={{ fontSize: '0.72rem', color: 'var(--brand-forest)', background: 'var(--brand-surface)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 700, border: '1px solid var(--brand-border)', cursor: 'pointer' }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'white', padding: '3px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 600, border: '1px solid var(--border-soft)', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {report.recommendedActions.length === 0 ? (
                  <div style={{ background: 'white', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-xs)', padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={24} color="var(--brand-forest)" style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontWeight: 700, color: 'var(--brand-forest)', fontSize: '0.88rem' }}>Cart Perfectly Balanced</p>
                    <p style={{ fontSize: '0.78rem' }}>No further substitute swaps or quantity reductions are needed.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                    {report.recommendedActions.map((action) => {
                      const isChecked = selectedActionIds.has(action.id);
                      return (
                        <div
                          key={action.id}
                          onClick={() => handleToggleAction(action.id)}
                          style={{
                            background: isChecked ? 'var(--brand-surface)' : 'white',
                            border: isChecked ? '1.5px solid var(--brand-forest)' : '1px solid var(--border-soft)',
                            borderRadius: 'var(--radius-xs)',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ color: isChecked ? 'var(--brand-forest)' : 'var(--text-muted)' }}>
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-xs)',
                                  background: action.actionType === 'REPLACE' ? '#eff6ff' : action.actionType === 'REDUCE_QUANTITY' ? '#fffbeb' : '#fef2f2',
                                  color: action.actionType === 'REPLACE' ? '#1d4ed8' : action.actionType === 'REDUCE_QUANTITY' ? '#b45309' : '#b91c1c',
                                }}
                              >
                                {action.actionType === 'REPLACE' ? 'Swap Option' : action.actionType === 'REDUCE_QUANTITY' ? 'Reduce Qty' : 'Remove Item'}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{action.label}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                              {action.reason}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                              -₹{Number(action.estimatedSavings).toFixed(2)}
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Save</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 4. Smart Basket Pairings (Complementary Recommendations from Backend) */}
              {recommendations.length > 0 && (
                <section aria-label="Complementary Recommendations">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Sparkles size={16} color="var(--brand-forest)" />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                      Smart Basket Pairings
                    </h3>
                  </div>

                  <div className="analyst-rec-grid">
                    {recommendations.slice(0, 4).map((product) => (
                      <div key={product.id} className="analyst-rec-card">
                        <img src={product.imageUrl} alt={product.name} className="analyst-rec-thumb" />
                        <div className="analyst-rec-info">
                          <span className="analyst-rec-cat">{product.category}</span>
                          <h5 className="analyst-rec-name">{product.name}</h5>
                          <div className="analyst-rec-price-row">
                            <span className="analyst-rec-price">₹{Number(product.price).toFixed(2)}</span>
                            <button
                              type="button"
                              className="btn-analyst-add-rec"
                              disabled={addingRecId === product.id || product.stockQuantity <= 0}
                              onClick={() => handleAddRecommendation(product)}
                            >
                              {addingRecId === product.id ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Plus size={12} />
                              )}
                              <span>{product.stockQuantity <= 0 ? 'Out of Stock' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Drawer Sticky Footer with Live Calculation & Actions */}
        {!isCartEmpty && !loading && report && (
          <div className="analyst-drawer-footer">
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Projected Total ({liveCalculation.count} selected)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                  ₹{liveCalculation.projectedTotal.toFixed(2)}
                </span>
                {liveCalculation.savings > 0 && (
                  <span style={{ color: 'var(--brand-forest)', fontSize: '0.82rem', fontWeight: 700 }}>
                    (Save ₹{liveCalculation.savings.toFixed(2)})
                  </span>
                )}
                {liveCalculation.projectedTotal <= budgetNum && (
                  <span style={{ background: 'var(--brand-surface)', color: 'var(--brand-forest)', border: '1px solid var(--brand-border)', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
                    ✓ In Budget
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={closeAnalyst}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'white',
                  border: '1px solid var(--border-soft)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Keep Current
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={applying || liveCalculation.count === 0}
                style={{
                  background: liveCalculation.count === 0 ? 'var(--border-soft)' : 'var(--brand-forest)',
                  color: liveCalculation.count === 0 ? 'var(--text-muted)' : 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: liveCalculation.count === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: liveCalculation.count === 0 ? 'none' : '0 4px 12px rgba(29, 61, 43, 0.25)',
                }}
              >
                Review & Apply ({liveCalculation.count}) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review & Final Confirmation Modal (Guarantees user verification before apply) */}
      {showConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '24px', background: 'white', borderRadius: 'var(--radius-sm)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
                Confirm Cart Optimizations
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close review dialog"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
              Review the selected changes below. No substitutions or removals will take effect until you confirm:
            </p>

            <div style={{ background: 'var(--bg-warm)', borderRadius: 'var(--radius-xs)', padding: '12px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
              {report?.recommendedActions
                ?.filter((a) => selectedActionIds.has(a.id))
                .map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-soft)', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-forest)' }}>Save ₹{Number(a.estimatedSavings).toFixed(2)}</span>
                  </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Projected Cart Total:</span>
              <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--brand-forest)' }}>₹{liveCalculation.projectedTotal.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'white',
                  border: '1px solid var(--border-soft)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmAndApply}
                disabled={applying}
                style={{
                  background: 'var(--brand-forest)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(29, 61, 43, 0.25)',
                }}
              >
                {applying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Applying...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Confirm & Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingAnalystPanel;
