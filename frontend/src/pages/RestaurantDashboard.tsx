import React, { useState, useEffect } from 'react';
import { ChefHat, Check, X, Clock, Play } from 'lucide-react';
import { Order, Restaurant } from '../types';
import { apiRequest } from '../services/api';

export const RestaurantDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await apiRequest('/orders');
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }

      // Find owned restaurant
      const restRes = await apiRequest('/restaurants');
      if (restRes.success && restRes.data?.length > 0) {
        setRestaurant(restRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string, reason?: string) => {
    try {
      const res = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const handleToggleStore = async () => {
    if (!restaurant) return;
    try {
      const res = await apiRequest(`/restaurants/${restaurant._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isOpen: !restaurant.isOpen })
      });
      if (res.success) {
        setRestaurant(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Toggle failed');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading kitchen dashboard...</div>;
  }

  const incomingOrders = orders.filter((o) => o.orderStatus === 'PLACED');
  const activePrep = orders.filter((o) => ['CONFIRMED', 'PREPARING'].includes(o.orderStatus));
  const readyOrders = orders.filter((o) => o.orderStatus === 'READY_FOR_PICKUP');

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Kitchen Portal: {restaurant?.name || 'Restaurant'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live incoming queue, preparation control, and pickup readiness
          </p>
        </div>

        {restaurant && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              Kitchen Status: <span style={{ color: restaurant.isOpen ? 'var(--success)' : 'var(--danger)' }}>{restaurant.isOpen ? 'OPEN' : 'CLOSED'}</span>
            </span>
            <button
              onClick={handleToggleStore}
              className={restaurant.isOpen ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              {restaurant.isOpen ? 'Close Kitchen' : 'Open Kitchen'}
            </button>
          </div>
        )}
      </div>

      {/* Orders Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Column 1: Incoming Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Incoming Orders</h3>
            <span className="badge badge-primary">{incomingOrders.length}</span>
          </div>

          {incomingOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders waiting for confirmation.</p>
          ) : (
            incomingOrders.map((ord) => (
              <div key={ord._id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{ord.orderNumber}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{ord.priceBreakdown.total}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  {ord.items.map((i, idx) => (
                    <p key={idx}>{i.quantity}x {i.name}</p>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'CONFIRMED')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem', justifyContent: 'center' }}
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'REJECTED', 'Kitchen at capacity')}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.85rem', color: 'var(--danger)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: In Preparation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F59E0B', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Preparing Dishes</h3>
            <span className="badge badge-warning">{activePrep.length}</span>
          </div>

          {activePrep.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders currently on the stove.</p>
          ) : (
            activePrep.map((ord) => (
              <div key={ord._id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{ord.orderNumber}</span>
                  <span className="badge badge-warning">{ord.orderStatus}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  {ord.items.map((i, idx) => (
                    <p key={idx}><b>{i.quantity}x</b> {i.name}</p>
                  ))}
                </div>
                <button
                  onClick={() => handleUpdateStatus(ord._id, 'READY_FOR_PICKUP')}
                  className="btn-primary"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  <ChefHat size={16} /> Mark Ready for Courier
                </button>
              </div>
            ))
          )}
        </div>

        {/* Column 3: Ready for Pickup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #10B981', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Ready for Courier Pickup</h3>
            <span className="badge badge-success">{readyOrders.length}</span>
          </div>

          {readyOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All ready orders picked up.</p>
          ) : (
            readyOrders.map((ord) => (
              <div key={ord._id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{ord.orderNumber}</span>
                  <span className="badge badge-success">Bagged & Ready</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Waiting for courier to scan and pick up.
                </p>
                <div style={{ fontSize: '0.8rem', background: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                  <span>Dropoff PIN: <b>{ord.deliveryVerificationCode}</b></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
