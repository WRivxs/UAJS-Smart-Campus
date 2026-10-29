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

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Consulta listado de reservas del usuario en ms-reservas vía Gateway
  const fetchReservas = useCallback(async () => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al obtener el listado de reservas.');
      }

      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : data.reservas || data.data || [];

      // Cero mock data: Reflejo fiel de PostgreSQL (db_reservas)
      setReservas(items);
      setError(null);
      return items;
    } catch (err) {
      console.error('Error al cargar reservas de db_reservas:', err);
      setError(err.message);
      setReservas([]);
      return [];
    }
  }, []);

  // Consulta catálogo de recursos disponibles en ms-recursos vía Gateway
  const fetchRecursos = useCallback(async () => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/recursos`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Error al obtener el catálogo de recursos.');
      }

      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : data.recursos || data.data || [];

      // Cero mock data: Reflejo fiel de PostgreSQL (db_recursos)
      setRecursos(items);
      return items;
    } catch (err) {
      console.error('Error al cargar recursos de db_recursos:', err);
      setRecursos([]);
      return [];
    }
  }, []);

  // Inicialización de datos
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchReservas(), fetchRecursos()]);
      setLoading(false);
    };
    init();
  }, [fetchReservas, fetchRecursos]);

  // Consultar franjas horarias ocupadas para un recurso y fecha (Prevención de Solapamiento)
  const consultarDisponibilidad = useCallback(async (recursoId, fecha) => {
    if (!recursoId || !fecha) {
      return { ok: false, horarios_ocupados: [] };
    }

    try {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/reservas/disponibilidad?recurso_id=${recursoId}&fecha_reserva=${fecha}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          horarios_ocupados: [],
          message: data.error || 'Error al consultar disponibilidad horaria.',
        };
      }

      return {
        ok: true,
        recurso_id: data.recurso_id,
        fecha_reserva: data.fecha_reserva,
        horarios_ocupados: data.horarios_ocupados || [],
      };
    } catch (err) {
      console.error('Error al consultar franjas horarias:', err);
      return {
        ok: false,
        horarios_ocupados: [],
        message: err.message || 'Error de conexión con el servicio de reservas.',
      };
    }
  }, []);

  // Crear una nueva solicitud de reserva (POST /api/reservas)
  const crearReserva = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 201) {
        await fetchReservas();
        return {
          ok: true,
          data: data.reserva,
          message: data.message || 'Solicitud de reserva registrada exitosamente. Estado: PENDIENTE.',
        };
      } else if (res.status === 409) {
        // Choque de horarios detectado por el backend
        return {
          ok: false,
          conflict: true,
          message: data.error || 'El recurso ya cuenta con una reserva activa o aprobada en el rango solicitado.',
        };
      } else {
        return {
          ok: false,
          conflict: false,
          message: data.error || 'Error al procesar la reserva. Verifica los campos requeridos.',
        };
      }
    } catch (err) {
      console.error('Error al solicitar reserva:', err);
      return {
        ok: false,
        conflict: false,
        message: err.message || 'Error de comunicación con el API Gateway.',
      };
    } finally {
      setActionLoading(false);
    }
  };

  // Cancelar una reserva propia en estado PENDIENTE (PUT /api/reservas/:id/cancelar)
  const cancelarReserva = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/reservas/${id}/cancelar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          ok: false,
          message: data.error || 'No se pudo cancelar la reserva.',
        };
      }

      await fetchReservas();
      return {
        ok: true,
        data: data.reserva,
        message: data.message || 'Reserva CANCELADA exitosamente.',
      };
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      return {
        ok: false,
        message: err.message || 'Error de comunicación con el API Gateway.',
      };
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
    fetchRecursos,
    crearReserva,
    cancelarReserva,
    consultarDisponibilidad,
  };
};

export default useReservas;
