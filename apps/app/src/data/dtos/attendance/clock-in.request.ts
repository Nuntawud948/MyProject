/**
 * @file clock-in.request.ts
 * @description Schema-Based DTO for the Attendance Clock-In endpoint.
 * Strategy: Option B — Multipart/Form-Data.
 * The image is shipped as a native FormData entry (not base64 JSON).
 */

export interface ClockInRequest {
  employeeId: string;
  latitude: number;
  longitude: number;
  checkInMethod: 'Auto' | 'Manual';
  /** Required when checkInMethod === 'Manual' */
  reason?: string;
}

/**
 * Construction helper contract that maps to the native FormData image entry.
 * Consumed by React Native's FormData append (the `as any` cast is intentional
 * — RN's FormData accepts this shape for multipart file upload).
 */
export interface MobileImageFile {
  /** File URI from expo-image-picker / expo-camera. */
  uri: string;
  /** Filename sent to the server (e.g. "clock-in-1717600000.jpg"). */
  name: string;
  /** MIME type (e.g. "image/jpeg"). */
  type: string;
}
