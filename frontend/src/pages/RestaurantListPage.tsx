import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Restaurant } from '../types';
import { apiRequest } from '../services/api';
import { RestaurantCard } from '../components/RestaurantCard';

export const RestaurantListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const cuisine = searchParams.get('cuisine') || 'All';
  const sort = searchParams.get('sort') || 'rating';
  const search = searchParams.get('search') || '';

  const cuisinesList = [
    'All',
    'Italian',
    'Pizza',
    'Burgers',
    'American',
    'Japanese',
    'Sushi',
    'Indian',
    'Curry',
    'Mexican',
    'Tacos',
    'Desserts',
    'Bakery'
  ];

  useEffect(() => {
    fetchRestaurants();
  }, [searchParams]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (cuisine !== 'All') query.append('cuisine', cuisine);
      if (sort) query.append('sort', sort);
      if (search) query.append('search', search);

      const res = await apiRequest(`/restaurants?${query.toString()}`);
      if (res.success && res.data) {
        setRestaurants(res.data);
      }
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisineSelect = (c: string) => {
    const next = new URLSearchParams(searchParams);
    if (c === 'All') next.delete('cuisine');
    else next.set('cuisine', c);
    setSearchParams(next);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', e.target.value);
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('search') as HTMLInputElement;
    const next = new URLSearchParams(searchParams);
    if (input.value) next.set('search', input.value);
    else next.delete('search');
    setSearchParams(next);
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header and Controls */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '8px' }}>
          Explore Kitchens & Restaurants
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Discover neighborhood favorites delivering directly to you
        </p>

        {/* Search Bar & Sort Row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: '24px'
        }}>
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            flex: '1 1 300px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by restaurant name or cuisine..."
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Find
            </button>
          </form>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={18} color="var(--text-muted)" />
            <select
              value={sort}
              onChange={handleSortChange}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: 'white',
                fontWeight: 600,
                color: 'var(--secondary)',
                outline: 'none'
              }}
            >
              <option value="rating">Highest Rated</option>
              <option value="fastest">Fastest Delivery</option>
              <option value="fee_low">Lowest Delivery Fee</option>
            </select>
          </div>
        </div>

        {/* Cuisine Filter Chips */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '16px 0 8px 0'
        }}>
          {cuisinesList.map((c) => (
            <button
              key={c}
              onClick={() => handleCuisineSelect(c)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: `1.5px solid ${cuisine === c ? 'var(--primary)' : 'var(--border-subtle)'}`,
                background: cuisine === c ? 'var(--primary-light)' : 'white',
                color: cuisine === c ? 'var(--primary)' : 'var(--text-main)'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading kitchen listings...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No restaurants found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Try adjusting your search criteria or resetting cuisine filters.
          </p>
          <button onClick={() => setSearchParams({})} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {restaurants.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
};
