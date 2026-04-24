import { useState, useEffect, useMemo, useCallback, Component } from 'react';
import { ThemeProvider } from './theme.jsx';
import { Sidebar } from './components/Sidebar';
import { SummaryCard } from './components/Cards';
import { DataTable } from './components/DataTable';
import { StatusBarChart, ActivityLineChart, StatusPieChart, CategoryBarChart } from './components/Charts';
import { LoginPage } from './pages/LoginPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TasksPage } from './pages/TasksPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { fetchDashboardData } from './mockData';
import { STATUSES, CATEGORIES } from './constants.js';
import api from './api.js';

import { DashboardBuilder } from './components/dashboard/DashboardBuilder.jsx';
import { MappingModal } from './components/dashboard/MappingModal.jsx';
import './components/dashboard/dashboard.css';

// ─── Global Error Boundary ──────────────────────────────────────────────────
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) {
    console.error("Global crash caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', color: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ color: '#ef4444', marginBottom: '20px', fontSize: '2.5rem' }}>Something went wrong.</h1>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '20px', borderRadius: '12px', maxWidth: '600px', marginBottom: '30px' }}>
            <p style={{ fontFamily: 'monospace', color: '#fca5a5' }}>{this.state.error?.message || 'Unknown Runtime Error'}</p>
          </div>
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
            🔄 Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Overview of all metrics' },
  analytics:  { title: 'Analytics',  sub: 'Deep dive into performance data' },
  tasks:      { title: 'Tasks',      sub: 'Manage and track all tasks' },
  reports:    { title: 'Reports',    sub: 'Export and review summaries' },
  settings:   { title: 'Settings',   sub: 'Account and app preferences' },
  help:       { title: 'Help',       sub: 'Support and documentation' },
};

function DashboardHome({ data, dashPrefs }) {
  const [filters, setFilters] = useState({ status: 'All', category: 'All', search: '' });

  const filtered = useMemo(() => (data || []).filter(d => {
    if (filters.status !== 'All' && d.status !== filters.status) return false;
    if (filters.category !== 'All' && d.category !== filters.category) return false;
    if (filters.search && !(d.name || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }), [data, filters]);

  const stats = useMemo(() => ({
    total: filtered.length,
    completed: filtered.filter(d => d.status === 'Completed').length,
    inprogress: filtered.filter(d => d.status === 'In Progress').length,
    pending: filtered.filter(d => d.status === 'Pending').length,
  }), [filtered]);

  const allCharts = [
    { type: 'Bar Chart', component: <StatusBarChart key="bar" data={filtered} /> },
    { type: 'Line Chart', component: <ActivityLineChart key="line" data={filtered} /> },
    { type: 'Pie Chart', component: <StatusPieChart key="pie" data={filtered} /> },
    { type: 'Category Bar', component: <CategoryBarChart key="cat" data={filtered} /> }
  ];

  const sortedCharts = [...allCharts].sort((a, b) => a.type === dashPrefs?.chartType ? -1 : b.type === dashPrefs?.chartType ? 1 : 0);

  return (
    <>
      <div className="cards-grid">
        <SummaryCard label="Total Tasks"  value={stats.total}      icon="📦" accentColor="#6366f1" iconBg="rgba(99,102,241,0.15)"  trend={8}  trendLabel="vs last month"/>
        <SummaryCard label="Completed"    value={stats.completed}  icon="✅" accentColor="#10b981" iconBg="rgba(16,185,129,0.15)"  trend={12} trendLabel="vs last month"/>
        <SummaryCard label="In Progress"  value={stats.inprogress} icon="🔄" accentColor="#3b82f6" iconBg="rgba(59,130,246,0.15)"  trend={-3} trendLabel="vs last month"/>
        <SummaryCard label="Pending"      value={stats.pending}    icon="⏳" accentColor="#f59e0b" iconBg="rgba(245,158,11,0.15)"  trend={5}  trendLabel="vs last month"/>
      </div>

      <div className="filters-bar">
        <span className="filter-label">Filter:</span>
        <input className="filter-input" type="text" placeholder="🔍  Search tasks…"
          value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <select className="filter-select" value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="filter-chips">
          {STATUSES.slice(1).map(s => (
            <button key={s} className={`chip ${filters.status===s?'active':''}`}
              onClick={() => setFilters(f => ({ ...f, status: f.status===s?'All':s }))}>{s}</button>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        {sortedCharts.map(c => c.component)}
      </div>

      <DataTable data={filtered} rowsPerPage={parseInt(dashPrefs?.rows || '16')} />
    </>
  );
}

function NewDatasourceModal({ onClose, onTest }) {
  const [formData, setFormData] = useState({
    dbType: 'PostgreSQL',
    name: '',
    url: '',
    username: '',
    password: ''
  });
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      let dbUrl = formData.url;
      if (dbUrl.startsWith('postgresql://')) {
        const withoutProto = dbUrl.replace('postgresql://', '');
        const atIndex = withoutProto.lastIndexOf('@');
        const hostPortDb = atIndex !== -1 ? withoutProto.substring(atIndex + 1) : withoutProto;
        dbUrl = 'jdbc:postgresql://' + hostPortDb;
      } else if (!dbUrl.startsWith('jdbc:')) {
        dbUrl = 'jdbc:' + formData.dbType.toLowerCase() + '://' + dbUrl;
      }

      const res = await api.post('/api/datasource/test', {
        url: dbUrl,
        username: formData.username,
        password: formData.password
      });
      if (res.data.success) {
        alert(`✅ Connection successful!\nLoaded ${res.data.data?.length || 0} records.`);
        onTest(res.data.data, formData.name, {
          url: dbUrl,
          username: formData.username,
          password: formData.password
        });
        onClose();
      } else {
        alert('❌ Connection failed: ' + res.data.message);
      }
    } catch {
      alert('❌ Error connecting to server');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">New Datasource</div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Database Type</label>
            <select value={formData.dbType} onChange={e => setFormData({...formData, dbType: e.target.value})}>
              <option>PostgreSQL</option>
              <option>MS-SQL</option>
              <option>Oracle</option>
            </select>
          </div>
          <div className="modal-field">
            <label>Datasource Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sales DB" />
          </div>
          <div className="modal-field">
            <label>Connection String (or IP/Host)</label>
            <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="localhost:5432/mydb" />
          </div>
          <div className="modal-field">
            <label>Username</label>
            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="modal-field">
            <label>Password</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>✖ Cancel</button>
          <button className="modal-btn-test" onClick={handleTest} disabled={testing}>{testing ? 'Testing...' : 'Test Connection'}</button>
        </div>
      </div>
    </div>
  );
}

function ImportDashboardModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);

  const handleImport = () => {
    if (!file) { alert("Please select a JSON file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        onImport(json);
        onClose();
      } catch { alert("Invalid JSON file."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '500px' }}>
        <div className="modal-header">Import Dashboard</div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Select JSON File</label>
            <input type="file" accept=".json" onChange={e => setFile(e.target.files[0])} style={{ padding: '8px' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>✖ Close</button>
          <button className="btn-primary" onClick={handleImport} style={{ padding: '8px 16px', borderRadius: '6px' }}>📥 Import</button>
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dp_user')); } catch { return null; }
  });
  
  const prefs = user?.preferences ? JSON.parse(user.preferences) : {};
  const dashPrefs = prefs.dashPrefs || { dateRange: 'Last 30 Days', chartType: 'Bar Chart', rows: '16', refresh: '5 minutes' };

  const [activeNav, setActiveNav] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return ['dashboard','analytics','tasks','reports','settings','help'].includes(hash) ? hash : 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (['dashboard','analytics','tasks','reports','settings','help'].includes(hash)) {
        setActiveNav(hash);
      } else if (!hash) {
        setActiveNav('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNav = (nav) => {
    window.location.hash = `/${nav}`;
    setActiveNav(nav);
  };

  const [importedData,  setImportedData]  = useState(null);
  const [importSource,  setImportSource]  = useState('');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [collapsed, setCollapsed] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDSModal, setShowDSModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(null);

  const [widgets, setWidgets] = useState([]);
  const [dsConfig, setDsConfig] = useState(null);
  const [builderSourceType, setBuilderSourceType] = useState(null);
  const [rowLimit, setRowLimit] = useState(100);

  const handleAddWidget = useCallback((type) => {
    const newId = Date.now().toString();
    const newWidget = { id: newId, type, table: '', mapping: null, width: 'half' };
    setWidgets(prev => [...(prev || []), newWidget]);
  }, []);

  const handleRemoveWidget = (id) => {
    setWidgets(prev => (prev || []).filter(w => w.id !== id));
  };

  const handleUpdateWidget = (id, config) => {
    setWidgets(prev => (prev || []).map(w => w.id === id ? { ...w, ...config } : w));
    setShowMappingModal(null);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const data = await fetchDashboardData();
      setRawData(data || []);
      setLastUpdated(new Date());
    } catch {
      setApiError('Failed to load dashboard data. Please refresh.');
    } finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const handleLogin = (u) => {
    if (u.token) localStorage.setItem('dp_token', u.token);
    const { token: _token, ...userWithoutToken } = u;
    sessionStorage.setItem('dp_user', JSON.stringify(userWithoutToken));
    setUser(userWithoutToken);
    window.location.hash = '#/dashboard';
  };
  const handleLogout = () => {
    localStorage.removeItem('dp_token');
    sessionStorage.removeItem('dp_user');
    setUser(null);
    setActiveNav('dashboard');
    window.history.replaceState(null, '', window.location.pathname);
  };
  const handleUpdateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    sessionStorage.setItem('dp_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleImportData = (jsonData, sourceName = 'JSON File') => {
    if (Array.isArray(jsonData)) {
      setImportedData(jsonData);
      setImportSource(sourceName);
      setBuilderSourceType('json');
      setLastUpdated(new Date());
    } else {
      alert('❌ Invalid JSON format.');
    }
  };

  const handleResetImport = () => {
    setImportedData(null);
    setImportSource('');
    setBuilderSourceType(null);
    setWidgets([]);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const { title, sub } = PAGE_TITLES[activeNav] || PAGE_TITLES.dashboard;

  return (
    <div className={`app-layout ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar active={activeNav} onNav={handleNav} user={user} onLogout={handleLogout} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-ghost" onClick={() => setCollapsed(!collapsed)} style={{ padding: '8px', border: 'none', background: 'transparent' }} title="Toggle Sidebar">
              <span style={{ fontSize: 18 }}>☰</span>
            </button>
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" style={{ marginLeft: '4px', marginRight: '8px' }}>
              <rect width="44" height="44" rx="12" fill="url(#topl)"/>
              <path d="M8 30 L15 18 L22 25 L29 13 L36 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><linearGradient id="topl" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/><stop offset="1" stopColor="#a78bfa"/>
              </linearGradient></defs>
            </svg>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="live-dot" />{title}</h1>
              <p>{lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : sub}</p>
            </div>
          </div>
          <div className="topbar-actions" style={{ position: 'relative' }}>
            {['dashboard','analytics','tasks','reports'].includes(activeNav) && (
              <>
                <button className="btn btn-primary" onClick={() => setShowMenu(!showMenu)}>+ New Dashboard</button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => { setShowMenu(false); setShowImportModal(true); }}>📥 Import Dashboard</button>
                    <button className="dropdown-item" onClick={() => { setShowMenu(false); setShowDSModal(true); }}>🔗 New Datasource</button>
                  </div>
                )}
                <button className="btn btn-ghost" onClick={loadData} disabled={loading}>{loading ? '⟳ …' : '⟳ Refresh'}</button>
              </>
            )}
          </div>
        </header>

        {showDSModal && <NewDatasourceModal onClose={() => setShowDSModal(false)} onTest={(fetchedData, dsName, config) => {
           setImportedData(fetchedData);
           setImportSource(dsName || 'Database Connection');
           setDsConfig(config);
           setBuilderSourceType('db');
           setLastUpdated(new Date());
        }} />}
        {showImportModal && <ImportDashboardModal onClose={() => setShowImportModal(false)} onImport={(data, name) => handleImportData(data, name)} />}

        {showMappingModal && (
          <MappingModal 
            key={showMappingModal}
            widget={widgets.find(w => w.id === showMappingModal)}
            dsConfig={dsConfig}
            sourceType={builderSourceType}
            localData={importedData}
            onClose={() => setShowMappingModal(null)}
            onSave={(config) => handleUpdateWidget(showMappingModal, config)}
          />
        )}

        {apiError && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', padding: '10px 20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠ {apiError}</span>
            <button onClick={() => setApiError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <main className="page-content">
          <GlobalErrorBoundary>
            {loading && ['dashboard','analytics','tasks','reports'].includes(activeNav) ? (
              <div className="loading-overlay">
                <div className="spinner" />
                <p className="loading-text">Loading data…</p>
              </div>
            ) : (
              <>
                {activeNav === 'dashboard' && (
                  builderSourceType 
                    ? <DashboardBuilder 
                        data={(importedData || rawData || []).slice(0, rowLimit || undefined)}
                        widgets={widgets}
                        onDrop={handleAddWidget}
                        onRemove={handleRemoveWidget}
                        onConfigure={setShowMappingModal}
                        onUpdateWidget={handleUpdateWidget}
                        dsConfig={dsConfig}
                        sourceType={builderSourceType}
                        sourceName={importSource}
                        onReset={handleResetImport}
                        rowLimit={rowLimit}
                        onLimitChange={setRowLimit}
                      />
                    : <DashboardHome data={importedData || rawData} dashPrefs={dashPrefs} />
                )}
                {activeNav === 'analytics' && <AnalyticsPage data={importedData || rawData} />}
                {activeNav === 'tasks'     && <TasksPage     data={importedData || rawData} />}
                {activeNav === 'reports'   && <ReportsPage   data={importedData || rawData} />}
                {activeNav === 'settings'  && <SettingsPage user={user} onUpdateUser={handleUpdateUser} />}
                {activeNav === 'help'      && <HelpPage />}
              </>
            )}
          </GlobalErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
