// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // ou un spinner
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
