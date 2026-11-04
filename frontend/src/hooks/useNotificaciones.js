import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidasCount, setNoLeidasCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Consultar notificaciones del usuario desde ms-notificaciones vía Gateway
  const fetchNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/notificaciones`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al consultar el centro de notificaciones.');
      }

      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : data.notificaciones || data.data || [];

      setNotificaciones(items);
      setNoLeidasCount(
        typeof data.no_leidas_count === 'number'
          ? data.no_leidas_count
          : items.filter((n) => !n.leida).length
      );
      setError(null);
      return items;
    } catch (err) {
      console.warn('Fallo al obtener notificaciones en vivo:', err.message);
      setError(err.message);
      setNotificaciones([]);
      setNoLeidasCount(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar una notificación individual como leída
  const marcarLeida = async (id) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/notificaciones/${id}/marcar-leida`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No se pudo marcar la notificación como leída.');
      }

      // Actualizar estado local inmediatamente para reactividad visual
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true, fecha_lectura: new Date().toISOString() } : n))
      );
      setNoLeidasCount((prev) => Math.max(0, prev - 1));
      return { ok: true };
    } catch (err) {
      console.error('Error al marcar notificación:', err);
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Marcar todas las notificaciones como leídas
  const marcarTodasLeidas = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/notificaciones/marcar-todas-leidas`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No se pudieron marcar todas las notificaciones.');
      }

      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, leida: true, fecha_lectura: new Date().toISOString() }))
      );
      setNoLeidasCount(0);
      return { ok: true };
    } catch (err) {
      console.error('Error al marcar todas las notificaciones:', err);
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar una notificación
  const eliminarNotificacion = async (id) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/notificaciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No se pudo eliminar la notificación.');
      }

      setNotificaciones((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target && !target.leida) {
          setNoLeidasCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
      return { ok: true };
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  return {
    notificaciones,
    noLeidasCount,
    loading,
    actionLoading,
    error,
    refetch: fetchNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
  };
};

export default useNotificaciones;
