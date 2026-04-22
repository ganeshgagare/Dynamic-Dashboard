// StatusBadge
export function StatusBadge({ status }) {
  const map = {
    'Completed':   'badge-completed',
    'Pending':     'badge-pending',
    'In Progress': 'badge-inprogress',
  };
  return (
    <span className={`badge ${map[status] || ''}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

// SummaryCard — compact horizontal layout
export function SummaryCard({ label, value, icon, accentColor, iconBg, trend, trendLabel }) {
  return (
    <div className="summary-card" style={{ '--card-accent': accentColor, '--card-icon-bg': iconBg }}>
      <div className="summary-card-left">
        <div className="card-icon">{icon}</div>
      </div>
      <div className="summary-card-right">
        <span className="card-label">{label}</span>
        <div className="card-value">{value}</div>
        {trend !== undefined && (
          <div className="card-footer">
            <span className={`card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="card-trend-label">{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="card-accent-bar" />
    </div>
  );
}
