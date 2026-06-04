import axios from 'axios';

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

export default axiosClient;