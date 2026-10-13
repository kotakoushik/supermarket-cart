import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/orders');
        setOrders(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <main className="container" style={{ paddingTop: '28px', marginBottom: '60px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
        Your Past Orders
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.92rem' }}>
        Track fulfilled supermarket orders, receipts, and order summaries.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }} role="status">
          Loading order history...
        </div>
      ) : error ? (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--danger-border)',
          }}
          role="alert"
        >
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <Package size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>No orders placed yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>You haven't checked out any orders in this session yet.</p>
          <Link
            to="/"
            style={{
              background: 'var(--brand-forest)',
              color: 'white',
              padding: '10px 22px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-block',
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <article
              key={order.id}
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '22px',
                boxShadow: 'var(--shadow-xs)',
              }}
              aria-label={`Order #${order.id}`}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>Order #{order.id}</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <Calendar size={13} />
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-forest)' }}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'var(--brand-surface)',
                      color: 'var(--brand-forest)',
                      border: '1px solid var(--brand-border)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-block',
                      marginTop: '2px',
                    }}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>
                      {item.quantity}× {item.productName} ({item.category})
                    </span>
                    <span style={{ fontWeight: 600 }}>₹{Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span>Recipient: <strong style={{ color: 'var(--text-main)' }}>{order.customerName}</strong> ({order.customerEmail})</span>
                <Link
                  to={`/confirmation/${order.id}`}
                  style={{
                    color: 'var(--brand-forest)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View Details & Receipt <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrderHistoryPage;
