import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('uajs_token');
      const reqHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : null
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la petición');

      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { request, loading, error };
};
