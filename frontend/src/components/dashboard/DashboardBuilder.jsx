
import { DashboardCanvas } from './DashboardCanvas.jsx';

export function DashboardBuilder({ data, widgets, onDrop, onRemove, onConfigure, onUpdateWidget, dsConfig, sourceType, sourceName, onReset, rowLimit, onLimitChange }) {
  return (
    <div className="dashboard-builder-container">
      {/* ── Source Info Banner ── */}
      <div className="custom-db-banner">
        <div className="custom-db-banner-left">
          <div className="custom-db-source-badge">
            <span className="custom-db-source-dot" />
            Builder Mode
          </div>
          <span className="custom-db-source-name">
            Source: <strong>{sourceName || 'Connected Database'}</strong>
            <span style={{ marginLeft: '12px', opacity: 0.7, fontSize: '11px' }}>
              ({rowLimit ? `Showing ${Math.min(rowLimit, data.length).toLocaleString()} of ` : 'Total: '}
              <strong>{data.length.toLocaleString()}</strong>)
            </span>
          </span>

          <div className="limit-selector-group">
            <span className="limit-label">Rows to Process:</span>
            <select 
              className="limit-select" 
              value={rowLimit || ''} 
              onChange={(e) => onLimitChange(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Rows</option>
              <option value="100">100 Rows</option>
              <option value="500">500 Rows</option>
              <option value="1000">1,000 Rows</option>
              <option value="5000">5,000 Rows</option>
            </select>
          </div>
        </div>
        <div className="custom-db-banner-right">
          <button className="btn custom-db-reset-btn" onClick={onReset}>
            ✕ Close Builder
          </button>
        </div>
      </div>

      {/* ── Data Preview (Structured Table) ── */}
      <div className="data-preview-section">
        <h4><span className="preview-dot" /> Data Preview (First 5 Rows)</h4>
        <div className="preview-table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                {data && data.length > 0 && data[0] && typeof data[0] === 'object' && 
                  Object.keys(data[0]).slice(0, 8).map(key => <th key={key}>{key}</th>)
                }
              </tr>
            </thead>
            <tbody>
              {data && data.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {row && typeof row === 'object' && 
                    Object.values(row).slice(0, 8).map((val, j) => <td key={j}>{String(val)}</td>)
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Chart Template Bar (Horizontal Toolbox) ── */}
      <div className="chart-template-bar">
        <span className="template-label">Chart Templates:</span>
        <div className="template-items">
          {[
            { type: 'Bar Chart', icon: '📊' },
            { type: 'Line Chart', icon: '📈' },
            { type: 'Pie Chart', icon: '🍕' },
            { type: 'Category Bar', icon: '🏢' },
          ].map(w => (
            <div 
              key={w.type}
              className="template-item"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('widgetType', w.type)}
            >
              <span className="template-icon">{w.icon}</span>
              <span className="template-name">{w.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Blank Canvas Section ── */}
      <div className="dashboard-builder-canvas-only">
        <DashboardCanvas 
          widgets={widgets} 
          onDrop={onDrop} 
          onRemove={onRemove} 
          onConfigure={onConfigure}
          onUpdateWidget={onUpdateWidget}
          dsConfig={dsConfig}
          sourceType={sourceType}
          localData={data}
        />
      </div>
    </div>
  );
}
