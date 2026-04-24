import React, { useState, useEffect } from 'react';
import api from '../../api.js';
import { StatusBarChart, ActivityLineChart, StatusPieChart, CategoryBarChart, ChartErrorBoundary } from '../Charts.jsx';

export function DynamicWidget({ widget, onRemove, onConfigure, dsConfig, sourceType, localData, onUpdate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (widget.table && widget.mapping) {
      if (sourceType === 'json') {
        applyLocalMapping();
      } else if (dsConfig) {
        fetchData();
      }
    }
  }, [widget.table, widget.mapping, dsConfig, sourceType, localData]);

  const applyLocalMapping = () => {
    if (!localData) return;
    const mapped = localData.map(item => ({
      name:     item[widget.mapping.name],
      status:   item[widget.mapping.status],
      category: item[widget.mapping.category],
      value:    Number(item[widget.mapping.value] || 0)
    }));
    setData(mapped);
  };

  const fetchData = async () => {
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
  };

  const renderChart = () => {
    if (!widget.table || !widget.mapping) {
      return (
        <div className="widget-setup-hint">
          <div className="hint-icon">⚙️</div>
          <h3>Chart Not Configured</h3>
          <p>Connect your data columns to start visualizing</p>
          <button className="btn-setup" onClick={onConfigure}>
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
    const newWidth = widget.width === 'half' ? 'full' : 'half';
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
          <button className="action-btn remove" onClick={onRemove} title="Remove">✕</button>
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
