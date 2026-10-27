import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getAllRoutes } from './routesConfig';

// 404 Fallback Page
function NotFoundPage() {
  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <h1 className="display-4 fw-bold text-dark font-mono">404</h1>
        <h5 className="fw-bold text-secondary mb-3">Page Not Found</h5>
        <p className="text-muted small mb-4">
          The requested command route does not exist or has been decommissioned.
        </p>
        <a href="/dashboard" className="btn btn-primary btn-sm px-3 py-2 fw-bold">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function AppRoutes({ stationFilter }) {
  const routes = getAllRoutes();

  return (
    <Routes>
      {/* Root redirect to /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dynamically generated routes from routesConfig */}
      {routes.map(r => {
        const Component = r.element;
        return (
          <Route
            key={r.path}
            path={r.path}
            element={<Component stationFilter={stationFilter} />}
          />
        );
      })}

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
