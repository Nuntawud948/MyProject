/**
 * @file useAttendance.ts
 * @description Presentation hook — image optimisation engine + attendance actions.
 *
 * Image pipeline (Task 2 spec):
 *   1. Compress to 60% quality via expo-image-manipulator
 *   2. Bound to maximum width of 1024px
 *   3. Ship as multipart/form-data via attendance.api.ts
 */

import { useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { submitClockIn, submitClockOut, getTodayAttendance } from '../../data/apis/attendance.api';
import type { ClockInRequest, MobileImageFile } from '../../data/dtos/attendance/clock-in.request';
import type { ClockOutRequest } from '../../data/dtos/attendance/clock-out.request';
import type { AttendanceStatusResponse } from '../../data/dtos/attendance/attendance-status.response';
import { validateClockIn } from '../../domain/validators/attendance.validator';

// ── Constants ──────────────────────────────────────────────────────────────
const IMAGE_COMPRESS_QUALITY = 0.6;   // 60% quality (spec)
const IMAGE_MAX_WIDTH = 1024;          // px (spec)

interface AttendanceState {
  todayRecord: AttendanceStatusResponse | null;
  isClockedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

// ── Image Optimisation Engine ───────────────────────────────────────────────

/**
 * Compresses and resizes a camera URI before upload.
 * Output: a MobileImageFile ready to append to FormData.
 *
 * @param sourceUri  Raw URI from expo-camera / expo-image-picker
 * @param filename   Desired filename (no extension; .jpg appended automatically)
 */
export async function optimiseImage(
  sourceUri: string,
  filename: string,
): Promise<MobileImageFile> {
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: IMAGE_MAX_WIDTH } }],     // cap at 1024px wide
    {
      compress: IMAGE_COMPRESS_QUALITY,             // 60% JPEG quality
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return {
    uri: result.uri,
    name: `${filename}.jpg`,
    type: 'image/jpeg',
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAttendance(employeeId: string) {
  const [state, setState] = useState<AttendanceState>({
    todayRecord: null,
    isClockedIn: false,
    isLoading: false,
    error: null,
  });

  /** Load today's attendance status from the server. */
  const loadTodayStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const record = await getTodayAttendance(employeeId);
      setState(prev => ({
        ...prev,
        todayRecord: record,
        isClockedIn: !!record && record.clockOutTime === null,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err?.response?.data?.message ?? 'Failed to load attendance.',
        isLoading: false,
      }));
    }
  }, [employeeId]);

  /**
   * Clock in.
   * @param request  Validated clock-in fields (method, coordinates, reason)
   * @param imageUri Optional raw camera URI — will be optimised before upload
   */
  const clockIn = useCallback(
    async (request: ClockInRequest, imageUri?: string) => {
      // Domain validation first
      const validation = validateClockIn(request);
      if (!validation.valid) {
        setState(prev => ({ ...prev, error: validation.errors.join(' ') }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        let imageFile: MobileImageFile | undefined;

        if (imageUri) {
          // ── Image Optimisation Pipeline ───────────────────────────────────
          const timestamp = Date.now();
          imageFile = await optimiseImage(imageUri, `clock-in-${timestamp}`);
        }

        const record = await submitClockIn(request, imageFile);

        setState(prev => ({
          ...prev,
          todayRecord: record,
          isClockedIn: record.clockOutTime === null,
          isLoading: false,
        }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          error: err?.response?.data?.message ?? 'Clock-in failed.',
          isLoading: false,
        }));
      }
    },
    [],
  );

  /** Clock out — resolves the open record server-side. */
  const clockOut = useCallback(async () => {
    const request: ClockOutRequest = { employeeId };
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const record = await submitClockOut(request);
      setState(prev => ({
        ...prev,
        todayRecord: record,
        isClockedIn: false,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err?.response?.data?.message ?? 'Clock-out failed.',
        isLoading: false,
      }));
    }
  }, [employeeId]);

  return {
    ...state,
    loadTodayStatus,
    clockIn,
    clockOut,
  };
}
