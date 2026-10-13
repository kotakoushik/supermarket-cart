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
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p>Loading confirmed order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Order not found'}</p>
        <Link to="/" style={{ color: '#059669', fontWeight: 700, marginTop: '16px', display: 'inline-block' }}>
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: '800px', marginBottom: '60px' }}>
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#dcfce7',
              color: '#059669',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Order Confirmed!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '6px' }}>
            Thank you for shopping at FreshCart AI Supermarket. Your order has been placed successfully.
          </p>
          <div
            style={{
              display: 'inline-block',
              background: '#f1f5f9',
              padding: '6px 16px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginTop: '12px',
              color: '#334155',
            }}
          >
            Order ID: #{order.id}
          </div>
        </div>

        {/* Customer & Delivery Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '28px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Customer Details
            </h4>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.customerName}</div>
            <div style={{ color: '#475569', fontSize: '0.85rem' }}>{order.customerEmail}</div>
            {order.customerPhone && <div style={{ color: '#475569', fontSize: '0.85rem' }}>{order.customerPhone}</div>}
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Delivery Address
            </h4>
            <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.4 }}>
              {order.deliveryAddress}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
              Status: {order.orderStatus}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
          Ordered Items
        </h3>

        <div className="data-table-container" style={{ marginBottom: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.productName}</td>
                  <td style={{ color: '#64748b' }}>{item.category}</td>
                  <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
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
                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.25rem', color: '#059669', paddingTop: '16px' }}>
                  ₹{Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#475569',
            }}
          >
            <Printer size={16} /> Print Receipt
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              to="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: '#f1f5f9',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#334155',
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
                padding: '10px 20px',
                background: '#059669',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
