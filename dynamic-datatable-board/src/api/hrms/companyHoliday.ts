import axiosClient from '../axiosClient';
import { CompanyHolidayFormDto, CompanyHolidayRequest, CompanyHolidayResponse } from '../../dto/hrms/companyHoliday';
import { ApiResponse } from '../../dto/ums/auth';
import { PaginatedDto } from '../../dto/common/paginated-dto';

export const companyHoliday = {
    getCompanyHolidays: async (params: CompanyHolidayRequest): Promise<ApiResponse<PaginatedDto<CompanyHolidayResponse>>> => {
        const backendPayload = {
            pageNumber: params.pageIndex + 1,
            pageSize: params.pageSize,
            sortBy: params.sortBy,
            sortDirection: params.sortDirection,
            year: params.year,
            name: params.name,
        };
        const response = await axiosClient.get<ApiResponse<PaginatedDto<CompanyHolidayResponse>>>('api/CompanyHolidays', { params: backendPayload });
        return response.data;
    },
    getByYear: async (year: number): Promise<ApiResponse<CompanyHolidayResponse[]>> => {
        const response = await axiosClient.get<ApiResponse<CompanyHolidayResponse[]>>(`api/CompanyHolidays/year/${year}`);
        return response.data;
    },
    getById: async (id: number): Promise<ApiResponse<CompanyHolidayFormDto>> => {
        const response = await axiosClient.get<ApiResponse<CompanyHolidayFormDto>>(`api/CompanyHolidays/${id}`);
        return response.data;
    },
    create: async (data: CompanyHolidayFormDto): Promise<ApiResponse<CompanyHolidayFormDto>> => {
        const response = await axiosClient.post<ApiResponse<CompanyHolidayFormDto>>('api/CompanyHolidays', data);
        return response.data;
    },
    update: async (id: number, data: CompanyHolidayFormDto): Promise<ApiResponse<CompanyHolidayResponse>> => {
        const response = await axiosClient.put<ApiResponse<CompanyHolidayResponse>>(`api/CompanyHolidays/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<ApiResponse<boolean>> => {
        const response = await axiosClient.delete<ApiResponse<boolean>>(`api/CompanyHolidays/${id}`);
        return response.data;
    },
};
