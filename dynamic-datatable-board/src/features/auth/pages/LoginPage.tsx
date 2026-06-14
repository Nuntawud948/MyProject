import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { authApi } from '../../../api/ums/auth.api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        try {
            setIsLoading(true);
            setErrorMsg(null);

            // ยิงข้อมูลข้ามท่อไปหาหลังบ้าน
            const response = await authApi.login({ username, password });

            if (response && response.isSuccess && response.data) {
                // 💾 เมื่อล็อกอินผ่าน นำค่า Token และสิทธิ์ ไปบันทึกลงเครื่องหน้าบ้าน
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('username', response.data.username);
                localStorage.setItem('role', response.data.role);

                // ดีดผู้ใช้ข้ามมิติไปยังแดชบอร์ดจัดการพนักงานทันที
                navigate('/hrms/employees');
            } else {
                setErrorMsg(response?.message || 'การตรวจสอบสิทธิ์ล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error: any) {
            console.error('Login failure:', error);
            setErrorMsg(error.response?.data?.message || 'ไม่สามารถเชื่อมต่อระบบความปลอดภัยหลังบ้านได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                      HRMS
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        ลงชื่อเข้าใช้งานเพื่อเข้าสู่ระบบการกรองข้อมูลส่วนกลาง
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {errorMsg && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="text-sm font-medium text-slate-300 block mb-1">บัญชีผู้ใช้งาน (Username)</label>
                            <Input
                                type="text"
                                required
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
                                placeholder="กรอกชื่อผู้ใช้งาน..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 block mb-1">รหัสผ่าน (Password)</label>
                            <Input
                                type="password"
                                required
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-11"
                        >
                            {isLoading ? 'กำลังประมวลผลระบบความปลอดภัย...' : 'ลงชื่อเข้าใช้งาน'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}