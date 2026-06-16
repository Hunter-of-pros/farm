import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, MapPin, ClipboardList, Package, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';

const CATEGORIES = ['Vegetable', 'Fruit', 'Grain', 'Other'];
const CATEGORY_IMAGES = {
  Vegetable: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600',
  Fruit: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600',
  Grain: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
  Other: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
};

const Farmer = ({ addToast }) => {
  const [farmerName, setFarmerName] = useState(() => localStorage.getItem('farmer_name') || 'Farmer Bob');
  const [farmerLocation, setFarmerLocation] = useState(() => localStorage.getItem('farmer_location') || 'Valley Springs Farm');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: farmerName, location: farmerLocation });

  const [activeTab, setActiveTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Vegetable',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    imageUrl: ''
  });

  // Fetch products and orders
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [farmerName]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products, then filter by this farmer
      const response = await fetch('http://localhost:5001/api/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data.filter(p => p.farmerName.toLowerCase() === farmerName.toLowerCase()));
      }
    } catch (err) {
      addToast('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/orders');
      const data = await response.json();
      if (response.ok) {
        // Filter orders containing items from this farmer
        const farmerOrders = data.filter(order => 
          order.items.some(item => item.farmerName.toLowerCase() === farmerName.toLowerCase())
        );
        setOrders(farmerOrders);
      }
    } catch (err) {
      addToast('Error fetching orders', 'error');
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.location) {
      addToast('Name and location are required', 'error');
      return;
    }
    setFarmerName(profileForm.name);
    setFarmerLocation(profileForm.location);
    localStorage.setItem('farmer_name', profileForm.name);
    localStorage.setItem('farmer_location', profileForm.location);
    setIsEditingProfile(false);
    addToast('Farmer profile updated successfully', 'success');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Vegetable',
      price: '',
      unit: 'kg',
      quantity: '',
      description: '',
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const { name, category, price, unit, quantity, description, imageUrl } = productForm;
    if (!name || !price || !quantity) {
      addToast('Please enter all required fields', 'error');
      return;
    }

    const payload = {
      name,
      category,
      price: parseFloat(price),
      unit,
      quantity: parseInt(quantity),
      description,
      imageUrl: imageUrl || CATEGORY_IMAGES[category],
      farmerName,
      farmerLocation
    };

    try {
      let response;
      if (editingProduct) {
        // Edit product
        response = await fetch(`http://localhost:5001/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new product
        response = await fetch('http://localhost:5001/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        addToast(editingProduct ? 'Product updated successfully' : 'Product listed successfully', 'success');
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const errorData = await response.json();
        addToast(errorData.message || 'Operation failed', 'error');
      }
    } catch (err) {
      addToast('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        addToast('Product listing deleted', 'success');
        fetchProducts();
      } else {
        addToast('Failed to delete listing', 'error');
      }
    } catch (err) {
      addToast('Error deleting listing', 'error');
    }
  };

  const handleOrderStatusUpdate = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        addToast(`Order status updated to ${nextStatus}`, 'success');
        fetchOrders();
      } else {
        addToast('Failed to update status', 'error');
      }
    } catch (err) {
      addToast('Error updating status', 'error');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Farmer profile banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '2.5rem', 
          color: 'white', 
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          {!isEditingProfile ? (
            <>
              <h2 style={{ color: 'white', fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <User size={30} /> {farmerName}
              </h2>
              <p style={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem' }}>
                <MapPin size={18} /> {farmerLocation}
              </p>
              <button 
                className="btn" 
                style={{ marginTop: '1.25rem', padding: '0.4rem 1rem', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.4)', color: 'white', boxShadow: 'none' }}
                onClick={() => {
                  setProfileForm({ name: farmerName, location: farmerLocation });
                  setIsEditingProfile(true);
                }}
              >
                Edit Dashboard Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Edit Farmer Profile</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Farmer Name"
                  style={{ background: 'white', color: 'var(--text-dark)', width: '250px' }}
                  required
                />
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileForm.location} 
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="Farm Location"
                  style={{ background: 'white', color: 'var(--text-dark)', width: '250px' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>Save</button>
                <button type="button" className="btn" style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
        
        {/* Right side stats */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', minWidth: '120px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{products.length}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, textTransform: 'uppercase' }}>Active Listings</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', minWidth: '120px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{orders.length}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, textTransform: 'uppercase' }}>Total Orders</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Package size={18} /> My Listings
          </span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ClipboardList size={18} /> Received Orders ({orders.filter(o => o.status === 'Pending' || o.status === 'Shipped').length})
          </span>
        </button>
      </div>

      {/* Tab 1: Product Listings */}
      {activeTab === 'listings' && (
        <div>
          <div className="page-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Manage Your Produce Listings</h2>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> List New Item
            </button>
          </div>

          {loading ? (
            <p>Loading your products...</p>
          ) : products.length === 0 ? (
            <div className="empty-placeholder">
              <ShoppingBag className="empty-placeholder-icon" />
              <h3>No Active Listings</h3>
              <p>You haven't listed any farm produce for sale yet. Add your first fruit or vegetable now!</p>
              <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={openAddModal}>
                <Plus size={16} /> Add First Listing
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product._id} className="card">
                  <div className="card-image-wrapper">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="card-image"
                    />
                    <span className="category-tag">{product.category}</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{product.name}</h3>
                    <div className="farmer-tag" style={{ marginBottom: '0.4rem' }}>
                      <MapPin size={14} /> {product.farmerLocation}
                    </div>
                    <p className="card-desc">{product.description || 'No description provided.'}</p>
                    
                    <div className="card-footer">
                      <div className="price-tag">
                        <span className="price-val">${Number(product.price).toFixed(2)}</span>
                        <span className="price-unit">per {product.unit}</span>
                      </div>
                      <span className={`stock-tag ${product.quantity === 0 ? 'out' : product.quantity <= 10 ? 'low' : ''}`}>
                        {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} ${product.unit}s available`}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => openEditModal(product)}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.5rem', boxShadow: 'none' }} onClick={() => handleDeleteProduct(product._id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Orders */}
      {activeTab === 'orders' && (
        <div>
          <div className="page-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Incoming Customer Orders</h2>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={fetchOrders}>
              Refresh Orders
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="empty-placeholder">
              <ClipboardList className="empty-placeholder-icon" />
              <h3>No Orders Received</h3>
              <p>You haven't received any orders yet. When consumers purchase your products, they will appear here!</p>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => {
                // Get only items belonging to this farmer
                const farmerItems = order.items.filter(
                  item => item.farmerName.toLowerCase() === farmerName.toLowerCase()
                );
                const farmerSubtotal = farmerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

                return (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                        <span className="order-date" style={{ marginLeft: '1rem' }}>
                          Placed on: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="order-customer-details">
                      <div className="customer-info-item">
                        <strong>Deliver To:</strong> {order.customerName}
                      </div>
                      <div className="customer-info-item">
                        <strong>Contact:</strong> {order.customerPhone} {order.customerEmail && `| ${order.customerEmail}`}
                      </div>
                      <div className="customer-info-item" style={{ gridColumn: '1 / -1' }}>
                        <strong>Address:</strong> {order.customerAddress}
                      </div>
                    </div>

                    {/* Order items from this farmer */}
                    <div className="order-items-summary">
                      <h4 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(45,90,39,0.06)', paddingBottom: '0.4rem', color: 'var(--primary-dark)' }}>
                        Items from your harvest
                      </h4>
                      {farmerItems.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <span>{item.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>x{item.quantity}</span></span>
                          <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-total-price">
                        Your Order Earnings: <strong>${farmerSubtotal.toFixed(2)}</strong>
                      </div>

                      {/* Status transitions */}
                      <div className="status-actions">
                        {order.status === 'Pending' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                            onClick={() => handleOrderStatusUpdate(order._id, 'Shipped')}
                          >
                            <Truck size={16} /> Mark as Shipped
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                            onClick={() => handleOrderStatusUpdate(order._id, 'Delivered')}
                          >
                            <CheckCircle2 size={16} /> Mark as Delivered
                          </button>
                        )}
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', boxShadow: 'none' }}
                            onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              ✕
            </button>
            <h2 className="modal-title">{editingProduct ? 'Edit Produce Listing' : 'List New Produce'}</h2>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Produce Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Organic Strawberries, Fresh Spinach, etc."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-input" 
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit of Measure *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={productForm.unit} 
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="kg, bunch, piece, box"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price per Unit ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="form-input" 
                    value={productForm.price} 
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="3.50"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Stock (Qty) *</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-input" 
                    value={productForm.quantity} 
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={productForm.imageUrl} 
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/fresh-produce.jpg"
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  If left empty, a high-quality category default image will be automatically assigned.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={productForm.description} 
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe the freshness, organic practices, variety, or harvest date..."
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farmer;
