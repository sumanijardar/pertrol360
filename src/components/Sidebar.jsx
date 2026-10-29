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

export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  isMobile = false,
  onToggleCollapse,
  onCloseMobile
}) {
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

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside
      className={`bg-[#09090b] text-[#e4e4e7] border-e border-[#27272a] flex flex-col select-none transition-all duration-200 ${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-[240px] shadow-2xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`
          : 'h-full flex-shrink-0'
        }`}
      style={{
        width: !isMobile ? (isCollapsed ? '60px' : '230px') : '240px',
        minWidth: !isMobile ? (isCollapsed ? '60px' : '230px') : '240px',
        maxWidth: !isMobile ? (isCollapsed ? '60px' : '230px') : '240px',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      {/* 1. Official Minimalist Dark Brand Header */}
      <div
        className="flex items-center border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-xs transition-colors flex-shrink-0"
        style={{
          height: '48px',
          padding: isCollapsed ? '0 10px' : '0 12px',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => handleNavigate('/dashboard')}
          title="Patrol360 Command Center"
        >
          {/* Minimalist Dark Shield Badge */}
          <div
            className="rounded-md bg-[#18181b] border border-[#27272a] text-white flex items-center justify-center shadow-xs flex-shrink-0"
            style={{ width: '28px', height: '28px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-white text-xs tracking-tight">
                PATROL<span className="text-[#a1a1aa]">360</span>
              </span>
              <span className="text-[#71717a] font-medium uppercase text-[8.5px] tracking-wider mt-0.5">
                Command Hub
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button or Mobile Close Button */}
        {!isCollapsed && !isMobile && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="h-6 w-6 flex items-center justify-center rounded text-[#71717a] hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer border border-transparent hover:border-[#27272a]"
          >
            <span className="text-[10px]">◀</span>
          </button>
        )}

        {isMobile && (
          <button
            onClick={onCloseMobile}
            title="Close Sidebar"
            className="h-6 w-6 flex items-center justify-center rounded text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Desktop Expand Button when collapsed */}
      {isCollapsed && !isMobile && (
        <div className="flex justify-center py-1 border-b border-[#27272a] bg-[#121214]">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="h-5 w-5 flex items-center justify-center rounded text-[#71717a] hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer text-[9px]"
          >
            ▶
          </button>
        </div>
      )}

      {/* 2. Navigation Items (Minimalist Dark Neutral Palette) */}
      <div
        className="flex-grow flex flex-col gap-3 overflow-y-auto overflow-x-hidden"
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
                    className="flex items-center justify-between w-full text-start border-0 text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#18181b]/80 rounded-md px-2 py-1.5 font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[#71717a] flex-shrink-0">
                        {sec.icon || <IconSettings size={15} />}
                      </span>
                      <span className="font-semibold text-[11px] tracking-tight text-[#d4d4d8]">
                        {sec.title}
                      </span>
                    </div>
                    <span className="text-[#71717a] flex items-center">
                      {isAdminOpen ? <IconChevronDown size={13} /> : <IconChevronRight size={13} />}
                    </span>
                  </button>
                ) : (
                  <div
                    className="font-mono text-[#71717a] text-center py-1 border-b border-[#27272a] my-0.5 text-[8px] uppercase tracking-wider font-semibold"
                    title="Admin Master Menu"
                  >
                    ADM
                  </div>
                )}

                {/* Sub-items list */}
                {(!isCollapsed ? isAdminOpen : true) && (
                  <div
                    className={`flex flex-col gap-0.5 ${!isCollapsed ? 'ms-1.5 ps-2 border-s border-[#27272a]' : ''
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
                          onClick={() => handleNavigate(item.path)}
                          title={isCollapsed ? `${item.label} ${item.sublabel ? `(${item.sublabel})` : ''}` : undefined}
                          className={`group flex items-center w-full text-start rounded-md border-0 transition-all cursor-pointer text-xs ${isActive
                              ? 'bg-[#18181b] text-white font-semibold shadow-xs border-s-2 border-white'
                              : 'text-[#a1a1aa] hover:bg-[#18181b]/70 hover:text-white font-medium'
                            }`}
                          style={{
                            padding: isCollapsed ? '6px 0' : '5px 8px',
                            justifyContent: isCollapsed ? 'center' : 'space-between',
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`inline-flex items-center justify-center w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#71717a] group-hover:text-[#e4e4e7]'
                              }`}>
                              {item.icon}
                            </span>
                            {!isCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </div>

                          {!isCollapsed && item.sublabel && (
                            <span
                              className="text-[9px] font-mono px-1 py-0.2 bg-[#27272a] text-[#a1a1aa] rounded border border-[#3f3f46]/50"
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
                <div className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider px-2 pt-1 pb-0.5">
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
                    onClick={() => handleNavigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center w-full text-start rounded-md border-0 transition-all cursor-pointer text-xs ${isActive
                        ? 'bg-[#18181b] text-white font-semibold shadow-xs border-s-2 border-white'
                        : 'text-[#a1a1aa] hover:bg-[#18181b]/70 hover:text-white font-medium'
                      }`}
                    style={{
                      padding: isCollapsed ? '6px 0' : '6px 8px',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`inline-flex items-center justify-center w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#71717a] group-hover:text-[#e4e4e7]'
                        }`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#27272a] text-[#d4d4d8] border border-[#3f3f46]/50 ms-auto font-medium"
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

      {/* 3. Solid Red Logout Footer */}
      <div
        className="mt-auto flex-shrink-0"
        style={{
          borderTop: '1px solid #27272a',
          backgroundColor: '#09090b',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'stretch',
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
          style={{
            width: isCollapsed ? '36px' : '100%',
            height: '36px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: '1px solid #dc2626',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: isCollapsed ? '0' : '0 12px',
            boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            userSelect: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.borderColor = '#b91c1c';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.borderColor = '#dc2626';
          }}
        >
          <IconLogout size={15} style={{ color: '#ffffff', flexShrink: 0 }} />
          {!isCollapsed && <span style={{ letterSpacing: '0.02em', fontWeight: 700 }}>Logout</span>}
        </button>
      </div>

    </aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Semi-transparent dark backdrop overlay on mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-200"
            onClick={onCloseMobile}
            aria-label="Close backdrop"
          />
        )}
        {sidebarContent}
      </>
    );
  }

  return sidebarContent;
}
