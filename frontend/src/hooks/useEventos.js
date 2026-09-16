import { useState, useEffect } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_EVENTOS = [
  {
    id: 1,
    nombre: 'Congreso Internacional de IA y Robótica 2026',
    tipo: 'INSTITUCIONAL',
    fecha: '03 SEP',
    hora_lugar: '09:00 · Auditorio Principal',
    estado: 'PROGRAMADO',
  },
  {
    id: 2,
    nombre: 'Taller Práctico: Despliegue de Microservicios con Docker y Node.js',
    tipo: 'FACULTAD INGENIERÍA',
    fecha: '05 SEP',
    hora_lugar: '14:00 · Laboratorio de Sistemas',
    estado: 'EN_CURSO',
  },
];

export const useEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const token = localStorage.getItem('uajs_token');

        const response = await fetch(`${API_GATEWAY_URL}/api/eventos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los eventos');
        }

        const data = await response.json();
        // Extraer array si viene envuelto en objeto { eventos: [...] } o directo
        const items = Array.isArray(data)
          ? data
          : data.eventos || data.data || [];

        setEventos(items.length > 0 ? items : FALLBACK_EVENTOS);
      } catch (err) {
        setError(err.message);
        setEventos(FALLBACK_EVENTOS);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  return { eventos, loading, error };
};

export default useEventos;
