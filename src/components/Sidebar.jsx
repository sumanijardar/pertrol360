import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_SECTIONS } from '../routes/routesConfig';
import {
  IconChevronDown,
  IconChevronRight,
  IconSettings,
  IconLogout
} from './common/Icons';
import { logout } from '../services/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
      className="bg-sidebar text-sidebar-foreground border-e border-sidebar-border flex flex-col flex-shrink-0 transition-all duration-200 select-none"
      style={{
        width: isCollapsed ? '60px' : '230px',
        minWidth: isCollapsed ? '60px' : '230px',
        maxWidth: isCollapsed ? '60px' : '230px',
        height: '100%',
        maxHeight: '100%',
        zIndex: 1030,
        overflow: 'hidden'
      }}
    >
      {/* 1. Official Brand Header */}
      <div
        className="flex items-center border-b border-sidebar-border bg-sidebar/80 backdrop-blur-xs transition-colors"
        style={{
          height: '48px',
          padding: isCollapsed ? '0 10px' : '0 12px',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
          title="Patrol360 Command Center"
        >
          {/* Police Shield Insignia */}
          <div
            className="rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs flex-shrink-0"
            style={{ width: '28px', height: '28px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-foreground text-xs tracking-tight">
                PATROL<span className="text-primary opacity-80">360</span>
              </span>
              <span className="text-muted-foreground font-semibold uppercase text-[8.5px] tracking-wider mt-0.5">
                Police Command
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <Button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
          >
            ◀
          </Button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-1 border-b border-sidebar-border bg-muted/30">
          <Button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
          >
            ▶
          </Button>
        </div>
      )}

      {/* 2. Navigation Items (Mira High Density) */}
      <div
        className="flex-grow flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden"
        style={{
          padding: isCollapsed ? '10px 6px' : '10px 8px',
          scrollbarWidth: 'none'
        }}
      >
        {NAV_SECTIONS.map((sec, secIdx) => {
          // ========================================================
          // SECTION: Admin (Master Menu)
          // ========================================================
          if (sec.isMasterMenu) {
            return (
              <div key={secIdx} className="flex flex-col gap-0.5">
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    className="flex items-center justify-between w-full text-start border-0 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 rounded-md px-2 py-1.5 font-semibold text-[10.5px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="inline-flex items-center text-muted-foreground flex-shrink-0">
                        {sec.icon || <IconSettings size={15} />}
                      </span>
                      <span className="font-semibold text-[11px] tracking-tight">
                        {sec.title}
                      </span>
                    </div>
                    <span className="text-muted-foreground flex items-center">
                      {isAdminOpen ? <IconChevronDown size={13} /> : <IconChevronRight size={13} />}
                    </span>
                  </button>
                ) : (
                  <div
                    className="font-bold text-muted-foreground text-center py-1 border-b border-border/40 my-0.5 font-mono text-[8px]"
                    title="Admin Master Menu"
                  >
                    ADM
                  </div>
                )}

                {/* Sub-items list */}
                {(!isCollapsed ? isAdminOpen : true) && (
                  <div
                    className={`flex flex-col gap-0.5 ${
                      !isCollapsed ? 'ms-1.5 ps-2 border-s border-border/60' : ''
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
                          className={`flex items-center w-full text-start rounded-md border-0 transition-all cursor-pointer text-xs ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs border-s-2 border-primary'
                              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground font-medium'
                          }`}
                          style={{
                            padding: isCollapsed ? '6px 0' : '5px 8px',
                            justifyContent: isCollapsed ? 'center' : 'space-between',
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                              {item.icon}
                            </span>
                            {!isCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </div>

                          {!isCollapsed && item.sublabel && (
                            <span
                              className="text-[9px] font-mono px-1 py-0.2 bg-muted text-muted-foreground rounded border border-border/50"
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
          // SECTIONS: Operations & Reports
          // ========================================================
          return (
            <div key={secIdx} className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-0.5">
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
                    className={`flex items-center w-full text-start rounded-md border-0 transition-all cursor-pointer text-xs ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs border-s-2 border-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground font-medium'
                    }`}
                    style={{
                      padding: isCollapsed ? '6px 0' : '6px 8px',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60 ms-auto font-medium"
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

      {/* 3. Logout Footer */}
      <div
        className="border-t border-sidebar-border bg-sidebar/50 p-2 flex items-center mt-auto"
        style={{
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        <button
          type="button"
          onClick={() => {
            logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/login');
          }}
          title="Logout"
          className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md border border-border/60 hover:border-destructive/30 py-1 transition-all cursor-pointer"
        >
          <IconLogout size={14} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
