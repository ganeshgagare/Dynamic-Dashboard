import { useMemo } from 'react';
import { StatusBarChart, ActivityLineChart, StatusPieChart, CategoryBarChart } from '../components/Charts';

export function AnalyticsPage({ data }) {
  const stats = useMemo(() => {
    const byCategory = {};
    data.forEach(d => {
      if (!byCategory[d.category]) byCategory[d.category] = { total: 0, completed: 0 };
      byCategory[d.category].total++;
      if (d.status === 'Completed') byCategory[d.category].completed++;
    });
    return byCategory;
  }, [data]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">📊 Analytics</h2>
        <p className="page-sub">Deep dive into your task performance metrics</p>
      </div>

      <div className="analytics-grid">
        {Object.entries(stats).map(([cat, s]) => (
          <div key={cat} className="analytics-card">
            <div className="analytics-cat">{cat}</div>
            <div className="analytics-rate">{Math.round(s.completed / s.total * 100)}%</div>
            <div className="analytics-bar-bg">
              <div className="analytics-bar-fill" style={{ width: `${s.completed/s.total*100}%` }} />
            </div>
            <div className="analytics-meta">{s.completed}/{s.total} completed</div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ marginTop: 24 }}>
        <StatusBarChart data={data} />
        <StatusPieChart data={data} />
        <ActivityLineChart data={data} />
        <CategoryBarChart data={data} />
      </div>
    </div>
  );
}
