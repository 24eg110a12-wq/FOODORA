import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bike, ShieldCheck } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  return (
    <Link to={`/restaurants/${restaurant._id}`} className="card" style={{ display: 'block', overflow: 'hidden' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={restaurant.bannerUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Open/Closed Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {restaurant.isOpen ? (
            <span className="badge badge-success">Open Now</span>
          ) : (
            <span className="badge badge-danger">Closed</span>
          )}
        </div>
        {/* Delivery ETA Pill */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backdropFilter: 'blur(4px)'
        }}>
          <Clock size={14} />
          <span>{restaurant.deliverySettings.estimatedDeliveryTimeMin} mins</span>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {restaurant.name}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FEF3C7',
            color: '#B45309',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            <Star size={14} fill="#B45309" stroke="#B45309" />
            <span>{restaurant.ratingSummary.averageRating}</span>
          </div>
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {restaurant.cuisineTypes.join(' • ')}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bike size={16} color="var(--primary)" />
            <span>₹{restaurant.deliverySettings.baseDeliveryFee} delivery</span>
          </div>
          <div>
            <span>Min ₹{restaurant.deliverySettings.minOrderAmount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
