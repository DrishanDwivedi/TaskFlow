import React, { useState } from 'react';
import { api, setAuthToken } from '../api/client';

export const AuthModal = ({ isOpen, initialMode = 'login', onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
        res = await api.register(formData);
      } else {
        res = await api.login({ email: formData.email, password: formData.password });
      }

      if (res.token) {
        setAuthToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="status-tabs" style={{ marginBottom: '0.5rem' }}>
          <button
            type="button"
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="e.g. john_doe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
