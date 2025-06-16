import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to login page
    // Pass the current location to redirect back after login (optional)
    // state={{ from: location }} replace (if using useLocation)
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
