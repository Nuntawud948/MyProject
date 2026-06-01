import axiosClient from '../axiosClient';

export interface HRMSQueryParams {
    searchQuery: string;
    department: string;
    minServiceYears: number | '';
    startDateThreshold: Date | null;
    pageSize: number;
    pageIndex: number;
}

export const hrmsApi = {
    getEmployees: async (params: HRMSQueryParams): Promise<any> => {
        // 🧠 ปรับโครงสร้างข้อมูลส่งออกให้ตรงสเปค C# .NET Controller
        const backendPayload = {
            pageNumber: params.pageIndex + 1, // แปลง 0-based เป็น 1-based ของ C#
            pageSize: params.pageSize,
            searchText: params.searchQuery || undefined, // แมปเข้า public string? SearchText
            department: params.department || undefined,  // แมปเข้า public string? Department
            minServiceYears: params.minServiceYears !== '' ? Number(params.minServiceYears) : undefined // แมปเข้า int? MinServiceYears
        };

        return await axiosClient.get('/Employees', { params: backendPayload });
    },
};