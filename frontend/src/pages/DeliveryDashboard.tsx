import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, KeyRound } from 'lucide-react';
import { Order } from '../types';
import { apiRequest } from '../services/api';

export const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await apiRequest('/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string, pinRequired = false) => {
    const pin = pinInputs[orderId];
    if (pinRequired && !pin) {
      alert('Please enter the customer dropoff PIN to confirm delivery');
      return;
    }

    try {
      const res = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, deliveryCode: pin })
      });
      if (res.success) {
        fetchDeliveries();
      }
    } catch (err: any) {
      alert(err.message || 'Delivery status update failed');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading courier assignments...</div>;
  }

  const availableJobs = orders.filter((o) => o.orderStatus === 'READY_FOR_PICKUP' && !o.deliveryPartnerId);
  const myActiveJobs = orders.filter((o) => ['PICKED_UP', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.orderStatus));

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
          Courier Dispatch Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time order pickups, GPS navigation simulations, and PIN-verified dropoffs
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Active Deliveries */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)' }}>
            My Active Runs ({myActiveJobs.length})
          </h2>

          {myActiveJobs.length === 0 ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active deliveries right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myActiveJobs.map((job) => (
                <div key={job._id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="badge badge-primary">{job.orderNumber}</span>
                    <span className="badge badge-warning">{job.orderStatus}</span>
                  </div>

                  <div style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
                    <p style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                      📍 Pickup: {(job.restaurantId as any)?.name}
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {(job.restaurantId as any)?.address?.street}
                    </p>
                    <p style={{ fontWeight: 700, color: 'var(--secondary)', marginTop: '8px' }}>
                      🏠 Dropoff: {job.deliveryAddress.recipientName}
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {job.deliveryAddress.street}, {job.deliveryAddress.city}
                    </p>
                    {job.deliveryAddress.deliveryInstructions && (
                      <p style={{ color: '#B45309', background: '#FEF3C7', padding: '6px', borderRadius: '4px', marginTop: '6px' }}>
                        Instructions: {job.deliveryAddress.deliveryInstructions}
                      </p>
                    )}
                  </div>

                  {/* Progressive action workflow */}
                  {job.orderStatus === 'READY_FOR_PICKUP' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'PICKED_UP')}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    >
                      <Truck size={16} /> Confirm Order Picked Up
                    </button>
                  )}

                  {job.orderStatus === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'OUT_FOR_DELIVERY')}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    >
                      <Navigation size={16} /> Start Navigation to Customer
                    </button>
                  )}

                  {job.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Enter 4-digit dropoff PIN"
                          value={pinInputs[job._id] || ''}
                          onChange={(e) => setPinInputs({ ...pinInputs, [job._id]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 700
                          }}
                        />
                        <button
                          onClick={() => handleUpdateStatus(job._id, 'DELIVERED', true)}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          Verify & Complete
                        </button>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        (Demo Hint: Ask customer or use code from order summary)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Delivery Requests */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)' }}>
            Available Orders for Pickup
          </h2>

          {availableJobs.length === 0 ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No unassigned orders ready for pickup.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {availableJobs.map((job) => (
                <div key={job._id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800 }}>{job.orderNumber}</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>+₹{job.priceBreakdown.deliveryFee} Fee</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    From: <b>{(job.restaurantId as any)?.name}</b> → To: <b>{job.deliveryAddress.city}</b>
                  </p>
                  <button
                    onClick={() => handleUpdateStatus(job._id, 'PICKED_UP')}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                  >
                    Accept & Pick Up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
