import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrganizationsPage from './pages/OrganizationsPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import MissionsPage from './pages/MissionsPage';
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute>
                  <OrganizationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations/:id"
              element={
                <ProtectedRoute>
                  <OrganizationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions"
              element={
                <ProtectedRoute>
                  <MissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
