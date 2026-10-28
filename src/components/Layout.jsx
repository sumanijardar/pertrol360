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
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Command Workspace */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <Header
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
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
