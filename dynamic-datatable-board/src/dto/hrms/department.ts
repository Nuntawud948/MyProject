export interface DepartmentRequest {
    code?: string;
    name?: string;
    search?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
}

export interface DepartmentResponse {
    id: number;
    code: string;
    name: string;
    description?: string;
}
