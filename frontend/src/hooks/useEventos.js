import { useState, useEffect } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const useEventos = () => {
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

        setEventos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);

        setEventos([
          {
            id: 1,
            nombre: 'Congreso Internacional de IA y Robótica 2026',
            tipo: 'INSTITUCIONAL',
            fecha: '03 SEP',
            horaLugar: '09:00 · Auditorio principal',
            estado: 'PROGRAMADO',
          },
          {
            id: 2,
            nombre:
              'Taller Práctico: Despliegue de Microservicios con Docker y Node.js',
            tipo: 'FACULTAD INGENIERÍA',
            fecha: '05 SEP',
            horaLugar: '14:00 · Laboratorio de Sistemas',
            estado: 'EN_CURSO',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  return { eventos, loading, error };
};

export default useEventos;