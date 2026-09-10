import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('uajs_token') || null);

  useEffect(() => {
    if (token) {
      // Decode JWT payload or restore session
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (e) {
        console.error('Error al decodificar token JWT:', e);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('uajs_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('uajs_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, rol: user?.rol_nombre }}>
      {children}
    </AuthContext.Provider>
  );
};
