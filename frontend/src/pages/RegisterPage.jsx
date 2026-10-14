import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { customerRegister } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const result = await customerRegister({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      address: address.trim()
    });
    setSubmitting(false);

    if (result.success && result.customer) {
      showToast(`Account created! Welcome to FreshCart, ${result.customer.fullName || 'Shopper'}!`, 'success');
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(result.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} color="var(--brand-forest)" />
          </div>
          <h2>Create Your Account</h2>
          <p>Join FreshCart for fast express checkout and automatic order history</p>
        </div>

        {formError && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name *</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-password">Password (min. 6 characters) *</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number (optional)</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-address">Delivery Address (optional)</label>
            <div className="input-with-icon">
              <MapPin className="input-icon" size={18} />
              <input
                id="reg-address"
                type="text"
                placeholder="Apartment, Street, Locality, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner-sm" aria-label="Creating account..." />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register & Continue</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            Already have an account?{' '}
            <Link to="/login" state={{ from: redirectPath }}>
              Sign In <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
