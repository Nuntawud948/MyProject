// src/api/hrms/leave.ts

import type {
    LeaveApprovalDto,
    LeaveRequestFormDto,
    LeaveRequestQueryDto,
    LeaveSimulateRequestDto,
} from '@/dto/hrms/leaveRequest';
import type { LeaveTypeFormDto, LeaveTypeQueryDto } from '@/dto/hrms/leaveType';
import axiosClient from '../axiosClient';

export const leave = {
    // ── Leave Types ──────────────────────────────────────────────────────────

    getLeaveTypes: async (params: LeaveTypeQueryDto): Promise<any> => {
        const backendPayload = {
            pageNumber: params.pageIndex + 1, // 0-based → 1-based
            pageSize: params.pageSize,
            search: params.search || undefined,
        };
        return await axiosClient.get('api/Leaves/types', { params: backendPayload });
    },

    getLeaveTypeById: async (id: number): Promise<any> => {
        return await axiosClient.get(`api/Leaves/types/${id}`);
    },

    createLeaveType: async (data: LeaveTypeFormDto): Promise<any> => {
        return await axiosClient.post('api/Leaves/types', data);
    },

    updateLeaveType: async (id: number, data: LeaveTypeFormDto): Promise<any> => {
        return await axiosClient.put(`api/Leaves/types/${id}`, data);
    },

    deleteLeaveType: async (id: number): Promise<any> => {
        return await axiosClient.delete(`api/Leaves/types/${id}`);
    },

    // ── Leave Balances ───────────────────────────────────────────────────────

    getLeaveBalances: async (employeeId: number): Promise<any> => {
        return await axiosClient.get(`api/Leaves/balances/${employeeId}`);
    },

    // ── Simulation ───────────────────────────────────────────────────────────

    simulateLeave: async (data: LeaveSimulateRequestDto): Promise<any> => {
        return await axiosClient.post('api/Leaves/simulate', data);
    },

    // ── Leave Requests ───────────────────────────────────────────────────────

    getLeaveRequests: async (params: LeaveRequestQueryDto): Promise<any> => {
        const backendPayload = {
            pageNumber: params.pageIndex + 1, // 0-based → 1-based
            pageSize: params.pageSize,
            employeeId: params.employeeId || undefined,
            status: params.status || undefined,
            leaveTypeId: params.leaveTypeId || undefined,
            search: params.search || undefined,
        };
        return await axiosClient.get('api/Leaves/requests', { params: backendPayload });
    },

    getLeaveRequestById: async (id: number): Promise<any> => {
        return await axiosClient.get(`api/Leaves/requests/${id}`);
    },

    createLeaveRequest: async (data: LeaveRequestFormDto): Promise<any> => {
        return await axiosClient.post('api/Leaves/requests', data);
    },

    // ── Approvals ────────────────────────────────────────────────────────────

    approveFirstLevel: async (id: number, data: LeaveApprovalDto): Promise<any> => {
        return await axiosClient.put(`api/Leaves/requests/${id}/approve/first`, data);
    },

    approveSecondLevel: async (id: number, data: LeaveApprovalDto): Promise<any> => {
        return await axiosClient.put(`api/Leaves/requests/${id}/approve/second`, data);
    },
};
