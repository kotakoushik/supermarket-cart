import React, { useEffect, useState, useMemo } from 'react';
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
  HelpCircle,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';

const ShoppingAnalystPanel = () => {
  const {
    cart,
    budget,
    updateBudget,
    isAnalystOpen,
    closeAnalyst,
    refreshCart,
    showToast,
  } = useCart();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manual category overrides map: { productId: boolean (isEssential) }
  const [customOverrides, setCustomOverrides] = useState({});

  // Set of selected action IDs to apply: Set of action.id
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

  // Fetch analysis report
  const fetchAnalysis = async (overrides = customOverrides) => {
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
      setError(err.message || 'Analysis failed. Please check network and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAnalystOpen) {
      fetchAnalysis(customOverrides);
    }
  }, [isAnalystOpen, cart.totalItems, cart.totalAmount, budget]);

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
              }}
              aria-hidden="true"
            >
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 id="analyst-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  AI Shopping Analyst
                </h2>
                <span
                  style={{
                    background: 'var(--brand-surface)',
                    color: 'var(--brand-forest)',
                    border: '1px solid var(--brand-border)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Rule-Based Audit
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Deterministic budget tracking, staple protection & verified savings
              </p>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={closeAnalyst}
            aria-label="Close AI Shopping Analyst"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="analyst-drawer-body">
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }} role="status">
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--brand-forest)' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Analyzing Cart Items & Category Rules...</h4>
              <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Evaluating essentials, optional items, and cheaper verified alternatives.</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div
              style={{
                background: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '18px',
                borderRadius: 'var(--radius-md)',
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
                  background: 'var(--danger)',
                  color: 'white',
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* Empty Cart State */}
          {isCartEmpty && !loading && !error && (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                background: 'white',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            >
              <ShoppingBag size={48} color="var(--text-subtle)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                Your Cart is Empty
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 18px' }}>
                Add items from our catalog to receive intelligent budget balancing and substitution suggestions.
              </p>
              <button
                type="button"
                onClick={closeAnalyst}
                style={{
                  background: 'var(--brand-forest)',
                  color: 'white',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                Browse Catalog
              </button>
            </div>
          )}

          {/* Full Analysis Content */}
          {!isCartEmpty && !loading && report && (
            <>
              {/* 1. Expenditure Breakdown */}
              <section
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                }}
                aria-label="Budget Analysis"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--brand-forest)" />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>Expenditure Breakdown</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Budget:</span>
                    <div className="budget-input-wrapper" style={{ width: '100px' }}>
                      <span className="budget-currency-symbol">₹</span>
                      <input
                        type="number"
                        min="1"
                        className="budget-input"
                        style={{ width: '100%', padding: '5px 8px 5px 22px', fontSize: '0.85rem' }}
                        value={budget}
                        onChange={(e) => updateBudget(e.target.value)}
                        aria-label="Shopping budget"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="budget-progress-container" style={{ height: '7px', marginBottom: '12px' }}>
                  <div
                    className="budget-progress-bar"
                    style={{
                      width: `${Math.min(100, Math.round((currentTotal / budgetNum) * 100))}%`,
                      backgroundColor: currentTotal > budgetNum ? 'var(--danger)' : currentTotal > budgetNum * 0.85 ? 'var(--accent-amber)' : 'var(--brand-forest)',
                    }}
                  />
                </div>

                {/* Stat Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                  <div style={{ background: 'white', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Current Total</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{currentTotal.toFixed(2)}</span>
                  </div>

                  <div style={{ background: 'white', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Core Essentials</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-forest)' }}>₹{Number(report.essentialSubtotal).toFixed(2)}</span>
                  </div>

                  <div style={{ background: 'white', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Optional / Treats</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)' }}>₹{Number(report.optionalSubtotal).toFixed(2)}</span>
                  </div>

                  <div style={{ background: 'white', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Budget Delta</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: report.overBudget ? 'var(--danger)' : 'var(--brand-forest)' }}>
                      {report.overBudget ? `+₹${Number(report.budgetDifference).toFixed(2)} Over` : `₹${(budgetNum - currentTotal).toFixed(2)} Left`}
                    </span>
                  </div>
                </div>

                {/* Plain-English Assessment */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: report.overBudget ? 'var(--danger-light)' : 'var(--brand-surface)',
                    border: report.overBudget ? '1px solid var(--danger-border)' : '1px solid var(--brand-border)',
                    color: report.overBudget ? 'var(--danger)' : 'var(--brand-forest)',
                    fontSize: '0.85rem',
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
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Cart Categorization & Manual Review
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tap pill to override status
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {/* Essentials Column */}
                  <div style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--brand-forest)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <ShieldCheck size={15} /> Core Essentials ({report.essentialItemCount})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                      {report.items.filter((i) => i.essential).length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No items marked as essential.</span>
                      ) : (
                        report.items.filter((i) => i.essential).map((item) => (
                          <div key={item.productId} style={{ background: 'white', border: '1px solid var(--brand-border)', padding: '6px 8px', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-forest)' }}>{item.productName}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} • ₹{Number(item.subtotal).toFixed(2)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleEssential(item.productId, true)}
                              title="Click to classify as optional"
                              style={{ fontSize: '0.7rem', background: 'var(--brand-surface)', color: 'var(--brand-forest)', padding: '2px 7px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid var(--brand-border)' }}
                            >
                              Essential ⇄
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Optional Column */}
                  <div style={{ background: 'var(--accent-amber-light)', border: '1px solid var(--accent-amber-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Coffee size={15} /> Discretionary / Optional ({report.optionalItemCount})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                      {report.items.filter((i) => !i.essential).length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No items marked as optional.</span>
                      ) : (
                        report.items.filter((i) => !i.essential).map((item) => (
                          <div key={item.productId} style={{ background: 'white', border: '1px solid var(--accent-amber-border)', padding: '6px 8px', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{item.productName}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} • ₹{Number(item.subtotal).toFixed(2)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleEssential(item.productId, false)}
                              title="Click to protect as essential"
                              style={{ fontSize: '0.7rem', background: 'var(--accent-amber-light)', color: 'var(--accent-amber)', padding: '2px 7px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid var(--accent-amber-border)' }}
                            >
                              Optional ⇄
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Proposed Recommendations Plan */}
              <section aria-label="Optimization Recommendations">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Proposed Optimizations ({report.recommendedActions.length})
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      style={{ fontSize: '0.76rem', color: 'var(--brand-forest)', background: 'var(--brand-surface)', padding: '4px 9px', borderRadius: 'var(--radius-xs)', fontWeight: 700, border: '1px solid var(--brand-border)' }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      style={{ fontSize: '0.76rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '4px 9px', borderRadius: 'var(--radius-xs)', fontWeight: 600, border: '1px solid var(--border)' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {report.recommendedActions.length === 0 ? (
                  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={28} color="var(--brand-forest)" style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>Cart Already Optimized!</p>
                    <p style={{ fontSize: '0.82rem' }}>No further substitute swaps or item reductions needed.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {report.recommendedActions.map((action) => {
                      const isChecked = selectedActionIds.has(action.id);
                      return (
                        <div
                          key={action.id}
                          onClick={() => handleToggleAction(action.id)}
                          style={{
                            background: isChecked ? 'var(--brand-surface)' : 'white',
                            border: isChecked ? '1.5px solid var(--brand-forest)' : '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'var(--transition-fast)',
                          }}
                        >
                          <div style={{ color: isChecked ? 'var(--brand-forest)' : 'var(--text-subtle)' }}>
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-xs)',
                                  background: action.actionType === 'REPLACE' ? '#eff6ff' : action.actionType === 'REDUCE_QUANTITY' ? 'var(--accent-amber-light)' : 'var(--danger-light)',
                                  color: action.actionType === 'REPLACE' ? '#1d4ed8' : action.actionType === 'REDUCE_QUANTITY' ? 'var(--accent-amber)' : 'var(--danger)',
                                }}
                              >
                                {action.actionType === 'REPLACE' ? 'Swap Option' : action.actionType === 'REDUCE_QUANTITY' ? 'Reduce Qty' : 'Remove Item'}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{action.label}</span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {action.reason}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--brand-forest)' }}>
                              -₹{Number(action.estimatedSavings).toFixed(2)}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Save</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* Drawer Sticky Footer with Live Calculation & Actions */}
        {!isCartEmpty && !loading && report && (
          <div className="analyst-drawer-footer">
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Projected Total ({liveCalculation.count} selected)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{liveCalculation.projectedTotal.toFixed(2)}
                </span>
                {liveCalculation.savings > 0 && (
                  <span style={{ color: 'var(--brand-forest)', fontSize: '0.85rem', fontWeight: 700 }}>
                    (Save ₹{liveCalculation.savings.toFixed(2)})
                  </span>
                )}
                {liveCalculation.projectedTotal <= budgetNum && (
                  <span style={{ background: 'var(--brand-surface)', color: 'var(--brand-forest)', border: '1px solid var(--brand-border)', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
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
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Keep Current Cart
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={applying || liveCalculation.count === 0}
                style={{
                  background: liveCalculation.count === 0 ? 'var(--border)' : 'var(--brand-forest)',
                  color: liveCalculation.count === 0 ? 'var(--text-subtle)' : 'white',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: liveCalculation.count === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Review & Apply ({liveCalculation.count}) <ArrowRight size={15} />
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
          style={{ zIndex: 130 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '24px' }}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Confirm Cart Optimizations
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close review dialog"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Review the selected changes below. No substitutions will take effect until confirmed:
            </p>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
              {report?.recommendedActions
                ?.filter((a) => selectedActionIds.has(a.id))
                .map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
                    <span>{a.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-forest)' }}>Save ₹{Number(a.estimatedSavings).toFixed(2)}</span>
                  </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', fontSize: '0.92rem' }}>
              <span>Projected Cart Total:</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{liveCalculation.projectedTotal.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
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
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
