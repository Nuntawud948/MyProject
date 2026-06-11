import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

import { loginSchema, LoginFormData } from '../domain/auth.schema';
import { apiClient } from '../../../api/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function Login() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // 🚀 ยิงคำขอไปที่ /api/Auth/login (apiClient มี baseUrl แล้ว)
      const response = await apiClient.post('/api/Auth/login', {
        username: data.username,
        password: data.password,
      });

      const resData = response.data;

      // ตรวจสอบโครงสร้าง Response ตาม API ที่กำหนดไว้
      if (resData && resData.isSuccess && resData.data) {
        const { token, username, role } = resData.data;
        
        // 💾 บันทึก JWT Token และข้อมูลผู้ใช้ลง Zustand (และ localStorage อัตโนมัติ)
        login(token, { username, role });

        // 🔀 ดีดหน้าไปยังแดชบอร์ดหลัก
        navigate('/dashboard');
      } else {
        setApiError(resData?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMessage = err.response?.data?.message || err.response?.data?.Message;
      setApiError(serverMessage || 'ไม่สามารถเชื่อมต่อเครื่องเซิร์ฟเวอร์ระบบความปลอดภัยได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden sm:px-6 lg:px-8">
      {/* 🌌 Background Glow effects for premium feel */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* 🔐 Login Card Container */}
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-lg shadow-blue-500/20">
            <Shield className="h-7 w-7 text-white animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Enterprise Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            กรุณาลงชื่อเข้าใช้งานเข้าสู่ระบบจัดการข้อมูลสารสนเทศกลาง
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* ⚠️ API Error Alerts */}
          {apiError && (
            <div className="flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">ข้อผิดพลาดในการตรวจสอบสิทธิ์</p>
                <p className="text-xs text-red-300/85 mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-slate-350 tracking-wider uppercase text-white">
                บัญชีผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  className={`pl-10 bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 ${
                    errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  placeholder="Username"
                  disabled={isLoading}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <span className="text-xs text-red-400 block animate-in fade-in duration-150">
                  {errors.username.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-350 tracking-wider uppercase text-white">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`pl-10 bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 ${
                    errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-400 block animate-in fade-in duration-150">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังลงชื่อเข้าใช้งาน...</span>
                </>
              ) : (
                <span>ลงชื่อเข้าใช้งาน</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
