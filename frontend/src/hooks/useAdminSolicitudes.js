import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const TRANSICIONES_ESTADO = {
  'REGISTRADA': ['EN_REVISION', 'ASIGNADA', 'CERRADA'],
  'EN_REVISION': ['ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'],
  'ASIGNADA': ['EN_PROCESO', 'RESUELTA', 'CERRADA'],
  'EN_PROCESO': ['RESUELTA', 'CERRADA'],
  'RESUELTA': ['CERRADA'],
  'CERRADA': [],
};

export const useAdminSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Consultar todas las solicitudes del campus (Admin ve el universo completo)
  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al cargar trámites y solicitudes de db_solicitudes.');
      }

      const data = await res.json();
      const list = data.solicitudes || (Array.isArray(data) ? data : []);
      setSolicitudes(list);
      setError(null);
      return list;
    } catch (err) {
      console.error('Error en fetchSolicitudes (admin):', err);
      setError(err.message);
      setSolicitudes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  // Consultar detalle completo + historial de trazabilidad
  const getDetalleSolicitud = async (id) => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'No se pudo obtener el detalle.' };
      }
      return { ok: true, solicitud: data.solicitud, historial: data.historial || [] };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  // Actualizar estado respetando máquina de estados y capturando HTTP 400 Bad Request
  const updateEstado = async (id, estado_nuevo, observacion = '', respuesta_final = '') => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes/${id}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estado_nuevo,
          observacion: observacion || `Transición a ${estado_nuevo}`,
          respuesta_final: respuesta_final || null,
        }),
      });

      const data = await res.json();

      if (res.status === 400) {
        // Violación de máquina de estados detectada por el backend
        return {
          ok: false,
          badRequest: true,
          message: data.error || `Transición no válida hacia el estado '${estado_nuevo}'.`,
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          badRequest: false,
          message: data.error || data.message || 'Error al actualizar el estado de la solicitud.',
        };
      }

      await fetchSolicitudes();
      return {
        ok: true,
        message: data.message || `Estado actualizado a ${estado_nuevo}.`,
        solicitud: data.solicitud,
      };
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      return { ok: false, badRequest: false, message: err.message || 'Error de conexión con el API Gateway.' };
    } finally {
      setActionLoading(false);
    }
  };

  // Asignar funcionario responsable (PUT /api/solicitudes/:id/asignar)
  const assignResponsable = async (id, responsable_id, responsable_nombre) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes/${id}/asignar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ responsable_id, responsable_nombre }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al asignar responsable.' };
      }

      await fetchSolicitudes();
      return { ok: true, message: data.message || 'Responsable asignado correctamente.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    solicitudes,
    loading,
    actionLoading,
    error,
    refetch: fetchSolicitudes,
    getDetalleSolicitud,
    updateEstado,
    assignResponsable,
  };
};

export default useAdminSolicitudes;
