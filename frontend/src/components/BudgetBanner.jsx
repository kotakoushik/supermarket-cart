import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp, Bot } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BudgetBanner = () => {
  const { cart, budget, budgetResult, updateBudget, openAnalyst } = useCart();

  const total = Number(cart.totalAmount || 0);
  const budgetVal = Number(budget || 0);

  const percentage = budgetVal > 0 ? Math.min(Math.round((total / budgetVal) * 100), 100) : 0;
  const isOver = budgetVal > 0 && total > budgetVal;
  const overAmount = isOver ? (total - budgetVal).toFixed(2) : 0;
  const remainingAmount = !isOver && budgetVal > 0 ? (budgetVal - total).toFixed(2) : 0;

  const getBarColor = () => {
    if (isOver) return 'var(--danger)';
    if (percentage > 85) return 'var(--accent-amber)';
    return 'var(--brand-forest)';
  };

  return (
    <section className="budget-widget" aria-label="Budget Tracker">
      <div className="budget-widget-header">
        <div className="budget-title-group">
          <div className="budget-icon-wrap" aria-hidden="true">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3>Smart Grocery Budget Tracker</h3>
            <p>Real-time expenditure monitoring & automated savings guidance</p>
          </div>
        </div>

        <div className="budget-inputs">
          <label htmlFor="budget-input" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            My Budget:
          </label>
          <div className="budget-input-wrapper">
            <span className="budget-currency-symbol">₹</span>
            <input
              id="budget-input"
              type="number"
              min="1"
              step="50"
              className="budget-input"
              value={budget}
              onChange={(e) => updateBudget(e.target.value)}
              placeholder="1000"
              aria-label="Target Grocery Budget in Rupees"
            />
          </div>

          <button
            type="button"
            onClick={openAnalyst}
            className="nav-analyst-pill"
            style={{ cursor: 'pointer' }}
            title="Open AI Shopping Analyst for in-depth cart review"
            aria-label="Open AI Shopping Analyst"
          >
            <Bot size={15} />
            <span>AI Audit</span>
          </button>
        </div>
      </div>

      <div
        className="budget-progress-container"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Budget used: ${percentage}%`}
      >
        <div
          className="budget-progress-bar"
          style={{
            width: `${percentage}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>

      <div className="budget-stats">
        <span>Cart: <strong>₹{total.toFixed(2)}</strong></span>
        <span>
          {isOver ? (
            <span style={{ color: 'var(--danger)' }}>Exceeded by ₹{overAmount}</span>
          ) : (
            <span style={{ color: 'var(--brand-forest)' }}>₹{remainingAmount} Remaining</span>
          )}
        </span>
        <span>Target: <strong>₹{budgetVal.toFixed(2)}</strong></span>
      </div>

      {budgetResult && isOver && (
        <div className="budget-warning-banner alert" role="alert">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div>
            <strong>Budget Exceeded by ₹{overAmount}</strong>
            <p style={{ marginTop: '2px' }}>{budgetResult.statusMessage}</p>
          </div>
        </div>
      )}

      {budgetResult && !isOver && budgetVal > 0 && (
        <div className="budget-warning-banner success" role="status">
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div>
            <strong>Within Budget:</strong> {budgetResult.statusMessage}
          </div>
        </div>
      )}
    </section>
  );
};

export default BudgetBanner;
