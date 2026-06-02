/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 🔒 Enterprise Auth Architecture Refactored by Senior Engineer
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { EmployeeDashboardPage } from './features/hrms/pages/EmployeeDashboardPage';
import { LeaveDashboardPage } from './features/hrms/pages/LeaveDashboardPage';
import { RoleManagementPage } from './features/setup/pages/RoleManagementPage';
import LoginPage from './features/auth/pages/LoginPage';
import ProtectedRoute from './components/shared/data-table/ProtectedRoute';
import { CalendarDays, Clock, Shield, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TestPage from "@/features/setup/TestPage.tsx";

// 🧠 คอมโพเนนต์หน้าหน้าแรกสุด (Dashboard หลัก) ที่เราย้ายพิกัดมาลงล็อกระบบ Routing
function DashboardContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-xs">
        <h3 className="text-xl font-bold text-slate-800">Vertex Core Dashboard</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Welcome to your HRMS Workspace. This screen contains general organization widgets, active headcounts, system load telemetry, and database clusters diagnostics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-5 border border-slate-200/80 rounded-lg bg-slate-50/75 shadow-3xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold mb-3 text-sm">
              <UserCheck className="h-4.5 w-4.5 text-slate-850" />
              <span>Resource Health Matrix</span>
            </div>
            <p className="text-xs text-slate-500 leading-normal mb-4">
              Track the operational efficiency of the system and see memory utilization indicators in microservices.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Core API Gateway Port 5272:</span>
                <Badge variant="success">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">PostgreSQL UMS & HRMS Scheme:</span>
                <Badge variant="success">HEALTHY</Badge>
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
          Operational Datatable ready. Navigate through the sidebar menu to process live filtering, column sort, server-side data virtualization, or log out of your session securely.
        </p>
      </div>
    </div>
  );
}

// 🚧 คอมโพเนนต์หน้าสแตนบายรอเชื่อมต่อตารางอื่นๆ (Leaves & Attendance)
function DummyPlaceholder({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <h3 className="text-lg font-bold text-slate-850">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">Database Module Link Needed</p>
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg mt-6 bg-slate-50/30">
          <Icon className="h-10 w-10 text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Schema Integration Pending</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🚪 1. Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🛡️ 2. Protected Route Layer (ทหารยามคุมประตู) */}
        <Route element={<ProtectedRoute />}>

          {/* 🌟 ปรับตรงนี้: ส่ง <Outlet /> เป็น children เข้าไปใน <MainLayout> สยบเออร์เรอร์ TypeScript */}
          <Route element={
            <MainLayout currentPath="" onNavigate={() => { }}>
              <Outlet />
            </MainLayout>
          }>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardContent />} />

            {/* 👥 โมดูลระบบบริหารงานบุคคล HRMS */}
            <Route path="/hrms/employees" element={<EmployeeDashboardPage />} />

            <Route path="/hrms/leaves" element={<LeaveDashboardPage />} />

            <Route path="/hrms/attendance" element={
              <DummyPlaceholder
                title="Attendance & Time Ledger"
                description="Biometrics inputs are currently connected to standard microdevices. Return to Employee Management to see the interactive dynamic filters."
                icon={Clock}
              />
            } />

            {/* ⚙️ โมดูลระบบตั้งค่าความปลอดภัย Setup */}
            <Route path="/setup/users" element={
              <DummyPlaceholder
                title="User Accounts Management"
                description="SSO authentication systems can be configured via administrative YAML declarations. Head back to operational screens."
                icon={Shield}
              />
            } />
            <Route path="/setup/test" element={<TestPage />} />

            <Route path="/setup/roles" element={<RoleManagementPage />} />

          </Route>
        </Route>

        {/* 🔄 3. Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}