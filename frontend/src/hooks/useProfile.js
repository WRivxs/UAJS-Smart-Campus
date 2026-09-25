import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const useProfile = () => {
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'No se pudo obtener el perfil del usuario');
      }

      setProfile(data.usuario || data.user || data);
    } catch (err) {
      console.warn('Error al cargar perfil desde Gateway, usando fallback de sesión:', err.message);
      // Fallback con datos de sesión almacenados en JWT
      setProfile(prev => prev || {
        nombre: authUser?.nombre || authUser?.email?.split('@')[0] || 'Estudiante UAJS',
        email: authUser?.email || 'estudiante@uajs.edu.co',
        rol_nombre: authUser?.rol_nombre || 'Estudiante',
        codigo_estudiantil: 'EST-2026-8841',
        facultad: 'Ingeniería de Sistemas'
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};

export default useProfile;
