import React from 'react';
import { Bot } from 'lucide-react';
import { useCart } from '../context/CartContext';

const AnalystFloatingButton = () => {
  const { cart, openAnalyst } = useCart();

  return (
    <button
      type="button"
      className="floating-analyst-btn"
      onClick={openAnalyst}
      aria-label={`Open AI Shopping Analyst (${cart.totalItems || 0} items in cart)`}
      title="Open FreshCart AI Shopping Analyst for budget audit"
    >
      <div className="floating-analyst-icon-wrapper" aria-hidden="true">
        <Bot size={20} />
      </div>
      <span className="floating-analyst-text">AI Shopping Analyst</span>
      {cart.totalItems > 0 && (
        <span className="floating-analyst-badge" aria-label={`${cart.totalItems} items in cart`}>
          {cart.totalItems}
        </span>
      )}
    </button>
  );
};

export default AnalystFloatingButton;
