import React, { useState } from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { FoodItem, SelectedOption } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  item: FoodItem;
}

export const FoodItemCard: React.FC<Props> = ({ item }) => {
  const { addToCart } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleOptionToggle = (groupName: string, optionName: string, priceDelta: number, maxSelect: number) => {
    setSelectedOptions((prev) => {
      if (maxSelect === 1) {
        const filtered = prev.filter((o) => o.groupName !== groupName);
        return [...filtered, { groupName, optionName, priceDelta }];
      } else {
        const exists = prev.some((o) => o.groupName === groupName && o.optionName === optionName);
        if (exists) {
          return prev.filter((o) => !(o.groupName === groupName && o.optionName === optionName));
        } else {
          return [...prev, { groupName, optionName, priceDelta }];
        }
      }
    });
  };

  const calculateCurrentPrice = () => {
    const extra = selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
    return ((item.basePrice + extra) * quantity).toFixed(2);
  };

  const handleAddToCart = async (clearExisting = false) => {
    try {
      setAdding(true);
      await addToCart(item._id, quantity, selectedOptions, specialInstructions, clearExisting);
      setModalOpen(false);
      setConfirmClearOpen(false);
    } catch (err: any) {
      if (err.message && err.message.includes('another restaurant')) {
        setConfirmClearOpen(true);
      } else {
        alert(err.message || 'Could not add item to cart');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="card" style={{ display: 'flex', overflow: 'hidden', minHeight: '185px' }}>
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary)' }}>{item.name}</h4>
              {item.dietaryLabels?.map((l) => (
                <span key={l} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{l}</span>
              ))}
            </div>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.4'
            }}>
              {item.description}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{item.basePrice}
            </span>
            <button
              onClick={() => {
                if (item.customizationGroups?.length > 0) {
                  setModalOpen(true);
                } else {
                  handleAddToCart();
                }
              }}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div style={{ width: '150px', position: 'relative' }}>
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Customization Modal */}
      {modalOpen && (
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
          <div className="card animate-fade-in" style={{
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customize {item.name}</h3>
              <button onClick={() => setModalOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {item.customizationGroups?.map((group) => (
                <div key={group.groupName} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{group.groupName}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {group.maxSelect === 1 ? 'Choose 1' : `Up to ${group.maxSelect}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.options.map((opt) => {
                      const isSelected = selectedOptions.some(
                        (o) => o.groupName === group.groupName && o.optionName === opt.name
                      );
                      return (
                        <div
                          key={opt.name}
                          onClick={() => handleOptionToggle(group.groupName, opt.name, opt.priceDelta, group.maxSelect)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--primary-light)' : 'white'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400 }}>{opt.name}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {opt.priceDelta > 0 ? `+₹${opt.priceDelta}` : 'Free'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Special Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. dressing on the side, extra napkins..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '32px', height: '32px', border: '1px solid var(--border-subtle)', borderRadius: '50%', fontWeight: 700 }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '32px', height: '32px', border: '1px solid var(--border-subtle)', borderRadius: '50%', fontWeight: 700 }}
                >
                  +
                </button>
              </div>

              <button
                disabled={adding}
                onClick={() => handleAddToCart(false)}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Add for ₹{calculateCurrentPrice()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-restaurant Conflict Confirmation Modal */}
      {confirmClearOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '440px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>
              Replace items in cart?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
              Your cart currently contains dishes from another restaurant. FOODORA orders can only be placed from one kitchen at a time.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmClearOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleAddToCart(true)} className="btn-primary">
                Clear Cart & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
