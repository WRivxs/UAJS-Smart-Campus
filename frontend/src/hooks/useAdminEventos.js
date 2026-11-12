import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useAdminEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al cargar la agenda institucional en db_eventos.');
      }

      const data = await res.json();
      const list = data.eventos || (Array.isArray(data) ? data : []);
      setEventos(list);
      setError(null);
      return list;
    } catch (err) {
      console.error('Error en fetchEventos (admin):', err);
      setError(err.message);
      setEventos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Crear nuevo evento institucional (POST /api/eventos)
  const crearEvento = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al publicar el evento.' };
      }

      await fetchEventos();
      return { ok: true, message: data.message || 'Evento institucional publicado exitosamente.', evento: data.evento };
    } catch (err) {
      console.error('Error al crear evento:', err);
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Editar evento (PUT /api/eventos/:id)
  const editarEvento = async (id, payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al editar el evento.' };
      }

      await fetchEventos();
      return { ok: true, message: data.message || 'Evento actualizado exitosamente.', evento: data.evento };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Cambiar estado del evento (PUT /api/eventos/:id/estado)
  const cambiarEstadoEvento = async (id, estado) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos/${id}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al cambiar estado del evento.' };
      }

      await fetchEventos();
      return { ok: true, message: data.message || `Estado del evento modificado a ${estado}.` };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar evento (DELETE /api/eventos/:id)
  const eliminarEvento = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'No se pudo eliminar el evento.' };
      }

      await fetchEventos();
      return { ok: true, message: data.message || 'Evento eliminado del sistema.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Emitir notificación institucional masiva / difusión (POST /api/notificaciones/difusion)
  const emitirDifusion = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/notificaciones/difusion`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al emitir la difusión.' };
      }

      return { ok: true, message: data.message || 'Alerta institucional difundida exitosamente a todos los usuarios.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    eventos,
    loading,
    actionLoading,
    error,
    refetch: fetchEventos,
    crearEvento,
    editarEvento,
    cambiarEstadoEvento,
    eliminarEvento,
    emitirDifusion,
  };
};

export default useAdminEventos;
