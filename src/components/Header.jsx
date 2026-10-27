import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { IconBell, IconAlertTriangle } from './common/Icons';

export default function Header({ onToggleSidebar, isSidebarCollapsed, onSelectStation, currentStation = 'ALL' }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    Swal.fire({
      title: 'Sign Out of Command Session?',
      text: 'Are you sure you want to end your active surveillance session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('patrol360_authenticated');
        localStorage.removeItem('patrol360_user');
        navigate('/login');
      }
    });
  };

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
        <div className="dropdown position-relative">
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
        </div>

        {/* Officer Profile & Sign Out Button */}
        <div className="d-flex align-items-center gap-2 ps-2 border-start">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold shadow-sm"
            style={{ width: '32px', height: '32px', fontSize: '11.5px', cursor: 'default' }}
            title="Active Officer: ACP Vikram Solanki (Sector Commander)"
          >
            VS
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-outline-danger btn-sm p-1 d-flex align-items-center justify-content-center"
            title="Sign Out of Command Session"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
