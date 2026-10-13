import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, clearCart, itemCount } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <ShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--secondary)' }}>
            Your cart is waiting for something delicious
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Explore local restaurants and add dishes with custom options to get started.
          </p>
          <Link to="/restaurants" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px' }}>
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const restaurantName = (cart.restaurantId as any)?.name || 'Restaurant';

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>Your Basket</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ordering from <b style={{ color: 'var(--primary)' }}>{restaurantName}</b> ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </p>
        </div>
        <button
          onClick={clearCart}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}
        >
          <Trash2 size={16} /> Empty Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Cart Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.items.map((item) => (
            <div key={item._id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '4px' }}>
                  {item.name}
                </h4>
                {item.selectedOptions?.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {item.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(' | ')}
                  </p>
                )}
                {item.specialInstructions && (
                  <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    Note: "{item.specialInstructions}"
                  </p>
                )}
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{item.price} each
                </span>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                  <button
                    onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                    style={{ color: 'var(--text-main)', padding: '2px' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                    style={{ color: 'var(--text-main)', padding: '2px' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span style={{ fontWeight: 800, fontSize: '1.05rem', minWidth: '60px', textAlign: 'right' }}>
                  ₹{item.itemTotal}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Checkout Card */}
        <div>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--secondary)' }}>
              Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{cart.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery & Taxes</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Estimated Subtotal</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{cart.subtotal}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '1rem'
              }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
