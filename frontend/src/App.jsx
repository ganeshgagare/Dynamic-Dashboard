import { useState, useEffect, useMemo, useCallback } from 'react';
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
import API_BASE from './config.js';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Overview of all metrics' },
  analytics:  { title: 'Analytics',  sub: 'Deep dive into performance data' },
  tasks:      { title: 'Tasks',      sub: 'Manage and track all tasks' },
  reports:    { title: 'Reports',    sub: 'Export and review summaries' },
  settings:   { title: 'Settings',   sub: 'Account and app preferences' },
  help:       { title: 'Help',       sub: 'Support and documentation' },
};

function DashboardHome({ data, onRefresh, loading, dashPrefs }) {
  const [filters, setFilters] = useState({ status: 'All', category: 'All', search: '' });
  const STATUSES = ['All', 'Completed', 'Pending', 'In Progress'];
  const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'QA', 'DevOps', 'Analytics'];

  const filtered = useMemo(() => data.filter(d => {
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

// ─── Chart definitions for the picker ───────────────────────────────────────
const ALL_CHART_DEFS = [
  { id: 'bar',     label: 'Status Bar',     icon: '📊', desc: 'Compare task statuses side by side' },
  { id: 'line',    label: 'Activity Line',  icon: '📈', desc: 'Track task volume trends over time' },
  { id: 'pie',     label: 'Status Pie',     icon: '🥧', desc: 'Proportional share per status' },
  { id: 'catbar',  label: 'Category Bar',   icon: '📦', desc: 'Performance breakdown by category' },
];

// ─── Custom Dashboard ────────────────────────────────────────────────────────
function CustomDashboard({ data, sourceName, onReset }) {
  const [filters, setFilters]         = useState({ status: 'All', category: 'All', search: '' });
  const [selectedCharts, setSelected] = useState(['bar', 'pie']);
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [layout, setLayout]           = useState('grid');


  // Dynamically derive filter options from actual imported data
  const statuses   = useMemo(() => ['All', ...new Set(data.map(d => d.status).filter(Boolean))],   [data]);
  const categories = useMemo(() => ['All', ...new Set(data.map(d => d.category).filter(Boolean))], [data]);

  const filtered = useMemo(() => data.filter(d => {
    if (filters.status   !== 'All' && d.status   !== filters.status)   return false;
    if (filters.category !== 'All' && d.category !== filters.category) return false;
    if (filters.search && !(d.name || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }), [data, filters]);

  const toggleChart = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
  );

  const chartMap = {
    bar:    <StatusBarChart    key="bar"  data={filtered} />,
    line:   <ActivityLineChart key="line" data={filtered} />,
    pie:    <StatusPieChart    key="pie"  data={filtered} />,
    catbar: <CategoryBarChart  key="cat"  data={filtered} />,
  };

  return (
    <>
      {/* ── Source Info Banner ── */}
      <div className="custom-db-banner">
        <div className="custom-db-banner-left">
          <div className="custom-db-source-badge">
            <span className="custom-db-source-dot" />
            Live Data
          </div>
          <span className="custom-db-source-name">
            Source: <strong>{sourceName || 'Imported Dataset'}</strong>
          </span>
          <span className="custom-db-record-count">{data.length} records · {filtered.length} shown</span>
        </div>
        <div className="custom-db-banner-right">
          {/* Layout switcher */}
          <div className="custom-db-layout-toggle">
            <button className={layout === 'grid'  ? 'active' : ''} onClick={() => setLayout('grid')}  title="Grid layout">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            </button>
            <button className={layout === 'stack' ? 'active' : ''} onClick={() => setLayout('stack')} title="Full-width">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="5" rx="1"/></svg>
            </button>
          </div>
          {/* Chart picker toggle */}
          <button className="btn btn-ghost custom-db-picker-btn" onClick={() => setPickerOpen(p => !p)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Charts ({selectedCharts.length} / {ALL_CHART_DEFS.length})
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points={pickerOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
            </svg>
          </button>
          <button className="btn custom-db-reset-btn" onClick={onReset}>
            ✕ Reset
          </button>
        </div>
      </div>

      {/* ── Chart Picker Panel ── */}
      {pickerOpen && (
        <div className="chart-picker-panel">
          <div className="chart-picker-header">
            <span className="chart-picker-title">Choose which charts to display</span>
            <span className="chart-picker-hint">Click to toggle · changes reflect instantly</span>
          </div>
          <div className="chart-picker-grid">
            {ALL_CHART_DEFS.map(chart => (
              <button
                key={chart.id}
                className={`chart-picker-card ${selectedCharts.includes(chart.id) ? 'selected' : ''}`}
                onClick={() => toggleChart(chart.id)}
              >
                <div className="chart-picker-check">
                  {selectedCharts.includes(chart.id) && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span className="chart-picker-icon">{chart.icon}</span>
                <div className="chart-picker-info">
                  <div className="chart-picker-label">{chart.label}</div>
                  <div className="chart-picker-desc">{chart.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {selectedCharts.length === 0 && (
            <div className="chart-picker-warning">⚠️ Pick at least one chart to see visualizations</div>
          )}
        </div>
      )}

      {/* ── Filters (same as default dashboard) ── */}
      <div className="filters-bar">
        <span className="filter-label">Filter:</span>
        <input className="filter-input" type="text" placeholder="🔍  Search…"
          value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <select className="filter-select" value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="filter-chips">
          {statuses.slice(1).map(s => (
            <button key={s} className={`chip ${filters.status === s ? 'active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, status: f.status === s ? 'All' : s }))}>{s}</button>
          ))}
        </div>
      </div>

      {/* ── Selected Charts Only ── */}
      {selectedCharts.length > 0 ? (
        <div className={layout === 'grid' ? 'charts-grid' : 'charts-stack'}>
          {selectedCharts.map(id => (
            <div key={id} className={layout === 'stack' ? 'chart-full' : ''}>
              {chartMap[id]}
            </div>
          ))}
        </div>
      ) : (
        <div className="custom-db-empty-charts">
          <div className="custom-db-empty-icon">📊</div>
          <div className="custom-db-empty-text">No charts selected</div>
          <div className="custom-db-empty-sub">Open "Charts (0/4)" above and pick which charts you want</div>
        </div>
      )}

      {/* ── Data Table ── */}
      <DataTable data={filtered} rowsPerPage={16} />
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
      // If it's a standard connection URI, convert it to JDBC format
      if (dbUrl.startsWith('postgresql://')) {
        // Strip out the username/password part if present
        // Format: postgresql://[user[:password]@]host[:port][/dbname]
        const withoutProto = dbUrl.replace('postgresql://', '');
        const atIndex = withoutProto.lastIndexOf('@');
        const hostPortDb = atIndex !== -1 ? withoutProto.substring(atIndex + 1) : withoutProto;
        dbUrl = 'jdbc:postgresql://' + hostPortDb;
      } else if (!dbUrl.startsWith('jdbc:')) {
        dbUrl = 'jdbc:' + formData.dbType.toLowerCase() + '://' + dbUrl;
      }

      const res = await fetch(`${API_BASE}/api/datasource/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: dbUrl, username: formData.username, password: formData.password })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Connection to ${formData.dbType} successful!\nLoaded ${data.data?.length || 0} records.`);
        if (data.data && data.data.length > 0) {
          onTest(data.data);
        }
        onClose();
      } else {
        alert('❌ Connection failed: ' + data.message);
      }
    } catch (err) {
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
            <label>Database Type<span>*</span></label>
            <select value={formData.dbType} onChange={e => setFormData({...formData, dbType: e.target.value})}>
              <option>PostgreSQL</option>
              <option>MS-SQL</option>
              <option>Oracle</option>
            </select>
          </div>
          <div className="modal-field">
            <label>Datasource Name<span>*</span></label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Datasource Name is mandatory" />
          </div>
          <div className="modal-field">
            <label>Connection String<span>*</span></label>
            <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
          </div>
          <div className="modal-field">
            <label>Username<span>*</span></label>
            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="modal-field">
            <label>Password<span>*</span></label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>✖ Cancel</button>
          <button className="modal-btn-test" onClick={handleTest} disabled={testing}>{testing ? 'Testing...' : 'Test'}</button>
        </div>
      </div>
    </div>
  );
}

function ImportDashboardModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);

  const handleImport = () => {
    if (!file) {
      alert("Please select a JSON file first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        onImport(json);
        onClose();
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '500px' }}>
        <div className="modal-header">Import Dashboard</div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Select JSON File :</label>
            <input type="file" accept=".json" onChange={e => setFile(e.target.files[0])} style={{ padding: '8px' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>✖ Close</button>
          <button className="btn-primary" onClick={handleImport} style={{ padding: '8px 16px', borderRadius: '6px' }}>
            📥 Import
          </button>
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
        // If they press back until the URL has no hash (the main page), route to dashboard
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

  const [importedData,  setImportedData]  = useState(null); // null = use default rawData
  const [importSource,  setImportSource]  = useState('');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [collapsed, setCollapsed] = useState(false);
  
  // New Dashboard state
  const [showMenu, setShowMenu] = useState(false);
  const [showDSModal, setShowDSModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardData();
      setRawData(data);
      setLastUpdated(new Date());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const handleLogin = (u) => {
    sessionStorage.setItem('dp_user', JSON.stringify(u));
    setUser(u);
    window.location.hash = '#/dashboard';
  };
  const handleLogout = () => {
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
      setLastUpdated(new Date());
    } else {
      alert('❌ Invalid JSON format. Expected an array.');
    }
  };

  const handleResetImport = () => {
    setImportedData(null);
    setImportSource('');
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
              <circle cx="36" cy="19" r="3.5" fill="white" opacity="0.9"/>
              <circle cx="8" cy="30" r="2.5" fill="white" opacity="0.6"/>
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
                <button className="btn btn-primary" onClick={() => setShowMenu(!showMenu)}>
                  + New Dashboard
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => { setShowMenu(false); setShowImportModal(true); }}>
                      <span>📥</span> Import Dashboard
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowMenu(false); setShowDSModal(true); }}>
                      <span>🔗</span> New Datasource
                    </button>
                  </div>
                )}
                <button className="btn btn-ghost" onClick={loadData} disabled={loading}>
                  {loading ? '⟳ …' : '⟳ Refresh'}
                </button>
              </>
            )}
          </div>
        </header>

        {showDSModal && <NewDatasourceModal onClose={() => setShowDSModal(false)} onTest={(fetchedData, dsName) => {
           setImportedData(fetchedData);
           setImportSource(dsName || 'Database Connection');
           setLastUpdated(new Date());
        }} />}
        {showImportModal && <ImportDashboardModal onClose={() => setShowImportModal(false)} onImport={(data, name) => handleImportData(data, name)} />}

        <main className="page-content">
          {loading && ['dashboard','analytics','tasks','reports'].includes(activeNav) ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="loading-text">Loading data…</p>
            </div>
          ) : (
            <>
              {activeNav === 'dashboard' && (
                importedData
                  ? <CustomDashboard data={importedData} sourceName={importSource} onReset={handleResetImport} />
                  : <DashboardHome data={rawData} loading={loading} onRefresh={loadData} dashPrefs={dashPrefs} />
              )}
              {activeNav === 'analytics' && <AnalyticsPage data={importedData || rawData} />}
              {activeNav === 'tasks'     && <TasksPage     data={importedData || rawData} />}
              {activeNav === 'reports'   && <ReportsPage   data={importedData || rawData} />}
              {activeNav === 'settings'  && <SettingsPage user={user} onUpdateUser={handleUpdateUser} />}
              {activeNav === 'help'      && <HelpPage />}
            </>
          )}
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
