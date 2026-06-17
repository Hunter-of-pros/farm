import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, MapPin, ClipboardList, Package, Truck, CheckCircle2, ShoppingBag, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const CATEGORIES = ['Vegetable', 'Fruit', 'Grain', 'Other'];
const CATEGORY_IMAGES = {
  Vegetable: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600',
  Fruit: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600',
  Grain: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
  Other: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
};

const PRODUCE_RULES = [
  { pattern: /\bapples?\b/i, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbananas?\b/i, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\boranges?\b/i, image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bmango(es)?\b/i, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bstrawberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bblueberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\braspberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1577069861033-55d04cec4efb?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bblackberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1464306208223-e0b4495a5553?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpotato(es)?\b/i, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\btomato(es)?\b/i, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bonion(s)?\b/i, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcarrot(s)?\b/i, image: 'https://images.unsplash.com/photo-1598170845058-32b996a6bd11?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bgarlic(s)?\b/i, image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bgrapes?\b/i, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpineapples?\b/i, image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\blemon(s)?\b/i, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\blime(s)?\b/i, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bspinach\b/i, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbroccoli\b/i, image: 'https://images.unsplash.com/photo-1452967712862-0cca1839ff27?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcucumber(s)?\b/i, image: 'https://images.unsplash.com/photo-1449300079324-9643e4dc7dc9?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bwatermelon(s)?\b/i, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpepper(s)?\b/i, image: 'https://images.unsplash.com/photo-1563565312-8235f7536ff6?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bchili(es|s)?\b/i, image: 'https://images.unsplash.com/photo-1588252399615-53846665c829?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bchillies\b/i, image: 'https://images.unsplash.com/photo-1588252399615-53846665c829?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\blettuce(s)?\b/i, image: 'https://images.unsplash.com/photo-1622484211148-716598e04041?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcabbage(s)?\b/i, image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bmushroom(s)?\b/i, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bavocado(s)?\b/i, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcorn(s)?\b/i, image: 'https://images.unsplash.com/photo-1551754626-787f2e1a499d?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpapaya(s)?\b/i, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpeach(es)?\b/i, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcherr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpears?\b/i, image: 'https://images.unsplash.com/photo-1601876819102-99560f772713?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bplums?\b/i, image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bwheat\b/i, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\brice\b/i, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbarley\b/i, image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpumpkin(s)?\b/i, image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\beggplant(s)?\b/i, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbrinjal(s)?\b/i, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcauliflower(s)?\b/i, image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bginger(s)?\b/i, image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bguava(s)?\b/i, image: 'https://images.unsplash.com/photo-1534444767776-8c159abd6850?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpomegranate(s)?\b/i, image: 'https://images.unsplash.com/photo-1530983824131-0968e715655d?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpea(s)?\b/i, image: 'https://images.unsplash.com/photo-1587570256549-6ee00912f21b?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbeet(s)?\b/i, image: 'https://images.unsplash.com/photo-1528113517408-5ccb1ae8c62c?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bradish(es)?\b/i, image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbean(s)?\b/i, image: 'https://images.unsplash.com/photo-1550596334-7bb40a719f14?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bmint(s)?\b/i, image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbasil(s)?\b/i, image: 'https://images.unsplash.com/photo-1603036830722-e2bcfbb2d358?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bokra(s)?\b/i, image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bladyfinger(s)?\b/i, image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcoriander\b/i, image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcilantro\b/i, image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bzucchini(s)?\b/i, image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcourgette(s)?\b/i, image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\basparagus\b/i, image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d814e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcoconut(s)?\b/i, image: 'https://images.unsplash.com/photo-1543218024-57a70143c369?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bkiwi(s)?\b/i, image: 'https://images.unsplash.com/photo-1585059895524-72359e061381?auto=format&fit=crop&q=80&w=600' }
];

const resolveProduceImage = (name, category) => {
  if (!name) return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
  
  for (const rule of PRODUCE_RULES) {
    if (rule.pattern.test(name)) {
      return rule.image;
    }
  }
  
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
};

const resolveProduceCategory = (name) => {
  if (!name) return 'Other';
  const cleanName = name.toLowerCase().trim();
  
  const fruits = [
    'apple', 'banana', 'orange', 'mango', 'strawberry', 'grapes', 'grape', 
    'pineapple', 'lemon', 'lime', 'watermelon', 'avocado', 'papaya', 'peach', 
    'cherry', 'berry', 'blueberry', 'raspberry', 'blackberry', 'pear', 'plum', 
    'guava', 'pomegranate', 'kiwi', 'melon', 'apricot', 'fig', 'date', 'coconut'
  ];
  
  const vegetables = [
    'potato', 'tomato', 'onion', 'carrot', 'garlic', 'spinach', 'broccoli', 
    'cucumber', 'pepper', 'chili', 'chillies', 'chilli', 'lettuce', 'cabbage', 'mushroom', 
    'corn', 'pumpkin', 'eggplant', 'brinjal', 'cauliflower', 'ginger', 'pea', 'peas', 
    'beet', 'radish', 'bean', 'beans', 'mint', 'basil', 'okra', 'ladyfinger', 'coriander', 
    'cilantro', 'zucchini', 'courgette', 'asparagus', 'celery', 'kale', 'leek', 'turnip'
  ];
  
  const grains = [
    'wheat', 'rice', 'barley', 'grain', 'oats', 'oat', 'rye', 'millet', 'quinoa'
  ];

  for (const fruit of fruits) {
    const regex = new RegExp('\\b' + fruit + 's?\\b', 'i');
    if (regex.test(cleanName)) return 'Fruit';
  }
  
  for (const veg of vegetables) {
    const regex = new RegExp('\\b' + veg + 's?\\b', 'i');
    if (regex.test(cleanName)) return 'Vegetable';
  }
  
  for (const grain of grains) {
    const regex = new RegExp('\\b' + grain + 's?\\b', 'i');
    if (regex.test(cleanName)) return 'Grain';
  }
  
  return 'Other';
};


const Farmer = ({ addToast }) => {
  const { user, token, triggerLogin } = useAuth();
  
  const farmerName = user?.name || '';
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

  // Sync profile form when user logs in or edits location
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, location: farmerLocation });
    }
  }, [user, farmerLocation]);

  // Fetch products and orders
  useEffect(() => {
    if (user && user.role === 'Farmer' && token) {
      fetchProducts();
      fetchOrders();
    }
  }, [user, token]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/mine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (err) {
      addToast('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    if (!profileForm.location) {
      addToast('Farm location is required', 'error');
      return;
    }
    setFarmerLocation(profileForm.location);
    localStorage.setItem('farmer_location', profileForm.location);
    setIsEditingProfile(false);
    addToast('Farm profile updated successfully', 'success');
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
      imageUrl: imageUrl || resolveProduceImage(name, category),
      farmerLocation
    };

    try {
      let response;
      if (editingProduct) {
        response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Access check: only let logged-in Farmers inside
  if (!user || user.role !== 'Farmer') {
    return (
      <div className="empty-placeholder" style={{ marginTop: '5rem', padding: '4rem 2.5rem' }}>
        <ShieldAlert className="empty-placeholder-icon" style={{ color: 'var(--accent)', strokeWidth: 1.5 }} />
        <h3>Farmer Dashboard Access Restricted</h3>
        <p>You must be signed in with a Farmer account to add listings, manage stock, and process received customer orders.</p>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => triggerLogin()}>
          Sign In as Farmer
        </button>
      </div>
    );
  }

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
                  value={profileForm.location} 
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="Farm Location"
                  style={{ background: 'white', color: 'var(--text-dark)', width: '350px' }}
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
                        <span className="price-val">₹{Number(product.price).toFixed(2)}</span>
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
                          <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-total-price">
                        Your Order Earnings: <strong>₹{farmerSubtotal.toFixed(2)}</strong>
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
                  onChange={(e) => {
                    const newName = e.target.value;
                    const resolvedCat = resolveProduceCategory(newName);
                    setProductForm({ 
                      ...productForm, 
                      name: newName,
                      category: resolvedCat
                    });
                  }}
                  placeholder="Organic Strawberries, Fresh Spinach, etc."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category (Auto-detected)</label>
                  <div style={{
                    padding: '0.8rem',
                    background: 'var(--bg-soft)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: productForm.category === 'Fruit' ? '#FBBC05' : productForm.category === 'Vegetable' ? '#34A853' : productForm.category === 'Grain' ? '#E28743' : '#777777'
                    }}></span>
                    {productForm.category}
                  </div>
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
                  <label className="form-label">Price per Unit (₹) *</label>
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
                  If left empty, a high-quality produce or category image will be automatically resolved.
                </span>
                
                {/* Live Image Preview Card */}
                <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem', border: '1px dashed var(--border-color)', borderRadius: '8px', background: '#fcfcfc' }}>
                  <img 
                    src={productForm.imageUrl || resolveProduceImage(productForm.name, productForm.category)} 
                    alt="Produce Preview"
                    style={{ width: '80px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', color: 'var(--text-dark)' }}>Live Image Preview</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {productForm.imageUrl ? 'Using custom URL' : `Resolved: ${productForm.name ? 'matching produce name' : 'category fallback'}`}
                    </span>
                  </div>
                </div>
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
