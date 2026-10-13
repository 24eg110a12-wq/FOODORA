import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flame, ArrowRight, Shield, Award, Clock, Star, Gift } from 'lucide-react';
import { Restaurant, Category, FoodItem } from '../types';
import { apiRequest } from '../services/api';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodItemCard } from '../components/FoodItemCard';

export const LandingPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiRequest('/restaurants?sort=rating').then((res) => {
      if (res.success) setRestaurants(res.data.slice(0, 4));
    });

    apiRequest('/food/categories').then((res) => {
      if (res.success) setCategories(res.data);
    });

    apiRequest('/food?featured=true').then((res) => {
      if (res.success) setFeaturedDishes(res.data.slice(0, 4));
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF6F3 0%, var(--bg-main) 100%)',
        padding: '60px 0 80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '50px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '20px'
            }}>
              <span className="badge badge-primary">FOODORA EXCLUSIVE</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>
                Discover. Order. Enjoy.
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: 800,
              color: 'var(--secondary)',
              lineHeight: 1.15,
              marginBottom: '20px'
            }}>
              Good Food. <br />
              <span style={{ color: 'var(--primary)' }}>Great Mood.</span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              marginBottom: '32px',
              maxWidth: '520px',
              lineHeight: 1.6
            }}>
              Your favorite food, your favorite restaurants, delivered with convenience. Track orders live from the kitchen to your doorstep.
            </p>

            {/* Search Input CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              borderRadius: 'var(--radius-full)',
              padding: '8px 10px 8px 20px',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '480px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <Search size={20} color="var(--primary)" style={{ marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Search pizzas, burgers, artisan sushi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  background: 'transparent',
                  color: 'var(--text-main)',
                  fontWeight: 500
                }}
              />
              <Link to={`/restaurants?search=${encodeURIComponent(searchTerm)}`} className="btn-primary" style={{ padding: '10px 20px' }}>
                Search
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Clock size={16} color="var(--primary)" /> <span>Average 28m delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Gift size={16} color="var(--primary)" /> <span>Earn loyalty rewards</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              height: '420px',
              position: 'relative'
            }}>
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000"
                alt="Foodora Culinary Feast"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'
              }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', color: 'white' }}>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Trending Kitchen</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Chef Marco's Woodfired Trattoria</h3>
                <p style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>Neapolitan sourdough baked at 900°F</p>
              </div>
            </div>

            {/* Floating Live Tracking Badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '-20px',
              background: 'white',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)'
              }} />
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE ORDER DISPATCH</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary)' }}>Real-time GPS Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="container" style={{ margin: '40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--secondary)' }}>Cuisine Categories</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Freshly prepared dishes from our curated kitchen partners</p>
          </div>
          <Link to="/restaurants" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary)' }}>
            See All <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/restaurants?category=${c.slug}`}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                cursor: 'pointer'
              }}
            >
              <img
                src={c.imageUrl}
                alt={c.name}
                style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>{c.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explore Menu</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="container" style={{ margin: '60px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--secondary)' }}>Top-Rated Restaurants</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vetted local kitchens with exceptional customer feedback</p>
          </div>
          <Link to="/restaurants" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary)' }}>
            Browse All <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {restaurants.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      </section>

      {/* Trending Dishes */}
      <section className="container" style={{ margin: '60px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Flame size={24} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--secondary)' }}>Popular Dishes Today</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Most ordered items across the FOODORA platform</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {featuredDishes.map((d) => (
            <FoodItemCard key={d._id} item={d} />
          ))}
        </div>
      </section>

      {/* How FOODORA Works & Benefits */}
      <section style={{ background: 'white', padding: '60px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>Why Order with FOODORA?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>A modern ecosystem connecting discerning customers, authentic restaurants, and dedicated couriers.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '30px'
          }}>
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Live Order Timeline</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Track your order at every step: Placed, Confirmed, Preparing, Ready for Pickup, and Out for Delivery.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Loyalty Points Program</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Earn 10 points for every dollar spent on eligible orders. Redeem accrued points directly toward future meals.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Verified Deliveries</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Courier drop-offs are verified using dedicated secure verification PIN codes for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
