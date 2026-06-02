// src/dto/hrms/leaveRequest.ts

/** Full read model returned from API */
export interface LeaveRequestDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;       // ISO 8601 date string
  endDate: string;
  totalHours: number;
  reason: string;
  status: string;          // "Pending" | "Approved" | "Rejected"

  firstApproverId?: number;
  firstApproverName?: string;
  firstApprovalStatus: string;
  firstApprovalReason?: string;

  secondApproverId?: number;
  secondApproverName?: string;
  secondApprovalStatus: string;
  secondApprovalReason?: string;

  submittedByEmployeeId: number;
  submittedByEmployeeName?: string;
  onBehalfReason?: string;

  createdAt: string;
}

/** Payload for creating a new leave request */
export interface LeaveRequestFormDto {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  /** ID of the logged-in employee submitting on behalf */
  submittedByEmployeeId: number;
  onBehalfReason?: string;
}

/** Query params for paginated leave requests list */
export interface LeaveRequestQueryDto {
  pageIndex: number;
  pageSize: number;
  employeeId?: number;
  status?: string;
  leaveTypeId?: number;
  search?: string;
}

/** Request body for the simulation endpoint */
export interface LeaveSimulateRequestDto {
  startDate: string;
  endDate: string;
}

/** Response from the simulation endpoint */
export interface LeaveSimulateResponseDto {
  workingDays: number;
  totalHours: number;
  excludedDays: number;
  totalCalendarDays: number;
}

/** Payload for first / second level approval actions */
export interface LeaveApprovalDto {
  status: 'Approved' | 'Rejected';
  remarks?: string;
}
