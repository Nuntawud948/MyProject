/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex text-slate-900 font-sans antialiased">
      {/* 1. Large Screen Sidebar (Desktop) */}
      <div className={`hidden lg:block h-screen sticky top-0 shrink-0 transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-68 xl:w-72'}`}>
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* 2. Responsive Mobile Sidebar (Drawer Overlay) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop gray layer */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Slide-out Panel content */}
          <div className="relative w-72 h-full bg-slate-50 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            <Sidebar />
          </div>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar for Mobile/Tablet */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 shrink-0 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-md font-bold text-blue-500">HR System</h1>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="เปิดเมนูการนำทาง"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Dynamic Outlet rendering or page children content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
