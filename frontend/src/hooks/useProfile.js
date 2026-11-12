import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const useProfile = () => {
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar el perfil con los datos autenticados reales de la sesión
  useEffect(() => {
    if (authUser) {
      setProfile(prev => ({
        ...authUser,
        ...(prev || {})
      }));
    }
  }, [authUser]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      // Consultar el perfil real desde PostgreSQL a través del API Gateway
      const response = await fetch(`${API_BASE_URL}/api/usuarios/profile`, {
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

      const realProfile = data.usuario || data.user || data;
      setProfile(realProfile);
    } catch (err) {
      console.warn('Advertencia al consultar perfil desde Gateway:', err.message);
      setError(err.message);
      // Mantener los datos reales decodificados del JWT de sesión sin inventar datos mock
      if (authUser) {
        setProfile(authUser);
      }
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
