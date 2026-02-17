import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { isAuthenticated } from '../../lib/auth';
import { useCurrentUser } from '../../hooks/useUsers';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoading } = useCurrentUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
