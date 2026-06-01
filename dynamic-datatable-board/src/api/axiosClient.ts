import axios from 'axios';

const axiosClient = axios.create({
    // เดี๋ยวเราจะมาแก้พอร์ตตรงนี้ให้ตรงกับที่ .NET รันอีกทีครับ
    baseURL: 'https://localhost:5272/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ด่านตรวจรับข้อมูล: ดึงเฉพาะ data ออกมาใช้ จะได้ไม่ต้อง .data ซ้อนกันหลายชั้น
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default axiosClient;