import { EmployeeRequest } from '@/dto/hrms/employee';
import axiosClient from '../axiosClient';



export const employee = {
    getEmployees: async (params: EmployeeRequest): Promise<any> => {
        // 🧠 แมปฟิลด์ทั้งหมดเพื่อส่งไปยัง Backend Controller ตาม DTO EmployeeRequest
        const backendPayload = {
            pageNumber: params.pageIndex + 1, // แปลง 0-based เป็น 1-based ของ C#
            pageSize: params.pageSize,
            sortBy: params.sortBy || undefined,
            sortDirection: params.sortDirection || undefined,
            code: params.code || undefined,
            firstName: params.firstName || undefined,
            lastName: params.lastName || undefined,
            department: params.department || undefined,
            departmentId: params.departmentId ? Number(params.departmentId) : undefined,
            roleId: params.roleId ? Number(params.roleId) : undefined,
            status: params.status || undefined,
            search: params.search || undefined,
        };

        return await axiosClient.get('api/Employees', { params: backendPayload });
    },
    getEmployeeDropdown: async (params?: any): Promise<any> => {
        return await axiosClient.get('api/Employees/dropdown', { params });
    },
    getEmployeeStats: async (): Promise<any> => {
        return await axiosClient.get('api/Employees/stats');
    },
    getEmployeeById: async (id: number | string): Promise<any> => {
        return await axiosClient.get(`api/Employees/${id}`);
    },
    createEmployee: async (data: any): Promise<any> => {
        return await axiosClient.post('api/Employees', data);
    },
    updateEmployee: async (id: number | string, data: any): Promise<any> => {
        return await axiosClient.put(`api/Employees/${id}`, data);
    },
    deleteEmployee: async (id: number | string): Promise<any> => {
        return await axiosClient.delete(`api/Employees/${id}`);
    },
};