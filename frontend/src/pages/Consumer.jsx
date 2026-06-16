import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, Info, Sparkles, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Vegetable', 'Fruit', 'Grain', 'Other'];

const Consumer = ({ cart, addToCart, addToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal details state
  const [detailedProduct, setDetailedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (err) {
      addToast('Error loading marketplace products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter products locally for instantaneous UI updates
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (productId) => {
    const item = cart.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    const currentQtyInCart = getCartQuantity(product._id);
    if (currentQtyInCart >= product.quantity) {
      addToast(`Cannot add more. Only ${product.quantity} units are available in stock.`, 'warning');
      return;
    }
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      maxQuantity: product.quantity
    });
  };

  return (
    <div>
      {/* Marketplace Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(rgba(32, 45, 29, 0.45), rgba(32, 45, 29, 0.45)), url("/farm_banner.png")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--radius-lg)', 
          padding: '4rem 2.5rem', 
          color: 'white', 
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          Support Local Farmers
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.95, textShadow: '0 2px 8px rgba(0,0,0,0.3)', maxWidth: '600px', margin: '0 auto' }}>
          Browse organic harvest, select ingredients, and support agriculture directly from nearby farms.
        </p>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="toolbar-container">
        {/* Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products, farmers, descriptions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Categories filters */}
        <div className="filter-categories">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'All' ? 'All Produce' : `${category}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem' }}>Fetching harvest list...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-placeholder">
          <SlidersHorizontal className="empty-placeholder-icon" />
          <h3>No Produce Found</h3>
          <p>We couldn't find any products matching your selection. Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const quantityInCart = getCartQuantity(product._id);
            const isOutOfStock = product.quantity === 0;
            const isLimitReached = quantityInCart >= product.quantity;

            return (
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
                  <div className="farmer-tag">
                    <MapPin size={14} /> Sold by {product.farmerName} ({product.farmerLocation})
                  </div>
                  <p className="card-desc">{product.description || 'Harvested fresh from the field.'}</p>
                  
                  <div className="card-footer" style={{ marginBottom: '1.25rem' }}>
                    <div className="price-tag">
                      <span className="price-val">${Number(product.price).toFixed(2)}</span>
                      <span className="price-unit">per {product.unit}</span>
                    </div>
                    <span className={`stock-tag ${isOutOfStock ? 'out' : product.quantity <= 10 ? 'low' : ''}`}>
                      {isOutOfStock ? 'Out of Stock' : `${product.quantity} ${product.unit}s left`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: '0.5rem', marginTop: 'auto' }}>
                    <button 
                      className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`} 
                      style={{ padding: '0.6rem' }}
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || isLimitReached}
                    >
                      <ShoppingCart size={16} /> 
                      {isOutOfStock ? 'Out of Stock' : isLimitReached ? 'Limit Reached' : quantityInCart > 0 ? `In Cart (${quantityInCart})` : 'Add to Cart'}
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                      onClick={() => setDetailedProduct(product)}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Modal */}
      {detailedProduct && (
        <div className="modal-overlay" onClick={() => setDetailedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <button className="modal-close" onClick={() => setDetailedProduct(null)}>
              ✕
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <img 
                src={detailedProduct.imageUrl} 
                alt={detailedProduct.name} 
                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)' }}
              />
              <div>
                <span className="category-tag" style={{ position: 'static', display: 'inline-block', marginBottom: '0.5rem' }}>
                  {detailedProduct.category}
                </span>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{detailedProduct.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <MapPin size={16} />
                  <span>Harvested at <strong>{detailedProduct.farmerLocation}</strong> by <strong>{detailedProduct.farmerName}</strong></span>
                </div>
                
                <p style={{ fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {detailedProduct.description || 'No detailed description provided by the farmer. Rest assured this item is fresh, local, and packed with care.'}
                </p>

                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    background: 'var(--primary-soft)', 
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Unit Price</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', fontFamily: 'Outfit, sans-serif' }}>
                      ${Number(detailedProduct.price).toFixed(2)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/ {detailedProduct.unit}</span>
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>Availability</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: detailedProduct.quantity === 0 ? 'red' : 'inherit' }}>
                      {detailedProduct.quantity === 0 ? 'Out of Stock' : `${detailedProduct.quantity} ${detailedProduct.unit}s available`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0.8rem' }}
                    onClick={() => {
                      handleAddToCart(detailedProduct);
                      setDetailedProduct(null);
                    }}
                    disabled={detailedProduct.quantity === 0 || getCartQuantity(detailedProduct._id) >= detailedProduct.quantity}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.8rem 1.5rem' }} 
                    onClick={() => setDetailedProduct(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consumer;
