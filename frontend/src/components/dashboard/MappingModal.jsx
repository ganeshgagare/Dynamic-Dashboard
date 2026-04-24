import { useState, useEffect, useCallback } from 'react';
import api from '../../api.js';

export function MappingModal({ widget, dsConfig, sourceType, localData, onSave, onClose }) {
  // Initialize state with extreme safety
  const [schema, setSchema] = useState(() => {
    try {
      if (sourceType === 'json' && localData && localData.length > 0 && localData[0]) {
        return { "Imported File": Object.keys(localData[0]) };
      }
    } catch (e) {
      console.error("Schema init error:", e);
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    return sourceType === 'db'; // Only show loader for DB
  });

  const [error, setError] = useState('');
  
  const [selectedTable, setSelectedTable] = useState(() => {
    if (sourceType === 'json') return "Imported File";
    return widget?.table || '';
  });

  const [mapping, setMapping] = useState(() => {
    return widget?.mapping || {
      name: '',
      status: '',
      category: '',
      value: ''
    };
  });

  const fetchSchema = useCallback(async () => {
    if (!dsConfig) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/datasource/inspect', dsConfig);
      if (data && data.success) {
        setSchema(data.schema);
      } else {
        setError(data?.message || 'Failed to fetch schema');
      }
    } catch (err) {
      setError('Failed to inspect database schema. Check connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dsConfig]);

  useEffect(() => {
    if (sourceType === 'db' && dsConfig) {
      fetchSchema();
    }
  }, [sourceType, dsConfig, fetchSchema]);

  const handleSave = () => {
    if (!selectedTable) { alert('Select a table first'); return; }
    onSave({ table: selectedTable, mapping });
  };

  if (!widget) return null;

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content mapping-modal">
          <div className="modal-body" style={{ padding: '40px', textAlign: 'center' }}>
            <span className="auth-spinner" style={{ margin: '0 auto 20px' }} />
            <p>Scanning your database schema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content mapping-modal">
        <div className="modal-header">
          <div className="header-text">
            <h2>Configure Widget</h2>
            <p className="modal-subtitle">Map your source data to dashboard fields</p>
          </div>
          <button className="close-btn" onClick={onClose} title="Close window">✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="auth-error" style={{ marginBottom: '15px' }}>{error}</div>}
          
          <div className="map-group">
            <label>📁 Select Source Table / File</label>
            <select value={selectedTable} onChange={e => {
              setSelectedTable(e.target.value);
              setMapping({ name: '', status: '', category: '', value: '' });
            }}>
              <option value="">-- Choose Data Source --</option>
              {schema && Object.keys(schema).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {selectedTable && schema && schema[selectedTable] && Array.isArray(schema[selectedTable]) && (
            <div className="mapping-fields">
              <h4>🎯 Data Field Mapping</h4>
              <p className="map-hint">Match your database columns to the fields required by the charts.</p>
              
              <div className="map-row">
                <label>🏷️ Name</label>
                <select value={mapping.name} onChange={e => setMapping(m => ({ ...m, name: e.target.value }))}>
                  <option value="">-- Select Column --</option>
                  {schema[selectedTable].map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="map-row">
                <label>🚦 Status</label>
                <select value={mapping.status} onChange={e => setMapping(m => ({ ...m, status: e.target.value }))}>
                  <option value="">-- Select Column --</option>
                  {schema[selectedTable].map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="map-row">
                <label>📂 Category</label>
                <select value={mapping.category} onChange={e => setMapping(m => ({ ...m, category: e.target.value }))}>
                  <option value="">-- Select Column --</option>
                  {schema[selectedTable].map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="map-row">
                <label>💰 Value</label>
                <select value={mapping.value} onChange={e => setMapping(m => ({ ...m, value: e.target.value }))}>
                  <option value="">-- Select Column --</option>
                  {schema[selectedTable].map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </div>
          )}

          {!loading && (!schema || Object.keys(schema).length === 0) && !error && (
            <div className="widget-empty" style={{ padding: '20px' }}>
              No tables or columns found in the data source.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={!selectedTable}>Save Configuration</button>
        </div>
      </div>
    </div>
  );
}
