import { useState, useEffect, useCallback } from 'react';
import api from '../../api.js';
import { StatusBarChart, ActivityLineChart, StatusPieChart, CategoryBarChart, ChartErrorBoundary } from '../Charts.jsx';

export function DynamicWidget({ widget, onRemove, onConfigure, dsConfig, sourceType, localData, onUpdate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyLocalMapping = useCallback(() => {
    if (!localData || !widget.mapping) return;
    const mapped = localData.map(item => ({
      name:     item[widget.mapping.name],
      status:   item[widget.mapping.status],
      category: item[widget.mapping.category],
      value:    Number(item[widget.mapping.value] || 0)
    }));
    setData(mapped);
  }, [localData, widget.mapping]);

  const fetchData = useCallback(async () => {
    if (!widget.table || !widget.mapping) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/datasource/query', {
        ...dsConfig,
        table: widget.table,
        mapping: widget.mapping
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dsConfig, widget.table, widget.mapping]);

  useEffect(() => {
    if (widget.table && widget.mapping) {
      if (sourceType === 'json') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        applyLocalMapping();
      } else if (dsConfig) {
        fetchData();
      }
    }
  }, [widget.table, widget.mapping, dsConfig, sourceType, applyLocalMapping, fetchData]);

  const renderChart = () => {
    if (!widget.table || !widget.mapping) {
      return (
        <div className="widget-setup-hint">
          <div className="hint-icon">⚙️</div>
          <h3>Chart Not Configured</h3>
          <p>Connect your data columns to start visualizing</p>
          <button className="btn-setup" onClick={(e) => { e.stopPropagation(); onConfigure(); }}>
            <span>⚙️</span> Configure Chart
          </button>
        </div>
      );
    }

    if (loading) return <div className="widget-loading"><span className="auth-spinner"/></div>;
    if (error) return <div className="widget-error">{error}</div>;
    if (data.length === 0) return <div className="widget-empty">No data returned</div>;

    switch (widget.type) {
      case 'Bar Chart':    return <StatusBarChart data={data} />;
      case 'Line Chart':   return <ActivityLineChart data={data} />;
      case 'Pie Chart':    return <StatusPieChart data={data} />;
      case 'Category Bar': return <CategoryBarChart data={data} />;
      default: return null;
    }
  };

  const toggleWidth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newWidth = widget.width === 'full' ? 'half' : 'full';
    onUpdate({ width: newWidth });
  };

  return (
    <div className={`dynamic-widget ${widget.width || 'half'}`}>
      <div className="widget-header">
        <span className="widget-title">{widget.type}</span>
        <div className="widget-actions">
          <button 
            className="action-btn width-toggle" 
            onClick={(e) => toggleWidth(e)} 
            title={widget.width === 'full' ? "Shrink" : "Expand"}
          >
            {widget.width === 'full' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
              </svg>
            )}
          </button>
          <button className="action-btn config" onClick={(e) => { e.stopPropagation(); onConfigure(); }} title="Configure">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
          <button className="action-btn remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove">✕</button>
        </div>
      </div>
      <div className="widget-body">
        <ChartErrorBoundary key={JSON.stringify(widget.mapping)}>
          {renderChart()}
        </ChartErrorBoundary>
      </div>
    </div>
  );
}
