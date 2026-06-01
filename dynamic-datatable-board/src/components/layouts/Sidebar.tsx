/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  X,
  Sparkles,
  Search,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentPath = 'hrms-employees',
  onNavigate,
  onCloseMobile
}: SidebarProps) {
  // Collapsible navigational groups
  const [hrmsOpen, setHrmsOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);

  const activeClass = 'bg-slate-200/60 text-slate-900 font-semibold';
  const inactiveClass = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

  const handleLinkClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-full h-full bg-slate-50 border-r border-slate-200/80 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex flex-col">
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">Vertex HR</h1>
              <span className="text-[10px] font-medium text-slate-400">Enterprise Edition</span>
            </div>
          </div>
          {/* Mobile close button */}
          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-slate-500 hover:text-slate-900"
              onClick={onCloseMobile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {/* Dashboard (Single Link) */}
          <button
            type="button"
            onClick={() => handleLinkClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left cursor-pointer ${
              currentPath === 'dashboard' ? activeClass : inactiveClass
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0 opacity-80" />
            <span>Dashboard</span>
          </button>

          {/* HRMS Collapsible Group */}
          <div>
            <button
              type="button"
              onClick={() => setHrmsOpen(!hrmsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4.5 w-4.5 shrink-0 opacity-80" />
                <span>HRMS (Human Resources)</span>
              </div>
              <ChevronDown
                className="h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200"
                style={{ transform: hrmsOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {hrmsOpen && (
              <div className="mt-1 ml-4 pl-3.5 border-l border-slate-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  type="button"
                  onClick={() => handleLinkClick('hrms-employees')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    currentPath === 'hrms-employees' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Employee Management
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('hrms-leaves')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    currentPath === 'hrms-leaves' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Leave Requests
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('hrms-attendance')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    currentPath === 'hrms-attendance' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Attendance & Time
                </button>
              </div>
            )}
          </div>

          {/* System Setup Collapsible Group */}
          <div>
            <button
              type="button"
              onClick={() => setSystemOpen(!systemOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4.5 w-4.5 shrink-0 opacity-80" />
                <span>System Setup</span>
              </div>
              <ChevronDown
                className="h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200"
                style={{ transform: systemOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {systemOpen && (
              <div className="mt-1 ml-4 pl-3.5 border-l border-slate-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  type="button"
                  onClick={() => handleLinkClick('setup-users')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    currentPath === 'setup-users' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  User Accounts
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('setup-roles')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    currentPath === 'setup-roles' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Role Management
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* footer - current profile & logout */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 space-y-3">
        <div className="flex items-center gap-3 px-2 py-3 bg-white/70 rounded-lg shadow-xs border border-slate-100 animate-in fade-in duration-300">
          <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-100">
            VH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">Vertex HR</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">hr@vertexhr.com</p>
          </div>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>

        <button
          type="button"
          onClick={() => handleLinkClick('logout')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
}
