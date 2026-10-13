import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, Bike, Home, Star, AlertCircle, RotateCcw } from 'lucide-react';
import { Order } from '../types';
import { apiRequest } from '../services/api';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000); // Poll status updates every 6s
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await apiRequest(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await apiRequest(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED', reason: 'Customer requested cancellation' })
      });
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order?._id,
          restaurantId: (order?.restaurantId as any)?._id || order?.restaurantId,
          rating,
          comment
        })
      });
      if (res.success) {
        setReviewSubmitted(true);
        setReviewOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Could not submit review');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading order status...</div>;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Order not found</h2>
        <Link to="/orders" className="btn-primary" style={{ marginTop: '20px' }}>View All Orders</Link>
      </div>
    );
  }

  const steps = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed by Kitchen', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing Dishes', icon: ChefHat },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: Clock },
    { key: 'PICKED_UP', label: 'Courier Picked Up', icon: Bike },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered to Door', icon: Home }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-primary">{order.orderNumber}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>
              Status: <span style={{ color: 'var(--primary)' }}>{order.orderStatus.replace(/_/g, ' ')}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              From <b style={{ color: 'var(--secondary)' }}>{(order.restaurantId as any)?.name}</b>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Delivery</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h3>
            {order.deliveryVerificationCode && order.orderStatus !== 'DELIVERED' && (
              <div style={{ marginTop: '6px' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>
                  Dropoff PIN: {order.deliveryVerificationCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Timeline Stepper */}
        <div style={{ marginTop: '40px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            overflowX: 'auto',
            paddingBottom: '10px'
          }}>
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '110px',
                    textAlign: 'center',
                    opacity: isCompleted ? 1 : 0.4
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--primary)' : isCompleted ? '#10B981' : 'var(--bg-subtle)',
                    color: isCompleted ? 'white' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 800 : 600, color: 'var(--secondary)' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {/* Ordered Dishes Snapshot */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Ordered Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{i.quantity}x {i.name}</span>
                  {i.selectedOptions?.length > 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {i.selectedOptions.map((o) => o.optionName).join(', ')}
                    </p>
                  )}
                </div>
                <span style={{ fontWeight: 700 }}>₹{i.itemTotal}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--primary)' }}>₹{order.priceBreakdown.total}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Paid via {order.paymentMethod.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Delivery Details & Cancellation/Review controls */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Delivery Destination</h3>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.deliveryAddress.recipientName}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Phone: {order.deliveryAddress.phone}
          </p>
          {order.deliveryAddress.deliveryInstructions && (
            <p style={{ fontSize: '0.85rem', color: '#B45309', background: '#FEF3C7', padding: '8px 12px', borderRadius: '6px', marginTop: '10px' }}>
              Instructions: {order.deliveryAddress.deliveryInstructions}
            </p>
          )}

          {/* Action buttons based on status */}
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.orderStatus === 'PLACED' && (
              <button
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }}
              >
                Cancel Order
              </button>
            )}

            {order.orderStatus === 'DELIVERED' && !reviewSubmitted && (
              <button
                onClick={() => setReviewOpen(true)}
                className="btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Star size={16} /> Rate & Review Order
              </button>
            )}

            {reviewSubmitted && (
              <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                ✓ Thank you for your review!
              </p>
            )}

            <Link
              to="/orders"
              className="btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Rate Your Meal</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{ padding: '6px' }}
                >
                  <Star
                    size={32}
                    fill={star <= rating ? '#F59E0B' : 'none'}
                    stroke={star <= rating ? '#F59E0B' : 'var(--text-light)'}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="How was the food flavor, temperature, and packaging?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setReviewOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmitReview} className="btn-primary">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
