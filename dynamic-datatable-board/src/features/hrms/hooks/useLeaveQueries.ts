import { useQuery } from '@tanstack/react-query';
import { leave } from '@/api/hrms/leave';
import type { LeaveRequestQueryDto } from '@/dto/hrms/leaveRequest';
import type { LeaveTypeQueryDto } from '@/dto/hrms/leaveType';

/**
 * Custom hook to fetch leave requests using React Query.
 * Handles background caching, refetching, and pagination.
 */
export function useGetLeaveRequests(params: LeaveRequestQueryDto) {
  return useQuery({
    queryKey: ['leaveRequests', params],
    queryFn: async () => {
      const response = await leave.getLeaveRequests(params);
      // Ensure we always return the normalized data structure
      return response.data?.data || response.data;
    },
  });
}

/**
 * Custom hook to fetch leave types using React Query.
 * Handles background caching, refetching, and pagination.
 */
export function useGetLeaveTypes(params: LeaveTypeQueryDto) {
  return useQuery({
    queryKey: ['leaveTypes', params],
    queryFn: async () => {
      const response = await leave.getLeaveTypes(params);
      // Ensure we always return the normalized data structure
      return response.data?.data || response.data;
    },
  });
}
