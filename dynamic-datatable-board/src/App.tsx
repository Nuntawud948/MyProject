/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 🔒 Enterprise Auth Architecture Refactored by Senior Engineer
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { EmployeeDashboardPage } from './features/hrms/pages/EmployeeDashboardPage';
import { LeaveDashboardPage } from './features/hrms/pages/LeaveDashboardPage';
import { CompanyHolidayDashboardPage } from './features/hrms/pages/CompanyHolidayDashboardPage';
import { GeofenceDashboardPage } from './features/hrms/pages/GeofenceDashboardPage';
import { RoleManagementPage } from './features/setup/pages/RoleManagementPage';
import Login from './features/auth/pages/Login';
import ProtectedRoute from './components/shared/data-table/ProtectedRoute';
import {  Clock  } from 'lucide-react';
import TestPage from "@/features/setup/TestPage.tsx";
import { UserAccountPage } from './features/setup/UserAccount/UserAccountPage';

// 🧠 คอมโพเนนต์หน้าหน้าแรกสุด (Dashboard หลัก) ที่เราย้ายพิกัดมาลงล็อกระบบ Routing
function DashboardContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-xs">
        <h3 className="text-xl font-bold text-slate-800"> Welcome to your HRMS Workspace</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Welcome to your HRMS Workspace. This screen contains general organization widgets, active headcounts, system load telemetry, and database clusters diagnostics.
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
        <Route path="/login" element={<Login />} />

        {/* 🛡️ 2. Protected Route Layer (ทหารยามคุมประตู) */}
        <Route element={<ProtectedRoute />}>

          {/* 🌟 ปรับตรงนี้: ส่ง <Outlet /> เป็น children เข้าไปใน <MainLayout> สยบเออร์เรอร์ TypeScript */}
          <Route element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardContent />} />

            {/* 👥 โมดูลระบบบริหารงานบุคคล HRMS */}
            <Route path="/hrms/employees" element={<EmployeeDashboardPage />} />

            <Route path="/hrms/leaves" element={<LeaveDashboardPage />} />

            <Route path="/hrms/company-holidays" element={<CompanyHolidayDashboardPage />} />

            <Route path="/hrms/attendance" element={
              <DummyPlaceholder
                title="Attendance & Time Ledger"
                description="Biometrics inputs are currently connected to standard microdevices. Return to Employee Management to see the interactive dynamic filters."
                icon={Clock}
              />
            } />

            <Route path="/hrms/geofences" element={<GeofenceDashboardPage />} />

            {/* ⚙️ โมดูลระบบตั้งค่าความปลอดภัย Setup */}
            <Route path="/setup/users" element={<UserAccountPage />} />
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