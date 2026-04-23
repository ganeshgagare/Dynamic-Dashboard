import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = { Completed: '#10b981', Pending: '#f59e0b', 'In Progress': '#3b82f6' };
const CAT_COLORS = ['#6366f1','#a78bfa','#ec4899','#f59e0b','#10b981','#3b82f6'];

const tooltipStyle = {
  backgroundColor: '#1a2035',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#e8eaf0',
  fontSize: '12px',
};

export function StatusBarChart({ data }) {
  const chartData = useMemo(() => {
    const counts = {};
    data.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [data]);

  return (
    <div className="chart-card">
      <div className="chart-title">📊 Status Distribution</div>
      <div className="chart-subtitle">Count of tasks by status</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="status" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={tooltipStyle} 
            itemStyle={{ color: '#e8eaf0' }}
            labelStyle={{ color: '#e8eaf0', fontWeight: 'bold', marginBottom: '4px' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }} 
          />
          <Bar dataKey="count" radius={[6,6,0,0]}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityLineChart({ data }) {
  const chartData = useMemo(() => {
    const byDate = {};
    data.forEach(d => {
      const month = format(parseISO(d.date), 'MMM yy');
      byDate[month] = (byDate[month] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort((a, b) => new Date('01 ' + a[0]) - new Date('01 ' + b[0]))
      .slice(-10)
      .map(([month, count]) => ({ month, count }));
  }, [data]);

  return (
    <div className="chart-card">
      <div className="chart-title">📈 Activity Over Time</div>
      <div className="chart-subtitle">Monthly task volume trend</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={tooltipStyle} 
            itemStyle={{ color: '#e8eaf0' }}
            labelStyle={{ color: '#e8eaf0', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Line
            type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#818cf8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({ data }) {
  const chartData = useMemo(() => {
    const counts = {};
    data.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
    const RADIAN = Math.PI / 180;
    // Add a fixed 12px offset outside the pie to avoid dynamic scaling issues
    const radius = outerRadius + 14; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#8892a4" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
        {`${name} ${Math.round(value / total * 100)}%`}
      </text>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-title">🥧 Status Share</div>
      <div className="chart-subtitle">Proportional distribution</div>
      <div style={{ width: '100%', height: 230 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData} cx="50%" cy="45%"
              innerRadius={50} outerRadius={75}
              dataKey="value" paddingAngle={3}
              labelLine={false}
              label={renderLabel}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={tooltipStyle} 
              itemStyle={{ color: '#e8eaf0' }}
              labelStyle={{ color: '#e8eaf0', fontWeight: 'bold', marginBottom: '4px' }}
              formatter={(v) => [`${v} tasks`]} 
            />
            <Legend wrapperStyle={{ color: '#8892a4', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryBarChart({ data }) {
  const chartData = useMemo(() => {
    const bycat = {};
    data.forEach(d => {
      if (!bycat[d.category]) bycat[d.category] = { category: d.category, totalValue: 0, count: 0 };
      bycat[d.category].totalValue += d.value;
      bycat[d.category].count += 1;
    });
    return Object.values(bycat).sort((a, b) => b.totalValue - a.totalValue);
  }, [data]);

  return (
    <div className="chart-card chart-full">
      <div className="chart-title">📦 Category Performance</div>
      <div className="chart-subtitle">Total value and task count per category</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="category" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={tooltipStyle} 
            itemStyle={{ color: '#e8eaf0' }}
            labelStyle={{ color: '#e8eaf0', fontWeight: 'bold', marginBottom: '4px' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }} 
          />
          <Legend wrapperStyle={{ color: '#8892a4', fontSize: '12px' }} />
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d946ef" stopOpacity={1}/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <Bar yAxisId="left" dataKey="totalValue" name="Total Value" fill="url(#colorTotal)" radius={[6,6,0,0]} />
          <Bar yAxisId="right" dataKey="count" name="Count" fill="url(#colorCount)" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
