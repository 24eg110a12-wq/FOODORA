import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Bike, MapPin, Heart, Share2, Info } from 'lucide-react';
import { Restaurant, FoodItem } from '../types';
import { apiRequest } from '../services/api';
import { FoodItemCard } from '../components/FoodItemCard';
import { useAuth } from '../context/AuthContext';

export const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
    if (user) {
      checkWishlistStatus();
    }
  }, [id, user]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/restaurants/${id}`);
      if (res.success && res.data) {
        setRestaurant(res.data.restaurant);
        setMenuItems(res.data.menuItems);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load restaurant details', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const res = await apiRequest('/wishlist');
      if (res.success && res.data) {
        const found = res.data.restaurantIds.some((r: any) => r._id === id || r === id);
        setIsFavorite(found);
      }
    } catch {}
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Please log in to save favorites');
      return;
    }
    try {
      const res = await apiRequest('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ restaurantId: id })
      });
      if (res.success) {
        setIsFavorite(res.isAdded);
      }
    } catch (err) {
      console.error('Wishlist toggle error', err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading kitchen menu...</div>;
  }

  if (!restaurant) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Restaurant not found</h2>
        <Link to="/restaurants" className="btn-primary" style={{ marginTop: '20px' }}>Browse Restaurants</Link>
      </div>
    );
  }

  // Extract unique category names
  const categories = ['All', ...Array.from(new Set(menuItems.map((m: any) => m.categoryId?.name || 'Mains')))];

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((m: any) => (m.categoryId?.name || 'Mains') === selectedCategory);

  return (
    <div>
      {/* Restaurant Header Banner */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <img
          src={restaurant.bannerUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)'
        }} />

        <div className="container" style={{
          position: 'absolute',
          bottom: '24px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          color: 'white'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`badge ${restaurant.isOpen ? 'badge-success' : 'badge-danger'}`}>
                {restaurant.isOpen ? 'Open Now' : 'Closed for Orders'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
                {restaurant.cuisineTypes.join(' • ')}
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>{restaurant.name}</h1>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> {restaurant.address.street}, {restaurant.address.city}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleToggleWishlist}
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: isFavorite ? 'var(--primary)' : 'white',
                padding: '10px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <Heart size={20} fill={isFavorite ? 'var(--primary)' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Meta Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border-subtle)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={18} fill="#F59E0B" stroke="#F59E0B" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{restaurant.ratingSummary.averageRating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({restaurant.ratingSummary.totalReviews} reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            <Clock size={16} color="var(--primary)" />
            <span>Delivery: <b>{restaurant.deliverySettings.estimatedDeliveryTimeMin} mins</b></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            <Bike size={16} color="var(--primary)" />
            <span>Delivery Fee: <b>₹{restaurant.deliverySettings.baseDeliveryFee}</b> (Free over ₹{restaurant.deliverySettings.freeDeliveryThreshold})</span>
          </div>
        </div>
      </div>

      {/* Menu Categories Tab Bar */}
      <div className="container" style={{ padding: '30px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '6px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                border: `1.5px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border-subtle)'}`,
                background: selectedCategory === cat ? 'var(--primary-light)' : 'white',
                color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-main)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '20px' }}>
          {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {filteredItems.map((item) => (
            <FoodItemCard key={item._id} item={item} />
          ))}
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-subtle)', paddingTop: '40px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', color: 'var(--secondary)' }}>
              Verified Customer Reviews
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.customerId?.name || 'Customer'}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
