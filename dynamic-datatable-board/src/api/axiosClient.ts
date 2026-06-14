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
    async (error) => {
        const originalRequest = error.config;

        // หากเซิร์ฟเวอร์ตอบกลับมาเป็นรหัสสถานะ 401 Unauthorized และยังไม่ได้ลอง refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const token = useAuthStore.getState().token || localStorage.getItem('token');
                const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('refreshToken');

                if (token && refreshToken) {
                    // ใช้ axios ปกติ ไม่ใช่ axiosClient เพื่อป้องกัน interceptor วนลูป
                    const response = await axios.post(`${axiosClient.defaults.baseURL}/api/Auth/refresh`, {
                        accessToken: token,
                        refreshToken: refreshToken
                    });

                    if (response.data && response.data.isSuccess && response.data.data) {
                        const { token: newToken, refreshToken: newRefreshToken, username, role } = response.data.data;
                        
                        // อัปเดต state และ localStorage ใหม่
                        useAuthStore.getState().login(newToken, newRefreshToken, { username, role });

                        // แก้ Header ของ Request เดิมให้ใช้ Token ใหม่
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        
                        // ส่ง Request เดิมไปใหม่อีกครั้ง
                        return axiosClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.warn('Refresh token หมดอายุหรือไม่ถูกต้อง — กำลังออกจากระบบ...');
            }

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