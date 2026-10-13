import React, { useState, useEffect } from 'react';
import { Gift, Award, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/loyalty')
      .then((res) => {
        if (res.success && res.data) {
          setLoyaltyData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading loyalty balance...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
          FOODORA Loyalty Rewards
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Earn points automatically with every meal and redeem toward your favorite dishes
        </p>
      </div>

      {/* Balance Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-surface) 100%)',
        color: 'white',
        padding: '36px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Point Balance
            </span>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', margin: '8px 0' }}>
              {loyaltyData?.pointsBalance || 0} <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>pts</span>
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: '0.95rem' }}>
              Equivalent to <b>₹{loyaltyData?.pointsBalance || 0}</b> off your next food delivery
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '300px'
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>How it works:</p>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.5' }}>
              Spend ₹100 = Earn 10 points. 100 points = ₹100 instant discount selectable right on the checkout page!
            </p>
          </div>
        </div>
      </div>

      {/* Ledger History */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Points Activity History</h3>

        {loyaltyData?.transactions?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No point activity yet. Complete an order to earn points!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loyaltyData?.transactions?.map((t: any) => (
              <div key={t._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: t.pointsChange > 0 ? 'var(--success-bg)' : 'var(--primary-light)',
                    color: t.pointsChange > 0 ? 'var(--success)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {t.pointsChange > 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)' }}>{t.description}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span style={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: t.pointsChange > 0 ? 'var(--success)' : 'var(--primary)'
                }}>
                  {t.pointsChange > 0 ? `+${t.pointsChange}` : t.pointsChange} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
