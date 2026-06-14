/**
 * @file clock-out.request.ts
 * @description Schema-Based DTO for the Attendance Clock-Out endpoint.
 * The server resolves the open (no ClockOutTime) attendance record by employeeId.
 */

import type { MobileImageFile } from './clock-in.request';

export interface ClockOutRequest {
  /** UUID matching the authenticated employee's identifier. */
  employeeId: string;
  /** Compressed photo from the front camera, required for identity verification. */
  imageFile?: MobileImageFile;
}
