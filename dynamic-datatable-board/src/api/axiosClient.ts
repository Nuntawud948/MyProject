import axios from 'axios';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5272', // ให้ตรงกับพอร์ต C# ของคุณต้น
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🔒 ดักจับคำขอก่อนส่งออกไป (Request Interceptor) เพื่อแนบใบเบิกทาง JWT Token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // ดึง token ที่เก็บไว้ตอนล็อกอินสำเร็จ
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`; // แนบลง Header ตามมาตรฐาน Enterprise
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🔒 ดักจับการตอบกลับจาก API (Response Interceptor) เพื่อดักสิทธิ์ Token หมดอายุอัตโนมัติ (401 Unauthorized)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // หากเซิร์ฟเวอร์ตอบกลับมาเป็นรหัสสถานะ 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.warn('ตรวจพบสิทธิ์เข้าถึงไม่ถูกต้องหรือ Token หมดอายุ (401) — กำลังออกจากระบบ...');
            
            // 🧼 เรียกล้างข้อมูลสิทธิ์และ Token ทั้งหมดใน Zustand และ localStorage
            useAuthStore.getState().logout();
            
            // 🚪 ผลักหน้าเบราว์เซอร์หลักให้กลับไปยังหน้าลงชื่อเข้าใช้งาน
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;