import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_SOLICITUDES = [
  {
    id: 5,
    codigo: 'SOL-005',
    asunto: 'Certificado de Calificaciones y Conducta',
    tipo: 'CERTIFICADO',
    dependencia: 'Registro y Control Académico',
    responsable_nombre: 'Lic. Martha Lucia Gomez',
    prioridad: 'MEDIA',
    estado: 'EN_PROCESO',
    fecha_registro: new Date(Date.now() - 86400000).toISOString(),
    descripcion: 'Solicitud de certificado oficial con promedio ponderado para trámite de pasantías.',
  },
  {
    id: 4,
    codigo: 'SOL-004',
    asunto: 'Homologación de Asignatura: Cálculo Multivariado',
    tipo: 'ACADEMICA',
    dependencia: 'Decanatura de Ingeniería',
    responsable_nombre: 'Ing. Carlos Mendoza',
    prioridad: 'ALTA',
    estado: 'EN_REVISION',
    fecha_registro: new Date(Date.now() - 3 * 86400000).toISOString(),
    descripcion: 'Equivalencia de contenidos programáticos cursados en universidad de origen.',
  },
  {
    id: 2,
    codigo: 'SOL-002',
    asunto: 'Constancia de Matrícula Vigente 2026-1',
    tipo: 'CERTIFICADO',
    dependencia: 'Admisiones y Registro',
    responsable_nombre: 'Dra. Elena Ramos',
    prioridad: 'BAJA',
    estado: 'RESUELTA',
    fecha_registro: new Date(Date.now() - 7 * 86400000).toISOString(),
    descripcion: 'Constancia regular para subsidio de transporte y caja de compensación.',
  },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/solicitudes`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes');
      }

      const data = await response.json();
      const items = Array.isArray(data)
        ? data
        : data.solicitudes || data.data || [];

      // Si el backend respondió 200, reflejar 100% la base de datos real
      setSolicitudes(items);
      setError(null);
    } catch (err) {
      console.warn('Fallo al consultar ms-solicitudes, usando fallback:', err.message);
      setError(err.message);
      setSolicitudes(FALLBACK_SOLICITUDES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  // POST /api/solicitudes
  const crearSolicitud = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al radicar la solicitud.');
      }

      const nueva = data.solicitud || data;
      // Actualización inmediata del estado local
      setSolicitudes((prev) => [nueva, ...prev]);

      // Refrescar para garantizar sincronía total con PostgreSQL
      setTimeout(() => fetchSolicitudes(), 300);

      return { ok: true, data: nueva, message: data.message };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // GET /api/solicitudes/:id (Detalle + Historial de Estados)
  const obtenerDetalle = async (id) => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'No se pudo obtener el detalle del trámite.');
      }

      const data = await res.json();
      return { ok: true, solicitud: data.solicitud, historial: data.historial || [] };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  // DELETE /api/solicitudes/:id (Solo si está en estado REGISTRADA)
  const cancelarSolicitud = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/solicitudes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cancelar la solicitud.');
      }

      // Remover de la lista local
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => fetchSolicitudes(), 300);

      return { ok: true, message: data.message || 'Solicitud cancelada exitosamente.' };
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
    crearSolicitud,
    obtenerDetalle,
    cancelarSolicitud,
  };
};

export default useSolicitudes;
