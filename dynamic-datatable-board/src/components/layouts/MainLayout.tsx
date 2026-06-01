/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';

export interface MainLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function MainLayout({ children, currentPath = 'hrms-employees', onNavigate }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex text-slate-900 font-sans antialiased">
      {/* 1. Large Screen Sidebar (Desktop) */}
      <div className="hidden lg:block lg:w-68 xl:w-72 h-screen sticky top-0 shrink-0">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
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
            <Sidebar
              currentPath={currentPath}
              onNavigate={onNavigate}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          {/* Leftside Controls: Mobile toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden h-9 w-9 text-slate-600 border-slate-200"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dynamic Outlet rendering or page children content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
