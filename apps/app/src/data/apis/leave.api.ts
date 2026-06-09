import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface LeaveRequestResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string; // e.g. "Pending", "Approved", "Rejected"
  firstApproverId: number | null;
  firstApproverName: string | null;
  firstApprovalStatus: string;
  firstApprovalReason: string | null;
  secondApproverId: number | null;
  secondApproverName: string | null;
  secondApprovalStatus: string;
  secondApprovalReason: string | null;
  createdAt: string;
}

export async function getLeaveRequests(employeeId?: number, approverId?: number): Promise<LeaveRequestResponse[]> {
  const response = await axios.get(`${BASE_URL}/api/Leaves/requests`, {
    params: {
      employeeId: employeeId,
      approverId: approverId,
      pageSize: 100 // fetch all recent requests
    }
  });
  const data = response.data?.data?.items || response.data?.items || response.data;
  return Array.isArray(data) ? data : [];
}

export async function getLeaveRequestById(id: number): Promise<LeaveRequestResponse> {
  const response = await axios.get(`${BASE_URL}/api/Leaves/requests/${id}`);
  const data = response.data?.data || response.data;
  return data;
}

export async function approveFirstLevel(id: number, status: 'Approved' | 'Rejected', remarks: string): Promise<any> {
  const response = await axios.put(`${BASE_URL}/api/Leaves/requests/${id}/approve/first`, {
    status,
    remarks,
  });
  return response.data;
}

export async function approveSecondLevel(id: number, status: 'Approved' | 'Rejected', remarks: string): Promise<any> {
  const response = await axios.put(`${BASE_URL}/api/Leaves/requests/${id}/approve/second`, {
    status,
    remarks,
  });
  return response.data;
}
