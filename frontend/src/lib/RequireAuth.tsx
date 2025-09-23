import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div>Comprobando sesión...</div>;
  if (!user) return <Navigate to="/auth/login" state={{ from: loc }} replace />;
  return children;
};

export default RequireAuth;
