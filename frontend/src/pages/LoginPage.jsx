import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { customerLogin } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = location.state?.from;
  const redirectPath = typeof rawFrom === 'string' ? rawFrom : (rawFrom?.pathname || '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await customerLogin(cleanEmail, password);
    setSubmitting(false);

    if (result.success && result.customer) {
      showToast(`Welcome back, ${result.customer.fullName || 'Shopper'}!`, 'success');
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleFillDemo = () => {
    setEmail('customer@freshcart.com');
    setPassword('Password123!');
    setFormError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn size={26} color="var(--brand-forest)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your FreshCart account to view orders and checkout faster</p>
        </div>

        <div className="demo-credentials-card">
          <div className="demo-credentials-header">
            <span className="demo-badge">Quick Demo Account</span>
            <button
              type="button"
              className="btn-link-demo"
              onClick={handleFillDemo}
            >
              Fill Demo Credentials
            </button>
          </div>
          <div className="demo-credentials-body">
            <span>Email: <code>customer@freshcart.com</code></span>
            <span>Password: <code>Password123!</code></span>
          </div>
        </div>

        {formError && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner-sm" aria-label="Signing in..." />
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" state={{ from: redirectPath }}>
              Create Account <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </p>
          <p style={{ marginTop: '8px', fontSize: '0.82rem', color: '#666' }}>
            Store Manager?{' '}
            <Link to="/admin" style={{ color: 'var(--brand-forest)', fontWeight: 600 }}>
              Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
