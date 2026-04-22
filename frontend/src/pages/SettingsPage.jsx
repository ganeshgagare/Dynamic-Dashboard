import { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config.js';

export function SettingsPage({ user, onUpdateUser }) {
  const prefs = user?.preferences ? JSON.parse(user.preferences) : {};
  
  const [notif, setNotif] = useState(prefs.notif || { email: true, push: false, weekly: true });
  const [dashPrefs, setDashPrefs] = useState(prefs.dashPrefs || { dateRange: 'Last 30 Days', chartType: 'Bar Chart', rows: '16', refresh: '5 minutes' });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });

  const save = async () => {
    setError('');
    if (!profile.name.trim() || !profile.email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    
    try {
      // 1. Profile Update
      const { data: updatedProfile } = await axios.put(`${API_BASE}/api/auth/update/${user.id}`, profile);
      let mergedUser = updatedProfile;

      // 2. Preferences Update
      const prefsPayload = JSON.stringify({ notif, dashPrefs });
      const { data: updatedPrefs } = await axios.put(`${API_BASE}/api/auth/update/${user.id}/prefs`, { preferences: prefsPayload });
      mergedUser = { ...mergedUser, preferences: updatedPrefs.preferences };

      // 3. Password Update
      if (passwords.new || passwords.old) {
        if (!passwords.old) { setError('Current password required to change password.'); return; }
        if (passwords.new !== passwords.confirm) { setError('New passwords do not match.'); return; }
        
        await axios.put(`${API_BASE}/api/auth/update/${user.id}/password`, {
          oldPassword: passwords.old,
          newPassword: passwords.new
        });
        setPasswords({ old: '', new: '', confirm: '' });
      }

      onUpdateUser(mergedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">⚙ Settings</h2>
        <p className="page-sub">Manage your preferences and account settings</p>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-card">
          <h3 className="settings-section">👤 Profile</h3>
          <div className="settings-avatar-row">
            <div className="settings-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
            <div>
              <div className="settings-user-name">{user?.name || 'Admin User'}</div>
              <div className="settings-user-email">{user?.email || 'admin@datapulse.io'}</div>
              <div className="settings-role-badge">{user?.role || 'Admin'}</div>
            </div>
          </div>
          <div className="settings-field">
            <label>Display Name</label>
            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="settings-field">
            <label>Email</label>
            <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
          </div>
          <div className="settings-field"><label>Role</label><input readOnly defaultValue={user?.role || 'Admin'} style={{opacity:0.6,cursor:'not-allowed'}}/></div>
          {error && <div style={{color:'#ef4444', fontSize:'13px', marginTop:'4px', fontWeight:500}}>{error}</div>}
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <h3 className="settings-section">🔔 Notifications</h3>
          {[['email','Email Alerts','Receive task updates via email'],
            ['push','Push Notifications','Browser push notifications'],
            ['weekly','Weekly Report','Auto-generated weekly summary']].map(([k,label,desc]) => (
            <div key={k} className="settings-toggle-row">
              <div><div className="stl-label">{label}</div><div className="stl-desc">{desc}</div></div>
              <button className={`toggle-btn ${notif[k]?'on':''}`} onClick={() => setNotif(n=>({...n,[k]:!n[k]}))}>
                <span className="toggle-thumb"/>
              </button>
            </div>
          ))}
        </div>

        {/* Dashboard Preferences */}
        <div className="settings-card">
          <h3 className="settings-section">📊 Dashboard Preferences</h3>
          <div className="settings-field"><label>Default Date Range</label>
            <select className="filter-select" style={{width:'100%'}} value={dashPrefs.dateRange} onChange={e => setDashPrefs({...dashPrefs, dateRange: e.target.value})}>
              <option>Last 30 Days</option><option>Last 90 Days</option><option>This Year</option><option>All Time</option>
            </select>
          </div>
          <div className="settings-field"><label>Default Chart Type</label>
            <select className="filter-select" style={{width:'100%'}} value={dashPrefs.chartType} onChange={e => setDashPrefs({...dashPrefs, chartType: e.target.value})}>
              <option>Bar Chart</option><option>Line Chart</option><option>Pie Chart</option>
            </select>
          </div>
          <div className="settings-field"><label>Rows per Page</label>
            <select className="filter-select" style={{width:'100%'}} value={dashPrefs.rows} onChange={e => setDashPrefs({...dashPrefs, rows: e.target.value})}>
              <option>8</option><option>16</option><option>32</option>
            </select>
          </div>
          <div className="settings-field"><label>Auto-Refresh Interval</label>
            <select className="filter-select" style={{width:'100%'}} value={dashPrefs.refresh} onChange={e => setDashPrefs({...dashPrefs, refresh: e.target.value})}>
              <option>30 seconds</option><option>1 minute</option><option>5 minutes</option><option>Off</option>
            </select>
          </div>
        </div>

        {/* Security */}
        <div className="settings-card">
          <h3 className="settings-section">🔒 Security</h3>
          <div className="settings-field"><label>Current Password</label>
            <input type="password" placeholder="••••••••" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
          </div>
          <div className="settings-field"><label>New Password</label>
            <input type="password" placeholder="••••••••" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
          </div>
          <div className="settings-field"><label>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
          </div>
          <div className="settings-info-row">🛡 Two-Factor Authentication: <span style={{color:'#10b981'}}>Enabled</span></div>
          <div className="settings-info-row">📅 Last login: Today</div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: 20 }}>
        <button className="btn btn-primary" onClick={save} style={{ padding: '10px 28px' }}>
          {saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>
    </div>
  );
}
