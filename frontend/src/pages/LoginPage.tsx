import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: 'var(--secondary)' }}>
          Welcome back to <span style={{ color: 'var(--primary)' }}>FOODORA</span>
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
          Discover. Order. Enjoy.
        </p>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '20px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register here</Link>
        </p>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quick Demo Login Access (1-Click)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer@foodora.demo', 'Customer123!')}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('restaurant@foodora.demo', 'Restaurant123!')}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              Restaurant Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('delivery@foodora.demo', 'Delivery123!')}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              Courier Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@foodora.demo', 'Admin123!')}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
