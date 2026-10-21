import { useState, useEffect, useCallback } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_PQRS = [
  {
    id: 1,
    numero_ticket: 'PQRS-2026-0001',
    usuario_id: 4,
    usuario_nombre: 'Juan David Rivas Payares',
    usuario_email: 'estudiante@uajs.edu.co',
    tipo: 'PETICION',
    asunto: 'Ampliación de horario en Sala de Cómputo 302',
    descripcion: 'Solicitamos extender el horario de atención de las salas de cómputo durante la semana de parciales finales.',
    dependencia_destino: 'Infraestructura y TI',
    anonimo: false,
    estado: 'RECIBIDA',
    respuesta: null,
    fecha_respuesta: null,
    fecha_limite_respuesta: new Date(Date.now() + 15 * 86400000).toISOString(),
    responsable_nombre: null,
    fecha_registro: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    numero_ticket: 'PQRS-2026-0002',
    usuario_id: 4,
    usuario_nombre: 'Juan David Rivas Payares',
    usuario_email: 'estudiante@uajs.edu.co',
    tipo: 'QUEJA',
    asunto: 'Demora en trámite de validación de recibos',
    descripcion: 'Presenté el comprobante de pago el lunes y aún no ha sido reflejado en la plataforma de matrícula.',
    dependencia_destino: 'Servicios Financieros',
    anonimo: false,
    estado: 'EN_TRAMITE',
    respuesta: null,
    fecha_respuesta: null,
    fecha_limite_respuesta: new Date(Date.now() + 10 * 86400000).toISOString(),
    responsable_nombre: 'Carlos Pérez',
    fecha_registro: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('uajs_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const usePqrs = () => {
  const [pqrsList, setPqrsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPqrs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al consultar las PQRS');
      }

      const data = await response.json();
      setPqrsList(data.pqrs || []);
    } catch (err) {
      console.warn('Fallo al obtener PQRS desde API Gateway, usando datos locales:', err.message);
      setPqrsList(FALLBACK_PQRS);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPqrs();
  }, [fetchPqrs]);

  const crearPqrs = async (datos) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al radicar la PQRS');
      }

      await fetchPqrs();
      return { success: true, data: data.pqrs };
    } catch (err) {
      console.error('Error al crear PQRS:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const obtenerDetalle = async (id) => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar el detalle del radicado');
      }

      const data = await response.json();
      return { success: true, pqrs: data.pqrs, respuestas: data.respuestas || [] };
    } catch (err) {
      console.error('Error al obtener detalle PQRS:', err);
      const local = pqrsList.find((p) => String(p.id) === String(id));
      if (local) {
        return { success: true, pqrs: local, respuestas: [] };
      }
      return { success: false, error: err.message };
    }
  };

  const consultarPorTicket = async (numero_ticket) => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs/ticket/${numero_ticket}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`No se encontró el radicado '${numero_ticket}'`);
      }

      const data = await response.json();
      return { success: true, pqrs: data.pqrs, respuestas: data.respuestas || [] };
    } catch (err) {
      console.error('Error al consultar por ticket:', err);
      const local = pqrsList.find((p) => p.numero_ticket === numero_ticket);
      if (local) {
        return { success: true, pqrs: local, respuestas: [] };
      }
      return { success: false, error: err.message };
    }
  };

  const responderPqrs = async (id, mensaje, adjunto_url = null) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}/responder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mensaje, adjunto_url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al emitir respuesta');
      }

      await fetchPqrs();
      return { success: true, pqrs: data.pqrs };
    } catch (err) {
      console.error('Error al responder PQRS:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el estado de la PQRS');
      }

      await fetchPqrs();
      return { success: true, pqrs: data.pqrs };
    } catch (err) {
      console.error('Error al cambiar estado PQRS:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const replicarPqrs = async (id, mensaje, adjunto_url = null) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pqrs/${id}/replicar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mensaje, adjunto_url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud de aclaración / réplica');
      }

      await fetchPqrs();
      return { success: true, pqrs: data.pqrs };
    } catch (err) {
      console.error('Error al replicar PQRS:', err);
      return { success: false, error: err.message };
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
    crearPqrs,
    obtenerDetalle,
    consultarPorTicket,
    responderPqrs,
    replicarPqrs,
    cambiarEstado,
  };
};

export default usePqrs;
