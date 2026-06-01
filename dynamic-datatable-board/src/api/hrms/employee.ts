import axiosClient from '../axiosClient';

export interface HRMSQueryParams {
    code?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    status?: string;
    pageSize: number;
    pageIndex: number;
}

export const employee = {
    getEmployees: async (params: HRMSQueryParams): Promise<any> => {
        // 🧠 ปรับโครงสร้างข้อมูลส่งออกให้ตรงสเปค C# .NET Controller
        const backendPayload = {
            pageNumber: params.pageIndex + 1, // แปลง 0-based เป็น 1-based ของ C#
            pageSize: params.pageSize,
            department: params.department || undefined,  // แมปเข้า public string? Department
        };

        return await axiosClient.get('api/Employees', { params: backendPayload });
    },
};