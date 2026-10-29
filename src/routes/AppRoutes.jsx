import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAllRoutes } from './routesConfig';
import { isAuthenticated, getUserRole } from '../services/api';

/**
 * Root Redirector: Sends authenticated officers to /officer/cockpit,
 * authenticated admins to /dashboard, and unauthenticated to /login
 */
function RootRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = (getUserRole() || 'user').toLowerCase();
  if (role === 'officer' || role === 'user') {
    return <Navigate to="/officer/cockpit" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

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
  const role = (getUserRole() || 'user').toLowerCase();
  const homePath = (role === 'officer' || role === 'user') ? '/officer/cockpit' : '/dashboard';

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
        <a href={authed ? homePath : '/login'} className="btn btn-primary btn-sm px-3 py-2 fw-bold">
          {authed ? 'Return to Cockpit' : 'Go to Login'}
        </a>
      </div>
    </div>
  );
}

export default function AppRoutes({ stationFilter }) {
  const routes = getAllRoutes();

  return (
    <Routes>
      {/* Root redirect: Role-aware navigation */}
      <Route path="/" element={<RootRedirect />} />

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
