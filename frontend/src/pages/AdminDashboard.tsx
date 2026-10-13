import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  Tag, 
  CheckCircle2, 
  Ban, 
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'coupons' | 'audit'>('overview');
  const [loading, setLoading] = useState(true);

  // New coupon modal state
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrder, setMinOrder] = useState(20);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, couponsRes, auditRes] = await Promise.all([
        apiRequest('/admin/dashboard'),
        apiRequest('/admin/users'),
        apiRequest('/admin/coupons'),
        apiRequest('/admin/audit-logs')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.data);
      if (couponsRes.success) setCoupons(couponsRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId: string) => {
    try {
      const res = await apiRequest(`/admin/users/${userId}/status`, { method: 'PATCH' });
      if (res.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrder)
        })
      });
      if (res.success) {
        alert('Coupon created successfully!');
        setCouponCode('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading Admin Portal...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)' }}>
          FOODORA Administration Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Platform metrics, user governance, coupon engines, and system audit history
        </p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'overview' ? 'var(--secondary)' : 'white',
              color: activeTab === 'overview' ? 'white' : 'var(--text-main)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Metrics Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'users' ? 'var(--secondary)' : 'white',
              color: activeTab === 'users' ? 'white' : 'var(--text-main)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            User & Role Management
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'coupons' ? 'var(--secondary)' : 'white',
              color: activeTab === 'coupons' ? 'white' : 'var(--text-main)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Promotions & Coupons
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'audit' ? 'var(--secondary)' : 'white',
              color: activeTab === 'audit' ? 'white' : 'var(--text-main)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Key Metric KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gross Order Volume</span>
                <DollarSign size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{stats.grossSales}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>100% database aggregated</p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Platform Net Commission</span>
                <DollarSign size={20} color="#10B981" />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{stats.platformNetRevenue}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>15% net take rate</p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</span>
                <ShoppingBag size={20} color="#6366F1" />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalOrders}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all partners</p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Restaurants</span>
                <Store size={20} color="#F59E0B" />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.activeRestaurants}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.pendingRestaurants} pending verification</p>
            </div>
          </div>

          {/* Recent Orders Overview Table */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Recent Platform Activity</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Order Number</th>
                    <th style={{ padding: '10px' }}>Customer</th>
                    <th style={{ padding: '10px' }}>Restaurant</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.map((o: any) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>{o.orderNumber}</td>
                      <td style={{ padding: '12px 10px' }}>{o.customerId?.name || 'Customer'}</td>
                      <td style={{ padding: '12px 10px' }}>{o.restaurantId?.name || 'Restaurant'}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{o.priceBreakdown?.total}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="badge badge-primary">{o.orderStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>All Platform Accounts</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Loyalty</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '12px 10px' }}>{u.email}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="badge badge-primary">{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${u.accountStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{u.loyaltyPoints || 0} pts</td>
                    <td style={{ padding: '12px 10px' }}>
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Coupons */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {/* Create Coupon Form */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Issue Promotional Code</h3>
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Code (e.g. FLASH25)"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textTransform: 'uppercase' }}
              />
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              >
                <option value="PERCENTAGE">Percentage (%) Discount</option>
                <option value="FIXED">Fixed Dollar ($) Discount</option>
              </select>
              <input
                type="number"
                placeholder="Discount value"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
              <input
                type="number"
                placeholder="Minimum Order Amount"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px', justifyContent: 'center' }}>
                Create Coupon
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Active Promotions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coupons.map((c) => (
                <div key={c._id} style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{c.code}</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `$${c.discountValue} off`} • Min ${c.minOrderAmount}
                    </p>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Administrative Security Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div key={log._id} style={{ padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{log.action}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Actor: {log.actorId?.name || 'System'} ({log.actorId?.email || 'N/A'})</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
