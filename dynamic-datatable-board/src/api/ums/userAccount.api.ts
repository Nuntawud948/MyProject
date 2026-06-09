import axiosClient from '../axiosClient';
import { RegisterUserAccountRequest, UpdateUserAccountRequest } from '../../dto/ums/userAccount';

export const userAccountApi = {
    getUsers: async (params: any): Promise<any> => {
        const backendPayload = {
            pageNumber: params.pageIndex + 1, // Convert 0-based index to 1-based page number
            pageSize: params.pageSize,
            sortBy: params.sortBy || undefined,
            sortDirection: params.sortDirection || undefined,
            search: params.search || undefined,
            ...params.filters
        };
        const response = await axiosClient.get('api/Auth/users', { params: backendPayload });
        return response.data;
    },
    registerUser: async (data: RegisterUserAccountRequest): Promise<any> => {
        const response = await axiosClient.post('api/Auth/register', data);
        return response.data;
    },
    updateUser: async (id: number | string, data: UpdateUserAccountRequest): Promise<any> => {
        const response = await axiosClient.put(`api/Auth/users/${id}`, data);
        return response.data;
    },
    resetPassword: async (username: string, newPassword: string): Promise<any> => {
        const response = await axiosClient.post(`api/Auth/reset-password`, null, {
            params: { username, newPassword }
        });
        return response.data;
    }
};
