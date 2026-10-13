import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, ShieldCheck, History, Sparkles, Bot, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart, openAnalyst } = useCart();
  const location = useLocation();

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="container nav-container">
        <div className="nav-brand-group">
          <Link to="/" className="nav-brand" aria-label="FreshCart Supermarket Home">
            <div className="nav-brand-icon">
              <Store size={20} />
            </div>
            <span>FreshCart<span style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>.</span></span>
          </Link>

          <div className="nav-store-chip" title="Active fulfillment store">
            <MapPin size={13} color="var(--brand-forest)" />
            <span>Koramangala, BLR • 30m Express</span>
          </div>
        </div>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            <Store size={17} />
            <span>Catalog</span>
          </Link>

          <Link
            to="/orders"
            className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
            aria-current={location.pathname === '/orders' ? 'page' : undefined}
          >
            <History size={17} />
            <span>Orders</span>
          </Link>

          <Link
            to="/admin"
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            aria-current={location.pathname === '/admin' ? 'page' : undefined}
          >
            <ShieldCheck size={17} />
            <span>Admin</span>
          </Link>

          <button
            onClick={openAnalyst}
            className="nav-analyst-pill"
            aria-label="Open AI Shopping Analyst"
            title="Open rule-based cart optimization & budget audit"
          >
            <Bot size={16} />
            <span>AI Analyst</span>
          </button>

          <Link
            to="/cart"
            className="nav-cart-btn"
            aria-label={`View Cart with ${cart.totalItems || 0} items`}
          >
            <ShoppingCart size={17} />
            <span>₹{cart.totalAmount ? Number(cart.totalAmount).toFixed(2) : '0.00'}</span>
            <span className="cart-badge">{cart.totalItems || 0}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
