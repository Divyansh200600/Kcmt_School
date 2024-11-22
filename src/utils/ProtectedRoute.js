import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element: Component, allowedRoles, ...rest }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If user is not logged in, redirect to login
  if (!user) return <Navigate to="/SIS-login" />;

  // If user's role is not allowed, redirect to their dashboard
  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}-dashboard`} />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
