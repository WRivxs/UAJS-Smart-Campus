import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('uajs_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('uajs_user');
      if (savedUser) return JSON.parse(savedUser);
      const savedToken = localStorage.getItem('uajs_token');
      if (savedToken && savedToken.includes('.')) {
        return JSON.parse(atob(savedToken.split('.')[1]));
      }
    } catch {
      return null;
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(false);

  const login = (newToken, userData) => {
    localStorage.setItem('uajs_token', newToken);

    let resolvedUser = userData;
    if (!resolvedUser && newToken && newToken.includes('.')) {
      try {
        resolvedUser = JSON.parse(atob(newToken.split('.')[1]));
      } catch (e) {
        console.error('Error al decodificar token JWT en login:', e);
      }
    }

    if (resolvedUser) {
      localStorage.setItem('uajs_user', JSON.stringify(resolvedUser));
      setUser(resolvedUser);
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('uajs_token');
    localStorage.removeItem('uajs_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, rol: user?.rol_nombre, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
