import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconBell, IconAlertTriangle } from './common/Icons';
import { getCurrentUser } from '../services/api';

export default function Header({ onToggleSidebar, isSidebarCollapsed, onSelectStation, currentStation = 'ALL' }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const userName = user?.name || user?.officer_name || user?.email?.split('@')[0] || 'Admin Officer';
  const userRank = user?.rank || (user?.role === 'admin' ? 'Super Admin' : 'Sector Commander');
  const userStation = user?.police_station || '';
  const userBadge = user?.badge_number ? `[${user.badge_number}]` : '';

  // Generate 2-letter initials dynamically
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'AO';

  // Dynamic breadcrumb label from route
  const getPageTitle = (path) => {
    switch (path) {
      case '/vehicles':
        return 'Vehicle Master Registry';
      case '/anpr-watchlist':
        return 'ANPR Watchlist';
      default:
        return 'Fleet Command';
    }
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const alerts = [
    { id: 1, title: 'STOLEN VEHICLE DETECTED', desc: 'Hyundai Creta (GJ01AB1234) @ Navrangpura Cross Roads', time: '2m ago', level: 'CRITICAL' },
    { id: 2, title: 'WEAPON THREAT DETECTED', desc: 'Handgun identified by PATROL_VAN_01 (Conf 94.8%)', time: '4m ago', level: 'CRITICAL' },
    { id: 3, title: 'TRANSFORMER FIRE HAZARD', desc: 'Active flame identified @ Satellite Substation', time: '11m ago', level: 'WARN' }
  ];

  return (
    <header className="navbar navbar-expand bg-white border-bottom shadow-sm px-3 sticky-top" style={{ height: '56px', zIndex: 1020 }}>
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="d-flex align-items-center gap-2">
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="btn btn-light btn-sm border d-flex flex-column justify-content-center align-items-center p-1"
          style={{ width: '30px', height: '30px' }}
        >
          <span className="bg-dark" style={{ width: '14px', height: '2px', margin: '1px 0' }} />
          <span className="bg-dark" style={{ width: '14px', height: '2px', margin: '1px 0' }} />
          <span className="bg-dark" style={{ width: '14px', height: '2px', margin: '1px 0' }} />
        </button>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>Ahmedabad Police</li>
            <li className="breadcrumb-item active text-primary fw-bold" style={{ fontSize: '12px' }}>
              {getPageTitle(location.pathname)}
            </li>
          </ol>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-2 ms-auto">
        {/* Jurisdiction Filter */}
        <div className="input-group input-group-sm shadow-sm" style={{ width: 'auto', height: '32px' }}>
          <span className="input-group-text bg-light small fw-bold text-secondary border-end-0 py-0 px-2" style={{ fontSize: '11px' }}>
            Station:
          </span>
          <select
            value={currentStation}
            onChange={(e) => onSelectStation && onSelectStation(e.target.value)}
            className="form-select form-select-sm fw-bold text-dark border-start-0 py-0"
            style={{ fontSize: '11px', width: 'auto', height: '32px' }}
          >
            <option value="ALL">All Stations (Citywide)</option>
            <option value="Navrangpura">Navrangpura</option>
            <option value="Vastrapur">Vastrapur</option>
            <option value="Satellite">Satellite</option>
            <option value="SG Highway">SG Highway</option>
            <option value="Ellis Bridge">Ellis Bridge</option>
          </select>
        </div>

        {/* Time Badge */}
        <div
          className="badge bg-white text-dark border shadow-sm d-flex align-items-center gap-2 px-2.5 font-mono fw-bold"
          style={{ height: '32px', fontSize: '11px' }}
        >
          <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '6px', height: '6px' }} />
          <span>{currentTime}</span>
        </div>

        {/* Notifications Dropdown */}
        {/* <div className="dropdown position-relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0);
            }}
            className="btn btn-light btn-sm border shadow-sm position-relative d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
          >
            <IconBell size={16} />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="dropdown-menu show shadow-lg border-0 p-2 position-absolute end-0 mt-2"
              style={{ width: '320px', zIndex: 1050 }}
            >
              <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                <span className="small fw-bold text-dark">Active Threat Notifications</span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none small"
                  onClick={() => setShowNotifications(false)}
                >
                  Clear all
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-2 rounded border small ${a.level === 'CRITICAL' ? 'bg-danger-subtle border-danger-subtle' : 'bg-warning-subtle border-warning-subtle'}`}
                  >
                    <div className="d-flex justify-content-between fw-bold mb-1" style={{ fontSize: '10px' }}>
                      <span className={a.level === 'CRITICAL' ? 'text-danger' : 'text-warning'}>{a.title}</span>
                      <span className="text-muted">{a.time}</span>
                    </div>
                    <div className="text-dark small" style={{ fontSize: '11px' }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> */}

        {/* Highlighted Officer Command Profile */}
        <div
          className="d-flex align-items-center gap-2 ps-2 pe-2 py-1 rounded-pill border shadow-xs"
          style={{
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
            borderColor: '#e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            cursor: 'default'
          }}
          title={`Active Officer: ${userRank} ${userName} ${userBadge} ${userStation ? `• Station: ${userStation}` : ''}`}
        >
          <div className="d-none d-md-flex flex-column text-end ps-1" style={{ lineHeight: 1.15 }}>
            <div className="d-flex align-items-center justify-content-end gap-1">
              <span className="fw-bold text-dark" style={{ fontSize: '12px', letterSpacing: '-0.2px' }}>
                {userName}
              </span>
              <span
                className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-1.5 py-0"
                style={{ fontSize: '9px', fontWeight: 600 }}
              >
                On Duty
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-end gap-1">
              <span className="text-primary fw-semibold" style={{ fontSize: '10px' }}>
                {userRank}
              </span>
              {userBadge && (
                <span className="text-muted font-mono" style={{ fontSize: '9.5px' }}>
                  {userBadge}
                </span>
              )}
            </div>
          </div>

          <div className="position-relative">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: '34px',
                height: '34px',
                fontSize: '12px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 6px rgba(30, 64, 175, 0.25)'
              }}
            >
              {initials}
            </div>
            <span
              className="position-absolute rounded-circle bg-success"
              style={{
                width: '9px',
                height: '9px',
                bottom: '0px',
                right: '0px',
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.4)'
              }}
              title="Surveillance Session Active"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
