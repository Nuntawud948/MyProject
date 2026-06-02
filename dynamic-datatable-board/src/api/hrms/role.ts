import axiosClient from '../axiosClient';
import { RoleRequest } from '../../dto/hrms/role';

export const role = {
    getActiveRoles: async (params?: RoleRequest): Promise<any> => {
        return await axiosClient.get('api/Roles/dropdown', { params });
    },
};
