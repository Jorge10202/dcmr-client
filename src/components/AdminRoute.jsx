import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from './Toast.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { show } = useToast();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    show('Inicia sesión para continuar', { type: 'warning' });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user.role ?? user.rol; 
  if (role !== 'admin') {
    show('No tienes permiso para ver esta página', { type: 'error' });
    return <Navigate to="/" replace />;
  }

  return children;
}
