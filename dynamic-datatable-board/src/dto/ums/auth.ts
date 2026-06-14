// ไทป์ข้อมูลเนื้อในเมื่อทำระบบ Authentication สำเร็จ
export interface TokenResponse {
    token: string;
    refreshToken: string;
    username: string;
    role: string;
    expiresAt: string;
}

// ซองมาตรฐานชั้นนอกสุด (สอดคล้องกับ Response<T> ใน C#)
export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T | null;
    errors: string[] | null;
}

// คำขอเข้าสู่ระบบ
export interface LoginRequest {
    username: string;
    password: string;
}