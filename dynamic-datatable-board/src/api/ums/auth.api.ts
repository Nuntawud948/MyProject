import axiosClient from '../axiosClient';
import { ApiResponse, TokenResponse, LoginRequest } from '../../dto/ums/auth';

export const authApi = {
    /**
     * 🔑 ส่งคำขอล็อกอินไปยัง C# .NET API Cluster
     * คืนค่ากลับมาเป็นโครงสร้างซองมาตรฐานที่มี TokenResponse นอนอยู่ข้างใน
     */
    login: async (credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> => {
        const response = await axiosClient.post<ApiResponse<TokenResponse>>('/api/Auth/login', credentials);
        return response.data;
    },
    
    /**
     * 🔄 ส่งคำขอต่ออายุ Token โดยใช้ Access Token ที่หมดอายุ และ Refresh Token
     */
    refresh: async (accessToken: string, refreshToken: string): Promise<ApiResponse<TokenResponse>> => {
        const response = await axiosClient.post<ApiResponse<TokenResponse>>('/api/Auth/refresh', {
            accessToken,
            refreshToken
        });
        return response.data;
    }
};