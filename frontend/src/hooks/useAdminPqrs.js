import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useAdminPqrs = () => {
  const [pqrsList, setPqrsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Consultar todas las PQRS del campus (admin ve todos los radicados)
  const fetchPqrs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/pqrs`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al consultar PQRS en db_pqrs.');
      }

      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.pqrs)
        ? data.pqrs
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setPqrsList(list);
      setError(null);
      return list;
    } catch (err) {
      console.error('Error en fetchPqrs (admin):', err);
      setError(err.message);
      setPqrsList([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPqrs();
  }, [fetchPqrs]);

  // Consultar detalle y respuestas de un ticket
  const getDetallePqrs = async (id) => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al obtener detalle del radicado.' };
      }
      return { ok: true, pqrs: data.pqrs, respuestas: data.respuestas || [] };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  // Responder formalmente un ticket PQRS (PUT /api/pqrs/:id/responder)
  const responderPqrs = async (id, mensaje) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}/responder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mensaje }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al responder el ticket PQRS.' };
      }

      await fetchPqrs();
      return { ok: true, message: data.message || 'Respuesta radicada y notificada al usuario.' };
    } catch (err) {
      console.error('Error al responder PQRS:', err);
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Cambiar estado del ticket (RECIBIDA, EN_TRAMITE, RESPONDIDA, CERRADA)
  const updateEstadoPqrs = async (id, estado) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al cambiar estado de PQRS.' };
      }

      await fetchPqrs();
      return { ok: true, message: data.message || `Estado actualizado a ${estado}.` };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar ticket PQRS
  const eliminarPqrs = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'No se pudo eliminar el radicado.' };
      }

      await fetchPqrs();
      return { ok: true, message: data.message || 'Ticket PQRS eliminado.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    pqrsList,
    loading,
    actionLoading,
    error,
    refetch: fetchPqrs,
    getDetallePqrs,
    responderPqrs,
    updateEstadoPqrs,
    eliminarPqrs,
  };
};

export default useAdminPqrs;

