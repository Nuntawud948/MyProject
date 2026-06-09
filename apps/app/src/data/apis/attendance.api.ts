/**
 * @file attendance.api.ts
 * @description Attendance API — Option B: Multipart/Form-Data strategy.
 *
 * Images are appended as native FormData file entries (NOT base64 JSON).
 * The server-side controller binds them via [FromForm] + IFormFile.
 */

import axios from 'axios';
import type { ClockInRequest, MobileImageFile } from '../dtos/attendance/clock-in.request';
import type { ClockOutRequest } from '../dtos/attendance/clock-out.request';
import type { AttendanceStatusResponse } from '../dtos/attendance/attendance-status.response';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// ── Clock-In ────────────────────────────────────────────────────────────────

/**
 * Submits a clock-in record using multipart/form-data.
 *
 * @param data     Structured clock-in fields (employeeId, coords, method, reason)
 * @param imageFile Optional photo taken on manual check-in (pre-compressed by hook)
 */
export const submitClockIn = async (
  data: ClockInRequest,
  imageFile?: MobileImageFile,
): Promise<AttendanceStatusResponse> => {
  const formData = new FormData();

  formData.append('employeeId', data.employeeId);
  formData.append('latitude', String(data.latitude));
  formData.append('longitude', String(data.longitude));
  formData.append('checkInMethod', data.checkInMethod);
  if (data.reason) formData.append('reason', data.reason);

  if (imageFile) {
    // React Native's FormData accepts this shape for multipart binary upload
    formData.append('imageFile', {
      uri: imageFile.uri,
      name: imageFile.name,
      type: imageFile.type,
    } as any);
  }

  const { data: response } = await axios.post<{ data: AttendanceStatusResponse }>(
    `${BASE_URL}/api/attendances/clock-in`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return response.data;
};

// ── Clock-Out ───────────────────────────────────────────────────────────────

/**
 * Submits a clock-out. The server resolves the open attendance record by employeeId.
 */
export const submitClockOut = async (
  data: ClockOutRequest,
): Promise<AttendanceStatusResponse> => {
  const { data: response } = await axios.post<{ data: AttendanceStatusResponse }>(
    `${BASE_URL}/api/attendances/clock-out`,
    data,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

// ── Status ───────────────────────────────────────────────────────────────────

/**
 * Fetches today's attendance record for the given employee.
 * Returns null if the employee has not clocked in today.
 */
export const getTodayAttendance = async (
  employeeId: string,
): Promise<AttendanceStatusResponse | null> => {
  const { data: response } = await axios.get<{ data: AttendanceStatusResponse | null }>(
    `${BASE_URL}/api/attendances/today/${employeeId}`,
  );
  return response.data;
};

// ── Geofences ────────────────────────────────────────────────────────────────

import type { ApiResponseWrapper, GeofencePaginationResponse } from '../dtos/attendance/geofence.response';

/**
 * Fetches all active geofences from the server.
 */
export const getActiveGeofences = async (): Promise<GeofencePaginationResponse> => {
  const { data: response } = await axios.get<ApiResponseWrapper<GeofencePaginationResponse>>(
    `${BASE_URL}/api/Geofences`,
    { params: { pageSize: 100 } }
  );
  return response.data;
};

