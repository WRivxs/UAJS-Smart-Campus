import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const useProfile = () => {
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar de inmediato el perfil cuando el usuario autenticado cambie
  useEffect(() => {
    if (authUser) {
      const userEmail = (authUser.email || '').trim().toLowerCase();
      const isAdmin = userEmail.includes('admin') && !userEmail.includes('estudiante');
      setProfile({
        ...authUser,
        rol_nombre: isAdmin ? 'Administrador' : 'Estudiante',
        rol_id: isAdmin ? 1 : 4,
        nombre: authUser.nombre || (isAdmin ? 'Administrador General del Sistema' : 'Juan David Rivas Payares'),
        cargo: isAdmin ? 'Director de Tecnologías e Infraestructura' : 'Estudiante de Pregrado',
        facultad_departamento: isAdmin ? 'Dirección de Tecnologías de la Información' : 'Facultad de Ingenierías',
        programa_academico: 'Ingeniería de Sistemas',
        codigo_estudiantil: authUser.codigo_estudiantil || (isAdmin ? 'ADM-001' : 'EST-202401')
      });
    }
  }, [authUser]);

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

      const rawProfile = data.usuario || data.user || data;
      const userEmail = (rawProfile.email || authUser?.email || '').trim().toLowerCase();
      const isAdmin = userEmail.includes('admin') && !userEmail.includes('estudiante');

      setProfile({
        ...rawProfile,
        rol_nombre: isAdmin ? 'Administrador' : 'Estudiante',
        rol_id: isAdmin ? 1 : 4,
        nombre: rawProfile.nombre || (isAdmin ? 'Administrador General del Sistema' : 'Juan David Rivas Payares'),
        cargo: isAdmin ? 'Director de Tecnologías e Infraestructura' : 'Estudiante de Pregrado',
        facultad_departamento: isAdmin ? 'Dirección de Tecnologías de la Información' : 'Facultad de Ingenierías',
        codigo_estudiantil: rawProfile.codigo_estudiantil || (isAdmin ? 'ADM-001' : 'EST-202401')
      });
    } catch (err) {
      console.warn('Error al cargar perfil desde Gateway, usando fallback de sesión:', err.message);
      const userEmail = (authUser?.email || '').trim().toLowerCase();
      const isAdmin = userEmail.includes('admin') && !userEmail.includes('estudiante');

      if (isAdmin) {
        setProfile({
          id: authUser?.id || 1,
          nombre: authUser?.nombre || 'Administrador General del Sistema',
          email: authUser?.email || 'admin@uajs.edu.co',
          rol_nombre: 'Administrador',
          rol_id: 1,
          codigo_estudiantil: authUser?.codigo_estudiantil || 'ADM-001',
          facultad: 'Dirección de Tecnologías de la Información',
          facultad_departamento: 'Dirección de Tecnologías de la Información',
          cargo: 'Director de Tecnologías e Infraestructura',
          tipo_vinculacion: 'Tiempo Completo',
          celular: '3100000000',
          telefono: '6052814502',
          email_personal: 'admin.smartcampus@uajs.edu.co'
        });
      } else {
        setProfile({
          id: authUser?.id || 4,
          nombre: authUser?.nombre || 'Juan David Rivas Payares',
          primer_nombre: 'Juan',
          segundo_nombre: 'David',
          primer_apellido: 'Rivas',
          segundo_apellido: 'Payares',
          email: authUser?.email || 'estudiante@uajs.edu.co',
          rol_nombre: 'Estudiante',
          rol_id: 4,
          codigo_estudiantil: authUser?.codigo_estudiantil || 'EST-202401',
          facultad: 'Facultad de Ingenierías',
          facultad_departamento: 'Facultad de Ingenierías',
          programa_academico: 'Ingeniería de Sistemas',
          cargo: 'Estudiante de Pregrado',
          semestre_actual: 6,
          tipo_documento: 'Tarjeta de Identidad',
          numero_documento: '1052952641',
          fecha_expedicion_documento: '2019-09-10',
          fecha_nacimiento: '2005-05-27',
          edad: 21,
          genero: 'Masculino',
          estado_civil: 'Soltero(a)',
          celular: '3114270335',
          telefono: '3114270335',
          email_personal: 'juandavid.rivas@gmail.com',
          tipo_vinculacion: 'Estudiante Regular'
        });
      }
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
