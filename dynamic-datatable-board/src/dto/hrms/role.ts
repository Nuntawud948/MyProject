export interface RoleRequest {
    code?: string;
    name?: string;
    search?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
}

export interface RoleResponse {
    id: number;
    code: string;
    name: string;
    description?: string;
}
