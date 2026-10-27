import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, onStationChange, currentStation = 'ALL' }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // If on Login page, render clean full-screen view without admin shell
  if (location.pathname === '/login') {
    return <main className="w-100 min-vh-100">{children}</main>;
  }

  return (
    <div
      className="d-flex vh-100 vw-100 overflow-hidden bg-light"
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* 1. Left Sidebar Navigation (Fixed pinned to left edge, zero horizontal displacement) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Work Area (Occupies strictly the remaining width, zero overflow-x) */}
      <div
        className="d-flex flex-column flex-grow-1 h-100 min-w-0 overflow-hidden"
        style={{ width: 0 }}
      >
        {/* Top Header Navbar */}
        <Header
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          onSelectStation={onStationChange}
          currentStation={currentStation}
        />

        {/* Page Content View: Only this container handles vertical scrolling smoothly */}
        <main
          className="flex-grow-1 overflow-y-auto overflow-x-hidden d-flex flex-column"
          style={{ width: '100%' }}
        >
          <div className="flex-grow-1">
            {children}
          </div>

          {/* Bottom Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
