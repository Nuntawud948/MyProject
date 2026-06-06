/**
 * @file attendance-status.response.ts
 * @description Response schema for the current employee's attendance status.
 * Mirrors the backend AttendanceResponse DTO.
 */

export type CheckInMethod = 'Auto' | 'Manual';

export interface AttendanceStatusResponse {
  id: number;
  employeeId: string;

  clockInTime: string;          // ISO 8601 DateTimeOffset
  clockOutTime: string | null;  // null means still clocked in

  latitude: number;
  longitude: number;

  checkInMethod: CheckInMethod;

  /** Only present for Manual check-ins */
  imageUrl: string | null;
  /** Only present for Manual check-ins */
  reason: string | null;

  isApproved: boolean;

  createdAt: string;
  updatedAt: string | null;
}
