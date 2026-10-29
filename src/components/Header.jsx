import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconBell, IconAlertTriangle, IconChevronDown, IconLogout, IconShieldAlert } from './common/Icons';
import { getCurrentUser, logout } from '../services/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Header({ onToggleSidebar, isSidebarCollapsed, onSelectStation, currentStation = 'ALL' }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAdminDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsAdminDropdownOpen(false);
  }, [location.pathname]);

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
      case '/police-master':
        return 'Police Stations & Units';
      case '/vehicle-cameras':
        return 'Fleet Camera Master';
      case '/patrolling-sessions':
        return 'Patrol Logs & Telemetry';
      case '/patrol-shifts':
        return 'Shift Rosters';
      case '/duty-assignment':
        return 'Duty Allocation';
      case '/alerts-feed':
        return 'AI Threat & Anomaly Alerts';
      case '/anpr-hits':
        return 'ANPR Hits Log';
      case '/heatmaps':
        return 'Incident Density Heatmaps';
      case '/geofences':
        return 'Jurisdictional Geofences';
      case '/sos-events':
        return 'SOS Emergency Broadcasts';
      case '/reports/patrol-compliance':
        return 'Compliance Analytics';
      default:
        return 'Tactical Command Hub';
    }
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="w-full bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-3 sticky top-0 z-30 transition-colors"
      style={{ height: '48px' }}
    >
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon-sm"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="border border-border/70 hover:bg-accent text-foreground"
        >
          <div className="flex flex-col gap-[3px] items-center justify-center">
            <span className="w-3.5 h-[1.5px] bg-foreground rounded-full" />
            <span className="w-3.5 h-[1.5px] bg-foreground rounded-full" />
            <span className="w-3.5 h-[1.5px] bg-foreground rounded-full" />
          </div>
        </Button>

        <nav aria-label="breadcrumb" className="flex items-center text-xs truncate">
          <ol className="flex items-center gap-1.5 list-none m-0 p-0 truncate">
            <li className="hidden sm:inline text-muted-foreground font-medium text-[11px] tracking-wide uppercase truncate">
              Ahmedabad Police
            </li>
            <li className="hidden sm:inline text-muted-foreground/60 text-[11px]">/</li>
            <li className="text-foreground font-semibold text-xs tracking-tight truncate">
              {getPageTitle(location.pathname)}
            </li>
          </ol>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 ms-auto">
        {/* Jurisdiction Station Filter */}
        {/* <div
          className="hidden sm:inline-flex items-center overflow-hidden"
          style={{
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #e4e4e7',
            backgroundColor: '#ffffff',
          }}
        >
          <span
            className="px-2.5 text-[11px] font-semibold select-none flex items-center h-full"
            style={{
              backgroundColor: '#f4f4f5',
              borderRight: '1px solid #e4e4e7',
              color: '#71717a',
            }}
          >
            Station
          </span>
          <select
            value={currentStation}
            onChange={(e) => onSelectStation && onSelectStation(e.target.value)}
            className="bg-transparent px-2.5 text-xs font-medium outline-none cursor-pointer"
            style={{
              height: '100%',
              border: 'none',
              outline: 'none',
              color: '#18181b',
              fontSize: '12px',
              backgroundColor: 'transparent',
            }}
          >
            <option value="ALL">All Stations (Citywide)</option>
            <option value="Navrangpura">Navrangpura</option>
            <option value="Vastrapur">Vastrapur</option>
            <option value="Satellite">Satellite</option>
            <option value="SG Highway">SG Highway</option>
            <option value="Ellis Bridge">Ellis Bridge</option>
          </select>
        </div> */}

        {/* Live Clock Badge */}
        <div
          className="hidden md:inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold px-3 select-none"
          style={{
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #e4e4e7',
            backgroundColor: '#ffffff',
            color: '#18181b',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
            }}
            className="animate-pulse"
          />
          <span>{currentTime}</span>
        </div>

        {/* Admin Command Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsAdminDropdownOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '34px',
              padding: '2px 4px 2px 12px',
              borderRadius: '9999px',
              border: '1px solid #e4e4e7',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f4f4f5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
            title="Click to view Admin Details"
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#18181b',
                letterSpacing: '-0.01em',
              }}
            >
              Admin
            </span>
            <IconChevronDown
              size={13}
              style={{
                color: '#71717a',
                transform: isAdminDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />

            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '1.5px solid #ffffff',
                }}
                title="Active On Duty"
              />
            </div>
          </button>

          {/* Admin Details Dropdown Card */}
          {isAdminDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '300px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
                padding: '14px',
                zIndex: 1050,
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              {/* Profile Header Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f4f4f5',
                  border: '1px solid #e4e4e7',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#18181b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {userName}
                    </span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        flexShrink: 0,
                      }}
                      title="On Duty"
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#71717a',
                      fontWeight: 500,
                      marginTop: '1px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userRank}
                  </div>
                  {userBadge && (
                    <div style={{ marginTop: '3px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: '#52525b',
                          backgroundColor: '#e4e4e7',
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        Badge: {userBadge}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Rows */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '0 4px',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: '#71717a', fontWeight: 500 }}>Jurisdiction:</span>
                  <span style={{ color: '#18181b', fontWeight: 600 }}>
                    {userStation || 'Navrangpura Police Station'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: '#71717a', fontWeight: 500 }}>Session Status:</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#059669',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                      }}
                    />
                    Active • On Duty
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: '#71717a', fontWeight: 500 }}>Role Clearance:</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: '#f4f4f5',
                      border: '1px solid #e4e4e7',
                      color: '#18181b',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {user?.role === 'admin' ? 'SUPER_ADMIN' : 'COMMANDER'}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#e4e4e7',
                  margin: '0 0 12px 0',
                }}
              />

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAdminDropdownOpen(false);
                  logout();
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  sessionStorage.clear();
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '1px solid #dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
              >
                <IconLogout size={13} style={{ color: '#ffffff' }} />
                <span>Logout from Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
