import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { LogOut, Users, Settings, LayoutDashboard, Calendar, Clock, Shield, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const currentUsername = user?.username || 'Administrator';

  const handleLogout = () => {
    // 🧼 เรียกล้างสถานะ Token และบัญชีผู้ใช้ผ่าน Zustand store
    logout();

    // ผลักผู้ใช้ออกไปนอกกำแพงความปลอดภัยสู่หน้าล็อกอินหลักแบบดึงประวัติคืนไม่ได้ (replace)
    navigate('/login', { replace: true });
  };

  // Helper คอยตรวจสอบสถานะว่าเมนูไหนกำลังทำงานอยู่เพื่อไฮไลท์แถบสีขาว
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen p-4 text-white select-none relative">
      <div>
        {/* Header Section with Toggle Button */}
        <div className="mb-8 px-2 py-3 border-b border-slate-800/60 flex items-center justify-between">
          {!isCollapsed && (
            <div className="animate-in fade-in duration-200 overflow-hidden">
              <h1 className="text-lg font-bold tracking-wider text-blue-500">HR System</h1>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                Active Account: <span className="text-slate-200 font-medium">{currentUsername}</span>
              </p>
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              title={isCollapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        <nav className="space-y-1.5">
          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/dashboard')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Core Dashboard"
          >
            <LayoutDashboard size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Core Dashboard</span>}
          </Link>

          {/* HRMS Module Section */}
          {!isCollapsed ? (
            <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-4 pb-1 tracking-widest animate-in fade-in duration-200">
              HRMS Module
            </div>
          ) : (
            <div className="border-t border-slate-800/60 my-2" />
          )}

          <Link
            to="/hrms/employees"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/hrms/employees')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Employee Grid"
          >
            <Users size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Employee Grid</span>}
          </Link>

          <Link
            to="/hrms/leaves"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/hrms/leaves')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Leave Management"
          >
            <Calendar size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Leave Management</span>}
          </Link>

          <Link
            to="/hrms/company-holidays"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/hrms/company-holidays')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Company Holidays"
          >
            <Calendar size={16} className="text-blue-400 shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Company Holidays</span>}
          </Link>

          <Link
            to="/hrms/attendance"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/hrms/attendance')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Attendance Ledger"
          >
            <Clock size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Attendance Ledger</span>}
          </Link>

          <Link
            to="/hrms/geofences"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/hrms/geofences')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Geofence Settings"
          >
            <MapPin size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Geofence Settings</span>}
          </Link>

          {/* Setup Configuration Section */}
          {!isCollapsed ? (
            <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-4 pb-1 tracking-widest animate-in fade-in duration-200">
              Setup Configuration
            </div>
          ) : (
            <div className="border-t border-slate-800/60 my-2" />
          )}

          <Link
            to="/setup/users"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/setup/users')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="User Accounts"
          >
            <Shield size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">User Accounts</span>}
          </Link>

          <Link
            to="/setup/roles"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive('/setup/roles')
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Role Permissions"
          >
            <Settings size={16} className="shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-200">Role Permissions</span>}
          </Link>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className={`w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 gap-3 ${
            isCollapsed ? 'justify-center px-0' : 'justify-start'
          }`}
          onClick={handleLogout}
          title="Secure Sign Out"
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span className="animate-in fade-in duration-200">Secure Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}