import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute / RoleGuard
 * Verifica que exista una sesión activa y que el rol del usuario
 * coincida con los roles autorizados (por ejemplo: ['Administrador']).
 */
export const ProtectedRoute = ({ children, allowedRoles = [], fallback = null }) => {
  const { token, user, rol } = useAuth();
  const currentRole = rol || user?.rol_nombre;

  if (!token) {
    return fallback;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
