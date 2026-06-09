export interface UserAccountResponse {
    id: number;
    username: string;
    email: string;
    roleId: number | null;
    roleName: string | null;
    employeeId: number | null;
    employeeName: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface UpdateUserAccountRequest {
    username: string;
    email: string;
    roleId: number | null;
    employeeId: number | null;
    isActive: boolean;
}

export interface RegisterUserAccountRequest {
    username: string;
    password?: string;
    email: string;
    roleId: number | null;
    employeeId: number | null;
}
