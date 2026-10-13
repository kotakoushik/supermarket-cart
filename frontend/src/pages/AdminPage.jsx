import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Power, RefreshCw, X, ShieldCheck, Check, AlertCircle, Key, Lock, Unlock, LogOut } from 'lucide-react';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'Dairy',
  'Bakery',
  'Breakfast',
  'Grains and Pulses',
  'Fruits and Vegetables',
  'Snacks',
  'Beverages',
  'Cooking Essentials',
  'Household Products',
];

const AdminPage = () => {
  const { showToast } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication State
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem('freshcart_admin_key') || '');
  const [isUnlocked, setIsUnlocked] = useState(Boolean(sessionStorage.getItem('freshcart_admin_key')));
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Dairy',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/admin/products');
      setProducts(res.data);
      setIsUnlocked(true);
    } catch (err) {
      if (err.message && (err.message.includes('Unauthorized') || err.message.includes('401'))) {
        setIsUnlocked(false);
        setAuthError('Authentication required. Enter the admin access key to manage inventory.');
      } else {
        setError(err.message || 'Failed to fetch admin product list');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchProducts();
    }
  }, [isUnlocked]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setAuthError('Please enter an admin key');
      return;
    }
    try {
      setVerifying(true);
      setAuthError(null);
      sessionStorage.setItem('freshcart_admin_key', adminKey.trim());
      const res = await apiClient.get('/admin/products');
      setProducts(res.data);
      setIsUnlocked(true);
      showToast('Admin session authenticated successfully', 'success');
    } catch (err) {
      sessionStorage.removeItem('freshcart_admin_key');
      setIsUnlocked(false);
      setAuthError(err.message || 'Invalid admin key. Check server FRESHCART_ADMIN_KEY configuration.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('freshcart_admin_key');
    setIsUnlocked(false);
    setProducts([]);
    setAdminKey('');
    showToast('Admin portal locked', 'info');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Dairy',
      price: '',
      stockQuantity: '',
      imageUrl: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
      active: product.active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await apiClient.patch(`/admin/products/${productId}/status`, { active: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, active: newStatus } : p))
      );
      showToast(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update product status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast('Price must be greater than zero', 'error');
      return;
    }
    if (formData.stockQuantity === '' || parseInt(formData.stockQuantity) < 0) {
      showToast('Stock quantity cannot be negative', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        imageUrl: formData.imageUrl.trim() || null,
        active: formData.active,
      };

      if (editingProduct) {
        await apiClient.put(`/admin/products/${editingProduct.id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await apiClient.post('/admin/products', payload);
        showToast('New product created successfully!', 'success');
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="container" style={{ paddingTop: '60px', marginBottom: '80px', maxWidth: '520px' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(5, 150, 105, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={28} />
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Protected Admin Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
            Authentication is required to view, modify prices, and manage supermarket inventory.
          </p>

          {authError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label htmlFor="adminKeyInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Admin Access Key
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="adminKeyInput"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin security key..."
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: 'white',
                padding: '13px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              {verifying ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Verifying Key...
                </>
              ) : (
                <>
                  <Unlock size={18} /> Unlock Admin Portal
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b' }}>
            <strong>Dev Default Key:</strong> <code>fc-admin-key-2025</code>
            <br />
            Configured on server via <code>FRESHCART_ADMIN_KEY</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '28px', marginBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#059669" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Inventory Management</h1>
          </div>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Create new items, modify prices and stock, or toggle active/inactive status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
            <ShieldCheck size={16} /> Authenticated
          </div>
          <button
            onClick={handleLock}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
            title="Lock admin session and clear credentials"
          >
            <LogOut size={15} /> Lock
          </button>
          <button
            onClick={openAddModal}
            style={{
              background: '#059669',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          Loading inventory...
        </div>
      ) : error ? (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '12px' }}>
          {error}
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>#{product.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                        alt={product.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {product.description?.substring(0, 40)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800 }}>₹{Number(product.price).toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: product.stockQuantity === 0 ? '#ef4444' : product.stockQuantity < 10 ? '#f59e0b' : '#059669',
                      }}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '20px',
                        background: product.active ? '#dcfce7' : '#fee2e2',
                        color: product.active ? '#15803d' : '#991b1b',
                      }}
                    >
                      {product.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(product)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#0284c7',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleToggleStatus(product.id, product.active)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: product.active ? '#dc2626' : '#16a34a',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title={product.active ? 'Deactivate product' : 'Activate product'}
                      >
                        <Power size={14} />
                        {product.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prodName">Product Name *</label>
                <input
                  id="prodName"
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Brown Rice 1kg"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prodCat">Category *</label>
                <select
                  id="prodCat"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prodPrice">Price (₹) *</label>
                  <input
                    id="prodPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 120.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prodStock">Stock Quantity *</label>
                  <input
                    id="prodStock"
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="e.g. 50"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prodImg">Image URL</label>
                <input
                  id="prodImg"
                  type="url"
                  className="form-control"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prodDesc">Description</label>
                <textarea
                  id="prodDesc"
                  rows="3"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nutritional details, origin, or packaging info..."
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="prodActive"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                />
                <label htmlFor="prodActive" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Active (Available for customer purchase)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '10px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: '#059669',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                  }}
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
