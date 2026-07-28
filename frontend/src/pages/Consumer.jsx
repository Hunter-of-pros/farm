import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, Info, Flame, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CATEGORIES = ['All', 'Vegetable', 'Fruit', 'Grain', 'Other'];

const Consumer = ({ cart, addToCart, addToast, refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('bestsellers'); // 'bestsellers', 'newest', 'price_low', 'price_high'

  // Modal details state
  const [detailedProduct, setDetailedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
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

  // Determine top sales benchmark to identify best sellers
  const maxSoldInCatalog = Math.max(0, ...products.map(p => p.soldCount || 0));

  // Filter and sort products (Best Sellers appear FIRST by default)
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'bestsellers') {
        const soldA = a.soldCount || 0;
        const soldB = b.soldCount || 0;
        if (soldB !== soldA) return soldB - soldA; // Highest selling first
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
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
      <div className="toolbar-container" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        {/* Search */}
        <div className="search-box" style={{ flex: '1 1 280px' }}>
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
        <div className="filter-categories" style={{ flex: '1 1 auto' }}>
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

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <ArrowUpDown size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
          >
            <option value="bestsellers">🔥 Best Sellers (Most Sold)</option>
            <option value="newest">🌱 Newest Harvest</option>
            <option value="price_low">₹ Price: Low to High</option>
            <option value="price_high">₹ Price: High to Low</option>
          </select>
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
            const soldCount = product.soldCount || 0;
            const isBestSeller = soldCount > 0 && (soldCount === maxSoldInCatalog || soldCount >= 10);

            return (
              <div key={product._id} className="card" style={{ position: 'relative' }}>
                <div className="card-image-wrapper">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="card-image"
                  />
                  {isBestSeller && (
                    <span className="bestseller-badge">
                      <Flame size={13} fill="white" /> BEST SELLER
                    </span>
                  )}
                  <span className="category-tag">{product.category}</span>
                </div>
                
                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="card-title">{product.name}</h3>
                  </div>

                  <div className="farmer-tag">
                    <MapPin size={14} /> Sold by {product.farmerName} ({product.farmerLocation})
                  </div>
                  <p className="card-desc">{product.description || 'Harvested fresh from the field.'}</p>
                  
                  <div className="card-footer" style={{ marginBottom: '1.25rem' }}>
                    <div className="price-tag">
                      <span className="price-val">₹{Number(product.price).toFixed(2)}</span>
                      <span className="price-unit">per {product.unit}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                      <span className={`stock-tag ${isOutOfStock ? 'out' : product.quantity <= 10 ? 'low' : ''}`}>
                        {isOutOfStock ? 'Out of Stock' : `${product.quantity} ${product.unit}s left`}
                      </span>
                      {soldCount > 0 && (
                        <span className="sold-badge" title="Total units ordered by customers">
                          <Flame size={12} /> {soldCount} {product.unit}s sold
                        </span>
                      )}
                    </div>
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
              <div style={{ position: 'relative' }}>
                <img 
                  src={detailedProduct.imageUrl} 
                  alt={detailedProduct.name} 
                  style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)' }}
                />
                {(detailedProduct.soldCount || 0) > 0 && (
                  <span className="bestseller-badge" style={{ top: '1rem', left: '1rem' }}>
                    <Flame size={14} fill="white" /> POPULAR ({detailedProduct.soldCount} SOLD)
                  </span>
                )}
              </div>

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
                      ₹{Number(detailedProduct.price).toFixed(2)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/ {detailedProduct.unit}</span>
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>Availability & Demand</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: detailedProduct.quantity === 0 ? 'red' : 'inherit', display: 'block', textAlign: 'right' }}>
                      {detailedProduct.quantity === 0 ? 'Out of Stock' : `${detailedProduct.quantity} ${detailedProduct.unit}s available`}
                    </span>
                    {(detailedProduct.soldCount || 0) > 0 && (
                      <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600, display: 'block', textAlign: 'right' }}>
                        🔥 Total Sales: {detailedProduct.soldCount} {detailedProduct.unit}s
                      </span>
                    )}
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

