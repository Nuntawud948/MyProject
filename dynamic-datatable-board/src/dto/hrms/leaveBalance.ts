// src/dto/hrms/leaveBalance.ts

export interface LeaveBalanceDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  allocatedHours: number;
  usedHours: number;
  remainingHours: number;
}
