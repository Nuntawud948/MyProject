import axiosClient from '../axiosClient';
import { DepartmentRequest } from '../../dto/hrms/department';

export const department = {
    getActiveDepartments: async (params?: DepartmentRequest): Promise<any> => {
        return await axiosClient.get('api/Departments/dropdown', { params });
    },
};
