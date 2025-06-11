// frontend/src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determinar si mostrar el sidebar basado en la ruta
  const showSidebar = true; // Siempre mostrar en rutas protegidas

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para mobile */}
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        />
      )}

      {/* Sidebar para desktop */}
      {showSidebar && (
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar 
              isOpen={true} 
              onClose={() => {}}
              isMobile={false}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex flex-col ${showSidebar ? 'lg:pl-64' : ''}`}>
        {/* Header */}
        <Header 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          showSidebarToggle={showSidebar}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

