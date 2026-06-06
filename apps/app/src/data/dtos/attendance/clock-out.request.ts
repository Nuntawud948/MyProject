/**
 * @file clock-out.request.ts
 * @description Schema-Based DTO for the Attendance Clock-Out endpoint.
 * The server resolves the open (no ClockOutTime) attendance record by employeeId.
 */

export interface ClockOutRequest {
  /** UUID matching the authenticated employee's identifier. */
  employeeId: string;
}
