import React from 'react';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BudgetBanner = () => {
  const { cart, budget, budgetResult, updateBudget } = useCart();

  const total = Number(cart.totalAmount || 0);
  const budgetVal = Number(budget || 0);

  const percentage = budgetVal > 0 ? Math.min(Math.round((total / budgetVal) * 100), 100) : 0;
  const isOver = budgetVal > 0 && total > budgetVal;
  const overAmount = isOver ? (total - budgetVal).toFixed(2) : 0;

  const getBarColor = () => {
    if (isOver) return '#ef4444';
    if (percentage > 85) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="budget-widget">
      <div className="budget-widget-header">
        <div className="budget-title-group">
          <TrendingUp size={22} color={isOver ? '#ef4444' : '#059669'} />
          <div>
            <h3>Smart Grocery Budget Tracker</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Real-time expenditure monitoring & AI over-budget protection
            </p>
          </div>
        </div>

        <div className="budget-inputs">
          <label htmlFor="budget-input" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
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
            />
          </div>
        </div>
      </div>

      <div className="budget-progress-container">
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
        <span>Utilization: <strong>{budgetVal > 0 ? ((total / budgetVal) * 100).toFixed(1) : 0}%</strong></span>
        <span>Target: <strong>₹{budgetVal.toFixed(2)}</strong></span>
      </div>

      {budgetResult && isOver && (
        <div className="budget-warning-banner alert">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Budget Exceeded by ₹{overAmount}!</strong>
            <p style={{ marginTop: '2px' }}>{budgetResult.statusMessage}</p>
          </div>
        </div>
      )}

      {budgetResult && !isOver && budgetVal > 0 && (
        <div className="budget-warning-banner success">
          <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Within Budget:</strong> {budgetResult.statusMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBanner;
