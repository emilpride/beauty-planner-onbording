
import React from 'react';
import './Battery.css';


// Компонент принимает процент заряда, цвет и isDragging через props
const Battery = ({ chargePercent, color, isDragging }) => {
  const levelClasses = `battery-level${isDragging ? ' no-transition' : ''}`;
  return (
    <div className="battery-container">
      <div className="battery-outline">
        <div
          className={levelClasses}
          style={{
            width: `${chargePercent}%`,
            backgroundColor: color
          }}
        ></div>
        {/* Визуальные разделители секций */}
        <div className="battery-separator" style={{ left: '25%' }}></div>
        <div className="battery-separator" style={{ left: '50%' }}></div>
        <div className="battery-separator" style={{ left: '75%' }}></div>
      </div>
      <div className="battery-terminal"></div>
    </div>
  );
};

export default Battery;
