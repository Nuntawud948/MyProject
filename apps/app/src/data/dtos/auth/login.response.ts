/**
 * @file login.response.ts
 * @description Auth login response DTO — mirrors backend TokenResponse.
 */
export interface LoginResponse {
  /** JWT bearer token for subsequent API calls. */
  token: string;
  /** Token expiry in seconds from issuance. */
  expiresIn: number;
  /** The authenticated employee's Guid identifier (used as attendance employeeId). */
  employeeId: string;
  username: string;
  role: string;
}
