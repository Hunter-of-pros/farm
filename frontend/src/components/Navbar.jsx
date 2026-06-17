import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ cartCount, onCartClick }) => {
  const { user, triggerLogin, logout } = useAuth();

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
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginRight: '0.5rem' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '50%', 
              background: user.role === 'Farmer' ? 'var(--primary)' : 'var(--accent)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.2' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {user.role}
              </span>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', marginLeft: '0.5rem' }} 
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', marginRight: '0.5rem' }} 
            onClick={() => triggerLogin()}
          >
            Sign In
          </button>
        )}

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
