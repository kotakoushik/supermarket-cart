import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag, ArrowRight, Printer } from 'lucide-react';
import apiClient from '../api/client';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, order]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }} role="status">
        <p style={{ color: 'var(--text-muted)' }}>Loading confirmed order receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }} role="alert">
        <p style={{ color: 'var(--danger)' }}>{error || 'Order not found'}</p>
        <Link to="/" style={{ color: 'var(--brand-forest)', fontWeight: 700, marginTop: '16px', display: 'inline-block' }}>
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '40px', maxWidth: '820px', marginBottom: '60px' }}>
      <div
        style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              background: 'var(--brand-surface)',
              color: 'var(--brand-forest)',
              border: '1px solid var(--brand-border)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
            aria-hidden="true"
          >
            <CheckCircle2 size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Order Confirmed!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px' }}>
            Thank you for shopping at FreshCart Supermarket. Your items are being packed for express delivery.
          </p>
          <div
            style={{
              display: 'inline-block',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginTop: '12px',
              color: 'var(--text-main)',
            }}
          >
            Order Reference: #{order.id}
          </div>
        </div>

        {/* Customer & Delivery Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            padding: '18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '28px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Customer Details
            </h2>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{order.customerName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{order.customerEmail}</div>
            {order.customerPhone && <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{order.customerPhone}</div>}
          </div>

          <div>
            <h2 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Delivery Destination
            </h2>
            <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.4 }}>
              {order.deliveryAddress}
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--brand-forest)', fontWeight: 700 }}>
              Status: {order.orderStatus}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
          Ordered Items
        </h2>

        <div className="data-table-container" style={{ marginBottom: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.productName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.category}</td>
                  <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                    ₹{Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, paddingTop: '16px' }}>
                  Grand Total Paid:
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.25rem', color: 'var(--brand-forest)', paddingTop: '16px' }}>
                  ₹{Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              background: 'white',
            }}
          >
            <Printer size={16} /> Print Receipt
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            >
              Order History
            </Link>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                background: 'var(--brand-forest)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}
            >
              Continue Shopping <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
