export interface CompanyHolidayResponse {
    id: number;
    name: string;
    holidayDate: string;
    description?: string;
    year: number;
    isActive: boolean;
}

export interface CompanyHolidayFormDto {
    name: string;
    holidayDate: string;
    description?: string;
    year: number;
    isActive: boolean;
}

export interface CompanyHolidayRequest {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    year?: number;
    name?: string;
}
