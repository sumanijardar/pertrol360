import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAllRoutes } from './routesConfig';
import { isAuthenticated } from '../services/api';

/**
 * Route Guard: Only accessible when officer/admin is authenticated
 */
function ProtectedRoute({ children }) {
  const authed = isAuthenticated();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// 404 Fallback Page
function NotFoundPage() {
  const authed = isAuthenticated();

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center p-5"
      style={{ minHeight: '60vh' }}
    >
      <div className="text-center">
        <h1 className="display-4 fw-bold text-dark font-mono">404</h1>
        <h5 className="fw-bold text-secondary mb-3">Page Not Found</h5>
        <p className="text-muted small mb-4">
          The requested command route does not exist or has been decommissioned.
        </p>
        <a href={authed ? '/dashboard' : '/login'} className="btn btn-primary btn-sm px-3 py-2 fw-bold">
          {authed ? 'Return to Dashboard' : 'Go to Login'}
        </a>
      </div>
    </div>
  );
}

export default function AppRoutes({ stationFilter }) {
  const routes = getAllRoutes();

  return (
    <Routes>
      {/* Root redirect: ALWAYS show /login first when project starts or is opened */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Dynamically generated routes */}
      {routes.map((r) => {
        const Component = r.element;
        const isLogin = r.path === '/login';

        return (
          <Route
            key={r.path}
            path={r.path}
            element={
              isLogin ? (
                <Component />
              ) : (
                <ProtectedRoute>
                  <Component stationFilter={stationFilter} />
                </ProtectedRoute>
              )
            }
          />
        );
      })}

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
