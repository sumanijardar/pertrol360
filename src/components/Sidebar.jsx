import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_SECTIONS } from '../routes/routesConfig';
import {
  IconChevronDown,
  IconChevronRight,
  IconSettings
} from './common/Icons';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Admin Master Menu collapsible state (open by default or when on an admin route)
  const isCurrentlyInAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/vehicles' ||
    location.pathname === '/police-master' ||
    location.pathname === '/vehicle-cameras';

  const [isAdminOpen, setIsAdminOpen] = useState(true);

  useEffect(() => {
    if (isCurrentlyInAdmin) {
      setIsAdminOpen(true);
    }
  }, [location.pathname]);

  return (
    <aside
      className="bg-white border-end d-flex flex-column shadow-sm flex-shrink-0"
      style={{
        width: isCollapsed ? '64px' : '240px',
        minWidth: isCollapsed ? '64px' : '240px',
        maxWidth: isCollapsed ? '64px' : '240px',
        height: '100%',
        maxHeight: '100%',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 1030,
        overflow: 'hidden'
      }}
    >
      {/* 1. Official Brand Header */}
      <div
        className="d-flex align-items-center border-bottom bg-white"
        style={{
          height: '56px',
          padding: isCollapsed ? '0 12px' : '0 16px',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        <div
          className="d-flex align-items-center gap-2"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
          title="Patrol360 Command Center"
        >
          {/* Police Shield Insignia */}
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
              <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                Police Command Hub
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
        <div className="d-flex justify-content-center py-1.5 border-bottom bg-light">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="btn btn-white btn-sm border d-flex align-items-center justify-content-center text-secondary p-0"
            style={{ width: '22px', height: '22px', fontSize: '10px' }}
          >
            ▶
          </button>
        </div>
      )}

      {/* 2. Navigation Items (Strictly Ordered as Requested) */}
      <div
        className="flex-grow-1 d-flex flex-column gap-3"
        style={{
          padding: isCollapsed ? '12px 6px' : '14px 10px',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none'
        }}
      >
        {NAV_SECTIONS.map((sec, secIdx) => {
          // ========================================================
          // SECTION: Admin (Master Menu) - Top Priority
          // ========================================================
          if (sec.isMasterMenu) {
            return (
              <div key={secIdx} className="d-flex flex-column gap-1">
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    className="btn btn-sm d-flex align-items-center justify-content-between w-100 text-start border-0 text-muted px-2 py-2 fw-bold text-uppercase"
                    style={{ fontSize: '11px', letterSpacing: '0.05em' }}
                  >
                    <div className="d-flex align-items-center text-primary" style={{ gap: '12px' }}>
                      <span className="d-inline-flex align-items-center text-primary" style={{ flexShrink: 0 }}>
                        {sec.icon || <IconSettings size={18} />}
                      </span>
                      <span className="text-dark fw-bold" style={{ fontSize: '11.5px', letterSpacing: '0.06em' }}>
                        {sec.title}
                      </span>
                    </div>
                    <span className="text-secondary d-flex align-items-center">
                      {isAdminOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </span>
                  </button>
                ) : (
                  <div
                    className="small fw-bold text-muted text-center py-1 border-bottom my-1 font-mono"
                    title="Admin Master Menu"
                    style={{ fontSize: '8.5px' }}
                  >
                    ADMIN
                  </div>
                )}

                {/* Sub-items list with sleek tree guide line */}
                {(!isCollapsed ? isAdminOpen : true) && (
                  <div
                    className={`d-flex flex-column gap-1 ${
                      !isCollapsed ? 'ms-2 ps-2 border-start border-2 border-secondary-subtle' : ''
                    }`}
                  >
                    {sec.items.map((item) => {
                      const isActive =
                        location.pathname === item.path ||
                        (item.path === '/admin/vehicles' && location.pathname === '/vehicles') ||
                        (item.path === '/admin/users' && location.pathname === '/police-master') ||
                        (item.path === '/admin/camera-mapping' && location.pathname === '/vehicle-cameras');

                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          title={isCollapsed ? `${item.label} ${item.sublabel ? `(${item.sublabel})` : ''}` : undefined}
                          className={`btn btn-sm d-flex align-items-center w-100 text-start border-0 ${
                            isActive
                              ? 'bg-primary-subtle text-primary fw-bold shadow-xs'
                              : 'text-secondary-emphasis fw-semibold'
                          }`}
                          style={{
                            padding: isCollapsed ? '8px 0' : '6px 10px',
                            justifyContent: isCollapsed ? 'center' : 'space-between',
                            fontSize: '12px',
                            borderRadius: '5px',
                            borderLeft: isActive ? '3px solid #0d6efd' : '3px solid transparent',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 text-truncate">
                            <span className={isActive ? 'text-primary' : 'text-secondary'}>
                              {item.icon}
                            </span>
                            {!isCollapsed && (
                              <span className="text-truncate">{item.label}</span>
                            )}
                          </div>

                          {!isCollapsed && item.sublabel && (
                            <span
                              className="badge bg-light text-secondary border font-mono d-none d-xl-inline"
                              style={{ fontSize: '8.5px', padding: '2px 4px' }}
                              title={item.sublabel}
                            >
                              4-CAM
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // ========================================================
          // SECTIONS: Operations (Dashboard, Patrolling, Weapon Detection) & Reports
          // ========================================================
          return (
            <div key={secIdx} className="d-flex flex-column gap-1">
              {!isCollapsed && (
                <div
                  className="small fw-bold text-muted text-uppercase px-2 pb-0.5"
                  style={{ fontSize: '10px', letterSpacing: '0.06em' }}
                >
                  {sec.title}
                </div>
              )}

              {sec.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/dashboard' && location.pathname === '/') ||
                  (item.path === '/patrolling' && location.pathname.startsWith('/patrolling')) ||
                  (item.path === '/weapon-detection' && location.pathname === '/reports/weapons-detection');

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`btn btn-sm d-flex align-items-center w-100 text-start border-0 ${
                      isActive
                        ? 'bg-primary-subtle text-primary fw-bold shadow-xs'
                        : 'text-dark fw-semibold'
                    }`}
                    style={{
                      padding: isCollapsed ? '8px 0' : '7.5px 10px',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      fontSize: '12.5px',
                      borderRadius: '5px',
                      borderLeft: isActive ? '3.5px solid #0d6efd' : '3.5px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <span className={isActive ? 'text-primary' : 'text-secondary'}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`badge ${item.badgeClass || 'bg-light text-dark border'} font-mono ms-auto`}
                        style={{ fontSize: '9px', padding: '3px 6px', letterSpacing: '0.02em' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 3. Officer Status Footer */}
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
          <div className="d-flex flex-column text-truncate">
            <span className="small fw-bold text-dark text-truncate" style={{ fontSize: '11.5px' }}>
              Insp. V. Solanki
            </span>
            <span className="small text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: '9.5px' }}>
              <span className="badge bg-success p-1 rounded-circle"></span>
              Navrangpura • On Duty
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
