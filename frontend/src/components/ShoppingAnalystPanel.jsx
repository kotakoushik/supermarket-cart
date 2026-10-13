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

  // Applying state
  const [applying, setApplying] = useState(false);

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

      // By default, select all recommended actions so user sees immediate solution
      if (res.data.recommendedActions && res.data.recommendedActions.length > 0) {
        const initialSelected = new Set(res.data.recommendedActions.map((a) => a.id));
        setSelectedActionIds(initialSelected);
      } else {
        setSelectedActionIds(new Set());
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

  // Toggle selection of a proposed action
  const handleToggleAction = (actionId) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      return next;
    });
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

  // Apply selected changes
  const handleApplyChanges = async () => {
    if (!report || selectedActionIds.size === 0) return;

    const chosenActions = report.recommendedActions.filter((a) =>
      selectedActionIds.has(a.id)
    );

    if (chosenActions.length === 0) {
      showToast('No actions selected to apply', 'info');
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
        `Applied ${chosenActions.length} change(s)! Estimated savings: ₹${liveCalculation.savings.toFixed(2)}`,
        'success'
      );
      closeAnalyst();
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
    <div className="modal-overlay" onClick={closeAnalyst} style={{ zIndex: 120 }}>
      <div
        className="modal-content analyst-panel-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '92vh',
          padding: '28px',
          borderRadius: '20px',
        }}
      >
        {/* Header */}
        <div className="analyst-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', pb: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669, #0284c7)', color: 'white', padding: '10px', borderRadius: '14px', display: 'flex' }}>
              <Bot size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  FreshCart AI Shopping Analyst
                </h2>
                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                  Smart Cart Audit
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Deterministic cart optimization, staple protection & rule-based budget balancing
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={closeAnalyst}>
            <X size={22} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#059669' }} />
            <h4 style={{ fontWeight: 700, color: '#0f172a' }}>Analyzing Cart Items & Category Rules...</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Evaluating essentials, optional items, and cheaper verified alternatives.</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <AlertTriangle size={28} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700 }}>{error}</p>
            <button
              onClick={() => fetchAnalysis(customOverrides)}
              style={{ marginTop: '12px', background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Empty Cart State */}
        {isCartEmpty && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <ShoppingBag size={50} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Your Cart is Currently Empty
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Add some dairy, produce, snacks or household essentials to your cart, and the AI Shopping Analyst will audit your expenditure and find savings!
            </p>
            <button
              onClick={closeAnalyst}
              style={{
                background: '#059669',
                color: 'white',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Browse Supermarket Items
            </button>
          </div>
        )}

        {/* Full Analysis Content */}
        {!isCartEmpty && !loading && report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* 1. Executive Summary & Budget Bar */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#059669" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Expenditure Breakdown</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Budget:</span>
                  <div className="budget-input-wrapper" style={{ width: '110px' }}>
                    <span className="budget-currency-symbol">₹</span>
                    <input
                      type="number"
                      min="1"
                      className="budget-input"
                      style={{ width: '100%', padding: '6px 8px 6px 24px', fontSize: '0.88rem' }}
                      value={budget}
                      onChange={(e) => updateBudget(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="budget-progress-container" style={{ height: '8px', marginBottom: '12px' }}>
                <div
                  className="budget-progress-bar"
                  style={{
                    width: `${Math.min(100, Math.round((currentTotal / budgetNum) * 100))}%`,
                    backgroundColor: currentTotal > budgetNum ? '#ef4444' : currentTotal > budgetNum * 0.85 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>

              {/* Stat Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '10px' }}>
                <div style={{ background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Current Total</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>₹{currentTotal.toFixed(2)}</span>
                </div>

                <div style={{ background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Core Essentials</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>₹{Number(report.essentialSubtotal).toFixed(2)}</span>
                </div>

                <div style={{ background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Optional / Treats</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>₹{Number(report.optionalSubtotal).toFixed(2)}</span>
                </div>

                <div style={{ background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Budget Status</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: report.overBudget ? '#dc2626' : '#16a34a' }}>
                    {report.overBudget ? `+₹${Number(report.budgetDifference).toFixed(2)} Over` : `₹${(budgetNum - currentTotal).toFixed(2)} Left`}
                  </span>
                </div>
              </div>

              {/* Explainable Summary Note */}
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: report.overBudget ? '#fef2f2' : '#f0fdf4',
                  border: report.overBudget ? '1px solid #fecaca' : '1px solid #bbf7d0',
                  color: report.overBudget ? '#991b1b' : '#166534',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                {report.overBudget ? <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>
                  <strong>Analyst Assessment: </strong>
                  <span>{report.summaryMessage}</span>
                </div>
              </div>
            </div>

            {/* 2. Categorization Review with Manual Overrides */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Cart Categorization & Manual Review
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Click badge to override item classification
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Essentials Column */}
                <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
                    <ShieldCheck size={16} /> Everyday Essentials ({report.essentialItemCount})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {report.items.filter((i) => i.essential).length === 0 ? (
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No essentials detected.</span>
                    ) : (
                      report.items.filter((i) => i.essential).map((item) => (
                        <div key={item.productId} style={{ background: 'white', border: '1px solid #bbf7d0', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} • ₹{Number(item.subtotal).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => handleToggleEssential(item.productId, true)}
                            title="Click to mark as optional"
                            style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}
                          >
                            Essential ⇄
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Optional / Treats Column */}
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#92400e', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Coffee size={16} /> Discretionary / Optional ({report.optionalItemCount})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {report.items.filter((i) => !i.essential).length === 0 ? (
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No optional items in cart.</span>
                    ) : (
                      report.items.filter((i) => !i.essential).map((item) => (
                        <div key={item.productId} style={{ background: 'white', border: '1px solid #fde68a', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#78350f' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} • ₹{Number(item.subtotal).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => handleToggleEssential(item.productId, false)}
                            title="Click to mark as essential"
                            style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}
                          >
                            Optional ⇄
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Actionable Recommendations Plan */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Proposed Cart Optimizations ({report.recommendedActions.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                  Select suggestions to adopt
                </span>
              </div>

              {report.recommendedActions.length === 0 ? (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 700, color: '#0f172a' }}>Cart is Already Optimized!</p>
                  <p style={{ fontSize: '0.85rem' }}>No cheaper alternative swaps or item reductions necessary for this selection.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {report.recommendedActions.map((action) => {
                    const isChecked = selectedActionIds.has(action.id);
                    return (
                      <div
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        style={{
                          background: isChecked ? '#f0fdf4' : 'white',
                          border: isChecked ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ color: isChecked ? '#059669' : '#94a3b8' }}>
                          {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: action.actionType === 'REPLACE' ? '#dbeafe' : action.actionType === 'REDUCE_QUANTITY' ? '#fef3c7' : '#fee2e2',
                                color: action.actionType === 'REPLACE' ? '#1d4ed8' : action.actionType === 'REDUCE_QUANTITY' ? '#b45309' : '#b91c1c',
                              }}
                            >
                              {action.actionType === 'REPLACE' ? 'Swap Option' : action.actionType === 'REDUCE_QUANTITY' ? 'Reduce Qty' : 'Remove Item'}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{action.label}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                            {action.reason}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>
                            -₹{Number(action.estimatedSavings).toFixed(2)}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Estimated Savings</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Live Calculation & Apply Bar */}
            <div
              style={{
                background: '#0f172a',
                color: 'white',
                borderRadius: '16px',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Projected Cart ({liveCalculation.count} selected changes)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    ₹{liveCalculation.projectedTotal.toFixed(2)}
                  </span>
                  {liveCalculation.savings > 0 && (
                    <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 700 }}>
                      (Save ₹{liveCalculation.savings.toFixed(2)})
                    </span>
                  )}
                  {liveCalculation.projectedTotal <= budgetNum && (
                    <span style={{ background: '#059669', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                      ✓ Within Budget!
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={closeAnalyst}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#334155',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Keep Cart As Is
                </button>

                <button
                  onClick={handleApplyChanges}
                  disabled={applying || liveCalculation.count === 0}
                  style={{
                    background: liveCalculation.count === 0 ? '#475569' : '#10b981',
                    color: 'white',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: liveCalculation.count === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {applying ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Applying...
                    </>
                  ) : (
                    <>
                      Apply {liveCalculation.count} Changes <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingAnalystPanel;
