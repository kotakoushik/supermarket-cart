import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Power, RefreshCw, X, ShieldCheck, Check, AlertCircle, Key, Lock, Unlock, LogOut, Search } from 'lucide-react';
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

  // Search filter for admin inventory
  const [adminSearch, setAdminSearch] = useState('');

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

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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

  const filteredProducts = products.filter((p) => {
    if (!adminSearch.trim()) return true;
    const term = adminSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      String(p.id).includes(term)
    );
  });

  if (!isUnlocked) {
    return (
      <main className="container" style={{ paddingTop: '60px', marginBottom: '80px', maxWidth: '480px' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-surface)',
            color: 'var(--brand-forest)',
            border: '1px solid var(--brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }} aria-hidden="true">
            <Lock size={26} />
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            Protected Admin Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '22px' }}>
            Authentication is required to view, modify prices, and manage supermarket inventory.
          </p>

          {authError && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label htmlFor="adminKeyInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Admin Access Key
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="adminKeyInput"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin security key..."
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="btn-checkout"
              style={{ marginTop: '0' }}
            >
              {verifying ? (
                <>
                  <RefreshCw size={17} className="animate-spin" /> Verifying Key...
                </>
              ) : (
                <>
                  <Unlock size={17} /> Unlock Admin Portal
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>Dev Default Key:</strong> <code>fc-admin-key-2025</code>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '28px', marginBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--brand-forest)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Inventory Management</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
            Live catalog control: adjust prices, replenish stock, or activate/deactivate products.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--brand-surface)', color: 'var(--brand-forest)', padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--brand-border)' }}>
            <ShieldCheck size={15} /> Authorized
          </div>

          <button
            type="button"
            onClick={handleLock}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'white',
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
            title="Lock session"
          >
            <LogOut size={14} /> Lock
          </button>

          <button
            type="button"
            onClick={openAddModal}
            style={{
              background: 'var(--brand-forest)',
              color: 'white',
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={17} /> Add Product
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div style={{ marginBottom: '18px', position: 'relative', maxWidth: '380px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-control"
          style={{ paddingLeft: '36px' }}
          placeholder="Filter inventory by name, category, or ID..."
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }} role="status">
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--brand-forest)' }} />
          Loading inventory...
        </div>
      ) : error ? (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-border)' }} role="alert">
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
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{product.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                        alt={product.name}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{product.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {product.description?.substring(0, 36)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>₹{Number(product.price).toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: product.stockQuantity === 0 ? 'var(--danger)' : product.stockQuantity < 10 ? 'var(--accent-amber)' : 'var(--brand-forest)',
                      }}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: product.active ? 'var(--brand-surface)' : 'var(--danger-light)',
                        color: product.active ? 'var(--brand-forest)' : 'var(--danger)',
                        border: product.active ? '1px solid var(--brand-border)' : '1px solid var(--danger-border)',
                      }}
                    >
                      {product.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-xs)',
                          color: 'var(--brand-forest)',
                          background: 'white',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product.id, product.active)}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-xs)',
                          color: product.active ? 'var(--danger)' : 'var(--brand-forest)',
                          background: 'white',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title={product.active ? 'Deactivate product' : 'Activate product'}
                      >
                        <Power size={13} />
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
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingProduct ? 'Edit Supermarket Item' : 'Add New Supermarket Item'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close dialog">
                <X size={18} />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-forest)' }}
                />
                <label htmlFor="prodActive" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Active (Available for customer purchase)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: 'var(--brand-forest)',
                    color: 'white',
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminPage;
