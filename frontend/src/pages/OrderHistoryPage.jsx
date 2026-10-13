import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
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
    <div className="container" style={{ paddingTop: '28px', marginBottom: '60px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Order History
      </h1>
      <p style={{ color: '#64748b', marginBottom: '28px' }}>
        View all previous grocery orders placed during this session.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading your order history...
        </div>
      ) : error ? (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '12px' }}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Package size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No orders yet</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
          <Link
            to="/"
            style={{
              background: '#059669',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '14px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Order #{order.id}</span>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.9rem',
                      color: '#334155',
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
                  borderTop: '1px solid #f8fafc',
                  paddingTop: '12px',
                  fontSize: '0.85rem',
                  color: '#64748b',
                }}
              >
                <span>Delivered to: <strong>{order.customerName}</strong> ({order.customerEmail})</span>
                <Link
                  to={`/confirmation/${order.id}`}
                  style={{
                    color: '#059669',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View Receipt <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
