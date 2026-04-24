import React from 'react';
import { DynamicWidget } from './DynamicWidget.jsx';

export function DashboardCanvas({ widgets, onDrop, onRemove, onConfigure, onUpdateWidget, dsConfig, sourceType, localData }) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widgetType');
    if (type) {
      onDrop(type);
    }
  };
  
  return (
    <div 
      className="dashboard-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {widgets.length === 0 && (
        <div className="canvas-placeholder">
          <div className="placeholder-icon">✨</div>
          <h3>Your Canvas is Ready</h3>
          <p>Drag widgets from the left to start building your custom dashboard</p>
        </div>
      )}
      
      <div className="canvas-grid">
        {widgets.map(w => (
          <DynamicWidget 
            key={w.id} 
            widget={w} 
            onRemove={() => onRemove(w.id)}
            onConfigure={() => onConfigure(w.id)}
            onUpdate={(config) => onUpdateWidget(w.id, config)}
            dsConfig={dsConfig}
            sourceType={sourceType}
            localData={localData}
          />
        ))}
      </div>
    </div>
  );
}
