import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useAdminRecursos = () => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecursos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al consultar el catálogo de recursos.');
      }

      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.recursos)
        ? data.recursos
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setRecursos(list);
      setError(null);
      return list;
    } catch (err) {
      console.error('Error en fetchRecursos:', err);
      setError(err.message);
      setRecursos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecursos();
  }, [fetchRecursos]);

  // Crear recurso (POST /api/recursos)
  const crearRecurso = async (payload) => {
    setActionLoading(true);
    try {
      const isDisp = payload.disponibilidad === 'DISPONIBLE' || payload.disponibilidad === true;
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          disponibilidad: isDisp,
          estado: payload.estado || 'BUENO',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || data.message || 'Error al crear el recurso.' };
      }

      await fetchRecursos();
      return { ok: true, recurso: data.recurso, message: data.message || 'Recurso creado exitosamente.' };
    } catch (err) {
      console.error('Error al crear recurso:', err);
      return { ok: false, message: err.message || 'Error de conexión con el API Gateway.' };
    } finally {
      setActionLoading(false);
    }
  };

  // Editar recurso (PUT /api/recursos/:id)
  const editarRecurso = async (id, payload) => {
    setActionLoading(true);
    try {
      const isDisp = payload.disponibilidad === 'DISPONIBLE' || payload.disponibilidad === true;
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          disponibilidad: isDisp,
          estado: payload.estado || 'BUENO',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || data.message || 'Error al actualizar el recurso.' };
      }

      await fetchRecursos();
      return { ok: true, recurso: data.recurso, message: data.message || 'Recurso actualizado exitosamente.' };
    } catch (err) {
      console.error('Error al editar recurso:', err);
      return { ok: false, message: err.message || 'Error de conexión con el API Gateway.' };
    } finally {
      setActionLoading(false);
    }
  };

  // Actualizar estado y disponibilidad (PUT /api/recursos/:id/estado)
  const cambiarEstadoRecurso = async (id, estado, disponibilidad) => {
    setActionLoading(true);
    try {
      const isDisp = disponibilidad === 'DISPONIBLE' || disponibilidad === true;
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos/${id}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estado: estado || 'BUENO',
          disponibilidad: isDisp,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al cambiar estado.' };
      }

      await fetchRecursos();
      return { ok: true, message: data.message || 'Estado modificado.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar recurso (DELETE /api/recursos/:id)
  const eliminarRecurso = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || data.message || 'No se pudo eliminar el recurso.' };
      }

      await fetchRecursos();
      return { ok: true, message: data.message || 'Recurso eliminado del catálogo.' };
    } catch (err) {
      console.error('Error al eliminar recurso:', err);
      return { ok: false, message: err.message || 'Error de conexión.' };
    } finally {
      setActionLoading(false);
    }
  };

  // Registrar mantenimiento (POST /api/recursos/:id/mantenimiento)
  const registrarMantenimiento = async (id, payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos/${id}/mantenimiento`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipo_mantenimiento: payload.tipo || payload.tipo_mantenimiento || 'PREVENTIVO',
          descripcion: payload.descripcion,
          tecnico_responsable: payload.tecnico_responsable || 'Servicios Generales',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al registrar mantenimiento.' };
      }

      await fetchRecursos();
      return { ok: true, message: data.message || 'Mantenimiento registrado.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    recursos,
    loading,
    actionLoading,
    error,
    refetch: fetchRecursos,
    crearRecurso,
    editarRecurso,
    cambiarEstadoRecurso,
    eliminarRecurso,
    registrarMantenimiento,
  };
};

export default useAdminRecursos;
