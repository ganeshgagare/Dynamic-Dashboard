import { useMemo } from 'react';

export function ReportsPage({ data }) {
  const summary = useMemo(() => {
    const byStatus = {}, byCat = {};
    data.forEach(d => {
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
      if (!byCat[d.category]) byCat[d.category] = { count: 0, value: 0 };
      byCat[d.category].count++;
      byCat[d.category].value += d.value;
    });
    return { byStatus, byCat, total: data.length, totalValue: data.reduce((s, d) => s + d.value, 0) };
  }, [data]);

  const handleExport = () => {
    const headers = 'ID,Name,Status,Date,Category,Value';
    const rows = data.map(d => `${d.id},"${String(d.name).replace(/"/g, '""')}",${d.status},${d.date},${d.category},${d.value}`);
    const csv = '\uFEFF' + [headers, ...rows].join('\n'); // Add BOM for proper Excel rendering
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dashboard-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">📄 Reports</h2>
          <p className="page-sub">Summary reports and export options</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>⬇ Export CSV</button>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <h3 className="report-section-title">Status Breakdown</h3>
          {Object.entries(summary.byStatus).map(([s, c]) => (
            <div key={s} className="report-row">
              <span className={`badge badge-${s.toLowerCase().replace(' ','')} ${s==='In Progress'?'badge-inprogress':''}`}>
                <span className="badge-dot"/>{s}
              </span>
              <div className="report-bar-wrap">
                <div className="report-bar" style={{ width: `${c/summary.total*100}%`,
                  background: s==='Completed'?'#10b981':s==='Pending'?'#f59e0b':'#3b82f6' }} />
              </div>
              <span className="report-count">{c} <small>({Math.round(c/summary.total*100)}%)</small></span>
            </div>
          ))}
        </div>

        <div className="report-section">
          <h3 className="report-section-title">Category Summary</h3>
          {Object.entries(summary.byCat).map(([cat, s]) => (
            <div key={cat} className="report-row">
              <span className="report-cat-label">{cat}</span>
              <div className="report-bar-wrap">
                <div className="report-bar" style={{ width: `${s.value/summary.totalValue*100}%`, background: '#6366f1' }} />
              </div>
              <span className="report-count">{s.count} tasks · <small style={{color:'#818cf8'}}>{s.value.toLocaleString()} val</small></span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-totals">
        <div className="report-total-card"><div className="rtc-label">Total Tasks</div><div className="rtc-val">{summary.total}</div></div>
        <div className="report-total-card"><div className="rtc-label">Total Value</div><div className="rtc-val">{summary.totalValue.toLocaleString()}</div></div>
        <div className="report-total-card"><div className="rtc-label">Completion Rate</div>
          <div className="rtc-val">{Math.round((summary.byStatus['Completed']||0)/summary.total*100)}%</div>
        </div>
        <div className="report-total-card"><div className="rtc-label">Avg Value</div>
          <div className="rtc-val">{Math.round(summary.totalValue/summary.total).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
