import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, ShieldCheck, History, Bot, MapPin, User, LogIn, LogOut, UserPlus } from 'lucide-react';
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
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-group">
              <Link
                to="/login"
                className={`nav-link nav-auth-link ${location.pathname === '/login' ? 'active' : ''}`}
                title="Customer Sign In"
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="nav-register-btn"
                title="Create Customer Account"
              >
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </div>
          )}

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
