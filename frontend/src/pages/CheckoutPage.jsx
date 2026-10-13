import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, Banknote, CreditCard, Lock, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import apiClient, { getCartId } from '../api/client';

const CheckoutPage = () => {
  const { cart, refreshCart, showToast } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill from authenticated customer profile
  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.fullName || '',
        customerEmail: customer.email || '',
        customerPhone: customer.phone || '',
        deliveryAddress: customer.address || '',
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerName.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      setError('Please provide your complete delivery address');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        cartId: getCartId(),
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        paymentMethod: paymentMethod,
      };

      const res = await apiClient.post('/orders', payload);
      const createdOrder = res.data;

      // Refresh cart to show 0 items
      await refreshCart();

      showToast('Order confirmed successfully!', 'success');
      navigate(`/confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.message || 'Checkout failed. Please check item stock and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please add groceries to your basket before checking out.</p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            background: 'var(--brand-forest)',
            color: 'white',
            padding: '10px 22px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '28px', maxWidth: '1020px', marginBottom: '60px' }}>
      <Link
        to="/cart"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--brand-forest)', fontWeight: 600, marginBottom: '20px', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-main)' }}>
        Checkout & Express Delivery
      </h1>

      {/* Account notification banner if not logged in */}
      {!isAuthenticated && (
        <div style={{
          background: 'var(--brand-surface)',
          border: '1px solid var(--brand-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--brand-forest)', fontSize: '0.95rem' }}>
              Have a FreshCart Account?
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Sign in to automatically save this order to your persistent Order History.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              style={{
                background: 'var(--brand-forest)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={15} /> Sign In
            </Link>
            <Link
              to="/register"
              state={{ from: '/checkout' }}
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={15} /> Register
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
        {/* Checkout Form */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Truck size={20} color="var(--brand-forest)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>Delivery Address & Contact</h2>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
              }}
              role="alert"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="customerName">Full Name *</label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                className="form-control"
                placeholder="e.g. Koushik Roy"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerEmail">Email Address *</label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                className="form-control"
                placeholder="e.g. koushik@example.com"
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerPhone">Phone Number</label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="deliveryAddress">Delivery Address *</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                rows="3"
                className="form-control"
                placeholder="Flat / House No, Street, Landmark, Bengaluru, 560034"
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
              />
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label
                  style={{
                    border: paymentMethod === 'COD' ? '2px solid var(--brand-forest)' : '1px solid var(--border)',
                    background: paymentMethod === 'COD' ? 'var(--brand-surface)' : 'white',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    style={{ accentColor: 'var(--brand-forest)' }}
                  />
                  <Banknote size={16} color="var(--brand-forest)" /> Cash on Delivery
                </label>

                <label
                  style={{
                    border: paymentMethod === 'ONLINE' ? '2px solid var(--brand-forest)' : '1px solid var(--border)',
                    background: paymentMethod === 'ONLINE' ? 'var(--brand-surface)' : 'white',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    style={{ accentColor: 'var(--brand-forest)' }}
                  />
                  <CreditCard size={16} color="var(--brand-forest)" /> UPI / Card
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-checkout"
              style={{ width: '100%', marginTop: '12px' }}
            >
              {submitting ? (
                <>Placing Order...</>
              ) : (
                <>
                  <ShieldCheck size={18} /> Confirm Order & Pay ₹{Number(cart.totalAmount).toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>
                  {item.productName} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
                </span>
                <span style={{ fontWeight: 600 }}>₹{Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span>Subtotal</span>
              <span>₹{Number(cart.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span>Estimated GST (5%)</span>
              <span>₹{Number(cart.tax).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span>Delivery Charges</span>
              <span style={{ color: 'var(--brand-forest)', fontWeight: 600 }}>FREE (Express)</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--brand-forest)' }}>₹{Number(cart.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
