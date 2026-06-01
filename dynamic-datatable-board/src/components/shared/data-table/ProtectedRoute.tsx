import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const token = localStorage.getItem('token');

    // 🕵️‍♂️ ตรวจเช็คเอกสาร JWT Token ถ้าไม่มีให้ดีดกลับหน้า Login ทันที
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // หากมี Token ครบถ้วนตามระเบียบ ปล่อยผ่านให้ชมหน้าเว็บบน Layout หลักได้
    return <Outlet />;
}