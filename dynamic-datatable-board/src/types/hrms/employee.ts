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