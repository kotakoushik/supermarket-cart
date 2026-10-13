import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const AnalystFloatingButton = () => {
  const { cart, openAnalyst } = useCart();

  return (
    <button
      className="floating-analyst-btn"
      onClick={openAnalyst}
      aria-label="AI Analyse My Cart"
      title="Open FreshCart AI Shopping Analyst"
    >
      <div className="floating-analyst-icon-wrapper">
        <Bot size={22} />
      </div>
      <span className="floating-analyst-text">AI Analyse My Cart</span>
      {cart.totalItems > 0 && (
        <span className="floating-analyst-badge">{cart.totalItems}</span>
      )}
    </button>
  );
};

export default AnalystFloatingButton;
