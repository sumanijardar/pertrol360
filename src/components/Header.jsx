import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconBell, IconAlertTriangle } from './common/Icons';
import { getCurrentUser } from '../services/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

        <nav aria-label="breadcrumb" className="flex items-center text-xs">
          <ol className="flex items-center gap-1.5 list-none m-0 p-0">
            <li className="text-muted-foreground font-medium text-[11px] tracking-wide uppercase">
              Ahmedabad Police
            </li>
            <li className="text-muted-foreground/60 text-[11px]">/</li>
            <li className="text-foreground font-semibold text-xs tracking-tight">
              {getPageTitle(location.pathname)}
            </li>
          </ol>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 ms-auto">
        {/* Jurisdiction Station Filter */}
        <div className="flex items-center rounded-md border border-border bg-background shadow-2xs h-7 overflow-hidden">
          <span className="bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground border-e border-border select-none">
            Station
          </span>
          <select
            value={currentStation}
            onChange={(e) => onSelectStation && onSelectStation(e.target.value)}
            className="h-full bg-transparent px-2 text-xs font-medium text-foreground outline-none border-0 cursor-pointer"
          >
            <option value="ALL">All Stations (Citywide)</option>
            <option value="Navrangpura">Navrangpura</option>
            <option value="Vastrapur">Vastrapur</option>
            <option value="Satellite">Satellite</option>
            <option value="SG Highway">SG Highway</option>
            <option value="Ellis Bridge">Ellis Bridge</option>
          </select>
        </div>

        {/* Live Clock Badge */}
        <Badge
          variant="outline"
          className="font-mono text-[11px] font-semibold h-7 px-2.5 gap-1.5 bg-background shadow-2xs text-foreground"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentTime}</span>
        </Badge>

        {/* Officer Command Profile */}
        <div
          className="flex items-center gap-2 ps-2.5 pe-1.5 py-1 rounded-full border border-border bg-accent/40 hover:bg-accent/70 transition-colors shadow-2xs cursor-default"
          title={`Active Officer: ${userRank} ${userName} ${userBadge} ${userStation ? `• Station: ${userStation}` : ''}`}
        >
          <div className="hidden md:flex flex-col text-end leading-tight">
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-semibold text-foreground text-xs tracking-tight">
                {userName}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active On Duty" />
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">
                {userRank}
              </span>
              {userBadge && (
                <span className="text-[9.5px] text-muted-foreground/80 font-mono">
                  {userBadge}
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[11px] bg-primary shadow-xs border border-background">
              {initials}
            </div>
            <span
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background"
              title="Surveillance Session Active"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
