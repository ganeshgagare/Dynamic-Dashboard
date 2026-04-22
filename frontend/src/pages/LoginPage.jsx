import { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config.js';
import './auth.css';

const ROLES = ['Admin', 'Manager', 'Analyst', 'Viewer'];
const ROLE_ICONS = { Admin: '👑', Manager: '🎯', Analyst: '📊', Viewer: '👁' };

const API = `${API_BASE}/api/auth`;


export function LoginPage({ onLogin }) {
  const [tab, setTab]       = useState('login');
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'Admin' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.'); return;
    }
    if (tab === 'register' && !form.name.trim()) {
      setError('Full name is required.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setLoading(true);
    try {
      const endpoint = tab === 'login' ? `${API}/login` : `${API}/register`;
      const payload  = tab === 'login'
        ? { email: form.email.trim(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role };

      const { data } = await axios.post(endpoint, payload);
      // data = { id, name, email, role }
      onLogin(data);

    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        // Backend not running → inform user clearly
        setError('⚠ Backend server is offline. Start Spring Boot to enable real authentication.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setError(''); };

  return (
    <div className="auth-bg">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="url(#lg1)"/>
            <path d="M8 30 L15 18 L22 25 L29 13 L36 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="36" cy="19" r="3.5" fill="white" opacity="0.9"/>
            <defs><linearGradient id="lg1" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1"/><stop offset="1" stopColor="#a78bfa"/>
            </linearGradient></defs>
          </svg>
          <div>
            <div className="auth-logo-name">DataPulse</div>
            <div className="auth-logo-sub">Dynamic Dashboard</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={() => switchTab('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <div className="auth-field">
              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} autoFocus/>
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)} autoFocus={tab==='login'}/>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="pwd-wrap">
              <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div className="auth-field">
              <label>Select Role</label>
              <div className="role-grid">
                {ROLES.map(r => (
                  <button type="button" key={r}
                    className={`role-btn ${form.role===r?'active':''}`}
                    onClick={() => set('role', r)}>
                    <span className="role-icon">{ROLE_ICONS[r]}</span>
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <span className="auth-spinner"/>
              : (tab==='login' ? '→ Sign In' : '→ Create Account')}
          </button>

          <p className="auth-backend-note">
            🔒 Credentials are stored securely in PostgreSQL with BCrypt hashing.
            {tab === 'login' && <> Don't have an account? <button type="button" className="auth-link" onClick={() => switchTab('register')}>Register</button></>}
          </p>
        </form>
      </div>
    </div>
  );
}
