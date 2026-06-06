/**
 * @file auth.api.ts
 * @description Auth API — wraps login/logout endpoints.
 */

import axios from 'axios';
import type { LoginRequest } from '../dtos/auth/login.request';
import type { LoginResponse } from '../dtos/auth/login.response';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

/** POST /api/auth/login */
export const loginUser = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const { data } = await axios.post<{ data: LoginResponse }>(
    `${BASE_URL}/api/auth/login`,
    credentials,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data.data;
};
