import { useState, useEffect } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_SOLICITUDES = [
  {
    id: 1,
    codigo: 'SOL-001',
    asunto: 'Solicitud de Certificado de Estudio 2026-1',
    tipo: 'ACADEMICA',
    estado: 'REGISTRADA',
  },
  {
    id: 2,
    codigo: 'SOL-002',
    asunto: 'Paz y Salvo Académico de Investigación',
    tipo: 'ADMINISTRATIVA',
    estado: 'EN_REVISION',
  },
  {
    id: 3,
    codigo: 'SOL-003',
    asunto: 'Asignación de Sticker de Parqueadero Vehicular',
    tipo: 'SERVICIO',
    estado: 'EN_PROCESO',
  },
  {
    id: 4,
    codigo: 'SOL-004',
    asunto: 'Sábana de Notas Autenticada',
    tipo: 'ACADEMICA',
    estado: 'RESUELTA',
  },
];

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem('uajs_token');

        const response = await fetch(`${API_GATEWAY_URL}/api/solicitudes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las solicitudes');
        }

        const data = await response.json();
        // Extraer array si viene envuelto en objeto { solicitudes: [...] } o directo
        const items = Array.isArray(data)
          ? data
          : data.solicitudes || data.data || [];

        setSolicitudes(items.length > 0 ? items : FALLBACK_SOLICITUDES);
      } catch (err) {
        setError(err.message);
        setSolicitudes(FALLBACK_SOLICITUDES);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  return { solicitudes, loading, error };
};

export default useSolicitudes;
