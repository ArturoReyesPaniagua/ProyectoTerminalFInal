// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './layout/Layout';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redireccionar a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar si el email está verificado (opcional)
  // if (!user?.emailVerified) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  return (
    <Layout>
      {children}
    </Layout>
  );
};

export default ProtectedRoute;
