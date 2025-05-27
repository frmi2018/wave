// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PlateSpinner from "../Spinner/Spinner";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PlateSpinner/>
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
