import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, ShieldCheck, History, Bot, MapPin, User, LogIn, LogOut, UserPlus, Sprout, Sparkles } from 'lucide-react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const { cart, openAnalyst, showToast } = useCart();
  const { customer, isAuthenticated, customerLogout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await customerLogout();
    showToast('You have signed out successfully', 'info');
  };

  return (
    <header className="site-header">
      {/* Editorial Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="container announcement-inner">
          <div className="announcement-left">
            <span className="announcement-badge">Sunrise Harvest</span>
            <span>Order by 2:00 PM for same-day sunset cold-chain delivery</span>
          </div>
          <div className="announcement-right">
            <span>Koramangala Direct Hub • Express 30m</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar" aria-label="Main Navigation">
        <div className="container nav-container">
          <div className="nav-brand-group">
            <Link to="/" className="nav-brand" aria-label="FreshCart Supermarket Home">
              <span className="nav-brand-serif">FreshCart</span>
              <span className="nav-brand-dot">.</span>
            </Link>
          </div>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              <span>Catalog</span>
            </Link>

            <a
              href="/#aisles-section"
              className="nav-link"
            >
              <span>Aisles</span>
            </a>

            <a
              href="/#story-section"
              className="nav-link"
            >
              <span>Our Story</span>
            </a>

            <Link
              to="/orders"
              className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
              aria-current={location.pathname === '/orders' ? 'page' : undefined}
            >
              <span>Orders</span>
            </Link>

            <Link
              to="/admin"
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              aria-current={location.pathname === '/admin' ? 'page' : undefined}
            >
              <span>Admin</span>
            </Link>
          </div>

          <div className="nav-actions-group">
            {/* AI Shopping Analyst */}
            <button
              onClick={openAnalyst}
              className="nav-analyst-pill"
              aria-label="Open AI Shopping Analyst"
              title="Open rule-based cart optimization & budget audit"
            >
              <Bot size={15} />
              <span className="analyst-text-label">AI Analyst</span>
            </button>

            {/* Customer Authentication State */}
            {isAuthenticated ? (
              <div className="nav-user-badge" title={`Signed in as ${customer?.fullName} (${customer?.email})`}>
                <div className="nav-user-avatar">
                  {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="nav-user-name">{customer?.fullName?.split(' ')[0] || 'Customer'}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-user-logout-btn"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div className="nav-auth-group">
                <Link
                  to="/login"
                  className={`nav-auth-link ${location.pathname === '/login' ? 'active' : ''}`}
                  title="Customer Sign In"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="nav-register-btn"
                  title="Create Customer Account"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="nav-cart-btn"
              aria-label={`View Cart with ${cart.totalItems || 0} items`}
            >
              <ShoppingCart size={16} />
              <span className="nav-cart-amount">₹{cart.totalAmount ? Number(cart.totalAmount).toFixed(0) : '0'}</span>
              <span className="cart-badge">{cart.totalItems || 0}</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
