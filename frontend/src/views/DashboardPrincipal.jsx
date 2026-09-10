import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const DashboardPrincipal = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>📊 Dashboard Principal</h1>
      <p>Bienvenido, {user?.nombre || 'Usuario'}. Rol: <strong>{user?.rol_nombre || 'Invitado'}</strong></p>
    </div>
  );
};

export default DashboardPrincipal;
