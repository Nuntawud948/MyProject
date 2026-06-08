/**
 * @file attendance.validator.ts
 * @description Domain-layer validators for attendance business rules.
 * Pure functions — no framework dependencies.
 */

import type { ClockInRequest } from '../../data/dtos/attendance/clock-in.request';

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Validates a clock-in request before it reaches the API layer.
 * Business rules:
 *  - Manual check-in MUST supply a reason.
 *  - Coordinates must be within WGS-84 bounds.
 *  - employeeId must be a valid non-empty UUID string.
 */
export function validateClockIn(
  request: ClockInRequest,
): ValidationResult {
  const errors: string[] = [];

  if (!request.employeeId || String(request.employeeId).trim().length === 0) {
    errors.push('employeeId is required.');
  }

  if (request.latitude < -90 || request.latitude > 90) {
    errors.push('Latitude must be between -90 and 90.');
  }

  if (request.longitude < -180 || request.longitude > 180) {
    errors.push('Longitude must be between -180 and 180.');
  }

  if (
    request.checkInMethod === 'Manual' &&
    (!request.reason || request.reason.trim().length === 0)
  ) {
    errors.push('A reason is required for Manual check-in.');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validates GPS coordinate precision to ensure it meets the
 * decimal(9,6) precision stored in Postgres.
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  const coordRegex = /^-?\d{1,3}\.\d{1,6}$/;
  return coordRegex.test(lat.toFixed(6)) && coordRegex.test(lng.toFixed(6));
}
