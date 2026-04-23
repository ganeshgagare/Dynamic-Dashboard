import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { STATUSES, CATEGORIES } from '../constants.js';

export function TasksPage({ data }) {
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = data.filter(d => {
    if (status !== 'All' && d.status !== status) return false;
    if (category !== 'All' && d.category !== category) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">📋 Tasks</h2>
        <p className="page-sub">Manage and track all your tasks in one place</p>
      </div>

      <div className="filters-bar" style={{ marginBottom: 20 }}>
        <span className="filter-label">Filter:</span>
        <input className="filter-input" placeholder="🔍  Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="filter-chips">
          {STATUSES.slice(1).map(s => (
            <button key={s} className={`chip ${status===s?'active':''}`}
              onClick={() => setStatus(p => p===s?'All':s)}>{s}</button>
          ))}
        </div>
      </div>
      <DataTable data={filtered} />
    </div>
  );
}
