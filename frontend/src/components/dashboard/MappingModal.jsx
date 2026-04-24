import React, { useState, useEffect } from 'react';
import api from '../../api.js';

export function MappingModal({ widget, dsConfig, sourceType, localData, onSave, onClose }) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  if (!widget) return null;

  const [selectedTable, setSelectedTable] = useState(widget.table || '');
  const [mapping, setMapping] = useState(widget.mapping || {
    name: '',
    status: '',
    category: '',
    value: ''
  });

  useEffect(() => {
    if (sourceType === 'json') {
      if (localData && localData.length > 0) {
        const keys = Object.keys(localData[0]);
        setSchema({ "Imported File": keys });
        setSelectedTable("Imported File");
      }
      setLoading(false);
    } else if (dsConfig) {
      fetchSchema();
    }
  }, [dsConfig, sourceType, localData]);

  const fetchSchema = async () => {
    try {
      const { data } = await api.post('/api/datasource/inspect', dsConfig);
      if (data.success) {
        setSchema(data.schema);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to inspect database schema');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedTable) { alert('Select a table first'); return; }
    onSave({ table: selectedTable, mapping });
  };

  if (loading) return <div className="modal-overlay"><div className="modal-content">Loading schema...</div></div>;

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
          {error && <div className="auth-error">{error}</div>}
          
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

          {selectedTable && (
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
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={!selectedTable}>Save Configuration</button>
        </div>
      </div>
    </div>
  );
}
