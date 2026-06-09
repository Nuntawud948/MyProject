import axiosClient from '../axiosClient';
import { GeofenceFormDto, GeofenceRequest, GeofenceResponse } from '../../dto/hrms/geofence';
import { ApiResponse } from '../../dto/ums/auth';
import { PaginatedDto } from '../../dto/common/paginated-dto';

const DEFAULT_GEOFENCES: GeofenceResponse[] = [
    {
        id: 1,
        name: "Headquarters Office",
        latitude: 13.7563,
        longitude: 100.5018,
        radiusInMeters: 150,
        description: "Main central office building downtown.",
        isActive: true
    },
    {
        id: 2,
        name: "Suburban Warehouse",
        latitude: 13.6593,
        longitude: 100.4018,
        radiusInMeters: 300,
        description: "Logistics and storage hub.",
        isActive: true
    }
];

const getStoredGeofences = (): GeofenceResponse[] => {
    const data = localStorage.getItem('vertex_geofences');
    if (!data) {
        localStorage.setItem('vertex_geofences', JSON.stringify(DEFAULT_GEOFENCES));
        return DEFAULT_GEOFENCES;
    }
    return JSON.parse(data);
};

const saveStoredGeofences = (items: GeofenceResponse[]) => {
    localStorage.setItem('vertex_geofences', JSON.stringify(items));
};

export const geofenceApi = {
    getGeofences: async (params: GeofenceRequest): Promise<ApiResponse<PaginatedDto<GeofenceResponse>>> => {
        try {
            const backendPayload = {
                pageNumber: params.pageIndex + 1,
                pageSize: params.pageSize,
                sortBy: params.sortBy,
                sortDirection: params.sortDirection,
                name: params.name,
            };
            const response = await axiosClient.get<ApiResponse<PaginatedDto<GeofenceResponse>>>('api/Geofences', { params: backendPayload });
            return response.data;
        } catch (error) {
            const items = getStoredGeofences();
            let filtered = items;
            if (params.name) {
                const query = params.name.toLowerCase();
                filtered = items.filter(item => item.name.toLowerCase().includes(query));
            }

            const totalRecords = filtered.length;
            const start = params.pageIndex * params.pageSize;
            const paginatedItems = filtered.slice(start, start + params.pageSize);

            return {
                isSuccess: true,
                message: "Fetched from Local Storage (Mock)",
                data: {
                    items: paginatedItems,
                    totalCount: totalRecords,
                    pageSize: params.pageSize,
                    pageIndex: params.pageIndex
                },
                errors: null
            };
        }
    },

    getById: async (id: number): Promise<ApiResponse<GeofenceResponse>> => {
        try {
            const response = await axiosClient.get<ApiResponse<GeofenceResponse>>(`api/Geofences/${id}`);
            return response.data;
        } catch (error) {
            const items = getStoredGeofences();
            const found = items.find(item => item.id === id);
            if (!found) {
                throw new Error("Geofence not found");
            }
            return {
                isSuccess: true,
                message: "Fetched from Local Storage",
                data: found,
                errors: null
            };
        }
    },

    create: async (data: GeofenceFormDto): Promise<ApiResponse<GeofenceResponse>> => {
        try {
            const response = await axiosClient.post<ApiResponse<GeofenceResponse>>('api/Geofences', data);
            return response.data;
        } catch (error) {
            const items = getStoredGeofences();
            const newGeofence: GeofenceResponse = {
                id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
                ...data
            };
            items.push(newGeofence);
            saveStoredGeofences(items);
            return {
                isSuccess: true,
                message: "Created in Local Storage",
                data: newGeofence,
                errors: null
            };
        }
    },

    update: async (id: number, data: GeofenceFormDto): Promise<ApiResponse<GeofenceResponse>> => {
        try {
            const response = await axiosClient.put<ApiResponse<GeofenceResponse>>(`api/Geofences/${id}`, data);
            return response.data;
        } catch (error) {
            const items = getStoredGeofences();
            const idx = items.findIndex(item => item.id === id);
            if (idx === -1) {
                throw new Error("Geofence not found");
            }
            const updated: GeofenceResponse = {
                ...items[idx],
                ...data
            };
            items[idx] = updated;
            saveStoredGeofences(items);
            return {
                isSuccess: true,
                message: "Updated in Local Storage",
                data: updated,
                errors: null
            };
        }
    },

    delete: async (id: number): Promise<ApiResponse<boolean>> => {
        try {
            const response = await axiosClient.delete<ApiResponse<boolean>>(`api/Geofences/${id}`);
            return response.data;
        } catch (error) {
            const items = getStoredGeofences();
            const filtered = items.filter(item => item.id !== id);
            saveStoredGeofences(filtered);
            return {
                isSuccess: true,
                message: "Deleted from Local Storage",
                data: true,
                errors: null
            };
        }
    }
};
