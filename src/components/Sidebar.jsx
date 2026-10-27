import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_SECTIONS } from '../routes/routesConfig';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className="bg-white border-end d-flex flex-column shadow-sm flex-shrink-0"
      style={{
        width: isCollapsed ? '64px' : '230px',
        minWidth: isCollapsed ? '64px' : '230px',
        maxWidth: isCollapsed ? '64px' : '230px',
        height: '100%',
        maxHeight: '100%',
        transition: 'all 0.2s ease',
        zIndex: 1030,
        overflow: 'hidden'
      }}
    >
      {/* Brand Header */}
      <div
        className="d-flex align-items-center border-bottom bg-white"
        style={{
          height: '56px',
          padding: isCollapsed ? '0 12px' : '0 16px',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          {/* Official Shield */}
          <div
            className="rounded bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '32px', height: '32px', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="d-flex flex-column">
              <span className="fw-bold text-dark fs-6" style={{ letterSpacing: '0.02em', lineHeight: 1.1 }}>
                PATROL<span className="text-primary">360</span>
              </span>
              <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.04em' }}>
                Police Command
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="btn btn-light btn-sm border d-flex align-items-center justify-content-center text-secondary p-0"
            style={{ width: '24px', height: '24px', fontSize: '11px' }}
          >
            ◀
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="d-flex justify-content-center py-1 border-bottom">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="btn btn-light btn-sm border d-flex align-items-center justify-content-center text-secondary p-0"
            style={{ width: '22px', height: '22px', fontSize: '10px' }}
          >
            ▶
          </button>
        </div>
      )}

      {/* Nav Items (Dynamically loaded from Centralized routesConfig) */}
      <div
        className="flex-grow-1 d-flex flex-column gap-3"
        style={{
          padding: isCollapsed ? '10px 6px' : '12px 10px',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none'
        }}
      >
        {NAV_SECTIONS.map((sec, secIdx) => (
          <div key={secIdx} className="d-flex flex-column gap-1">
            {!isCollapsed && (
              <div className="small fw-bold text-muted text-uppercase px-2 pb-1" style={{ fontSize: '10px', letterSpacing: '0.06em' }}>
                {sec.title}
              </div>
            )}
            {sec.items.map(item => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={`btn btn-sm d-flex align-items-center w-100 text-start border-0 ${
                    isActive
                      ? 'bg-primary-subtle text-primary fw-bold shadow-sm'
                      : 'text-dark fw-semibold'
                  }`}
                  style={{
                    padding: isCollapsed ? '8px 0' : '7px 10px',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className={isActive ? 'text-primary' : 'text-secondary'}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-nowrap">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && (item.badge || item.count) && (
                    <span className={`badge ${item.badgeClass || 'bg-light text-dark border'} font-mono fw-bold`} style={{ fontSize: '9px' }}>
                      {item.badge || item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Officer Status Footer */}
      <div
        className="border-top bg-light d-flex align-items-center gap-2"
        style={{
          padding: isCollapsed ? '10px 6px' : '10px 12px',
          justifyContent: isCollapsed ? 'center' : 'flex-start'
        }}
      >
        <div
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
          style={{ width: '28px', height: '28px', fontSize: '11px', flexShrink: 0 }}
        >
          VS
        </div>

        {!isCollapsed && (
          <div className="d-flex flex-column">
            <span className="small fw-bold text-dark text-nowrap" style={{ fontSize: '11px' }}>
              Insp. V. Solanki
            </span>
            <span className="small text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: '9px' }}>
              <span className="badge bg-success p-1 rounded-circle"></span>
              Navrangpura • On Duty
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
