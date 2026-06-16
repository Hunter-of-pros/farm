import React, { useState } from 'react';
import { X, Trash2, ArrowLeft, ShoppingCart, CreditCard, Sparkles, Loader2 } from 'lucide-react';

const Cart = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, clearCart, addToast }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        farmerName: item.farmerName
      }));

      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          customerAddress: formData.address,
          items: orderItems,
          totalAmount: totalAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      addToast('Order placed successfully! Fresh farm goods are on their way.', 'success');
      clearCart();
      setIsCheckout(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      onClose();
    } catch (err) {
      addToast(err.message || 'Error processing your checkout', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          {isCheckout ? (
            <button 
              onClick={() => setIsCheckout(false)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <h2>
              <ShoppingCart size={22} style={{ color: 'var(--primary)' }} /> 
              Shopping Cart
            </h2>
          )}
          <button onClick={onClose} className="modal-close" style={{ position: 'static' }}>
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={60} style={{ opacity: 0.2, color: 'var(--primary)' }} />
            <p>Your shopping cart is empty</p>
            <button className="btn btn-primary" onClick={onClose}>Browse Produce</button>
          </div>
        ) : !isCheckout ? (
          /* View 1: Cart Items List */
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  <img 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200"} 
                    alt={item.name} 
                    className="cart-item-img" 
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-title">{item.name}</div>
                    <div className="cart-item-farmer">from {item.farmerName} ({item.farmerLocation})</div>
                    <div className="cart-item-price">${Number(item.price).toFixed(2)} / {item.unit}</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.productId, -1)}>-</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.productId, 1)}>+</button>
                    </div>
                    <button className="item-remove-btn" onClick={() => removeFromCart(item.productId)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-totals">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <button 
                className="btn btn-secondary cart-checkout-btn"
                onClick={() => setIsCheckout(true)}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          /* View 2: Checkout Form */
          <form className="cart-items" style={{ justifyContent: 'flex-start' }} onSubmit={handleCheckoutSubmit}>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'var(--primary-dark)' }}>Delivery Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>We collect your info to coordinate direct delivery from local farms.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Name *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="John Doe" 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="+1 (555) 000-0000" 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="john@example.com" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input" 
                rows="3"
                placeholder="123 Farm Road, Suite A" 
                style={{ resize: 'vertical' }}
                required
              ></textarea>
            </div>

            <div className="cart-footer" style={{ background: 'none', padding: '1.5rem 0 0 0', marginTop: 'auto' }}>
              <div className="cart-totals" style={{ marginBottom: '1rem' }}>
                <span>Order Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary cart-checkout-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} /> Place Direct Order
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Cart;
