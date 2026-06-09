/**
 * @file geofence.response.ts
 * @description Response schema for Geofences.
 * Mirrors the backend GeofenceResponse DTO.
 */

export interface GeofenceResponse {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusInMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface GeofencePaginationResponse {
  items: GeofenceResponse[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponseWrapper<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}
