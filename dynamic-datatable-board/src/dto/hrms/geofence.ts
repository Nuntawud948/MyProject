export interface GeofenceResponse {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radiusInMeters: number; // in meters
    description?: string;
    isActive: boolean;
}

export interface GeofenceFormDto {
    name: string;
    latitude: number;
    longitude: number;
    radiusInMeters: number;
    description?: string;
    isActive: boolean;
}

export interface GeofenceRequest {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    name?: string;
}
