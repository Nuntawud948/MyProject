import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { LogOut, Users, Settings, LayoutDashboard, Calendar, Clock, Shield } from 'lucide-react';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUsername = localStorage.getItem('username') || 'Administrator';

  const handleLogout = () => {
    // 🧼 ล้างบางตั๋วใบเบิกทางออกจากเครื่องเบราว์เซอร์ให้เกลี้ยง
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    // ผลักผู้ใช้ออกไปนอกกำแพงความปลอดภัยสู่หน้าล็อกอินหลัก
    navigate('/login');
  };

  // Helper คอยตรวจสอบสถานะว่าเมนูไหนกำลังทำงานอยู่เพื่อไฮไลท์แถบสีขาว
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen p-4 text-white select-none">
      <div>
        <div className="mb-8 px-2 py-3 border-b border-slate-800/60">
          <h1 className="text-lg font-bold tracking-wider text-blue-500">VERTEX CORE v1.0</h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Active Account: <span className="text-slate-200 font-medium">{currentUsername}</span></p>
        </div>

        <nav className="space-y-1.5">
          <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/dashboard') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <LayoutDashboard size={16} />
            <span>Core Dashboard</span>
          </Link>

          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-4 pb-1 tracking-widest">HRMS Module</div>

          <Link to="/hrms/employees" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/hrms/employees') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <Users size={16} />
            <span>Employee Grid</span>
          </Link>

          <Link to="/hrms/leaves" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/hrms/leaves') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <Calendar size={16} />
            <span>Leave Management</span>
          </Link>

          <Link to="/hrms/attendance" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/hrms/attendance') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <Clock size={16} />
            <span>Attendance Ledger</span>
          </Link>

          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-4 pb-1 tracking-widest">Setup Configuration</div>

          <Link to="/setup/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/setup/users') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <Shield size={16} />
            <span>User Accounts</span>
          </Link>

          <Link to="/setup/roles" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/setup/roles') ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <Settings size={16} />
            <span>Role Permissions</span>
          </Link>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 gap-3"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Secure Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}