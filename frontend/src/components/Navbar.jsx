import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, ShieldCheck, History, Sparkles, Bot } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart, openAnalyst } = useCart();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Store size={22} />
          </div>
          <span>FreshCart<span style={{ color: '#10b981' }}> AI</span></span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Store size={18} />
            Catalog
          </Link>

          <Link
            to="/orders"
            className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
          >
            <History size={18} />
            Orders
          </Link>

          <Link
            to="/admin"
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            Admin
          </Link>

          <button
            onClick={openAnalyst}
            className="nav-link"
            style={{
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: 700,
              border: '1px solid #a7f3d0',
            }}
            title="Open AI Shopping Analyst"
          >
            <Bot size={18} />
            AI Analyst
          </button>

          <Link to="/cart" className="nav-cart-btn">
            <ShoppingCart size={18} />
            <span>₹{cart.totalAmount ? Number(cart.totalAmount).toFixed(2) : '0.00'}</span>
            <span className="cart-badge">{cart.totalItems || 0}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
