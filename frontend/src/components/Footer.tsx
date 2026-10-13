import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--secondary)',
      color: 'white',
      padding: '60px 0 30px 0',
      marginTop: '80px',
      borderTop: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Brand statement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              F
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>FOODORA</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Discover. Order. Enjoy. Your favorite food and favorite restaurants, delivered with utmost convenience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '16px', color: '#F1F5F9' }}>Explore</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#94A3B8' }}>
            <li><Link to="/restaurants">All Restaurants</Link></li>
            <li><Link to="/rewards">Loyalty Rewards Program</Link></li>
            <li><Link to="/orders">Order Tracking</Link></li>
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '16px', color: '#F1F5F9' }}>Partner Portals</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#94A3B8' }}>
            <li><Link to="/restaurant/dashboard">Restaurant Kitchen Portal</Link></li>
            <li><Link to="/delivery/dashboard">Courier Hub</Link></li>
            <li><Link to="/admin">Platform Administration</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '16px', color: '#F1F5F9' }}>Support & Help</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#94A3B8' }}>
            <li><Link to="/support">Help & Support Desk</Link></li>
            <li><span style={{ color: '#64748B' }}>Terms of Service</span></li>
            <li><span style={{ color: '#64748B' }}>Privacy Policy</span></li>
          </ul>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        color: '#64748B',
        fontSize: '0.85rem'
      }}>
        <p>© 2026 FOODORA Technologies Inc. All rights reserved.</p>
        <p>Built with React, Express, MongoDB & Node.js</p>
      </div>
    </footer>
  );
};
