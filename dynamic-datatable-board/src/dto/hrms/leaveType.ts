// src/dto/hrms/leaveType.ts

export interface LeaveTypeDto {
  id: number;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  isActive: boolean;
}

/** Query params for paginated leave types list */
export interface LeaveTypeQueryDto {
  pageIndex: number;
  pageSize: number;
  search?: string;
}

/** Payload for creating / updating a leave type */
export interface LeaveTypeFormDto {
  name: string;
  description?: string;
  maxDaysPerYear: number;
}
