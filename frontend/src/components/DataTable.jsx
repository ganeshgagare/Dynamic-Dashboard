import { useState, useMemo } from 'react';
import { StatusBadge } from './Cards';

export function DataTable({ data, rowsPerPage }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'id', dir: 1 });

  const pageSize = rowsPerPage || 8;

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av < bv) return -sort.dir;
      if (av > bv) return sort.dir;
      return 0;
    });
  }, [data, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSort(key) {
    setSort(s => ({ key, dir: s.key === key ? -s.dir : 1 }));
    setPage(1);
  }

  const arrow = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  return (
    <div className="table-card">
      <div className="table-header">
        <span className="table-title">📋 Task Records</span>
        <span className="table-count">{data.length} records</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['id','name','status','date','category','value'].map(col => (
                <th key={col} className="sortable" onClick={() => handleSort(col)}>
                  {col.charAt(0).toUpperCase() + col.slice(1)}{arrow(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id || i}>
                <td className="td-id">#{String(row.id || i).padStart(3,'0')}</td>
                <td className="td-name">{row.name || 'Unnamed'}</td>
                <td><StatusBadge status={row.status || 'Pending'} /></td>
                <td>{row.date || 'N/A'}</td>
                <td>{row.category || 'N/A'}</td>
                <td className="td-value">{row.value != null ? Number(row.value).toLocaleString() : '0'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:'32px', color:'var(--text-muted)' }}>No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span className="pagination-info">
          Showing {Math.min((currentPage-1)*pageSize+1, data.length)}–{Math.min(currentPage*pageSize, data.length)} of {data.length}
        </span>
        <div className="pagination-btns">
          <button className="page-btn" disabled={currentPage===1} onClick={() => setPage(p=>p-1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
            return p <= totalPages ? (
              <button key={p} className={`page-btn ${p === currentPage ? 'active':''}`} onClick={() => setPage(p)}>{p}</button>
            ) : null;
          })}
          <button className="page-btn" disabled={currentPage===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
        </div>
      </div>
    </div>
  );
}
