export interface EmployeeResponse {
    id: number;
    code: string;
    firstName: string;
    lastName: string;
    startDate: string;        // 👈 อัปเดตตามหลังบ้าน
    isActive: boolean;        // 👈 อัปเดตเป็น boolean ตามตารางจริง
    department: string;
    phoneNumber?: string;     // 👈 เพิ่มเข้ามาใหม่
    resignationDate?: string; // 👈 เพิ่มเข้ามาใหม่
    fullName: string;
}

export interface EmployeeRequest {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    code?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    departmentId?: number | string;
    roleId?: number | string;
    status?: string;
    search?: string;
}