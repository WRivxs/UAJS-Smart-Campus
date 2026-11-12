import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useAdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Consultar todas las reservas institucionales (admin tiene vista total)
  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al consultar reservas en db_reservas.');
      }

      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.reservas)
        ? data.reservas
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setReservas(list);
      setError(null);
      return list;
    } catch (err) {
      console.error('Error en fetchReservas (admin):', err);
      setError(err.message);
      setReservas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Consultar catálogo de recursos para vincular nombres y tipos
  const fetchRecursos = useCallback(async () => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRecursos(data.recursos || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error('Error al cargar recursos:', err);
    }
  }, []);

  useEffect(() => {
    fetchReservas();
    fetchRecursos();
  }, [fetchReservas, fetchRecursos]);

  // Consultar franjas horarias ocupadas en vivo para un recurso y fecha
  const consultarDisponibilidad = useCallback(async (recursoId, fecha) => {
    if (!recursoId || !fecha) return { ok: false, horarios_ocupados: [] };
    try {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/reservas/disponibilidad?recurso_id=${recursoId}&fecha_reserva=${fecha}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, horarios_ocupados: [], message: data.error };
      }
      return { ok: true, horarios_ocupados: data.horarios_ocupados || [] };
    } catch (err) {
      return { ok: false, horarios_ocupados: [], message: err.message };
    }
  }, []);

  // Aprobar reserva institucional (PUT /api/reservas/:id/aprobar)
  // Manejo de conflicto de solapamiento 409
  const aprobarReserva = async (id, observaciones = '') => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas/${id}/aprobar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ observaciones }),
      });

      const data = await res.json();

      if (res.status === 409 || (data.error && data.error.includes('compromiso confirmado'))) {
        return {
          ok: false,
          conflict: true,
          message: data.error || 'Conflicto de horario: Ya existe otra reserva confirmada en la misma franja horaria.',
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          conflict: false,
          message: data.error || data.message || 'No se pudo aprobar la reserva.',
        };
      }

      await fetchReservas();
      return { ok: true, message: data.message || 'Reserva APROBADA exitosamente.', reserva: data.reserva };
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      return { ok: false, conflict: false, message: err.message || 'Error de conexión con el servidor.' };
    } finally {
      setActionLoading(false);
    }
  };

  // Rechazar reserva (PUT /api/reservas/:id/rechazar)
  const rechazarReserva = async (id, observaciones = '') => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas/${id}/rechazar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ observaciones }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al rechazar reserva.' };
      }

      await fetchReservas();
      return { ok: true, message: data.message || 'Reserva rechazada.', reserva: data.reserva };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Cancelar reserva (PUT /api/reservas/:id/cancelar)
  const cancelarReserva = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas/${id}/cancelar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al cancelar la reserva.' };
      }

      await fetchReservas();
      return { ok: true, message: data.message || 'Reserva CANCELADA exitosamente.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar reserva (DELETE /api/reservas/:id)
  const eliminarReserva = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.error || 'Error al eliminar la reserva.' };
      }

      await fetchReservas();
      return { ok: true, message: data.message || 'Reserva eliminada definitivamente del sistema.' };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    reservas,
    recursos,
    loading,
    actionLoading,
    error,
    refetch: fetchReservas,
    aprobarReserva,
    rechazarReserva,
    cancelarReserva,
    eliminarReserva,
    consultarDisponibilidad,
  };
};

export default useAdminReservas;

