import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, User, ShoppingBag } from 'lucide-react';

const Navbar = ({ cartCount, onCartClick }) => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <Sprout size={28} style={{ strokeWidth: 2.5 }} />
        FarmFresh<span>Direct</span>
      </NavLink>

      <div className="nav-links">
        <NavLink 
          to="/farmer" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Farmer Hub
        </NavLink>
        <NavLink 
          to="/consumer" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Marketplace
        </NavLink>
      </div>

      <div className="nav-actions">
        {cartCount !== undefined && (
          <button 
            className="btn btn-outline" 
            style={{ 
              padding: '0.5rem 1rem', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onClick={onCartClick}
          >
            <ShoppingBag size={18} />
            <span style={{ fontWeight: 600 }}>Cart</span>
            {cartCount > 0 && (
              <span 
                style={{ 
                  background: 'var(--accent)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginLeft: '0.2rem'
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
