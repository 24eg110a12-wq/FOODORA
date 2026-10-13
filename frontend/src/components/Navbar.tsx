import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  ShieldCheck, 
  Truck, 
  Store, 
  Bell, 
  Heart, 
  Gift, 
  Menu, 
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiRequest } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      apiRequest('/notifications')
        .then((res) => {
          if (res.success) setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF5A36, #FF3D14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(255, 90, 54, 0.3)'
          }}>
            F
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.03em' }}>
              FOOD<span style={{ color: 'var(--primary)' }}>ORA</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/restaurants" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
            <Compass size={18} color="var(--primary)" /> Explore Restaurants
          </Link>

          {user?.role === 'ADMIN' && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#6366F1' }}>
              <ShieldCheck size={18} /> Admin Portal
            </Link>
          )}

          {user?.role === 'RESTAURANT' && (
            <Link to="/restaurant/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#059669' }}>
              <Store size={18} /> Kitchen Dashboard
            </Link>
          )}

          {user?.role === 'DELIVERY' && (
            <Link to="/delivery/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#D97706' }}>
              <Truck size={18} /> Courier Hub
            </Link>
          )}
        </nav>

        {/* Right Actions: Cart, Rewards, Notifications, User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <>
              {/* Rewards Pill */}
              <Link to="/rewards" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                <Gift size={16} />
                <span>{user.loyaltyPoints || 0} pts</span>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" title="Saved Favorites" style={{ color: 'var(--text-muted)', padding: '6px' }}>
                <Heart size={20} />
              </Link>

              {/* Notifications */}
              <Link to="/notifications" title="Notifications" style={{ position: 'relative', color: 'var(--text-muted)', padding: '6px' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link to="/cart" style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--secondary)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                <ShoppingBag size={18} />
                <span>Cart</span>
                {itemCount > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontWeight: 700
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'white'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--secondary)',
                    fontSize: '0.8rem'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                </button>

                {profileDropdownOpen && (
                  <div
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '42px',
                      width: '220px',
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 0',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                      <span className="badge badge-primary" style={{ marginTop: '4px' }}>{user.role}</span>
                    </div>

                    <Link to="/orders" style={{ display: 'block', padding: '10px 16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      My Orders
                    </Link>
                    <Link to="/addresses" style={{ display: 'block', padding: '10px 16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      Saved Addresses
                    </Link>
                    <Link to="/support" style={{ display: 'block', padding: '10px 16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      Support Tickets
                    </Link>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--danger)',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
