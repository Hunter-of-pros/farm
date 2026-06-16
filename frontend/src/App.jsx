import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import { ToastContainer } from './components/Toast';
import Landing from './pages/Landing';
import Farmer from './pages/Farmer';
import Consumer from './pages/Consumer';
import './App.css';

function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('farm_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [toasts, setToasts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [dbMode, setDbMode] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('farm_cart', JSON.stringify(cart));
  }, [cart]);

  // Check backend health and DB status on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/health');
        if (res.ok) {
          const data = await res.json();
          setDbMode(data.databaseMode);
        }
      } catch (err) {
        console.warn('Backend server is offline or unreachable.');
        addToast('Backend server is offline. Please make sure the backend is running.', 'error');
      }
    };
    checkHealth();
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.productId === product.productId);
      
      if (existingIdx > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingIdx].quantity + 1;
        
        if (newQty > product.maxQuantity) {
          addToast(`Cannot add more. Limit of ${product.maxQuantity} reached for this item.`, 'warning');
          return prevCart;
        }
        
        updatedCart[existingIdx].quantity = newQty;
        addToast(`Incremented quantity of ${product.name} to ${newQty}`, 'success');
        return updatedCart;
      } else {
        addToast(`Added ${product.name} to your cart`, 'success');
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.productId === productId);
      if (existingIdx === -1) return prevCart;

      const updatedCart = [...prevCart];
      const currentItem = updatedCart[existingIdx];
      const newQty = currentItem.quantity + delta;

      if (newQty <= 0) {
        addToast(`Removed ${currentItem.name} from cart`, 'success');
        return prevCart.filter((item) => item.productId !== productId);
      }

      if (newQty > currentItem.maxQuantity) {
        addToast(`Cannot add more. Only ${currentItem.maxQuantity} available.`, 'warning');
        return prevCart;
      }

      updatedCart[existingIdx].quantity = newQty;
      return updatedCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.productId === productId);
      if (item) {
        addToast(`Removed ${item.name} from cart`, 'success');
      }
      return prevCart.filter((item) => item.productId !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Render a notice banner if database is running in local JSON fallback mode */}
        {dbMode && dbMode.includes('Fallback') && (
          <div className="db-mode-banner">
            <AlertCircle size={16} />
            <span>Note: Backend is running in <strong>JSON Fallback Local Storage Mode</strong> (MongoDB connection was not detected). App remains fully operational!</span>
          </div>
        )}

        <Navbar 
          cartCount={totalCartCount} 
          onCartClick={() => setIsCartOpen(true)} 
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/farmer" 
              element={<Farmer addToast={addToast} />} 
            />
            <Route 
              path="/consumer" 
              element={
                <Consumer 
                  cart={cart} 
                  addToCart={addToCart} 
                  addToast={addToast} 
                />
              } 
            />
          </Routes>
        </main>

        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          clearCart={clearCart} 
          addToast={addToast} 
        />

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </BrowserRouter>
  );
}

export default App;
