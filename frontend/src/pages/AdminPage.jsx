import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Power, RefreshCw, X, ShieldCheck, Check, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message || 'Failed to fetch admin product list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
