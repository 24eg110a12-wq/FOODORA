import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';
import { apiRequest } from '../services/api';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading notification alerts...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time updates on orders, kitchen status, and couriers</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You're all caught up! No notifications right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: n.isRead ? '4px solid var(--border-subtle)' : '4px solid var(--primary)',
                background: n.isRead ? 'white' : '#FFFBF9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>{n.title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
