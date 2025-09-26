import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  const setAuth = ({ token, user }) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    if (user) localStorage.setItem('user', JSON.stringify(user));
    setUser(user || null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (token && userStr) setUser(JSON.parse(userStr));
    setLoading(false);
  }, []);

  const login = async (correo, contraseña) => {
    const { data } = await api.post('/auth/login', { correo, contraseña });
    setAuth({ token: data.token, user: data.user });
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAuth({ token: data.token, user: data.user });
    return data.user;
  };

  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,         
    login,
    register,
    logout,
    isAdmin: () => (user?.rol || user?.role) === 'admin',
    saveProfile: async (payload) => {
    const { data } = await api.put('/auth/me', payload);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

