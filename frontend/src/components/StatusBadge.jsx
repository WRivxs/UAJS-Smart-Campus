import React from 'react';

export const StatusBadge = ({ estado }) => {
  const getBadgeClass = (st) => {
    switch (st) {
      case 'RESUELTA':
      case 'APROBADA':
        return 'badge-success';
      case 'EN_REVISION':
      case 'EN_PROCESO':
      case 'PENDIENTE':
        return 'badge-warning';
      case 'RECHAZADA':
      case 'CANCELADA':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return <span className={`status-badge ${getBadgeClass(estado)}`}>{estado || 'REGISTRADA'}</span>;
};

export default StatusBadge;
