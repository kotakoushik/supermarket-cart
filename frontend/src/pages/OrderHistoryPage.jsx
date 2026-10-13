import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, ArrowRight, ShoppingBag, CheckCircle2, AlertCircle, LogIn, UserPlus, CreditCard, Banknote, RefreshCw } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/useAuth';

const OrderHistoryPage = () => {
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load order history from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  return (
    <main className="container" style={{ paddingTop: '28px', marginBottom: '60px', maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
            Order History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            {isAuthenticated
              ? `Orders associated with ${customer?.fullName} (${customer?.email})`
              : 'Sign in to access your persistent supermarket orders and receipts.'}
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={fetchOrders}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!isAuthenticated && !authLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 24px',
            background: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--brand-surface)',
              color: 'var(--brand-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Package size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
            Account Required for Order History
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
            Orders are securely stored in the database and linked to your customer account. Sign in to view past grocery orders and receipts.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link
              to="/login"
              state={{ from: '/orders' }}
              style={{
                background: 'var(--brand-forest)',
                color: 'white',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LogIn size={16} /> Sign In
            </Link>
            <Link
              to="/register"
              state={{ from: '/orders' }}
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <UserPlus size={16} /> Create Account
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }} role="status">
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          Loading your verified orders...
        </div>
      ) : error ? (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--danger-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          role="alert"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
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
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>You haven't placed any supermarket orders on this account yet.</p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {orders.map((order) => (
            <article
              key={order.id}
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
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
                  paddingBottom: '14px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
                      Order #{order.id}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: order.orderStatus === 'CONFIRMED' ? 'var(--brand-surface)' : 'var(--bg-subtle)',
                        color: order.orderStatus === 'CONFIRMED' ? 'var(--brand-forest)' : 'var(--text-muted)',
                        border: '1px solid var(--brand-border)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-block',
                      }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Calendar size={13} />
                    {new Date(order.createdAt).toLocaleString()}
                    {order.paymentMethod && (
                      <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        • {order.paymentMethod === 'COD' ? <Banknote size={13} /> : <CreditCard size={13} />} {order.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-forest)' }}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {order.items ? order.items.reduce((acc, i) => acc + i.quantity, 0) : 0} items
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {order.items && order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      padding: '4px 0',
                    }}
                  >
                    <span>
                      <strong>{item.quantity}×</strong> {item.productName} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({item.category})</span>
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
                  paddingTop: '14px',
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  Delivery to: <strong style={{ color: 'var(--text-main)' }}>{order.customerName}</strong>
                  {order.deliveryAddress && <span> • {order.deliveryAddress}</span>}
                </div>
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
                  View Receipt Details <ArrowRight size={14} />
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
