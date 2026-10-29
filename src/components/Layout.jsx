import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, onStationChange, currentStation = 'ALL' }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));
  const location = useLocation();

  // Screen resize listener for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Toggle handler passed to Header
  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  // If on Login page, render clean full-screen view without admin shell
  if (location.pathname === '/login') {
    return <main className="w-full min-h-screen bg-background text-foreground">{children}</main>;
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground relative select-none"
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      {/* 1. Left Dark Sidebar Navigation (Responsive Drawer on Mobile, Sticky on Desktop) */}
      <Sidebar
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        isMobile={isMobile}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Command Workspace */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isMobile ? isMobileOpen : isSidebarCollapsed}
          isMobile={isMobile}
          onSelectStation={onStationChange}
          currentStation={currentStation}
        />

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-muted/20 w-full">
          <div className="flex-1">
            {children}
          </div>

          {/* Bottom Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
