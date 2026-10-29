import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNavSectionsForRole } from '../routes/routesConfig';
import {
  IconChevronDown,
  IconChevronRight,
  IconSettings,
  IconLogout
} from './common/Icons';
import { logout, getUserRole, getCurrentUser } from '../services/api';

export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  isMobile = false,
  onToggleCollapse,
  onCloseMobile
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(() => (getUserRole() || 'user').toLowerCase());
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setUserRole((getUserRole() || 'user').toLowerCase());
    setCurrentUser(getCurrentUser());
  }, [location.pathname]);

  const navSections = getNavSectionsForRole(userRole);
  const isOfficer = userRole === 'officer' || userRole === 'user';
  const homePath = isOfficer ? '/officer/cockpit' : '/dashboard';

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

  const userName =
    currentUser?.name ||
    currentUser?.officer_name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Officer');
  const userRoleName = userRole === 'admin' ? 'Administrator' : 'Patrol Officer';
  const userInitials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'PO';

  const sidebarContent = (
    <aside
      className={`bg-[#0c0f14] text-[#94a3b8] border-r border-[#1a1f2c] flex flex-col select-none transition-all duration-200 ${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 w-[250px] shadow-2xl ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'h-full flex-shrink-0'
      }`}
      style={{
        width: !isMobile ? (isCollapsed ? '64px' : '245px') : '250px',
        minWidth: !isMobile ? (isCollapsed ? '64px' : '245px') : '250px',
        maxWidth: !isMobile ? (isCollapsed ? '64px' : '245px') : '250px',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      {/* 1. Official Sleek Brand Header (Matching Reference Design) */}
      <div
        className="flex items-center border-b border-[#1a1f2c] bg-[#0c0f14] transition-colors flex-shrink-0"
        style={{
          height: '56px',
          padding: isCollapsed ? '0 12px' : '0 16px',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        <div
          className="flex items-center gap-3 cursor-pointer min-w-0"
          onClick={() => handleNavigate(homePath)}
          title={isOfficer ? 'Patrol360 Officer Cockpit' : 'Patrol360 Command Center'}
        >
          {/* Elegant Amber Diamond / Shield Icon (like the reference) */}
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-sm flex-shrink-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-bold text-white text-sm tracking-tight truncate">
                Patrol<span className="text-amber-400">360</span>
              </span>
              <span className="text-[#64748b] font-medium text-[10.5px] truncate mt-0.5">
                {isOfficer ? 'Tactical Edge • Pro' : 'Command Hub • Pro'}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        {!isCollapsed && !isMobile && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-[#1a202c] transition-colors cursor-pointer"
          >
            <span className="text-[11px]">◀</span>
          </button>
        )}

        {isMobile && (
          <button
            onClick={onCloseMobile}
            title="Close Sidebar"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#1a202c] transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Desktop Expand Button when collapsed */}
      {isCollapsed && !isMobile && (
        <div className="flex justify-center py-2 border-b border-[#1a1f2c] bg-[#0c0f14]">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="h-6 w-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-[#1a202c] transition-colors cursor-pointer text-[10px]"
          >
            ▶
          </button>
        </div>
      )}

      {/* 2. Navigation Items (Sleek Dark Neutral Palette, Matching Reference) */}
      <div
        className="flex-grow flex flex-col gap-4 overflow-y-auto overflow-x-hidden"
        style={{
          padding: isCollapsed ? '12px 8px' : '14px 12px',
          scrollbarWidth: 'none'
        }}
      >
        {navSections.map((sec, secIdx) => {
          // SECTION: Admin Master Menu
          if (sec.isMasterMenu) {
            return (
              <div key={secIdx} className="flex flex-col gap-1">
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    className="flex items-center justify-between w-full text-start text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#161a23] rounded-lg px-2.5 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[#64748b] flex-shrink-0">
                        {sec.icon || <IconSettings size={15} />}
                      </span>
                      <span className="font-bold text-[10.5px] tracking-wider text-[#94a3b8]">
                        {sec.title}
                      </span>
                    </div>
                    <span className="text-[#64748b] flex items-center">
                      {isAdminOpen ? <IconChevronDown size={13} /> : <IconChevronRight size={13} />}
                    </span>
                  </button>
                ) : (
                  <div
                    className="text-[#64748b] text-center py-1 border-b border-[#1a1f2c] my-0.5 text-[8.5px] uppercase tracking-wider font-bold"
                    title="Admin Master Menu"
                  >
                    ADM
                  </div>
                )}

                {/* Sub-items list */}
                {(!isCollapsed ? isAdminOpen : true) && (
                  <div
                    className={`flex flex-col gap-1 ${
                      !isCollapsed ? 'ms-1.5 ps-2 border-s border-[#1a1f2c]' : ''
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
                          title={isCollapsed ? `${item.label}` : undefined}
                          className={`group flex items-center w-full text-start rounded-lg transition-all cursor-pointer text-xs ${
                            isActive
                              ? 'bg-[#1e2330] text-white font-semibold shadow-2xs'
                              : 'text-[#94a3b8] hover:bg-[#161a23] hover:text-[#f8fafc] font-medium'
                          }`}
                          style={{
                            padding: isCollapsed ? '8px 0' : '7px 10px',
                            justifyContent: isCollapsed ? 'center' : 'space-between'
                          }}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className={`inline-flex items-center justify-center w-4 h-4 flex-shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'text-[#64748b] group-hover:text-[#cbd5e1]'
                              }`}
                            >
                              {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!isCollapsed && (
                            <span className="text-[#475569] group-hover:text-[#94a3b8] text-[10px]">
                              ›
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

          // SECTIONS: Tactical Edge & Threat Intelligence
          return (
            <div key={secIdx} className="flex flex-col gap-1">
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider px-2.5 pt-1 pb-1">
                  {sec.title}
                </div>
              )}

              {sec.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/officer/cockpit' && location.pathname === '/officer') ||
                  (item.path === '/patrolling' && location.pathname.startsWith('/patrolling')) ||
                  (item.path === '/weapon-detection' && location.pathname === '/reports/weapons-detection');

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center w-full text-start rounded-lg transition-all cursor-pointer text-xs ${
                      isActive
                        ? 'bg-[#1e2330] text-white font-semibold shadow-2xs'
                        : 'text-[#94a3b8] hover:bg-[#161a23] hover:text-[#f8fafc] font-medium'
                    }`}
                    style={{
                      padding: isCollapsed ? '8px 0' : '8px 10px',
                      justifyContent: isCollapsed ? 'center' : 'space-between'
                    }}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-[#64748b] group-hover:text-[#cbd5e1]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#161a23] text-amber-400 border border-amber-400/20 ms-auto font-bold">
                        {item.badge}
                      </span>
                    )}

                    {!isCollapsed && !item.badge && (
                      <span className="text-[#475569] group-hover:text-[#94a3b8] text-[10px] ms-auto">
                        ›
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 3. Professional Profile & Logout Footer (Direct Match to Reference Image) */}
      <div
        className="mt-auto flex-shrink-0 border-t border-[#1a1f2c] bg-[#0c0f14] p-3 flex items-center justify-between"
        style={{
          padding: isCollapsed ? '10px 8px' : '12px 14px'
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar Circle with initials */}
          <div className="w-8 h-8 rounded-full bg-[#1e2330] border border-[#2d3748] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {userInitials}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-xs font-bold text-white truncate" title={userName}>
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                {userRoleName}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={() => {
              logout();
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              sessionStorage.clear();
              navigate('/login');
            }}
            title="Log Out from Session"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#1a202c] transition-colors cursor-pointer flex-shrink-0"
          >
            <IconLogout size={16} />
          </button>
        )}
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
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
