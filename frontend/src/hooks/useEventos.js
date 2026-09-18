import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_EVENTOS = [
  {
    id: 1,
    nombre: 'Congreso Internacional de Inteligencia Artificial y Robótica 2026',
    tipo: 'CONFERENCIA',
    descripcion: 'Magno congreso con ponentes internacionales de MIT y Google DeepMind explorando el futuro de los LLMs y la robótica autónoma.',
    fecha_inicio: new Date(Date.now() + 3 * 86400000).toISOString(),
    lugar_ubicacion: 'Auditorio Universidad Antonio José de Sucre (AUD-MAGNO)',
    organizador_nombre: 'Administrador General',
    aforo_maximo: 250,
    cupos_disponibles: 248,
    imagen_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    estado: 'PROGRAMADO',
  },
  {
    id: 2,
    nombre: 'Taller Práctico: Despliegue de Microservicios con Docker y Node.js',
    tipo: 'TALLER',
    descripcion: 'Hands-on workshop intensivo para aprender a orquestar contenedores, API Gateways y bases de datos aisladas.',
    fecha_inicio: new Date(Date.now() + 5 * 86400000).toISOString(),
    lugar_ubicacion: 'Laboratorio de Inteligencia Artificial (LAB-IA-01)',
    organizador_nombre: 'Ana María Gómez',
    aforo_maximo: 35,
    cupos_disponibles: 33,
    imagen_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    estado: 'EN_CURSO',
  },
  {
    id: 3,
    nombre: 'Seminario de Metodologías Ágiles, Scrum y Liderazgo Técnico',
    tipo: 'SEMINARIO',
    descripcion: 'Seminario enfocado en la gestión eficiente de equipos de ingeniería de software e integración continua.',
    fecha_inicio: new Date(Date.now() + 7 * 86400000).toISOString(),
    lugar_ubicacion: 'Sala de Conferencias e Investigación (SALA-CONF-A)',
    organizador_nombre: 'Carlos Pérez',
    aforo_maximo: 18,
    cupos_disponibles: 15,
    imagen_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
    estado: 'PROGRAMADO',
  },
  {
    id: 4,
    nombre: 'Feria Institucional de Innovación, Ciencia y Emprendimiento UAJS',
    tipo: 'ACTIVIDAD_INSTITUCIONAL',
    descripcion: 'Exposición de proyectos finales de grado, prototipos robóticos y startups tecnológicas universitarias.',
    fecha_inicio: new Date(Date.now() + 10 * 86400000).toISOString(),
    lugar_ubicacion: 'Plaza Central y Zonas Verdes del Campus',
    organizador_nombre: 'Administrador General',
    aforo_maximo: 500,
    cupos_disponibles: 500,
    imagen_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80',
    estado: 'PROGRAMADO',
  },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, inscRes] = await Promise.all([
        fetch(`${API_GATEWAY_URL}/api/eventos`, { headers: getAuthHeaders() }),
        fetch(`${API_GATEWAY_URL}/api/eventos/mis-inscripciones`, { headers: getAuthHeaders() }),
      ]);

      // Procesar catálogo general desde la BD real (ms-eventos)
      if (evRes.ok) {
        const data = await evRes.json();
        const items = Array.isArray(data) ? data : data.eventos || data.data || [];
        // Si el backend respondió 200, usamos 100% los datos de la base de datos real
        setEventos(items);
      } else {
        // Solo si el backend falla con error HTTP, activamos fallback de desarrollo
        setEventos(FALLBACK_EVENTOS);
      }

      // Procesar mis inscripciones
      if (inscRes.ok) {
        const data2 = await inscRes.json();
        const mis = Array.isArray(data2)
          ? data2
          : data2.mis_inscripciones || data2.eventos || [];
        setMisInscripciones(mis.map((e) => e.evento_id || e.id));
      }
    } catch (err) {
      setError(err.message);
      setEventos(FALLBACK_EVENTOS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // POST /api/eventos/:id/inscribirse
  const inscribir = async (eventoId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos/${eventoId}/inscribirse`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al inscribirse');
      }
      // Actualización optimista de UI
      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === eventoId
            ? { ...ev, cupos_disponibles: Math.max(0, ev.cupos_disponibles - 1) }
            : ev
        )
      );
      setMisInscripciones((prev) => [...prev, eventoId]);

      // Re-sincronizar inmediatamente con la base de datos real de PostgreSQL
      setTimeout(() => fetchEventos(), 300);

      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE /api/eventos/:id/inscripcion
  const cancelar = async (eventoId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/eventos/${eventoId}/inscripcion`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al cancelar inscripción');
      }
      // Actualización optimista de UI
      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === eventoId
            ? { ...ev, cupos_disponibles: ev.cupos_disponibles + 1 }
            : ev
        )
      );
      setMisInscripciones((prev) => prev.filter((id) => id !== eventoId));

      // Re-sincronizar inmediatamente con la base de datos real de PostgreSQL
      setTimeout(() => fetchEventos(), 300);

      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    eventos,
    misInscripciones,
    loading,
    actionLoading,
    error,
    refetch: fetchEventos,
    inscribir,
    cancelar,
  };
};

export default useEventos;
