import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RotateCcw, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { apiRequest } from '../services/api';
import { useCart } from '../context/CartContext';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  useEffect(() => {
    apiRequest('/orders')
      .then((res) => {
        if (res.success && res.data) {
          setOrders(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = async (orderId: string) => {
    try {
      const res = await apiRequest(`/orders/${orderId}/reorder`, { method: 'POST' });
      if (res.success) {
        await refreshCart();
        window.location.href = '/cart';
      }
    } catch (err: any) {
      alert(err.message || 'Could not reorder');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--secondary)' }}>
            No orders yet. Your next favorite meal is waiting.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Check out restaurants nearby and enjoy fast delivery with rewards.
          </p>
          <Link to="/restaurants" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px' }}>
            Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '24px' }}>
        Past Orders & History
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((ord) => (
          <div key={ord._id} className="card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>{ord.orderNumber}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  {(ord.restaurantId as any)?.name || 'Restaurant'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(ord.placedAt).toLocaleDateString()} at {new Date(ord.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${
                  ord.orderStatus === 'DELIVERED' ? 'badge-success' :
                  ord.orderStatus === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {ord.orderStatus.replace(/_/g, ' ')}
                </span>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                  ₹{ord.priceBreakdown?.total}
                </p>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <p>Items: {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => handleReorder(ord._id)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <RotateCcw size={14} /> Reorder Dishes
              </button>
              <Link
                to={`/orders/${ord._id}`}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Track / View Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
