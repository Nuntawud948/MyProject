/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MainLayout } from './components/layouts/MainLayout';
import { EmployeeDashboardPage } from './features/hrms/pages/EmployeeDashboardPage';
import { RoleManagementPage } from './features/setup/pages/RoleManagementPage';
import {
  CalendarDays,
  FileSpreadsheet,
  Clock,
  Shield,
  UserCheck,
  Building,
  AlertOctagon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function App() {
  const [currentPath, setCurrentPath] = useState('hrms-employees');

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-xs">
              <h3 className="text-xl font-bold text-slate-800">Vertex Core Dashboard</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
                Welcome to your HRMS Workspace. This screen contains general organization widgets, active headcounts, system load telemetry, and database clusters diagnostics.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-5 border border-slate-200/80 rounded-lg bg-slate-5075 shadow-3xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold mb-3 text-sm">
                    <UserCheck className="h-4.5 w-4.5 text-slate-850" />
                    <span>Resource Health Matrix</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal mb-4">
                    Track the operational efficiency of the system and see memory utilization indicators in microservices.
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Core API Gateway Port 8080:</span>
                      <Badge variant="success">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Spanner Transaction Thread:</span>
                      <Badge variant="success">HEALTHY</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Local dev-service state:</span>
                      <Badge variant="outline">LOCAL STORAGE</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-slate-200/80 rounded-lg bg-slate-50/75 shadow-3xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold mb-3 text-sm">
                    <CalendarDays className="h-4.5 w-4.5 text-slate-855" />
                    <span>Pending Action Items</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal mb-4">
                    Urgent items awaiting review before the next payslip settlement run.
                  </p>
                  <div className="text-xs text-slate-400 italic py-2 text-center select-none">
                    All compliance requests have been successfully actioned.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 shadow-sm border border-slate-850">
              <h4 className="text-sm font-bold text-emerald-400">Navigation Hint</h4>
              <p className="text-xs text-slate-350 mt-1 max-w-xl leading-relaxed">
                Click on <strong className="text-white">HRMS (Human Resources) → Employee Management</strong> in the sidebar to review the full-scale React generic table showcasing live filters, row lists, skeletons, and simulation features.
              </p>
            </div>
          </div>
        );

      case 'hrms-employees':
        return <EmployeeDashboardPage />;

      case 'hrms-leaves':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <h3 className="text-lg font-bold text-slate-850">Leave Requests</h3>
              <p className="text-xs text-slate-400 mt-1">Leave module schema configuration.</p>

              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg mt-6 bg-slate-50/30">
                <FileSpreadsheet className="h-10 w-10 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Database Schema Link Needed</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  The leave balance ledger depends on another database table. Switch back to Employee Management to see our operational Datatable.
                </p>
                <button
                  onClick={() => setCurrentPath('hrms-employees')}
                  className="mt-4 text-xs font-bold px-3.5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                >
                  Return to Employees
                </button>
              </div>
            </div>
          </div>
        );

      case 'hrms-attendance':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <h3 className="text-lg font-bold text-slate-850">Attendance & Time Ledger</h3>
              <p className="text-xs text-slate-400 mt-1">Real-time biometrics login records.</p>

              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg mt-6 bg-slate-50/30">
                <Clock className="h-10 w-10 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Timesheet Grid Pending</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Biometrics inputs are currently connected to standard microdevices. Return to Employee Management to see the interactive dynamic filters.
                </p>
                <button
                  onClick={() => setCurrentPath('hrms-employees')}
                  className="mt-4 text-xs font-bold px-3.5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                >
                  Return to Employees
                </button>
              </div>
            </div>
          </div>
        );

      case 'setup-users':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <h3 className="text-lg font-bold text-slate-850">User Accounts System</h3>
              <p className="text-xs text-slate-400 mt-1">Identity Access and security settings.</p>

              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg mt-6 bg-slate-50/30">
                <Shield className="h-10 w-10 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Single Sign-On Settings Locked</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  SSO authentication systems can be configured via administrative YAML declarations. Let's head back to Employees.
                </p>
                <button
                  onClick={() => setCurrentPath('hrms-employees')}
                  className="mt-4 text-xs font-bold px-3.5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                >
                  Return to Employees
                </button>
              </div>
            </div>
          </div>
        );

      case 'setup-roles':
        return <RoleManagementPage />;

      case 'logout':
        return (
          <div className="space-y-6 animate-in fade-in duration-300 flex items-center justify-center min-h-[40vh]">
            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-md text-center max-w-md w-full">
              <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4 ring-8 ring-amber-50/40">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">You are logged out</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Your secure session has been terminated safely. All cached query tokens have been flushed from browser storage.
              </p>
              <button
                onClick={() => setCurrentPath('hrms-employees')}
                className="mt-6 w-full text-xs font-bold py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                Log In as Administrator
              </button>
            </div>
          </div>
        );

      default:
        return <EmployeeDashboardPage />;
    }
  };

  return (
    <MainLayout currentPath={currentPath} onNavigate={(path) => setCurrentPath(path)}>
      {renderContent()}
    </MainLayout>
  );
}
