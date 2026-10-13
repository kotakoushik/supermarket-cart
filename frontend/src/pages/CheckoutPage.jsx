import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
      setError('Please provide your name');
      return;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      setError('Please provide your delivery address');
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

      showToast('Order placed successfully!', 'success');
      navigate(`/confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.message || 'Checkout failed. Please check inventory and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Please add items before checking out.</p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            background: '#059669',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
          }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '28px', maxWidth: '1000px', marginBottom: '60px' }}>
      <Link
        to="/cart"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600, marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>
        Checkout & Delivery
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
        {/* Checkout Form */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Truck size={22} color="#059669" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Delivery Address & Contact</h2>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                placeholder="House / Flat No, Street, Landmark, City, PIN"
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginTop: '24px', background: '#f8fafc', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#64748b' }}>
              <ShieldCheck size={20} color="#059669" />
              <span>
                Server-side transaction guarantees stock reservation and verified pricing calculation.
              </span>
            </div>

            <button
              type="submit"
              className="btn-checkout"
              style={{ marginTop: '24px' }}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : `Confirm & Place Order (₹${Number(cart.totalAmount).toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
            Items Summary ({cart.totalItems})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}</div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{Number(item.subtotal).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>
              <span>Subtotal:</span>
              <span>₹{Number(cart.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>
              <span>Delivery:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px dashed #e2e8f0', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Total:</span>
              <span>₹{Number(cart.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
