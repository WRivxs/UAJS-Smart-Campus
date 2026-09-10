import React from 'react';

export const NotificationItem = ({ notificacion }) => {
  return (
    <div className={`notification-item ${notificacion?.leida ? 'leida' : 'no-leida'}`}>
      <p>{notificacion?.mensaje || 'Notificación del sistema'}</p>
    </div>
  );
};

export default NotificationItem;
