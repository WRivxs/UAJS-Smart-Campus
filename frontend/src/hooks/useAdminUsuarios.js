import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useAdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Consultar todos los usuarios en ms-usuarios a través del Gateway
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/users`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Error al obtener usuarios de db_usuarios.');
      }

      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.usuarios)
        ? data.usuarios
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setUsuarios(list);
      setError(null);
      return list;
    } catch (err) {
      console.error('Error en fetchUsuarios:', err);
      setError(err.message);
      setUsuarios([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Consultar catálogo de roles
  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/users/roles`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, [fetchUsuarios, fetchRoles]);

  // Actualizar datos de usuario (rol, facultad, estado, contacto)
  const actualizarUsuario = async (id, payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || data.message || 'Error al actualizar usuario.' };
      }

      await fetchUsuarios();
      return { ok: true, usuario: data.usuario, message: data.message || 'Usuario actualizado correctamente.' };
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      return { ok: false, message: err.message || 'Error de conexión con el servidor.' };
    } finally {
      setActionLoading(false);
    }
  };

  // Desactivar o Activar usuario
  const toggleEstadoUsuario = async (usuario) => {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    return await actualizarUsuario(usuario.id, { estado: nuevoEstado });
  };

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || data.message || 'No se pudo eliminar el usuario.' };
      }

      await fetchUsuarios();
      return { ok: true, message: data.message || 'Usuario eliminado exitosamente.' };
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      return { ok: false, message: err.message || 'Error de conexión con el servidor.' };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    usuarios,
    roles,
    loading,
    actionLoading,
    error,
    refetch: fetchUsuarios,
    actualizarUsuario,
    toggleEstadoUsuario,
    eliminarUsuario,
  };
};

export default useAdminUsuarios;

