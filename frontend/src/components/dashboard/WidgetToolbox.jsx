

const WIDGET_TYPES = [
  { type: 'Bar Chart', icon: '📊' },
  { type: 'Line Chart', icon: '📈' },
  { type: 'Pie Chart', icon: '🍕' },
  { type: 'Category Bar', icon: '🏢' },
];

export function WidgetToolbox() {
  const onDragStart = (e, widgetType) => {
    e.dataTransfer.setData('widgetType', widgetType);
  };

  return (
    <div className="widget-toolbox">
      <h3>Widgets</h3>
      <p className="toolbox-hint">Drag a chart to the canvas</p>
      <div className="toolbox-items">
        {WIDGET_TYPES.map(w => (
          <div 
            key={w.type}
            className="toolbox-item"
            draggable
            onDragStart={(e) => onDragStart(e, w.type)}
          >
            <span className="toolbox-icon">{w.icon}</span>
            <span className="toolbox-label">{w.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
