import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { RestaurantCard } from '../components/RestaurantCard';

export const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/wishlist')
      .then((res) => {
        if (res.success && res.data) {
          setWishlist(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading saved kitchens...</div>;
  }

  const restaurants = wishlist?.restaurantIds || [];

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
          Saved Kitchens & Favorites
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your bookmarked restaurants for instant reordering
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="card" style={{ maxWidth: '480px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Heart size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No saved restaurants yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Tap the heart icon on any restaurant page to save it to your wishlist.
          </p>
          <Link to="/restaurants" className="btn-primary" style={{ display: 'inline-flex' }}>
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {restaurants.map((r: any) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
};
