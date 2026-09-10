import React from 'react';

export const KPIWidget = ({ titulo, valor, icono }) => {
  return (
    <div className="kpi-widget">
      <div className="kpi-widget__value">{valor || '0'}</div>
      <div className="kpi-widget__title">{titulo || 'Métrica'}</div>
    </div>
  );
};

export default KPIWidget;
