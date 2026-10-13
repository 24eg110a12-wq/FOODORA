import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Tag, CreditCard, ShieldCheck, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import { apiRequest } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New address state
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('New York');
  const [newZip, setNewZip] = useState('10001');
  const [newInstructions, setNewInstructions] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Loyalty & payment state
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_PAYMENT' | 'ONLINE_CARD' | 'CASH_ON_DELIVERY'>('DEMO_PAYMENT');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await apiRequest('/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
        if (res.data.length > 0) {
          setSelectedAddressId(res.data[0]._id);
        } else {
          setShowNewAddressForm(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/addresses', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: user?.name,
          phone: user?.phone || '555-0100',
          street: newStreet,
          city: newCity,
          postalCode: newZip,
          deliveryInstructions: newInstructions,
          isDefault: true
        })
      });
      if (res.success && res.data) {
        setAddresses([res.data, ...addresses]);
        setSelectedAddressId(res.data._id);
        setShowNewAddressForm(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving address');
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      const res = await apiRequest('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode,
          subtotal: cart?.subtotal,
          restaurantId: (cart?.restaurantId as any)?._id || cart?.restaurantId
        })
      });
      if (res.success) {
        setAppliedCoupon(res.coupon);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
    }
  };

  // Indian Rupee Calculations
  const subtotal = cart?.subtotal || 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const loyaltyDiscount = redeemLoyalty ? Math.min((user?.loyaltyPoints || 0), subtotal - couponDiscount) : 0; // 1 point = ₹1
  const totalDiscount = couponDiscount + loyaltyDiscount;

  const deliveryFee = subtotal >= 599 ? 0 : 49;
  const tax = Math.round((subtotal - totalDiscount) * 0.05); // 5% GST
  const serviceFee = 19; // ₹19 platform fee
  const grandTotal = Math.max(0, subtotal - totalDiscount + deliveryFee + tax + serviceFee);

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddress) {
      alert('Please specify a delivery address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: (cart?.restaurantId as any)?._id || cart?.restaurantId,
          deliveryAddress: {
            label: selectedAddress.label,
            recipientName: selectedAddress.recipientName,
            phone: selectedAddress.phone,
            street: selectedAddress.street,
            city: selectedAddress.city,
            postalCode: selectedAddress.postalCode,
            deliveryInstructions: selectedAddress.deliveryInstructions
          },
          couponCode: appliedCoupon?.code,
          redeemLoyaltyPoints: redeemLoyalty,
          paymentMethod
        })
      });

      if (res.success && res.data) {
        await refreshCart();
        await refreshUser();
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Order failed to place');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '30px' }}>
        Checkout & Payment
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        {/* Left Column: Delivery Address & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Delivery Address */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--primary)" /> 1. Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                {showNewAddressForm ? 'Select Saved' : '+ New Address'}
              </button>
            </div>

            {showNewAddressForm ? (
              <form onSubmit={handleCreateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Street Address (e.g. 150 Broadway Apt 4B)"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    style={{ flex: 2, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    required
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Delivery Instructions (gate code, door attendant, etc.)"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', alignSelf: 'flex-start' }}>
                  Save and Use Address
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => setSelectedAddressId(a._id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${selectedAddressId === a._id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      background: selectedAddressId === a._id ? 'var(--primary-light)' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.label}</span>
                      {selectedAddressId === a._id && <CheckCircle2 size={16} color="var(--primary)" />}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.street}, {a.city} {a.postalCode}</p>
                    {a.deliveryInstructions && (
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                        Note: {a.deliveryInstructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="var(--primary)" /> 2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: `2px solid ${paymentMethod === 'DEMO_PAYMENT' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: paymentMethod === 'DEMO_PAYMENT' ? 'var(--primary-light)' : 'white'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'DEMO_PAYMENT'}
                  onChange={() => setPaymentMethod('DEMO_PAYMENT')}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instant Simulated Card (Development Ready)</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant approval sandbox payment</p>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: `2px solid ${paymentMethod === 'ONLINE_CARD' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: paymentMethod === 'ONLINE_CARD' ? 'var(--primary-light)' : 'white'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'ONLINE_CARD'}
                  onChange={() => setPaymentMethod('ONLINE_CARD')}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Debit / Credit Card</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Encrypted server-verified gateway</p>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: `2px solid ${paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--primary-light)' : 'white'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cash on Delivery</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay in cash upon doorstep delivery</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Bill Breakdown & Promotions */}
        <div>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--secondary)' }}>
              Bill Breakdown
            </h3>

            {/* Coupon Code Input */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Promo code (e.g. WELCOME20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, marginTop: '6px' }}>
                  ✓ Code {appliedCoupon.code} applied (-₹{appliedCoupon.discountAmount})
                </p>
              )}
              {couponError && (
                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '6px' }}>
                  {couponError}
                </p>
              )}
            </div>

            {/* Loyalty points redemption checkbox */}
            {user && user.loyaltyPoints >= 100 && (
              <div style={{
                background: 'var(--primary-light)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={redeemLoyalty}
                    onChange={(e) => setRedeemLoyalty(e.target.checked)}
                  />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Redeem {user.loyaltyPoints} points for ₹{user.loyaltyPoints} off
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Itemized charges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Food Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal}</span>
              </div>

              {totalDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Discounts & Rewards</span>
                  <span style={{ fontWeight: 700 }}>-₹{totalDiscount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Goods & Services Tax (5% GST)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{tax}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Platform Handling Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{serviceFee}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Payable</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earn ~{Math.round(grandTotal / 10)} loyalty points</p>
              </div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{grandTotal}
              </span>
            </div>

            <button
              disabled={submitting}
              onClick={handlePlaceOrder}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '1.05rem'
              }}
            >
              {submitting ? 'Placing Order...' : 'Confirm and Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
