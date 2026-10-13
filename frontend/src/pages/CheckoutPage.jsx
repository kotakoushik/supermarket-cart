import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, Banknote, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient, { getCartId } from '../api/client';

const CheckoutPage = () => {
  const { cart, refreshCart, showToast } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
                  <Banknote size={16} color="var(--brand-forest)" />
                  <span>Cash on Delivery</span>
                </label>

                <label
                  style={{
                    border: paymentMethod === 'UPI' ? '2px solid var(--brand-forest)' : '1px solid var(--border)',
                    background: paymentMethod === 'UPI' ? 'var(--brand-surface)' : 'white',
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
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    style={{ accentColor: 'var(--brand-forest)' }}
                  />
                  <CreditCard size={16} color="var(--brand-forest)" />
                  <span>UPI / Card on Delivery</span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '20px', background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--brand-forest)" style={{ flexShrink: 0 }} />
              <span>
                Atomic database transaction ensures pessimistic stock reservation and verified pricing.
              </span>
            </div>

            <button
              type="submit"
              className="btn-checkout"
              style={{ marginTop: '20px' }}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : `Confirm & Place Order (₹${Number(cart.totalAmount).toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <aside style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '22px' }} aria-label="Order Items Summary">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
            Basket Summary ({cart.totalItems})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.productName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{Number(item.subtotal).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>Subtotal:</span>
              <span>₹{Number(cart.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>Delivery Fee:</span>
              <span style={{ color: 'var(--brand-forest)', fontWeight: 700 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <span>Total Payable:</span>
              <span>₹{Number(cart.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;
